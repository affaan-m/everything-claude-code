---
name: backend-patterns
description: PostgreSQL backend patterns (hooks, bgworker, GUC).
---

# PostgreSQL Backend Patterns

## When to Use

- Adding an extension or background worker
- Registering hooks or custom GUCs

## Patterns

- Register hooks in `_PG_init`
- Use bgworker APIs for background processes
- Define GUC permission levels and defaults explicitly
- Persist state with shared memory only via documented APIs
- Handle SIGHUP reload paths for long-lived workers
