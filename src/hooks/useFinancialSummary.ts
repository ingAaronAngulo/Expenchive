import { useMemo } from 'react';
import { useAccounts } from './useAccounts';
import { useExpenses } from './useExpenses';
import { useInvestments } from './useInvestments';
import { useCreditCards } from './useCreditCards';
import {
  calculateTotalMoney,
  calculateTotalDebt,
  calculateNetWorth,
  calculateCategoryBreakdown,
} from '@/utils/calculations';

export function useFinancialSummary() {
  const { accounts, loading: accountsLoading } = useAccounts();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { investments, loading: investmentsLoading } = useInvestments();
  const { creditCards, loading: creditCardsLoading } = useCreditCards();

  const loading = accountsLoading || expensesLoading || investmentsLoading || creditCardsLoading;

  const summary = useMemo(() => {
    const totalMoney = calculateTotalMoney(accounts, investments);
    const totalDebt = calculateTotalDebt(creditCards);
    const netWorth = calculateNetWorth(accounts, investments, creditCards);
    const categoryBreakdown = calculateCategoryBreakdown(expenses);

    return {
      totalMoney,
      totalDebt,
      netWorth,
      categoryBreakdown,
      totalAccounts: accounts.length,
      totalInvestments: investments.length,
      totalExpenses: expenses.length,
    };
  }, [accounts, expenses, investments, creditCards]);

  return { summary, loading };
}
