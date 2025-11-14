// utils/smsUtils.ts
import { SmsTransaction } from '@/types/sms';

export const getMonthKey = (date = new Date()): string => {
  return `${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const parseSmsMessage = (
  msg: string,
  sender: string,
  date: string
): SmsTransaction | null => {
  const text = msg.replace(/\s+/g, ' ').trim();

  // Extract amount token (supports ₹, Rs, INR etc)
  const amountMatch = msg.match(/(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.\d{1,2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

  // Detect transaction type
  let type: 'Credit' | 'Debit' | 'Unknown' = 'Unknown';
  if (/credited|received|transfer from|added/i.test(msg)) type = 'Credit';
  else if (/debited|sent via upi|trf to|withdrawn|payment/i.test(msg)) type = 'Debit';

  if (!amount || type === 'Unknown') return null;

  const category = autoDetectCategory(msg) ?? undefined;

  return {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    sender,
    message: text,
    date,
    amount,
    type,
    category,
    labeled: !!category,
  };
};

export const autoDetectCategory = (msg: string): string | undefined => {
  const text = msg.toLowerCase();

  if (/hp|petrol|diesel|pump/i.test(text)) return 'Fuel';
  if (/pizza|food|restaurant|swiggy|zomato/i.test(text)) return 'Food';
  if (/spotify|subscription|music|netflix|prime/i.test(text)) return 'Entertainment';
  if (/upi|trf|sent via upi|to [a-z]/i.test(text)) return 'UPI Transfer';
  if (/salary|credited|income|transfer from/i.test(text)) return 'Income';
  if (/bill|electricity|payment|broadband|water/i.test(text)) return 'Bills';
  if (/shopping|amazon|flipkart|purchase/i.test(text)) return 'Shopping';

  return undefined;
};
