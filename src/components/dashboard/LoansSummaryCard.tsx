import { HandCoins } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LoansSummaryCardProps {
  totalLent: number;
  totalBorrowed: number;
}

export function LoansSummaryCard({ totalLent, totalBorrowed }: LoansSummaryCardProps) {
  const net = totalLent - totalBorrowed;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Loans</CardTitle>
        <HandCoins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold">
          {formatCurrency(net)}
        </div>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div className="text-green-600">Lent out: {formatCurrency(totalLent)}</div>
          <div className="text-red-600">Borrowed: {formatCurrency(totalBorrowed)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
