---
name: redis-patterns
description: Redis patterns for caching, session management, rate limiting, distributed locks, pub/sub, and streams with TypeScript and Python examples.
---

# Redis Development Patterns

Production-grade Redis patterns for caching, rate limiting, locking, and real-time messaging.

## When to Activate

- Implementing caching strategies (cache-aside, write-through, invalidation)
- Building session management with Redis
- Designing rate limiters (fixed window, sliding window, token bucket)
- Implementing distributed locks (SETNX, Redlock)
- Setting up Pub/Sub or Redis Streams for real-time messaging
- Choosing Redis data structures for specific use cases
- Optimizing Redis memory usage and performance

## Core Principles

1. **Right data structure** — choose the structure that matches your access pattern
2. **Always set TTL** — unbounded keys lead to memory exhaustion
3. **Atomic operations** — use Lua scripts or MULTI/EXEC for multi-step logic
4. **Cache invalidation strategy** — decide TTL vs event-driven invalidation upfront
5. **Connection pooling** — reuse connections, never create per-request

## Data Structures Quick Reference

| Structure | Use Case | Example |
|-----------|----------|---------|
| String | Cache, counters, flags | `SET user:123 '{"name":"Alice"}'` |
| Hash | Object fields, partial updates | `HSET user:123 name Alice email a@b.com` |
| List | Queues, recent items | `LPUSH queue:jobs '{"type":"email"}'` |
| Set | Tags, unique items, membership | `SADD post:1:tags redis caching` |
| Sorted Set | Leaderboards, time-series | `ZADD leaderboard 100 user:1` |
| HyperLogLog | Cardinality estimation | `PFADD visitors:2025-01 user:1 user:2` |
| Stream | Event log, consumer groups | `XADD events * type order.created` |

## Caching Patterns

### Cache-Aside (Lazy Loading)

```typescript
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

async function getUser(userId: string): Promise<User> {
  const cacheKey = `user:${userId}`;

  // 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Cache miss — fetch from database
  const user = await db.users.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User", userId);

  // 3. Populate cache with TTL
  await redis.set(cacheKey, JSON.stringify(user), "EX", 3600); // 1 hour

  return user;
}

// Invalidate on mutation
async function updateUser(userId: string, data: Partial<User>) {
  const user = await db.users.update({ where: { id: userId }, data });
  await redis.del(`user:${userId}`);
  return user;
}
```

### Cache Stampede Prevention

```typescript
async function getWithMutex<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600,
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const lockKey = `lock:${key}`;
  const acquired = await redis.set(lockKey, "1", "NX", "EX", 30);

  if (acquired) {
    try {
      const data = await fetcher();
      await redis.set(key, JSON.stringify(data), "EX", ttl);
      return data;
    } finally {
      await redis.del(lockKey);
    }
  }

  // Another process is refreshing — wait and retry
  await new Promise((r) => setTimeout(r, 100));
  const retried = await redis.get(key);
  if (retried) return JSON.parse(retried);
  throw new Error(`Cache miss after lock contention for key: ${key}`);
}
```

### Python Cache-Aside

```python
import os
import json
import redis

r = redis.Redis.from_url(os.environ["REDIS_URL"], decode_responses=True)

def get_user(user_id: str) -> dict:
    cache_key = f"user:{user_id}"
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)

    user = db.users.find_one({"_id": user_id})
    if user:
        r.setex(cache_key, 3600, json.dumps(user, default=str))
    return user
```

## Session Management

```typescript
import { randomBytes, createHash } from "node:crypto";

class RedisSessionStore {
  constructor(private redis: Redis, private ttl: number = 86400) {}

  async create(userId: string, metadata: Record<string, string> = {}): Promise<string> {
    const sessionId = randomBytes(32).toString("hex");
    const hashedId = createHash("sha256").update(sessionId).digest("hex");

    await this.redis.hset(`session:${hashedId}`, {
      userId,
      createdAt: Date.now().toString(),
      lastActivity: Date.now().toString(),
      ...metadata,
    });
    await this.redis.expire(`session:${hashedId}`, this.ttl);

    return sessionId;
  }

  async get(sessionId: string): Promise<SessionData | null> {
    const hashedId = createHash("sha256").update(sessionId).digest("hex");
    const data = await this.redis.hgetall(`session:${hashedId}`);
    if (!data.userId) return null;

    // Sliding window — extend TTL on access
    await this.redis.expire(`session:${hashedId}`, this.ttl);
    await this.redis.hset(`session:${hashedId}`, "lastActivity", Date.now().toString());

    return data as SessionData;
  }

  async destroy(sessionId: string): Promise<void> {
    const hashedId = createHash("sha256").update(sessionId).digest("hex");
    await this.redis.del(`session:${hashedId}`);
  }
}
```

## Rate Limiting

### Sliding Window (Lua Script)

```typescript
const SLIDING_WINDOW_SCRIPT = `
  local key = KEYS[1]
  local window = tonumber(ARGV[1])
  local limit = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])

  redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
  local count = redis.call('ZCARD', key)

  if count < limit then
    redis.call('ZADD', key, now, now .. '-' .. math.random(1000000))
    redis.call('EXPIRE', key, math.ceil(window / 1000))
    return 1
  end
  return 0
`;

class SlidingWindowRateLimiter {
  constructor(
    private redis: Redis,
    private window: number,
    private limit: number,
  ) {}

  async isAllowed(identifier: string): Promise<boolean> {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const result = await this.redis.eval(
      SLIDING_WINDOW_SCRIPT, 1, key, this.window, this.limit, now,
    );
    return result === 1;
  }
}

// Usage: 100 requests per minute
const limiter = new SlidingWindowRateLimiter(redis, 60000, 100);

async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const key = req.user?.id ?? req.ip;
  if (await limiter.isAllowed(key)) return next();
  res.status(429).json({ error: "Rate limit exceeded" });
}
```

### Token Bucket (Python)

```python
TOKEN_BUCKET_SCRIPT = """
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'last_refill')
local tokens = tonumber(data[1]) or capacity
local last_refill = tonumber(data[2]) or now

local elapsed = now - last_refill
local refill = elapsed * rate / 1000
tokens = math.min(capacity, tokens + refill)

if tokens >= requested then
    tokens = tokens - requested
    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
    redis.call('EXPIRE', key, math.ceil(capacity / rate) + 1)
    return 1
end
return 0
"""

def check_rate_limit(r: redis.Redis, identifier: str, capacity: int = 100, rate: float = 10) -> bool:
    """Token bucket: capacity=100 tokens, refill rate=10 tokens/sec."""
    import time
    result = r.eval(TOKEN_BUCKET_SCRIPT, 1, f"bucket:{identifier}", capacity, rate, int(time.time() * 1000), 1)
    return result == 1
```

## Distributed Locks

### Simple Lock (SETNX)

```typescript
class RedisLock {
  constructor(private redis: Redis) {}

  async acquire(resource: string, ttl: number = 10000): Promise<string | null> {
    const token = randomBytes(16).toString("hex");
    const acquired = await this.redis.set(
      `lock:${resource}`, token, "NX", "PX", ttl,
    );
    return acquired ? token : null;
  }

  // Release with Lua to ensure atomicity
  async release(resource: string, token: string): Promise<boolean> {
    const script = `
      if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
      end
      return 0
    `;
    const result = await this.redis.eval(script, 1, `lock:${resource}`, token);
    return result === 1;
  }
}

// Usage
const lock = new RedisLock(redis);
const token = await lock.acquire("order:123:process");

if (token) {
  try {
    await processOrder("123");
  } finally {
    await lock.release("order:123:process", token);
  }
}
```

## Pub/Sub & Streams

### Pub/Sub

```typescript
// Publisher
const pub = new Redis(process.env.REDIS_URL);
await pub.publish("notifications", JSON.stringify({
  userId: "123", type: "order_shipped", orderId: "456",
}));

// Subscriber
const sub = new Redis(process.env.REDIS_URL);
sub.subscribe("notifications");
sub.on("message", (channel, message) => {
  const event = JSON.parse(message);
  handleNotification(event);
});
```

### Redis Streams (Consumer Groups)

```typescript
// Producer
await redis.xadd("orders", "*",
  "type", "created", "orderId", "123", "total", "99.99");

// Create consumer group
await redis.xgroup("CREATE", "orders", "order-processors", "0", "MKSTREAM").catch(() => {});

// Consumer
async function consumeStream(group: string, consumer: string) {
  while (true) {
    const results = await redis.xreadgroup(
      "GROUP", group, consumer,
      "COUNT", 10, "BLOCK", 5000,
      "STREAMS", "orders", ">",
    );

    if (!results) continue;

    for (const [, messages] of results) {
      for (const [id, fields] of messages) {
        try {
          await processEvent(parseFields(fields));
          await redis.xack("orders", group, id);
        } catch (err) {
          console.error(`Failed to process ${id}:`, err);
        }
      }
    }
  }
}
```

## Operational Patterns

### Memory Management

```
# Set eviction policy
CONFIG SET maxmemory 2gb
CONFIG SET maxmemory-policy allkeys-lru

# Common policies:
# noeviction     — return errors when limit reached (default)
# allkeys-lru    — evict least recently used (recommended for caches)
# volatile-lru   — evict LRU keys with TTL set
# allkeys-random — evict random keys
```

### Monitoring

```bash
# Slow query log
redis-cli SLOWLOG GET 10

# Memory usage per key
redis-cli MEMORY USAGE "user:123"

# Key count by pattern
redis-cli --scan --pattern "session:*" | wc -l

# Info stats
redis-cli INFO stats
```

## Redis Checklist

Before deploying to production:

- [ ] Every key has a TTL or is part of a bounded data structure
- [ ] Connection pooling configured (not creating connections per request)
- [ ] Lua scripts used for multi-step atomic operations
- [ ] Cache stampede prevention implemented (mutex or stale-while-revalidate)
- [ ] Rate limiter uses sliding window or token bucket (not naive counters)
- [ ] Distributed locks include fencing tokens and safe release (Lua)
- [ ] maxmemory and eviction policy configured for workload
- [ ] SLOWLOG monitored for latency spikes
- [ ] Pub/Sub subscribers handle reconnection on disconnect
- [ ] Streams use consumer groups with acknowledgment for reliability
- [ ] Sensitive data (sessions, tokens) uses hashed keys
- [ ] Key naming convention consistent (`entity:id:field`)
