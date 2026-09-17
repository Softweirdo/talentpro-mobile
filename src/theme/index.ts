import { Platform, type TextStyle } from 'react-native';

/** Colour tokens, lifted from talentpro_prototype.html. */
export const colors = {
  navy: '#0B2540',
  navySoft: '#163B66',
  navyLine: '#2D5187',
  sky: '#4FA8E0',
  skyDeep: '#2A7EBC',
  skySoft: '#D4E8F7',

  paper: '#F4F7FB',
  paperCool: '#E8EFF7',
  white: '#FFFFFF',

  text: '#0B2540',
  textMute: '#6A7889',
  line: '#D5DEE8',

  success: '#1F9D5A',
  warning: '#E8A317',
  danger: '#D64545',
} as const;

export const radius = { sm: 4, md: 8, lg: 12, xl: 20, pill: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

/**
 * Font families.
 *
 * Numerics — salaries, employee codes, phone numbers, dates, OTP boxes — are
 * always JetBrains Mono, in both languages. It is a large part of the app's
 * identity, and it is what keeps figures legible when the UI switches to
 * Gujarati script.
 */
export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_700Bold',
  gujarati: 'NotoSansGujarati_500Medium',
  gujaratiBold: 'NotoSansGujarati_700Bold',
} as const;

/**
 * Text presets. Body weight is 500 rather than 400, and headings carry
 * negative tracking — both are load-bearing in the prototype's look.
 */
export const type = {
  display: { fontFamily: fonts.extrabold, fontSize: 30, letterSpacing: -0.7, color: colors.text },
  h1: { fontFamily: fonts.extrabold, fontSize: 24, letterSpacing: -0.5, color: colors.text },
  h2: { fontFamily: fonts.extrabold, fontSize: 19, letterSpacing: -0.3, color: colors.text },
  h3: { fontFamily: fonts.bold, fontSize: 16, letterSpacing: -0.2, color: colors.text },
  body: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  bodyMute: { fontFamily: fonts.medium, fontSize: 13, color: colors.textMute },
  small: { fontFamily: fonts.medium, fontSize: 12, color: colors.textMute },
  /** 9–11px, weight 800, wide tracking, uppercase. Used everywhere. */
  micro: {
    fontFamily: fonts.extrabold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textMute,
  } as TextStyle,
  mono: { fontFamily: fonts.mono, fontSize: 13, color: colors.text },
  monoBold: { fontFamily: fonts.monoBold, fontSize: 13, color: colors.text },
} as const;

export const shadow = {
  sm: Platform.select({
    ios: {
      shadowColor: colors.navy,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: colors.navy,
      shadowOpacity: 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 5 },
    default: {},
  }),
} as const;

/** Status badge pairings, matching the prototype exactly. */
export const statusColors: Record<string, { bg: string; fg: string }> = {
  applied: { bg: colors.skySoft, fg: colors.skyDeep },
  shortlisted: { bg: '#FFF4E0', fg: '#B5780B' },
  interview: { bg: '#EFE7FF', fg: '#5D32B0' },
  hired: { bg: '#E0F5EB', fg: '#178746' },
  rejected: { bg: '#FBE5E5', fg: '#B22F2F' },
  pending: { bg: '#EDEEF0', fg: '#5A6373' },
  tenure: { bg: '#E0F5EB', fg: '#178746' },
  rewarded: { bg: colors.navy, fg: colors.sky },
  withdrawn: { bg: '#EDEEF0', fg: '#5A6373' },
};

export const statusColor = (key: string) => statusColors[key] ?? statusColors.pending!;
