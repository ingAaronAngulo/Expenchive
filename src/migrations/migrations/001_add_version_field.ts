/**
 * Migration 001: Add version field to all documents
 *
 * This migration adds a `schemaVersion` field to all existing documents
 * to track which version of the schema they conform to.
 */

import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Migration } from '../types';

const COLLECTIONS = ['expenses', 'accounts', 'creditCards', 'investments', 'recurringExpenses', 'users'];
const SCHEMA_VERSION = 1;

export const migration001: Migration = {
  version: 1,
  description: 'Add schemaVersion field to all documents',

  async up() {
    console.log('Adding schemaVersion field to all documents...');

    for (const collectionName of COLLECTIONS) {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);

      if (snapshot.empty) {
        console.log(`  - Collection '${collectionName}' is empty, skipping`);
        continue;
      }

      // Process in batches of 500 (Firestore batch limit)
      const batchSize = 500;
      let batch = writeBatch(db);
      let count = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // Skip if already has schemaVersion
        if (data.schemaVersion !== undefined) {
          continue;
        }

        const docRef = doc(db, collectionName, docSnap.id);
        batch.update(docRef, { schemaVersion: SCHEMA_VERSION });
        count++;

        // Commit batch when reaching limit
        if (count % batchSize === 0) {
          await batch.commit();
          batch = writeBatch(db);
          console.log(`  - Processed ${count} documents in '${collectionName}'...`);
        }
      }

      // Commit remaining documents
      if (count % batchSize !== 0) {
        await batch.commit();
      }

      console.log(`  ✓ Updated ${count} documents in '${collectionName}'`);
    }
  },

  async down() {
    console.log('Removing schemaVersion field from all documents...');

    for (const collectionName of COLLECTIONS) {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);

      if (snapshot.empty) {
        continue;
      }

      const batchSize = 500;
      let batch = writeBatch(db);
      let count = 0;

      for (const docSnap of snapshot.docs) {
        const docRef = doc(db, collectionName, docSnap.id);
        batch.update(docRef, { schemaVersion: null });
        count++;

        if (count % batchSize === 0) {
          await batch.commit();
          batch = writeBatch(db);
        }
      }

      if (count % batchSize !== 0) {
        await batch.commit();
      }

      console.log(`  ✓ Removed schemaVersion from ${count} documents in '${collectionName}'`);
    }
  },
};
