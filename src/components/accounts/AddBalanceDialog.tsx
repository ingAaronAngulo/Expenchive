import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateAccountBalance } from '@/services/accounts.service';
import type { Account } from '@/types';
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
import { ErrorMessage } from '@/components/common/ErrorMessage';

const balanceSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) !== 0, {
    message: 'Amount must be a non-zero number',
  }),
});

type BalanceFormData = z.infer<typeof balanceSchema>;

interface AddBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
}

export function AddBalanceDialog({
  open,
  onOpenChange,
  account,
}: AddBalanceDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BalanceFormData>({
    resolver: zodResolver(balanceSchema),
  });

  const onSubmit = async (data: BalanceFormData) => {
    if (!account) return;

    try {
      setError(null);
      setLoading(true);

      const amount = Number(data.amount);
      const newBalance = account.balance + amount;

      await updateAccountBalance(account.id, newBalance);

      onOpenChange(false);
      reset();
    } catch (err: any) {
      setError(err.message || 'Failed to update account balance');
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Balance</DialogTitle>
          <DialogDescription>
            Add or subtract an amount to {account?.name}. Use a negative number to subtract.
          </DialogDescription>
        </DialogHeader>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="e.g., 100 or -50"
              {...register('amount')}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Enter a positive number to add or a negative number to subtract
            </p>
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {account && (
            <div className="rounded-lg bg-muted p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current balance:</span>
                <span className="font-medium">{account.balance.toFixed(2)} {account.currency}</span>
              </div>
            </div>
          )}

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
              {loading ? 'Updating...' : 'Update Balance'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
