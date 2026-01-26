# PostgreSQL Kernel & Extension Best Practices (Deep Dive)

> Purpose: An architect-grade reference for engineers working on PostgreSQL internals and extensions. This guide focuses on subsystem invariants, durability semantics, concurrency guarantees, catalog/cache coherence, and multi-version compatibility. It aligns with PostgreSQL conventions and the `postgres-patterns` checklist to drive stability and evolvability.

---

## 1. Core Architecture Overview (Non‑negotiable)

### 1.1 Process Model

- **Postmaster + multi-process**: each connection maps to a backend process.
- **Shared memory**: buffer pool, lock tables, WAL buffers, proc arrays, SLRU.
- **Background processes**: checkpointer, walwriter, autovacuum, bgworkers.

### 1.2 Module Map

- `src/backend/`: parser, optimizer, executor, storage, transaction, WAL.
- `src/include/`: public structs and APIs.
- `src/common/`: shared libraries reusable by extensions.
- `contrib/`: official extension references (e.g., hstore, pg_stat_statements).

### 1.3 Subsystem Invariants to Preserve

- **MVCC visibility**: snapshot rules must never be bypassed.
- **Lock ordering**: ensure stable acquisition to avoid deadlock.
- **WAL correctness**: every durable change must be replayable.
- **Catalog coherence**: syscache/relcache consistency is mandatory.

---

## 2. Kernel Development Best Practices

### 2.1 Memory & Resource Management

- **Use MemoryContext only**: `palloc/pfree`, avoid `malloc/free`.
- Long-lived data should live in dedicated contexts (e.g., CacheMemoryContext).
- SPI, Relation, Lock must be tracked via ResourceOwner.
- Document lifecycle boundaries in comments when context switches are involved.

### 2.2 Locking & Concurrency

- Understand `LockTag` and `LockMode` semantics.
- Avoid lock escalation (deadlocks and latency regressions).
- When using `LWLock`, avoid nested spinlock patterns.
- Document lock order when introducing new lock acquisition points.

### 2.3 WAL & Durability

- All durable changes require WAL records.
- Custom WAL must be replay-safe (redo/undo semantics).
- Minimize WAL volume by avoiding redundant logging.
- Validate logical decoding and replication impact when WAL format changes.

### 2.4 Executor & Planner

- Planner modifications must preserve `path/plan` lifecycle correctness.
- Executor changes must maintain `ExprContext` reuse assumptions.
- Validate `EXPLAIN` behavior after every change.
- Consider cost model interactions (stats, selectivity, rowcount estimates).

### 2.5 Cache & Catalog Discipline

- Respect syscache/relcache invalidation rules.
- Ensure catalog updates trigger invalidation events.
- Avoid caching data without explicit invalidation hooks.

### 2.6 Hooks & BGW

- Hook chains must call the prior hook.
- BGW code must handle SIGTERM/SIGHUP and call `CHECK_FOR_INTERRUPTS()` in loops.
- Document any new hook insertion points with call order guarantees.

---

## 3. Extension Development Best Practices

### 3.1 Extension Types

- SQL-only: easiest to maintain.
- C extensions: higher performance, tighter ABI constraints.
- FDW: external data access with strict security boundaries.

### 3.2 Extension Structure

```
my_extension/
|-- my_extension.control
|-- my_extension--1.0.sql
|-- src/
|   |-- my_extension.c
|-- Makefile
```

### 3.3 `.control` Guidance

- Set `default_version` and `module_pathname` explicitly.
- For C extensions, add `relocatable` only when safe.
- Treat `requires` as part of compatibility guarantees.

### 3.4 SQL Upgrade Strategy

- Every release must include incremental upgrade scripts.
- Avoid destructive changes without explicit migration paths.
- For catalog changes, define upgrade order and rollback strategy.

### 3.5 Compatibility

- Use `#if PG_VERSION_NUM` for API differences.
- Keep upgrade chains valid for every supported version.
- Avoid reliance on unstable internal symbols unless pinned to a version.

---

## 4. SQL & Schema Design Patterns (from postgres-patterns)

### 4.1 Index Strategy

- Use B-tree for equality/range.
- Use GIN for JSONB/TSV.
- Use BRIN for time-series ranges.

### 4.2 Data Types

- Prefer `bigint` for identifiers.
- Prefer `text` to `varchar(255)`.
- Prefer `timestamptz` for timestamps.

### 4.3 Pagination & Query Design

- Use keyset pagination over OFFSET.
- Use covering and partial indexes where applicable.
- Avoid cross-product joins without explicit selectivity control.

---

## 5. Performance & Diagnostics

### 5.1 Query Analysis

- Run `EXPLAIN (ANALYZE, BUFFERS)` for verification.
- Validate plan stability across data distributions.
- Track hot blocks and shared buffer hit ratios.

### 5.2 Kernel Performance

- Benchmark with `pgbench` or micro-benchmarks.
- Watch shared buffers, relcache, and executor memory use.
- Validate BGW and autovacuum interactions in stress tests.

### 5.3 Extension Performance

- Avoid per-row heavy work.
- Provide index support for new data types or operators.
- Respect `work_mem` and query memory budgets.

---

## 6. Security & Compliance

### 6.1 SQL Security

- Always parameterize dynamic SQL.
- Validate privilege boundaries for exposed functions.

### 6.2 Extension Security

- Restrict superuser-only functionality.
- Avoid unsafe C APIs and OS calls.
- Validate `SECURITY DEFINER` functions with strict input checks.

### 6.3 Kernel Security

- New GUCs must define explicit privilege scope.
- WAL/log changes require compatibility and rollback analysis.
- Validate that new logging avoids leaking sensitive values.

---

## 7. Testing & Verification

### 7.1 Kernel

- Add `src/test/regress` or `src/test/isolation` coverage first.
- `make check` must be clean before merge.
- Run targeted isolation tests for locking changes.

### 7.2 Extensions

- Test install, upgrade, and uninstall flows.
- Validate downgrade or migration paths.

### 7.3 Multi-Version

- Verify behavior across supported PG versions.
- Run upgrade tests against pg_upgrade or logical replication as applicable.

---

## 8. Release Readiness Checklist

- WAL compatibility confirmed
- Lock ordering unchanged or explicitly justified
- Regression suites green
- Performance baselines validated
- Documentation updated

---

## 9. Using Claude Code for PostgreSQL Work

### 9.1 Recommended Workflow

1. Use `/plan` to map modules, risks, and tests.
2. Use `/tdd` to add regressions first.
3. Use `/code-review` to validate locks, memory, and compatibility.
4. Use `/verify` for performance and release readiness.

### 9.2 Typical Assist Targets

- Kernel changes: request call-chain summaries before editing.
- Extensions: generate `.control` and upgrade SQL scaffolds.
- Performance: request index and plan guidance from `postgres-patterns`.

---

## References

- PostgreSQL official developer documentation
- `postgres-patterns` indexing and schema guidance

---

**Conclusion**: PostgreSQL kernel and extension work requires high assurance discipline. This guide, combined with Claude Code’s structured workflows, improves correctness, stability, and long-term maintainability.
