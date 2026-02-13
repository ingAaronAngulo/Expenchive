import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './useAuth';
import type { Expense } from '@/types';

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const expensesData: Expense[] = [];
        querySnapshot.forEach((doc) => {
          expensesData.push({
            id: doc.id,
            ...doc.data(),
          } as Expense);
        });
        setExpenses(expensesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching expenses:', err);
        setError('Failed to load expenses');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { expenses, loading, error };
}
