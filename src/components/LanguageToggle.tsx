import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { LANGUAGES, setLanguage, type Language } from '../i18n/index';
import { colors, fonts, radius } from '../theme/index';

/**
 * The language switch is deliberately visible on the sign-in screen and in the
 * profile, not buried in a settings list — a worker who cannot read English
 * must be able to find it without reading English.
 */
export function LanguageToggle({ dark }: { dark?: boolean }) {
  const { i18n } = useTranslation();
  const active = i18n.language === 'gu' ? 'gu' : 'en';

  return (
    <View style={[styles.wrap, dark && styles.wrapDark]}>
      {LANGUAGES.map((lang) => {
        const on = active === lang.code;
        return (
          <Pressable
            key={lang.code}
            onPress={() => void setLanguage(lang.code as Language)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={lang.label}
            style={[styles.btn, on && styles.btnActive]}
          >
            <RNText
              style={[
                styles.label,
                // The Gujarati option is always rendered in Gujarati script, so
                // it is recognisable regardless of the current language.
                lang.code === 'gu' && { fontFamily: fonts.gujaratiBold },
                on && styles.labelActive,
                dark && !on && { color: 'rgba(255,255,255,0.65)' },
              ]}
            >
              {lang.label}
            </RNText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.paperCool,
    borderRadius: radius.md,
    padding: 3,
    alignSelf: 'flex-start',
  },
  wrapDark: { backgroundColor: colors.navySoft },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 7,
    minHeight: 36,
    justifyContent: 'center',
  },
  btnActive: { backgroundColor: colors.white },
  label: { fontFamily: fonts.bold, fontSize: 12, color: colors.textMute },
  labelActive: { color: colors.navy },
});
