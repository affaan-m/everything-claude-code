---
name: api-performance
description: API performance patterns including caching, pagination, rate limiting, compression, async processing, and horizontal scaling strategies.
origin: ECC
---

# API Performance Optimization

Comprehensive guide to building and optimizing high-performance APIs. Covers caching strategies, pagination patterns, compression, async processing, rate limiting, connection management, batch operations, load balancing, and monitoring.

---

## When to Use

Use this skill when:

- **API latency issues**: p95 response times exceed acceptable thresholds (typically > 200ms for read endpoints)
- **High traffic**: Service needs to handle 1000+ requests per second
- **Scaling services**: Preparing for traffic spikes, adding horizontal scaling
- **Caching design**: Implementing cache layers, choosing invalidation strategies
- **Rate limiting**: Protecting APIs from abuse, implementing fair usage policies
- **Async processing**: Moving expensive operations out of the request/response cycle
- **Reducing payload size**: API responses are too large, bandwidth costs are high
- **Monitoring gaps**: Insufficient visibility into API performance characteristics

---

## How It Works

Optimize APIs by layering caching (HTTP headers, Redis, CDN), efficient pagination (cursor-based), compression (gzip/brotli), async processing for expensive operations, and rate limiting to protect availability. Measure with percentile-based metrics (p50/p95/p99).

## Examples

## Caching Strategies

### HTTP Caching Headers

```typescript
// middleware/cache-headers.ts
import type { Request, Response, NextFunction } from 'express'

interface CacheConfig {
  readonly maxAge: number
  readonly staleWhileRevalidate?: number
  readonly isPrivate?: boolean
  readonly varyHeaders?: readonly string[]
}

function setCacheHeaders(config: CacheConfig) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const directives: string[] = []

    if (config.isPrivate) {
      directives.push('private')
    } else {
      directives.push('public')
    }

    directives.push(`max-age=${config.maxAge}`)

    if (config.staleWhileRevalidate) {
      directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`)
    }

    res.setHeader('Cache-Control', directives.join(', '))

    if (config.varyHeaders && config.varyHeaders.length > 0) {
      res.setHeader('Vary', config.varyHeaders.join(', '))
    }

    next()
  }
}

// Apply per route
app.get('/api/products',
  setCacheHeaders({ maxAge: 60, staleWhileRevalidate: 300, varyHeaders: ['Accept-Encoding'] }),
  productsHandler
)

app.get('/api/user/profile',
  setCacheHeaders({ maxAge: 0, isPrivate: true }),
  profileHandler
)
```

### ETag / If-None-Match

```typescript
import crypto from 'node:crypto'
import type { Request, Response } from 'express'

function generateETag(data: unknown): string {
  const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')
  return `"${hash}"`
}

async function getProductsHandler(req: Request, res: Response): Promise<void> {
  const products = await fetchProducts()
  const etag = generateETag(products)

  // Check if client has a cached version
  const ifNoneMatch = req.headers['if-none-match']
  if (ifNoneMatch === etag) {
    res.status(304).end()
    return
  }

  res.setHeader('ETag', etag)
  res.setHeader('Cache-Control', 'public, max-age=60')
  res.json({ success: true, data: products })
}
```

### CDN Cache with Surrogate Keys

```typescript
// Fastly/Varnish-style surrogate key caching
async function getProductHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const product = await fetchProduct(id)

  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' })
    return
  }

  // Surrogate keys allow targeted cache purging
  res.setHeader('Surrogate-Key', `product-${id} products category-${product.category}`)
  res.setHeader('Surrogate-Control', 'max-age=3600')
  res.setHeader('Cache-Control', 'public, max-age=60')

  res.json({ success: true, data: product })
}

// Purge by surrogate key when product is updated
async function purgeProductCache(productId: string, category: string): Promise<void> {
  try {
    await fetch(`https://api.fastly.com/service/${FASTLY_SERVICE_ID}/purge/product-${productId}`, {
      method: 'POST',
      headers: { 'Fastly-Key': FASTLY_API_KEY },
    })

    // Also purge list caches for this category
    await fetch(`https://api.fastly.com/service/${FASTLY_SERVICE_ID}/purge/category-${category}`, {
      method: 'POST',
      headers: { 'Fastly-Key': FASTLY_API_KEY },
    })
  } catch (error) {
    console.error('CDN purge failed:', error)
    throw new Error('Failed to purge CDN cache')
  }
}
```

### Application-Level Redis Cache

```typescript
// lib/cache.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

interface CacheEntry<T> {
  readonly data: T
  readonly cachedAt: number
  readonly ttl: number
}

export async function getOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const cached = await redis.get(key)

  if (cached !== null) {
    const entry = JSON.parse(cached) as CacheEntry<T>
    return entry.data
  }

  const data = await fetchFn()

  const entry: CacheEntry<T> = {
    data,
    cachedAt: Date.now(),
    ttl: ttlSeconds,
  }

  await redis.setex(key, ttlSeconds, JSON.stringify(entry))

  return data
}

// Cache stampede prevention with locking
export async function getOrSetWithLock<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number,
  maxRetries: number = 5
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const cached = await redis.get(key)
    if (cached !== null) {
      return (JSON.parse(cached) as CacheEntry<T>).data
    }

    const lockKey = `lock:${key}`
    const lockToken = crypto.randomUUID()
    const lockAcquired = await redis.set(lockKey, lockToken, 'EX', 10, 'NX')

    if (lockAcquired) {
      try {
        const data = await fetchFn()
        const entry: CacheEntry<T> = { data, cachedAt: Date.now(), ttl: ttlSeconds }
        await redis.setex(key, ttlSeconds, JSON.stringify(entry))
        return data
      } finally {
        // Release lock atomically: only delete if we still own it
        await redis.eval(
          `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`,
          1,
          lockKey,
          lockToken
        )
      }
    }

    // Another process holds the lock - wait with exponential backoff and retry
    await new Promise(resolve => setTimeout(resolve, 100 * 2 ** attempt))
  }

  // Exhausted retries: fetch without caching as fallback
  return fetchFn()
}

// Bulk cache invalidation with patterns
export async function invalidatePattern(pattern: string): Promise<number> {
  let cursor = '0'
  let deletedCount = 0

  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
    cursor = nextCursor

    if (keys.length > 0) {
      await redis.del(...keys)
      deletedCount += keys.length
    }
  } while (cursor !== '0')

  return deletedCount
}
```

---

## Pagination

### Cursor-Based Pagination (REST)

```typescript
import { z } from 'zod'
import type { Request, Response } from 'express'

const PaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

interface CursorPage<T> {
  readonly data: readonly T[]
  readonly pagination: {
    readonly nextCursor: string | null
    readonly previousCursor: string | null
    readonly hasNext: boolean
    readonly hasPrevious: boolean
  }
}

function encodeCursor(id: string, sortValue: string): string {
  return Buffer.from(JSON.stringify({ id, sv: sortValue })).toString('base64url')
}

function decodeCursor(cursor: string): { id: string; sv: string } {
  return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8'))
}

async function listProducts(req: Request, res: Response): Promise<void> {
  const { cursor, limit } = PaginationQuerySchema.parse(req.query)

  let whereClause = ''
  const params: (string | number)[] = []

  if (cursor) {
    const { id, sv } = decodeCursor(cursor)
    whereClause = 'WHERE (p.created_at, p.id) < ($1::timestamptz, $2::uuid)'
    params.push(sv, id)
  }

  const query = `
    SELECT p.id, p.name, p.price, p.created_at
    FROM products p
    ${whereClause}
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT $${params.length + 1}
  `
  params.push(limit + 1)

  const result = await db.query(query, params)
  const hasNext = result.rows.length > limit
  const items = hasNext ? result.rows.slice(0, limit) : result.rows

  const page: CursorPage<Product> = {
    data: items,
    pagination: {
      nextCursor: hasNext
        ? encodeCursor(items[items.length - 1].id, items[items.length - 1].created_at)
        : null,
      previousCursor: cursor ?? null,
      hasNext,
      hasPrevious: cursor !== undefined,
    },
  }

  res.json({ success: true, ...page })
}
```

### GraphQL Relay-Style Pagination

```typescript
// schema/product.ts
import { objectType, queryField, stringArg, intArg } from 'nexus'

export const ProductEdge = objectType({
  name: 'ProductEdge',
  definition(t) {
    t.nonNull.string('cursor')
    t.nonNull.field('node', { type: 'Product' })
  },
})

export const ProductConnection = objectType({
  name: 'ProductConnection',
  definition(t) {
    t.nonNull.list.nonNull.field('edges', { type: 'ProductEdge' })
    t.nonNull.field('pageInfo', { type: 'PageInfo' })
    t.nonNull.int('totalCount')
  },
})

export const productsQuery = queryField('products', {
  type: 'ProductConnection',
  args: {
    first: intArg({ default: 20 }),
    after: stringArg(),
    category: stringArg(),
  },
  async resolve(_root, args, ctx) {
    const limit = Math.min(args.first ?? 20, 100)
    const cursor = args.after ? decodeCursor(args.after) : null

    const [items, totalCount] = await Promise.all([
      ctx.db.product.findMany({
        where: {
          ...(args.category ? { category: args.category } : {}),
          ...(cursor ? { createdAt: { lt: new Date(cursor.sv) } } : {}),
        },
        take: limit + 1,
        orderBy: { createdAt: 'desc' },
      }),
      ctx.db.product.count({
        where: args.category ? { category: args.category } : {},
      }),
    ])

    const hasNextPage = items.length > limit
    const edges = (hasNextPage ? items.slice(0, limit) : items).map(item => ({
      cursor: encodeCursor(item.id, item.createdAt.toISOString()),
      node: item,
    }))

    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: cursor !== null,
        startCursor: edges[0]?.cursor ?? null,
        endCursor: edges[edges.length - 1]?.cursor ?? null,
      },
      totalCount,
    }
  },
})
```

---

## Compression

### Response Compression Middleware

```typescript
// TypeScript (Express)
import compression from 'compression'
import type { Request, Response } from 'express'

app.use(compression({
  level: 6,                     // Compression level (1-9, default 6)
  threshold: 1024,              // Only compress responses > 1KB
  filter: (req: Request, res: Response) => {
    // Skip compression for already-compressed content
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  },
}))
```

```python
# Python (FastAPI)
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### Brotli Compression for Static Assets

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  compress: true,  // Enables gzip by default
  // For Brotli, use a reverse proxy (nginx, Cloudflare, etc.)
}

export default nextConfig

// nginx configuration for Brotli
// brotli on;
// brotli_comp_level 6;
// brotli_types text/plain text/css application/json application/javascript text/xml;
```

### Selective Field Responses

```typescript
import { z } from 'zod'

const FieldsQuerySchema = z.object({
  fields: z.string().optional(),  // Comma-separated field list
})

function selectFields<T extends Record<string, unknown>>(
  data: T,
  fields: readonly string[] | undefined
): Partial<T> {
  if (!fields || fields.length === 0) {
    return data
  }

  const result: Record<string, unknown> = {}
  for (const field of fields) {
    if (field in data) {
      result[field] = data[field]
    }
  }
  return result as Partial<T>
}

// GET /api/products?fields=id,name,price
async function listProductsHandler(req: Request, res: Response): Promise<void> {
  const { fields } = FieldsQuerySchema.parse(req.query)
  const fieldList = fields?.split(',').map(f => f.trim())

  const products = await fetchProducts()
  const filtered = products.map(p => selectFields(p, fieldList))

  res.json({ success: true, data: filtered })
}
```

---

## Async Processing

### Message Queue with BullMQ

```typescript
// queues/email.ts
import { Queue, Worker, type Job } from 'bullmq'
import Redis from 'ioredis'

const connection = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })

interface EmailJobData {
  readonly to: string
  readonly subject: string
  readonly template: string
  readonly variables: Record<string, string>
}

// Producer: Queue the job
export const emailQueue = new Queue<EmailJobData>('email', {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

export async function queueEmail(data: EmailJobData): Promise<string> {
  const job = await emailQueue.add('send', data, {
    priority: data.template === 'password-reset' ? 1 : 10,
  })
  return job.id ?? 'unknown'
}

// Consumer: Process the job
const emailWorker = new Worker<EmailJobData>(
  'email',
  async (job: Job<EmailJobData>) => {
    const { to, subject, template, variables } = job.data

    await job.updateProgress(10)
    const html = await renderTemplate(template, variables)

    await job.updateProgress(50)
    await sendEmail({ to, subject, html })

    await job.updateProgress(100)
    return { sent: true, to }
  },
  {
    connection,
    concurrency: 5,
    limiter: {
      max: 100,
      duration: 60000,  // Max 100 emails per minute
    },
  }
)

emailWorker.on('failed', (job, error) => {
  console.error(`Email job ${job?.id} failed:`, error)
})
```

### Webhook Delivery with Retry

```typescript
// services/webhook.ts
import { Queue, Worker, type Job } from 'bullmq'

interface WebhookPayload {
  readonly url: string
  readonly event: string
  readonly data: Record<string, unknown>
  readonly signature: string
}

export const webhookQueue = new Queue<WebhookPayload>('webhooks', {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'custom',
    },
  },
})

// Custom backoff: 1min, 5min, 30min, 2h, 24h
function calculateBackoff(attemptsMade: number): number {
  const delays = [60_000, 300_000, 1_800_000, 7_200_000, 86_400_000]
  return delays[Math.min(attemptsMade - 1, delays.length - 1)]
}

const webhookWorker = new Worker<WebhookPayload>(
  'webhooks',
  async (job: Job<WebhookPayload>) => {
    const { url, event, data, signature } = job.data

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
        'X-Webhook-Signature': signature,
        'X-Webhook-Delivery': job.id ?? 'unknown',
      },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(10000),  // 10s timeout
    })

    if (!response.ok) {
      throw new Error(`Webhook delivery failed: ${response.status} ${response.statusText}`)
    }

    return { status: response.status, deliveredAt: new Date().toISOString() }
  },
  {
    connection,
    concurrency: 10,
    settings: {
      backoffStrategy: calculateBackoff,
    },
  }
)
```

### Event-Driven Architecture

```typescript
// lib/event-bus.ts
import { EventEmitter } from 'node:events'

interface DomainEvents {
  readonly 'order.created': { orderId: string; userId: string; total: number }
  readonly 'order.completed': { orderId: string; userId: string }
  readonly 'user.registered': { userId: string; email: string }
  readonly 'product.stock-low': { productId: string; currentStock: number }
}

type EventName = keyof DomainEvents

class TypedEventBus {
  private readonly emitter = new EventEmitter()

  emit<E extends EventName>(event: E, payload: DomainEvents[E]): void {
    this.emitter.emit(event, payload)
  }

  on<E extends EventName>(event: E, handler: (payload: DomainEvents[E]) => void | Promise<void>): void {
    this.emitter.on(event, handler)
  }
}

export const eventBus = new TypedEventBus()

// Register handlers
eventBus.on('order.created', async (payload) => {
  await queueEmail({
    to: await getUserEmail(payload.userId),
    subject: 'Order Confirmation',
    template: 'order-confirmation',
    variables: { orderId: payload.orderId, total: String(payload.total) },
  })
})

eventBus.on('order.created', async (payload) => {
  await updateInventory(payload.orderId)
})

eventBus.on('product.stock-low', async (payload) => {
  await notifyInventoryTeam(payload.productId, payload.currentStock)
})
```

---

## Rate Limiting

### Token Bucket with Redis

```typescript
// middleware/rate-limiter.ts
import Redis from 'ioredis'
import type { Request, Response, NextFunction } from 'express'

const redis = new Redis(process.env.REDIS_URL)

interface RateLimitConfig {
  readonly maxTokens: number
  readonly refillRate: number       // Tokens per second
  readonly keyPrefix: string
}

async function tokenBucketCheck(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now()
  const bucketKey = `${config.keyPrefix}:${key}`

  // Lua script for atomic token bucket operation
  const result = await redis.eval(`
    local key = KEYS[1]
    local max_tokens = tonumber(ARGV[1])
    local refill_rate = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])

    local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
    local tokens = tonumber(bucket[1]) or max_tokens
    local last_refill = tonumber(bucket[2]) or now

    -- Refill tokens based on elapsed time
    local elapsed = (now - last_refill) / 1000
    tokens = math.min(max_tokens, tokens + (elapsed * refill_rate))

    local allowed = 0
    if tokens >= 1 then
      tokens = tokens - 1
      allowed = 1
    end

    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
    redis.call('EXPIRE', key, math.ceil(max_tokens / refill_rate) + 1)

    return {allowed, math.floor(tokens), math.ceil((max_tokens - tokens) / refill_rate * 1000)}
  `, 1, bucketKey, config.maxTokens, config.refillRate, now) as [number, number, number]

  return {
    allowed: result[0] === 1,
    remaining: result[1],
    resetAt: now + result[2],
  }
}

export function rateLimit(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Key by authenticated user or IP
    const key = req.user?.id ?? req.ip ?? 'anonymous'

    const { allowed, remaining, resetAt } = await tokenBucketCheck(key, config)

    res.setHeader('X-RateLimit-Limit', config.maxTokens)
    res.setHeader('X-RateLimit-Remaining', remaining)
    res.setHeader('X-RateLimit-Reset', Math.ceil(resetAt / 1000))

    if (!allowed) {
      res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
      })
      return
    }

    next()
  }
}

// Apply different limits per route
app.get('/api/products',
  rateLimit({ maxTokens: 100, refillRate: 10, keyPrefix: 'rl:products' }),
  productsHandler
)

app.post('/api/auth/login',
  rateLimit({ maxTokens: 5, refillRate: 0.1, keyPrefix: 'rl:login' }),  // 5 attempts, 1 per 10s
  loginHandler
)
```

### Sliding Window Rate Limiter

```python
# Python (FastAPI) with Redis sliding window
import time
import redis.asyncio as redis
from fastapi import HTTPException, Request

redis_client = redis.from_url("redis://localhost:6379")

async def sliding_window_rate_limit(
    key: str,
    max_requests: int,
    window_seconds: int,
) -> dict:
    now = time.time()
    window_start = now - window_seconds
    pipe = redis_client.pipeline()

    # Remove expired entries
    pipe.zremrangebyscore(key, 0, window_start)
    # Add current request
    pipe.zadd(key, {str(now): now})
    # Count requests in window
    pipe.zcard(key)
    # Set expiry on the sorted set
    pipe.expire(key, window_seconds)

    results = await pipe.execute()
    request_count = results[2]

    return {
        "allowed": request_count <= max_requests,
        "current": request_count,
        "limit": max_requests,
        "remaining": max(0, max_requests - request_count),
    }


async def rate_limit_middleware(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    key = f"ratelimit:{client_ip}:{request.url.path}"

    result = await sliding_window_rate_limit(
        key=key,
        max_requests=60,
        window_seconds=60,
    )

    if not result["allowed"]:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded",
            headers={"Retry-After": "60"},
        )
```

---

## Connection Management

### HTTP Keep-Alive and Connection Pooling

```typescript
// lib/http-client.ts
import { Agent } from 'node:http'
import { Agent as HttpsAgent } from 'node:https'

// Reuse TCP connections across requests
const httpAgent = new Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,           // Max concurrent connections per host
  maxFreeSockets: 10,       // Max idle connections to keep alive
  timeout: 30000,
})

const httpsAgent = new HttpsAgent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 30000,
})

export async function fetchWithPool(url: string, options: RequestInit = {}): Promise<Response> {
  const isHttps = url.startsWith('https://')

  return fetch(url, {
    ...options,
    // @ts-expect-error Node.js fetch supports agent option
    agent: isHttps ? httpsAgent : httpAgent,
  })
}
```

### Graceful Shutdown

```typescript
// server.ts
import { createServer, type Server } from 'node:http'

let server: Server
let isShuttingDown = false

function startServer(app: Express): void {
  server = createServer(app)

  server.listen(3000, () => {
    console.error('Server listening on port 3000')
  })

  // Track active connections for graceful shutdown
  const connections = new Set<import('node:net').Socket>()

  server.on('connection', (socket) => {
    connections.add(socket)
    socket.on('close', () => connections.delete(socket))
  })

  async function shutdown(signal: string): Promise<void> {
    if (isShuttingDown) return
    isShuttingDown = true

    console.error(`Received ${signal}. Starting graceful shutdown...`)

    // Stop accepting new connections
    server.close(() => {
      console.error('HTTP server closed')
      process.exit(0)
    })

    // Set a hard deadline
    setTimeout(() => {
      console.error('Forced shutdown after timeout')
      process.exit(1)
    }, 30000)

    // Close idle connections immediately
    for (const socket of connections) {
      if (!socket.destroyed) {
        socket.end()
      }
    }

    // Close background workers
    await emailQueue.close()
    await webhookQueue.close()

    // Close database pool
    await pool.end()

    // Close Redis
    await redis.quit()
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}
```

---

## Batch APIs

### Bulk Endpoint

```typescript
import { z } from 'zod'

const BulkOperationSchema = z.object({
  operations: z.array(z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
    path: z.string(),
    body: z.record(z.unknown()).optional(),
    id: z.string(),  // Client-provided correlation ID
  })).min(1).max(50),
})

interface BulkResult {
  readonly id: string
  readonly status: number
  readonly body: unknown
}

async function bulkHandler(req: Request, res: Response): Promise<void> {
  const { operations } = BulkOperationSchema.parse(req.body)

  // Execute operations in parallel with concurrency limit
  const results: BulkResult[] = await Promise.all(
    operations.map(async (op) => {
      try {
        const result = await executeOperation(op.method, op.path, op.body, req.user)
        return { id: op.id, status: 200, body: result }
      } catch (error) {
        const status = error instanceof AppError ? error.statusCode : 500
        const message = error instanceof Error ? error.message : 'Internal error'
        return { id: op.id, status, body: { error: message } }
      }
    })
  )

  // 207 Multi-Status when results have mixed statuses
  const allSucceeded = results.every(r => r.status >= 200 && r.status < 300)
  res.status(allSucceeded ? 200 : 207).json({
    success: allSucceeded,
    results,
  })
}

app.post('/api/bulk', bulkHandler)
```

### GraphQL DataLoader Pattern

```typescript
// loaders/index.ts
import DataLoader from 'dataloader'
import type { PrismaClient } from '@prisma/client'

export function createLoaders(prisma: PrismaClient) {
  return {
    user: new DataLoader<string, User | null>(async (ids) => {
      const users = await prisma.user.findMany({
        where: { id: { in: [...ids] } },
      })
      const userMap = new Map(users.map(u => [u.id, u]))
      return ids.map(id => userMap.get(id) ?? null)
    }),

    productsByCategory: new DataLoader<string, Product[]>(async (categories) => {
      const products = await prisma.product.findMany({
        where: { category: { in: [...categories] } },
      })
      const grouped = new Map<string, Product[]>()
      for (const product of products) {
        const list = grouped.get(product.category) ?? []
        grouped.set(product.category, [...list, product])
      }
      return categories.map(cat => grouped.get(cat) ?? [])
    }),

    orderCount: new DataLoader<string, number>(async (userIds) => {
      const counts = await prisma.order.groupBy({
        by: ['userId'],
        where: { userId: { in: [...userIds] } },
        _count: true,
      })
      const countMap = new Map(counts.map(c => [c.userId, c._count]))
      return userIds.map(id => countMap.get(id) ?? 0)
    }),
  }
}

// Create fresh loaders per request to ensure correct batching
app.use((req, _res, next) => {
  req.loaders = createLoaders(prisma)
  next()
})
```

---

## Load Balancing

### Health Check Endpoint

```typescript
// routes/health.ts
interface HealthStatus {
  readonly status: 'healthy' | 'degraded' | 'unhealthy'
  readonly checks: Record<string, {
    readonly status: 'pass' | 'fail'
    readonly latencyMs: number
    readonly message?: string
  }>
  readonly uptime: number
  readonly version: string
}

async function healthCheck(_req: Request, res: Response): Promise<void> {
  const checks: HealthStatus['checks'] = {}

  // Database check
  const dbStart = performance.now()
  try {
    await db.query('SELECT 1')
    checks.database = { status: 'pass', latencyMs: Math.round(performance.now() - dbStart) }
  } catch (error) {
    checks.database = {
      status: 'fail',
      latencyMs: Math.round(performance.now() - dbStart),
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  // Redis check
  const redisStart = performance.now()
  try {
    await redis.ping()
    checks.redis = { status: 'pass', latencyMs: Math.round(performance.now() - redisStart) }
  } catch (error) {
    checks.redis = {
      status: 'fail',
      latencyMs: Math.round(performance.now() - redisStart),
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }

  const allPassing = Object.values(checks).every(c => c.status === 'pass')
  const anyFailing = Object.values(checks).some(c => c.status === 'fail')

  const health: HealthStatus = {
    status: allPassing ? 'healthy' : anyFailing ? 'unhealthy' : 'degraded',
    checks,
    uptime: process.uptime(),
    version: process.env.APP_VERSION ?? 'unknown',
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503
  res.status(statusCode).json(health)
}

// Lightweight liveness probe (for Kubernetes)
app.get('/healthz', (_req, res) => res.status(200).send('OK'))

// Detailed readiness probe
app.get('/readyz', healthCheck)
```

---

## Monitoring

### Latency Percentiles and Throughput

```typescript
// middleware/metrics.ts
import { Histogram, Counter, Registry } from 'prom-client'

const registry = new Registry()

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
})

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
})

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = performance.now()

  res.on('finish', () => {
    const duration = (performance.now() - start) / 1000
    const route = req.route?.path ?? req.path
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    }

    httpRequestDuration.observe(labels, duration)
    httpRequestsTotal.inc(labels)
  })

  next()
}

// Expose metrics endpoint for Prometheus
app.get('/metrics', async (_req, res) => {
  res.setHeader('Content-Type', registry.contentType)
  res.send(await registry.metrics())
})
```

### SLO Monitoring

```typescript
// lib/slo.ts
interface SLODefinition {
  readonly name: string
  readonly target: number        // e.g., 0.999 for 99.9%
  readonly window: 'rolling_7d' | 'rolling_30d' | 'calendar_month'
  readonly indicator: 'availability' | 'latency'
  readonly latencyThresholdMs?: number
}

const sloDefinitions: readonly SLODefinition[] = [
  {
    name: 'API Availability',
    target: 0.999,
    window: 'rolling_30d',
    indicator: 'availability',
  },
  {
    name: 'API Latency p99',
    target: 0.99,
    window: 'rolling_7d',
    indicator: 'latency',
    latencyThresholdMs: 500,
  },
]

// Error budget calculation
function calculateErrorBudget(slo: SLODefinition, currentSLI: number): {
  readonly budgetTotal: number
  readonly budgetRemaining: number
  readonly budgetConsumedPercent: number
} {
  const budgetTotal = 1 - slo.target
  const budgetUsed = Math.max(0, 1 - currentSLI)
  const budgetRemaining = Math.max(0, budgetTotal - budgetUsed)

  return {
    budgetTotal,
    budgetRemaining,
    budgetConsumedPercent: budgetTotal > 0 ? ((budgetTotal - budgetRemaining) / budgetTotal) * 100 : 100,
  }
}
```

---

## Quick Reference Checklist

Before deploying API changes:

- [ ] Cache-Control headers set on all GET endpoints
- [ ] ETag support for frequently polled resources
- [ ] Rate limiting on all public endpoints
- [ ] Pagination uses cursor-based approach for user-facing lists
- [ ] Response compression enabled (gzip or Brotli)
- [ ] Background jobs for operations > 500ms
- [ ] Health check endpoint with dependency checks
- [ ] p50/p95/p99 latency tracked per endpoint
- [ ] Error rate alerting configured (threshold: 1% for 5xx)
- [ ] Connection pooling for HTTP clients and databases
- [ ] Graceful shutdown handles in-flight requests
- [ ] Bulk endpoint available for batch operations
- [ ] Timeouts set on all external service calls
- [ ] Request/response logging with correlation IDs
- [ ] SLOs defined and error budgets tracked
