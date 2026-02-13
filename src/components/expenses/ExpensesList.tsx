import { useState } from 'react';
import { MoreVertical, Trash2, CreditCard, Wallet, Pencil } from 'lucide-react';
import { deleteExpense } from '@/services/expenses.service';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Expense } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditExpenseDialog } from './EditExpenseDialog';

interface ExpensesListProps {
  expenses: Expense[];
}

export function ExpensesList({ expenses }: ExpensesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      setDeletingId(expenseId);
      await deleteExpense(expenseId);
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {expense.paymentType === 'credit' ? (
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                    )}
                    <h3 className="font-semibold">{expense.name}</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">
                      {expense.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{formatDate(expense.date)}</span>
                    {expense.isInstallment && (
                      <span className="text-xs">
                        Installment: {expense.installmentMonthsPaid}/{expense.installmentMonths} months
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatCurrency(expense.amount)}
                    </div>
                    {expense.isInstallment && expense.remainingDebt > 0 && (
                      <div className="text-sm text-red-600">
                        Remaining: {formatCurrency(expense.remainingDebt)}
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={deletingId === expense.id}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingExpense(expense)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EditExpenseDialog
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
        expense={editingExpense}
      />
    </>
  );
}
