import { useState } from 'react';
import { Plus, HandCoins } from 'lucide-react';
import { useLoans } from '@/hooks/useLoans';
import { Button } from '@/components/ui/button';
import { LoansList } from '@/components/loans/LoansList';
import { AddLoanDialog } from '@/components/loans/AddLoanDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';

export function Loans() {
  const { loans, loading, error } = useLoans();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const activeLoans = loans.filter((l) => !l.isPaid);
  const paidLoans = loans.filter((l) => l.isPaid);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Loans</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Track money you lent or borrowed
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Loan
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {!error && loans.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title="No loans yet"
          description="Track money you lent to others or borrowed from others."
          actionLabel="Add Loan"
          onAction={() => setIsAddDialogOpen(true)}
        />
      ) : (
        <>
          {activeLoans.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Active</h2>
              <LoansList loans={activeLoans} />
            </div>
          )}
          {paidLoans.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-muted-foreground">Paid</h2>
              <LoansList loans={paidLoans} />
            </div>
          )}
        </>
      )}

      <AddLoanDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
}
