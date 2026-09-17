import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Button,
  Card,
  InfoNote,
  ReadonlyPill,
  Screen,
  Text,
} from '../components/index';
import { Select } from '../components/Select';
import { useCategories, useCreateReferral, useJob, useMe } from '../api/hooks';
import { errorCode, errorMessage, isOffline } from '../api/client';
import { digitsOnly, isValidMobile } from '../lib/format';
import { Field } from '../components/index';
import { currentLanguage } from '../i18n/index';
import { colors, spacing } from '../theme/index';
import type { AppStackParams } from '../navigation/types';

type Props = NativeStackScreenProps<AppStackParams, 'ShareReferral'>;

export function ShareReferralScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const lang = currentLanguage();
  const jobId = route.params?.jobId;

  const me = useMe();
  const job = useJob(jobId ?? '');
  const categories = useCategories();
  const createReferral = useCreateReferral();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reward = job.data?.referralReward ?? 2500;
  const tenure = job.data?.tenureMonths ?? 3;

  const submit = async () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = t('share.friendName');
    if (!isValidMobile(mobile)) next.mobile = t('login.invalidMobile');
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setErrors({});
    try {
      await createReferral.mutateAsync({
        friendName: name.trim(),
        friendMobile: digitsOnly(mobile),
        jobId: jobId ?? null,
        categoryId: categoryId || null,
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Tabs', params: { screen: 'Referrals' } }],
      });
    } catch (err) {
      const code = errorCode(err);
      setErrors({
        form:
          code === 'FRIEND_ALREADY_REFERRED'
            ? t('share.duplicate')
            : code === 'SELF_REFERRAL'
              ? t('share.self')
              : isOffline(err)
                ? t('common.offline')
                : errorMessage(err, t('common.genericError')),
      });
    }
  };

  const categoryOptions = (categories.data ?? []).map((c) => ({
    value: c.id,
    label: lang === 'gu' && c.nameGu ? c.nameGu : c.name,
  }));

  return (
    <Screen>
      <Text variant="h1" style={styles.title}>
        {t('share.title')}
      </Text>

      <Card style={styles.card}>
        <Text variant="h3">{t('share.heading')}</Text>
        <Text variant="bodyMute" style={styles.sub}>
          {t('share.subtitle')}
        </Text>

        {errors.form ? (
          <Text variant="small" style={styles.error}>
            {errors.form}
          </Text>
        ) : null}

        <Field
          label={t('share.friendName')}
          value={name}
          onChangeText={(v) => {
            setName(v);
            setErrors({});
          }}
          placeholder="e.g. Suresh Kumar"
          autoCapitalize="words"
          error={errors.name}
        />

        <Field
          label={t('share.friendMobile')}
          value={mobile}
          onChangeText={(v) => {
            setMobile(digitsOnly(v));
            setErrors({});
          }}
          placeholder={t('share.mobilePlaceholder')}
          keyboardType="phone-pad"
          maxLength={10}
          mono
          error={errors.mobile}
        />

        <Text variant="micro">{t('share.yourCode')}</Text>
        {/* Auto-filled from the signed-in profile, exactly as the prototype
            shows. It falls back to the referral code, which every employee has
            from signup — an unassigned employee code must not block sharing. */}
        <ReadonlyPill>
          {me.data?.employeeCode ?? me.data?.referralCode ?? '—'}
        </ReadonlyPill>

        <Select
          label={t('share.friendCategory')}
          value={categoryId}
          options={categoryOptions}
          onChange={setCategoryId}
          placeholder="—"
        />
      </Card>

      <InfoNote>
        <Text variant="body" style={{ lineHeight: 21 }}>
          <Text variant="body" style={styles.bold}>
            {t('share.howItWorks')}{' '}
          </Text>
          {t('share.rewardNote', { amount: reward.toLocaleString('en-IN'), months: tenure })}
        </Text>
      </InfoNote>

      <Button
        title={t('share.submit')}
        variant="sky"
        onPress={submit}
        loading={createReferral.isPending}
        style={{ marginTop: spacing.xl }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: spacing.lg },
  card: { marginBottom: spacing.lg },
  sub: { marginTop: 4, marginBottom: spacing.lg },
  error: { color: colors.danger, marginBottom: spacing.md },
  bold: { fontWeight: '800' },
});
