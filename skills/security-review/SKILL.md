---
name: security-review
description: 在添加认证、处理用户输入、使用密钥、创建 API 端点或实现支付/敏感功能时使用此技能。提供全面的安全检查清单和模式。
---

# 安全审查技能

此技能确保所有代码遵循安全最佳实践并识别潜在漏洞。

## 激活场景

- 实现认证或授权
- 处理用户输入或文件上传
- 创建新的 API 端点
- 使用密钥或凭据
- 实现支付功能
- 存储或传输敏感数据
- 集成第三方 API

## 安全检查清单

### 1. 密钥管理

#### 绝不要这样做
```typescript
const apiKey = "sk-proj-xxxxx"  // 硬编码密钥
const dbPassword = "password123" // 在源代码中
```

#### 始终这样做
```typescript
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

// 验证密钥存在
if (!apiKey) {
  throw new Error('OPENAI_API_KEY 未配置')
}
```

#### 验证步骤
- [ ] 无硬编码的 API 密钥、令牌或密码
- [ ] 所有密钥在环境变量中
- [ ] `.env.local` 在 .gitignore 中
- [ ] git 历史中无密钥
- [ ] 生产密钥在托管平台（Vercel、Railway）

### 2. 输入验证

#### 始终验证用户输入
```typescript
import { z } from 'zod'

// 定义验证模式
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

// 处理前验证
export async function createUser(input: unknown) {
  try {
    const validated = CreateUserSchema.parse(input)
    return await db.users.create(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors }
    }
    throw error
  }
}
```

#### 文件上传验证
```typescript
function validateFileUpload(file: File) {
  // 大小检查（最大 5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('文件太大（最大 5MB）')
  }

  // 类型检查
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('无效的文件类型')
  }

  // 扩展名检查
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error('无效的文件扩展名')
  }

  return true
}
```

#### 验证步骤
- [ ] 所有用户输入用模式验证
- [ ] 文件上传受限（大小、类型、扩展名）
- [ ] 用户输入不直接用于查询
- [ ] 白名单验证（而非黑名单）
- [ ] 错误消息不泄露敏感信息

### 3. SQL 注入防护

#### 绝不拼接 SQL
```typescript
// 危险 - SQL 注入漏洞
const query = `SELECT * FROM users WHERE email = '${userEmail}'`
await db.query(query)
```

#### 始终使用参数化查询
```typescript
// 安全 - 参数化查询
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)

// 或使用原始 SQL
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
)
```

#### 验证步骤
- [ ] 所有数据库查询使用参数化查询
- [ ] SQL 中无字符串拼接
- [ ] ORM/查询构建器正确使用
- [ ] Supabase 查询正确净化

### 4. 认证与授权

#### JWT 令牌处理
```typescript
// 错误：localStorage（易受 XSS 攻击）
localStorage.setItem('token', token)

// 正确：httpOnly cookies
res.setHeader('Set-Cookie',
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
```

#### 授权检查
```typescript
export async function deleteUser(userId: string, requesterId: string) {
  // 始终先验证授权
  const requester = await db.users.findUnique({
    where: { id: requesterId }
  })

  if (requester.role !== 'admin') {
    return NextResponse.json(
      { error: '未授权' },
      { status: 403 }
    )
  }

  // 继续删除
  await db.users.delete({ where: { id: userId } })
}
```

#### 行级安全（Supabase）
```sql
-- 在所有表上启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的数据
CREATE POLICY "Users view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 用户只能更新自己的数据
CREATE POLICY "Users update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

#### 验证步骤
- [ ] 令牌存储在 httpOnly cookies（非 localStorage）
- [ ] 敏感操作前有授权检查
- [ ] Supabase 启用了行级安全
- [ ] 实现了基于角色的访问控制
- [ ] 会话管理安全

### 5. XSS 防护

#### 净化 HTML
```typescript
import DOMPurify from 'isomorphic-dompurify'

// 始终净化用户提供的 HTML
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

#### 内容安全策略
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://api.example.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

#### 验证步骤
- [ ] 用户提供的 HTML 已净化
- [ ] CSP 头已配置
- [ ] 无未验证的动态内容渲染
- [ ] 使用 React 内置的 XSS 保护

### 6. CSRF 防护

#### CSRF 令牌
```typescript
import { csrf } from '@/lib/csrf'

export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token')

  if (!csrf.verify(token)) {
    return NextResponse.json(
      { error: '无效的 CSRF 令牌' },
      { status: 403 }
    )
  }

  // 处理请求
}
```

#### SameSite Cookies
```typescript
res.setHeader('Set-Cookie',
  `session=${sessionId}; HttpOnly; Secure; SameSite=Strict`)
```

#### 验证步骤
- [ ] 状态更改操作有 CSRF 令牌
- [ ] 所有 cookies 设置 SameSite=Strict
- [ ] 实现双提交 cookie 模式

### 7. 速率限制

#### API 速率限制
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每窗口 100 个请求
  message: '请求过多'
})

// 应用到路由
app.use('/api/', limiter)
```

#### 昂贵操作
```typescript
// 搜索的严格速率限制
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 10, // 每分钟 10 个请求
  message: '搜索请求过多'
})

app.use('/api/search', searchLimiter)
```

#### 验证步骤
- [ ] 所有 API 端点有速率限制
- [ ] 昂贵操作有更严格的限制
- [ ] 基于 IP 的速率限制
- [ ] 基于用户的速率限制（已认证）

### 8. 敏感数据暴露

#### 日志
```typescript
// 错误：记录敏感数据
console.log('用户登录:', { email, password })
console.log('支付:', { cardNumber, cvv })

// 正确：脱敏敏感数据
console.log('用户登录:', { email, userId })
console.log('支付:', { last4: card.last4, userId })
```

#### 错误消息
```typescript
// 错误：暴露内部细节
catch (error) {
  return NextResponse.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  )
}

// 正确：通用错误消息
catch (error) {
  console.error('内部错误:', error)
  return NextResponse.json(
    { error: '发生错误。请重试。' },
    { status: 500 }
  )
}
```

#### 验证步骤
- [ ] 日志中无密码、令牌或密钥
- [ ] 用户错误消息通用
- [ ] 详细错误仅在服务器日志中
- [ ] 堆栈跟踪不暴露给用户

### 9. 区块链安全（Solana）

#### 钱包验证
```typescript
import { verify } from '@solana/web3.js'

async function verifyWalletOwnership(
  publicKey: string,
  signature: string,
  message: string
) {
  try {
    const isValid = verify(
      Buffer.from(message),
      Buffer.from(signature, 'base64'),
      Buffer.from(publicKey, 'base64')
    )
    return isValid
  } catch (error) {
    return false
  }
}
```

#### 交易验证
```typescript
async function verifyTransaction(transaction: Transaction) {
  // 验证接收者
  if (transaction.to !== expectedRecipient) {
    throw new Error('无效的接收者')
  }

  // 验证金额
  if (transaction.amount > maxAmount) {
    throw new Error('金额超出限制')
  }

  // 验证用户余额充足
  const balance = await getBalance(transaction.from)
  if (balance < transaction.amount) {
    throw new Error('余额不足')
  }

  return true
}
```

#### 验证步骤
- [ ] 钱包签名已验证
- [ ] 交易详情已验证
- [ ] 交易前有余额检查
- [ ] 无盲签交易

### 10. 依赖安全

#### 定期更新
```bash
# 检查漏洞
npm audit

# 自动修复可修复的问题
npm audit fix

# 更新依赖
npm update

# 检查过时的包
npm outdated
```

#### 锁定文件
```bash
# 始终提交锁定文件
git add package-lock.json

# 在 CI/CD 中使用以获得可重现的构建
npm ci  # 而不是 npm install
```

#### 验证步骤
- [ ] 依赖是最新的
- [ ] 无已知漏洞（npm audit 清洁）
- [ ] 锁定文件已提交
- [ ] GitHub 启用 Dependabot
- [ ] 定期安全更新

## 安全测试

### 自动化安全测试
```typescript
// 测试认证
test('需要认证', async () => {
  const response = await fetch('/api/protected')
  expect(response.status).toBe(401)
})

// 测试授权
test('需要管理员角色', async () => {
  const response = await fetch('/api/admin', {
    headers: { Authorization: `Bearer ${userToken}` }
  })
  expect(response.status).toBe(403)
})

// 测试输入验证
test('拒绝无效输入', async () => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email' })
  })
  expect(response.status).toBe(400)
})

// 测试速率限制
test('强制速率限制', async () => {
  const requests = Array(101).fill(null).map(() =>
    fetch('/api/endpoint')
  )

  const responses = await Promise.all(requests)
  const tooManyRequests = responses.filter(r => r.status === 429)

  expect(tooManyRequests.length).toBeGreaterThan(0)
})
```

## 部署前安全检查清单

任何生产部署前：

- [ ] **密钥**：无硬编码密钥，全部在环境变量中
- [ ] **输入验证**：所有用户输入已验证
- [ ] **SQL 注入**：所有查询参数化
- [ ] **XSS**：用户内容已净化
- [ ] **CSRF**：保护已启用
- [ ] **认证**：正确的令牌处理
- [ ] **授权**：角色检查到位
- [ ] **速率限制**：所有端点已启用
- [ ] **HTTPS**：生产环境强制
- [ ] **安全头**：CSP、X-Frame-Options 已配置
- [ ] **错误处理**：错误中无敏感数据
- [ ] **日志**：无敏感数据记录
- [ ] **依赖**：最新，无漏洞
- [ ] **行级安全**：Supabase 已启用
- [ ] **CORS**：正确配置
- [ ] **文件上传**：已验证（大小、类型）
- [ ] **钱包签名**：已验证（如有区块链）

## 资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js 安全](https://nextjs.org/docs/security)
- [Supabase 安全](https://supabase.com/docs/guides/auth)
- [Web 安全学院](https://portswigger.net/web-security)

---

**记住**：安全不是可选的。一个漏洞可能危及整个平台。如有疑问，宁可谨慎。
