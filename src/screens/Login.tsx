import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Field, Text } from '../components/index';
import { LanguageToggle } from '../components/LanguageToggle';
import { useAuth } from '../store/auth';
import { apiHost, errorMessage, isOffline } from '../api/client';
import { digitsOnly, isValidMobile } from '../lib/format';
import { colors, spacing } from '../theme/index';
import type { AuthStackParams } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { requestOtp } = useAuth();
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!isValidMobile(mobile)) {
      setError(t('login.invalidMobile'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await requestOtp(digitsOnly(mobile));
      navigation.navigate('Otp', {
        requestId: result.requestId,
        maskedMobile: result.maskedMobile,
        resendAfter: result.resendAfter,
        devCode: result.devCode,
      });
    } catch (err) {
      setError(
        isOffline(err)
          ? // In a dev build, name the host that failed — the usual cause is a
            // device pointed at its own loopback rather than the dev machine.
            `${t('common.offline')}${__DEV__ ? `\n${t('common.offlineDev', { host: apiHost })}` : ''}`
          : errorMessage(err, t('common.genericError')),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        // Edge-to-edge Android windows no longer resize themselves, so both
        // platforms need an explicit behaviour to keep the field above the keyboard.
        behavior="padding"
      >
        <ScrollView
          contentContainerStyle={styles.scrollWrap}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text variant="display" style={styles.logoText}>
                T
              </Text>
            </View>
          </View>

          <Text variant="display" style={styles.title}>
            {t('login.title')}
          </Text>
          <Text variant="display" style={styles.title}>
            {t('login.titleLine2')}
          </Text>
          <Text variant="bodyMute" style={styles.subtitle}>
            {t('login.subtitle')}
          </Text>

          <Field
            label={t('login.mobileLabel')}
            value={mobile}
            onChangeText={(v) => {
              setMobile(digitsOnly(v));
              setError(null);
            }}
            keyboardType="phone-pad"
            autoComplete="tel"
            maxLength={10}
            placeholder="98765 43210"
            mono
            error={error}
            hint={error ? undefined : t('login.mobileHelper')}
            returnKeyType="go"
            onSubmitEditing={submit}
          />

          <Button title={t('login.send')} onPress={submit} loading={busy} />

          <Pressable style={styles.terms}>
            <Text variant="small" style={styles.termsText}>
              {t('login.terms')}
            </Text>
            <Text variant="small" style={styles.termsText}>
              {t('login.termsLine2')}
            </Text>
          </Pressable>
        </ScrollView>

        {/* Pinned outside the scroll view, and last so it paints above it. */}
        <View style={styles.top}>
          <LanguageToggle />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  scrollWrap: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  top: { position: 'absolute', top: spacing.lg, right: spacing.xl, left: spacing.xl, alignItems: 'flex-end' },

  brand: { alignItems: 'center', marginBottom: spacing.xxl },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: colors.skyDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: colors.white, fontSize: 36 },

  title: { fontSize: 32, lineHeight: 38 },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xxl },

  terms: { marginTop: spacing.xxl, alignItems: 'center' },
  termsText: { textAlign: 'center', lineHeight: 18 },
});
