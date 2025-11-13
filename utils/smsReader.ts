// utils/smsReader.ts
import SmsAndroid from 'react-native-get-sms-android';
import { parseSmsMessage } from './smsUtils'; // your parser

type RawSms = {
    _id: string;
    address?: string;
    body: string;
    date: string;
    thread_id?: string;
    type?: string;
};

/**
 * readRawSmsInbox:
 *  - reads SMS using react-native-get-sms-android and returns raw list (unparsed)
 *  - callback receives RawSms[]
 */
export function readRawSmsInbox(
    onSuccess: (raw: RawSms[]) => void,
    onError?: (err: any) => void,
    maxCount = 500
) {
    const filter = {
        box: 'inbox',
        maxCount,
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
                onSuccess(messages);
            } catch (e) {
                console.error('sms parse error', e);
                onError?.(e);
            }
        }
    );
}

/**
 * readSmsInbox:
 *  - backwards compatible helper that returns parsed transactions (used earlier)
 */
export function readSmsInbox(
    onSuccess: (parsed: ReturnType<typeof parseSmsMessage>[]) => void,
    onError?: (err: any) => void,
    maxCount = 500
) {
    readRawSmsInbox(
        (raw) => {
            try {
                const parsed: ReturnType<typeof parseSmsMessage>[] = [];
                raw.forEach((m) => {
                    const isoDate = new Date(Number(m.date)).toISOString();
                    const p = parseSmsMessage(m.body, m.address ?? 'unknown', isoDate);
                    if (p) parsed.push(p);
                });
                onSuccess(parsed);
            } catch (e) {
                onError?.(e);
            }
        },
        (err) => onError?.(err),
        maxCount
    );
}
