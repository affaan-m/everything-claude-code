---
description: Generate Supabase SQL migrations with tables, RLS policies, indexes, and triggers
---

# Create Supabase Migration

Generate a complete SQL migration file for Supabase.

## Gather Context

1. What tables need to be created or altered?
2. Relationships between tables (foreign keys, junction tables)
3. Who should have access? (anon, authenticated, service_role, specific user ownership)
4. Any computed columns, triggers, or database functions needed?

## Migration Standards

### Tables
- Always include: `id uuid primary key default gen_random_uuid()`
- Always include: `created_at timestamptz not null default now()`
- Include `updated_at timestamptz` with an auto-update trigger if rows get edited
- Use `text` over `varchar` unless there's a hard length constraint
- Use `timestamptz` — never `timestamp` without timezone
- Add `not null` to every column unless truly optional
- Name junction tables as `<table_a>_<table_b>` in alphabetical order

### RLS Policies
- Enable RLS on every table: `alter table <t> enable row level security;`
- Name policies descriptively: `"Users can read own profile"`
- Common patterns:
  - Owner read/write: `auth.uid() = user_id`
  - Public read: `true` for select, restricted for insert/update/delete
  - Role-based: `auth.jwt() ->> 'role' = 'admin'`

### Indexes
- Add indexes on any column used in `where`, `order by`, or `join`
- Use `btree` for equality/range, `gin` for full-text or JSONB

### Functions & Triggers
- `updated_at` trigger on tables that allow updates
- Use `security definer` cautiously — only when the function needs elevated access

## Output

A single SQL migration file with sections clearly commented:

```sql
-- ============================================
-- Migration: <feature_name>
-- Description: <what this migration does>
-- ============================================

-- 1. Tables
-- 2. Indexes
-- 3. RLS Policies
-- 4. Functions & Triggers
```

Also output the CLI command:
```
supabase migration new <feature_name>
```
