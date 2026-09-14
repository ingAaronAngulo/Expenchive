import { useEffect, useState } from 'react';
import { Check, Languages, LogOut, Moon, Plus, Repeat, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecurringExpenses } from '@/hooks/useRecurringExpenses';
import { useAccounts } from '@/hooks/useAccounts';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useUserSettings } from '@/hooks/useUserSettings';
import { saveFavoritePaymentMethod } from '@/services/user-settings.service';
import { signOut } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RecurringExpensesList } from '@/components/recurring-expenses/RecurringExpensesList';
import { AddRecurringExpenseDialog } from '@/components/recurring-expenses/AddRecurringExpenseDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from 'react-i18next';

export function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { recurringExpenses, loading, error } = useRecurringExpenses();
  const { accounts } = useAccounts();
  const { creditCards } = useCreditCards();
  const { favoritePaymentMethod, loading: settingsLoading } = useUserSettings();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [favoritePaymentType, setFavoritePaymentType] = useState<'debit' | 'credit'>('debit');
  const [favoriteAccountId, setFavoriteAccountId] = useState('');
  const [favoriteCreditCardId, setFavoriteCreditCardId] = useState('');
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [favoriteSaved, setFavoriteSaved] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language.startsWith('es') ? 'es' : 'en';

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate('/login');
    } catch (signOutError) {
      console.error('Failed to sign out:', signOutError);
      setSigningOut(false);
    }
  };

  useEffect(() => {
    if (favoritePaymentMethod?.type === 'debit') {
      setFavoritePaymentType('debit');
      setFavoriteAccountId(favoritePaymentMethod.accountId);
    } else if (favoritePaymentMethod?.type === 'credit') {
      setFavoritePaymentType('credit');
      setFavoriteCreditCardId(favoritePaymentMethod.creditCardId);
    }
  }, [favoritePaymentMethod]);

  const selectedFavoriteSource = favoritePaymentType === 'debit'
    ? favoriteAccountId
    : favoriteCreditCardId;

  const handleSaveFavoritePayment = async () => {
    if (!user || !selectedFavoriteSource) return;

    setSavingFavorite(true);
    setFavoriteSaved(false);
    setFavoriteError(null);

    try {
      await saveFavoritePaymentMethod(
        user.uid,
        favoritePaymentType === 'debit'
          ? { type: 'debit', accountId: favoriteAccountId }
          : { type: 'credit', creditCardId: favoriteCreditCardId }
      );
      setFavoriteSaved(true);
      setTimeout(() => setFavoriteSaved(false), 2500);
    } catch (saveError) {
      console.error('Error saving favorite payment method:', saveError);
      setFavoriteError(t('settings.favoritePaymentError'));
    } finally {
      setSavingFavorite(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          {t('settings.description')}
        </p>
      </div>

      {/* User Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile')}</CardTitle>
          <CardDescription>{t('settings.profileDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm font-medium text-muted-foreground">{t('settings.email')}:</span>
            <p className="text-sm">{user?.email}</p>
          </div>
          {user?.displayName && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">{t('settings.name')}:</span>
              <p className="text-sm">{user.displayName}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.appearance')}</CardTitle>
          <CardDescription>{t('settings.appearanceDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          <div className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Languages className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('settings.language')}</p>
                <p className="text-xs text-muted-foreground">{t('settings.languageDescription')}</p>
              </div>
            </div>
            <Select value={currentLanguage} onValueChange={(value) => void i18n.changeLanguage(value)}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {theme === 'light'
                ? <Sun className="h-5 w-5 text-muted-foreground" />
                : <Moon className="h-5 w-5 text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium">{t('settings.theme')}</p>
                <p className="text-xs text-muted-foreground">{t('settings.themeDescription')}</p>
              </div>
            </div>
            <Button variant="outline" onClick={toggleTheme} className="w-full sm:w-40">
              {theme === 'light' ? t('settings.lightTheme') : t('settings.darkTheme')}
            </Button>
          </div>

          <div className="flex flex-col gap-3 py-4 pb-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('settings.signOut')}</p>
                <p className="text-xs text-muted-foreground">{t('settings.signOutDescription')}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full text-destructive hover:text-destructive sm:w-40"
            >
              {signingOut ? t('settings.signingOut') : t('settings.signOut')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.favoritePayment')}</CardTitle>
          <CardDescription>{t('settings.favoritePaymentDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {favoriteError && <ErrorMessage message={favoriteError} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('form.paymentType')}</Label>
              <Select
                value={favoritePaymentType}
                onValueChange={(value) => {
                  setFavoritePaymentType(value as 'debit' | 'credit');
                  setFavoriteSaved(false);
                }}
                disabled={settingsLoading}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">{t('form.debitPayNow')}</SelectItem>
                  <SelectItem value="credit">{t('form.creditPayLater')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {favoritePaymentType === 'debit' ? t('form.account') : t('form.creditCard')}
              </Label>
              {favoritePaymentType === 'debit' ? (
                <Select
                  value={favoriteAccountId}
                  onValueChange={(value) => {
                    setFavoriteAccountId(value);
                    setFavoriteSaved(false);
                  }}
                  disabled={settingsLoading || accounts.length === 0}
                >
                  <SelectTrigger><SelectValue placeholder={t('form.selectAccount')} /></SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={favoriteCreditCardId}
                  onValueChange={(value) => {
                    setFavoriteCreditCardId(value);
                    setFavoriteSaved(false);
                  }}
                  disabled={settingsLoading || creditCards.length === 0}
                >
                  <SelectTrigger><SelectValue placeholder={t('form.selectCreditCard')} /></SelectTrigger>
                  <SelectContent>
                    {creditCards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {!selectedFavoriteSource && !settingsLoading && (
            <p className="text-sm text-muted-foreground">{t('settings.selectPaymentSource')}</p>
          )}

          <Button
            onClick={handleSaveFavoritePayment}
            disabled={settingsLoading || savingFavorite || !selectedFavoriteSource}
          >
            {favoriteSaved && <Check className="mr-2 h-4 w-4" />}
            {favoriteSaved
              ? t('settings.favoritePaymentSaved')
              : savingFavorite
                ? t('common.saving')
                : t('common.save')}
          </Button>
        </CardContent>
      </Card>

      {/* Recurring Expenses Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{t('settings.recurringExpenses')}</CardTitle>
            <CardDescription>{t('settings.recurringExpensesDescription')}</CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {t('settings.addRecurring')}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <ErrorMessage message={error} />
          ) : recurringExpenses.length === 0 ? (
            <EmptyState
              icon={Repeat}
              title={t('settings.noRecurring')}
              description={t('settings.noRecurringDescription')}
              actionLabel={t('settings.addRecurring')}
              onAction={() => setIsAddDialogOpen(true)}
            />
          ) : (
            <RecurringExpensesList recurringExpenses={recurringExpenses} />
          )}
        </CardContent>
      </Card>

      {/* Note about Cloud Functions */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm text-foreground">
            <strong>{t('common.note')}:</strong> {t('settings.cloudFunctionsNote')}
          </p>
        </CardContent>
      </Card>

      <AddRecurringExpenseDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
