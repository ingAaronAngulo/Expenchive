/**
 * Migration system types
 *
 * Provides a structured way to version and migrate data as the schema evolves
 */

export interface Migration {
  /** Unique version number (incremental) */
  version: number;

  /** Human-readable description of what this migration does */
  description: string;

  /**
   * Execute the migration
   * Should be idempotent (safe to run multiple times)
   */
  up: () => Promise<void>;

  /**
   * Rollback the migration (optional)
   * Used to undo changes if migration fails
   */
  down?: () => Promise<void>;
}

export interface MigrationLog {
  version: number;
  description: string;
  executedAt: Date;
  success: boolean;
  error?: string;
}
