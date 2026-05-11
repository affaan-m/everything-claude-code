---
name: mysql-patterns
description: MySQL/MariaDB query optimization, schema design, indexing, transactions, replication, and connection management for production applications.
origin: ECC
---

# MySQL/MariaDB Patterns

Quick reference for MySQL and MariaDB best practices across common backend use cases.

## How It Works

MySQL and MariaDB are relational databases using the InnoDB storage engine by default. InnoDB provides ACID transactions, row-level locking, and foreign key constraints. Queries are optimized by the query planner using available indexes; `EXPLAIN` reveals the execution plan. Connection pooling is essential — each connection consumes ~4–8 MB of RAM and establishing one takes ~10 ms. MariaDB is a drop-in MySQL-compatible fork with additional features (e.g. Aria engine, window functions from 10.2, temporal tables).

## When to Activate

- Writing SQL queries or migrations
- Designing or reviewing database schemas
- Diagnosing slow queries or deadlocks
- Configuring replication, connection pooling, or backups
- Hardening a MySQL/MariaDB instance for production
- Migrating from one MySQL/MariaDB version to another

## Index Cheat Sheet

| Query Pattern | Index Type | Example |
|--------------|------------|---------|
| `WHERE col = value` | B-tree (default) | `CREATE INDEX idx ON t (col)` |
| `WHERE col > value` | B-tree | `CREATE INDEX idx ON t (col)` |
| `WHERE a = x AND b > y` | Composite | `CREATE INDEX idx ON t (a, b)` |
| `FULLTEXT MATCH ... AGAINST` | FULLTEXT | `CREATE FULLTEXT INDEX idx ON t (col)` |
| JSON path queries | Functional (MySQL 8.0+) | `CREATE INDEX idx ON t ((col->>'$.field'))` |
| Spatial queries | SPATIAL | `CREATE SPATIAL INDEX idx ON t (geom)` |

**Composite index column order:** equality predicates first, then range predicates. The query planner stops using the index at the first range column.

## Data Type Quick Reference

| Use Case | Correct Type | Avoid |
|----------|-------------|-------|
| Surrogate PK (auto-increment) | `BIGINT UNSIGNED AUTO_INCREMENT` | `INT` (overflows at ~2B rows) |
| UUIDs stored as PK | `BINARY(16)` + `UUID_TO_BIN()` | `VARCHAR(36)` (wastes index space) |
| Short strings | `VARCHAR(n)` | `CHAR` for variable-length data |
| Timestamps (timezone-aware) | `DATETIME` + store UTC | `TIMESTAMP` (Y2038 limit; auto-converts TZ) |
| Exact decimals (money) | `DECIMAL(15,2)` | `FLOAT`, `DOUBLE` |
| Boolean flags | `TINYINT(1)` or `BIT(1)` | `ENUM('Y','N')` |
| Large text | `TEXT` / `MEDIUMTEXT` | `BLOB` for character data |
| JSON documents | `JSON` (MySQL 8.0+ / MariaDB 10.2+) | `TEXT` — no schema validation |

## Core Patterns

### UPSERT (INSERT ... ON DUPLICATE KEY UPDATE)

```sql
INSERT INTO user_settings (user_id, `key`, value)
VALUES (123, 'theme', 'dark')
ON DUPLICATE KEY UPDATE value = VALUES(value);
```

> **MySQL 8.0.20+:** `VALUES()` is deprecated — use the row alias syntax instead: `INSERT INTO user_settings (user_id, \`key\`, value) VALUES (123, 'theme', 'dark') AS new ON DUPLICATE KEY UPDATE value = new.value;`
> **MariaDB:** `VALUES()` is supported and remains the correct approach — the row alias syntax (`AS new`) is a MySQL-only feature and will cause a syntax error on MariaDB.

### Cursor Pagination (Keyset)

```sql
-- More efficient than LIMIT/OFFSET for deep pages
SELECT id, name, created_at
FROM products
WHERE (created_at, id) < (:last_created_at, :last_id)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

### Window Functions (MySQL 8.0+ / MariaDB 10.2+)

```sql
-- Running total per user
SELECT
    user_id,
    order_date,
    amount,
    SUM(amount) OVER (PARTITION BY user_id ORDER BY order_date) AS running_total
FROM orders;

-- Row number for deduplication
WITH ranked AS (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) AS rn
    FROM users
)
DELETE FROM users WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
```

### Soft Delete Pattern

```sql
ALTER TABLE orders ADD COLUMN deleted_at DATETIME DEFAULT NULL;
CREATE INDEX idx_orders_active ON orders (user_id, deleted_at);

-- Query active rows only
SELECT * FROM orders WHERE user_id = ? AND deleted_at IS NULL;

-- Soft delete
UPDATE orders SET deleted_at = NOW() WHERE id = ?;
```

### Full-Text Search

```sql
ALTER TABLE articles ADD FULLTEXT INDEX ft_idx (title, body);

-- Natural language mode
SELECT id, title, MATCH(title, body) AGAINST (:term) AS score
FROM articles
WHERE MATCH(title, body) AGAINST (:term IN NATURAL LANGUAGE MODE)
ORDER BY score DESC
LIMIT 20;

-- Boolean mode (prefix / exclusion)
SELECT id, title FROM articles
WHERE MATCH(title, body) AGAINST ('+mysql -oracle' IN BOOLEAN MODE);
```

### JSON Columns (MySQL 8.0+ / MariaDB 10.2+)

```sql
CREATE TABLE events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payload JSON NOT NULL,
    -- Functional index on a JSON path (MySQL 8.0+)
    created_at DATETIME AS (payload->>'$.created_at') STORED,
    INDEX idx_created_at (created_at)
);

-- Query JSON path
SELECT id, payload->>'$.user_id' AS user_id
FROM events
WHERE payload->>'$.type' = 'purchase';
```

## Transactions

```python
import mysql.connector

conn = mysql.connector.connect(
    host='localhost', user='app', password='secret', database='shop'
)
conn.autocommit = False
cursor = conn.cursor()

try:
    cursor.execute(
        "UPDATE accounts SET balance = balance - %s WHERE id = %s",
        (amount, from_id)
    )
    cursor.execute(
        "UPDATE accounts SET balance = balance + %s WHERE id = %s",
        (amount, to_id)
    )
    conn.commit()
except Exception:
    conn.rollback()
    raise
finally:
    cursor.close()
    conn.close()
```

**Isolation levels** (set per-session or globally):

| Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|-------|-----------|---------------------|--------------|
| `READ UNCOMMITTED` | Yes | Yes | Yes |
| `READ COMMITTED` | No | Yes | Yes |
| `REPEATABLE READ` *(default)* | No | No | No (InnoDB gap locks) |
| `SERIALIZABLE` | No | No | No |

```sql
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

### Deadlock Avoidance

- Always lock rows in the same order across transactions.
- Keep transactions short — acquire locks late, release early.
- Use `SELECT ... FOR UPDATE SKIP LOCKED` for queue-style workloads (MySQL 8.0+ / MariaDB 10.6+):

```sql
START TRANSACTION;
SELECT id FROM jobs
WHERE status = 'pending'
ORDER BY created_at
LIMIT 1
FOR UPDATE SKIP LOCKED;

UPDATE jobs SET status = 'processing', started_at = NOW() WHERE id = ?;
COMMIT;
```

- Inspect the last deadlock: `SHOW ENGINE INNODB STATUS\G`

## Connection Management

### Connection Pooling (Python — mysql-connector-python / SQLAlchemy)

```python
from sqlalchemy import create_engine

engine = create_engine(
    "mysql+mysqlconnector://user:pass@host/db",
    pool_size=10,          # Persistent connections
    max_overflow=5,        # Burst connections above pool_size
    pool_timeout=30,       # Seconds to wait for a connection
    pool_recycle=1800,     # Recycle connections every 30 min (avoids 8-hour timeout)
    pool_pre_ping=True,    # Validate connection before use
    connect_args={"connect_timeout": 5},
)
```

> Set `pool_recycle` below MySQL's `wait_timeout` (default 28800 s / 8 h) to prevent `Lost connection to MySQL server` errors.

### Connection Pooling (Node.js — mysql2)

```javascript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'app',
  password: 'secret',
  database: 'shop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000,
});

// Always use the pool, never individual connections in a web server
const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
```

## Performance Diagnostics

### EXPLAIN / EXPLAIN ANALYZE

```sql
-- Check query plan
EXPLAIN SELECT * FROM orders WHERE user_id = 123 AND status = 'pending';

-- EXPLAIN ANALYZE runs the query and shows actual row estimates (MySQL 8.0.18+ / MariaDB 10.9+)
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123;
```

Key columns to watch in `EXPLAIN` output:

| Column | Bad Sign |
|--------|----------|
| `type` | `ALL` (full table scan) |
| `key` | `NULL` (no index used) |
| `rows` | Very high estimate |
| `Extra` | `Using filesort`, `Using temporary` |

### Slow Query Log

```sql
-- Enable at runtime
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;          -- Log queries > 1 s
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';
SET GLOBAL log_queries_not_using_indexes = 'ON';
```

Parse the log with `pt-query-digest` (Percona Toolkit) for aggregated analysis.

### Useful Diagnostics Queries

```sql
-- Currently running queries
SELECT id, user, host, db, time, state, info
FROM information_schema.PROCESSLIST
WHERE command != 'Sleep'
ORDER BY time DESC;

-- Find missing indexes on foreign keys
SELECT
    kcu.table_name,
    kcu.column_name,
    kcu.constraint_name
FROM information_schema.KEY_COLUMN_USAGE kcu
LEFT JOIN information_schema.STATISTICS s
    ON s.table_schema = kcu.table_schema
    AND s.table_name = kcu.table_name
    AND s.column_name = kcu.column_name
WHERE kcu.table_schema = DATABASE()
    AND kcu.referenced_table_name IS NOT NULL
    AND s.column_name IS NULL;

-- Table sizes
SELECT
    table_name,
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb,
    table_rows
FROM information_schema.TABLES
WHERE table_schema = DATABASE()
ORDER BY size_mb DESC;
```

## Schema Design

### Auto-Increment Primary Keys

```sql
CREATE TABLE orders (
    id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id   BIGINT UNSIGNED NOT NULL,
    status    ENUM('pending','processing','shipped','cancelled') NOT NULL DEFAULT 'pending',
    total     DECIMAL(15,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

> Use `utf8mb4` (not `utf8`) — MySQL's `utf8` is a 3-byte subset that cannot store emoji or supplementary Unicode characters.

### UUID as Binary Primary Key

```sql
CREATE TABLE sessions (
    id      BINARY(16)  NOT NULL DEFAULT (UUID_TO_BIN(UUID(), TRUE)),
    user_id BIGINT UNSIGNED NOT NULL,
    data    JSON,
    expires_at DATETIME NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Insert / select
INSERT INTO sessions (user_id, data, expires_at) VALUES (?, ?, ?);
SELECT BIN_TO_UUID(id, TRUE) AS id, user_id FROM sessions WHERE id = UUID_TO_BIN(?, TRUE);
```

## Replication & High Availability

### Primary/Replica Read Split (Python — SQLAlchemy)

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

write_engine = create_engine("mysql+mysqlconnector://user:pass@primary/db", pool_pre_ping=True)
read_engine  = create_engine("mysql+mysqlconnector://user:pass@replica/db", pool_pre_ping=True)

WriteSession = sessionmaker(bind=write_engine)
ReadSession  = sessionmaker(bind=read_engine)
```

> Reads from the replica may lag by milliseconds to seconds. Never send a read-your-own-write query to the replica immediately after a write.

### Checking Replication Lag

```sql
-- On the replica
SHOW SLAVE STATUS\G        -- MySQL
SHOW REPLICA STATUS\G      -- MySQL 8.0+ / MariaDB 10.6+ (preferred alias)
-- Key fields: Seconds_Behind_Master, Slave_IO_Running, Slave_SQL_Running
```

## Security Hardening

```sql
-- Create a least-privilege application user
CREATE USER 'app'@'%' IDENTIFIED BY 'strong-random-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON myapp.* TO 'app'@'%';
-- Never GRANT ALL or GRANT ON *.* to the application account

-- Revoke anonymous access
DELETE FROM mysql.user WHERE User = '';
FLUSH PRIVILEGES;

-- Require TLS for the app user
ALTER USER 'app'@'%' REQUIRE SSL;

-- Audit: find users with no password (MySQL 5.x)
SELECT user, host FROM mysql.user WHERE authentication_string = '';
```

## Production Configuration Snippets (`my.cnf`)

```ini
[mysqld]
# InnoDB buffer pool — set to 70-80% of available RAM on dedicated DB hosts
innodb_buffer_pool_size = 4G
innodb_buffer_pool_instances = 4      # 1 per GB of buffer pool

# Durability vs. performance
innodb_flush_log_at_trx_commit = 1    # 1 = full ACID; 2 = ~1s data loss risk (faster)
sync_binlog = 1                       # Required for crash-safe replication

# Connection limits
max_connections = 300
thread_cache_size = 50

# Timeouts
wait_timeout = 300                    # Drop idle connections after 5 min
interactive_timeout = 300
innodb_lock_wait_timeout = 10         # Fail fast on lock waits

# Slow query log
slow_query_log = ON
long_query_time = 1
log_queries_not_using_indexes = ON

# Binary logging (required for replication and PITR)
log_bin = mysql-bin
binlog_format = ROW
expire_logs_days = 7                  # MariaDB; use binlog_expire_logs_seconds in MySQL 8.0+
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| `SELECT *` in application code | Over-fetches columns; breaks if schema changes | Select only needed columns |
| `OFFSET n` pagination on large tables | O(n) scan to skip rows | Use keyset/cursor pagination |
| `utf8` charset instead of `utf8mb4` | Cannot store emoji / 4-byte Unicode | Use `utf8mb4` with `utf8mb4_unicode_ci` |
| No index on FK columns | Full table scan on every join | Index every FK column |
| Long-running transactions | Holds row/gap locks; inflates undo log | Keep transactions short; commit often |
| Storing images/binaries in `BLOB` | Bloats DB; slow backups | Store in object storage; keep URL in DB |
| `ENUM` for extensible status values | Schema change needed to add values | Use a `VARCHAR` or a lookup table |
| Auto-increment `INT` PK | Overflows at ~2.1B rows | Use `BIGINT UNSIGNED` |
| `NOW()` in `DEFAULT` expression (MySQL < 8.0) | Only `TIMESTAMP` supported defaults | Use `DATETIME DEFAULT CURRENT_TIMESTAMP` or migrate to 8.0+ |

## Examples

**Add a composite index to speed up a filtered list query:**
Run `EXPLAIN` first. If `type = ALL` and `Extra = Using where`, add an index on the equality column(s) followed by the sort column.

**Paginate a large product catalog:**
Use keyset pagination on `(created_at DESC, id DESC)` with a composite index on those two columns.

**Transfer money between accounts safely:**
Use an explicit transaction with `REPEATABLE READ` isolation. Update rows in a consistent order (lower `id` first) to prevent deadlocks.

**Back-fill a new NOT NULL column without downtime:**
Add the column as `NULL` first, back-fill in batches using `UPDATE ... LIMIT 1000`, then `ALTER TABLE ... MODIFY COLUMN ... NOT NULL`.

## Quick Reference

| Pattern | When to Use |
|---------|-------------|
| Composite index (equality + range) | Multi-column `WHERE` clauses |
| Covering index | Avoid table lookups for hot read paths |
| Keyset pagination | Deep pagination on large tables |
| `FOR UPDATE SKIP LOCKED` | Queue-style job processing |
| `INSERT ... ON DUPLICATE KEY UPDATE` | Upsert without a separate SELECT |
| `EXPLAIN ANALYZE` | Diagnose slow queries with actual row counts |
| `utf8mb4_unicode_ci` | Default charset for all new tables |
| Binary UUID PK | High-insert-rate tables needing UUID PKs |
| Read replica | Offload analytics / reporting queries |

## Related

- Skill: `postgres-patterns` — PostgreSQL-specific patterns
- Skill: `redis-patterns` — caching and session storage alongside MySQL
- Skill: `database-migrations` — schema versioning and migration workflows
- Skill: `backend-patterns` — API and service layer patterns
- Skill: `django-patterns` — Django ORM and MySQL integration
- Agent: `database-reviewer` — database review workflow (primarily PostgreSQL/Supabase; some patterns apply)
