/**
 * Migration Registry
 *
 * Register all migrations here in order
 */

import type { Migration } from './types';
import { migration001 } from './migrations/001_add_version_field';

/**
 * All migrations in chronological order
 * Add new migrations to the end of this array
 */
export const migrations: Migration[] = [
  migration001,
  // Add future migrations here
];

export { runMigrations, getMigrationHistory, rollbackTo } from './runner';
export type { Migration, MigrationLog } from './types';
