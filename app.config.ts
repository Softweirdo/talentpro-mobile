import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Replaces the static app.json.
 *
 * The app always talks to the deployed API — development, device builds and
 * release APKs alike. One URL means an APK can never ship pointing at a
 * `localhost` that does not exist on the handset.
 */
const API_URL = 'https://talent-pro-backend.dev-api.softweirdo.com/api/v1';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'TalentPro',
  slug: 'talentpro',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'talentpro',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  assetBundlePatterns: ['**/*'],
  platforms: ['ios', 'android', 'web'],

  ios: {
    supportsTablet: false,
    // A separate bundle id per environment, so a dev build can sit alongside
    // the real app on the same handset.
    bundleIdentifier: 'in.mpowersolutions.talentpro',
  },

  android: {
    package: 'in.mpowersolutions.talentpro',
    adaptiveIcon: { backgroundColor: '#0B2540' },
    edgeToEdgeEnabled: true,
  },

  web: { bundler: 'metro', output: 'single' },

  plugins: [
    'expo-font',
    'expo-secure-store',
    'expo-notifications',
    [
      'expo-splash-screen',
      {
        // A transparent 1x1 placeholder: the plugin always writes an
        // `@drawable/splashscreen_logo` reference on Android, so an image is
        // required even when we only want the background color to show.
        image: './assets/splash-icon.png',
        backgroundColor: '#0B2540',
        resizeMode: 'contain',
      },
    ],
  ],

  extra: {
    ...config.extra,
    apiUrl: API_URL,
  },
});
