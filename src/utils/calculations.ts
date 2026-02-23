import type { Account, Expense, Investment, CreditCard, Loan } from '@/types';

/**
 * Calculate total money from accounts and investments
 */
export function calculateTotalMoney(
  accounts: Account[],
  investments: Investment[]
): number {
  const accountsTotal = accounts.reduce((sum, account) => sum + account.balance, 0);
  const investmentsTotal = investments.reduce(
    (sum, investment) => sum + investment.currentAmount,
    0
  );
  return accountsTotal + investmentsTotal;
}

/**
 * Calculate total debt from credit cards
 */
export function calculateTotalDebt(creditCards: CreditCard[]): number {
  return creditCards.reduce((sum, card) => sum + card.currentBalance, 0);
}

/**
 * Calculate debt for a specific credit card
 */
export function calculateDebtByCard(expenses: Expense[], cardId: string): number {
  return expenses
    .filter(
      (expense) =>
        expense.creditCardId === cardId &&
        expense.paymentType === 'credit' &&
        !expense.isFullyPaid
    )
    .reduce((sum, expense) => sum + expense.remainingDebt, 0);
}

/**
 * Calculate net worth (money - debt)
 */
export function calculateNetWorth(
  accounts: Account[],
  investments: Investment[],
  creditCards: CreditCard[]
): number {
  const totalMoney = calculateTotalMoney(accounts, investments);
  const totalDebt = calculateTotalDebt(creditCards);
  return totalMoney - totalDebt;
}

/**
 * Group expenses by category with totals
 */
export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export function calculateCategoryBreakdown(expenses: Expense[]): CategoryBreakdown[] {
  const categoryMap = new Map<string, { total: number; count: number }>();
  let grandTotal = 0;

  expenses.forEach((expense) => {
    const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
    categoryMap.set(expense.category, {
      total: existing.total + expense.amount,
      count: existing.count + 1,
    });
    grandTotal += expense.amount;
  });

  const breakdown: CategoryBreakdown[] = [];
  categoryMap.forEach((value, category) => {
    breakdown.push({
      category,
      total: value.total,
      count: value.count,
      percentage: grandTotal > 0 ? (value.total / grandTotal) * 100 : 0,
    });
  });

  return breakdown.sort((a, b) => b.total - a.total);
}

/**
 * Calculate monthly payment for installments
 */
export function calculateMonthlyPayment(amount: number, months: number): number {
  if (months <= 0) return amount;
  return amount / months;
}

/**
 * Calculate expected return for investment
 */
export function calculateExpectedReturn(
  amount: number,
  annualReturnPercentage: number
): number {
  return amount * (annualReturnPercentage / 100);
}

/**
 * Calculate remaining debt for installment
 */
export function calculateRemainingDebt(
  amount: number,
  monthlyPayment: number,
  monthsPaid: number
): number {
  const remaining = amount - monthlyPayment * monthsPaid;
  return Math.max(0, remaining);
}

/**
 * Calculate loans summary for dashboard-included loans
 */
export interface LoansSummary {
  totalLent: number;
  totalBorrowed: number;
}

export function calculateLoansSummary(loans: Loan[]): LoansSummary {
  const dashboardLoans = loans.filter((l) => l.includeInDashboard && !l.isPaid);
  const totalLent = dashboardLoans
    .filter((l) => l.direction === 'lent')
    .reduce((s, l) => s + l.remainingAmount, 0);
  const totalBorrowed = dashboardLoans
    .filter((l) => l.direction === 'borrowed')
    .reduce((s, l) => s + l.remainingAmount, 0);
  return { totalLent, totalBorrowed };
}

/**
 * Update credit card balances based on expenses
 */
export function updateCreditCardBalances(
  cards: CreditCard[],
  expenses: Expense[]
): CreditCard[] {
  return cards.map((card) => ({
    ...card,
    currentBalance: calculateDebtByCard(expenses, card.id),
  }));
}
