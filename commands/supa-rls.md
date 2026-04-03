---
description: Audit and generate Row Level Security policies for Supabase tables
---

# Supabase RLS Audit & Generator

Review existing RLS policies or generate new ones for your Supabase tables.

## Modes

### Audit Mode (no arguments)
Scan the project's migration files and current schema for:
- Tables with RLS **disabled** — flag as critical
- Tables with RLS enabled but **no policies** — flag as high (locked out)
- Policies that use `true` for insert/update/delete — flag as warning (wide open)
- Missing policies for common operations (select, insert, update, delete)
- Policies that don't reference `auth.uid()` when they probably should

### Generate Mode (table name provided)
Create RLS policies for a specific table based on its ownership model:

**User-owned data** (table has `user_id` column):
```sql
-- Users can read their own rows
create policy "Users read own <table>" on <table>
  for select using (auth.uid() = user_id);

-- Users can insert their own rows
create policy "Users insert own <table>" on <table>
  for insert with check (auth.uid() = user_id);

-- Users can update their own rows
create policy "Users update own <table>" on <table>
  for update using (auth.uid() = user_id);

-- Users can delete their own rows
create policy "Users delete own <table>" on <table>
  for delete using (auth.uid() = user_id);
```

**Public read, owner write:**
```sql
create policy "Anyone can read <table>" on <table>
  for select using (true);

create policy "Owner can modify <table>" on <table>
  for all using (auth.uid() = user_id);
```

**Role-based (admin/member):**
```sql
create policy "Admins full access" on <table>
  for all using (
    exists (
      select 1 from user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );
```

## Output

- SQL statements ready to paste into a migration file
- A plain-English summary of who can do what
- Warnings about any potential security gaps
