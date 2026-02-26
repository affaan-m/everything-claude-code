---
name: database-performance
description: Database performance optimization for PostgreSQL, MySQL, and ORMs including indexing, query optimization, connection pooling, and caching strategies.
origin: ECC
---

# Database Performance Optimization

Comprehensive guide to optimizing database performance across PostgreSQL, MySQL, and popular ORMs. Covers query analysis, indexing strategies, connection pooling, caching layers, pagination, partitioning, ORM best practices, and monitoring.

---

## When to Use

Use this skill when:

- **Slow queries**: Individual queries take more than 100ms, pages load slowly due to database latency
- **N+1 problems**: ORM generates excessive queries, one query per item in a collection
- **Scaling database**: Connection limits being reached, read replicas needed, write throughput insufficient
- **Index selection**: Choosing the right index type, determining which columns to index
- **Query planning**: Understanding EXPLAIN output, identifying sequential scans on large tables
- **Connection issues**: Pool exhaustion, too many open connections, idle connections consuming resources
- **Cache layer design**: Deciding between Redis cache-aside, materialized views, or query-level caching
- **Pagination performance**: OFFSET-based pagination degrading on deep pages

---

## How It Works

Identify bottlenecks with EXPLAIN ANALYZE, add targeted indexes (composite, partial, covering), eliminate N+1 queries with JOINs or DataLoader, use connection pooling (PgBouncer), and layer Redis cache-aside for read-heavy workloads. Cursor-based pagination replaces OFFSET for large datasets.

## Examples

## Query Optimization

### Using EXPLAIN ANALYZE

```sql
-- Always use EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) for real execution stats
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
  o.id,
  o.created_at,
  o.total,
  c.name AS customer_name,
  c.email
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'pending'
  AND o.created_at > NOW() - INTERVAL '30 days'
ORDER BY o.created_at DESC
LIMIT 50;

-- Key things to look for in EXPLAIN output:
-- 1. Seq Scan on large tables (needs index)
-- 2. Nested Loop with high row counts (consider Hash Join)
-- 3. Sort operations without index support
-- 4. Rows estimated vs actual (statistics may be stale)
-- 5. Buffers: shared hit vs read (cache effectiveness)
```

### Index Selection Strategies

```sql
-- B-tree index: Default, good for equality and range queries
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created_at ON orders (created_at);

-- Composite index: Column order matters (most selective first for equality, range last)
CREATE INDEX idx_orders_status_created
  ON orders (status, created_at DESC);

-- This index supports:
--   WHERE status = 'pending' AND created_at > '2025-01-01'  (uses both columns)
--   WHERE status = 'pending'                                   (uses first column)
-- But NOT:
--   WHERE created_at > '2025-01-01'  (skips first column)

-- Covering index: Includes all columns needed by the query (index-only scan)
CREATE INDEX idx_orders_covering
  ON orders (status, created_at DESC)
  INCLUDE (total, customer_id);

-- Partial index: Only indexes rows matching a condition (smaller, faster)
CREATE INDEX idx_orders_pending
  ON orders (created_at DESC)
  WHERE status = 'pending';

-- GIN index: For full-text search, JSONB, and array containment
CREATE INDEX idx_products_tags ON products USING GIN (tags);
CREATE INDEX idx_products_metadata ON products USING GIN (metadata jsonb_path_ops);

-- GiST index: For geometric data, full-text search with ranking, range types
CREATE INDEX idx_locations_geo ON locations USING GIST (coordinates);
CREATE INDEX idx_events_duration ON events USING GIST (duration_range);

-- Expression index: Index computed values
CREATE INDEX idx_users_email_lower ON users (LOWER(email));
-- Query MUST use same expression: WHERE LOWER(email) = 'user@example.com'
```

### Identifying Missing Indexes

```sql
-- PostgreSQL: Find sequential scans on large tables
SELECT
  schemaname,
  relname AS table_name,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  n_live_tup AS estimated_rows,
  CASE
    WHEN seq_scan > 0 THEN seq_tup_read / seq_scan
    ELSE 0
  END AS avg_rows_per_seq_scan
FROM pg_stat_user_tables
WHERE seq_scan > 100
  AND n_live_tup > 10000
ORDER BY seq_tup_read DESC
LIMIT 20;

-- Find unused indexes (candidates for removal)
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan AS times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## N+1 Problem

### Detection

```typescript
// PROBLEM: This generates N+1 queries
// Query 1: SELECT * FROM orders WHERE user_id = $1
// Query 2..N+1: SELECT * FROM products WHERE id = $1 (for each order)
async function getOrdersWithProducts(userId: string): Promise<readonly OrderWithProducts[]> {
  const orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [userId])

  // N additional queries - one per order
  const results = await Promise.all(
    orders.map(async order => {
      const products = await db.query(
        'SELECT * FROM products WHERE id = ANY($1)',
        [order.productIds]
      )
      return { ...order, products }
    })
  )

  return results
}
```

### Solution: JOIN-based Query

```typescript
// FIXED: Single query with JOIN
async function getOrdersWithProducts(userId: string): Promise<readonly OrderWithProducts[]> {
  const result = await db.query(`
    SELECT
      o.id AS order_id,
      o.created_at,
      o.total,
      json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'price', p.price
        )
      ) AS products
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE o.user_id = $1
    GROUP BY o.id, o.created_at, o.total
    ORDER BY o.created_at DESC
  `, [userId])

  return result.rows
}
```

### Solution: DataLoader Pattern

```typescript
import DataLoader from 'dataloader'

// DataLoader batches and deduplicates requests within a single tick
function createProductLoader() {
  return new DataLoader<string, Product>(async (productIds) => {
    const products = await db.query(
      'SELECT * FROM products WHERE id = ANY($1)',
      [productIds]
    )

    // DataLoader requires results in the same order as keys
    const productMap = new Map(products.rows.map((p: Product) => [p.id, p]))
    return productIds.map(id => productMap.get(id) ?? new Error(`Product ${id} not found`))
  })
}

// Usage in a GraphQL resolver or similar context
const productLoader = createProductLoader()

// These 100 calls become a SINGLE query: SELECT * FROM products WHERE id = ANY(...)
const products = await Promise.all(
  orderItems.map(item => productLoader.load(item.productId))
)
```

### Solution: ORM Eager Loading

```typescript
// Prisma: Use include for eager loading
const orders = await prisma.order.findMany({
  where: { userId },
  include: {
    items: {
      include: {
        product: true,  // Eager load products
      },
    },
  },
  orderBy: { createdAt: 'desc' },
})

// Drizzle: Use query API with relations
const orders = await db.query.orders.findMany({
  where: eq(orders.userId, userId),
  with: {
    items: {
      with: {
        product: true,
      },
    },
  },
  orderBy: [desc(orders.createdAt)],
})
```

```python
# Django: select_related (JOIN) and prefetch_related (separate query + merge)
orders = (
    Order.objects
    .filter(user_id=user_id)
    .select_related('customer')            # FK: uses JOIN
    .prefetch_related('items__product')     # M2M/reverse FK: batched queries
    .order_by('-created_at')
)
```

---

## Indexing Strategy

### Composite Index Column Ordering

```sql
-- Rule: Equality columns first, range/sort columns last
-- Query pattern: WHERE status = ? AND category = ? AND created_at > ? ORDER BY created_at

-- GOOD: Equality columns first, then range/sort column
CREATE INDEX idx_optimal ON orders (status, category, created_at DESC);

-- BAD: Range column in the middle breaks the index for category
CREATE INDEX idx_suboptimal ON orders (status, created_at DESC, category);
```

### Index-Only Scans

```sql
-- Covering index eliminates table lookups entirely
-- Check with EXPLAIN: "Index Only Scan" vs "Index Scan"

-- Query we want to optimize:
-- SELECT id, email, name FROM users WHERE email = $1

CREATE INDEX idx_users_email_covering
  ON users (email)
  INCLUDE (id, name);

-- Now this query uses an index-only scan (no heap fetch needed)
EXPLAIN (ANALYZE) SELECT id, email, name FROM users WHERE email = 'user@example.com';
-- Index Only Scan using idx_users_email_covering on users
--   Heap Fetches: 0    <-- This means no table access needed
```

### Avoiding Over-Indexing

```sql
-- Signs of over-indexing:
-- 1. Write operations (INSERT/UPDATE/DELETE) become slow
-- 2. Indexes that are never used (check pg_stat_user_indexes)
-- 3. Multiple overlapping indexes

-- REDUNDANT: If you have (a, b), you don't need (a) alone
CREATE INDEX idx_orders_status_date ON orders (status, created_at);
-- This index already supports WHERE status = 'pending' (uses first column)
-- DROP INDEX idx_orders_status;  -- Redundant

-- Check index bloat
SELECT
  nspname || '.' || relname AS table,
  indexrelname AS index,
  pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
  idx_scan AS index_scans
FROM pg_stat_user_indexes ui
JOIN pg_index i ON ui.indexrelid = i.indexrelid
WHERE NOT i.indisunique
  AND idx_scan < 50
  AND pg_relation_size(i.indexrelid) > 1048576  -- > 1MB
ORDER BY pg_relation_size(i.indexrelid) DESC;
```

---

## Connection Pooling

### PgBouncer Configuration

```ini
; pgbouncer.ini
[databases]
myapp = host=db-primary.internal port=5432 dbname=myapp

[pgbouncer]
; Pool mode: transaction is best for most web apps
pool_mode = transaction

; Pool sizing
; Formula: max_client_conn = expected_app_instances * pool_size_per_instance
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 5
reserve_pool_size = 5

; Timeouts
server_idle_timeout = 300
server_connect_timeout = 5
query_timeout = 30

; Logging
log_connections = 0
log_disconnections = 0
stats_period = 60
```

### Application-Level Pool Sizing

```typescript
// lib/database.ts
import { Pool, type PoolConfig } from 'pg'

function createPool(): Pool {
  const config: PoolConfig = {
    connectionString: process.env.DATABASE_URL,
    // Pool sizing: (2 * CPU cores) + number of disks
    // For a 4-core server with SSD: (2 * 4) + 1 = 9
    max: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
    min: parseInt(process.env.DB_POOL_MIN ?? '2', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    // Prevent connection leaks
    allowExitOnIdle: false,
  }

  const pool = new Pool(config)

  pool.on('error', (error) => {
    console.error('Unexpected pool error:', error)
  })

  pool.on('connect', () => {
    // Set session-level configurations
    // e.g., SET statement_timeout = '30s'
  })

  return pool
}

// Singleton pool instance
let poolInstance: Pool | undefined

export function getPool(): Pool {
  if (!poolInstance) {
    poolInstance = createPool()
  }
  return poolInstance
}

// Always release connections back to pool
export async function withConnection<T>(
  fn: (client: import('pg').PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}

// Transaction helper
export async function withTransaction<T>(
  fn: (client: import('pg').PoolClient) => Promise<T>
): Promise<T> {
  return withConnection(async (client) => {
    await client.query('BEGIN')
    try {
      const result = await fn(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
  })
}
```

---

## Caching Layers

### Redis Cache-Aside Pattern

```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

interface CacheOptions {
  readonly ttlSeconds: number
  readonly prefix?: string
}

async function cacheAside<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions
): Promise<T> {
  const cacheKey = options.prefix ? `${options.prefix}:${key}` : key

  // Try cache first
  const cached = await redis.get(cacheKey)
  if (cached !== null) {
    return JSON.parse(cached) as T
  }

  // Cache miss: fetch from database
  const data = await fetchFn()

  // Write to cache (non-blocking, fire and forget)
  redis.setex(cacheKey, options.ttlSeconds, JSON.stringify(data)).catch(error => {
    console.error('Cache write failed:', error)
  })

  return data
}

// Usage
async function getProduct(id: string): Promise<Product> {
  return cacheAside(
    id,
    () => db.query('SELECT * FROM products WHERE id = $1', [id]).then(r => r.rows[0]),
    { ttlSeconds: 300, prefix: 'product' }
  )
}

// Cache invalidation on write
async function updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
  const result = await db.query(
    'UPDATE products SET name = $2, price = $3 WHERE id = $1 RETURNING *',
    [id, data.name, data.price]
  )

  // Invalidate cache
  await redis.del(`product:${id}`)

  // Also invalidate any list caches that might contain this product
  const listKeys = await redis.keys('products:list:*')
  if (listKeys.length > 0) {
    await redis.del(...listKeys)
  }

  return result.rows[0]
}
```

### Materialized Views

```sql
-- Create a materialized view for expensive aggregation queries
CREATE MATERIALIZED VIEW mv_product_stats AS
SELECT
  p.id AS product_id,
  p.name,
  p.category,
  COUNT(oi.id) AS total_orders,
  SUM(oi.quantity) AS total_quantity_sold,
  AVG(oi.price) AS average_selling_price,
  SUM(oi.quantity * oi.price) AS total_revenue
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id
  AND o.status = 'completed'
GROUP BY p.id, p.name, p.category;

-- Add index on the materialized view
CREATE UNIQUE INDEX idx_mv_product_stats_id ON mv_product_stats (product_id);
CREATE INDEX idx_mv_product_stats_category ON mv_product_stats (category);

-- Refresh periodically (can be done in a cron job or background worker)
-- CONCURRENTLY allows reads during refresh (requires unique index)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_stats;
```

```typescript
// Schedule materialized view refresh
import cron from 'node-cron'

cron.schedule('*/15 * * * *', async () => {
  try {
    await db.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_stats')
  } catch (error) {
    console.error('Materialized view refresh failed:', error)
  }
})
```

---

## Pagination

### Cursor-Based Pagination

```typescript
import { z } from 'zod'

const PaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  direction: z.enum(['forward', 'backward']).default('forward'),
})

interface PaginatedResult<T> {
  readonly data: readonly T[]
  readonly cursor: {
    readonly next: string | null
    readonly previous: string | null
  }
  readonly hasMore: boolean
}

async function paginateOrders(
  userId: string,
  params: z.infer<typeof PaginationSchema>
): Promise<PaginatedResult<Order>> {
  const { cursor, limit, direction } = PaginationSchema.parse(params)

  let query: string
  let queryParams: readonly (string | number)[]

  if (cursor) {
    // Decode cursor (base64-encoded "created_at,id")
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8')
    const [cursorDate, cursorId] = decoded.split(',')

    if (direction === 'forward') {
      query = `
        SELECT * FROM orders
        WHERE user_id = $1
          AND (created_at, id) < ($2::timestamptz, $3::uuid)
        ORDER BY created_at DESC, id DESC
        LIMIT $4
      `
      queryParams = [userId, cursorDate, cursorId, limit + 1]
    } else {
      query = `
        SELECT * FROM (
          SELECT * FROM orders
          WHERE user_id = $1
            AND (created_at, id) > ($2::timestamptz, $3::uuid)
          ORDER BY created_at ASC, id ASC
          LIMIT $4
        ) sub
        ORDER BY created_at DESC, id DESC
      `
      queryParams = [userId, cursorDate, cursorId, limit + 1]
    }
  } else {
    query = `
      SELECT * FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC, id DESC
      LIMIT $2
    `
    queryParams = [userId, limit + 1]
  }

  const result = await db.query(query, queryParams)
  const hasMore = result.rows.length > limit
  const data = hasMore ? result.rows.slice(0, limit) : result.rows

  function encodeCursor(row: Order): string {
    return Buffer.from(`${row.created_at},${row.id}`).toString('base64')
  }

  return {
    data,
    cursor: {
      next: hasMore ? encodeCursor(data[data.length - 1]) : null,
      previous: cursor && data.length > 0 ? encodeCursor(data[0]) : null,
    },
    hasMore,
  }
}

-- Supporting index for cursor-based pagination
-- CREATE INDEX idx_orders_user_cursor ON orders (user_id, created_at DESC, id DESC);
```

### Offset Pagination with Deferred Join

```sql
-- SLOW: Traditional OFFSET (scans and discards rows)
SELECT * FROM products
ORDER BY created_at DESC
OFFSET 10000 LIMIT 20;

-- FAST: Deferred join (only scans IDs, then fetches full rows)
SELECT p.*
FROM products p
JOIN (
  SELECT id FROM products
  ORDER BY created_at DESC
  OFFSET 10000 LIMIT 20
) AS subset ON p.id = subset.id
ORDER BY p.created_at DESC;

-- The inner query uses an index-only scan on (created_at, id)
-- Only 20 full rows are fetched from the table
```

---

## Partitioning

### Range Partitioning

```sql
-- Partition orders by month for time-series data
CREATE TABLE orders (
  id          UUID DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  total       DECIMAL(10, 2) NOT NULL,
  status      VARCHAR(20) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE orders_2025_01 PARTITION OF orders
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE orders_2025_02 PARTITION OF orders
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Automate partition creation
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
  start_date DATE := DATE_TRUNC('month', NOW() + INTERVAL '1 month');
  end_date DATE := start_date + INTERVAL '1 month';
  partition_name TEXT := 'orders_' || TO_CHAR(start_date, 'YYYY_MM');
BEGIN
  EXECUTE FORMAT(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF orders FOR VALUES FROM (%L) TO (%L)',
    partition_name, start_date, end_date
  );

  -- Create indexes on new partition
  EXECUTE FORMAT(
    'CREATE INDEX IF NOT EXISTS %I ON %I (user_id, created_at DESC)',
    partition_name || '_user_idx', partition_name
  );
END;
$$ LANGUAGE plpgsql;

-- Create indexes on each partition (not on parent)
CREATE INDEX idx_orders_2025_01_user ON orders_2025_01 (user_id, created_at DESC);
CREATE INDEX idx_orders_2025_02_user ON orders_2025_02 (user_id, created_at DESC);
```

### Partition Pruning

```sql
-- PostgreSQL automatically prunes partitions when the query filter matches the partition key
-- This query only scans orders_2025_01:
EXPLAIN (ANALYZE)
SELECT * FROM orders
WHERE created_at >= '2025-01-01' AND created_at < '2025-02-01'
  AND user_id = 'abc-123';

-- Verify partition pruning is enabled
SHOW enable_partition_pruning;  -- Should be 'on'
```

---

## ORM Best Practices

### Prisma Performance Patterns

```typescript
// WRONG: Fetching all fields when you only need a few
const users = await prisma.user.findMany()

// CORRECT: Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
})

// WRONG: Individual creates in a loop
for (const item of items) {
  await prisma.orderItem.create({ data: item })  // N queries
}

// CORRECT: Batch operations
await prisma.orderItem.createMany({
  data: items,
  skipDuplicates: true,
})

// CORRECT: Use transactions for related writes
const result = await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({
    data: {
      userId,
      total: calculateTotal(items),
      status: 'pending',
    },
  })

  await tx.orderItem.createMany({
    data: items.map(item => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    })),
  })

  return order
})

// Use raw SQL for complex queries that ORMs handle poorly
const stats = await prisma.$queryRaw<readonly ProductStat[]>`
  SELECT
    p.category,
    COUNT(*) AS product_count,
    AVG(p.price) AS avg_price,
    SUM(CASE WHEN p.stock = 0 THEN 1 ELSE 0 END) AS out_of_stock
  FROM products p
  WHERE p.active = true
  GROUP BY p.category
  ORDER BY product_count DESC
`
```

### Drizzle Performance Patterns

```typescript
import { eq, desc, sql, and, gt } from 'drizzle-orm'
import { db } from './db'
import { orders, orderItems, products } from './schema'

// Efficient batch insert
async function createOrderWithItems(
  userId: string,
  items: readonly OrderItemInput[]
): Promise<Order> {
  return db.transaction(async (tx) => {
    const [order] = await tx.insert(orders).values({
      userId,
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      status: 'pending',
    }).returning()

    await tx.insert(orderItems).values(
      items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }))
    )

    return order
  })
}

// Subquery for efficient aggregation
const subquery = db
  .select({
    productId: orderItems.productId,
    totalSold: sql<number>`SUM(${orderItems.quantity})`.as('total_sold'),
  })
  .from(orderItems)
  .groupBy(orderItems.productId)
  .as('sales')

const topProducts = await db
  .select({
    id: products.id,
    name: products.name,
    totalSold: subquery.totalSold,
  })
  .from(products)
  .innerJoin(subquery, eq(products.id, subquery.productId))
  .orderBy(desc(subquery.totalSold))
  .limit(10)
```

---

## Monitoring

### pg_stat_statements

```sql
-- Enable pg_stat_statements (must be in shared_preload_libraries)
-- postgresql.conf: shared_preload_libraries = 'pg_stat_statements'
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slowest queries by total time
SELECT
  LEFT(query, 100) AS short_query,
  calls,
  ROUND(total_exec_time::numeric, 2) AS total_ms,
  ROUND(mean_exec_time::numeric, 2) AS mean_ms,
  ROUND(max_exec_time::numeric, 2) AS max_ms,
  rows,
  ROUND((shared_blks_hit::numeric / NULLIF(shared_blks_hit + shared_blks_read, 0)) * 100, 2) AS cache_hit_pct
FROM pg_stat_statements
WHERE userid = (SELECT usesysid FROM pg_user WHERE usename = current_user)
ORDER BY total_exec_time DESC
LIMIT 20;

-- Find queries with worst cache hit ratio
SELECT
  LEFT(query, 100) AS short_query,
  calls,
  shared_blks_hit,
  shared_blks_read,
  ROUND((shared_blks_hit::numeric / NULLIF(shared_blks_hit + shared_blks_read, 0)) * 100, 2) AS cache_hit_pct
FROM pg_stat_statements
WHERE calls > 100
  AND shared_blks_hit + shared_blks_read > 0
ORDER BY cache_hit_pct ASC
LIMIT 20;

-- Reset statistics periodically
SELECT pg_stat_statements_reset();
```

### Lock Monitoring

```sql
-- Find blocking queries
SELECT
  blocked.pid AS blocked_pid,
  blocked.query AS blocked_query,
  blocking.pid AS blocking_pid,
  blocking.query AS blocking_query,
  NOW() - blocked.query_start AS blocked_duration
FROM pg_stat_activity blocked
JOIN pg_locks bl ON bl.pid = blocked.pid AND NOT bl.granted
JOIN pg_locks gl ON gl.pid != blocked.pid
  AND gl.locktype = bl.locktype
  AND gl.database IS NOT DISTINCT FROM bl.database
  AND gl.relation IS NOT DISTINCT FROM bl.relation
  AND gl.page IS NOT DISTINCT FROM bl.page
  AND gl.tuple IS NOT DISTINCT FROM bl.tuple
  AND gl.virtualxid IS NOT DISTINCT FROM bl.virtualxid
  AND gl.transactionid IS NOT DISTINCT FROM bl.transactionid
  AND gl.classid IS NOT DISTINCT FROM bl.classid
  AND gl.objid IS NOT DISTINCT FROM bl.objid
  AND gl.objsubid IS NOT DISTINCT FROM bl.objsubid
  AND gl.granted
JOIN pg_stat_activity blocking ON blocking.pid = gl.pid
ORDER BY blocked_duration DESC;

-- Set statement timeout to prevent long-running queries
SET statement_timeout = '30s';

-- Set lock timeout to prevent long waits for locks
SET lock_timeout = '5s';
```

### Slow Query Log Configuration

```sql
-- postgresql.conf settings for slow query logging
-- log_min_duration_statement = 200   -- Log queries slower than 200ms
-- log_statement = 'none'             -- Don't log all statements
-- log_lock_waits = on                -- Log when waiting for locks > deadlock_timeout
-- auto_explain.log_min_duration = '500ms'  -- Auto-explain slow queries
```

### Application-Level Query Monitoring

```typescript
// middleware/query-logger.ts
import { getPool } from '../lib/database'

interface QueryMetric {
  readonly query: string
  readonly duration: number
  readonly timestamp: Date
  readonly rowCount: number
}

const slowQueryThreshold = 200  // ms

export function createMonitoredPool() {
  const pool = getPool()

  const originalQuery = pool.query.bind(pool)

  pool.query = async function monitoredQuery(...args: Parameters<typeof originalQuery>) {
    const start = performance.now()
    try {
      const result = await originalQuery(...args)
      const duration = performance.now() - start

      if (duration > slowQueryThreshold) {
        const metric: QueryMetric = {
          query: typeof args[0] === 'string' ? args[0].slice(0, 200) : 'prepared',
          duration: Math.round(duration),
          timestamp: new Date(),
          rowCount: result.rowCount ?? 0,
        }

        reportSlowQuery(metric)
      }

      return result
    } catch (error) {
      const duration = performance.now() - start
      reportQueryError(args, duration, error)
      throw error
    }
  } as typeof originalQuery

  return pool
}

function reportSlowQuery(metric: QueryMetric): void {
  // Send to monitoring service (e.g., Datadog, New Relic)
  console.error(`Slow query (${metric.duration}ms): ${metric.query}`)
}

function reportQueryError(args: unknown[], duration: number, error: unknown): void {
  console.error(`Query error after ${Math.round(duration)}ms:`, error)
}
```

---

## Quick Reference Checklist

Before deploying database changes:

- [ ] EXPLAIN ANALYZE run on all new/modified queries
- [ ] Indexes support query WHERE, JOIN, and ORDER BY clauses
- [ ] No N+1 queries (check with query logging enabled)
- [ ] Connection pool sized appropriately for workload
- [ ] Slow query logging enabled (threshold: 200ms)
- [ ] pg_stat_statements enabled and reviewed
- [ ] No sequential scans on tables with > 10K rows
- [ ] Partial indexes used for frequently filtered subsets
- [ ] Batch operations used instead of individual inserts/updates
- [ ] Materialized views considered for expensive aggregations
- [ ] Cursor-based pagination for user-facing lists
- [ ] Statement and lock timeouts configured
- [ ] Cache invalidation strategy documented
- [ ] Unused indexes identified and removed
- [ ] Partitioning evaluated for tables exceeding 100M rows
