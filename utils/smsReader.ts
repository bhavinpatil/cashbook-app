// utils/smsReader.ts
import SmsAndroid from 'react-native-get-sms-android';
import { parseSmsMessage } from './smsUtils'; // your parser
import { getMonthKey } from './smsUtils';

type RawSms = {
    _id: string; // message id
    address: string; // sender
    body: string;
    date: string; // milliseconds since epoch (string)
    thread_id?: string;
    type?: string;
};

export function readSmsInbox(
    onSuccess: (parsed: ReturnType<typeof parseSmsMessage>[]) => void,
    onError?: (err: any) => void
) {
    // Example filter: fetch inbox, maxCount 500
    const filter = {
        box: 'inbox',
        maxCount: 500,
    };

    SmsAndroid.list(
        JSON.stringify(filter),
        (fail: any) => {
            console.log('Failed to fetch sms: ', fail);
            onError?.(fail);
        },
        (count: number, smsList: string) => {
            try {
                const messages: RawSms[] = JSON.parse(smsList || '[]');
                const parsed: ReturnType<typeof parseSmsMessage>[] = [];

                messages.forEach((m) => {
                    // `m.date` is epoch millis string — convert to ISO
                    const isoDate = new Date(Number(m.date)).toISOString();
                    const p = parseSmsMessage(m.body, m.address ?? 'unknown', isoDate);
                    if (p) parsed.push(p);
                });

                onSuccess(parsed);
            } catch (e) {
                console.error('sms parse error', e);
                onError?.(e);
            }
        }
    );
}
