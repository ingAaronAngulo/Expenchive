import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateAccount } from '@/services/accounts.service';
import { ACCOUNT_TYPES } from '@/utils/constants';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useTranslation } from 'react-i18next';

interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
}

export function EditAccountDialog({ open, onOpenChange, account }: EditAccountDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const accountSchema = z.object({
    name: z.string().min(1, t('accountDialog.errors.nameRequired')),
    type: z.enum(['checking', 'savings', 'cash', 'other']),
    balance: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: t('accountDialog.errors.balancePositive'),
    }),
    lastFourDigits: z.string().refine((val) => val === '' || /^\d{4}$/.test(val), {
      message: t('accountDialog.errors.lastFourDigits'),
    }).optional(),
    clabe: z.string().refine((val) => val === '' || /^\d{18}$/.test(val), {
      message: t('accountDialog.errors.clabe'),
    }).optional(),
    annualReturn: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= -100), {
      message: t('accountDialog.errors.annualReturn'),
    }).optional(),
  });

  type AccountFormData = z.infer<typeof accountSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
  });

  const accountType = watch('type');

  useEffect(() => {
    if (account) {
      setValue('name', account.name);
      setValue('type', account.type);
      setValue('balance', account.balance.toString());
      setValue('lastFourDigits', account.lastFourDigits || '');
      setValue('clabe', account.clabe || '');
      setValue('annualReturn', account.annualReturn?.toString() || '');
    }
  }, [account, setValue]);

  const onSubmit = async (data: AccountFormData) => {
    if (!account) return;
    try {
      setError(null);
      setLoading(true);
      await updateAccount(account.id, {
        name: data.name,
        type: data.type,
        balance: Number(data.balance),
        lastFourDigits: data.lastFourDigits || null,
        clabe: data.clabe || null,
        annualReturn: data.annualReturn ? Number(data.annualReturn) : null,
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || t('accountDialog.errors.failedUpdate'));
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
          <DialogTitle>{t('accountDialog.editTitle')}</DialogTitle>
          <DialogDescription>{t('accountDialog.editDescription')}</DialogDescription>
        </DialogHeader>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('accountDialog.accountName')}</Label>
            <Input id="name" placeholder="e.g., Chase Checking" {...register('name')} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{t('accountDialog.accountType')}</Label>
            <Select value={accountType} onValueChange={(value) => setValue('type', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder={t('accountDialog.selectType')} />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">{t('accountDialog.currentBalance')}</Label>
            <Input id="balance" type="number" step="0.01" placeholder="0.00" {...register('balance')} />
            {errors.balance && <p className="text-sm text-red-600">{errors.balance.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastFourDigits">{t('form.lastFourDigits')}</Label>
            <Input id="lastFourDigits" maxLength={4} placeholder="e.g., 1234" {...register('lastFourDigits')} />
            {errors.lastFourDigits && <p className="text-sm text-red-600">{errors.lastFourDigits.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clabe">{t('form.clabe')}</Label>
            <Input id="clabe" placeholder={t('form.clabe18Digits')} {...register('clabe')} maxLength={18} />
            <p className="text-xs text-muted-foreground">{t('form.clabeHint')}</p>
            {errors.clabe && <p className="text-sm text-red-600">{errors.clabe.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualReturn">{t('form.annualReturn')}</Label>
            <Input id="annualReturn" type="number" step="0.01" placeholder="e.g., 5.5" {...register('annualReturn')} />
            <p className="text-xs text-muted-foreground">{t('form.annualReturnHint')}</p>
            {errors.annualReturn && <p className="text-sm text-red-600">{errors.annualReturn.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('common.saving') : t('common.saveChanges')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
