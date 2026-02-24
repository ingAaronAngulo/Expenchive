import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface MoneyVsDebtChartProps {
  totalMoney: number;
  totalDebt: number;
  netWorth: number;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
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
          {label}
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

export function MoneyVsDebtChart({ totalMoney, totalDebt, netWorth }: MoneyVsDebtChartProps) {
  const data = [
    { name: 'Assets', value: totalMoney, color: '#4ade80' },
    { name: 'Liabilities', value: totalDebt, color: '#f87171' },
    { name: 'Net Worth', value: Math.abs(netWorth), color: netWorth >= 0 ? '#c9a227' : '#e05252' },
  ];

  return (
    <div
      className="rounded-xl p-6"
      style={{ background: '#08101c', border: '1px solid #1a2338' }}
    >
      <p
        className="text-xs uppercase tracking-[0.3em] font-medium mb-5"
        style={{ color: '#3a4f6e', fontFamily: "'Instrument Sans', sans-serif" }}
      >
        Financial Overview
      </p>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="35%">
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: '#3a4f6e',
              fontSize: 11,
              fontFamily: "'Instrument Sans', sans-serif",
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: '#3a4f6e',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
            }}
            tickFormatter={(v) => {
              if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
              if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
              return String(v);
            }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Value labels below */}
      <div className="mt-4 flex justify-around">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <div
              className="text-xs mb-0.5"
              style={{ color: item.color, fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}
            >
              {formatCurrency(item.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
