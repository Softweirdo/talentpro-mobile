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
 * The API base URL.
 *
 * One deployed API for every build, so there is no loopback address to rewrite
 * and no way for a release APK to ship pointing at a `localhost` that does not
 * exist on the handset. Change it in app.config.ts.
 */
const FALLBACK_API = 'https://talent-pro-backend.dev-api.softweirdo.com/api/v1';

function resolveBaseUrl(): string {
  // `extra` comes from the manifest, which a standalone build embeds. The
  // literal below is the same URL compiled into the bundle, so the app still
  // reaches the API if the manifest is ever unavailable — a crash or a screen
  // of network errors would be a worse outcome than a duplicated constant.
  const configured = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
  return configured ?? FALLBACK_API;
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

/**
 * True when the request produced no HTTP response at all.
 *
 * This covers a genuinely offline device, a server that is down, a wrong host,
 * and a blocked origin — they are indistinguishable from the client. The copy
 * shown to the user says "cannot reach", not "no internet", because claiming
 * the latter sends people to check a connection that is working fine.
 */
export const isOffline = (err: unknown): boolean =>
  axios.isAxiosError(err) && !err.response;

/** The host the app is actually calling — surfaced in dev builds to make a misconfigured URL obvious. */
export const apiHost = BASE_URL.replace(/^https?:\/\//, '').replace(/\/api.*$/, '');
