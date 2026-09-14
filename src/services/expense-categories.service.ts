import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { GENERAL_CATEGORY } from '@/utils/constants';

const MAX_BATCH_WRITES = 450;

function normalizedCategories(categories: string[]): string[] {
  const uniqueCategories = new Map<string, string>();

  categories.forEach((category) => {
    const normalized = category.trim().replace(/\s+/g, ' ');
    if (normalized && normalized.toLocaleLowerCase() !== GENERAL_CATEGORY.toLocaleLowerCase()) {
      uniqueCategories.set(normalized.toLocaleLowerCase(), normalized);
    }
  });

  return [GENERAL_CATEGORY, ...uniqueCategories.values()];
}

export async function saveExpenseCategories(userId: string, categories: string[]): Promise<void> {
  await setDoc(
    doc(db, 'users', userId),
    {
      expenseCategories: normalizedCategories(categories),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

async function moveDocumentsToGeneral(documents: QueryDocumentSnapshot[]): Promise<void> {
  for (let start = 0; start < documents.length; start += MAX_BATCH_WRITES) {
    const batch = writeBatch(db);
    documents.slice(start, start + MAX_BATCH_WRITES).forEach((snapshot) => {
      batch.update(snapshot.ref, {
        category: GENERAL_CATEGORY,
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  }
}

export async function removeExpenseCategory(
  userId: string,
  category: string,
  categories: string[]
): Promise<void> {
  if (category.toLocaleLowerCase() === GENERAL_CATEGORY.toLocaleLowerCase()) {
    throw new Error('General cannot be removed');
  }

  const [expenseSnapshot, recurringSnapshot] = await Promise.all([
    getDocs(query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      where('category', '==', category)
    )),
    getDocs(query(
      collection(db, 'recurringExpenses'),
      where('userId', '==', userId),
      where('category', '==', category)
    )),
  ]);

  await moveDocumentsToGeneral([...expenseSnapshot.docs, ...recurringSnapshot.docs]);
  await saveExpenseCategories(
    userId,
    categories.filter((existingCategory) => existingCategory !== category)
  );
}
