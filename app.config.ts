import type { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Replaces the static app.json so the API URL can depend on the build.
 *
 * `APP_ENV` selects it — unset means local development, which is what you get
 * from `npm start`. EAS build profiles set it explicitly.
 */
const LIVE_API = 'https://talent-pro-backend.dev-api.softweirdo.com/api/v1';
const LOCAL_API = 'http://localhost:4000/api/v1';

type AppEnv = 'development' | 'staging' | 'production';

const APP_ENV = (process.env.APP_ENV as AppEnv) ?? 'development';

const API_URL: Record<AppEnv, string> = {
  // `localhost` is rewritten at runtime to the machine serving the bundle, so a
  // physical phone reaches the dev machine rather than itself. See api/client.ts.
  development: process.env.API_URL ?? LOCAL_API,
  staging: process.env.API_URL ?? LIVE_API,
  production: process.env.API_URL ?? LIVE_API,
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_ENV === 'production' ? 'TalentPro' : `TalentPro (${APP_ENV})`,
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
    bundleIdentifier:
      APP_ENV === 'production'
        ? 'in.mpowersolutions.talentpro'
        : `in.mpowersolutions.talentpro.${APP_ENV}`,
  },

  android: {
    package:
      APP_ENV === 'production'
        ? 'in.mpowersolutions.talentpro'
        : `in.mpowersolutions.talentpro.${APP_ENV}`,
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
    apiUrl: API_URL[APP_ENV],
    appEnv: APP_ENV,
  },
});
