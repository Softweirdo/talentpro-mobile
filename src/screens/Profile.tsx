import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Button,
  ErrorState,
  InfoNote,
  Loading,
  Mono,
  Row,
  Screen,
  Text,
} from '../components/index';
import { LanguageToggle } from '../components/LanguageToggle';
import { Icon } from '../components/Icon';
import { useMe } from '../api/hooks';
import { useAuth } from '../store/auth';
import { EXPERIENCE_LABEL, formatMobile, initials, inr, pad2 } from '../lib/format';
import { currentLanguage } from '../i18n/index';
import { colors, fonts, radius, spacing } from '../theme/index';
import type { AppStackParams } from '../navigation/types';

export function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const { signOut } = useAuth();
  const { data: me, isLoading, isError, refetch } = useMe();
  const lang = currentLanguage();

  if (isLoading) return <Loading />;
  if (isError || !me) return <ErrorState onRetry={() => void refetch()} />;

  const confirmSignOut = () =>
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: () => void signOut() },
    ]);

  const pastJobs = (me.employmentHistory ?? []).filter((h) => !h.isCurrent);

  return (
    <Screen style={{ padding: 0 }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <RNText style={styles.avatarText}>{initials(me.name)}</RNText>
        </View>
        <Text variant="h1" style={{ color: colors.white, marginTop: spacing.md }}>
          {me.name}
        </Text>
        <View style={styles.codePill}>
          <Mono bold style={{ color: colors.sky, fontSize: 12 }}>
            {me.employeeCode ?? t('profile.pendingCode')}
          </Mono>
        </View>
        <RNText style={styles.orgLine}>
          {me.currentOrganization ? `◆ ${me.currentOrganization}` : t('profile.currentlyUnemployed')}
        </RNText>
        <Mono style={styles.phone}>{formatMobile(me.mobile)}</Mono>
      </View>

      <View style={styles.body}>
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="h3">{t('common.language')}</Text>
          </View>
          <LanguageToggle />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="h3">{t('profile.personal')}</Text>
            <Pressable
              onPress={() => navigation.navigate('EditProfile')}
              accessibilityRole="button"
              hitSlop={10}
            >
              <Text variant="micro" style={{ color: colors.skyDeep }}>
                {t('profile.edit')}
              </Text>
            </Pressable>
          </View>
          <Row label={t('profile.age')} value={me.age ? `${me.age}` : '—'} mono />
          <Row
            label={t('common.experience')}
            value={me.experienceBand ? EXPERIENCE_LABEL[me.experienceBand] : '—'}
          />
          <Row
            label={t('common.category')}
            value={(lang === 'gu' && me.categoryNameGu ? me.categoryNameGu : me.categoryName) ?? '—'}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="h3">{t('profile.salary')}</Text>
            <Pressable
              onPress={() => navigation.navigate('EditProfile')}
              accessibilityRole="button"
              hitSlop={10}
            >
              <Text variant="micro" style={{ color: colors.skyDeep }}>
                {t('profile.edit')}
              </Text>
            </Pressable>
          </View>
          <Row label={t('profile.present')} value={inr(me.presentSalary)} mono />
          <Row label={t('profile.expected')} value={inr(me.expectedSalary)} mono />
        </View>

        {/*
         * Employment is read-only by design: referral tenure and payouts are
         * computed from it, so it is maintained by the admin team. The lock
         * badge and the note below say so rather than leaving it unexplained.
         */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="h3">{t('profile.employment')}</Text>
            <View style={styles.lock}>
              <Icon name="lock" size={11} color={colors.textMute} />
              <RNText style={styles.lockText}>
                {t('profile.adminLocked')}
              </RNText>
            </View>
          </View>
          <Row
            label={t('profile.currentlyAt')}
            value={me.currentOrganization ?? t('profile.unemployed')}
          />
          {pastJobs.slice(0, 3).map((h) => (
            <Row key={h.id} label={h.period} value={h.company} />
          ))}
          <View style={{ marginTop: spacing.md }}>
            <InfoNote>
              <Text variant="small" style={{ color: colors.navy, lineHeight: 18 }}>
                {t('profile.adminLockedHint')}
              </Text>
            </InfoNote>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text variant="h3">{t('detail.referAndEarn')}</Text>
          </View>
          <Row label={t('referrals.total')} value={pad2(me.totalReferrals)} mono />
          <Row label={t('profile.moneyEarned')} value={inr(me.moneyEarned)} mono />
          <Row label={t('profile.referralCode')} value={me.referralCode} mono />
        </View>

        <Button
          title={t('profile.referFriend')}
          onPress={() => navigation.navigate('ShareReferral', {})}
        />
        <Button
          title={t('profile.logout')}
          variant="secondary"
          onPress={confirmSignOut}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.navy,
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.skyDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.extrabold, fontSize: 28, color: colors.white },
  codePill: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.sm,
  },
  orgLine: { fontFamily: fonts.medium, fontSize: 13, color: colors.sky, marginTop: spacing.md },
  phone: { color: 'rgba(255,255,255,0.7)', marginTop: 4, fontSize: 12 },

  body: { padding: spacing.xl },

  section: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },

  lock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.paperCool,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  lockText: { fontFamily: fonts.bold, fontSize: 10, color: colors.textMute },
});
