import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useAccounts } from '@/hooks/useAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import { createRecurringExpense } from '@/services/recurring-expenses.service';
import { ALL_CATEGORIES, FREQUENCY_OPTIONS } from '@/utils/constants';
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
import { useTranslation } from 'react-i18next';

interface AddRecurringExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRecurringExpenseDialog({ open, onOpenChange }: AddRecurringExpenseDialogProps) {
  const { user } = useAuth();
  const { accounts } = useAccounts();
  const { creditCards } = useCreditCards();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const recurringExpenseSchema = z.object({
    name: z.string().min(1, t('recurringDialog.errors.nameRequired')),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: t('recurringDialog.errors.amountPositive'),
    }),
    category: z.string().min(1, t('recurringDialog.errors.categoryRequired')),
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    startDate: z.string().min(1, t('recurringDialog.errors.startDateRequired')),
    endDate: z.string().optional(),
    paymentType: z.enum(['debit', 'credit']),
    accountId: z.string().optional(),
    creditCardId: z.string().optional(),
    isInstallment: z.boolean(),
    installmentMonths: z.string().optional(),
  }).refine(
    (data) => {
      if (data.paymentType === 'debit' && !data.accountId) return false;
      if (data.paymentType === 'credit' && !data.creditCardId) return false;
      return true;
    },
    { message: t('recurringDialog.errors.selectSource'), path: ['accountId'] }
  );

  type RecurringExpenseFormData = z.infer<typeof recurringExpenseSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RecurringExpenseFormData>({
    resolver: zodResolver(recurringExpenseSchema),
    defaultValues: {
      name: '',
      amount: '',
      category: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      paymentType: 'debit',
      accountId: '',
      creditCardId: '',
      isInstallment: false,
      installmentMonths: '',
    },
  });

  const paymentType = watch('paymentType');
  const isInstallment = watch('isInstallment');
  const frequency = watch('frequency');
  const category = watch('category');
  const accountId = watch('accountId');
  const creditCardId = watch('creditCardId');

  const onSubmit = async (data: RecurringExpenseFormData) => {
    if (!user) return;
    try {
      setError(null);
      setLoading(true);
      await createRecurringExpense(user.uid, {
        name: data.name,
        amount: Number(data.amount),
        category: data.category,
        frequency: data.frequency,
        paymentType: data.paymentType,
        accountId: data.paymentType === 'debit' ? data.accountId : null,
        creditCardId: data.paymentType === 'credit' ? data.creditCardId : null,
        isInstallment: data.paymentType === 'credit' ? data.isInstallment : false,
        installmentMonths:
          data.paymentType === 'credit' && data.isInstallment
            ? Number(data.installmentMonths)
            : null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      });
      reset();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t('recurringDialog.errors.failedCreate'));
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('recurringDialog.addTitle')}</DialogTitle>
          <DialogDescription>{t('recurringDialog.addDescription')}</DialogDescription>
        </DialogHeader>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">{t('recurringDialog.expenseName')}</Label>
              <Input id="name" placeholder="e.g., Netflix Subscription" {...register('name')} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t('form.amount')}</Label>
              <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register('amount')} />
              {errors.amount && <p className="text-sm text-red-600">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">{t('recurringDialog.frequency')}</Label>
              <Select value={frequency} onValueChange={(value) => setValue('frequency', value as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="category">{t('form.category')}</Label>
              <Select value={category} onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('form.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">{t('recurringDialog.startDate')}</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
              {errors.startDate && <p className="text-sm text-red-600">{errors.startDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">{t('recurringDialog.endDate')}</Label>
              <Input id="endDate" type="date" {...register('endDate')} />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="paymentType">{t('form.paymentType')}</Label>
              <Select value={paymentType} onValueChange={(value) => setValue('paymentType', value as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">{t('form.debitPayNow')}</SelectItem>
                  <SelectItem value="credit">{t('form.creditPayLater')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentType === 'debit' && (
              <div className="col-span-2 space-y-2">
                <Label htmlFor="accountId">{t('form.account')}</Label>
                <Select value={accountId} onValueChange={(value) => setValue('accountId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectAccount')} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.accountId && <p className="text-sm text-red-600">{errors.accountId.message}</p>}
              </div>
            )}

            {paymentType === 'credit' && (
              <>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="creditCardId">{t('form.creditCard')}</Label>
                  <Select value={creditCardId} onValueChange={(value) => setValue('creditCardId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('form.selectCreditCard')} />
                    </SelectTrigger>
                    <SelectContent>
                      {creditCards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.creditCardId && <p className="text-sm text-red-600">{errors.creditCardId.message}</p>}
                </div>

                <div className="col-span-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isInstallment"
                      checked={isInstallment}
                      onChange={(e) => setValue('isInstallment', e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="isInstallment" className="cursor-pointer">
                      {t('form.payInInstallments')}
                    </Label>
                  </div>
                </div>

                {isInstallment && (
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="installmentMonths">{t('form.numberOfMonths')}</Label>
                    <Input id="installmentMonths" type="number" min="1" max="60" placeholder="e.g., 12" {...register('installmentMonths')} />
                    {errors.installmentMonths && <p className="text-sm text-red-600">{errors.installmentMonths.message}</p>}
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.adding') : t('recurringDialog.addButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
