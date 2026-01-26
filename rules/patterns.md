# PostgreSQL Common Patterns

## Indexing Patterns

```sql
-- Equality + range
CREATE INDEX idx_orders_status_created_at
ON orders (status, created_at);

-- Covering index
CREATE INDEX idx_users_email
ON users (email) INCLUDE (name, created_at);

-- Partial index
CREATE INDEX idx_active_users
ON users (email) WHERE deleted_at IS NULL;
```

## Extension Layout

```
my_extension/
|-- my_extension.control
|-- my_extension--1.0.sql
|-- src/
|   |-- my_extension.c
|-- Makefile
```

## Kernel Patch Sequencing

- Add **tests/regressions** first
- Add **functional changes** second
- Add **performance improvements** last

## Locking/Transaction Patterns

- Declare lock level explicitly (RowExclusive/ShareUpdateExclusive)
- Avoid heavy locks in long-running transactions
- Prefer short-lived LWLock usage for shared structures
