import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { recordLoanAddition } from '@/services/loans.service';
import type { Loan } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useTranslation } from 'react-i18next';

interface RecordLoanAdditionDialogProps {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordLoanAdditionDialog({ loan, open, onOpenChange }: RecordLoanAdditionDialogProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const schema = z.object({
    amount: z.string().refine((value) => !isNaN(Number(value)) && Number(value) > 0, { message: t('loanDialog.errors.amountPositive') }),
    date: z.string().min(1, t('loanDialog.errors.dateRequired')),
    description: z.string().optional(),
  });
  type FormData = z.infer<typeof schema>;
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', date: new Date().toISOString().split('T')[0], description: '' },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) { reset(); setError(null); }
    onOpenChange(newOpen);
  };
  const onSubmit = async (data: FormData) => {
    if (!loan || !user) return;
    try {
      setError(null);
      setLoading(true);
      await recordLoanAddition(user.uid, loan.id, {
        amount: Number(data.amount), date: new Date(data.date), description: data.description || null,
      });
      handleOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('loanDialog.errors.failedAddition'));
    } finally {
      setLoading(false);
    }
  };
  if (!loan) return null;
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('loanDialog.addAmountTitle')}</DialogTitle>
          <DialogDescription>{t('loanDialog.addAmountDescription', { name: loan.personName })}</DialogDescription>
        </DialogHeader>
        {error && <ErrorMessage message={error} />}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="additionAmount">{t('form.amount')}</Label><Input id="additionAmount" type="number" step="0.01" autoFocus {...register('amount')} />{errors.amount && <p className="text-sm text-red-600">{errors.amount.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="additionDate">{t('form.date')}</Label><Input id="additionDate" type="date" {...register('date')} />{errors.date && <p className="text-sm text-red-600">{errors.date.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="additionDescription">{t('form.description')}</Label><Input id="additionDescription" {...register('description')} /></div>
          <DialogFooter><Button type="button" variant="outline" disabled={loading} onClick={() => handleOpenChange(false)}>{t('common.cancel')}</Button><Button type="submit" disabled={loading}>{loading ? t('common.adding') : t('loanDialog.addAmountButton')}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
