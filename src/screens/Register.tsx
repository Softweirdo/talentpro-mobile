import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Field, Text } from '../components/index';
import { Select } from '../components/Select';
import { useAuth } from '../store/auth';
import { useCategories } from '../api/hooks';
import { errorMessage, isOffline } from '../api/client';
import { EXPERIENCE_OPTIONS } from '../lib/format';
import { currentLanguage } from '../i18n/index';
import { colors, spacing } from '../theme/index';
import type { ExperienceBand } from '../api/types';

export function RegisterScreen() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const categories = useCategories();
  const lang = currentLanguage();

  const [form, setForm] = useState({
    name: '',
    age: '',
    experienceBand: '' as ExperienceBand | '',
    categoryId: '',
    presentSalary: '',
    expectedSalary: '',
    referralCode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '', form: '' }));
  };

  const submit = async () => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = t('register.name');
    const age = Number(form.age);
    if (!age || age < 16 || age > 75) next.age = '16 – 75';
    if (!form.experienceBand) next.experienceBand = t('register.experience');
    if (!form.categoryId) next.categoryId = t('register.category');
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setBusy(true);
    try {
      await register({
        name: form.name.trim(),
        age,
        experienceBand: form.experienceBand,
        categoryId: form.categoryId,
        presentSalary: form.presentSalary ? Number(form.presentSalary.replace(/\D/g, '')) : null,
        expectedSalary: form.expectedSalary ? Number(form.expectedSalary.replace(/\D/g, '')) : null,
        referralCode: form.referralCode.trim() || null,
        language: lang,
      });
    } catch (err) {
      setErrors({
        form: isOffline(err) ? t('common.offline') : errorMessage(err, t('common.genericError')),
      });
    } finally {
      setBusy(false);
    }
  };

  const categoryOptions = (categories.data ?? []).map((c) => ({
    value: c.id,
    // Category names are data, so the Gujarati label comes from the database
    // rather than the translation file.
    label: lang === 'gu' && c.nameGu ? c.nameGu : c.name,
  }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollWrap}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="display" style={styles.title}>
            {t('register.title')}
          </Text>
          <Text variant="display" style={styles.title}>
            {t('register.titleLine2')}
          </Text>
          <Text variant="bodyMute" style={styles.subtitle}>
            {t('register.subtitle')}
          </Text>

          {errors.form ? (
            <Text variant="small" style={styles.formError}>
              {errors.form}
            </Text>
          ) : null}

          <Field
            label={t('register.name')}
            value={form.name}
            onChangeText={(v) => set('name', v)}
            error={errors.name}
            autoCapitalize="words"
          />

          <Field
            label={t('register.age')}
            value={form.age}
            onChangeText={(v) => set('age', v.replace(/\D/g, '').slice(0, 2))}
            keyboardType="number-pad"
            error={errors.age}
            mono
          />

          <Select
            label={t('register.experience')}
            value={form.experienceBand}
            options={EXPERIENCE_OPTIONS}
            onChange={(v) => set('experienceBand', v)}
            error={errors.experienceBand}
          />

          <Select
            label={t('register.category')}
            value={form.categoryId}
            options={categoryOptions}
            onChange={(v) => set('categoryId', v)}
            error={errors.categoryId}
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

          <Field
            label={t('register.referralCode')}
            value={form.referralCode}
            onChangeText={(v) => set('referralCode', v.toUpperCase())}
            autoCapitalize="characters"
            hint={t('register.referralHint')}
            mono
          />

          <Button title={t('register.submit')} onPress={submit} loading={busy} variant="sky" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  scrollWrap: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },
  title: { fontSize: 30 },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xl },
  formError: { color: colors.danger, marginBottom: spacing.lg },
});
