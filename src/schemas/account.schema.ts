import { z } from 'zod';

/**
 * Zod schema for validating account data before saving to Firestore
 */

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  type: z.enum(['checking', 'savings', 'cash', 'other'], {
    message: 'Invalid account type',
  }),
  balance: z.number().finite('Balance must be a valid number'),
  currency: z.string().length(3, 'Currency must be 3 characters (e.g., USD)').optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color').optional(),
  lastFourDigits: z.string()
    .regex(/^\d{4}$/, 'Must be exactly 4 digits')
    .nullable()
    .optional(),
  clabe: z.string()
    .regex(/^\d{18}$/, 'CLABE must be exactly 18 digits')
    .nullable()
    .optional(),
  annualReturn: z.number()
    .min(-100, 'Annual return cannot be less than -100%')
    .max(100, 'Annual return cannot exceed 100%')
    .nullable()
    .optional(),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['checking', 'savings', 'cash', 'other']).optional(),
  balance: z.number().finite().optional(),
  currency: z.string().length(3).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  lastFourDigits: z.string().regex(/^\d{4}$/).nullable().optional(),
  clabe: z.string().regex(/^\d{18}$/).nullable().optional(),
  annualReturn: z.number().min(-100).max(100).nullable().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
