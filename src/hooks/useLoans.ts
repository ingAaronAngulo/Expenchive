import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './useAuth';
import type { Loan } from '@/types';

export function useLoans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoans([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'loans'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const loansData: Loan[] = [];
        querySnapshot.forEach((doc) => {
          loansData.push({ id: doc.id, ...doc.data() } as Loan);
        });
        setLoans(loansData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching loans:', err);
        setError('Failed to load loans');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { loans, loading, error };
}
