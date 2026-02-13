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
  runTransaction,
  getDoc,
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

/**
 * Pay credit card from an account
 * This will decrease the credit card balance and the account balance
 */
export async function payCreditCard(
  cardId: string,
  accountId: string,
  amount: number
): Promise<void> {
  if (amount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }

  await runTransaction(db, async (transaction) => {
    const cardRef = doc(db, COLLECTION_NAME, cardId);
    const accountRef = doc(db, 'accounts', accountId);

    // Get current balances
    const cardDoc = await transaction.get(cardRef);
    const accountDoc = await transaction.get(accountRef);

    if (!cardDoc.exists()) {
      throw new Error('Credit card not found');
    }
    if (!accountDoc.exists()) {
      throw new Error('Account not found');
    }

    const currentCardBalance = cardDoc.data().currentBalance || 0;
    const currentAccountBalance = accountDoc.data().balance || 0;

    // Check if account has sufficient funds
    if (currentAccountBalance < amount) {
      throw new Error('Insufficient funds in account');
    }

    // Calculate new balances
    const newCardBalance = Math.max(0, currentCardBalance - amount);
    const newAccountBalance = currentAccountBalance - amount;

    // Update both documents
    transaction.update(cardRef, {
      currentBalance: newCardBalance,
      updatedAt: serverTimestamp(),
    });

    transaction.update(accountRef, {
      balance: newAccountBalance,
      updatedAt: serverTimestamp(),
    });
  });
}
