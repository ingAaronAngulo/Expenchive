import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAccounts } from '@/hooks/useAccounts';
import { payCreditCard } from '@/services/credit-cards.service';
import { formatCurrency } from '@/utils/formatters';
import type { CreditCard } from '@/types';
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
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const paymentSchema = z.object({
  accountId: z.string().min(1, 'Please select an account'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be greater than 0',
  }),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PayCreditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditCard: CreditCard | null;
}

export function PayCreditCardDialog({ open, onOpenChange, creditCard }: PayCreditCardDialogProps) {
  const { accounts, loading: accountsLoading } = useAccounts();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      accountId: '',
      amount: '',
    },
  });

  const selectedAccountId = watch('accountId');
  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);

  const onSubmit = async (data: PaymentFormData) => {
    if (!creditCard) return;

    try {
      setError(null);
      setLoading(true);

      const amount = Number(data.amount);

      await payCreditCard(creditCard.id, data.accountId, amount);

      reset();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
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

  const handlePayFull = () => {
    if (creditCard) {
      setValue('amount', creditCard.currentBalance.toString());
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay Credit Card</DialogTitle>
          <DialogDescription>
            Make a payment to {creditCard?.name}
          </DialogDescription>
        </DialogHeader>

        {accountsLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {error && <ErrorMessage message={error} />}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {creditCard && (
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Balance:</span>
                    <span className="font-semibold text-destructive">
                      {formatCurrency(creditCard.currentBalance)}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="accountId">Pay from Account</Label>
                <Select
                  onValueChange={(value) => setValue('accountId', value)}
                  defaultValue=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No accounts available
                      </div>
                    ) : (
                      accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - {formatCurrency(account.balance, account.currency)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.accountId && (
                  <p className="text-sm text-destructive">{errors.accountId.message}</p>
                )}
                {selectedAccount && selectedAccount.balance === 0 && (
                  <p className="text-sm text-amber-600">Warning: This account has no balance</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="amount">Payment Amount</Label>
                  {creditCard && creditCard.currentBalance > 0 && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={handlePayFull}
                      className="h-auto p-0 text-xs"
                    >
                      Pay full balance
                    </Button>
                  )}
                </div>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 100"
                  {...register('amount')}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
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
                <Button type="submit" disabled={loading || accounts.length === 0}>
                  {loading ? 'Processing...' : 'Make Payment'}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
