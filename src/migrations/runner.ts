/**
 * Migration Runner
 *
 * Executes database migrations in order and tracks which ones have been applied
 */

import { collection, doc, getDoc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Migration, MigrationLog } from './types';

const MIGRATIONS_COLLECTION = '_migrations';

/**
 * Get the current migration version from Firestore
 */
async function getCurrentVersion(): Promise<number> {
  const migrationsRef = collection(db, MIGRATIONS_COLLECTION);
  const q = query(migrationsRef, orderBy('version', 'desc'));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return 0;
  }

  return snapshot.docs[0].data().version;
}

/**
 * Log a migration execution
 */
async function logMigration(log: MigrationLog): Promise<void> {
  const migrationRef = doc(db, MIGRATIONS_COLLECTION, `v${log.version}`);
  await setDoc(migrationRef, log);
}

/**
 * Check if a specific migration has been applied
 */
async function isMigrationApplied(version: number): Promise<boolean> {
  const migrationRef = doc(db, MIGRATIONS_COLLECTION, `v${version}`);
  const snapshot = await getDoc(migrationRef);
  return snapshot.exists() && snapshot.data().success;
}

/**
 * Run all pending migrations
 */
export async function runMigrations(migrations: Migration[]): Promise<void> {
  console.log('🔄 Checking for pending migrations...');

  const currentVersion = await getCurrentVersion();
  console.log(`📌 Current database version: ${currentVersion}`);

  // Sort migrations by version
  const sortedMigrations = [...migrations].sort((a, b) => a.version - b.version);

  // Find pending migrations
  const pendingMigrations = sortedMigrations.filter(
    (m) => m.version > currentVersion
  );

  if (pendingMigrations.length === 0) {
    console.log('✅ Database is up to date');
    return;
  }

  console.log(`📋 Found ${pendingMigrations.length} pending migration(s)`);

  // Execute each migration
  for (const migration of pendingMigrations) {
    console.log(`⏳ Running migration v${migration.version}: ${migration.description}`);

    try {
      // Check if already applied (in case of previous partial failure)
      if (await isMigrationApplied(migration.version)) {
        console.log(`⏭️  Migration v${migration.version} already applied, skipping`);
        continue;
      }

      // Execute migration
      await migration.up();

      // Log success
      await logMigration({
        version: migration.version,
        description: migration.description,
        executedAt: new Date(),
        success: true,
      });

      console.log(`✅ Migration v${migration.version} completed successfully`);
    } catch (error) {
      console.error(`❌ Migration v${migration.version} failed:`, error);

      // Log failure
      await logMigration({
        version: migration.version,
        description: migration.description,
        executedAt: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Attempt rollback if available
      if (migration.down) {
        console.log(`🔄 Attempting rollback for v${migration.version}...`);
        try {
          await migration.down();
          console.log(`✅ Rollback successful`);
        } catch (rollbackError) {
          console.error(`❌ Rollback failed:`, rollbackError);
        }
      }

      // Stop execution on first failure
      throw new Error(`Migration v${migration.version} failed`);
    }
  }

  console.log('🎉 All migrations completed successfully');
}

/**
 * Get migration history
 */
export async function getMigrationHistory(): Promise<MigrationLog[]> {
  const migrationsRef = collection(db, MIGRATIONS_COLLECTION);
  const q = query(migrationsRef, orderBy('version', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data() as MigrationLog);
}

/**
 * Rollback to a specific version (dangerous!)
 */
export async function rollbackTo(
  targetVersion: number,
  migrations: Migration[]
): Promise<void> {
  console.warn('⚠️  Rolling back migrations is dangerous and may cause data loss!');

  const currentVersion = await getCurrentVersion();

  if (targetVersion >= currentVersion) {
    console.log('Nothing to rollback');
    return;
  }

  // Sort migrations in reverse order
  const sortedMigrations = [...migrations]
    .sort((a, b) => b.version - a.version)
    .filter((m) => m.version > targetVersion && m.version <= currentVersion);

  for (const migration of sortedMigrations) {
    if (!migration.down) {
      throw new Error(`Migration v${migration.version} does not have a rollback function`);
    }

    console.log(`🔄 Rolling back migration v${migration.version}...`);

    try {
      await migration.down();
      console.log(`✅ Rollback of v${migration.version} successful`);
    } catch (error) {
      console.error(`❌ Rollback of v${migration.version} failed:`, error);
      throw error;
    }
  }

  console.log(`✅ Rolled back to version ${targetVersion}`);
}
