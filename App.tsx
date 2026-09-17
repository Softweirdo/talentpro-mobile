import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  NotoSansGujarati_500Medium,
  NotoSansGujarati_700Bold,
} from '@expo-google-fonts/noto-sans-gujarati';
import { AuthProvider, useAuth } from './src/store/auth';
import { RootNavigator } from './src/navigation/index';
import { SplashScreen as BrandSplash } from './src/screens/Splash';
import { registerForPush } from './src/lib/push';
import { colors, fonts } from './src/theme/index';
import './src/i18n/index';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Connections here are flaky rather than absent; a couple of retries turn
      // a lot of transient failures into successes.
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    },
  },
});

/** Long enough for the brand screen to register, short enough not to annoy. */
const SPLASH_MS = 1400;

function Gate() {
  const { ready, signedIn } = useAuth();
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setMinElapsed(true), SPLASH_MS);
    return () => clearTimeout(id);
  }, []);

  // Held for whichever finishes last — the session restore or the minimum
  // display time — so a fast boot does not flash the brand screen for 80ms.
  const showSplash = !ready || !minElapsed;

  const onLayout = useCallback(() => {
    // The native launch screen hands over to ours immediately; both are the
    // same navy, so there is no visible seam.
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    // Push registration needs a session, so it waits for sign-in.
    if (signedIn) void registerForPush();
  }, [signedIn]);

  return (
    <View style={styles.flex} onLayout={onLayout}>
      {showSplash ? <BrandSplash /> : <RootNavigator />}
    </View>
  );
}

export default function App() {
  // Bundled rather than fetched at runtime: the app is used on patchy
  // connections, and Gujarati text must never fall back to a face that cannot
  // render its matras.
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
    NotoSansGujarati_500Medium,
    NotoSansGujarati_700Bold,
  });

  if (fontError) {
    return (
      <View style={[styles.splash, styles.centered]}>
        <Text style={styles.errorText}>Could not load fonts. Please reinstall the app.</Text>
      </View>
    );
  }

  if (!fontsLoaded) return <View style={styles.splash} />;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="dark" />
          <Gate />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.paper },
  splash: { flex: 1, backgroundColor: colors.navy },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { color: '#fff', textAlign: 'center', fontSize: 15 },
});
