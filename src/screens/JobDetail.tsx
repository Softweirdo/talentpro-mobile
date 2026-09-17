import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text as RNText, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Button,
  CompanyTag,
  ErrorState,
  InfoNote,
  Loading,
  Mono,
  Text,
} from '../components/index';
import { Icon } from '../components/Icon';
import { useJob } from '../api/hooks';
import { EXPERIENCE_LABEL } from '../lib/format';
import { useRelativeTime } from '../lib/relativeTime';
import { colors, fonts, radius, spacing } from '../theme/index';
import { useLocalizedStyle } from '../theme/text';
import type { AppStackParams } from '../navigation/types';

type Props = NativeStackScreenProps<AppStackParams, 'JobDetail'>;

export function JobDetailScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const localize = useLocalizedStyle();
  const ago = useRelativeTime();
  const { data: job, isLoading, isError, refetch } = useJob(route.params.jobId);

  if (isLoading) return <Loading />;
  if (isError || !job) return <ErrorState onRetry={() => void refetch()} />;

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Navy gradient header, as in the prototype. */}
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.headerInner}>
            <CompanyTag>{job.company}</CompanyTag>
            <Text variant="h1" style={styles.title}>
              {job.title}
            </Text>
            <View style={styles.headerMeta}>
              <View style={styles.headerMetaCell}>
                <Icon name="pin" size={13} color="rgba(255,255,255,0.75)" />
                <RNText style={localize(styles.headerMetaText)}>{job.location}</RNText>
              </View>
              {job.postedAt ? (
                <View style={styles.headerMetaCell}>
                  <Icon name="clock" size={13} color="rgba(255,255,255,0.75)" />
                  <RNText style={localize(styles.headerMetaText)}>{ago(job.postedAt)}</RNText>
                </View>
              ) : null}
              <View style={styles.headerMetaCell}>
                <Icon name="user" size={13} color="rgba(255,255,255,0.75)" />
                <RNText style={localize(styles.headerMetaText)}>
                  {t('detail.appliedCount', { count: job.appliedCount })}
                </RNText>
              </View>
            </View>
          </View>
        </SafeAreaView>

        <View style={styles.body}>
          <View style={styles.stats}>
            <Stat label={t('common.experience')} value={EXPERIENCE_LABEL[job.experienceBand]} />
            <Stat label={t('detail.joining')} value={t(`urgency.${job.joiningUrgency}`).replace('⚡ ', '')} />
            <Stat
              label={t('detail.salaryPerMonth')}
              value={`₹${Math.round(job.salaryMin / 1000)}–${Math.round(job.salaryMax / 1000)}K`}
              mono
            />
          </View>

          {job.description ? (
            <View style={styles.section}>
              <Text variant="h3" style={styles.sectionTitle}>
                {t('detail.description')}
              </Text>
              <Text variant="body" style={styles.paragraph}>
                {job.description}
              </Text>
            </View>
          ) : null}

          {job.requirements.length > 0 ? (
            <View style={styles.section}>
              <Text variant="h3" style={styles.sectionTitle}>
                {t('detail.requirements')}
              </Text>
              {job.requirements.map((req, i) => (
                <View key={i} style={styles.bullet}>
                  <RNText style={styles.bulletDot}>•</RNText>
                  <Text variant="body" style={styles.bulletText}>
                    {req}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>
              {t('detail.referAndEarn')}
            </Text>
            <InfoNote>
              <Text variant="body" style={{ lineHeight: 21 }}>
                {t('detail.rewardNote', {
                  months: job.tenureMonths,
                  amount: job.referralReward.toLocaleString('en-IN'),
                })}
              </Text>
            </InfoNote>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.cta}>
        <View style={styles.ctaRow}>
          <Button
            title={t('detail.share')}
            variant="secondary"
            onPress={() => navigation.navigate('ShareReferral', { jobId: job.id })}
            style={styles.ctaShare}
          />
          <Button
            title={job.hasApplied ? t('detail.alreadyApplied') : t('detail.applyNow')}
            variant="sky"
            disabled={job.hasApplied}
            onPress={() => navigation.navigate('ApplyConfirm', { jobId: job.id })}
            style={styles.ctaApply}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const localize = useLocalizedStyle();
  return (
    <View style={styles.stat}>
      <RNText style={localize({ ...styles.statLabel })}>{label}</RNText>
      {mono ? (
        <Mono bold style={styles.statValue}>
          {value}
        </Mono>
      ) : (
        <RNText style={localize(styles.statValue)}>{value}</RNText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.paper },
  content: { paddingBottom: spacing.xxl },

  header: { backgroundColor: colors.navy },
  headerInner: { padding: spacing.xl, paddingTop: spacing.md },
  title: { color: colors.white, marginTop: spacing.md, fontSize: 24, lineHeight: 30 },
  headerMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  headerMetaCell: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerMetaText: { fontFamily: fonts.medium, fontSize: 12, color: 'rgba(255,255,255,0.75)' },

  body: { padding: spacing.xl },

  stats: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    marginTop: -spacing.xxl - spacing.sm,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  stat: { flex: 1, padding: spacing.lg, alignItems: 'center' },
  statLabel: {
    fontFamily: fonts.extrabold,
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.textMute,
    textTransform: 'uppercase',
  },
  statValue: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.navy, marginTop: 5 },

  section: { marginBottom: spacing.xl },
  sectionTitle: { marginBottom: spacing.md },
  paragraph: { lineHeight: 22, color: colors.text },

  bullet: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  bulletDot: { color: colors.sky, fontSize: 16, lineHeight: 22 },
  bulletText: { flex: 1, lineHeight: 22 },

  cta: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  ctaRow: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
  ctaShare: { flex: 1 },
  ctaApply: { flex: 2 },
});
