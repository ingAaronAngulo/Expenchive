import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { createCreditCard } from '@/services/credit-cards.service';
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

interface AddCreditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCreditCardDialog({ open, onOpenChange }: AddCreditCardDialogProps) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const creditCardSchema = z.object({
    name: z.string().min(1, t('creditCardDialog.errors.cardRequired')),
    creditLimit: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: t('creditCardDialog.errors.creditLimit'),
    }),
    currentBalance: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: t('creditCardDialog.errors.balance'),
    }).optional(),
    lastFourDigits: z.string().optional(),
    clabe: z.string().refine((val) => val === '' || /^\d{18}$/.test(val), {
      message: t('creditCardDialog.errors.clabe'),
    }).optional(),
    billingCycleDay: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 31), {
      message: t('creditCardDialog.errors.billingCycle'),
    }).optional(),
    paymentDueDay: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 31), {
      message: t('creditCardDialog.errors.paymentDue'),
    }).optional(),
    interestRate: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100), {
      message: t('creditCardDialog.errors.interestRate'),
    }).optional(),
  });

  type CreditCardFormData = z.infer<typeof creditCardSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: { name: '', creditLimit: '', currentBalance: '', lastFourDigits: '', clabe: '', billingCycleDay: '', paymentDueDay: '', interestRate: '' },
  });

  const onSubmit = async (data: CreditCardFormData) => {
    if (!user) return;
    try {
      setError(null);
      setLoading(true);
      await createCreditCard(user.uid, {
        name: data.name,
        creditLimit: data.creditLimit ? Number(data.creditLimit) : null,
        currentBalance: data.currentBalance ? Number(data.currentBalance) : 0,
        lastFourDigits: data.lastFourDigits || null,
        clabe: data.clabe || null,
        billingCycleDay: data.billingCycleDay ? Number(data.billingCycleDay) : null,
        paymentDueDay: data.paymentDueDay ? Number(data.paymentDueDay) : null,
        interestRate: data.interestRate ? Number(data.interestRate) : null,
      });
      reset();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t('creditCardDialog.errors.failedCreate'));
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
          <DialogTitle>{t('creditCardDialog.addTitle')}</DialogTitle>
          <DialogDescription>{t('creditCardDialog.addDescription')}</DialogDescription>
        </DialogHeader>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('creditCardDialog.cardName')}</Label>
            <Input id="name" placeholder="e.g., Chase Sapphire" {...register('name')} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="creditLimit">{t('creditCardDialog.creditLimit')}</Label>
            <Input id="creditLimit" type="number" step="0.01" placeholder="e.g., 5000" {...register('creditLimit')} />
            {errors.creditLimit && <p className="text-sm text-red-600">{errors.creditLimit.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentBalance">{t('creditCardDialog.currentBalance')}</Label>
            <Input id="currentBalance" type="number" step="0.01" placeholder="e.g., 0" {...register('currentBalance')} />
            {errors.currentBalance && <p className="text-sm text-red-600">{errors.currentBalance.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastFourDigits">{t('form.lastFourDigits')}</Label>
            <Input id="lastFourDigits" maxLength={4} placeholder="e.g., 1234" {...register('lastFourDigits')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clabe">{t('form.clabe')}</Label>
            <Input id="clabe" placeholder={t('form.clabe18Digits')} {...register('clabe')} maxLength={18} />
            <p className="text-xs text-muted-foreground">{t('form.clabeHint')}</p>
            {errors.clabe && <p className="text-sm text-red-600">{errors.clabe.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingCycleDay">{t('creditCardDialog.billingCycleDay')}</Label>
            <Input id="billingCycleDay" type="number" min="1" max="31" placeholder={t('creditCardDialog.billingCyclePlaceholder')} {...register('billingCycleDay')} />
            {errors.billingCycleDay && <p className="text-sm text-red-600">{errors.billingCycleDay.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDueDay">{t('creditCardDialog.paymentDueDay')}</Label>
            <Input id="paymentDueDay" type="number" min="1" max="31" placeholder={t('creditCardDialog.paymentDuePlaceholder')} {...register('paymentDueDay')} />
            {errors.paymentDueDay && <p className="text-sm text-red-600">{errors.paymentDueDay.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">{t('creditCardDialog.interestRate')}</Label>
            <Input id="interestRate" type="number" step="0.01" min="0" max="100" placeholder="e.g., 18.99" {...register('interestRate')} />
            {errors.interestRate && <p className="text-sm text-red-600">{errors.interestRate.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.adding') : t('creditCardDialog.addButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
