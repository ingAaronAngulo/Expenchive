import { z } from 'zod';

/**
 * Zod schema for validating account data before saving to Firestore
 */

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  type: z.enum(['checking', 'savings', 'investment', 'cash'], {
    message: 'Invalid account type',
  }),
  balance: z.number().finite('Balance must be a valid number'),
  currency: z.string().length(3, 'Currency must be 3 characters (e.g., USD)').optional(),
  annualReturn: z.number()
    .min(0, 'Annual return cannot be negative')
    .max(100, 'Annual return cannot exceed 100%')
    .nullable()
    .optional(),
}).refine(
  (data) => {
    // Investment accounts should have annualReturn
    if (data.type === 'investment' && data.annualReturn === null) {
      return false;
    }
    return true;
  },
  {
    message: 'Investment accounts should specify an annual return',
  }
);

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['checking', 'savings', 'investment', 'cash']).optional(),
  balance: z.number().finite().optional(),
  currency: z.string().length(3).optional(),
  annualReturn: z.number().min(0).max(100).nullable().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
