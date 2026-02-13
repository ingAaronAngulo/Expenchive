import type { Timestamp } from 'firebase/firestore';
import type { PaymentType } from './expense.types';

export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringExpense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  frequency: FrequencyType;
  paymentType: PaymentType;
  accountId: string | null;
  creditCardId: string | null;
  isInstallment: boolean;
  installmentMonths: number | null;

  startDate: Timestamp;
  nextDueDate: Timestamp;
  endDate: Timestamp | null;
  isActive: boolean;

  lastCreatedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateRecurringExpenseData {
  name: string;
  amount: number;
  category: string;
  frequency: FrequencyType;
  paymentType: PaymentType;
  accountId?: string | null;
  creditCardId?: string | null;
  isInstallment?: boolean;
  installmentMonths?: number | null;
  startDate: Date | Timestamp;
  endDate?: Date | Timestamp | null;
}

export interface UpdateRecurringExpenseData {
  name?: string;
  amount?: number;
  category?: string;
  frequency?: FrequencyType;
  paymentType?: PaymentType;
  accountId?: string | null;
  creditCardId?: string | null;
  isInstallment?: boolean;
  installmentMonths?: number | null;
  startDate?: Date | Timestamp;
  nextDueDate?: Date | Timestamp;
  endDate?: Date | Timestamp | null;
  isActive?: boolean;
  lastCreatedAt?: Date | Timestamp | null;
}
