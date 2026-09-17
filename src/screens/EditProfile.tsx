import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, ErrorState, Field, Loading, Screen, Text } from '../components/index';
import { Select } from '../components/Select';
import { useCategories, useMe, useUpdateMe } from '../api/hooks';
import { errorMessage, isOffline } from '../api/client';
import { EXPERIENCE_OPTIONS } from '../lib/format';
import { currentLanguage } from '../i18n/index';
import { colors, spacing } from '../theme/index';
import type { ExperienceBand } from '../api/types';

export function EditProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { data: me, isLoading, isError, refetch } = useMe();
  const categories = useCategories();
  const update = useUpdateMe();
  const lang = currentLanguage();

  const [form, setForm] = useState({
    name: '',
    age: '',
    experienceBand: '' as ExperienceBand | '',
    categoryId: '',
    presentSalary: '',
    expectedSalary: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;
    setForm({
      name: me.name,
      age: me.age ? String(me.age) : '',
      experienceBand: me.experienceBand ?? '',
      categoryId: me.categoryId ?? '',
      presentSalary: me.presentSalary ? String(me.presentSalary) : '',
      expectedSalary: me.expectedSalary ? String(me.expectedSalary) : '',
    });
  }, [me]);

  if (isLoading) return <Loading />;
  if (isError || !me) return <ErrorState onRetry={() => void refetch()} />;

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError(null);
  };

  const submit = async () => {
    try {
      await update.mutateAsync({
        name: form.name.trim(),
        age: form.age ? Number(form.age) : undefined,
        experienceBand: form.experienceBand || undefined,
        categoryId: form.categoryId || undefined,
        presentSalary: form.presentSalary ? Number(form.presentSalary) : null,
        expectedSalary: form.expectedSalary ? Number(form.expectedSalary) : null,
      });
      navigation.goBack();
    } catch (err) {
      setError(isOffline(err) ? t('common.offline') : errorMessage(err, t('common.genericError')));
    }
  };

  const categoryOptions = (categories.data ?? []).map((c) => ({
    value: c.id,
    label: lang === 'gu' && c.nameGu ? c.nameGu : c.name,
  }));

  return (
    <Screen>
      <Text variant="h1" style={{ marginBottom: spacing.lg }}>
        {t('profile.editProfile')}
      </Text>

      {error ? (
        <Text variant="small" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <Field label={t('register.name')} value={form.name} onChangeText={(v) => set('name', v)} />
      <Field
        label={t('register.age')}
        value={form.age}
        onChangeText={(v) => set('age', v.replace(/\D/g, '').slice(0, 2))}
        keyboardType="number-pad"
        mono
      />
      <Select
        label={t('register.experience')}
        value={form.experienceBand}
        options={EXPERIENCE_OPTIONS}
        onChange={(v) => set('experienceBand', v)}
      />
      <Select
        label={t('register.category')}
        value={form.categoryId}
        options={categoryOptions}
        onChange={(v) => set('categoryId', v)}
      />
      <Field
        label={t('register.presentSalary')}
        value={form.presentSalary}
        onChangeText={(v) => set('presentSalary', v.replace(/\D/g, ''))}
        keyboardType="number-pad"
        mono
      />
      <Field
        label={t('register.expectedSalary')}
        value={form.expectedSalary}
        onChangeText={(v) => set('expectedSalary', v.replace(/\D/g, ''))}
        keyboardType="number-pad"
        mono
      />

      <Button title={t('common.save')} variant="sky" onPress={submit} loading={update.isPending} />
      <Button
        title={t('common.cancel')}
        variant="secondary"
        onPress={() => navigation.goBack()}
        style={{ marginTop: spacing.md }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, marginBottom: spacing.md },
});
