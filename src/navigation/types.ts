import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParams = {
  Login: undefined;
  Otp: {
    requestId: string;
    maskedMobile: string;
    resendAfter: number;
    /** Present only in development builds, where the OTP is echoed back. */
    devCode?: string;
  };
  Register: undefined;
};

/**
 * The job detail sits inside the Feed tab rather than over the whole app, so
 * the tab bar stays on screen while a job is open — as in the prototype.
 */
export type FeedStackParams = {
  FeedHome: undefined;
  JobDetail: { jobId: string };
};

export type TabParams = {
  Feed: NavigatorScreenParams<FeedStackParams>;
  Applications: undefined;
  Referrals: undefined;
  Profile: undefined;
};

export type AppStackParams = {
  Tabs: NavigatorScreenParams<TabParams>;
  ApplyConfirm: { jobId: string };
  ShareReferral: { jobId?: string };
  EditProfile: undefined;
  Notifications: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AppStackParams {}
  }
}
