import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './useAuth';
import type { RecurringExpense } from '@/types';

export function useRecurringExpenses() {
  const { user } = useAuth();
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRecurringExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'recurringExpenses'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const recurringData: RecurringExpense[] = [];
        querySnapshot.forEach((doc) => {
          recurringData.push({
            id: doc.id,
            ...doc.data(),
          } as RecurringExpense);
        });
        setRecurringExpenses(recurringData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching recurring expenses:', err);
        setError('Failed to load recurring expenses');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { recurringExpenses, loading, error };
}
