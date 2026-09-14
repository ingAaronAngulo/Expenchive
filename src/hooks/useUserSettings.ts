import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from './useAuth';
import type { FavoritePaymentMethod } from '@/types';

export function useUserSettings() {
  const { user } = useAuth();
  const [favoritePaymentMethod, setFavoritePaymentMethod] = useState<FavoritePaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    return onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        const setting = snapshot.data()?.favoritePaymentMethod as FavoritePaymentMethod | undefined;
        setFavoritePaymentMethod(setting ?? null);
        setError(null);
        setLoading(false);
      },
      (snapshotError) => {
        console.error('Error loading user settings:', snapshotError);
        setError('Failed to load user settings');
        setLoading(false);
      }
    );
  }, [user]);

  return {
    favoritePaymentMethod: user ? favoritePaymentMethod : null,
    loading: user ? loading : false,
    error: user ? error : null,
  };
}
