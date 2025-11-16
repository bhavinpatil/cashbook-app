export interface SmsTransaction {
  id: string;
  sender: string;
  message: string;
  date: string; // ISO format
  amount: number;
  type: 'Credit' | 'Debit' | 'Unknown';
  category?: string;
  labeled?: boolean;
}

export interface SmsMonthData {
  monthKey: string; // e.g. "2025_11"
  transactions: SmsTransaction[];
}
