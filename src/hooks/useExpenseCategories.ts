import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';
import { DEFAULT_EXPENSE_CATEGORIES, GENERAL_CATEGORY } from '@/utils/constants';

function getValidCategories(value: unknown): string[] {
  if (!Array.isArray(value)) return DEFAULT_EXPENSE_CATEGORIES;

  const categories = value.filter(
    (category): category is string => typeof category === 'string' && category.trim().length > 0
  );
  const withoutGeneral = categories.filter(
    (category) => category.toLocaleLowerCase() !== GENERAL_CATEGORY.toLocaleLowerCase()
  );

  return [GENERAL_CATEGORY, ...withoutGeneral];
}

export function useExpenseCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<string[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    return onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        setCategories(getValidCategories(snapshot.data()?.expenseCategories));
        setError(null);
        setLoading(false);
      },
      (snapshotError) => {
        console.error('Error loading expense categories:', snapshotError);
        setError('Failed to load categories');
        setLoading(false);
      }
    );
  }, [user]);

  return {
    categories: user ? categories : DEFAULT_EXPENSE_CATEGORIES,
    loading: user ? loading : false,
    error: user ? error : null,
  };
}
