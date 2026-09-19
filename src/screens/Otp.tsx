import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, InfoNote, Text } from '../components/index';
import { useAuth } from '../store/auth';
import { errorMessage, isOffline } from '../api/client';
import { colors, fonts, radius, spacing } from '../theme/index';
import type { AuthStackParams } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParams, 'Otp'>;

const LENGTH = 6;

export function OtpScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { verifyOtp, requestOtp } = useAuth();
  const { requestId: initialRequestId, maskedMobile, resendAfter, devCode } = route.params;

  const [requestId, setRequestId] = useState(initialRequestId);
  // Prefilled in development so the flow is walkable without an SMS gateway.
  const [code, setCode] = useState(devCode ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(resendAfter);
  const inputRef = useRef<TextInput>(null);

  // Android leaves the input focused after the keyboard is dismissed (back
  // button or swipe down), so a plain focus() is a no-op and the keyboard
  // never returns. Blurring first makes the next focus reopen it.
  const focusInput = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    if (input.isFocused()) {
      input.blur();
      setTimeout(() => inputRef.current?.focus(), 60);
      return;
    }
    input.focus();
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  // Auto-submits on the sixth digit — one less tap on a flaky connection.
  useEffect(() => {
    if (code.length === LENGTH && !busy) void submit(code);
  }, [code]);

  const submit = async (value: string) => {
    setBusy(true);
    setError(null);
    try {
      const result = await verifyOtp(requestId, value);
      if (result.isNewUser) navigation.replace('Register');
      // Signing in an existing user flips the navigator automatically.
    } catch (err) {
      setCode('');
      setError(isOffline(err) ? t('common.offline') : errorMessage(err, t('otp.invalid')));
      focusInput();
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError(null);
    try {
      const result = await requestOtp(maskedMobile.replace(/\D/g, '').slice(-10));
      setRequestId(result.requestId);
      setSeconds(result.resendAfter);
      setCode(result.devCode ?? '');
      focusInput();
    } catch (err) {
      setError(errorMessage(err, t('common.genericError')));
    }
  };

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        // Edge-to-edge Android windows no longer resize themselves, so both
        // platforms need an explicit behaviour to keep the boxes above the keyboard.
        behavior="padding"
      >
        <ScrollView
          contentContainerStyle={styles.scrollWrap}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text variant="display" style={styles.title}>
            {t('otp.title')}
          </Text>
          <Text variant="bodyMute" style={styles.subtitle}>
            {t('otp.subtitle', { mobile: maskedMobile })}
          </Text>

          {/* A single input backs the six boxes: one caret, one keyboard, and SMS
              autofill still works. It sits invisibly on top of the boxes so a tap
              lands on the native field itself — the keyboard then always reopens,
              even when React still thinks the field is focused. */}
          <View style={styles.boxesWrap}>
            <Pressable style={styles.boxes} onPress={focusInput}>
              {Array.from({ length: LENGTH }, (_, i) => (
                <View key={i} style={[styles.box, code[i] ? styles.boxFilled : null]}>
                  <RNText style={styles.boxText}>{code[i] ?? ''}</RNText>
                </View>
              ))}
            </Pressable>

            <TextInput
              ref={inputRef}
              style={styles.overlayInput}
              value={code}
              onChangeText={(v) => {
                setCode(v.replace(/\D/g, '').slice(0, LENGTH));
                setError(null);
              }}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              maxLength={LENGTH}
              caretHidden
              autoFocus
            />
          </View>

          {error ? (
            <Text variant="small" style={styles.error}>
              {error}
            </Text>
          ) : null}

          {seconds > 0 ? (
            <View style={styles.timer}>
              <Text variant="bodyMute">{t('otp.resendIn')} </Text>
              <RNText style={styles.timerValue}>{mmss}</RNText>
            </View>
          ) : (
            <Pressable onPress={resend} style={styles.timer}>
              <Text variant="body" style={{ color: colors.skyDeep, fontFamily: fonts.bold }}>
                {t('otp.resend')}
              </Text>
            </Pressable>
          )}

          <Button
            title={t('otp.verify')}
            onPress={() => submit(code)}
            loading={busy}
            disabled={code.length !== LENGTH}
          />
          <Button
            title={t('otp.changeNumber')}
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={{ marginTop: spacing.md }}
          />

          {devCode ? (
            <View style={{ marginTop: spacing.xl }}>
              <InfoNote>
                <Text variant="small" style={{ color: colors.navy }}>
                  Development build — the code was filled in for you. In production it arrives by SMS.
                </Text>
              </InfoNote>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  scrollWrap: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  title: { fontSize: 30 },
  subtitle: { marginTop: spacing.sm },

  boxesWrap: { marginVertical: spacing.xxl },
  boxes: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  box: {
    width: 48,
    height: 58,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: { borderColor: colors.sky, backgroundColor: colors.skySoft },
  // OTP digits stay monospace in both languages.
  boxText: { fontFamily: fonts.monoBold, fontSize: 24, color: colors.navy },

  // Invisible but hit-testable: it covers the whole box row so every tap is a
  // real touch on the native input.
  overlayInput: { ...StyleSheet.absoluteFillObject, opacity: 0, color: 'transparent' },

  error: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  timer: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.lg, minHeight: 24 },
  timerValue: { fontFamily: fonts.monoBold, fontSize: 13, color: colors.navy },
});
