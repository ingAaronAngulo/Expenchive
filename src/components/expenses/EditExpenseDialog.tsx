import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAccounts } from '@/hooks/useAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import { updateExpense } from '@/services/expenses.service';
import { ALL_CATEGORIES } from '@/utils/constants';
import type { Expense } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorMessage } from '@/components/common/ErrorMessage';

const expenseSchema = z.object({
  name: z.string().min(1, 'Expense name is required'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  paymentType: z.enum(['debit', 'credit']),
  accountId: z.string().optional(),
  creditCardId: z.string().optional(),
}).refine(
  (data) => {
    if (data.paymentType === 'debit' && !data.accountId) return false;
    if (data.paymentType === 'credit' && !data.creditCardId) return false;
    return true;
  },
  {
    message: 'Please select an account or credit card',
    path: ['accountId'],
  }
);

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface EditExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
}

export function EditExpenseDialog({ open, onOpenChange, expense }: EditExpenseDialogProps) {
  const { accounts } = useAccounts();
  const { creditCards } = useCreditCards();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  });

  const paymentType = watch('paymentType');
  const category = watch('category');
  const accountId = watch('accountId');
  const creditCardId = watch('creditCardId');

  useEffect(() => {
    if (expense) {
      setValue('name', expense.name);
      setValue('amount', expense.amount.toString());
      setValue('category', expense.category);
      setValue('date', expense.date.toDate().toISOString().split('T')[0]);
      setValue('paymentType', expense.paymentType);
      setValue('accountId', expense.accountId || '');
      setValue('creditCardId', expense.creditCardId || '');
    }
  }, [expense, setValue]);

  const onSubmit = async (data: ExpenseFormData) => {
    if (!expense) return;

    try {
      setError(null);
      setLoading(true);

      await updateExpense(expense.id, {
        name: data.name,
        amount: Number(data.amount),
        category: data.category,
        date: new Date(data.date),
        paymentType: data.paymentType,
        accountId: data.paymentType === 'debit' ? data.accountId : null,
        creditCardId: data.paymentType === 'credit' ? data.creditCardId : null,
      });

      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>
            Update your expense information.
          </DialogDescription>
        </DialogHeader>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Expense Name</Label>
              <Input
                id="name"
                placeholder="e.g., Grocery Shopping"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount')}
              />
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select
                value={paymentType}
                onValueChange={(value) => setValue('paymentType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Debit (Pay Now)</SelectItem>
                  <SelectItem value="credit">Credit (Pay Later)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentType === 'debit' && (
              <div className="col-span-2 space-y-2">
                <Label htmlFor="accountId">Account</Label>
                <Select value={accountId} onValueChange={(value) => setValue('accountId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - ${account.balance.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.accountId && (
                  <p className="text-sm text-red-600">{errors.accountId.message}</p>
                )}
              </div>
            )}

            {paymentType === 'credit' && (
              <div className="col-span-2 space-y-2">
                <Label htmlFor="creditCardId">Credit Card</Label>
                <Select
                  value={creditCardId}
                  onValueChange={(value) => setValue('creditCardId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select credit card" />
                  </SelectTrigger>
                  <SelectContent>
                    {creditCards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.creditCardId && (
                  <p className="text-sm text-red-600">{errors.creditCardId.message}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
