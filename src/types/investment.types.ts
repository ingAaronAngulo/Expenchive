import { Timestamp } from 'firebase/firestore';

export interface Investment {
  id: string;
  userId: string;
  name: string;
  currentAmount: number;
  annualReturnPercentage: number;
  expectedReturn: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateInvestmentData {
  name: string;
  currentAmount: number;
  annualReturnPercentage: number;
}

export interface UpdateInvestmentData {
  name?: string;
  currentAmount?: number;
  annualReturnPercentage?: number;
  expectedReturn?: number;
}
