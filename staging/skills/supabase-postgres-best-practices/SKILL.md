---
name: supabase-postgres-best-practices
description: Postgres operational best practices — connection pooling, RLS, locking, concurrency, and monitoring. Use when configuring connection pooling, writing RLS policies, debugging deadlocks/locking, or setting up query monitoring. For schema design, indexing, and data types, see postgresql-table-design skill instead.
license: MIT
metadata:
  author: supabase
  version: "1.2.0"
  organization: Supabase
  date: January 2026
---

# Supabase Postgres Best Practices

Operational Postgres patterns covering connection management, security/RLS, concurrency/locking, and monitoring. Sourced from Supabase documentation.

**For schema design, data types, indexing, constraints, and query optimization, use the `postgresql-table-design` skill instead.** This skill focuses on runtime/operational concerns.

## When to Apply

- Configuring connection pooling (PgBouncer, Supabase pooler)
- Writing or optimizing Row-Level Security policies
- Debugging deadlocks, lock contention, or queue processing
- Setting up query monitoring with pg_stat_statements
- Tuning autovacuum or EXPLAIN ANALYZE diagnostics

## Reference Files

### Connection Management (CRITICAL)

| File | Topic |
|------|-------|
| `references/conn-pooling.md` | PgBouncer setup, pool modes (transaction vs session) |
| `references/conn-limits.md` | Calculating max_connections, work_mem sizing |
| `references/conn-idle-timeout.md` | idle_in_transaction_session_timeout, idle_session_timeout |
| `references/conn-prepared-statements.md` | Prepared statements with transaction-mode pooling |

### Security & RLS (CRITICAL)

| File | Topic |
|------|-------|
| `references/security-rls-basics.md` | Enabling RLS, writing policies, Supabase auth.uid() |
| `references/security-rls-performance.md` | Wrapping functions in SELECT for 100x speedup, security definer helpers |
| `references/security-privileges.md` | Least privilege roles, revoking public defaults |

### Concurrency & Locking (MEDIUM-HIGH)

| File | Topic |
|------|-------|
| `references/lock-deadlock-prevention.md` | Consistent lock ordering, detecting deadlocks |
| `references/lock-skip-locked.md` | SKIP LOCKED for queue processing |
| `references/lock-short-transactions.md` | Minimizing transaction scope, statement_timeout |
| `references/lock-advisory.md` | Advisory locks for application-level coordination |

### Monitoring & Diagnostics (LOW-MEDIUM)

| File | Topic |
|------|-------|
| `references/monitor-pg-stat-statements.md` | Finding slowest/most frequent queries |
| `references/monitor-explain-analyze.md` | EXPLAIN ANALYZE red flags |
| `references/monitor-vacuum-analyze.md` | Autovacuum tuning, checking last_analyze |

## External References

- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/auth/row-level-security
- https://www.postgresql.org/docs/current/
