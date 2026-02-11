---
name: database-migrations
description: Database schema migration patterns, naming conventions, rollback strategies, and zero-downtime techniques for Prisma, Drizzle, Supabase, and Knex.
---

# Database Migration Patterns

Comprehensive patterns for safe, reversible database schema migrations.

## Migration Naming Convention

Format: `YYYYMMDDHHMMSS_descriptive_name`

```
20250115120000_create_users_table.sql
20250115130000_add_email_index_to_users.sql
20250116090000_add_avatar_column_to_users.sql
20250116100000_create_markets_table.sql
```

Rules:
- Timestamp prefix for ordering
- Snake_case description
- Start with verb: `create_`, `add_`, `remove_`, `rename_`, `alter_`
- Be specific: `add_email_index_to_users` not `update_users`

## Tool-Specific Patterns

### Prisma

```bash
# Create migration
npx prisma migrate dev --name add_users_table

# Apply in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

```prisma
// schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

### Drizzle

```typescript
// drizzle/migrations/0001_add_users.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

```bash
# Generate migration
npx drizzle-kit generate

# Apply migration
npx drizzle-kit migrate
```

### Supabase SQL

```sql
-- supabase/migrations/20250115120000_create_users.sql

-- UP
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

```bash
# Create migration
supabase migration new create_users

# Apply locally
supabase db reset

# Push to remote
supabase db push
```

### Knex

```typescript
// migrations/20250115120000_create_users.ts
import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid())
    table.string('email').notNull().unique()
    table.string('name')
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users')
}
```

## Safe Migration Patterns

### Adding a Column

```sql
-- SAFE: Add nullable column (no lock, no rewrite)
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- SAFE: Add column with default (Postgres 11+, no rewrite)
ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
```

### Renaming a Column (Zero-Downtime)

```sql
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN display_name TEXT;

-- Step 2: Backfill data
UPDATE users SET display_name = name WHERE display_name IS NULL;

-- Step 3: Update application to write to both columns
-- (deploy code change)

-- Step 4: Stop reading old column
-- (deploy code change)

-- Step 5: Drop old column
ALTER TABLE users DROP COLUMN name;
```

### Adding an Index

```sql
-- SAFE: Create index concurrently (no table lock)
CREATE INDEX CONCURRENTLY idx_users_email ON users (email);

-- UNSAFE: Regular index (locks table)
-- CREATE INDEX idx_users_email ON users (email);
```

### Dropping a Table

```sql
-- Step 1: Stop all writes (deploy code change)
-- Step 2: Verify no queries hit the table
-- Step 3: Rename table (safety net)
ALTER TABLE old_feature RENAME TO _old_feature_deprecated;

-- Step 4: Wait 1 week, then drop
DROP TABLE IF EXISTS _old_feature_deprecated;
```

## Rollback Strategy

Every migration MUST have a rollback plan:

```sql
-- UP: 20250115120000_add_status_to_users.sql
ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
CREATE INDEX CONCURRENTLY idx_users_status ON users (status);

-- DOWN: 20250115120000_add_status_to_users_down.sql
DROP INDEX IF EXISTS idx_users_status;
ALTER TABLE users DROP COLUMN IF EXISTS status;
```

### Rollback Testing

```bash
# Test rollback locally before deploying
supabase db reset          # Apply all migrations
supabase migration down    # Rollback last migration
supabase db reset          # Verify clean state
```

## Data Migration Patterns

### Batch Processing

```typescript
// Process large tables in batches to avoid locks
async function backfillStatus(batchSize = 1000) {
  let processed = 0
  let hasMore = true

  while (hasMore) {
    const { count } = await supabase
      .from('users')
      .update({ status: 'active' })
      .is('status', null)
      .limit(batchSize)

    processed += count ?? 0
    hasMore = (count ?? 0) === batchSize

    // Avoid overwhelming the database
    await new Promise(r => setTimeout(r, 100))
  }

  return processed
}
```

### Idempotent Migrations

```sql
-- GOOD: Can run multiple times safely
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- BAD: Fails on second run
CREATE TABLE users (id UUID PRIMARY KEY);
ALTER TABLE users ADD COLUMN email TEXT;
```

## Zero-Downtime Migration Checklist

Before deploying:
- [ ] Migration is backwards-compatible with current code
- [ ] No exclusive table locks (use `CONCURRENTLY` for indexes)
- [ ] Large tables use batch processing
- [ ] Rollback script tested locally
- [ ] No data loss possible (add before remove)

Deployment order:
1. Deploy migration (schema change)
2. Deploy application code (uses new schema)
3. Clean up old columns/tables (after verification)

## Supabase-Specific Patterns

### RLS Policy Migrations

```sql
-- Always enable RLS on new tables
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;

-- Create policies with descriptive names
CREATE POLICY "markets_select_public"
  ON markets FOR SELECT
  TO authenticated, anon
  USING (status = 'active');

CREATE POLICY "markets_insert_authenticated"
  ON markets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "markets_update_owner"
  ON markets FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);
```

### Supabase Functions

```sql
-- Use security definer for admin operations
CREATE OR REPLACE FUNCTION admin_update_status(
  market_id UUID,
  new_status TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE markets SET status = new_status WHERE id = market_id;
END;
$$;
```

## Anti-Patterns

```sql
-- NEVER: Drop column in same deploy as code change
-- NEVER: Rename column without multi-step migration
-- NEVER: Add NOT NULL without default on existing table
-- NEVER: Run data migration in same transaction as schema change
-- NEVER: Skip rollback script
-- NEVER: Use CREATE INDEX without CONCURRENTLY on large tables
```

## Migration Review Checklist

Before approving a migration PR:
- [ ] Naming follows `YYYYMMDDHHMMSS_verb_description` convention
- [ ] UP and DOWN scripts both present
- [ ] Backwards-compatible with current application code
- [ ] No exclusive table locks on large tables
- [ ] RLS policies included for new tables (Supabase)
- [ ] Indexes added for foreign keys and common query patterns
- [ ] Data backfill uses batch processing
- [ ] Tested locally with `migrate up` then `migrate down`
- [ ] No sensitive data in migration files
