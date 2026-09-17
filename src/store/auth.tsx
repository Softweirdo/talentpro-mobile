import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, session, setSessionLostHandler } from '../api/client';
import type { Envelope, Me } from '../api/types';
import { initLanguage } from '../i18n/index';

interface OtpRequestResult {
  requestId: string;
  expiresIn: number;
  resendAfter: number;
  maskedMobile: string;
  /** Returned outside production so the flow is testable without an SMS gateway. */
  devCode?: string;
}

interface VerifyResult {
  isNewUser: boolean;
  registrationToken?: string;
  accessToken?: string;
  refreshToken?: string;
  employee?: Me;
}

interface AuthValue {
  ready: boolean;
  signedIn: boolean;
  /** Held between OTP verification and registration; never persisted. */
  registrationToken: string | null;
  requestOtp: (mobile: string) => Promise<OtpRequestResult>;
  verifyOtp: (requestId: string, code: string) => Promise<VerifyResult>;
  register: (input: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      await initLanguage();
      setSignedIn(await session.load());
      setReady(true);
    })();
  }, []);

  const signOut = useCallback(async () => {
    const refresh = session.refresh;
    // Best effort — the local session is cleared regardless.
    if (refresh) await api.post('/auth/logout', { refreshToken: refresh }).catch(() => {});
    await session.clear();
    qc.clear();
    setSignedIn(false);
  }, [qc]);

  useEffect(() => {
    // An unrecoverable session (revoked family, blocked account) drops the user
    // back to the sign-in screen rather than leaving a dead UI.
    setSessionLostHandler(() => {
      qc.clear();
      setSignedIn(false);
    });
  }, [qc]);

  const value = useMemo<AuthValue>(
    () => ({
      ready,
      signedIn,
      registrationToken,

      requestOtp: async (mobile) =>
        (await api.post<Envelope<OtpRequestResult>>('/auth/otp/request', { mobile })).data.data,

      verifyOtp: async (requestId, code) => {
        const result = (
          await api.post<Envelope<VerifyResult>>('/auth/otp/verify', { requestId, code })
        ).data.data;

        if (result.isNewUser) {
          setRegistrationToken(result.registrationToken ?? null);
        } else if (result.accessToken && result.refreshToken) {
          await session.set(result.accessToken, result.refreshToken);
          setSignedIn(true);
        }
        return result;
      },

      register: async (input) => {
        if (!registrationToken) throw new Error('Registration session expired');
        const res = await api.post<Envelope<{ accessToken: string; refreshToken: string }>>(
          '/auth/register',
          input,
          // The registration token authorises exactly this one call; it is not
          // an access token and is never stored.
          { headers: { Authorization: `Bearer ${registrationToken}` } },
        );
        await session.set(res.data.data.accessToken, res.data.data.refreshToken);
        setRegistrationToken(null);
        setSignedIn(true);
      },

      signOut,
    }),
    [ready, signedIn, registrationToken, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
