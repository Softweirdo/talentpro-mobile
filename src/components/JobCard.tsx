import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { CompanyTag, Mono, Text } from './index';
import { Icon } from './Icon';
import { colors, fonts, radius, shadow, spacing } from '../theme/index';
import { useLocalizedStyle } from '../theme/text';
import type { Job } from '../api/types';
import { EXPERIENCE_LABEL } from '../lib/format';
import { useRelativeTime } from '../lib/relativeTime';

export function JobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  const { t } = useTranslation();
  const localize = useLocalizedStyle();
  const ago = useRelativeTime();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${job.title}, ${job.company}, ${job.location}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {job.isNew && !job.hasApplied ? (
        <View style={styles.newBadge}>
          <RNText style={styles.newBadgeText}>{t('feed.new')}</RNText>
        </View>
      ) : null}
      {job.hasApplied ? (
        <View style={[styles.newBadge, styles.appliedBadge]}>
          <RNText style={[styles.newBadgeText, { color: '#178746' }]}>{t('feed.applied')}</RNText>
        </View>
      ) : null}

      <CompanyTag>{job.company}</CompanyTag>

      <Text variant="h2" style={styles.title} numberOfLines={2}>
        {job.title}
      </Text>

      <View style={styles.meta}>
        <View style={styles.metaCell}>
          <Icon name="pin" size={13} color={colors.textMute} />
          <RNText style={localize(styles.metaItem)}>{job.location}</RNText>
        </View>
        <View style={styles.metaCell}>
          <Icon name="clock" size={13} color={colors.textMute} />
          <RNText style={localize(styles.metaItem)}>{EXPERIENCE_LABEL[job.experienceBand]}</RNText>
        </View>
        <View style={styles.metaCell}>
          <Icon name="bolt" size={13} color={colors.textMute} />
          <RNText style={localize(styles.metaItem)}>
            {t(`urgency.${job.joiningUrgency}`)}
          </RNText>
        </View>
      </View>

      <View style={styles.bottom}>
        {/* Salary stays monospace in both languages — it is the number people
            scan for first, and it must stay legible in Gujarati. */}
        <View style={styles.salary}>
          <RNText style={styles.rupee}>₹</RNText>
          <Mono bold style={styles.salaryText}>
            {job.salaryMin.toLocaleString('en-IN')} – {job.salaryMax.toLocaleString('en-IN')}
          </Mono>
          <RNText style={localize(styles.perMonth)}>{t('common.perMonth')}</RNText>
        </View>
        {job.postedAt ? <RNText style={localize(styles.posted)}>{ago(job.postedAt)}</RNText> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  pressed: { borderColor: colors.sky, transform: [{ scale: 0.99 }] },

  newBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.sky,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    zIndex: 1,
  },
  appliedBadge: { backgroundColor: '#E0F5EB' },
  newBadgeText: {
    fontFamily: fonts.extrabold,
    fontSize: 9,
    letterSpacing: 1.4,
    color: colors.white,
  },

  title: { marginTop: 10, marginBottom: 4 },

  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metaCell: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaItem: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMute },

  bottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderStyle: 'dashed',
    gap: spacing.sm,
  },
  salary: { flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 1 },
  rupee: { fontFamily: fonts.monoBold, fontSize: 13, color: colors.skyDeep },
  salaryText: { fontSize: 13, color: colors.navy },
  perMonth: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMute },
  posted: { fontFamily: fonts.medium, fontSize: 11, color: colors.textMute },
});
