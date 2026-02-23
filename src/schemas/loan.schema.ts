import { z } from 'zod';

export const createLoanSchema = z.object({
  direction: z.enum(['lent', 'borrowed']),
  personName: z.string().min(1, 'Person name is required').max(100),
  amount: z.number().positive('Amount must be positive').finite(),
  currency: z.string().min(1),
  accountId: z.string().min(1, 'Account is required'),
  description: z.string().nullable().optional(),
  date: z.date(),
  dueDate: z.date().nullable().optional(),
  includeInDashboard: z.boolean(),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be positive').finite(),
  date: z.date(),
  note: z.string().nullable().optional(),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
