import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateLoan } from '@/services/loans.service';
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
import { Switch } from '@/components/ui/switch';
import { ErrorMessage } from '@/components/common/ErrorMessage';

const editLoanFormSchema = z.object({
  personName: z.string().min(1, 'Person name is required'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  description: z.string().optional(),
  clabe: z
    .string()
    .regex(/^\d{18}$/, 'CLABE must be exactly 18 digits')
    .or(z.literal(''))
    .optional(),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().optional(),
  includeInDashboard: z.boolean(),
});

type EditLoanFormData = z.infer<typeof editLoanFormSchema>;

interface EditLoanDialogProps {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLoanDialog({ loan, open, onOpenChange }: EditLoanDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EditLoanFormData>({
    resolver: zodResolver(editLoanFormSchema),
  });

  const includeInDashboard = watch('includeInDashboard');

  useEffect(() => {
    if (loan && open) {
      reset({
        personName: loan.personName,
        amount: String(loan.amount),
        description: loan.description ?? '',
        clabe: loan.clabe ?? '',
        date: loan.date.toDate().toISOString().split('T')[0],
        dueDate: loan.dueDate ? loan.dueDate.toDate().toISOString().split('T')[0] : '',
        includeInDashboard: loan.includeInDashboard,
      });
      setError(null);
    }
  }, [loan, open, reset]);

  const onSubmit = async (data: EditLoanFormData) => {
    if (!loan) return;

    try {
      setError(null);
      setLoading(true);

      await updateLoan(loan.id, {
        personName: data.personName,
        amount: Number(data.amount),
        description: data.description || null,
        clabe: data.clabe || null,
        date: new Date(data.date),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        includeInDashboard: data.includeInDashboard,
      });

      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update loan');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Loan</DialogTitle>
          <DialogDescription>
            Update the details of this loan.
          </DialogDescription>
        </DialogHeader>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personName">
              {loan?.direction === 'lent' ? 'Borrower Name' : 'Lender Name'}
            </Label>
            <Input
              id="personName"
              placeholder="e.g., John Doe"
              {...register('personName')}
            />
            {errors.personName && (
              <p className="text-sm text-red-600">{errors.personName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount')}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register('date')} />
            {errors.date && (
              <p className="text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date (optional)</Label>
            <Input id="dueDate" type="date" {...register('dueDate')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="What was this loan for?"
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clabe">CLABE (optional)</Label>
            <Input
              id="clabe"
              placeholder="18-digit CLABE"
              maxLength={18}
              {...register('clabe')}
            />
            {errors.clabe && (
              <p className="text-sm text-red-600">{errors.clabe.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="includeInDashboard">Include in Dashboard</Label>
              <p className="text-xs text-muted-foreground">
                {loan?.direction === 'lent'
                  ? 'Count lent money as an asset'
                  : 'Count borrowed money as debt'}
              </p>
            </div>
            <Switch
              id="includeInDashboard"
              checked={includeInDashboard}
              onCheckedChange={(checked) => setValue('includeInDashboard', checked)}
            />
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
