// app/types/types.ts

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
