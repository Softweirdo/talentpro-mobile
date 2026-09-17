import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Button,
  CompanyTag,
  EmptyState,
  ErrorState,
  Loading,
  Mono,
  StatusBadge,
  Text,
} from '../components/index';
import { useReferralStats, useReferrals } from '../api/hooks';
import { inr, pad2 } from '../lib/format';
import { useRelativeTime } from '../lib/relativeTime';
import { colors, radius, shadow, spacing } from '../theme/index';
import type { AppStackParams } from '../navigation/types';
import type { Referral } from '../api/types';

export function ReferralsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const query = useReferrals();
  const stats = useReferralStats();

  const items = query.data?.pages.flatMap((p) => p.data) ?? [];

  if (query.isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Loading />
      </SafeAreaView>
    );
  }
  if (query.isError && items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState onRetry={() => void query.refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <ReferralCard referral={item} />}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            onRefresh={() => {
              void query.refetch();
              void stats.refetch();
            }}
            tintColor={colors.skyDeep}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        ListHeaderComponent={
          <>
            <Text variant="bodyMute">{t('referrals.eyebrow')}</Text>
            <Text variant="h1" style={{ marginBottom: spacing.lg }}>
              {t('referrals.title')}
            </Text>

            <View style={styles.stats}>
              <View style={styles.statCard}>
                <Text variant="micro">{t('referrals.total')}</Text>
                <Mono bold style={styles.statValue}>
                  {pad2(stats.data?.totalReferrals ?? 0)}
                </Mono>
              </View>
              <View style={[styles.statCard, styles.statAccent]}>
                <Text variant="micro" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {t('referrals.earned')}
                </Text>
                <Mono bold style={[styles.statValue, { color: colors.white }]}>
                  {inr(stats.data?.moneyEarned ?? 0)}
                </Mono>
              </View>
            </View>

            <Button
              title={t('referrals.referNew')}
              onPress={() => navigation.navigate('ShareReferral', {})}
              style={{ marginBottom: spacing.lg }}
            />

            {items.length > 0 ? (
              <Text variant="micro" style={{ marginBottom: spacing.md }}>
                {t('referrals.recent')}
              </Text>
            ) : null}
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title={t('referrals.empty')}
            hint={t('referrals.emptyHint')}
            action={
              <Button
                title={t('referrals.referNew')}
                variant="sky"
                onPress={() => navigation.navigate('ShareReferral', {})}
              />
            }
          />
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator style={{ marginVertical: spacing.xl }} color={colors.skyDeep} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function ReferralCard({ referral }: { referral: Referral }) {
  const { t } = useTranslation();
  const ago = useRelativeTime();
  const tenure = referral.tenure;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1, gap: 6 }}>
          {referral.job ? <CompanyTag>{referral.job.company}</CompanyTag> : null}
          <Text variant="h3">{referral.friendName}</Text>
          {referral.friend?.currentOrganization ? (
            <Text variant="small" style={{ color: colors.skyDeep }}>
              ◆ {t('referrals.nowAt', { company: referral.friend.currentOrganization })}
            </Text>
          ) : null}
          <Text variant="small">
            {t('referrals.sharedAgo', { ago: ago(referral.sharedAt) })}
          </Text>
        </View>
        <StatusBadge status={referral.statusBadge} label={referral.statusLabel} />
      </View>

      {tenure ? (
        <>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min((tenure.day / tenure.totalDays) * 100, 100)}%`,
                  backgroundColor: tenure.isComplete ? colors.success : colors.sky,
                },
              ]}
            />
          </View>
          <View style={styles.timeline}>
            <Cell label={t('referrals.hiredOn')} value={referral.hiredDate ?? '—'} />
            <Cell
              label={t('referrals.tenure')}
              value={
                tenure.isComplete
                  ? t('referrals.tenureDone')
                  : t('referrals.day', { day: tenure.day, total: tenure.totalDays })
              }
            />
            <Cell label={t('referrals.reward')} value={inr(referral.rewardAmount)} />
          </View>
        </>
      ) : null}
    </View>
  );
}

const Cell = ({ label, value }: { label: string; value: string }) => (
  <View style={{ flex: 1, paddingRight: spacing.sm }}>
    <Text variant="micro">{label}</Text>
    <Mono bold style={{ fontSize: 12, marginTop: 3 }}>
      {value}
    </Mono>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },

  stats: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  statAccent: { backgroundColor: colors.skyDeep, borderColor: colors.skyDeep },
  statValue: { fontSize: 26, marginTop: 6, color: colors.navy },

  card: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  cardTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },

  progressTrack: {
    height: 6,
    backgroundColor: colors.paperCool,
    borderRadius: 3,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },

  timeline: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderStyle: 'dashed',
  },
});
