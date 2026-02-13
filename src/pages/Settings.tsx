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

export function Settings() {
  const { user } = useAuth();
  const { recurringExpenses, loading, error } = useRecurringExpenses();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Manage your account and recurring expenses
        </p>
      </div>

      {/* User Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Email:</span>
            <p className="text-sm">{user?.email}</p>
          </div>
          {user?.displayName && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Name:</span>
              <p className="text-sm">{user.displayName}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recurring Expenses Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Recurring Expenses</CardTitle>
            <CardDescription>
              Expenses that repeat automatically (will be created by Cloud Functions)
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Recurring
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
              title="No recurring expenses"
              description="Create recurring expenses like subscriptions, rent, or bills that happen regularly."
              actionLabel="Add Recurring Expense"
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
            <strong>Note:</strong> Recurring expenses are templates that will be automatically
            created by Cloud Functions. Once deployed, expenses will be created on their due dates
            and your account balances or credit card debt will be updated automatically.
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
