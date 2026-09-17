import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyState, ErrorState, Loading, Text } from '../components/index';
import { useMarkNotificationsRead, useNotifications } from '../api/hooks';
import { useRelativeTime } from '../lib/relativeTime';
import { colors, radius, spacing } from '../theme/index';
import type { AppStackParams } from '../navigation/types';
import type { AppNotification } from '../api/types';

export function NotificationsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const query = useNotifications();
  const markRead = useMarkNotificationsRead();
  const ago = useRelativeTime();

  const items = query.data?.pages.flatMap((p) => p.data) ?? [];

  // Opening the inbox is the acknowledgement, so the badge clears on view
  // rather than requiring a separate tap.
  useEffect(() => {
    if (items.some((n) => !n.isRead)) markRead.mutate();
  }, [items.length]);

  const open = (n: AppNotification) => {
    const screen = n.data?.screen;
    if (screen === 'JobDetail' && n.data.jobId) {
      navigation.navigate('JobDetail', { jobId: n.data.jobId });
    } else if (screen === 'Referrals') {
      navigation.navigate('Tabs', { screen: 'Referrals' });
    } else if (screen === 'ApplicationDetail' || screen === 'Applications') {
      navigation.navigate('Tabs', { screen: 'Applications' });
    }
  };

  if (query.isLoading && items.length === 0) return <Loading />;
  if (query.isError && items.length === 0) return <ErrorState onRetry={() => void query.refetch()} />;

  return (
    <FlatList
      style={styles.list}
      data={items}
      keyExtractor={(n) => n.id}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching}
          onRefresh={() => void query.refetch()}
          tintColor={colors.skyDeep}
        />
      }
      onEndReached={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
      }}
      ListEmptyComponent={<EmptyState title={t('notifications.empty')} />}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => open(item)}
          style={({ pressed }) => [styles.item, !item.isRead && styles.unread, pressed && styles.pressed]}
        >
          <View style={{ flex: 1 }}>
            <Text variant="h3" style={{ fontSize: 14 }}>
              {item.title}
            </Text>
            <Text variant="bodyMute" style={{ marginTop: 4, lineHeight: 19 }}>
              {item.body}
            </Text>
            <Text variant="small" style={{ marginTop: 6 }}>
              {ago(item.createdAt)}
            </Text>
          </View>
          {!item.isRead ? <View style={styles.dot} /> : null}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.paper },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  item: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  unread: { borderLeftWidth: 3, borderLeftColor: colors.sky },
  pressed: { opacity: 0.85 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.sky, marginTop: 6 },
});
