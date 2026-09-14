import { Timestamp } from 'firebase/firestore';

export type FavoritePaymentMethod =
  | { type: 'debit'; accountId: string }
  | { type: 'credit'; creditCardId: string };

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  favoritePaymentMethod?: FavoritePaymentMethod | null;
  expenseCategories?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
