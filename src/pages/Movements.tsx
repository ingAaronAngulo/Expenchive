import { HandCoins, Receipt } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Expenses } from '@/pages/Expenses';
import { Loans } from '@/pages/Loans';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function Movements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const activeTab = searchParams.get('tab') === 'loans' ? 'loans' : 'expenses';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{t('movements.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          {t('movements.description')}
        </p>
      </div>

      <div className="flex border-b" role="tablist" aria-label={t('movements.viewTabs')}>
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

      {activeTab === 'expenses' ? <Expenses embedded /> : <Loans embedded />}
    </div>
  );
}
