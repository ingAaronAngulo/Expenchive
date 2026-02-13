/**
 * Transaction utilities for safe, atomic Firestore operations
 *
 * This module provides helpers to ensure data consistency and prevent race conditions
 */

import { runTransaction, doc, Transaction } from 'firebase/firestore';
import { db } from '@/config/firebase';

/**
 * Safely increment or decrement a numeric field using a transaction
 * Prevents race conditions when multiple operations update the same field
 *
 * @example
 * await atomicIncrement('accounts', accountId, 'balance', -50); // Deduct 50
 * await atomicIncrement('creditCards', cardId, 'currentBalance', 100); // Add 100
 */
export async function atomicIncrement(
  collection: string,
  docId: string,
  field: string,
  incrementBy: number
): Promise<void> {
  const docRef = doc(db, collection, docId);

  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(docRef);

    if (!docSnap.exists()) {
      throw new Error(`Document ${docId} not found in ${collection}`);
    }

    const currentValue = docSnap.data()[field] || 0;
    const newValue = currentValue + incrementBy;

    transaction.update(docRef, {
      [field]: newValue,
      updatedAt: new Date(),
    });
  });
}

/**
 * Transfer balance between two accounts atomically
 * Ensures both operations succeed or both fail
 *
 * @example
 * await transferBalance('accounts', fromAccountId, toAccountId, 1000);
 */
export async function transferBalance(
  collection: string,
  fromDocId: string,
  toDocId: string,
  amount: number
): Promise<void> {
  if (amount <= 0) {
    throw new Error('Transfer amount must be positive');
  }

  const fromRef = doc(db, collection, fromDocId);
  const toRef = doc(db, collection, toDocId);

  await runTransaction(db, async (transaction) => {
    const [fromSnap, toSnap] = await Promise.all([
      transaction.get(fromRef),
      transaction.get(toRef),
    ]);

    if (!fromSnap.exists() || !toSnap.exists()) {
      throw new Error('Source or destination document not found');
    }

    const fromBalance = fromSnap.data().balance || 0;
    const toBalance = toSnap.data().balance || 0;

    // Optional: Check for sufficient funds
    if (fromBalance < amount) {
      throw new Error('Insufficient funds for transfer');
    }

    transaction.update(fromRef, {
      balance: fromBalance - amount,
      updatedAt: new Date(),
    });

    transaction.update(toRef, {
      balance: toBalance + amount,
      updatedAt: new Date(),
    });
  });
}

/**
 * Execute multiple writes atomically using a transaction
 * All operations succeed together or all fail together
 *
 * @example
 * await atomicBatchWrite(async (transaction) => {
 *   const userRef = doc(db, 'users', userId);
 *   const settingsRef = doc(db, 'settings', settingsId);
 *
 *   const userSnap = await transaction.get(userRef);
 *   transaction.update(userRef, { lastLogin: new Date() });
 *   transaction.set(settingsRef, { theme: 'dark' });
 * });
 */
export async function atomicBatchWrite(
  operation: (transaction: Transaction) => Promise<void>
): Promise<void> {
  await runTransaction(db, operation);
}
