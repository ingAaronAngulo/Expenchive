import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { DashboardSnapshot, CreateSnapshotData } from '@/types';

const COLLECTION_NAME = 'snapshots';

export async function createSnapshot(data: CreateSnapshotData): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteSnapshot(snapshotId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, snapshotId));
}

export async function getUserSnapshots(userId: string): Promise<DashboardSnapshot[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DashboardSnapshot));
}
