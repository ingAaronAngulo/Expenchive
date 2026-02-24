import { Timestamp } from 'firebase/firestore';

export type LoanDirection = 'lent' | 'borrowed';

export interface Loan {
  id: string;
  userId: string;
  direction: LoanDirection;
  personName: string;
  amount: number;
  remainingAmount: number;
  currency: string;
  accountId: string;
  description: string | null;
  clabe: string | null;
  date: Timestamp;
  dueDate: Timestamp | null;
  isPaid: boolean;
  includeInDashboard: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  userId: string;
  amount: number;
  date: Timestamp;
  note: string | null;
  createdAt: Timestamp;
}

export interface CreateLoanData {
  direction: LoanDirection;
  personName: string;
  amount: number;
  currency: string;
  accountId: string;
  description?: string | null;
  clabe?: string | null;
  date: Date;
  dueDate?: Date | null;
  includeInDashboard: boolean;
}

export interface UpdateLoanData {
  personName: string;
  amount: number;
  description?: string | null;
  clabe?: string | null;
  date: Date;
  dueDate?: Date | null;
  includeInDashboard: boolean;
}

export interface RecordPaymentData {
  amount: number;
  date: Date;
  note?: string | null;
}
