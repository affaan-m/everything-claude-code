---
name: mysql-patterns
description: MySQL patterns for schema design, indexing, query optimization, transactions, connection management, replication, and monitoring with TypeScript and Python examples.
---

# MySQL Development Patterns

Production-grade MySQL patterns for relational database design, querying, and optimization.

## When to Activate

- Designing MySQL schemas (data types, primary keys, foreign keys, JSON columns)
- Creating indexes for query optimization (B-tree, fulltext, composite, covering)
- Writing efficient queries (cursor pagination, upsert, CTEs, window functions)
- Implementing transactions with proper isolation levels
- Managing connection pools (mysql2 for Node.js, SQLAlchemy for Python)
- Setting up replication and high availability
- Troubleshooting slow queries and missing indexes

## Core Principles

1. **Design for queries** — schema follows access patterns; normalize, then selectively denormalize
2. **Index what you query** — every WHERE, JOIN, and ORDER BY column needs an index
3. **Leftmost prefix rule** — composite indexes are used left-to-right; order columns carefully
4. **Avoid SELECT \*** — select only needed columns; enables covering indexes
5. **Paginate with cursors** — offset pagination degrades at scale; use keyset pagination

## Schema Design

### Data Types

```sql
-- Use the smallest type that fits
CREATE TABLE users (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  uuid        BINARY(16)      NOT NULL UNIQUE, -- UUID stored as binary (16 bytes vs 36 chars)
  email       VARCHAR(255)    NOT NULL UNIQUE,
  name        VARCHAR(100)    NOT NULL,
  role        ENUM('admin','editor','viewer') NOT NULL DEFAULT 'viewer',
  metadata    JSON,                            -- Flexible attributes
  is_active   TINYINT(1)      NOT NULL DEFAULT 1,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role_active (role, is_active),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Foreign Keys & Cascading

```sql
CREATE TABLE orders (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  status      ENUM('pending','paid','shipped','cancelled') NOT NULL DEFAULT 'pending',
  total       DECIMAL(10,2)   NOT NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT  -- Prevent user deletion with orders
    ON UPDATE CASCADE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id    BIGINT UNSIGNED NOT NULL,
  product_id  BIGINT UNSIGNED NOT NULL,
  quantity    INT UNSIGNED    NOT NULL DEFAULT 1,
  price       DECIMAL(10,2)   NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE,  -- Delete items when order is deleted
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB;
```

### JSON Columns

```sql
-- Store flexible attributes in JSON
ALTER TABLE products ADD COLUMN attributes JSON;

-- Query JSON fields
SELECT name, attributes->>'$.color' AS color
FROM products
WHERE JSON_EXTRACT(attributes, '$.weight') > 100;

-- Index a generated column from JSON
ALTER TABLE products
  ADD COLUMN color VARCHAR(50) GENERATED ALWAYS AS (attributes->>'$.color') STORED,
  ADD INDEX idx_color (color);
```

## Index Strategies

### Composite Index & Leftmost Prefix Rule

```sql
-- Composite index on (status, created_at, user_id)
CREATE INDEX idx_status_created_user ON orders (status, created_at, user_id);

-- These queries CAN use the index:
SELECT * FROM orders WHERE status = 'paid';                              -- ✅ leftmost
SELECT * FROM orders WHERE status = 'paid' AND created_at > '2024-01-01'; -- ✅ left two
SELECT * FROM orders WHERE status = 'paid' AND created_at > '2024-01-01' AND user_id = 5; -- ✅ all three

-- These queries CANNOT use the index:
SELECT * FROM orders WHERE created_at > '2024-01-01';  -- ❌ skips leftmost
SELECT * FROM orders WHERE user_id = 5;                 -- ❌ skips leftmost
```

### Covering Index

```sql
-- Covering index: all selected columns are in the index
CREATE INDEX idx_covering ON orders (status, created_at, id, total);

-- This query is answered entirely from the index (no table lookup)
EXPLAIN SELECT id, total FROM orders WHERE status = 'paid' AND created_at > '2024-01-01';
-- Extra: Using index  ← "covering index" used
```

### Fulltext Index

```sql
ALTER TABLE articles ADD FULLTEXT INDEX ft_title_body (title, body);

SELECT id, title, MATCH(title, body) AGAINST('mysql optimization' IN NATURAL LANGUAGE MODE) AS score
FROM articles
WHERE MATCH(title, body) AGAINST('mysql optimization' IN NATURAL LANGUAGE MODE)
ORDER BY score DESC
LIMIT 20;
```

### EXPLAIN Analysis

```sql
EXPLAIN ANALYZE
SELECT o.id, o.total, u.name
FROM orders o
JOIN users u ON u.id = o.user_id
WHERE o.status = 'paid' AND o.created_at > '2024-01-01'
ORDER BY o.created_at DESC
LIMIT 20;

-- Key things to check:
-- type: const/ref > range > index > ALL (avoid ALL)
-- rows: estimate of rows scanned (lower is better)
-- Extra: "Using index" good, "Using filesort" or "Using temporary" investigate
```

## Query Patterns

### Cursor Pagination

```sql
-- First page
SELECT id, name, created_at
FROM users
WHERE is_active = 1
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Next pages: use last row's values as cursor
SELECT id, name, created_at
FROM users
WHERE is_active = 1
  AND (created_at, id) < (:last_created_at, :last_id)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

### Upsert (INSERT ON DUPLICATE KEY UPDATE)

```sql
INSERT INTO page_views (page_url, view_date, count)
VALUES ('/blog/post-1', CURDATE(), 1)
ON DUPLICATE KEY UPDATE count = count + 1;
```

### CTE and Window Functions

```sql
-- Monthly revenue with running total
WITH monthly_revenue AS (
  SELECT
    DATE_FORMAT(created_at, '%Y-%m') AS month,
    SUM(total) AS revenue,
    COUNT(*) AS order_count
  FROM orders
  WHERE status = 'paid'
  GROUP BY DATE_FORMAT(created_at, '%Y-%m')
)
SELECT
  month,
  revenue,
  order_count,
  SUM(revenue) OVER (ORDER BY month) AS running_total,
  LAG(revenue) OVER (ORDER BY month) AS prev_month,
  ROUND((revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month) * 100, 1) AS growth_pct
FROM monthly_revenue
ORDER BY month;
```

### Batch Processing

```sql
-- Process large table in batches (avoid locking entire table)
-- Repeat until affected rows = 0:
UPDATE users
SET is_active = 0
WHERE id > :last_id AND last_login < DATE_SUB(NOW(), INTERVAL 1 YEAR) AND is_active = 1
ORDER BY id
LIMIT 1000;
-- Track :last_id = MAX(id) of updated rows, increment until 0 rows affected
```

## Transactions & Locking

### Isolation Levels

```
Level                 Dirty Read  Non-Repeatable Read  Phantom Read
─────────────────────────────────────────────────────────────────────
READ UNCOMMITTED      Yes         Yes                  Yes
READ COMMITTED        No          Yes                  Yes
REPEATABLE READ*      No          No                   Mostly No (InnoDB gap locks)
SERIALIZABLE          No          No                   No

* InnoDB default. Good for most workloads.
```

### Transaction Patterns

```typescript
// TypeScript with mysql2 — transfer funds with row locking
import mysql from "mysql2/promise";

async function transferFunds(pool: mysql.Pool, from: string, to: string, amount: number) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Lock rows in consistent order to prevent deadlocks
    const [fromId, toId] = from < to ? [from, to] : [to, from];
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      "SELECT id, balance FROM accounts WHERE id IN (?, ?) FOR UPDATE",
      [fromId, toId],
    );

    const fromAccount = rows.find(r => r.id === from);
    const toAccount = rows.find(r => r.id === to);

    if (!fromAccount || !toAccount) throw new Error("Account not found");
    if (fromAccount.balance < amount) throw new Error("Insufficient funds");

    await conn.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", [amount, from]);
    await conn.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", [amount, to]);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
```

### Optimistic Locking

```sql
-- Add version column
ALTER TABLE products ADD COLUMN version INT UNSIGNED NOT NULL DEFAULT 0;

-- Update with version check
UPDATE products
SET price = 29.99, version = version + 1
WHERE id = 42 AND version = 3;
-- If affected rows = 0, someone else updated it first → retry or fail
```

## Connection Management

### TypeScript (mysql2)

```typescript
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,       // Match: CPU cores * 2 + effective_spindle_count
  maxIdle: 10,
  idleTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Typed query helper
async function query<T extends mysql.RowDataPacket[]>(sql: string, params?: unknown[]): Promise<T> {
  const [rows] = await pool.execute<T>(sql, params);
  return rows;
}

// Usage
interface UserRow extends mysql.RowDataPacket {
  id: number;
  name: string;
  email: string;
}
const users = await query<UserRow[]>("SELECT id, name, email FROM users WHERE role = ?", ["admin"]);
```

### Python (SQLAlchemy)

```python
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

engine = create_engine(
    "mysql+pymysql://user:pass@localhost:3306/mydb",
    pool_size=10,
    max_overflow=5,
    pool_recycle=3600,  # Reconnect after 1 hour (MySQL wait_timeout)
    pool_pre_ping=True, # Verify connection before use
)

# Context manager ensures proper cleanup
with Session(engine) as session:
    result = session.execute(
        text("SELECT id, name FROM users WHERE role = :role"),
        {"role": "admin"},
    )
    users = result.mappings().all()
```

## Replication & HA

### Read Replica Pattern

```typescript
// Route reads to replica, writes to primary
const primary = mysql.createPool({ host: process.env.DB_PRIMARY_HOST, /* ... */ });
const replica = mysql.createPool({ host: process.env.DB_REPLICA_HOST, /* ... */ });

class UserRepository {
  async findById(id: number) {
    return query<UserRow[]>("SELECT * FROM users WHERE id = ?", [id], replica);
  }

  async create(data: CreateUserDTO) {
    const [result] = await primary.execute(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [data.name, data.email],
    );
    return result;
  }
}

async function query<T extends mysql.RowDataPacket[]>(
  sql: string, params: unknown[], pool: mysql.Pool = replica,
): Promise<T> {
  const [rows] = await pool.execute<T>(sql, params);
  return rows;
}
```

## Monitoring

### Slow Query Log

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 1;
SET GLOBAL long_query_time = 0.5;  -- Log queries > 500ms
SET GLOBAL log_queries_not_using_indexes = 1;

-- Check current status
SHOW VARIABLES LIKE 'slow_query%';
SHOW VARIABLES LIKE 'long_query_time';
```

### Missing Index Detection

```sql
-- Find tables with full scans (no index used)
SELECT
  object_schema AS db,
  object_name AS table_name,
  count_read AS rows_read,
  count_fetch AS rows_fetched
FROM performance_schema.table_io_waits_summary_by_table
WHERE count_read > 10000
ORDER BY count_read DESC
LIMIT 20;

-- Find unused indexes (candidates for removal)
SELECT
  object_schema AS db,
  object_name AS table_name,
  index_name,
  count_star AS usage_count
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE index_name IS NOT NULL AND count_star = 0
ORDER BY object_schema, object_name;
```

## Checklist

```
Before deploying MySQL changes:
- [ ] Tables use InnoDB engine with utf8mb4 charset
- [ ] Primary keys are auto-increment BIGINT or ordered UUIDs
- [ ] All foreign keys have ON DELETE/ON UPDATE actions specified
- [ ] Composite indexes follow leftmost prefix rule for query patterns
- [ ] EXPLAIN shows ref/range access (no ALL on large tables)
- [ ] Pagination uses cursor-based (keyset), not OFFSET
- [ ] Transactions use appropriate isolation level
- [ ] Row locks acquired in consistent order (deadlock prevention)
- [ ] Connection pool sized appropriately (CPU cores * 2 + spindles)
- [ ] Slow query log enabled in staging/production
- [ ] Migrations tested for rollback safety
- [ ] Large table ALTERs use pt-online-schema-change or gh-ost
```
