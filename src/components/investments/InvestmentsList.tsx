import { useState } from 'react';
import { MoreVertical, Trash2, TrendingUp } from 'lucide-react';
import { deleteInvestment } from '@/services/investments.service';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import type { Investment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InvestmentsListProps {
  investments: Investment[];
}

export function InvestmentsList({ investments }: InvestmentsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (investmentId: string) => {
    if (!confirm('Are you sure you want to delete this investment?')) return;

    try {
      setDeletingId(investmentId);
      await deleteInvestment(investmentId);
    } catch (error) {
      console.error('Failed to delete investment:', error);
      alert('Failed to delete investment');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {investments.map((investment) => (
        <Card key={investment.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {investment.name}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={deletingId === investment.id}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleDelete(investment.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <TrendingUp className="h-4 w-4" />
              <span>{formatPercentage(investment.annualReturnPercentage)} Annual Return</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {formatCurrency(investment.currentAmount)}
              </div>
              <div className="text-sm text-green-600">
                Expected: {formatCurrency(investment.expectedReturn)}/year
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
