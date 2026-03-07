# Supabase Postgres Best Practices

## Structure

```
supabase-postgres-best-practices/
  SKILL.md       # Main skill file - read this first
  AGENTS.md      # This navigation guide
  CLAUDE.md      # Symlink to AGENTS.md
  references/    # Detailed reference files
```

## Usage

1. Read `SKILL.md` for the main skill instructions
2. Browse `references/` for detailed documentation on specific topics
3. Reference files are loaded on-demand - read only what you need

Comprehensive performance optimization guide for Postgres, maintained by Supabase. Contains rules across 4 categories, prioritized by impact to guide automated query optimization and schema design.

## When to Apply

Reference these guidelines when:
- Writing SQL queries or designing schemas
- Implementing indexes or query optimization
- Reviewing database performance issues
- Configuring connection pooling or scaling
- Optimizing for Postgres-specific features
- Working with Row-Level Security (RLS)

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Connection Management | CRITICAL | `conn-` |
| 2 | Security & RLS | CRITICAL | `security-` |
| 3 | Concurrency & Locking | MEDIUM-HIGH | `lock-` |
| 4 | Monitoring & Diagnostics | LOW-MEDIUM | `monitor-` |

## How to Use

Read individual rule files in `references/` for detailed explanations and SQL examples. Files are organized by prefix matching the categories above (e.g., `conn-pooling.md`, `security-rls-basics.md`, `lock-deadlock-prevention.md`).

Each rule file contains:
- Brief explanation of why it matters
- SQL examples with correct and incorrect patterns
- Additional context and references
- Supabase-specific notes (when applicable)

## References

- https://www.postgresql.org/docs/current/
- https://supabase.com/docs
- https://wiki.postgresql.org/wiki/Performance_Optimization
- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/auth/row-level-security
