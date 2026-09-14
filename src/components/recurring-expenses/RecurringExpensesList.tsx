import { useState } from 'react';
import { Check, MoreVertical, Receipt, Trash2 } from 'lucide-react';
import { deleteRecurringExpense } from '@/services/recurring-expenses.service';
import { createExpense } from '@/services/expenses.service';
import { formatCurrency } from '@/utils/formatters';
import type { RecurringExpense } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

interface RecurringExpensesListProps {
  recurringExpenses: RecurringExpense[];
}

export function RecurringExpensesList({ recurringExpenses }: RecurringExpensesListProps) {
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [registeredId, setRegisteredId] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleDelete = async (id: string) => {
    if (!confirm(t('recurringExpenses.deleteConfirmation'))) return;

    try {
      setActioningId(id);
      await deleteRecurringExpense(id);
    } catch (error) {
      console.error('Failed to delete recurring expense:', error);
      alert(t('recurringExpenses.failedDelete'));
    } finally {
      setActioningId(null);
    }
  };

  const handleRegister = async (recurring: RecurringExpense) => {
    try {
      setActioningId(recurring.id);
      await createExpense(recurring.userId, {
        name: recurring.name,
        amount: recurring.amount,
        category: recurring.category,
        date: new Date(),
        paymentType: recurring.paymentType,
        accountId: recurring.accountId,
        creditCardId: recurring.creditCardId,
        isInstallment: recurring.isInstallment,
        installmentMonths: recurring.installmentMonths,
        isFromRecurring: true,
        recurringExpenseId: recurring.id,
      });
      setRegisteredId(recurring.id);
      setTimeout(() => setRegisteredId(null), 2000);
    } catch (error) {
      console.error('Failed to register recurring expense:', error);
      alert(t('recurringExpenses.failedRegister'));
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-2">
      {recurringExpenses.map((recurring) => (
        <Card key={recurring.id}>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{recurring.name}</h3>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">
                    {recurring.category}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="capitalize">{recurring.frequency}</span>
                  {recurring.isInstallment && (
                    <span className="text-xs">
                      {recurring.installmentMonths} months installment
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {formatCurrency(recurring.amount)}
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => void handleRegister(recurring)}
                  disabled={actioningId === recurring.id || registeredId === recurring.id}
                >
                  {registeredId === recurring.id ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Receipt className="mr-2 h-4 w-4" />
                  )}
                  {registeredId === recurring.id
                    ? t('recurringExpenses.registered')
                    : t('recurringExpenses.register')}
                </Button>

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
