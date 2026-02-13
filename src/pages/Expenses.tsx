import { useState } from 'react';
import { Plus, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { Button } from '@/components/ui/button';
import { ExpensesList } from '@/components/expenses/ExpensesList';
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';

export function Expenses() {
  const { expenses, loading, error, pagination } = useExpenses();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleDialogClose = (open: boolean) => {
    setIsAddDialogOpen(open);
    // Reset to first page when dialog closes (to show new expense)
    if (!open) {
      pagination.resetPagination();
    }
  };

  if (loading && pagination.currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Expenses</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Track your expenses and manage your budget
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {!error && expenses.length === 0 && pagination.currentPage === 1 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses yet"
          description="Start tracking your expenses by adding your first transaction."
          actionLabel="Add Expense"
          onAction={() => setIsAddDialogOpen(true)}
        />
      ) : (
        <>
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <ExpensesList
              expenses={expenses}
              onExpenseChange={pagination.resetPagination}
            />
          )}

          {/* Pagination Controls */}
          {expenses.length > 0 && (pagination.hasNextPage || pagination.hasPrevPage) && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} • {expenses.length} expenses
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pagination.prevPage}
                  disabled={!pagination.hasPrevPage || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pagination.nextPage}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AddExpenseDialog
        open={isAddDialogOpen}
        onOpenChange={handleDialogClose}
      />
    </div>
  );
}
