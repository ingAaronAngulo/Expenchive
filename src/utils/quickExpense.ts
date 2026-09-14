import type { FavoritePaymentMethod } from '@/types';
import { GENERAL_CATEGORY } from '@/utils/constants';

export function getQuickExpenseInitialValues(favoritePaymentMethod: FavoritePaymentMethod | null) {
  return {
    name: 'Gasto',
    category: GENERAL_CATEGORY,
    paymentType: favoritePaymentMethod?.type ?? 'debit',
    accountId: favoritePaymentMethod?.type === 'debit' ? favoritePaymentMethod.accountId : '',
    creditCardId: favoritePaymentMethod?.type === 'credit' ? favoritePaymentMethod.creditCardId : '',
  };
}
