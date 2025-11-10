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
  amount: number;
  date: string;
  type: 'credit' | 'debit';
  category?: string;
  description?: string;
  images?: string[];
  investmentType?: string; // 🆕
}


