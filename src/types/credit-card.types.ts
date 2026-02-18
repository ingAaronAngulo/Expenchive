import { Timestamp } from 'firebase/firestore';

export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  creditLimit: number | null;
  currentBalance: number;
  lastFourDigits: string | null;
  clabe?: string | null;
  billingCycleDay: number | null; // Day of month when statement closes (1-31)
  paymentDueDay: number | null; // Day of month when payment is due (1-31)
  interestRate: number | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateCreditCardData {
  name: string;
  creditLimit?: number | null;
  currentBalance?: number;
  lastFourDigits?: string | null;
  clabe?: string | null;
  billingCycleDay?: number | null;
  paymentDueDay?: number | null;
  interestRate?: number | null;
}

export interface UpdateCreditCardData {
  name?: string;
  creditLimit?: number | null;
  currentBalance?: number;
  lastFourDigits?: string | null;
  clabe?: string | null;
  billingCycleDay?: number | null;
  paymentDueDay?: number | null;
  interestRate?: number | null;
}
