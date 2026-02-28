import { formatCurrency } from '@/utils/formatters';
import { useTranslation } from 'react-i18next';

interface FinancialSummaryProps {
  totalMoney: number;
  totalDebt: number;
  netWorth: number;
}

export function FinancialSummary({ totalMoney, totalDebt, netWorth }: FinancialSummaryProps) {
  const isPositive = netWorth >= 0;
  const { t } = useTranslation();

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-8 md:p-10"
      style={{
        background: 'linear-gradient(145deg, #060912 0%, #0b1422 60%, #060e1a 100%)',
        border: '1px solid #1a2338',
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />

      {/* Glow accent */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-40px',
          right: '-40px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: isPositive
            ? 'radial-gradient(circle, rgba(201,162,39,0.07) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(224,82,82,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10">
        {/* Label */}
        <p
          className="text-xs uppercase tracking-[0.35em] font-medium"
          style={{ color: '#3a4f6e', fontFamily: "'Instrument Sans', sans-serif" }}
        >
          {t('dashboard.netWorth')}
        </p>

        {/* Hero number */}
        <div
          className="mt-3 mb-6"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 'clamp(2.75rem, 7vw, 5rem)',
            fontWeight: 300,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: isPositive ? '#c9a227' : '#e05252',
          }}
        >
          {formatCurrency(netWorth)}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#1a2338' }} />

        {/* Secondary stats */}
        <div className="mt-5 flex flex-wrap items-start gap-8">
          <div>
            <p
              className="text-xs uppercase tracking-wider mb-1.5"
              style={{ color: '#3a4f6e', fontFamily: "'Instrument Sans', sans-serif" }}
            >
              {t('dashboard.assets')}
            </p>
            <p
              className="text-xl font-semibold"
              style={{ color: '#4ade80', fontFamily: "'JetBrains Mono', monospace" }}
            >
              {formatCurrency(totalMoney)}
            </p>
            <p className="text-xs mt-1" style={{ color: '#3a4f6e' }}>
              {t('dashboard.assetsSubtitle')}
            </p>
          </div>

          <div style={{ width: '1px', height: '52px', background: '#1a2338', marginTop: '2px' }} />

          <div>
            <p
              className="text-xs uppercase tracking-wider mb-1.5"
              style={{ color: '#3a4f6e', fontFamily: "'Instrument Sans', sans-serif" }}
            >
              {t('dashboard.liabilities')}
            </p>
            <p
              className="text-xl font-semibold"
              style={{ color: '#f87171', fontFamily: "'JetBrains Mono', monospace" }}
            >
              {formatCurrency(totalDebt)}
            </p>
            <p className="text-xs mt-1" style={{ color: '#3a4f6e' }}>
              {t('dashboard.liabilitiesSubtitle')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
