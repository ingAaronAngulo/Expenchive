import { Timestamp } from 'firebase/firestore';

export type PaymentType = 'debit' | 'credit';

export interface Expense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  date: Timestamp;
  paymentType: PaymentType;

  // Debit fields
  accountId: string | null;

  // Credit fields
  creditCardId: string | null;
  isInstallment: boolean;
  installmentMonths: number | null;
  installmentMonthsPaid: number;
  monthlyPayment: number | null;
  installmentStartDate: Timestamp | null;
  remainingDebt: number;
  isFullyPaid: boolean;

  // Recurring metadata
  isFromRecurring: boolean;
  recurringExpenseId: string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateExpenseData {
  name: string;
  amount: number;
  category: string;
  date: Date | Timestamp;
  paymentType: PaymentType;
  accountId?: string | null;
  creditCardId?: string | null;
  isInstallment?: boolean;
  installmentMonths?: number | null;
  isFromRecurring?: boolean;
  recurringExpenseId?: string | null;
}

export interface UpdateExpenseData {
  name?: string;
  amount?: number;
  category?: string;
  date?: Date | Timestamp;
  paymentType?: PaymentType;
  accountId?: string | null;
  creditCardId?: string | null;
  isInstallment?: boolean;
  installmentMonths?: number | null;
  installmentMonthsPaid?: number;
  remainingDebt?: number;
  isFullyPaid?: boolean;
}
