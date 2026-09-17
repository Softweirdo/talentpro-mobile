import { useTranslation } from 'react-i18next';
import type { TextStyle } from 'react-native';
import { fonts } from './index';

/**
 * Gujarati needs its own face for prose, but numerals, employee codes, phone
 * numbers and salaries stay in JetBrains Mono in both languages — the
 * prototype is explicit about this, and it is what keeps a ₹22,000 figure
 * scannable when the rest of the screen is in Gujarati script.
 */
const GUJARATI_FOR: Partial<Record<string, string>> = {
  [fonts.regular]: fonts.gujarati,
  [fonts.medium]: fonts.gujarati,
  [fonts.semibold]: fonts.gujarati,
  [fonts.bold]: fonts.gujaratiBold,
  [fonts.extrabold]: fonts.gujaratiBold,
};

export function localizeFont(style: TextStyle, language: string): TextStyle {
  if (language !== 'gu') return style;
  const family = style.fontFamily;
  if (!family) return style;
  const swapped = GUJARATI_FOR[family];
  if (!swapped) return style;
  return {
    ...style,
    fontFamily: swapped,
    // Gujarati matras sit above and below the baseline, so the tight tracking
    // and line heights the Latin faces use would clip them.
    letterSpacing: 0,
    lineHeight: style.lineHeight ?? (style.fontSize ? style.fontSize * 1.5 : undefined),
  };
}

/** Returns a style localiser bound to the active language. */
export function useLocalizedStyle() {
  const { i18n } = useTranslation();
  return (style: TextStyle) => localizeFont(style, i18n.language);
}
