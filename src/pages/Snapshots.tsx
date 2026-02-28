import { useState } from 'react';
import { Camera, TrendingUp, TrendingDown, DollarSign, Trash2 } from 'lucide-react';
import { useSnapshots } from '@/hooks/useSnapshots';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { deleteSnapshot } from '@/services/snapshots.service';
import type { DashboardSnapshot } from '@/types';
import { useTranslation } from 'react-i18next';

function SnapshotCard({
  snapshot,
  onDeleted,
}: {
  snapshot: DashboardSnapshot;
  onDeleted: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { t, i18n } = useTranslation();

  const date = snapshot.createdAt?.toDate ? snapshot.createdAt.toDate() : new Date();

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteSnapshot(snapshot.id);
      onDeleted(snapshot.id);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">
            {date.toLocaleDateString(i18n.language, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </CardTitle>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-muted-foreground">
              {date.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
            </span>
            {confirming ? (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? t('snapshots.deleting') : t('snapshots.confirm')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setConfirming(false)}
                  disabled={deleting}
                >
                  {t('snapshots.cancel')}
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => setConfirming(true)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {t('financial.totalMoney')}
            </span>
            <span className="font-semibold text-green-600 dark:text-green-400 text-sm">
              {formatCurrency(snapshot.totalMoney)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> {t('financial.totalDebt')}
            </span>
            <span className="font-semibold text-red-600 dark:text-red-400 text-sm">
              {formatCurrency(snapshot.totalDebt)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> {t('financial.netWorth')}
            </span>
            <span
              className={`font-semibold text-sm ${
                snapshot.netWorth >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatCurrency(snapshot.netWorth)}
            </span>
          </div>
        </div>

        {(snapshot.totalLent > 0 || snapshot.totalBorrowed > 0) && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
            {snapshot.totalLent > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{t('financial.totalLent')}</span>
                <span className="text-sm font-medium">{formatCurrency(snapshot.totalLent)}</span>
              </div>
            )}
            {snapshot.totalBorrowed > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{t('financial.totalBorrowed')}</span>
                <span className="text-sm font-medium">{formatCurrency(snapshot.totalBorrowed)}</span>
              </div>
            )}
          </div>
        )}

        {snapshot.categoryBreakdown.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Expense breakdown</p>
            <div className="space-y-1">
              {snapshot.categoryBreakdown.slice(0, 5).map((cat) => (
                <div key={cat.category} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate">{cat.category}</span>
                  <span className="font-medium ml-2 shrink-0">{formatCurrency(cat.total)}</span>
                </div>
              ))}
              {snapshot.categoryBreakdown.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  +{snapshot.categoryBreakdown.length - 5} more categories
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Snapshots() {
  const { snapshots, loading, refresh } = useSnapshots();
  const { t } = useTranslation();

  function handleDeleted(id: string) {
    refresh();
    void id;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t('snapshots.title')}</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          {t('snapshots.description')}
        </p>
      </div>

      {snapshots.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border border-dashed rounded-lg">
          <Camera className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-lg font-medium mb-1">{t('snapshots.noSnapshots')}</p>
          <p className="text-sm">{t('snapshots.noSnapshotsDescription')}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {snapshots.map((snapshot) => (
            <SnapshotCard key={snapshot.id} snapshot={snapshot} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}
