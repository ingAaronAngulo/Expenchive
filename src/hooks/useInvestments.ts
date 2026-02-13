import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './useAuth';
import type { Investment } from '@/types';

export function useInvestments() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'investments'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const investmentsData: Investment[] = [];
        querySnapshot.forEach((doc) => {
          investmentsData.push({
            id: doc.id,
            ...doc.data(),
          } as Investment);
        });
        setInvestments(investmentsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching investments:', err);
        setError('Failed to load investments');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { investments, loading, error };
}
