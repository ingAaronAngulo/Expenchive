import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import { FinancialSummary } from '@/components/dashboard/FinancialSummary';
import { CategoryBreakdownChart } from '@/components/dashboard/CategoryBreakdownChart';
import { MoneyVsDebtChart } from '@/components/dashboard/MoneyVsDebtChart';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function Dashboard() {
  const { summary, loading } = useFinancialSummary();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Your financial overview at a glance
        </p>
      </div>

      <FinancialSummary
        totalMoney={summary.totalMoney}
        totalDebt={summary.totalDebt}
        netWorth={summary.netWorth}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CategoryBreakdownChart data={summary.categoryBreakdown} />
        <MoneyVsDebtChart
          totalMoney={summary.totalMoney}
          totalDebt={summary.totalDebt}
          netWorth={summary.netWorth}
        />
      </div>

      {summary.totalExpenses === 0 && summary.totalAccounts === 0 && (
        <div className="text-center p-12 text-muted-foreground">
          <p className="text-lg mb-2">Welcome to Expenchive!</p>
          <p>Start by adding accounts, expenses, or investments to see your financial dashboard.</p>
        </div>
      )}
    </div>
  );
}
