import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useAccounts } from '@/hooks/useAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import { createExpense } from '@/services/expenses.service';
import { ALL_CATEGORIES } from '@/utils/constants';
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

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddExpenseDialog({ open, onOpenChange }: AddExpenseDialogProps) {
  const { user } = useAuth();
  const { accounts } = useAccounts();
  const { creditCards } = useCreditCards();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const expenseSchema = z.object({
    name: z.string().min(1, t('expenseDialog.errors.nameRequired')),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: t('expenseDialog.errors.amountPositive'),
    }),
    category: z.string().min(1, t('expenseDialog.errors.categoryRequired')),
    date: z.string().min(1, t('expenseDialog.errors.dateRequired')),
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
    { message: t('expenseDialog.errors.selectSource'), path: ['accountId'] }
  ).refine(
    (data) => {
      if (data.isInstallment && data.paymentType === 'credit') {
        const months = Number(data.installmentMonths);
        return !isNaN(months) && months > 0 && months <= 60;
      }
      return true;
    },
    { message: t('expenseDialog.errors.installmentRange'), path: ['installmentMonths'] }
  );

  type ExpenseFormData = z.infer<typeof expenseSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: '',
      amount: '',
      category: '',
      date: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })(),
      paymentType: 'debit',
      accountId: '',
      creditCardId: '',
      isInstallment: false,
      installmentMonths: '',
    },
  });

  const paymentType = watch('paymentType');
  const isInstallment = watch('isInstallment');
  const category = watch('category');
  const accountId = watch('accountId');
  const creditCardId = watch('creditCardId');

  const onSubmit = async (data: ExpenseFormData) => {
    if (!user) return;
    try {
      setError(null);
      setLoading(true);
      await createExpense(user.uid, {
        name: data.name,
        amount: Number(data.amount),
        category: data.category,
        date: new Date(data.date.replace(/-/g, '/')),
        paymentType: data.paymentType,
        accountId: data.paymentType === 'debit' ? data.accountId : null,
        creditCardId: data.paymentType === 'credit' ? data.creditCardId : null,
        isInstallment: data.paymentType === 'credit' ? data.isInstallment : false,
        installmentMonths:
          data.paymentType === 'credit' && data.isInstallment
            ? Number(data.installmentMonths)
            : null,
      });
      reset();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t('expenseDialog.failedCreate'));
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
          <DialogTitle>{t('expenseDialog.addTitle')}</DialogTitle>
          <DialogDescription>{t('expenseDialog.addDescription')}</DialogDescription>
        </DialogHeader>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">{t('expenseDialog.expenseName')}</Label>
              <Input id="name" placeholder="e.g., Grocery Shopping" {...register('name')} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t('form.amount')}</Label>
              <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register('amount')} />
              {errors.amount && <p className="text-sm text-red-600">{errors.amount.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">{t('form.date')}</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="text-sm text-red-600">{errors.date.message}</p>}
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
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - ${account.balance.toFixed(2)}
                      </SelectItem>
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
              {loading ? t('common.adding') : t('expenseDialog.addButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
