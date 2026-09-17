import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import { NativeModules, Platform } from 'react-native';
import en from './en.json';
import gu from './gu.json';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'gu', label: 'ગુજરાતી' },
] as const;

export type Language = (typeof LANGUAGES)[number]['code'];

const STORAGE_KEY = 'talentpro.language';

/**
 * Falls back to the handset's own language, since a Gujarati-speaking worker
 * should not have to find a setting before the app is readable.
 */
function deviceLanguage(): Language {
  const locale =
    Platform.OS === 'ios'
      ? (NativeModules.SettingsManager?.settings?.AppleLocale as string | undefined) ??
        (NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] as string | undefined)
      : (NativeModules.I18nManager?.localeIdentifier as string | undefined);

  return locale?.toLowerCase().startsWith('gu') ? 'gu' : 'en';
}

void i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, gu: { translation: gu } },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
  });

/** Restores the stored choice, or picks up the device language on first run. */
export async function initLanguage(): Promise<Language> {
  let stored: string | null = null;
  try {
    stored =
      Platform.OS === 'web'
        ? (globalThis.localStorage?.getItem(STORAGE_KEY) ?? null)
        : await SecureStore.getItemAsync(STORAGE_KEY);
  } catch {
    // A locked keystore is not a reason to fail startup.
  }
  const language = (stored as Language | null) ?? deviceLanguage();
  await i18n.changeLanguage(language);
  return language;
}

export async function setLanguage(language: Language): Promise<void> {
  await i18n.changeLanguage(language);
  try {
    if (Platform.OS === 'web') globalThis.localStorage?.setItem(STORAGE_KEY, language);
    else await SecureStore.setItemAsync(STORAGE_KEY, language);
  } catch {
    // Persisting is best effort; the in-memory change already applied.
  }
}

export const currentLanguage = (): Language => (i18n.language === 'gu' ? 'gu' : 'en');

export default i18n;
