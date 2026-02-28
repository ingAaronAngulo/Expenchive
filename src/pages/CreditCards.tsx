import { useState } from 'react';
import { Plus, CreditCard } from 'lucide-react';
import { useCreditCards } from '@/hooks/useCreditCards';
import { Button } from '@/components/ui/button';
import { CreditCardsList } from '@/components/credit-cards/CreditCardsList';
import { AddCreditCardDialog } from '@/components/credit-cards/AddCreditCardDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { useTranslation } from 'react-i18next';

export function CreditCards() {
  const { creditCards, loading, error } = useCreditCards();
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
          <h1 className="text-2xl md:text-3xl font-bold">{t('creditCards.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {t('creditCards.description')}
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t('creditCards.addCard')}
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {!error && creditCards.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={t('creditCards.noCards')}
          description={t('creditCards.noCardsDescription')}
          actionLabel={t('creditCards.addCreditCard')}
          onAction={() => setIsAddDialogOpen(true)}
        />
      ) : (
        <CreditCardsList creditCards={creditCards} />
      )}

      <AddCreditCardDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
