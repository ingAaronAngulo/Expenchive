import {
  collection,
  doc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { CreateLoanData, RecordPaymentData } from '@/types';
import { createLoanSchema, recordPaymentSchema } from '@/schemas';

const LOANS_COLLECTION = 'loans';
const PAYMENTS_COLLECTION = 'loanPayments';
const ACCOUNTS_COLLECTION = 'accounts';

export async function createLoan(userId: string, data: CreateLoanData): Promise<string> {
  const validated = createLoanSchema.parse({
    ...data,
    description: data.description ?? null,
    dueDate: data.dueDate ?? null,
  });

  return runTransaction(db, async (transaction) => {
    const accountRef = doc(db, ACCOUNTS_COLLECTION, validated.accountId);
    const accountSnap = await transaction.get(accountRef);

    if (!accountSnap.exists()) throw new Error('Account not found');

    const currentBalance = accountSnap.data().balance as number;
    const newBalance =
      validated.direction === 'lent'
        ? currentBalance - validated.amount
        : currentBalance + validated.amount;

    const loanRef = doc(collection(db, LOANS_COLLECTION));
    transaction.set(loanRef, {
      userId,
      direction: validated.direction,
      personName: validated.personName,
      amount: validated.amount,
      remainingAmount: validated.amount,
      currency: validated.currency,
      accountId: validated.accountId,
      description: validated.description ?? null,
      date: Timestamp.fromDate(validated.date),
      dueDate: validated.dueDate ? Timestamp.fromDate(validated.dueDate) : null,
      isPaid: false,
      includeInDashboard: validated.includeInDashboard,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.update(accountRef, { balance: newBalance, updatedAt: serverTimestamp() });

    return loanRef.id;
  });
}

export async function recordPayment(
  userId: string,
  loanId: string,
  currentRemainingAmount: number,
  data: RecordPaymentData
): Promise<void> {
  const validated = recordPaymentSchema.parse({
    ...data,
    note: data.note ?? null,
  });

  if (validated.amount > currentRemainingAmount) {
    throw new Error('Payment amount exceeds remaining balance');
  }

  await runTransaction(db, async (transaction) => {
    const loanRef = doc(db, LOANS_COLLECTION, loanId);
    const loanSnap = await transaction.get(loanRef);

    if (!loanSnap.exists()) throw new Error('Loan not found');

    const loanData = loanSnap.data();
    const accountRef = doc(db, ACCOUNTS_COLLECTION, loanData.accountId);
    const accountSnap = await transaction.get(accountRef);

    if (!accountSnap.exists()) throw new Error('Account not found');

    const currentBalance = accountSnap.data().balance as number;
    const newBalance =
      loanData.direction === 'lent'
        ? currentBalance + validated.amount
        : currentBalance - validated.amount;

    const newRemaining = loanData.remainingAmount - validated.amount;
    const isPaid = newRemaining <= 0;

    const paymentRef = doc(collection(db, PAYMENTS_COLLECTION));
    transaction.set(paymentRef, {
      loanId,
      userId,
      amount: validated.amount,
      date: Timestamp.fromDate(validated.date),
      note: validated.note ?? null,
      createdAt: serverTimestamp(),
    });

    transaction.update(loanRef, {
      remainingAmount: Math.max(0, newRemaining),
      isPaid,
      updatedAt: serverTimestamp(),
    });

    transaction.update(accountRef, { balance: newBalance, updatedAt: serverTimestamp() });
  });
}

export async function toggleLoanDashboard(loanId: string, includeInDashboard: boolean): Promise<void> {
  const loanRef = doc(db, LOANS_COLLECTION, loanId);
  await updateDoc(loanRef, { includeInDashboard, updatedAt: serverTimestamp() });
}

export async function deleteLoan(loanId: string): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const loanRef = doc(db, LOANS_COLLECTION, loanId);
    const loanSnap = await transaction.get(loanRef);

    if (!loanSnap.exists()) throw new Error('Loan not found');

    const loanData = loanSnap.data();

    if (!loanData.isPaid) {
      const accountRef = doc(db, ACCOUNTS_COLLECTION, loanData.accountId);
      const accountSnap = await transaction.get(accountRef);

      if (accountSnap.exists()) {
        const currentBalance = accountSnap.data().balance as number;
        // Reverse the original effect
        const newBalance =
          loanData.direction === 'lent'
            ? currentBalance + loanData.remainingAmount
            : currentBalance - loanData.remainingAmount;

        if (loanData.remainingAmount > 0) {
          transaction.update(accountRef, { balance: newBalance, updatedAt: serverTimestamp() });
        }
      }
    }

    transaction.delete(loanRef);
  });
}
