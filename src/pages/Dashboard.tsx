import { useState } from 'react';
import { Camera, Check } from 'lucide-react';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import { useAuth } from '@/hooks/useAuth';
import { FinancialSummary } from '@/components/dashboard/FinancialSummary';
import { CategoryBreakdownChart } from '@/components/dashboard/CategoryBreakdownChart';
import { MoneyVsDebtChart } from '@/components/dashboard/MoneyVsDebtChart';
import { LoansSummaryCard } from '@/components/dashboard/LoansSummaryCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
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

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between py-1">
        <div>
          <p
            className="text-xs uppercase tracking-[0.25em]"
            style={{ color: 'hsl(var(--muted-foreground))', fontFamily: "'Instrument Sans', sans-serif" }}
          >
            {today}
          </p>
          <h1
            className="text-2xl font-semibold mt-0.5"
            style={{ fontFamily: "'Instrument Sans', sans-serif" }}
          >
            Dashboard
          </h1>
        </div>

        <button
          onClick={saveSnapshot}
          disabled={saving || saved}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            background: saved ? 'rgba(74, 222, 128, 0.08)' : 'transparent',
            border: '1px solid',
            borderColor: saved ? 'rgba(74, 222, 128, 0.25)' : 'hsl(var(--border))',
            color: saved ? '#4ade80' : 'hsl(var(--muted-foreground))',
            cursor: saving || saved ? 'not-allowed' : 'pointer',
            fontFamily: "'Instrument Sans', sans-serif",
          }}
        >
          {saved ? <Check size={14} /> : <Camera size={14} />}
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Snapshot'}
        </button>
      </div>

      {/* Hero financial summary */}
      <FinancialSummary
        totalMoney={summary.totalMoney}
        totalDebt={summary.totalDebt}
        netWorth={summary.netWorth}
      />

      {/* Loans summary */}
      {summary.hasLoansDashboard && (
        <LoansSummaryCard
          totalLent={summary.loansSummary.totalLent}
          totalBorrowed={summary.loansSummary.totalBorrowed}
        />
      )}

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <CategoryBreakdownChart data={summary.categoryBreakdown} />
        <MoneyVsDebtChart
          totalMoney={summary.totalMoney}
          totalDebt={summary.totalDebt}
          netWorth={summary.netWorth}
        />
      </div>

      {/* Empty state */}
      {summary.totalExpenses === 0 && summary.totalAccounts === 0 && (
        <div
          className="text-center p-12 rounded-xl"
          style={{
            background: '#08101c',
            border: '1px solid #1a2338',
          }}
        >
          <p
            className="text-lg mb-2"
            style={{ color: '#6b7a99', fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '1.5rem' }}
          >
            Welcome to Expenchive
          </p>
          <p
            className="text-sm"
            style={{ color: '#3a4f6e', fontFamily: "'Instrument Sans', sans-serif" }}
          >
            Start by adding accounts, expenses, or investments to see your financial dashboard.
          </p>
        </div>
      )}
    </div>
  );
}
