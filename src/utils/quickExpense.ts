import type { FavoritePaymentMethod } from '@/types';

export function getQuickExpenseInitialValues(favoritePaymentMethod: FavoritePaymentMethod | null) {
  return {
    name: 'Gasto',
    category: 'Quick',
    paymentType: favoritePaymentMethod?.type ?? 'debit',
    accountId: favoritePaymentMethod?.type === 'debit' ? favoritePaymentMethod.accountId : '',
    creditCardId: favoritePaymentMethod?.type === 'credit' ? favoritePaymentMethod.creditCardId : '',
  };
}
