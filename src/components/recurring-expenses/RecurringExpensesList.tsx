import { useState } from 'react';
import { MoreVertical, Trash2, Pause, Play } from 'lucide-react';
import { deleteRecurringExpense, toggleRecurringExpense } from '@/services/recurring-expenses.service';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { RecurringExpense } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RecurringExpensesListProps {
  recurringExpenses: RecurringExpense[];
}

export function RecurringExpensesList({ recurringExpenses }: RecurringExpensesListProps) {
  const [actioningId, setActioningId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring expense?')) return;

    try {
      setActioningId(id);
      await deleteRecurringExpense(id);
    } catch (error) {
      console.error('Failed to delete recurring expense:', error);
      alert('Failed to delete recurring expense');
    } finally {
      setActioningId(null);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      setActioningId(id);
      await toggleRecurringExpense(id, !currentStatus);
    } catch (error) {
      console.error('Failed to toggle recurring expense:', error);
      alert('Failed to toggle recurring expense');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-2">
      {recurringExpenses.map((recurring) => (
        <Card key={recurring.id} className={!recurring.isActive ? 'opacity-60' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{recurring.name}</h3>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">
                    {recurring.category}
                  </span>
                  {!recurring.isActive && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      Paused
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="capitalize">{recurring.frequency}</span>
                  <span>Starts: {formatDate(recurring.startDate)}</span>
                  {recurring.endDate && (
                    <span>Ends: {formatDate(recurring.endDate)}</span>
                  )}
                  {recurring.isInstallment && (
                    <span className="text-xs">
                      {recurring.installmentMonths} months installment
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {formatCurrency(recurring.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    per {recurring.frequency === 'daily' ? 'day' : recurring.frequency === 'weekly' ? 'week' : recurring.frequency === 'monthly' ? 'month' : 'year'}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={actioningId === recurring.id}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleToggle(recurring.id, recurring.isActive)}
                    >
                      {recurring.isActive ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Resume
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(recurring.id)}
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
  );
}
