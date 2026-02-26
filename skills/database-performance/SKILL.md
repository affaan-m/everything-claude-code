---
name: database-performance
description: Database performance optimization for PostgreSQL, MySQL, and ORMs including indexing, query optimization, connection pooling, and caching strategies.
origin: ECC
---

# Database Performance Patterns

Optimization strategies for fast, reliable database operations.

## When to Activate

- Diagnosing slow queries
- Fixing N+1 query problems
- Designing indexing strategies
- Setting up connection pooling and caching
- Optimizing pagination

## Query Optimization

### EXPLAIN ANALYZE

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.name, count(o.id) as order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01'
GROUP BY u.name
ORDER BY order_count DESC
LIMIT 20;
```

Key things to look for:
- **Seq Scan** on large tables — add an index
- **Nested Loop** with high row counts — consider Hash Join
- **Sort** with high memory — add index matching ORDER BY
- **Buffers shared read** — data not in cache

### Index Selection

```sql
-- B-tree: equality and range queries (default)
CREATE INDEX idx_users_email ON users (email);

-- Composite: multi-column queries (most selective first)
CREATE INDEX idx_orders_user_status ON orders (user_id, status);

-- Covering: index-only scans
CREATE INDEX idx_orders_covering ON orders (user_id, status) INCLUDE (total, created_at);

-- Partial: subset of rows
CREATE INDEX idx_active_users ON users (email) WHERE active = true;

-- GIN: full-text search, JSONB
CREATE INDEX idx_products_tags ON products USING gin (tags);

-- Expression: computed values
CREATE INDEX idx_users_lower_email ON users (lower(email));
```

## N+1 Problem

### Detection

```typescript
// Bad: N+1 — one query per user
const users = await db.query('SELECT * FROM users LIMIT 100')
for (const user of users) {
  user.orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [user.id])
}
// Result: 101 queries

// Good: JOIN or batch
const users = await db.query(`
  SELECT u.*, json_agg(o.*) as orders
  FROM users u
  LEFT JOIN orders o ON o.user_id = u.id
  GROUP BY u.id
  LIMIT 100
`)
// Result: 1 query
```

### ORM Solutions

```typescript
// Prisma: include related data
const users = await prisma.user.findMany({
  take: 100,
  include: {
    orders: {
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    },
  },
})

// Django: prefetch_related
users = User.objects.prefetch_related(
    Prefetch('orders', queryset=Order.objects.filter(status='active')[:5])
).all()[:100]
```

## Connection Pooling

```typescript
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  max: 20,                    // Max connections
  idleTimeoutMillis: 30_000,  // Close idle connections after 30s
  connectionTimeoutMillis: 5_000,
})

// Always release connections
async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const client = await pool.connect()
  try {
    const result = await client.query(sql, params)
    return result.rows
  } finally {
    client.release()
  }
}
```

## Caching

### Redis Cache-Aside

```typescript
async function getUser(userId: string): Promise<User> {
  const cacheKey = `user:${userId}`

  // Check cache first
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  // Cache miss — query database
  const user = await db.query('SELECT * FROM users WHERE id = $1', [userId])

  // Store in cache with TTL
  await redis.set(cacheKey, JSON.stringify(user), 'EX', 3600)

  return user
}

// Invalidate on write
async function updateUser(userId: string, data: UpdateUserDto): Promise<User> {
  const user = await db.query(
    'UPDATE users SET name = $1 WHERE id = $2 RETURNING *',
    [data.name, userId],
  )
  await redis.del(`user:${userId}`)
  return user
}
```

### Materialized Views

```sql
CREATE MATERIALIZED VIEW mv_daily_stats AS
SELECT
    date_trunc('day', created_at) AS day,
    count(*) AS order_count,
    sum(total) AS revenue,
    avg(total) AS avg_order_value
FROM orders
GROUP BY 1;

CREATE UNIQUE INDEX idx_mv_daily_stats_day ON mv_daily_stats (day);

-- Refresh without blocking reads
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_stats;
```

## Pagination

### Cursor-Based (Recommended)

```typescript
async function getOrders(cursor?: string, limit: number = 20) {
  const decodedCursor = cursor ? Buffer.from(cursor, 'base64').toString() : null

  const orders = await db.query(
    `SELECT * FROM orders
     WHERE ($1::timestamptz IS NULL OR created_at < $1)
     ORDER BY created_at DESC
     LIMIT $2`,
    [decodedCursor, limit + 1],
  )

  const hasMore = orders.length > limit
  const items = orders.slice(0, limit)
  const nextCursor = hasMore
    ? Buffer.from(items[items.length - 1].created_at.toISOString()).toString('base64')
    : null

  return { items, nextCursor, hasMore }
}
```

### Offset with Deferred Join

```sql
-- Bad: Offset scans and discards rows
SELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 10000;

-- Good: Deferred join — only fetch IDs first
SELECT o.*
FROM orders o
INNER JOIN (
    SELECT id FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 10000
) sub ON o.id = sub.id
ORDER BY o.created_at DESC;
```

## Partitioning

```sql
-- Range partitioning by month
CREATE TABLE events (
    id          bigint GENERATED ALWAYS AS IDENTITY,
    event_type  text NOT NULL,
    payload     jsonb,
    created_at  timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2024_01 PARTITION OF events
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE events_2024_02 PARTITION OF events
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

## Monitoring

### Slow Queries (pg_stat_statements)

```sql
SELECT
    round(total_exec_time::numeric, 2) AS total_ms,
    calls,
    round(mean_exec_time::numeric, 2) AS avg_ms,
    query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;
```

### Cache Hit Ratio

```sql
SELECT
    sum(heap_blks_hit) / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0) AS ratio
FROM pg_statio_user_tables;
-- Should be > 0.99
```

### Lock Monitoring

```sql
SELECT
    blocked_locks.pid AS blocked_pid,
    blocked_activity.query AS blocked_query,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.query AS blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

**Remember**: The fastest query is the one you don't make. Cache aggressively, index strategically, and always measure with `EXPLAIN ANALYZE` before and after optimization.
