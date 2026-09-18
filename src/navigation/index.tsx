import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../store/auth';
import { LoginScreen } from '../screens/Login';
import { OtpScreen } from '../screens/Otp';
import { RegisterScreen } from '../screens/Register';
import { FeedScreen } from '../screens/Feed';
import { JobDetailScreen } from '../screens/JobDetail';
import { ApplyConfirmScreen } from '../screens/ApplyConfirm';
import { ShareReferralScreen } from '../screens/ShareReferral';
import { ApplicationsScreen } from '../screens/Applications';
import { ReferralsScreen } from '../screens/Referrals';
import { ProfileScreen } from '../screens/Profile';
import { EditProfileScreen } from '../screens/EditProfile';
import { NotificationsScreen } from '../screens/Notifications';
import { Icon, type IconName } from '../components/Icon';
import { colors, fonts } from '../theme/index';
import { useLocalizedStyle } from '../theme/text';
import type { AppStackParams, AuthStackParams, FeedStackParams, TabParams } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const AppStack = createNativeStackNavigator<AppStackParams>();
const FeedStack = createNativeStackNavigator<FeedStackParams>();
const Tabs = createBottomTabNavigator<TabParams>();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.paper, primary: colors.skyDeep },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Otp" component={OtpScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

/**
 * The job detail lives in the Feed tab's own stack, so pushing it leaves the
 * tab bar in place. Both screens paint their own headers.
 */
function FeedNavigator() {
  return (
    <FeedStack.Navigator screenOptions={{ headerShown: false }}>
      <FeedStack.Screen name="FeedHome" component={FeedScreen} />
      <FeedStack.Screen name="JobDetail" component={JobDetailScreen} />
    </FeedStack.Navigator>
  );
}

/** The four-tab bar from the prototype: Home · Jobs · Refer · Profile. */
function TabNavigator() {
  const { t } = useTranslation();
  const localize = useLocalizedStyle();

  // The icon takes the tab's own colour, so active/inactive is one system
  // rather than an opacity trick over a fixed-colour emoji.
  const icon =
    (name: IconName) =>
    ({ focused, color }: { focused: boolean; color: string }) => (
      <Icon name={name} size={23} color={color} filled={focused} />
    );

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.skyDeep,
        tabBarInactiveTintColor: colors.textMute,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: localize({ fontFamily: fonts.bold, fontSize: 10 }),
        tabBarItemStyle: { paddingVertical: 6 },
      }}
    >
      <Tabs.Screen
        name="Feed"
        component={FeedNavigator}
        options={{ title: t('tabs.home'), tabBarIcon: icon('home') }}
      />
      <Tabs.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={{ title: t('tabs.jobs'), tabBarIcon: icon('clipboard') }}
      />
      <Tabs.Screen
        name="Referrals"
        component={ReferralsScreen}
        options={{ title: t('tabs.refer'), tabBarIcon: icon('share') }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('tabs.profile'), tabBarIcon: icon('user') }}
      />
    </Tabs.Navigator>
  );
}

function AppNavigator() {
  const { t } = useTranslation();
  const localize = useLocalizedStyle();

  // `headerTitleStyle` accepts only these four properties, so the localiser's
  // full TextStyle is narrowed rather than passed whole.
  const localizedTitle = localize({ fontFamily: fonts.extrabold, fontSize: 17 });
  const headerStyle = {
    headerStyle: { backgroundColor: colors.paper },
    headerTitleStyle: {
      fontFamily: localizedTitle.fontFamily,
      fontSize: localizedTitle.fontSize,
      color: colors.navy as string,
    },
    headerTintColor: colors.navy,
    headerShadowVisible: false,
  };

  return (
    <AppStack.Navigator>
      <AppStack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <AppStack.Screen
        name="ApplyConfirm"
        component={ApplyConfirmScreen}
        options={{ ...headerStyle, title: '' }}
      />
      <AppStack.Screen
        name="ShareReferral"
        component={ShareReferralScreen}
        options={{ ...headerStyle, title: '' }}
      />
      <AppStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ ...headerStyle, title: '' }}
      />
      <AppStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ ...headerStyle, title: t('notifications.title') }}
      />
    </AppStack.Navigator>
  );
}

export function RootNavigator() {
  const { signedIn } = useAuth();
  return (
    <NavigationContainer theme={navTheme}>
      {signedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    height: 68,
    paddingBottom: 10,
    paddingTop: 6,
  },
});

export { View };
