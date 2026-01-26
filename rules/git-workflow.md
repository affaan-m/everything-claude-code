# Git Workflow (PostgreSQL Focus)

- Commits must name the PostgreSQL module (e.g., `src/backend/access/` or extension name).
- Prefer types: `feat`, `fix`, `docs`, `perf`, `refactor`, `test`.

## Recommended Format

```
feat: add WAL summary hook for extension
fix: prevent lock inversion in heap_update
```

## Branch Strategy

- Separate kernel changes from extension changes.
- Every change must include regression/verification notes.
- For WAL or catalog changes, include compatibility notes in commit body.

## Pre-merge Checklist

- SQL/Schema changes are backward compatible
- Kernel changes do not break ABI/extension interfaces
- Documentation is updated
- Upgrade and rollback paths are documented
