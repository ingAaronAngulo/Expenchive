import { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { Button } from '@/components/ui/button';
import { ExpensesList } from '@/components/expenses/ExpensesList';
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';

export function Expenses() {
  const { expenses, loading, error } = useExpenses();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground mt-1">
            Track your expenses and manage your budget
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {!error && expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses yet"
          description="Start tracking your expenses by adding your first transaction."
          actionLabel="Add Expense"
          onAction={() => setIsAddDialogOpen(true)}
        />
      ) : (
        <ExpensesList expenses={expenses} />
      )}

      <AddExpenseDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
