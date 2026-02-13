import { z } from 'zod';

/**
 * Zod schema for validating credit card data before saving to Firestore
 */

export const createCreditCardSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  lastFourDigits: z.string()
    .regex(/^\d{4}$/, 'Must be exactly 4 digits')
    .optional(),
  creditLimit: z.number()
    .positive('Credit limit must be positive')
    .finite('Credit limit must be a valid number'),
  currentBalance: z.number()
    .min(0, 'Current balance cannot be negative')
    .finite('Current balance must be a valid number')
    .default(0),
  interestRate: z.number()
    .min(0, 'Interest rate cannot be negative')
    .max(100, 'Interest rate cannot exceed 100%')
    .nullable()
    .optional(),
  billingCycleDay: z.number()
    .int('Billing cycle day must be an integer')
    .min(1, 'Billing cycle day must be between 1 and 31')
    .max(31, 'Billing cycle day must be between 1 and 31')
    .nullable()
    .optional(),
  paymentDueDay: z.number()
    .int('Payment due day must be an integer')
    .min(1, 'Payment due day must be between 1 and 31')
    .max(31, 'Payment due day must be between 1 and 31')
    .nullable()
    .optional(),
}).refine(
  (data) => {
    // Current balance should not exceed credit limit
    if (data.creditLimit && data.currentBalance > data.creditLimit) {
      return false;
    }
    return true;
  },
  {
    message: 'Current balance cannot exceed credit limit',
  }
);

export const updateCreditCardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  lastFourDigits: z.string().regex(/^\d{4}$/).optional(),
  creditLimit: z.number().positive().finite().optional(),
  currentBalance: z.number().min(0).finite().optional(),
  interestRate: z.number().min(0).max(100).nullable().optional(),
  billingCycleDay: z.number().int().min(1).max(31).nullable().optional(),
  paymentDueDay: z.number().int().min(1).max(31).nullable().optional(),
});

export type CreateCreditCardInput = z.infer<typeof createCreditCardSchema>;
export type UpdateCreditCardInput = z.infer<typeof updateCreditCardSchema>;
