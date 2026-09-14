import { useState, type FormEvent } from 'react';
import { LockKeyhole, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import {
  removeExpenseCategory,
  saveExpenseCategories,
} from '@/services/expense-categories.service';
import { GENERAL_CATEGORY } from '@/utils/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useTranslation } from 'react-i18next';

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriesChanged?: () => void;
}

export function ManageCategoriesDialog({
  open,
  onOpenChange,
  onCategoriesChanged,
}: ManageCategoriesDialogProps) {
  const { user } = useAuth();
  const { categories, loading, error: loadError } = useExpenseCategories();
  const [newCategory, setNewCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const category = newCategory.trim().replace(/\s+/g, ' ');
    if (!category) return;
    if (category.length > 40) {
      setActionError(t('categories.nameTooLong'));
      return;
    }
    if (categories.some((existing) => existing.toLocaleLowerCase() === category.toLocaleLowerCase())) {
      setActionError(t('categories.alreadyExists'));
      return;
    }

    try {
      setSaving(true);
      setActionError(null);
      await saveExpenseCategories(user.uid, [...categories, category]);
      setNewCategory('');
    } catch (saveError) {
      console.error('Failed to add expense category:', saveError);
      setActionError(t('categories.failedAdd'));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (category: string) => {
    if (!user || category === GENERAL_CATEGORY) return;
    if (!confirm(t('categories.removeConfirmation', { category }))) return;

    try {
      setDeletingCategory(category);
      setActionError(null);
      await removeExpenseCategory(user.uid, category, categories);
      onCategoriesChanged?.();
    } catch (removeError) {
      console.error('Failed to remove expense category:', removeError);
      setActionError(t('categories.failedRemove'));
    } finally {
      setDeletingCategory(null);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setNewCategory('');
      setActionError(null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('categories.title')}</DialogTitle>
          <DialogDescription>{t('categories.description')}</DialogDescription>
        </DialogHeader>

        {(loadError || actionError) && <ErrorMessage message={actionError ?? loadError ?? ''} />}

        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder={t('categories.namePlaceholder')}
            maxLength={40}
            disabled={saving || !!deletingCategory}
            aria-label={t('categories.namePlaceholder')}
          />
          <Button type="submit" disabled={saving || !!deletingCategory || !newCategory.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            {saving ? t('common.adding') : t('common.add')}
          </Button>
        </form>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="divide-y rounded-md border">
            {categories.map((category) => {
              const isGeneral = category === GENERAL_CATEGORY;
              const isDeleting = deletingCategory === category;

              return (
                <div key={category} className="flex min-h-12 items-center gap-3 px-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{category}</span>
                  {isGeneral ? (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <LockKeyhole className="h-3.5 w-3.5" />
                      {t('categories.default')}
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => void handleRemove(category)}
                      disabled={!!deletingCategory || saving}
                      aria-label={t('categories.remove', { category })}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t('categories.remove', { category })}</span>
                      {isDeleting && <span className="ml-2">{t('common.processing')}</span>}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
