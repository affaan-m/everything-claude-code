---
name: api-performance
description: API performance patterns including caching, pagination, rate limiting, compression, async processing, and horizontal scaling strategies.
origin: ECC
---

# API Performance Patterns

Optimization strategies for fast, scalable API services.

## When to Activate

- Diagnosing API latency issues
- Implementing caching strategies
- Adding rate limiting and pagination
- Scaling services for high traffic
- Setting up performance monitoring

## Caching Strategies

### HTTP Cache Headers

```typescript
import { Request, Response, NextFunction } from 'express'

function cacheControl(maxAge: number) {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}`)
    next()
  }
}

// Immutable assets
app.use('/static', cacheControl(31536000))

// API responses
app.get('/api/products', cacheControl(60), getProducts)
```

### ETag Support

```typescript
import { createHash } from 'crypto'

function withETag(data: unknown, res: Response, req: Request) {
  const body = JSON.stringify(data)
  const etag = createHash('md5').update(body).digest('hex')

  res.set('ETag', `"${etag}"`)

  if (req.headers['if-none-match'] === `"${etag}"`) {
    res.status(304).end()
    return
  }

  res.json(data)
}
```

### Redis Cache with Stampede Prevention

```typescript
async function cachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600,
): Promise<T> {
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)

  // Lock to prevent stampede
  const lockKey = `lock:${key}`
  const acquired = await redis.set(lockKey, '1', 'NX', 'EX', 30)

  if (!acquired) {
    // Another process is fetching — wait and retry
    await new Promise((resolve) => setTimeout(resolve, 100))
    return cachedQuery(key, fetcher, ttl)
  }

  try {
    const data = await fetcher()
    await redis.set(key, JSON.stringify(data), 'EX', ttl)
    return data
  } finally {
    await redis.del(lockKey)
  }
}
```

## Pagination

### Cursor-Based REST

```typescript
interface PaginatedResponse<T> {
  data: T[]
  cursor: string | null
  hasMore: boolean
}

app.get('/api/orders', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
  const cursor = req.query.cursor as string | undefined

  const result = await getOrders({ cursor, limit })

  res.json({
    data: result.items,
    cursor: result.nextCursor,
    hasMore: result.hasMore,
  })
})
```

## Compression

```typescript
import compression from 'compression'

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false
    return compression.filter(req, res)
  },
  threshold: 1024,  // Only compress responses > 1KB
  level: 6,
}))
```

## Async Processing

### Message Queue with BullMQ

```typescript
import { Queue, Worker } from 'bullmq'

const emailQueue = new Queue('emails', { connection: redis })

// Producer: enqueue work
app.post('/api/orders', async (req, res) => {
  const order = await createOrder(req.body)

  await emailQueue.add('confirmation', {
    orderId: order.id,
    email: order.customerEmail,
  }, {
    priority: 1,
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  })

  res.status(201).json(order)
})

// Consumer: process work
const worker = new Worker('emails', async (job) => {
  await sendConfirmationEmail(job.data.orderId, job.data.email)
}, { connection: redis, concurrency: 5 })
```

## Rate Limiting

### Token Bucket with Redis

```typescript
async function checkRateLimit(
  clientId: string,
  limit: number,
  windowSec: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `ratelimit:${clientId}`
  const now = Date.now()

  const result = await redis.eval(`
    local key = KEYS[1]
    local limit = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])

    redis.call('ZREMRANGEBYSCORE', key, 0, now - window * 1000)
    local count = redis.call('ZCARD', key)

    if count < limit then
      redis.call('ZADD', key, now, now .. math.random())
      redis.call('EXPIRE', key, window)
      return {1, limit - count - 1}
    end
    return {0, 0}
  `, 1, key, limit, windowSec, now) as [number, number]

  return { allowed: result[0] === 1, remaining: result[1] }
}
```

## Connection Management

### Graceful Shutdown

```typescript
const server = app.listen(3000)
let isShuttingDown = false

process.on('SIGTERM', async () => {
  isShuttingDown = true

  // Stop accepting new connections
  server.close()

  // Wait for in-flight requests (max 30s)
  await new Promise((resolve) => setTimeout(resolve, 30_000))

  // Close database pools
  await db.end()
  await redis.quit()

  process.exit(0)
})

// Health check respects shutdown state
app.get('/healthz', (req, res) => {
  if (isShuttingDown) {
    res.status(503).json({ status: 'shutting_down' })
  } else {
    res.json({ status: 'ok' })
  }
})
```

## Batch APIs

```typescript
interface BulkCreateRequest {
  items: CreateItemDto[]
}

interface BulkCreateResponse {
  results: Array<{ id: string; status: 'created' | 'error'; error?: string }>
}

app.post('/api/items/bulk', async (req, res) => {
  const { items } = req.body as BulkCreateRequest
  if (items.length > 100) {
    return res.status(400).json({ error: 'Max 100 items per batch' })
  }

  const results = await Promise.allSettled(
    items.map((item) => createItem(item)),
  )

  const response: BulkCreateResponse = {
    results: results.map((r, i) => {
      if (r.status === 'fulfilled') {
        return { id: r.value.id, status: 'created' as const }
      }
      return { id: items[i].externalId ?? '', status: 'error' as const, error: r.reason.message }
    }),
  }

  const hasErrors = response.results.some((r) => r.status === 'error')
  res.status(hasErrors ? 207 : 201).json(response)
})
```

## Monitoring

### Prometheus Metrics

```typescript
import { Counter, Histogram, register } from 'prom-client'

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
})

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
})

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer()
  res.on('finish', () => {
    const labels = { method: req.method, route: req.route?.path ?? req.path, status: res.statusCode }
    end(labels)
    httpRequestTotal.inc(labels)
  })
  next()
})

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})
```

**Remember**: Profile before optimizing. Measure p50, p95, and p99 latencies. The bottleneck is rarely where you think it is.
