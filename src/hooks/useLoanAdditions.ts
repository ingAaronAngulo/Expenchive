import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { LoanAddition } from '@/types';
import { useAuth } from './useAuth';

export function useLoanAdditions(loanId: string | null, enabled = true) {
  const { user } = useAuth();
  const [additions, setAdditions] = useState<LoanAddition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !loanId || !enabled) {
      return;
    }

    return onSnapshot(
      query(
        collection(db, 'loanAdditions'),
        where('userId', '==', user.uid),
        where('loanId', '==', loanId)
      ),
      (snapshot) => {
        const nextAdditions = snapshot.docs
          .map((addition) => ({ id: addition.id, ...addition.data() }) as LoanAddition)
          .sort((a, b) => b.date.toMillis() - a.date.toMillis());
        setAdditions(nextAdditions);
        setError(null);
        setLoading(false);
      },
      (snapshotError) => {
        console.error('Error loading loan additions:', snapshotError);
        setError('Failed to load loan records');
        setLoading(false);
      }
    );
  }, [user, loanId, enabled]);

  return { additions, loading, error };
}
