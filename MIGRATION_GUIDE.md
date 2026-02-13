# Data Migration Guide

## Overview

This guide explains how to create and run data migrations when you need to change your database schema.

## When to Create a Migration

Create a migration when you need to:
- Add new required fields to existing documents
- Rename or restructure existing fields
- Transform data formats (e.g., string to number)
- Split or merge collections
- Clean up invalid or outdated data
- Add indexes or change data types

## Migration System

### How It Works

1. **Versioned migrations**: Each migration has a unique version number
2. **Executed once**: Migrations are tracked and only run once
3. **Ordered execution**: Migrations run in order (v1, v2, v3, ...)
4. **Rollback support**: Migrations can optionally define rollback logic
5. **Idempotent**: Safe to run multiple times (checks if already applied)

### Migration Lifecycle

```
┌─────────────────────┐
│  Create Migration   │
│  (version N)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Test in Dev        │
│  Environment        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Deploy to Staging  │
│  & Verify           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Deploy to Prod     │
│  & Monitor          │
└─────────────────────┘
```

## Creating a Migration

### 1. Create Migration File

Create a new file in `src/migrations/migrations/`:

```typescript
// src/migrations/migrations/002_add_currency_field.ts

import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Migration } from '../types';

export const migration002: Migration = {
  version: 2,
  description: 'Add currency field to all accounts (default: USD)',

  async up() {
    console.log('Adding currency field to accounts...');

    const accountsRef = collection(db, 'accounts');
    const snapshot = await getDocs(accountsRef);

    let batch = writeBatch(db);
    let count = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      // Skip if already has currency
      if (data.currency) {
        continue;
      }

      const docRef = doc(db, 'accounts', docSnap.id);
      batch.update(docRef, {
        currency: 'USD',
        updatedAt: new Date()
      });
      count++;

      // Commit in batches of 500
      if (count % 500 === 0) {
        await batch.commit();
        batch = writeBatch(db);
      }
    }

    // Commit remaining
    if (count % 500 !== 0) {
      await batch.commit();
    }

    console.log(`✓ Updated ${count} accounts`);
  },

  // Optional rollback
  async down() {
    console.log('Removing currency field from accounts...');
    // Rollback logic here
  },
};
```

### 2. Register Migration

Add to `src/migrations/index.ts`:

```typescript
import { migration002 } from './migrations/002_add_currency_field';

export const migrations: Migration[] = [
  migration001,
  migration002, // Add your new migration
];
```

### 3. Test Migration

```bash
# Test in development environment first
npm run dev

# Or create a test script
node scripts/test-migration.js
```

## Running Migrations

### Automatic (Recommended)

Migrations run automatically on app startup:

```typescript
// In src/main.tsx or App.tsx
import { runMigrations, migrations } from '@/migrations';

async function initApp() {
  try {
    await runMigrations(migrations);
    // Start app...
  } catch (error) {
    console.error('Migration failed:', error);
    // Handle error (maybe show maintenance page)
  }
}

initApp();
```

### Manual

Create a migration script:

```typescript
// scripts/run-migrations.ts
import { runMigrations, migrations } from '../src/migrations';

runMigrations(migrations)
  .then(() => {
    console.log('Migrations completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migrations failed:', error);
    process.exit(1);
  });
```

Run it:

```bash
npx ts-node scripts/run-migrations.ts
```

## Best Practices

### ✅ DO

1. **Test thoroughly**
   - Test on a copy of production data
   - Test rollback if provided
   - Test with empty collections

2. **Make migrations idempotent**
   ```typescript
   // Good - checks if already applied
   if (!data.newField) {
     batch.update(docRef, { newField: defaultValue });
   }

   // Bad - might run twice
   batch.update(docRef, { newField: defaultValue });
   ```

3. **Process in batches**
   ```typescript
   // Process 500 docs at a time (Firestore limit)
   if (count % 500 === 0) {
     await batch.commit();
     batch = writeBatch(db);
   }
   ```

4. **Add error handling**
   ```typescript
   try {
     await batch.commit();
   } catch (error) {
     console.error('Batch commit failed:', error);
     throw error; // Stop migration
   }
   ```

5. **Log progress**
   ```typescript
   console.log(`Processing ${count}/${total} documents...`);
   ```

### ❌ DON'T

1. **Don't modify old migrations**
   - Create a new migration instead
   - Old migrations may have already run

2. **Don't delete data without backup**
   - Always create a backup first
   - Consider soft deletes instead

3. **Don't run untested migrations in production**
   - Always test in staging first

4. **Don't forget to handle edge cases**
   - Empty collections
   - Missing fields
   - Invalid data types

5. **Don't make migrations too large**
   - Split into smaller migrations if needed
   - Keep each migration focused

## Migration Examples

### Add a Required Field

```typescript
export const migration003: Migration = {
  version: 3,
  description: 'Add isActive field to all credit cards',

  async up() {
    const cardsRef = collection(db, 'creditCards');
    const snapshot = await getDocs(cardsRef);

    let batch = writeBatch(db);

    for (const docSnap of snapshot.docs) {
      if (docSnap.data().isActive === undefined) {
        batch.update(docSnap.ref, { isActive: true });
      }
    }

    await batch.commit();
  },
};
```

### Rename a Field

```typescript
export const migration004: Migration = {
  version: 4,
  description: 'Rename "amount" to "totalAmount" in expenses',

  async up() {
    const expensesRef = collection(db, 'expenses');
    const snapshot = await getDocs(expensesRef);

    let batch = writeBatch(db);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      if (data.amount !== undefined && data.totalAmount === undefined) {
        batch.update(docSnap.ref, {
          totalAmount: data.amount,
          amount: null, // Remove old field
        });
      }
    }

    await batch.commit();
  },

  async down() {
    // Rollback: rename back
    const expensesRef = collection(db, 'expenses');
    const snapshot = await getDocs(expensesRef);

    let batch = writeBatch(db);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      if (data.totalAmount !== undefined) {
        batch.update(docSnap.ref, {
          amount: data.totalAmount,
          totalAmount: null,
        });
      }
    }

    await batch.commit();
  },
};
```

### Data Transformation

```typescript
export const migration005: Migration = {
  version: 5,
  description: 'Convert date strings to Timestamp objects',

  async up() {
    const expensesRef = collection(db, 'expenses');
    const snapshot = await getDocs(expensesRef);

    let batch = writeBatch(db);

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      // Check if date is a string
      if (typeof data.date === 'string') {
        const timestamp = Timestamp.fromDate(new Date(data.date));
        batch.update(docSnap.ref, { date: timestamp });
      }
    }

    await batch.commit();
  },
};
```

## Monitoring Migrations

### View Migration History

```typescript
import { getMigrationHistory } from '@/migrations';

const history = await getMigrationHistory();
console.table(history);
```

### Check Current Version

```typescript
import { getCurrentVersion } from '@/migrations/runner';

const version = await getCurrentVersion();
console.log(`Current database version: ${version}`);
```

## Troubleshooting

### Migration Failed Halfway

1. Check the `_migrations` collection to see what succeeded
2. The failed migration is marked with `success: false`
3. Fix the migration code
4. Re-run migrations (it will skip successful ones)

### Need to Rollback

```typescript
import { rollbackTo, migrations } from '@/migrations';

// Rollback to version 2
await rollbackTo(2, migrations);
```

⚠️ **Warning**: Rollback may cause data loss. Always backup first!

### Migration Takes Too Long

- Process in smaller batches
- Add progress logging
- Consider running offline during maintenance window
- Use Cloud Functions for large migrations

## Production Deployment Checklist

- [ ] Migration tested in development
- [ ] Migration tested on copy of production data
- [ ] Backup created before deployment
- [ ] Rollback tested (if provided)
- [ ] Team notified about deployment
- [ ] Monitoring set up for migration execution
- [ ] Maintenance window scheduled (if needed)
- [ ] Rollback plan documented
- [ ] Migration added to deployment notes

## Resources

- [Firestore Batch Writes](https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes)
- [Database Migration Best Practices](https://www.prisma.io/dataguide/types/relational/what-are-database-migrations)
