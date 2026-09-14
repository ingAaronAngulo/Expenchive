import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { LoanPayment } from '@/types';
import { useAuth } from './useAuth';

export function useLoanPayments(loanId: string | null, enabled = true) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !loanId || !enabled) {
      return;
    }

    return onSnapshot(
      query(
        collection(db, 'loanPayments'),
        where('userId', '==', user.uid),
        where('loanId', '==', loanId)
      ),
      (snapshot) => {
        const nextPayments = snapshot.docs
          .map((payment) => ({ id: payment.id, ...payment.data() }) as LoanPayment)
          .sort((a, b) => b.date.toMillis() - a.date.toMillis());
        setPayments(nextPayments);
        setError(null);
        setLoading(false);
      },
      (snapshotError) => {
        console.error('Error loading loan payments:', snapshotError);
        setError('Failed to load loan records');
        setLoading(false);
      }
    );
  }, [user, loanId, enabled]);

  return { payments, loading, error };
}
