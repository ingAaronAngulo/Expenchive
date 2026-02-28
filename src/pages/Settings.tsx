import { useState } from 'react';
import { Plus, Repeat } from 'lucide-react';
import { useRecurringExpenses } from '@/hooks/useRecurringExpenses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RecurringExpensesList } from '@/components/recurring-expenses/RecurringExpensesList';
import { AddRecurringExpenseDialog } from '@/components/recurring-expenses/AddRecurringExpenseDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export function Settings() {
  const { user } = useAuth();
  const { recurringExpenses, loading, error } = useRecurringExpenses();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          {t('settings.description')}
        </p>
      </div>

      {/* User Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile')}</CardTitle>
          <CardDescription>{t('settings.profileDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm font-medium text-muted-foreground">{t('settings.email')}:</span>
            <p className="text-sm">{user?.email}</p>
          </div>
          {user?.displayName && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">{t('settings.name')}:</span>
              <p className="text-sm">{user.displayName}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recurring Expenses Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{t('settings.recurringExpenses')}</CardTitle>
            <CardDescription>{t('settings.recurringExpensesDescription')}</CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {t('settings.addRecurring')}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
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
        </CardContent>
      </Card>

      {/* Note about Cloud Functions */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm text-foreground">
            <strong>{t('common.note')}:</strong> {t('settings.cloudFunctionsNote')}
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
