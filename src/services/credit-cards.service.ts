import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { CreditCard, CreateCreditCardData, UpdateCreditCardData } from '@/types';
import { createCreditCardSchema, updateCreditCardSchema } from '@/schemas';

const COLLECTION_NAME = 'creditCards';

/**
 * Create a new credit card
 */
export async function createCreditCard(
  userId: string,
  data: CreateCreditCardData
): Promise<string> {
  // Validate input data
  const validatedData = createCreditCardSchema.parse(data);

  const cardData = {
    userId,
    name: validatedData.name,
    creditLimit: validatedData.creditLimit,
    currentBalance: validatedData.currentBalance,
    lastFourDigits: validatedData.lastFourDigits ?? null,
    interestRate: validatedData.interestRate ?? null,
    billingCycleDay: validatedData.billingCycleDay ?? null,
    paymentDueDay: validatedData.paymentDueDay ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), cardData);
  return docRef.id;
}

/**
 * Update an existing credit card
 */
export async function updateCreditCard(
  cardId: string,
  data: UpdateCreditCardData
): Promise<void> {
  // Validate input data
  const validatedData = updateCreditCardSchema.parse(data);

  const cardRef = doc(db, COLLECTION_NAME, cardId);
  await updateDoc(cardRef, {
    ...validatedData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a credit card
 */
export async function deleteCreditCard(cardId: string): Promise<void> {
  const cardRef = doc(db, COLLECTION_NAME, cardId);
  await deleteDoc(cardRef);
}

/**
 * Get all credit cards for a user
 */
export async function getUserCreditCards(userId: string): Promise<CreditCard[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as CreditCard));
}
