import { Timestamp } from 'firebase/firestore';

export type AccountType = 'checking' | 'savings' | 'cash' | 'other';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  lastFourDigits?: string | null;
  clabe?: string | null;
  annualReturn?: number | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateAccountData {
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  lastFourDigits?: string | null;
  clabe?: string | null;
  annualReturn?: number | null;
}

export interface UpdateAccountData {
  name?: string;
  type?: AccountType;
  balance?: number;
  currency?: string;
  lastFourDigits?: string | null;
  clabe?: string | null;
  annualReturn?: number | null;
}
