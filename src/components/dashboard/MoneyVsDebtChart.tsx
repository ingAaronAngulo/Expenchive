import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MoneyVsDebtChartProps {
  totalMoney: number;
  totalDebt: number;
  netWorth: number;
}

export function MoneyVsDebtChart({
  totalMoney,
  totalDebt,
  netWorth,
}: MoneyVsDebtChartProps) {
  const data = [
    {
      name: 'Current',
      'Total Money': totalMoney,
      'Total Debt': totalDebt,
      'Net Worth': netWorth,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Legend />
            <Bar dataKey="Total Money" fill="#10b981" />
            <Bar dataKey="Total Debt" fill="#ef4444" />
            <Bar dataKey="Net Worth" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
