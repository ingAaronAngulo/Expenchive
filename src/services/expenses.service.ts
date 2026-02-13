import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Expense, CreateExpenseData, UpdateExpenseData } from '@/types';
import { calculateMonthlyPayment } from '@/utils/calculations';
import { createExpenseSchema, updateExpenseSchema } from '@/schemas';

const COLLECTION_NAME = 'expenses';

/**
 * Create a new expense
 */
export async function createExpense(
  userId: string,
  data: CreateExpenseData
): Promise<string> {
  // Validate input data
  const validatedData = createExpenseSchema.parse(data);

  const isInstallment = validatedData.isInstallment || false;
  const installmentMonths = validatedData.installmentMonths || null;
  const monthlyPayment = isInstallment && installmentMonths
    ? calculateMonthlyPayment(validatedData.amount, installmentMonths)
    : null;

  const expenseData = {
    userId,
    name: validatedData.name,
    amount: validatedData.amount,
    category: validatedData.category,
    date: validatedData.date instanceof Date ? Timestamp.fromDate(validatedData.date) : validatedData.date,
    paymentType: validatedData.paymentType,

    // Debit fields
    accountId: validatedData.accountId ?? null,

    // Credit fields
    creditCardId: validatedData.creditCardId ?? null,
    isInstallment,
    installmentMonths,
    installmentMonthsPaid: 0,
    monthlyPayment,
    installmentStartDate: isInstallment
      ? (validatedData.date instanceof Date ? Timestamp.fromDate(validatedData.date) : validatedData.date)
      : null,
    remainingDebt: validatedData.paymentType === 'credit' ? validatedData.amount : 0,
    isFullyPaid: validatedData.paymentType === 'debit',

    // Recurring metadata
    isFromRecurring: validatedData.isFromRecurring ?? false,
    recurringExpenseId: validatedData.recurringExpenseId ?? null,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Use transaction to ensure atomic operations
  // If debit payment, we need to update account balance atomically
  if (validatedData.paymentType === 'debit' && validatedData.accountId) {
    return runTransaction(db, async (transaction) => {
      const accountRef = doc(db, 'accounts', validatedData.accountId!);
      const accountSnap = await transaction.get(accountRef);

      if (!accountSnap.exists()) {
        throw new Error('Account not found');
      }

      const currentBalance = accountSnap.data().balance;
      const newBalance = currentBalance - validatedData.amount;

      // Validate balance won't go negative (optional, based on business rules)
      if (newBalance < -10000) { // Allow some reasonable overdraft
        throw new Error('Insufficient funds in account');
      }

      // Create expense document
      const expenseRef = doc(collection(db, COLLECTION_NAME));
      transaction.set(expenseRef, expenseData);

      // Update account balance
      transaction.update(accountRef, {
        balance: newBalance,
        updatedAt: serverTimestamp(),
      });

      return expenseRef.id;
    });
  }

  // If credit payment, we need to update credit card balance atomically
  if (validatedData.paymentType === 'credit' && validatedData.creditCardId) {
    return runTransaction(db, async (transaction) => {
      const cardRef = doc(db, 'creditCards', validatedData.creditCardId!);
      const cardSnap = await transaction.get(cardRef);

      if (!cardSnap.exists()) {
        throw new Error('Credit card not found');
      }

      const currentBalance = cardSnap.data().currentBalance;
      const newBalance = currentBalance + validatedData.amount;

      // Create expense document
      const expenseRef = doc(collection(db, COLLECTION_NAME));
      transaction.set(expenseRef, expenseData);

      // Update credit card balance
      transaction.update(cardRef, {
        currentBalance: newBalance,
        updatedAt: serverTimestamp(),
      });

      return expenseRef.id;
    });
  }

  // For payments without account/card association, simple addDoc is fine
  const docRef = await addDoc(collection(db, COLLECTION_NAME), expenseData);
  return docRef.id;
}

/**
 * Update an existing expense
 */
export async function updateExpense(
  expenseId: string,
  data: UpdateExpenseData
): Promise<void> {
  // Validate input data
  const validatedData = updateExpenseSchema.parse(data);

  const expenseRef = doc(db, COLLECTION_NAME, expenseId);
  await updateDoc(expenseRef, {
    ...validatedData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete an expense
 * Uses transaction to ensure account balance is refunded atomically for debit payments
 */
export async function deleteExpense(expenseId: string): Promise<void> {
  return runTransaction(db, async (transaction) => {
    const expenseRef = doc(db, COLLECTION_NAME, expenseId);
    const expenseSnap = await transaction.get(expenseRef);

    if (!expenseSnap.exists()) {
      throw new Error('Expense not found');
    }

    const expense = expenseSnap.data() as Expense;

    // If debit payment, refund the account balance
    if (expense.paymentType === 'debit' && expense.accountId) {
      const accountRef = doc(db, 'accounts', expense.accountId);
      const accountSnap = await transaction.get(accountRef);

      if (accountSnap.exists()) {
        const currentBalance = accountSnap.data().balance;
        transaction.update(accountRef, {
          balance: currentBalance + expense.amount, // Refund the amount
          updatedAt: serverTimestamp(),
        });
      }
    }

    // If credit payment, refund the credit card balance
    if (expense.paymentType === 'credit' && expense.creditCardId) {
      const cardRef = doc(db, 'creditCards', expense.creditCardId);
      const cardSnap = await transaction.get(cardRef);

      if (cardSnap.exists()) {
        const currentBalance = cardSnap.data().currentBalance;
        transaction.update(cardRef, {
          currentBalance: currentBalance - expense.amount, // Reduce debt
          updatedAt: serverTimestamp(),
        });
      }
    }

    // Delete the expense
    transaction.delete(expenseRef);
  });
}

/**
 * Get all expenses for a user
 */
export async function getUserExpenses(userId: string): Promise<Expense[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Expense));
}

/**
 * Get expenses by credit card
 */
export async function getExpensesByCreditCard(
  userId: string,
  cardId: string
): Promise<Expense[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('creditCardId', '==', cardId)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Expense));
}

/**
 * Reduce installment debt (called by Cloud Function monthly)
 */
export async function reduceInstallmentDebt(expenseId: string): Promise<void> {
  const expenseRef = doc(db, COLLECTION_NAME, expenseId);
  const expenseSnap = await getDoc(expenseRef);

  if (!expenseSnap.exists()) return;

  const expense = expenseSnap.data() as Expense;

  if (!expense.isInstallment || expense.isFullyPaid) return;

  const newMonthsPaid = expense.installmentMonthsPaid + 1;
  const newRemainingDebt = expense.amount - (expense.monthlyPayment! * newMonthsPaid);
  const isFullyPaid = newMonthsPaid >= (expense.installmentMonths || 0) || newRemainingDebt <= 0;

  await updateDoc(expenseRef, {
    installmentMonthsPaid: newMonthsPaid,
    remainingDebt: Math.max(0, newRemainingDebt),
    isFullyPaid,
    updatedAt: serverTimestamp(),
  });
}
