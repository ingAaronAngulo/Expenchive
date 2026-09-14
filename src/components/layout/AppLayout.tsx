import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useTheme } from '@/hooks/useTheme';
import { getQuickExpenseInitialValues } from '@/utils/quickExpense';

export function AppLayout() {
  useTheme();
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const { favoritePaymentMethod } = useUserSettings();

  const quickExpenseInitialValues = getQuickExpenseInitialValues(favoritePaymentMethod);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-background p-4 pb-28 md:p-6">
          <Outlet />
        </main>
      </div>

      <MobileBottomNavigation onQuickExpense={() => setIsQuickExpenseOpen(true)} />
      <AddExpenseDialog
        open={isQuickExpenseOpen}
        onOpenChange={setIsQuickExpenseOpen}
        initialValues={quickExpenseInitialValues}
        autoFocusAmount
      />
    </div>
  );
}
