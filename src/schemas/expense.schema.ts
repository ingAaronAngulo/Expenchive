import { z } from 'zod';

/**
 * Zod schema for validating expense data before saving to Firestore
 * Ensures data integrity and prevents invalid data from entering the database
 */

export const createExpenseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  amount: z.number().positive('Amount must be positive').finite(),
  category: z.string().min(1, 'Category is required'),
  date: z.union([z.date(), z.instanceof(Object)]), // Date or Firestore Timestamp
  paymentType: z.enum(['debit', 'credit'], {
    message: 'Payment type must be debit or credit',
  }),

  // Optional fields
  accountId: z.string().nullable().optional(),
  creditCardId: z.string().nullable().optional(),
  isInstallment: z.boolean().optional().default(false),
  installmentMonths: z.number().int().positive().nullable().optional(),
  isFromRecurring: z.boolean().optional().default(false),
  recurringExpenseId: z.string().nullable().optional(),
}).refine(
  (data) => {
    // If debit payment, must have accountId
    if (data.paymentType === 'debit' && !data.accountId) {
      return false;
    }
    // If credit payment, must have creditCardId
    if (data.paymentType === 'credit' && !data.creditCardId) {
      return false;
    }
    return true;
  },
  {
    message: 'Debit payments require accountId, credit payments require creditCardId',
  }
).refine(
  (data) => {
    // If installment, must have installmentMonths
    if (data.isInstallment && (!data.installmentMonths || data.installmentMonths < 2)) {
      return false;
    }
    return true;
  },
  {
    message: 'Installment payments require installmentMonths >= 2',
  }
);

export const updateExpenseSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  amount: z.number().positive().finite().optional(),
  category: z.string().min(1).optional(),
  date: z.union([z.date(), z.instanceof(Object)]).optional(),
  paymentType: z.enum(['debit', 'credit']).optional(),
  accountId: z.string().nullable().optional(),
  creditCardId: z.string().nullable().optional(),
  isInstallment: z.boolean().optional(),
  installmentMonths: z.number().int().positive().nullable().optional(),
  installmentMonthsPaid: z.number().int().min(0).optional(),
  remainingDebt: z.number().min(0).finite().optional(),
  isFullyPaid: z.boolean().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
