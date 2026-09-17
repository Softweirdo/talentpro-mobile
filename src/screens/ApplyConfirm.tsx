import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Button,
  Card,
  ErrorState,
  Loading,
  Row,
  Screen,
  Text,
} from '../components/index';
import { useApply, useJob, useMe } from '../api/hooks';
import { errorMessage, isOffline } from '../api/client';
import { EXPERIENCE_LABEL, formatMobile } from '../lib/format';
import { colors, radius, spacing } from '../theme/index';
import type { AppStackParams } from '../navigation/types';

type Props = NativeStackScreenProps<AppStackParams, 'ApplyConfirm'>;

export function ApplyConfirmScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const job = useJob(route.params.jobId);
  const me = useMe();
  const apply = useApply();
  const [error, setError] = useState<string | null>(null);

  if (job.isLoading || me.isLoading) return <Loading />;
  if (job.isError || !job.data) return <ErrorState onRetry={() => void job.refetch()} />;

  const submit = async () => {
    setError(null);
    try {
      await apply.mutateAsync(job.data.id);
      // Straight to the tracking screen, so the outcome is visible rather than
      // just announced — the applications tab is where this now lives.
      navigation.reset({
        index: 0,
        routes: [{ name: 'Tabs', params: { screen: 'Applications' } }],
      });
    } catch (err) {
      setError(isOffline(err) ? t('common.offline') : errorMessage(err, t('common.genericError')));
    }
  };

  return (
    <Screen>
      <Text variant="h1" style={styles.title}>
        {t('apply.title')}
      </Text>

      <Card style={styles.card}>
        <Text variant="micro">{t('apply.applyingFor')}</Text>

        <View style={styles.jobBox}>
          <Text variant="micro" style={{ color: colors.skyDeep }}>
            {job.data.company}
          </Text>
          <Text variant="h3" style={{ marginTop: 4 }}>
            {job.data.title} — {job.data.location}
          </Text>
          <Text variant="small" style={{ marginTop: 3 }}>
            ₹{job.data.salaryMin.toLocaleString('en-IN')} –{' '}
            {job.data.salaryMax.toLocaleString('en-IN')}
            {t('common.perMonth')}
          </Text>
        </View>

        <Text variant="bodyMute" style={styles.note}>
          {t('apply.profileNote')}
        </Text>

        <Row
          label={t('apply.yourCode')}
          value={me.data?.employeeCode ?? t('profile.pendingCode')}
          mono
        />
        <Row
          label={t('common.experience')}
          value={me.data?.experienceBand ? EXPERIENCE_LABEL[me.data.experienceBand] : '—'}
        />
        <Row label={t('common.mobile')} value={formatMobile(me.data?.mobile ?? '')} mono />
      </Card>

      {error ? (
        <Text variant="small" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <Button
        title={t('apply.confirm')}
        variant="sky"
        onPress={submit}
        loading={apply.isPending}
      />
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
  title: { marginBottom: spacing.lg },
  card: { marginBottom: spacing.xl },
  jobBox: {
    backgroundColor: colors.skySoft,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  note: { marginBottom: spacing.md, lineHeight: 20 },
  error: { color: colors.danger, marginBottom: spacing.md },
});
