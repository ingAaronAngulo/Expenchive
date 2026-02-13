import { z } from 'zod';

/**
 * Zod schema for validating recurring expense data before saving to Firestore
 */

export const createRecurringExpenseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  amount: z.number().positive('Amount must be positive').finite(),
  category: z.string().min(1, 'Category is required'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly'], {
    errorMap: () => ({ message: 'Invalid frequency' }),
  }),
  startDate: z.union([z.date(), z.instanceof(Object)]), // Date or Firestore Timestamp
  paymentType: z.enum(['debit', 'credit'], {
    errorMap: () => ({ message: 'Payment type must be debit or credit' }),
  }),

  // Optional fields
  accountId: z.string().nullable().optional(),
  creditCardId: z.string().nullable().optional(),
  isInstallment: z.boolean().optional().default(false),
  installmentMonths: z.number().int().positive().nullable().optional(),
  endDate: z.union([z.date(), z.instanceof(Object)]).nullable().optional(),
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

export const updateRecurringExpenseSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  amount: z.number().positive().finite().optional(),
  category: z.string().min(1).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  startDate: z.union([z.date(), z.instanceof(Object)]).optional(),
  nextDueDate: z.union([z.date(), z.instanceof(Object)]).optional(),
  paymentType: z.enum(['debit', 'credit']).optional(),
  accountId: z.string().nullable().optional(),
  creditCardId: z.string().nullable().optional(),
  isInstallment: z.boolean().optional(),
  installmentMonths: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  endDate: z.union([z.date(), z.instanceof(Object)]).nullable().optional(),
  lastCreatedAt: z.union([z.date(), z.instanceof(Object)]).nullable().optional(),
});

export type CreateRecurringExpenseInput = z.infer<typeof createRecurringExpenseSchema>;
export type UpdateRecurringExpenseInput = z.infer<typeof updateRecurringExpenseSchema>;
