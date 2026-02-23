import type { Timestamp } from 'firebase/firestore';
import type { CategoryBreakdown } from '@/utils/calculations';

export interface DashboardSnapshot {
  id: string;
  userId: string;
  createdAt: Timestamp;
  totalMoney: number;
  totalDebt: number;
  netWorth: number;
  totalLent: number;
  totalBorrowed: number;
  categoryBreakdown: CategoryBreakdown[];
}

export type CreateSnapshotData = Omit<DashboardSnapshot, 'id' | 'createdAt'>;
