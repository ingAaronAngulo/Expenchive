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

const creditCardSchema = z.object({
  name: z.string().min(1, 'Card name is required'),
  creditLimit: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: 'Credit limit must be a positive number',
  }),
  currentBalance: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: 'Current balance must be a positive number',
  }).optional(),
  lastFourDigits: z.string().optional(),
  clabe: z.string().refine((val) => val === '' || /^\d{18}$/.test(val), {
    message: 'CLABE must be 18 digits',
  }).optional(),
  billingCycleDay: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 31), {
    message: 'Billing cycle day must be between 1 and 31',
  }).optional(),
  paymentDueDay: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 31), {
    message: 'Payment due day must be between 1 and 31',
  }).optional(),
  interestRate: z.string().refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100), {
    message: 'Interest rate must be between 0 and 100',
  }).optional(),
});

type CreditCardFormData = z.infer<typeof creditCardSchema>;

interface AddCreditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCreditCardDialog({ open, onOpenChange }: AddCreditCardDialogProps) {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: '',
      creditLimit: '',
      currentBalance: '',
      lastFourDigits: '',
      clabe: '',
      billingCycleDay: '',
      paymentDueDay: '',
      interestRate: '',
    },
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
      setError(err.message || 'Failed to create credit card');
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
          <DialogTitle>Add Credit Card</DialogTitle>
          <DialogDescription>
            Add a new credit card to track your credit expenses.
          </DialogDescription>
        </DialogHeader>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Card Name</Label>
            <Input
              id="name"
              placeholder="e.g., Chase Sapphire"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="creditLimit">Credit Limit (Optional)</Label>
            <Input
              id="creditLimit"
              type="number"
              step="0.01"
              placeholder="e.g., 5000"
              {...register('creditLimit')}
            />
            {errors.creditLimit && (
              <p className="text-sm text-red-600">{errors.creditLimit.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentBalance">Current Balance/Debt (Optional)</Label>
            <Input
              id="currentBalance"
              type="number"
              step="0.01"
              placeholder="e.g., 0 (defaults to 0 if empty)"
              {...register('currentBalance')}
            />
            {errors.currentBalance && (
              <p className="text-sm text-red-600">{errors.currentBalance.message}</p>
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
            <Label htmlFor="billingCycleDay">Billing Cycle Day (Optional)</Label>
            <Input
              id="billingCycleDay"
              type="number"
              min="1"
              max="31"
              placeholder="e.g., 15 (day of month when statement closes)"
              {...register('billingCycleDay')}
            />
            {errors.billingCycleDay && (
              <p className="text-sm text-red-600">{errors.billingCycleDay.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDueDay">Payment Due Day (Optional)</Label>
            <Input
              id="paymentDueDay"
              type="number"
              min="1"
              max="31"
              placeholder="e.g., 10 (day of month when payment is due)"
              {...register('paymentDueDay')}
            />
            {errors.paymentDueDay && (
              <p className="text-sm text-red-600">{errors.paymentDueDay.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate % (Optional)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="e.g., 18.99"
              {...register('interestRate')}
            />
            {errors.interestRate && (
              <p className="text-sm text-red-600">{errors.interestRate.message}</p>
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
              {loading ? 'Adding...' : 'Add Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
