# PostgreSQL Performance Rules

## Query Performance

- Use `EXPLAIN (ANALYZE, BUFFERS)` to validate index usage and IO behavior.
- For hot tables, consider covering indexes or partitioning.
- Avoid `SELECT *` in critical paths.
- Validate plan stability across data distributions and parameter changes.

## Kernel Performance

- Before modifying executor/planner, understand statistics and cost model.
- Use `pgbench` or micro-benchmarks for evaluation.
- Account for cache behavior (shared buffers, local cache, relcache).
- Profile WAL volume when touching storage or logging paths.

## Extension Performance

- Avoid expensive per-row callbacks.
- Provide index support for custom types/operators.
- Respect memory budgets (`work_mem`, `maintenance_work_mem`).
