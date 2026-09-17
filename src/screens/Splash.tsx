import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, StyleSheet, Text as RNText, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors, fonts } from '../theme/index';
import { useLocalizedStyle } from '../theme/text';

/**
 * The prototype's screen 01, built as a real screen rather than a static
 * launch image — so the wordmark and tagline render in the user's own
 * language and in the correct typeface.
 *
 * The native launch screen is the same navy, so the handoff to this is
 * seamless: the app never flashes a different colour.
 */
export function SplashScreen() {
  const { t } = useTranslation();
  const localize = useLocalizedStyle();
  // Explicit pixel dimensions: an Svg sized only by absoluteFill falls back to
  // a default box on web and visibly clips the gradient.
  const { width, height } = useWindowDimensions();

  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(lift, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, lift]);

  return (
    <LinearGradient
      // 160deg in CSS, expressed here as the equivalent start/end points.
      colors={[colors.navy, '#051a30']}
      start={{ x: 0.18, y: 0 }}
      end={{ x: 0.82, y: 1 }}
      style={styles.fill}
    >
      {/*
        The sky glow bleeding in from the top-right.

        A real radial gradient rather than a linear one clipped to a circle —
        the latter leaves a visible arc where the container ends, because the
        colour is still partly opaque at the clip boundary.
      */}
      <Svg
        width={width}
        height={height}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          {/* userSpaceOnUse so the circle stays round on a tall screen rather
              than stretching with the bounding box. */}
          <RadialGradient
            id="glow"
            gradientUnits="userSpaceOnUse"
            cx={width * 0.88}
            cy={height * 0.04}
            r={Math.max(width, height) * 0.62}
          >
            <Stop offset="0" stopColor={colors.sky} stopOpacity={0.3} />
            <Stop offset="0.55" stopColor={colors.sky} stopOpacity={0.09} />
            <Stop offset="1" stopColor={colors.sky} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#glow)" />
      </Svg>

      <Animated.View style={[styles.center, { opacity: fade, transform: [{ translateY: lift }] }]}>
        <LinearGradient
          colors={[colors.sky, colors.skyDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logo}
        >
          <RNText style={styles.logoLetter}>T</RNText>
        </LinearGradient>

        {/* The wordmark is a brand name, so it stays Latin in both languages. */}
        <RNText style={styles.wordmark}>TalentPro</RNText>

        <RNText style={[localize(styles.tagline), styles.taglineColor]}>
          {t('splash.tagline')}
        </RNText>
      </Animated.View>

      <Animated.Text style={[localize(styles.footer), styles.footerColor, { opacity: fade }]}>
        {t('splash.footer')}
      </Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },

  center: { alignItems: 'center', paddingHorizontal: 24 },

  logo: {
    width: 88,
    height: 88,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: colors.sky,
    shadowOpacity: 0.5,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  logoLetter: { fontFamily: fonts.extrabold, fontSize: 44, color: colors.white },

  wordmark: {
    fontFamily: fonts.extrabold,
    fontSize: 40,
    letterSpacing: -0.8,
    color: colors.white,
  },

  tagline: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 2.5,
    marginTop: 6,
    textAlign: 'center',
  },
  taglineColor: { color: colors.sky, textTransform: 'uppercase' },

  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  footerColor: { color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
});
