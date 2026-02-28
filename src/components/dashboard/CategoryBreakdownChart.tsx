import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryBreakdown } from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatters';
import { useTranslation } from 'react-i18next';

interface CategoryBreakdownChartProps {
  data: CategoryBreakdown[];
}

const COLORS = [
  '#c9a227',
  '#4ade80',
  '#60a5fa',
  '#f87171',
  '#a78bfa',
  '#34d399',
  '#fb923c',
  '#f472b6',
  '#22d3ee',
  '#818cf8',
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#0b1422',
          border: '1px solid #1a2338',
          borderRadius: '8px',
          padding: '10px 14px',
        }}
      >
        <p
          className="text-xs uppercase tracking-wider mb-1"
          style={{ color: '#3a4f6e', fontFamily: "'Instrument Sans', sans-serif" }}
        >
          {payload[0].name}
        </p>
        <p
          style={{ color: '#e8eaf0', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: 600 }}
        >
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <div
        className="rounded-xl p-6 flex flex-col"
        style={{ background: '#08101c', border: '1px solid #1a2338', minHeight: '320px' }}
      >
        <p
          className="text-xs uppercase tracking-[0.3em] font-medium mb-4"
          style={{ color: '#3a4f6e', fontFamily: "'Instrument Sans', sans-serif" }}
        >
          {t('dashboard.expensesByCategory')}
        </p>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm" style={{ color: '#3a4f6e' }}>{t('dashboard.noExpenseData')}</p>
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.total,
    percentage: item.percentage,
  }));

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: '#08101c', border: '1px solid #1a2338' }}
    >
      <p
        className="text-xs uppercase tracking-[0.3em] font-medium mb-5"
        style={{ color: '#3a4f6e', fontFamily: "'Instrument Sans', sans-serif" }}
      >
        {t('dashboard.expensesByCategory')}
      </p>

      <div className="flex flex-col gap-4">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Custom legend */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {chartData.slice(0, 8).map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 min-w-0">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: COLORS[index % COLORS.length] }}
              />
              <span
                className="text-xs truncate"
                style={{ color: '#6b7a99', fontFamily: "'Instrument Sans', sans-serif" }}
              >
                {item.name}
              </span>
              <span
                className="text-xs ml-auto flex-shrink-0"
                style={{ color: '#3a4f6e', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {item.percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
