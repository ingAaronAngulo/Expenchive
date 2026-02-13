import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './useAuth';
import type { CreditCard } from '@/types';

export function useCreditCards() {
  const { user } = useAuth();
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCreditCards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'creditCards'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const cardsData: CreditCard[] = [];
        querySnapshot.forEach((doc) => {
          cardsData.push({
            id: doc.id,
            ...doc.data(),
          } as CreditCard);
        });
        setCreditCards(cardsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching credit cards:', err);
        setError('Failed to load credit cards');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { creditCards, loading, error };
}
