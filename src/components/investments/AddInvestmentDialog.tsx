import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { createInvestment } from '@/services/investments.service';
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

interface AddInvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddInvestmentDialog({ open, onOpenChange }: AddInvestmentDialogProps) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const investmentSchema = z.object({
    name: z.string().min(1, t('investmentDialog.errors.nameRequired')),
    currentAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: t('investmentDialog.errors.amountPositive'),
    }),
    annualReturnPercentage: z.string().refine((val) => !isNaN(Number(val)), {
      message: t('investmentDialog.errors.returnNumber'),
    }),
  });

  type InvestmentFormData = z.infer<typeof investmentSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: { name: '', currentAmount: '', annualReturnPercentage: '' },
  });

  const onSubmit = async (data: InvestmentFormData) => {
    if (!user) return;
    try {
      setError(null);
      setLoading(true);
      await createInvestment(user.uid, {
        name: data.name,
        currentAmount: Number(data.currentAmount),
        annualReturnPercentage: Number(data.annualReturnPercentage),
      });
      reset();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t('investmentDialog.errors.failedCreate'));
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
          <DialogTitle>{t('investmentDialog.addTitle')}</DialogTitle>
          <DialogDescription>{t('investmentDialog.addDescription')}</DialogDescription>
        </DialogHeader>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('investmentDialog.investmentName')}</Label>
            <Input id="name" placeholder="e.g., Vanguard Index Fund" {...register('name')} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentAmount">{t('investmentDialog.currentAmount')}</Label>
            <Input id="currentAmount" type="number" step="0.01" placeholder="10000.00" {...register('currentAmount')} />
            {errors.currentAmount && <p className="text-sm text-red-600">{errors.currentAmount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualReturnPercentage">{t('investmentDialog.annualReturn')}</Label>
            <Input id="annualReturnPercentage" type="number" step="0.01" placeholder="e.g., 7.5" {...register('annualReturnPercentage')} />
            {errors.annualReturnPercentage && <p className="text-sm text-red-600">{errors.annualReturnPercentage.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.adding') : t('investmentDialog.addButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
