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

export type TabParams = {
  Feed: undefined;
  Applications: undefined;
  Referrals: undefined;
  Profile: undefined;
};

export type AppStackParams = {
  Tabs: NavigatorScreenParams<TabParams>;
  JobDetail: { jobId: string };
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
