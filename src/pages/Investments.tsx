import { useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import { useInvestments } from '@/hooks/useInvestments';
import { Button } from '@/components/ui/button';
import { InvestmentsList } from '@/components/investments/InvestmentsList';
import { AddInvestmentDialog } from '@/components/investments/AddInvestmentDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { useTranslation } from 'react-i18next';

export function Investments() {
  const { investments, loading, error } = useInvestments();
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
          <h1 className="text-2xl md:text-3xl font-bold">{t('investments.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {t('investments.description')}
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('investments.addInvestment')}
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {!error && investments.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title={t('investments.noInvestments')}
          description={t('investments.noInvestmentsDescription')}
          actionLabel={t('investments.addInvestment')}
          onAction={() => setIsAddDialogOpen(true)}
        />
      ) : (
        <InvestmentsList investments={investments} />
      )}

      <AddInvestmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
