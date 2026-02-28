import { useState } from 'react';
import { Plus, Receipt, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useExpenses, type ExpenseFilter } from '@/hooks/useExpenses';
import { useAccounts } from '@/hooks/useAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExpensesList } from '@/components/expenses/ExpensesList';
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { useTranslation } from 'react-i18next';

export function Expenses() {
  const [filter, setFilter] = useState<ExpenseFilter | undefined>();
  const { expenses, loading, error, pagination } = useExpenses(filter);
  const { accounts } = useAccounts();
  const { creditCards } = useCreditCards();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { t } = useTranslation();

  const handleDialogClose = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      pagination.resetPagination();
    }
  };

  const handleFilterChange = (value: string) => {
    if (value === 'all') {
      setFilter(undefined);
    } else if (value.startsWith('account:')) {
      const id = value.substring('account:'.length);
      setFilter({ type: 'account', id });
    } else if (value.startsWith('card:')) {
      const id = value.substring('card:'.length);
      setFilter({ type: 'creditCard', id });
    }
  };

  const handleClearFilter = () => {
    setFilter(undefined);
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
          <h1 className="text-2xl md:text-3xl font-bold">{t('expenses.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {t('expenses.description')}
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('expenses.addExpense')}
        </Button>
      </div>

      {/* Filter UI */}
      <div className="flex items-center gap-2">
        <Select value={filter ? (filter.type === 'account' ? `account:${filter.id}` : `card:${filter.id}`) : 'all'} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder={t('expenses.filterPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('expenses.allSources')}</SelectItem>
            {accounts.length > 0 && (
              <>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={`account:${account.id}`}>
                    🏦 {account.name}
                  </SelectItem>
                ))}
              </>
            )}
            {creditCards.length > 0 && (
              <>
                {creditCards.map((card) => (
                  <SelectItem key={card.id} value={`card:${card.id}`}>
                    💳 {card.name}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
        {filter && (
          <Button variant="ghost" size="sm" onClick={handleClearFilter}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      {!error && expenses.length === 0 && pagination.currentPage === 1 ? (
        <EmptyState
          icon={Receipt}
          title={t('expenses.noExpenses')}
          description={t('expenses.noExpensesDescription')}
          actionLabel={t('expenses.addExpense')}
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
              accounts={accounts}
              creditCards={creditCards}
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
