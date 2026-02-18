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

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(['checking', 'savings', 'cash', 'other']),
  balance: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Balance must be a positive number',
  }),
  lastFourDigits: z.string().refine((val) => val === '' || /^\d{4}$/.test(val), {
    message: 'Last four digits must be exactly 4 digits',
  }).optional(),
  clabe: z.string().refine((val) => val === '' || /^\d{18}$/.test(val), {
    message: 'CLABE must be 18 digits',
  }).optional(),
  annualReturn: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= -100), {
    message: 'Annual return must be a valid number',
  }).optional(),
});

type AccountFormData = z.infer<typeof accountSchema>;

interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
}

export function EditAccountDialog({
  open,
  onOpenChange,
  account,
}: EditAccountDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setError(err.message || 'Failed to update account');
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Update your account information.
          </DialogDescription>
        </DialogHeader>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              placeholder="e.g., Chase Checking"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Account Type</Label>
            <Select
              value={accountType}
              onValueChange={(value) => setValue('type', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Current Balance</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('balance')}
            />
            {errors.balance && (
              <p className="text-sm text-red-600">{errors.balance.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastFourDigits">Last 4 Digits (Optional)</Label>
            <Input
              id="lastFourDigits"
              maxLength={4}
              placeholder="e.g., 1234"
              {...register('lastFourDigits')}
            />
            {errors.lastFourDigits && (
              <p className="text-sm text-red-600">{errors.lastFourDigits.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clabe">CLABE (Optional)</Label>
            <Input
              id="clabe"
              placeholder="18-digit CLABE number"
              {...register('clabe')}
              maxLength={18}
            />
            <p className="text-xs text-muted-foreground">
              18-digit Standardized Banking Cipher Encryption number
            </p>
            {errors.clabe && (
              <p className="text-sm text-red-600">{errors.clabe.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualReturn">Annual Return % (Optional)</Label>
            <Input
              id="annualReturn"
              type="number"
              step="0.01"
              placeholder="e.g., 5.5"
              {...register('annualReturn')}
            />
            <p className="text-xs text-muted-foreground">
              Expected annual return percentage for this account
            </p>
            {errors.annualReturn && (
              <p className="text-sm text-red-600">{errors.annualReturn.message}</p>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
