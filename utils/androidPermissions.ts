// utils/androidPermissions.ts
import { PermissionsAndroid, Platform } from 'react-native';

export async function requestReadSmsPermission() {
  if (Platform.OS !== 'android') return false;

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: 'Cashbook needs SMS access',
        message:
          'Cashbook reads transaction SMS to auto-import debit/credit alerts. Your messages are processed locally on device.',
        buttonPositive: 'Allow',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Permission error', err);
    return false;
  }
}
