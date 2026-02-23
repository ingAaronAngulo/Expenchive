import { useMemo } from 'react';
import { useAccounts } from './useAccounts';
import { useExpenses } from './useExpenses';
import { useInvestments } from './useInvestments';
import { useCreditCards } from './useCreditCards';
import { useLoans } from './useLoans';
import {
  calculateTotalMoney,
  calculateTotalDebt,
  calculateCategoryBreakdown,
  calculateLoansSummary,
} from '@/utils/calculations';

export function useFinancialSummary() {
  const { accounts, loading: accountsLoading } = useAccounts();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { investments, loading: investmentsLoading } = useInvestments();
  const { creditCards, loading: creditCardsLoading } = useCreditCards();
  const { loans, loading: loansLoading } = useLoans();

  const loading = accountsLoading || expensesLoading || investmentsLoading || creditCardsLoading || loansLoading;

  const summary = useMemo(() => {
    const loansSummary = calculateLoansSummary(loans);
    const totalMoney = calculateTotalMoney(accounts, investments) + loansSummary.totalLent;
    const totalDebt = calculateTotalDebt(creditCards) + loansSummary.totalBorrowed;
    const netWorth = totalMoney - totalDebt;
    const categoryBreakdown = calculateCategoryBreakdown(expenses);

    const hasLoansDashboard = loans.some((l) => l.includeInDashboard && !l.isPaid);

    return {
      totalMoney,
      totalDebt,
      netWorth,
      categoryBreakdown,
      totalAccounts: accounts.length,
      totalInvestments: investments.length,
      totalExpenses: expenses.length,
      loansSummary,
      hasLoansDashboard,
    };
  }, [accounts, expenses, investments, creditCards, loans]);

  return { summary, loading };
}
