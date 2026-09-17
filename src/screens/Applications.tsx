import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Chip,
  CompanyTag,
  EmptyState,
  ErrorState,
  Loading,
  Mono,
  StatusBadge,
  Text,
} from '../components/index';
import { useApplications } from '../api/hooks';
import { APPLICATION_BADGE } from '../lib/format';
import { useRelativeTime } from '../lib/relativeTime';
import { colors, radius, shadow, spacing } from '../theme/index';
import type { Application } from '../api/types';

const GROUPS = ['all', 'active', 'closed'] as const;

export function ApplicationsScreen() {
  const { t } = useTranslation();
  const [group, setGroup] = useState<(typeof GROUPS)[number]>('all');
  const query = useApplications(group);

  const items = query.data?.pages.flatMap((p) => p.data) ?? [];
  const counts = query.data?.pages[0]?.meta?.counts as
    | { all: number; active: number; closed: number }
    | undefined;

  const label = (g: (typeof GROUPS)[number]) => {
    const base =
      g === 'all' ? t('common.all') : g === 'active' ? t('applications.active') : t('applications.closed');
    const n = counts?.[g];
    return n === undefined ? base : `${base} · ${n}`;
  };

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
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => <ApplicationCard application={item} />}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching && !query.isFetchingNextPage}
            onRefresh={() => void query.refetch()}
            tintColor={colors.skyDeep}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
        }}
        ListHeaderComponent={
          <>
            <Text variant="bodyMute">{t('applications.eyebrow')}</Text>
            <Text variant="h1" style={{ marginBottom: spacing.lg }}>
              {t('applications.title')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
              {GROUPS.map((g) => (
                <Chip key={g} label={label(g)} active={group === g} onPress={() => setGroup(g)} />
              ))}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          <EmptyState title={t('applications.empty')} hint={t('applications.emptyHint')} />
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

function ApplicationCard({ application }: { application: Application }) {
  const { t } = useTranslation();
  const ago = useRelativeTime();
  const badge = APPLICATION_BADGE[application.status];

  return (
    <View style={[styles.card, application.status === 'rejected' && styles.cardMuted]}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1, gap: 6 }}>
          {application.job ? <CompanyTag>{application.job.company}</CompanyTag> : null}
          <Text variant="h3" numberOfLines={2}>
            {application.job?.title ?? '—'}
          </Text>
          <Text variant="small">
            {t('applications.appliedAgo', { ago: ago(application.appliedAt) })}
          </Text>
        </View>
        <StatusBadge status={badge.tone} label={t(badge.key)} />
      </View>

      {/* The interview strip: the three details the prototype shows, and the
          only ones a candidate actually needs on the day. */}
      {application.status === 'interview' && application.interviewDate ? (
        <View style={styles.timeline}>
          <TimelineCell label={t('applications.interviewDate')} value={application.interviewDate} />
          <TimelineCell
            label={t('common.time')}
            value={
              application.interviewAt
                ? new Date(application.interviewAt).toLocaleTimeString('en-IN', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })
                : '—'
            }
          />
          <TimelineCell label={t('common.location')} value={application.interviewLocation ?? '—'} />
        </View>
      ) : null}

      {application.status === 'hired' && application.hiredDate ? (
        <View style={styles.timeline}>
          <TimelineCell label={t('referrals.hiredOn')} value={application.hiredDate} />
        </View>
      ) : null}
    </View>
  );
}

function TimelineCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.timelineCell}>
      <Text variant="micro">{label}</Text>
      <Mono bold style={{ fontSize: 12, marginTop: 3 }}>
        {value}
      </Mono>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },
  chips: { marginBottom: spacing.lg },

  card: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  cardMuted: { opacity: 0.65 },
  cardTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },

  timeline: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    borderStyle: 'dashed',
  },
  timelineCell: { flex: 1, paddingRight: spacing.sm },
});
