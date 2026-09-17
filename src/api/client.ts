import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * `expo-secure-store` is native-only. On web — used for quick previews, not
 * for production — it falls back to localStorage, which is the browser's
 * equivalent and adequate for a dev build.
 */
const store = {
  get: (k: string): Promise<string | null> =>
    Platform.OS === 'web'
      ? Promise.resolve(globalThis.localStorage?.getItem(k) ?? null)
      : SecureStore.getItemAsync(k),
  set: (k: string, v: string): Promise<void> =>
    Platform.OS === 'web'
      ? Promise.resolve(globalThis.localStorage?.setItem(k, v))
      : SecureStore.setItemAsync(k, v),
  remove: (k: string): Promise<void> =>
    Platform.OS === 'web'
      ? Promise.resolve(globalThis.localStorage?.removeItem(k))
      : SecureStore.deleteItemAsync(k),
};

/**
 * An Android emulator cannot reach the host's localhost, so the loopback
 * address is rewritten to the emulator's host alias. A real device needs the
 * machine's LAN IP set in app.json.
 */
function resolveBaseUrl(): string {
  const configured = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
  const url = configured ?? 'http://localhost:4000/api/v1';
  if (Platform.OS === 'android') return url.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
  return url;
}

export const BASE_URL = resolveBaseUrl();

const ACCESS_KEY = 'talentpro.access';
const REFRESH_KEY = 'talentpro.refresh';

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const session = {
  get access() {
    return accessToken;
  },
  get refresh() {
    return refreshToken;
  },
  async load(): Promise<boolean> {
    try {
      accessToken = await store.get(ACCESS_KEY);
      refreshToken = await store.get(REFRESH_KEY);
    } catch {
      accessToken = null;
      refreshToken = null;
    }
    return Boolean(refreshToken);
  },
  async set(access: string, refresh: string): Promise<void> {
    accessToken = access;
    refreshToken = refresh;
    await store.set(ACCESS_KEY, access);
    await store.set(REFRESH_KEY, refresh);
  },
  async clear(): Promise<void> {
    accessToken = null;
    refreshToken = null;
    await store.remove(ACCESS_KEY).catch(() => {});
    await store.remove(REFRESH_KEY).catch(() => {});
  },
};

export const api = axios.create({
  baseURL: BASE_URL,
  // Rural connections are slow; a short timeout produces spurious failures.
  timeout: 25_000,
});

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

/** Called when the session cannot be recovered, so the app can return to login. */
let onSessionLost: (() => void) | null = null;
export const setSessionLostHandler = (fn: () => void) => {
  onSessionLost = fn;
};

// A single in-flight refresh, shared by every request that 401s while it runs.
// Without this, a screen firing four queries at once would rotate the refresh
// token four times and trip the backend's reuse detection.
let refreshing: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  if (!refreshToken) throw new Error('no refresh token');
  const res = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
    `${BASE_URL}/auth/refresh`,
    { refreshToken },
  );
  await session.set(res.data.data.accessToken, res.data.data.refreshToken);
  return res.data.data.accessToken;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ error?: { code: string; message: string } }>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };
    const status = error.response?.status;
    const code = error.response?.data?.error?.code;
    const isAuthRoute = original?.url?.includes('/auth/');

    if (status === 401 && !original?._retried && !isAuthRoute && refreshToken) {
      original._retried = true;
      try {
        refreshing ??= doRefresh().finally(() => {
          refreshing = null;
        });
        const token = await refreshing;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        await session.clear();
        onSessionLost?.();
        return Promise.reject(error);
      }
    }

    if (code === 'REFRESH_REUSED' || code === 'REFRESH_EXPIRED' || code === 'ACCOUNT_BLOCKED') {
      await session.clear();
      onSessionLost?.();
    }

    return Promise.reject(error);
  },
);

export function errorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return fallback;
    return err.response.data?.error?.message ?? fallback;
  }
  return fallback;
}

export function errorCode(err: unknown): string | null {
  return axios.isAxiosError(err) ? (err.response?.data?.error?.code ?? null) : null;
}

export const isOffline = (err: unknown): boolean =>
  axios.isAxiosError(err) && !err.response;
