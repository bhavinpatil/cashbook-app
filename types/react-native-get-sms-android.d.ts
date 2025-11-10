declare module 'react-native-get-sms-android' {
  interface SmsFilter {
    box?: 'inbox' | 'sent';
    minDate?: number;
    maxDate?: number;
    indexFrom?: number;
    maxCount?: number;
    bodyRegex?: string;
  }

  type ListCallback = (
    fail: string | null,
    success?: (count: number, smsList: string) => void
  ) => void;

  const SmsAndroid: {
    list(
      filter: string,
      fail: (error: any) => void,
      success: (count: number, smsList: string) => void
    ): void;
  };

  export default SmsAndroid;
}
