# Database Standards

[Purpose: guide schema design, queries, migrations, and integrity]

## Philosophy
- Model the domain first; optimize after correctness
- Prefer explicit constraints; let database enforce invariants
- Query only what you need; measure before optimizing

## Naming & Types
- Tables: `snake_case`, plural (`users`, `order_items`)
- Columns: `snake_case` (`created_at`, `user_id`)
- FKs: `{table}_id` referencing `{table}.id`
- Types: timezone-aware timestamps; strong IDs; precise money types

## Relationships
- 1:N: FK in child
- N:N: join table with compound key
- 1:1: FK + UNIQUE

## Migrations
- Immutable migrations; always add rollback
- Small, focused steps; test on non-prod first
- Naming: `{seq}_{action}_{object}` (e.g., `002_add_email_index`)

## Query Patterns
- ORM for simple CRUD and safety; raw SQL for complex/perf-critical
- Avoid N+1 (eager load/batching); paginate large sets
- Index FKs and frequently filtered/sorted columns

## Connection & Transactions
- Use pooling (size/timeouts based on workload)
- One connection per unit of work; close/return promptly
- Wrap multi-step changes in transactions

## Data Integrity
- Use NOT NULL/UNIQUE/CHECK/FK constraints
- Validate at DB when appropriate (defense in depth)
- Prefer generated columns for consistent derivations

## Backup & Recovery
- Regular backups with retention; test restores
- Document RPO/RTO targets; monitor backup jobs

---
_Focus on patterns and decisions. No environment-specific settings._
