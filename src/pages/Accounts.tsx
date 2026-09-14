import { useState } from 'react';
import { CreditCard, Plus, Wallet } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAccounts } from '@/hooks/useAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import { Button } from '@/components/ui/button';
import { AccountsList } from '@/components/accounts/AccountsList';
import { AddAccountDialog } from '@/components/accounts/AddAccountDialog';
import { CreditCardsList } from '@/components/credit-cards/CreditCardsList';
import { AddCreditCardDialog } from '@/components/credit-cards/AddCreditCardDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function Accounts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { accounts, loading: accountsLoading, error: accountsError } = useAccounts();
  const { creditCards, loading: cardsLoading, error: cardsError } = useCreditCards();
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const { t } = useTranslation();

  const activeTab = searchParams.get('tab') === 'credit' ? 'credit' : 'debit';
  const loading = activeTab === 'debit' ? accountsLoading : cardsLoading;
  const error = activeTab === 'debit' ? accountsError : cardsError;

  const openAddDialog = () => {
    if (activeTab === 'debit') setIsAddAccountOpen(true);
    else setIsAddCardOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t('accounts.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {t('accounts.description')}
          </p>
        </div>
        <Button onClick={openAddDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {activeTab === 'debit' ? t('accounts.addAccount') : t('creditCards.addCard')}
        </Button>
      </div>

      <div
        className="flex border-b"
        role="tablist"
        aria-label={t('accounts.paymentTypes')}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'debit'}
          onClick={() => setSearchParams({ tab: 'debit' })}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors',
            activeTab === 'debit'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Wallet className="h-4 w-4" />
          {t('accounts.debitTab')}
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{accounts.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'credit'}
          onClick={() => setSearchParams({ tab: 'credit' })}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors',
            activeTab === 'credit'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <CreditCard className="h-4 w-4" />
          {t('accounts.creditTab')}
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{creditCards.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {error && <ErrorMessage message={error} />}

          {!error && activeTab === 'debit' && (
            accounts.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title={t('accounts.noAccounts')}
                description={t('accounts.noAccountsDescription')}
                actionLabel={t('accounts.addAccount')}
                onAction={() => setIsAddAccountOpen(true)}
              />
            ) : (
              <AccountsList accounts={accounts} />
            )
          )}

          {!error && activeTab === 'credit' && (
            creditCards.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title={t('creditCards.noCards')}
                description={t('creditCards.noCardsDescription')}
                actionLabel={t('creditCards.addCreditCard')}
                onAction={() => setIsAddCardOpen(true)}
              />
            ) : (
              <CreditCardsList creditCards={creditCards} />
            )
          )}
        </>
      )}

      <AddAccountDialog
        open={isAddAccountOpen}
        onOpenChange={setIsAddAccountOpen}
      />
      <AddCreditCardDialog
        open={isAddCardOpen}
        onOpenChange={setIsAddCardOpen}
      />
    </div>
  );
}
