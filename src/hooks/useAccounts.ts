import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './useAuth';
import type { Account } from '@/types';

export function useAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'accounts'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const accountsData: Account[] = [];
        querySnapshot.forEach((doc) => {
          accountsData.push({
            id: doc.id,
            ...doc.data(),
          } as Account);
        });
        setAccounts(accountsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching accounts:', err);
        setError('Failed to load accounts');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { accounts, loading, error };
}
