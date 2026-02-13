import { useState } from 'react';
import { MoreVertical, Trash2, CreditCard as CreditCardIcon, Pencil, Calendar, Clock } from 'lucide-react';
import { deleteCreditCard } from '@/services/credit-cards.service';
import { formatCurrency } from '@/utils/formatters';
import { adjustToPreviousBusinessDay } from '@/utils/date';
import { differenceInDays, format, setDate } from 'date-fns';
import type { CreditCard } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditCreditCardDialog } from './EditCreditCardDialog';

interface CreditCardsListProps {
  creditCards: CreditCard[];
}

function getPaymentDueDateInfo(card: CreditCard) {
  if (!card.paymentDueDay) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  // Determine which month's payment we're looking at
  let targetMonth = currentMonth;
  let targetYear = currentYear;

  // If we're past the payment due day, look at next month
  if (currentDay > card.paymentDueDay) {
    targetMonth++;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear++;
    }
  }

  // Create the target date
  let dueDate = new Date(targetYear, targetMonth, 1);
  dueDate = setDate(dueDate, Math.min(card.paymentDueDay, new Date(targetYear, targetMonth + 1, 0).getDate()));

  // Adjust to previous business day if needed
  const adjustedDueDate = adjustToPreviousBusinessDay(dueDate);

  const daysRemaining = differenceInDays(adjustedDueDate, now);

  return {
    dueDate: adjustedDueDate,
    daysRemaining,
    formattedDate: format(adjustedDueDate, 'MMM d, yyyy'),
  };
}

function getClosingDateInfo(card: CreditCard) {
  if (!card.billingCycleDay) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();

  // Determine which month's closing date we're looking at
  let targetMonth = currentMonth;
  let targetYear = currentYear;

  // If we're past the closing day, look at next month
  if (currentDay > card.billingCycleDay) {
    targetMonth++;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear++;
    }
  }

  // Create the target date
  let closingDate = new Date(targetYear, targetMonth, 1);
  closingDate = setDate(closingDate, Math.min(card.billingCycleDay, new Date(targetYear, targetMonth + 1, 0).getDate()));

  const daysRemaining = differenceInDays(closingDate, now);

  return {
    closingDate,
    daysRemaining,
    formattedDate: format(closingDate, 'MMM d, yyyy'),
  };
}

export function CreditCardsList({ creditCards }: CreditCardsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  const handleDelete = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this credit card?')) return;

    try {
      setDeletingId(cardId);
      await deleteCreditCard(cardId);
    } catch (error) {
      console.error('Failed to delete credit card:', error);
      alert('Failed to delete credit card');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creditCards.map((card) => (
          <Card key={card.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.name}
                {card.lastFourDigits && (
                  <span className="text-muted-foreground ml-2">••{card.lastFourDigits}</span>
                )}
              </CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={deletingId === card.id}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingCard(card)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(card.id)}
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
                <CreditCardIcon className="h-4 w-4" />
                <span>Credit Card</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(card.currentBalance)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current Balance
                  </div>
                  {card.creditLimit && (
                    <div className="text-sm text-muted-foreground">
                      Limit: {formatCurrency(card.creditLimit)}
                    </div>
                  )}
                </div>

                {(() => {
                  const paymentInfo = getPaymentDueDateInfo(card);
                  const closingInfo = getClosingDateInfo(card);

                  return (
                    <div className="space-y-2 pt-2 border-t">
                      {closingInfo && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Statement Closes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{closingInfo.formattedDate}</span>
                            <Badge variant={closingInfo.daysRemaining <= 3 ? "destructive" : "secondary"} className="text-xs">
                              {closingInfo.daysRemaining}d
                            </Badge>
                          </div>
                        </div>
                      )}

                      {paymentInfo && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Payment Due</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{paymentInfo.formattedDate}</span>
                            <Badge
                              variant={
                                paymentInfo.daysRemaining <= 3 ? "destructive" :
                                paymentInfo.daysRemaining <= 7 ? "default" :
                                "secondary"
                              }
                              className="text-xs"
                            >
                              {paymentInfo.daysRemaining}d
                            </Badge>
                          </div>
                        </div>
                      )}

                      {card.interestRate && (
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>APR</span>
                          <span>{card.interestRate}%</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EditCreditCardDialog
        open={!!editingCard}
        onOpenChange={(open) => !open && setEditingCard(null)}
        creditCard={editingCard}
      />
    </>
  );
}
