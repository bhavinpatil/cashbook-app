// types/types.ts

export interface Business {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  name: string;
  businessId: string;
  businessName: string; // ✅ make it always a string
}

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

