import type { Loan } from '@/types';
import { useLoanPayments } from '@/hooks/useLoanPayments';
import { useLoanAdditions } from '@/hooks/useLoanAdditions';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useTranslation } from 'react-i18next';

interface LoanRecordsDialogProps {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoanRecordsDialog({ loan, open, onOpenChange }: LoanRecordsDialogProps) {
  const { payments, loading, error } = useLoanPayments(loan?.id ?? null, open);
  const { additions, loading: additionsLoading, error: additionsError } = useLoanAdditions(loan?.id ?? null, open);
  const { t } = useTranslation();

  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('loanDialog.recordsTitle')}</DialogTitle>
          <DialogDescription>
            {t('loanDialog.recordsDescription', { name: loan.personName })}
          </DialogDescription>
        </DialogHeader>

        {loading || additionsLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : error || additionsError ? (
          <ErrorMessage message={error ?? additionsError ?? ''} />
        ) : (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            <div className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{t('loanDialog.originalEntry')}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(loan.date)}</p>
                </div>
                <p className="font-semibold">{formatCurrency(loan.amount, loan.currency)}</p>
              </div>
              {loan.description && <p className="mt-2 text-sm text-muted-foreground">{loan.description}</p>}
            </div>

            {additions.map((addition) => (
              <div key={addition.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{t('loanDialog.addedAmountEntry')}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(addition.date)}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(addition.amount, loan.currency)}</p>
                </div>
                {addition.description && <p className="mt-2 text-sm text-muted-foreground">{addition.description}</p>}
              </div>
            ))}

            {payments.map((payment) => (
              <div key={payment.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{t('loanDialog.paymentEntry')}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(payment.date)}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(payment.amount, loan.currency)}</p>
                </div>
                {payment.note && <p className="mt-2 text-sm text-muted-foreground">{payment.note}</p>}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
