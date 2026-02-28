import { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { Button } from '@/components/ui/button';
import { AccountsList } from '@/components/accounts/AccountsList';
import { AddAccountDialog } from '@/components/accounts/AddAccountDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { useTranslation } from 'react-i18next';

export function Accounts() {
  const { accounts, loading, error } = useAccounts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { t } = useTranslation();

  if (loading) {
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
          <h1 className="text-2xl md:text-3xl font-bold">{t('accounts.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {t('accounts.description')}
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('accounts.addAccount')}
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {!error && accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={t('accounts.noAccounts')}
          description={t('accounts.noAccountsDescription')}
          actionLabel={t('accounts.addAccount')}
          onAction={() => setIsAddDialogOpen(true)}
        />
      ) : (
        <AccountsList accounts={accounts} />
      )}

      <AddAccountDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
