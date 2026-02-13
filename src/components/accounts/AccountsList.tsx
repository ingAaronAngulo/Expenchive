import { useState } from 'react';
import { MoreVertical, Edit, Trash2, Wallet } from 'lucide-react';
import { deleteAccount } from '@/services/accounts.service';
import { formatCurrency, formatAccountType } from '@/utils/formatters';
import type { Account } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditAccountDialog } from './EditAccountDialog';

interface AccountsListProps {
  accounts: Account[];
}

export function AccountsList({ accounts }: AccountsListProps) {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const calculateDailyReturn = (balance: number, annualReturn: number | null | undefined) => {
    if (!annualReturn || annualReturn === 0) return null;
    return (balance * annualReturn / 100) / 365;
  };

  const calculateMonthlyReturn = (balance: number, annualReturn: number | null | undefined) => {
    if (!annualReturn || annualReturn === 0) return null;
    return (balance * annualReturn / 100) / 12;
  };

  const calculateAnnualReturnAmount = (balance: number, annualReturn: number | null | undefined) => {
    if (!annualReturn || annualReturn === 0) return null;
    return balance * annualReturn / 100;
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      setDeletingId(accountId);
      await deleteAccount(accountId);
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {account.name}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={deletingId === account.id}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingAccount(account)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(account.id)}
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
                <Wallet className="h-4 w-4" />
                <span>{formatAccountType(account.type)}</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatCurrency(account.balance, account.currency)}
                </div>
                {account.annualReturn != null && account.annualReturn !== 0 && (
                  <div className="space-y-1 pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Annual Return Rate:</span>
                      <span className={account.annualReturn >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {account.annualReturn.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Daily:</span>
                      <span className={calculateDailyReturn(account.balance, account.annualReturn)! >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {formatCurrency(calculateDailyReturn(account.balance, account.annualReturn)!, account.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monthly:</span>
                      <span className={calculateMonthlyReturn(account.balance, account.annualReturn)! >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {formatCurrency(calculateMonthlyReturn(account.balance, account.annualReturn)!, account.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Annual:</span>
                      <span className={calculateAnnualReturnAmount(account.balance, account.annualReturn)! >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {formatCurrency(calculateAnnualReturnAmount(account.balance, account.annualReturn)!, account.currency)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EditAccountDialog
        open={!!editingAccount}
        onOpenChange={(open) => !open && setEditingAccount(null)}
        account={editingAccount}
      />
    </>
  );
}
