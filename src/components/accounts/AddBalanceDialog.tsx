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
import { useTranslation } from 'react-i18next';

interface AddBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
}

export function AddBalanceDialog({ open, onOpenChange, account }: AddBalanceDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const balanceSchema = z.object({
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) !== 0, {
      message: t('accountDialog.errors.amountNonZero'),
    }),
  });

  type BalanceFormData = z.infer<typeof balanceSchema>;

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
      setError(err.message || t('accountDialog.errors.failedUpdateBalance'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) { reset(); setError(null); }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('accountDialog.addBalanceTitle')}</DialogTitle>
          <DialogDescription>
            {t('accountDialog.addBalanceDescription', { name: account?.name })}
          </DialogDescription>
        </DialogHeader>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t('form.amount')}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="e.g., 100 or -50"
              {...register('amount')}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">{t('form.addPositiveOrNegative')}</p>
            {errors.amount && <p className="text-sm text-red-600">{errors.amount.message}</p>}
          </div>

          {account && (
            <div className="rounded-lg bg-muted p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('accountDialog.currentBalanceLabel')}</span>
                <span className="font-medium">{account.balance.toFixed(2)} {account.currency}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.updating') : t('accountDialog.updateBalance')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
