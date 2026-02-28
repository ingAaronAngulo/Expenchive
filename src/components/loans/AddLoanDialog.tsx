import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useAccounts } from '@/hooks/useAccounts';
import { createLoan } from '@/services/loans.service';
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
import { Switch } from '@/components/ui/switch';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useTranslation } from 'react-i18next';

interface AddLoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLoanDialog({ open, onOpenChange }: AddLoanDialogProps) {
  const { user } = useAuth();
  const { accounts } = useAccounts();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const loanFormSchema = z.object({
    direction: z.enum(['lent', 'borrowed']),
    personName: z.string().min(1, t('loanDialog.errors.personRequired')),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: t('loanDialog.errors.amountPositive'),
    }),
    accountId: z.string().min(1, t('loanDialog.errors.accountRequired')),
    description: z.string().optional(),
    clabe: z
      .string()
      .regex(/^\d{18}$/, t('loanDialog.errors.clabeDigits'))
      .or(z.literal(''))
      .optional(),
    date: z.string().min(1, t('loanDialog.errors.dateRequired')),
    dueDate: z.string().optional(),
    includeInDashboard: z.boolean(),
  });

  type LoanFormData = z.infer<typeof loanFormSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      direction: 'lent',
      personName: '',
      amount: '',
      accountId: '',
      description: '',
      clabe: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      includeInDashboard: true,
    },
  });

  const includeInDashboard = watch('includeInDashboard');
  const direction = watch('direction');

  const onSubmit = async (data: LoanFormData) => {
    if (!user) return;
    try {
      setError(null);
      setLoading(true);
      await createLoan(user.uid, {
        direction: data.direction,
        personName: data.personName,
        amount: Number(data.amount),
        currency: accounts.find((a) => a.id === data.accountId)?.currency ?? 'USD',
        accountId: data.accountId,
        description: data.description || null,
        clabe: data.clabe || null,
        date: new Date(data.date),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        includeInDashboard: data.includeInDashboard,
      });
      reset();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t('loanDialog.errors.failedCreate'));
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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('loanDialog.addTitle')}</DialogTitle>
          <DialogDescription>{t('loanDialog.addDescription')}</DialogDescription>
        </DialogHeader>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('loanDialog.direction')}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={direction === 'lent' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setValue('direction', 'lent')}
              >
                {t('loanDialog.lentMoney')}
              </Button>
              <Button
                type="button"
                variant={direction === 'borrowed' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setValue('direction', 'borrowed')}
              >
                {t('loanDialog.borrowedMoney')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personName">
              {direction === 'lent' ? t('loanDialog.borrowerName') : t('loanDialog.lenderName')}
            </Label>
            <Input id="personName" placeholder="e.g., John Doe" {...register('personName')} />
            {errors.personName && <p className="text-sm text-red-600">{errors.personName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{t('form.amount')}</Label>
            <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register('amount')} />
            {errors.amount && <p className="text-sm text-red-600">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountId">{t('form.account')}</Label>
            <select
              id="accountId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('accountId')}
            >
              <option value="">{t('form.selectAccount')}</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
            {errors.accountId && <p className="text-sm text-red-600">{errors.accountId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">{t('form.date')}</Label>
            <Input id="date" type="date" {...register('date')} />
            {errors.date && <p className="text-sm text-red-600">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">{t('form.dueDate')}</Label>
            <Input id="dueDate" type="date" {...register('dueDate')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('form.description')}</Label>
            <Input id="description" placeholder="What was this loan for?" {...register('description')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clabe">{t('form.clabe')}</Label>
            <Input id="clabe" placeholder={t('form.clabe18Digits')} maxLength={18} {...register('clabe')} />
            {errors.clabe && <p className="text-sm text-red-600">{errors.clabe.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="includeInDashboard">{t('loanDialog.includeInDashboard')}</Label>
              <p className="text-xs text-muted-foreground">
                {direction === 'lent' ? t('loanDialog.lentAsset') : t('loanDialog.borrowedDebt')}
              </p>
            </div>
            <Switch
              id="includeInDashboard"
              checked={includeInDashboard}
              onCheckedChange={(checked) => setValue('includeInDashboard', checked)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.adding') : t('loanDialog.addButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
