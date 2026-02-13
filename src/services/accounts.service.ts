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
import type { Account, CreateAccountData, UpdateAccountData } from '@/types';
import { DEFAULT_CURRENCY } from '@/utils/constants';
import { createAccountSchema, updateAccountSchema } from '@/schemas';

const COLLECTION_NAME = 'accounts';

/**
 * Create a new account
 */
export async function createAccount(
  userId: string,
  data: CreateAccountData
): Promise<string> {
  // Validate input data
  const validatedData = createAccountSchema.parse(data);

  const accountData = {
    userId,
    name: validatedData.name,
    type: validatedData.type,
    balance: validatedData.balance,
    currency: validatedData.currency || DEFAULT_CURRENCY,
    annualReturn: validatedData.annualReturn ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), accountData);
  return docRef.id;
}

/**
 * Update an existing account
 */
export async function updateAccount(
  accountId: string,
  data: UpdateAccountData
): Promise<void> {
  // Validate input data
  const validatedData = updateAccountSchema.parse(data);

  const accountRef = doc(db, COLLECTION_NAME, accountId);
  await updateDoc(accountRef, {
    ...validatedData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete an account
 */
export async function deleteAccount(accountId: string): Promise<void> {
  const accountRef = doc(db, COLLECTION_NAME, accountId);
  await deleteDoc(accountRef);
}

/**
 * Get all accounts for a user
 */
export async function getUserAccounts(userId: string): Promise<Account[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Account));
}

/**
 * Update account balance (for debit transactions)
 */
export async function updateAccountBalance(
  accountId: string,
  newBalance: number
): Promise<void> {
  const accountRef = doc(db, COLLECTION_NAME, accountId);
  await updateDoc(accountRef, {
    balance: newBalance,
    updatedAt: serverTimestamp(),
  });
}
