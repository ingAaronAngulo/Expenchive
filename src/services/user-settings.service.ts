import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { FavoritePaymentMethod } from '@/types';

export async function saveFavoritePaymentMethod(
  userId: string,
  favoritePaymentMethod: FavoritePaymentMethod
): Promise<void> {
  await setDoc(
    doc(db, 'users', userId),
    {
      favoritePaymentMethod,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
