import { z } from 'zod';

/**
 * Zod schema for validating investment data before saving to Firestore
 */

export const createInvestmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  currentAmount: z.number()
    .positive('Current amount must be positive')
    .finite('Current amount must be a valid number'),
  annualReturnPercentage: z.number()
    .min(-100, 'Annual return cannot be less than -100%')
    .max(1000, 'Annual return seems unrealistic')
    .finite('Annual return must be a valid number'),
});

export const updateInvestmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  currentAmount: z.number().positive().finite().optional(),
  annualReturnPercentage: z.number().min(-100).max(1000).finite().optional(),
  expectedReturn: z.number().finite().optional(),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
export type UpdateInvestmentInput = z.infer<typeof updateInvestmentSchema>;
