# PostgreSQL Coding Style

Architect-grade conventions for kernel and extension work.

## Memory & Resource Management

- **Use MemoryContext** for lifecycle control; avoid `malloc/free`.
- Choose appropriate contexts for long-lived objects (e.g., CacheMemoryContext).
- Avoid leaks on error paths; when using `PG_TRY()/PG_CATCH()`, always `PG_RE_THROW()`.
- Document ownership for data stored in relcache or syscache-backed structures.

```c
MemoryContext oldctx = MemoryContextSwitchTo(CacheMemoryContext);
MyStruct *state = palloc0(sizeof(MyStruct));
MemoryContextSwitchTo(oldctx);
```

## Error Handling

Use `ereport`/`elog` with correct severity and context:

```c
ereport(ERROR,
        (errcode(ERRCODE_INVALID_PARAMETER_VALUE),
         errmsg("invalid relfilenode"),
         errdetail("relfilenode must be positive")));
```

## Locking & Concurrency

- Be explicit about lock level and duration.
- Do not reverse lock ordering.
- Document concurrency strategy for shared structures.
- Prefer LWLocks for shared structures; avoid ad hoc spinlock use.

## SQL/Schema Discipline

- Migrations must be reversible or explicitly documented.
- Prefer `timestamptz` over `timestamp`.
- Prefer `bigint` for identifiers.

## Quality Checklist

Before completion:
- [ ] MemoryContext lifecycle is explicit
- [ ] Lock ordering is stable (no deadlock risk)
- [ ] Error paths are complete
- [ ] SQL/Schema aligns with PostgreSQL standards
- [ ] Code comments and docs reflect behavior
