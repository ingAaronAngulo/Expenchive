import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { recordPayment } from '@/services/loans.service';
import { formatCurrency } from '@/utils/formatters';
import type { Loan } from '@/types';
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

interface RecordPaymentDialogProps {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordPaymentDialog({ loan, open, onOpenChange }: RecordPaymentDialogProps) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const paymentFormSchema = z.object({
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: t('loanDialog.errors.amountPositive'),
    }),
    date: z.string().min(1, t('loanDialog.errors.dateRequired')),
    note: z.string().optional(),
  });

  type PaymentFormData = z.infer<typeof paymentFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    if (!user || !loan) return;
    const paymentAmount = Number(data.amount);
    if (paymentAmount > loan.remainingAmount) {
      setError(`Payment cannot exceed remaining amount of ${formatCurrency(loan.remainingAmount, loan.currency)}`);
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await recordPayment(user.uid, loan.id, loan.remainingAmount, {
        amount: paymentAmount,
        date: new Date(data.date),
        note: data.note || null,
      });
      reset();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t('loanDialog.errors.failedPayment'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) { reset(); setError(null); }
    onOpenChange(newOpen);
  };

  if (!loan) return null;

  const description = loan.direction === 'lent'
    ? t('loanDialog.payingBack', { name: loan.personName })
    : t('loanDialog.youPayingBack', { name: loan.personName });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('loanDialog.recordTitle')}</DialogTitle>
          <DialogDescription>
            {description}{' — '}{t('loanDialog.remaining')} {formatCurrency(loan.remainingAmount, loan.currency)}
          </DialogDescription>
        </DialogHeader>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payAmount">{t('loanDialog.paymentAmount')}</Label>
            <Input
              id="payAmount"
              type="number"
              step="0.01"
              placeholder={`Max: ${loan.remainingAmount}`}
              {...register('amount')}
            />
            {errors.amount && <p className="text-sm text-red-600">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payDate">{t('form.date')}</Label>
            <Input id="payDate" type="date" {...register('date')} />
            {errors.date && <p className="text-sm text-red-600">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">{t('form.note')}</Label>
            <Input id="note" placeholder="e.g., partial payment" {...register('note')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.recording') : t('loanDialog.recordButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
