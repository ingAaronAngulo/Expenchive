import { useEffect, useState } from 'react';
import { Plus, Repeat } from 'lucide-react';
import { useRecurringExpenses } from '@/hooks/useRecurringExpenses';
import { useAuth } from '@/hooks/useAuth';
import { disableAutomaticRecurringExpenses } from '@/services/recurring-expenses.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RecurringExpensesList } from '@/components/recurring-expenses/RecurringExpensesList';
import { AddRecurringExpenseDialog } from '@/components/recurring-expenses/AddRecurringExpenseDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { useTranslation } from 'react-i18next';

export function RecurringExpenses() {
  const { recurringExpenses, loading, error } = useRecurringExpenses();
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!user) return;
    void disableAutomaticRecurringExpenses(user.uid).catch((migrationError) => {
      console.error('Failed to convert recurring expenses to manual templates:', migrationError);
    });
  }, [user]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('settings.addRecurring')}
        </Button>
      </div>

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorMessage message={error} />
      ) : recurringExpenses.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title={t('settings.noRecurring')}
          description={t('settings.noRecurringDescription')}
          actionLabel={t('settings.addRecurring')}
          onAction={() => setIsAddDialogOpen(true)}
        />
      ) : (
        <RecurringExpensesList recurringExpenses={recurringExpenses} />
      )}

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm text-foreground">
            <strong>{t('common.note')}:</strong> {t('recurringExpenses.manualNote')}
          </p>
        </CardContent>
      </Card>

      <AddRecurringExpenseDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
