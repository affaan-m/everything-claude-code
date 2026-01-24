---
name: backend-patterns
description: 后端架构模式、API 设计、数据库优化以及 Node.js、Express 和 Next.js API 路由的服务端最佳实践。
---

# 后端开发模式

用于可扩展服务端应用的后端架构模式和最佳实践。

## API 设计模式

### RESTful API 结构

```typescript
// ✅ 基于资源的 URL
GET    /api/markets                 # 列出资源
GET    /api/markets/:id             # 获取单个资源
POST   /api/markets                 # 创建资源
PUT    /api/markets/:id             # 替换资源
PATCH  /api/markets/:id             # 更新资源
DELETE /api/markets/:id             # 删除资源

// ✅ 用于筛选、排序、分页的查询参数
GET /api/markets?status=active&sort=volume&limit=20&offset=0
```

### 仓库模式

```typescript
// 抽象数据访问逻辑
interface MarketRepository {
  findAll(filters?: MarketFilters): Promise<Market[]>
  findById(id: string): Promise<Market | null>
  create(data: CreateMarketDto): Promise<Market>
  update(id: string, data: UpdateMarketDto): Promise<Market>
  delete(id: string): Promise<void>
}

class SupabaseMarketRepository implements MarketRepository {
  async findAll(filters?: MarketFilters): Promise<Market[]> {
    let query = supabase.from('markets').select('*')

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return data
  }

  // 其他方法...
}
```

### 服务层模式

```typescript
// 业务逻辑与数据访问分离
class MarketService {
  constructor(private marketRepo: MarketRepository) {}

  async searchMarkets(query: string, limit: number = 10): Promise<Market[]> {
    // 业务逻辑
    const embedding = await generateEmbedding(query)
    const results = await this.vectorSearch(embedding, limit)

    // 获取完整数据
    const markets = await this.marketRepo.findByIds(results.map(r => r.id))

    // 按相似度排序
    return markets.sort((a, b) => {
      const scoreA = results.find(r => r.id === a.id)?.score || 0
      const scoreB = results.find(r => r.id === b.id)?.score || 0
      return scoreA - scoreB
    })
  }

  private async vectorSearch(embedding: number[], limit: number) {
    // 向量搜索实现
  }
}
```

### 中间件模式

```typescript
// 请求/响应处理管道
export function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: '未授权' })
    }

    try {
      const user = await verifyToken(token)
      req.user = user
      return handler(req, res)
    } catch (error) {
      return res.status(401).json({ error: '无效令牌' })
    }
  }
}

// 使用
export default withAuth(async (req, res) => {
  // 处理器可以访问 req.user
})
```

## 数据库模式

### 查询优化

```typescript
// ✅ 好：仅选择需要的列
const { data } = await supabase
  .from('markets')
  .select('id, name, status, volume')
  .eq('status', 'active')
  .order('volume', { ascending: false })
  .limit(10)

// ❌ 差：选择所有列
const { data } = await supabase
  .from('markets')
  .select('*')
```

### N+1 查询预防

```typescript
// ❌ 差：N+1 查询问题
const markets = await getMarkets()
for (const market of markets) {
  market.creator = await getUser(market.creator_id)  // N 次查询
}

// ✅ 好：批量获取
const markets = await getMarkets()
const creatorIds = markets.map(m => m.creator_id)
const creators = await getUsers(creatorIds)  // 1 次查询
const creatorMap = new Map(creators.map(c => [c.id, c]))

markets.forEach(market => {
  market.creator = creatorMap.get(market.creator_id)
})
```

### 事务模式

```typescript
async function createMarketWithPosition(
  marketData: CreateMarketDto,
  positionData: CreatePositionDto
) {
  // 使用 Supabase 事务
  const { data, error } = await supabase.rpc('create_market_with_position', {
    market_data: marketData,
    position_data: positionData
  })

  if (error) throw new Error('事务失败')
  return data
}

// Supabase 中的 SQL 函数
CREATE OR REPLACE FUNCTION create_market_with_position(
  market_data jsonb,
  position_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  -- 自动开始事务
  INSERT INTO markets VALUES (market_data);
  INSERT INTO positions VALUES (position_data);
  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    -- 自动回滚
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
```

## 缓存策略

### Redis 缓存层

```typescript
class CachedMarketRepository implements MarketRepository {
  constructor(
    private baseRepo: MarketRepository,
    private redis: RedisClient
  ) {}

  async findById(id: string): Promise<Market | null> {
    // 先检查缓存
    const cached = await this.redis.get(`market:${id}`)

    if (cached) {
      return JSON.parse(cached)
    }

    // 缓存未命中 - 从数据库获取
    const market = await this.baseRepo.findById(id)

    if (market) {
      // 缓存 5 分钟
      await this.redis.setex(`market:${id}`, 300, JSON.stringify(market))
    }

    return market
  }

  async invalidateCache(id: string): Promise<void> {
    await this.redis.del(`market:${id}`)
  }
}
```

### Cache-Aside 模式

```typescript
async function getMarketWithCache(id: string): Promise<Market> {
  const cacheKey = `market:${id}`

  // 尝试缓存
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  // 缓存未命中 - 从数据库获取
  const market = await db.markets.findUnique({ where: { id } })

  if (!market) throw new Error('市场未找到')

  // 更新缓存
  await redis.setex(cacheKey, 300, JSON.stringify(market))

  return market
}
```

## 错误处理模式

### 集中式错误处理器

```typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export function errorHandler(error: unknown, req: Request): Response {
  if (error instanceof ApiError) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: error.statusCode })
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json({
      success: false,
      error: '验证失败',
      details: error.errors
    }, { status: 400 })
  }

  // 记录意外错误
  console.error('意外错误:', error)

  return NextResponse.json({
    success: false,
    error: '内部服务器错误'
  }, { status: 500 })
}

// 使用
export async function GET(request: Request) {
  try {
    const data = await fetchData()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return errorHandler(error, request)
  }
}
```

### 指数退避重试

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (i < maxRetries - 1) {
        // 指数退避：1s、2s、4s
        const delay = Math.pow(2, i) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}

// 使用
const data = await fetchWithRetry(() => fetchFromAPI())
```

## 认证与授权

### JWT 令牌验证

```typescript
import jwt from 'jsonwebtoken'

interface JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'user'
}

export function verifyToken(token: string): JWTPayload {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    return payload
  } catch (error) {
    throw new ApiError(401, '无效令牌')
  }
}

export async function requireAuth(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new ApiError(401, '缺少授权令牌')
  }

  return verifyToken(token)
}

// 在 API 路由中使用
export async function GET(request: Request) {
  const user = await requireAuth(request)

  const data = await getDataForUser(user.userId)

  return NextResponse.json({ success: true, data })
}
```

### 基于角色的访问控制

```typescript
type Permission = 'read' | 'write' | 'delete' | 'admin'

interface User {
  id: string
  role: 'admin' | 'moderator' | 'user'
}

const rolePermissions: Record<User['role'], Permission[]> = {
  admin: ['read', 'write', 'delete', 'admin'],
  moderator: ['read', 'write', 'delete'],
  user: ['read', 'write']
}

export function hasPermission(user: User, permission: Permission): boolean {
  return rolePermissions[user.role].includes(permission)
}

export function requirePermission(permission: Permission) {
  return async (request: Request) => {
    const user = await requireAuth(request)

    if (!hasPermission(user, permission)) {
      throw new ApiError(403, '权限不足')
    }

    return user
  }
}

// 使用
export const DELETE = requirePermission('delete')(async (request: Request) => {
  // 带权限检查的处理器
})
```

## 速率限制

### 简单的内存速率限制器

```typescript
class RateLimiter {
  private requests = new Map<string, number[]>()

  async checkLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<boolean> {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []

    // 移除窗口外的旧请求
    const recentRequests = requests.filter(time => now - time < windowMs)

    if (recentRequests.length >= maxRequests) {
      return false  // 超出速率限制
    }

    // 添加当前请求
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)

    return true
  }
}

const limiter = new RateLimiter()

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  const allowed = await limiter.checkLimit(ip, 100, 60000)  // 100 请求/分钟

  if (!allowed) {
    return NextResponse.json({
      error: '超出速率限制'
    }, { status: 429 })
  }

  // 继续处理请求
}
```

## 后台作业和队列

### 简单队列模式

```typescript
class JobQueue<T> {
  private queue: T[] = []
  private processing = false

  async add(job: T): Promise<void> {
    this.queue.push(job)

    if (!this.processing) {
      this.process()
    }
  }

  private async process(): Promise<void> {
    this.processing = true

    while (this.queue.length > 0) {
      const job = this.queue.shift()!

      try {
        await this.execute(job)
      } catch (error) {
        console.error('作业失败:', error)
      }
    }

    this.processing = false
  }

  private async execute(job: T): Promise<void> {
    // 作业执行逻辑
  }
}

// 用于索引市场的使用示例
interface IndexJob {
  marketId: string
}

const indexQueue = new JobQueue<IndexJob>()

export async function POST(request: Request) {
  const { marketId } = await request.json()

  // 添加到队列而不是阻塞
  await indexQueue.add({ marketId })

  return NextResponse.json({ success: true, message: '作业已加入队列' })
}
```

## 日志和监控

### 结构化日志

```typescript
interface LogContext {
  userId?: string
  requestId?: string
  method?: string
  path?: string
  [key: string]: unknown
}

class Logger {
  log(level: 'info' | 'warn' | 'error', message: string, context?: LogContext) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context
    }

    console.log(JSON.stringify(entry))
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error: Error, context?: LogContext) {
    this.log('error', message, {
      ...context,
      error: error.message,
      stack: error.stack
    })
  }
}

const logger = new Logger()

// 使用
export async function GET(request: Request) {
  const requestId = crypto.randomUUID()

  logger.info('获取市场', {
    requestId,
    method: 'GET',
    path: '/api/markets'
  })

  try {
    const markets = await fetchMarkets()
    return NextResponse.json({ success: true, data: markets })
  } catch (error) {
    logger.error('获取市场失败', error as Error, { requestId })
    return NextResponse.json({ error: '内部错误' }, { status: 500 })
  }
}
```

**记住**：后端模式支持可扩展、可维护的服务端应用。选择适合你复杂度级别的模式。
