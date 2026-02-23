import { useState } from 'react';
import { Camera } from 'lucide-react';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import { useAuth } from '@/hooks/useAuth';
import { FinancialSummary } from '@/components/dashboard/FinancialSummary';
import { CategoryBreakdownChart } from '@/components/dashboard/CategoryBreakdownChart';
import { MoneyVsDebtChart } from '@/components/dashboard/MoneyVsDebtChart';
import { LoansSummaryCard } from '@/components/dashboard/LoansSummaryCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { createSnapshot } from '@/services/snapshots.service';

export function Dashboard() {
  const { summary, loading } = useFinancialSummary();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveSnapshot() {
    if (!user) return;
    setSaving(true);
    try {
      await createSnapshot({
        userId: user.uid,
        totalMoney: summary.totalMoney,
        totalDebt: summary.totalDebt,
        netWorth: summary.netWorth,
        totalLent: summary.loansSummary.totalLent,
        totalBorrowed: summary.loansSummary.totalBorrowed,
        categoryBreakdown: summary.categoryBreakdown,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Your financial overview at a glance
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={saveSnapshot} disabled={saving || saved}>
          <Camera className="w-4 h-4 mr-2" />
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Snapshot'}
        </Button>
      </div>

      <div className="space-y-6">
        <FinancialSummary
          totalMoney={summary.totalMoney}
          totalDebt={summary.totalDebt}
          netWorth={summary.netWorth}
        />

        {summary.hasLoansDashboard && (
          <LoansSummaryCard
            totalLent={summary.loansSummary.totalLent}
            totalBorrowed={summary.loansSummary.totalBorrowed}
          />
        )}

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
    </div>
  );
}
