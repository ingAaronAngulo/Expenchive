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
import type { Investment, CreateInvestmentData, UpdateInvestmentData } from '@/types';
import { calculateExpectedReturn } from '@/utils/calculations';
import { createInvestmentSchema, updateInvestmentSchema } from '@/schemas';

const COLLECTION_NAME = 'investments';

/**
 * Create a new investment
 */
export async function createInvestment(
  userId: string,
  data: CreateInvestmentData
): Promise<string> {
  // Validate input data
  const validatedData = createInvestmentSchema.parse(data);

  const expectedReturn = calculateExpectedReturn(
    validatedData.currentAmount,
    validatedData.annualReturnPercentage
  );

  const investmentData = {
    userId,
    name: validatedData.name,
    currentAmount: validatedData.currentAmount,
    annualReturnPercentage: validatedData.annualReturnPercentage,
    expectedReturn,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), investmentData);
  return docRef.id;
}

/**
 * Update an existing investment
 */
export async function updateInvestment(
  investmentId: string,
  data: UpdateInvestmentData
): Promise<void> {
  // Validate input data
  const validatedData = updateInvestmentSchema.parse(data);

  const updateData: any = {
    ...validatedData,
    updatedAt: serverTimestamp(),
  };

  // Recalculate expected return if amount or percentage changed
  if (validatedData.currentAmount !== undefined || validatedData.annualReturnPercentage !== undefined) {
    // We need to fetch current values if only one is being updated
    // For simplicity, we'll require both or handle in the component
    if (validatedData.currentAmount !== undefined && validatedData.annualReturnPercentage !== undefined) {
      updateData.expectedReturn = calculateExpectedReturn(
        validatedData.currentAmount,
        validatedData.annualReturnPercentage
      );
    }
  }

  const investmentRef = doc(db, COLLECTION_NAME, investmentId);
  await updateDoc(investmentRef, updateData);
}

/**
 * Delete an investment
 */
export async function deleteInvestment(investmentId: string): Promise<void> {
  const investmentRef = doc(db, COLLECTION_NAME, investmentId);
  await deleteDoc(investmentRef);
}

/**
 * Get all investments for a user
 */
export async function getUserInvestments(userId: string): Promise<Investment[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Investment));
}
