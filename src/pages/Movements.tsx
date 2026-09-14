import { HandCoins, Receipt, Repeat } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Expenses } from '@/pages/Expenses';
import { Loans } from '@/pages/Loans';
import { RecurringExpenses } from '@/pages/RecurringExpenses';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function Movements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const requestedTab = searchParams.get('tab');
  const activeTab = requestedTab === 'loans' || requestedTab === 'recurring'
    ? requestedTab
    : 'expenses';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{t('movements.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          {t('movements.description')}
        </p>
      </div>

      <div className="flex overflow-x-auto border-b" role="tablist" aria-label={t('movements.viewTabs')}>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'expenses'}
          onClick={() => setSearchParams({ tab: 'expenses' })}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors',
            activeTab === 'expenses'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Receipt className="h-4 w-4" />
          {t('movements.expensesTab')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'recurring'}
          onClick={() => setSearchParams({ tab: 'recurring' })}
          className={cn(
            'flex items-center gap-2 whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium transition-colors',
            activeTab === 'recurring'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <Repeat className="h-4 w-4" />
          {t('movements.recurringTab')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'loans'}
          onClick={() => setSearchParams({ tab: 'loans' })}
          className={cn(
            'flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors',
            activeTab === 'loans'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          <HandCoins className="h-4 w-4" />
          {t('movements.loansTab')}
        </button>
      </div>

      {activeTab === 'expenses' && <Expenses embedded />}
      {activeTab === 'recurring' && <RecurringExpenses />}
      {activeTab === 'loans' && <Loans embedded />}
    </div>
  );
}
