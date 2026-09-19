import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Replaces the static app.json.
 *
 * The app always talks to the deployed API — development, device builds and
 * release APKs alike. One URL means an APK can never ship pointing at a
 * `localhost` that does not exist on the handset.
 */
const DEPLOYED_API = 'https://talent-pro-backend.dev-api.softweirdo.com/api/v1';

/**
 * The deployed API unless explicitly overridden, so a release APK can never
 * ship pointing at a `localhost` that does not exist on the handset. To work
 * against a backend running on this machine (port 4048, see the backend .env):
 *
 *   EXPO_PUBLIC_API_URL=http://localhost:4048/api/v1 npx expo start
 *
 * A real handset cannot reach your `localhost` — use the machine's LAN address
 * there instead, e.g. http://192.168.1.5:4048/api/v1.
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL || DEPLOYED_API;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'TalentPro',
  slug: 'talentpro',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'talentpro',
  userInterfaceStyle: 'light',
  icon: './assets/icon.png',
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
    adaptiveIcon: {
      // Foreground is the glyph on transparency; the launcher composites it
      // over this colour and applies its own mask.
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#2A7EBC',
    },
    edgeToEdgeEnabled: true,
  },

  web: { bundler: 'metro', output: 'single', favicon: './assets/favicon.png' },

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
