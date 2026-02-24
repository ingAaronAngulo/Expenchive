import { useState } from 'react';
import { MoreVertical, Trash2, CreditCard, CheckCircle2, Pencil } from 'lucide-react';
import { deleteLoan, toggleLoanDashboard } from '@/services/loans.service';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Loan } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RecordPaymentDialog } from './RecordPaymentDialog';
import { EditLoanDialog } from './EditLoanDialog';

interface LoansListProps {
  loans: Loan[];
}

export function LoansList({ loans }: LoansListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async (loan: Loan) => {
    if (!confirm(`Are you sure you want to delete this loan with ${loan.personName}?`)) return;

    try {
      setDeletingId(loan.id);
      await deleteLoan(loan.id);
    } catch (error) {
      console.error('Failed to delete loan:', error);
      alert('Failed to delete loan');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleDashboard = async (loan: Loan) => {
    try {
      await toggleLoanDashboard(loan.id, !loan.includeInDashboard);
    } catch (error) {
      console.error('Failed to update loan:', error);
    }
  };

  const handleRecordPayment = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsPaymentDialogOpen(true);
  };

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loans.map((loan) => {
          const progressPercent =
            loan.amount > 0 ? ((loan.amount - loan.remainingAmount) / loan.amount) * 100 : 0;

          return (
            <Card key={loan.id} className={loan.isPaid ? 'opacity-60' : ''}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">{loan.personName}</CardTitle>
                  <div className="flex gap-1">
                    <Badge variant={loan.direction === 'lent' ? 'default' : 'secondary'}>
                      {loan.direction === 'lent' ? 'Lent' : 'Borrowed'}
                    </Badge>
                    {loan.isPaid && (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={deletingId === loan.id}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(loan)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {!loan.isPaid && (
                      <DropdownMenuItem onClick={() => handleRecordPayment(loan)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Record Payment
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(loan)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(loan.remainingAmount, loan.currency)}
                  </div>
                  {loan.remainingAmount !== loan.amount && (
                    <div className="text-xs text-muted-foreground">
                      of {formatCurrency(loan.amount, loan.currency)} original
                    </div>
                  )}
                </div>

                {loan.amount > 0 && (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {progressPercent.toFixed(0)}% paid
                    </p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div>Date: {formatDate(loan.date)}</div>
                  {loan.dueDate && <div>Due: {formatDate(loan.dueDate)}</div>}
                  {loan.description && <div>{loan.description}</div>}
                  {loan.clabe && <div>CLABE: {loan.clabe}</div>}
                </div>

                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="text-xs text-muted-foreground">Include in Dashboard</span>
                  <Switch
                    checked={loan.includeInDashboard}
                    onCheckedChange={() => handleToggleDashboard(loan)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <RecordPaymentDialog
        loan={selectedLoan}
        open={isPaymentDialogOpen}
        onOpenChange={(open) => {
          setIsPaymentDialogOpen(open);
          if (!open) setSelectedLoan(null);
        }}
      />

      <EditLoanDialog
        loan={editingLoan}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingLoan(null);
        }}
      />
    </>
  );
}
