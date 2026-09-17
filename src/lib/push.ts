import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Registers this device for push, then hands the token to the backend.
 *
 * Failures are swallowed: a worker who declines the permission prompt, or a
 * simulator with no push support, must still get a fully working app.
 */
export async function registerForPush(): Promise<string | null> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'TalentPro',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4FA8E0',
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== 'granted') return null;

    const token = (await Notifications.getDevicePushTokenAsync()).data as string;
    await api.post('/me/devices', {
      fcmToken: token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    });
    return token;
  } catch {
    return null;
  }
}

export async function unregisterPush(): Promise<void> {
  try {
    const token = (await Notifications.getDevicePushTokenAsync()).data as string;
    await api.delete('/me/devices', { data: { fcmToken: token } });
  } catch {
    // Nothing to clean up if the token could not be read.
  }
}
