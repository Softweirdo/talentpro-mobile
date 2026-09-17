import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Chip, EmptyState, ErrorState, Loading, SectionLabel, Text } from '../components/index';
import { JobCard } from '../components/JobCard';
import { Icon } from '../components/Icon';
import { useCategories, useJobFeed, useMe, useNotifications, useRecommendedJobs } from '../api/hooks';
import { currentLanguage } from '../i18n/index';
import { colors, fonts, radius, spacing } from '../theme/index';
import { useLocalizedStyle } from '../theme/text';
import type { AppStackParams } from '../navigation/types';
import type { Job } from '../api/types';

export function FeedScreen() {
  const { t } = useTranslation();
  // Lives in the tab navigator but pushes onto the parent stack.
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const localize = useLocalizedStyle();
  const lang = currentLanguage();

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');

  const me = useMe();
  const categories = useCategories();
  const recommended = useRecommendedJobs();
  const notifications = useNotifications();

  const feed = useJobFeed({
    ...(debounced ? { q: debounced } : {}),
    ...(categoryId ? { categoryId } : {}),
  });

  // Debounced so typing does not fire a request per keystroke on a slow link.
  useMemo(() => {
    const id = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(id);
  }, [search]);

  const jobs = feed.data?.pages.flatMap((p) => p.data) ?? [];
  const unread = (notifications.data?.pages[0]?.meta?.unreadCount as number | undefined) ?? 0;
  const open = (job: Job) => navigation.navigate('JobDetail', { jobId: job.id });

  if (feed.isLoading && jobs.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Loading />
      </SafeAreaView>
    );
  }

  if (feed.isError && jobs.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState onRetry={() => void feed.refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} onPress={() => open(item)} />}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={feed.isRefetching && !feed.isFetchingNextPage}
            onRefresh={() => {
              void feed.refetch();
              void recommended.refetch();
            }}
            tintColor={colors.skyDeep}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage();
        }}
        ListHeaderComponent={
          <>
            <View style={styles.head}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMute">{t('feed.greeting')}</Text>
                <Text variant="h1" numberOfLines={1}>
                  {me.data?.name ?? ''}
                </Text>
              </View>
              <Pressable
                style={styles.bell}
                onPress={() => navigation.navigate('Notifications')}
                accessibilityRole="button"
                accessibilityLabel={t('notifications.title')}
              >
                <Icon name="bell" size={21} color={colors.navy} />
                {unread > 0 ? (
                  <View style={styles.bellBadge}>
                    <RNText style={styles.bellBadgeText}>{unread > 9 ? '9+' : unread}</RNText>
                  </View>
                ) : null}
              </Pressable>
            </View>

            <View style={styles.search}>
              <Icon name="search" size={19} color={colors.textMute} />
              <TextInput
                style={[localize({ fontFamily: fonts.medium, fontSize: 14 }), styles.searchInput]}
                placeholder={t('feed.searchPlaceholder')}
                placeholderTextColor={colors.textMute}
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              <Chip label={t('common.all')} active={!categoryId} onPress={() => setCategoryId('')} />
              {(categories.data ?? []).map((c) => (
                <Chip
                  key={c.id}
                  label={lang === 'gu' && c.nameGu ? c.nameGu : c.name}
                  active={categoryId === c.id}
                  onPress={() => setCategoryId(categoryId === c.id ? '' : c.id)}
                />
              ))}
            </ScrollView>

            {/* Recommendations are hidden while filtering — the list below is
                already the answer to what the user asked for. */}
            {!categoryId && !debounced && (recommended.data?.data.length ?? 0) > 0 ? (
              <>
                <SectionLabel title={t('feed.recommended')} />
                {(recommended.data?.data ?? []).slice(0, 2).map((job) => (
                  <JobCard key={job.id} job={job} onPress={() => open(job)} />
                ))}
              </>
            ) : null}

            <SectionLabel
              title={`${t('feed.openVacancies')}${jobs.length ? ` · ${jobs.length}` : ''}`}
            />
          </>
        }
        ListEmptyComponent={
          <EmptyState title={t('feed.empty')} hint={t('feed.emptyHint')} />
        }
        ListFooterComponent={
          feed.isFetchingNextPage ? (
            <ActivityIndicator style={{ marginVertical: spacing.xl }} color={colors.skyDeep} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },

  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  bell: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 19,
    height: 19,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: { fontFamily: fonts.extrabold, fontSize: 10, color: colors.white },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: 50,
  },
  searchInput: { flex: 1, color: colors.navy, paddingVertical: 12 },

  chips: { paddingVertical: spacing.md, paddingRight: spacing.xl },
});
