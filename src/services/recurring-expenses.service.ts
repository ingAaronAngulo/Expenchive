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
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { RecurringExpense, CreateRecurringExpenseData, UpdateRecurringExpenseData } from '@/types';
import { calculateNextDueDate } from '@/utils/date';
import { createRecurringExpenseSchema, updateRecurringExpenseSchema } from '@/schemas';

const COLLECTION_NAME = 'recurringExpenses';

/**
 * Create a new recurring expense
 */
export async function createRecurringExpense(
  userId: string,
  data: CreateRecurringExpenseData
): Promise<string> {
  // Validate input data
  const validatedData = createRecurringExpenseSchema.parse(data);

  const startDate = validatedData.startDate instanceof Date ? validatedData.startDate : (validatedData.startDate as Timestamp).toDate();
  const nextDueDate = calculateNextDueDate(startDate, validatedData.frequency);

  const recurringData = {
    userId,
    name: validatedData.name,
    amount: validatedData.amount,
    category: validatedData.category,
    frequency: validatedData.frequency,
    paymentType: validatedData.paymentType,
    accountId: validatedData.accountId ?? null,
    creditCardId: validatedData.creditCardId ?? null,
    isInstallment: validatedData.isInstallment ?? false,
    installmentMonths: validatedData.installmentMonths ?? null,

    startDate: Timestamp.fromDate(startDate),
    nextDueDate: Timestamp.fromDate(nextDueDate),
    endDate: validatedData.endDate
      ? (validatedData.endDate instanceof Date ? Timestamp.fromDate(validatedData.endDate) : validatedData.endDate)
      : null,
    isActive: true,

    lastCreatedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), recurringData);
  return docRef.id;
}

/**
 * Update an existing recurring expense
 */
export async function updateRecurringExpense(
  recurringId: string,
  data: UpdateRecurringExpenseData
): Promise<void> {
  // Validate input data
  const validatedData = updateRecurringExpenseSchema.parse(data);

  const updateData: any = {
    ...validatedData,
    updatedAt: serverTimestamp(),
  };

  // Convert dates to Timestamps if needed
  if (validatedData.startDate) {
    updateData.startDate = validatedData.startDate instanceof Date
      ? Timestamp.fromDate(validatedData.startDate)
      : validatedData.startDate;
  }
  if (validatedData.nextDueDate) {
    updateData.nextDueDate = validatedData.nextDueDate instanceof Date
      ? Timestamp.fromDate(validatedData.nextDueDate)
      : validatedData.nextDueDate;
  }
  if (validatedData.endDate) {
    updateData.endDate = validatedData.endDate instanceof Date
      ? Timestamp.fromDate(validatedData.endDate)
      : validatedData.endDate;
  }
  if (validatedData.lastCreatedAt) {
    updateData.lastCreatedAt = validatedData.lastCreatedAt instanceof Date
      ? Timestamp.fromDate(validatedData.lastCreatedAt)
      : validatedData.lastCreatedAt;
  }

  const recurringRef = doc(db, COLLECTION_NAME, recurringId);
  await updateDoc(recurringRef, updateData);
}

/**
 * Delete a recurring expense
 */
export async function deleteRecurringExpense(recurringId: string): Promise<void> {
  const recurringRef = doc(db, COLLECTION_NAME, recurringId);
  await deleteDoc(recurringRef);
}

/**
 * Get all recurring expenses for a user
 */
export async function getUserRecurringExpenses(userId: string): Promise<RecurringExpense[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as RecurringExpense));
}

/**
 * Toggle recurring expense active status
 */
export async function toggleRecurringExpense(
  recurringId: string,
  isActive: boolean
): Promise<void> {
  const recurringRef = doc(db, COLLECTION_NAME, recurringId);
  await updateDoc(recurringRef, {
    isActive,
    updatedAt: serverTimestamp(),
  });
}
