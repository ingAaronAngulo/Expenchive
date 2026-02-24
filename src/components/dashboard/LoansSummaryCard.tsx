import { formatCurrency } from '@/utils/formatters';

interface LoansSummaryCardProps {
  totalLent: number;
  totalBorrowed: number;
}

export function LoansSummaryCard({ totalLent, totalBorrowed }: LoansSummaryCardProps) {
  const net = totalLent - totalBorrowed;
  const isPositive = net >= 0;

  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: '#08101c',
        border: '1px solid #1a2338',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-xs uppercase tracking-[0.3em] font-medium mb-2"
            style={{ color: '#3a4f6e', fontFamily: "'Instrument Sans', sans-serif" }}
          >
            Loans Position
          </p>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '1.75rem',
              fontWeight: 600,
              color: isPositive ? '#4ade80' : '#f87171',
            }}
          >
            {formatCurrency(net)}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-1 text-right">
          <div className="flex items-center gap-2 justify-end">
            <span
              className="text-xs"
              style={{ color: '#4ade80', fontFamily: "'JetBrains Mono', monospace" }}
            >
              +{formatCurrency(totalLent)}
            </span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80' }} />
          </div>
          <div
            className="text-xs text-right"
            style={{ color: '#3a4f6e', fontFamily: "'Instrument Sans', sans-serif" }}
          >
            Lent out
          </div>

          <div className="flex items-center gap-2 justify-end mt-1">
            <span
              className="text-xs"
              style={{ color: '#f87171', fontFamily: "'JetBrains Mono', monospace" }}
            >
              −{formatCurrency(totalBorrowed)}
            </span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f87171' }} />
          </div>
          <div
            className="text-xs text-right"
            style={{ color: '#3a4f6e', fontFamily: "'Instrument Sans', sans-serif" }}
          >
            Borrowed
          </div>
        </div>
      </div>
    </div>
  );
}
