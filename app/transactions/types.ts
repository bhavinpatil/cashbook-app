// app/transactions/types.ts

export interface Transaction {
  id: string;
  bookId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string; // ISO string
  category?: string;
  images?: string[];
}
