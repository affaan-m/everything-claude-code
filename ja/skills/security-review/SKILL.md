---
name: security-review
description: 認証の追加、ユーザー入力の処理、秘密情報の取り扱い、APIエンドポイントの作成、決済・機密機能の実装時に使用するスキル。包括的なセキュリティチェックリストとパターンを提供。
---

# セキュリティレビュースキル

このスキルは、すべてのコードがセキュリティのベストプラクティスに従い、潜在的な脆弱性を特定することを保証します。

## 使用するタイミング

- 認証または認可の実装時
- ユーザー入力やファイルアップロードの処理時
- 新しいAPIエンドポイントの作成時
- 秘密情報や認証情報の取り扱い時
- 決済機能の実装時
- 機密データの保存または送信時
- サードパーティAPIの統合時

## セキュリティチェックリスト

### 1. 秘密情報の管理

#### ❌ 絶対にやってはいけないこと
```typescript
const apiKey = "sk-proj-xxxxx"  // ハードコードされた秘密情報
const dbPassword = "password123" // ソースコード内のパスワード
```

#### ✅ 常にこうすべきこと
```typescript
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

// 秘密情報の存在を確認
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

#### 確認ステップ
- [ ] ハードコードされたAPIキー、トークン、パスワードがないこと
- [ ] すべての秘密情報が環境変数にあること
- [ ] `.env.local` が .gitignore に含まれていること
- [ ] Gitの履歴に秘密情報がないこと
- [ ] 本番環境の秘密情報がホスティングプラットフォーム（Vercel、Railway）に設定されていること

### 2. 入力バリデーション

#### ユーザー入力は必ずバリデーションする
```typescript
import { z } from 'zod'

// バリデーションスキーマを定義
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

// 処理前にバリデーション
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

#### ファイルアップロードのバリデーション
```typescript
function validateFileUpload(file: File) {
  // サイズチェック（最大5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('File too large (max 5MB)')
  }

  // タイプチェック
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }

  // 拡張子チェック
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error('Invalid file extension')
  }

  return true
}
```

#### 確認ステップ
- [ ] すべてのユーザー入力がスキーマでバリデーションされていること
- [ ] ファイルアップロードが制限されていること（サイズ、タイプ、拡張子）
- [ ] ユーザー入力がクエリに直接使用されていないこと
- [ ] ホワイトリストバリデーションであること（ブラックリストではなく）
- [ ] エラーメッセージが機密情報を漏洩しないこと

### 3. SQLインジェクションの防止

#### ❌ SQLの文字列連結は絶対にしない
```typescript
// 危険 - SQLインジェクションの脆弱性
const query = `SELECT * FROM users WHERE email = '${userEmail}'`
await db.query(query)
```

#### ✅ 常にパラメータ化クエリを使用する
```typescript
// 安全 - パラメータ化クエリ
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)

// または生SQLの場合
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
)
```

#### 確認ステップ
- [ ] すべてのデータベースクエリがパラメータ化クエリを使用していること
- [ ] SQLに文字列連結がないこと
- [ ] ORM/クエリビルダーが正しく使用されていること
- [ ] Supabaseクエリが適切にサニタイズされていること

### 4. 認証と認可

#### JWTトークンの取り扱い
```typescript
// ❌ 間違い: localStorage（XSSに脆弱）
localStorage.setItem('token', token)

// ✅ 正しい: httpOnlyクッキー
res.setHeader('Set-Cookie',
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
```

#### 認可チェック
```typescript
export async function deleteUser(userId: string, requesterId: string) {
  // 常に最初に認可を確認する
  const requester = await db.users.findUnique({
    where: { id: requesterId }
  })

  if (requester.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // 削除を実行
  await db.users.delete({ where: { id: userId } })
}
```

#### 行レベルセキュリティ（Supabase）
```sql
-- すべてのテーブルでRLSを有効にする
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみ閲覧可能
CREATE POLICY "Users view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- ユーザーは自分のデータのみ更新可能
CREATE POLICY "Users update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

#### 確認ステップ
- [ ] トークンがhttpOnlyクッキーに保存されていること（localStorageではなく）
- [ ] 機密操作の前に認可チェックが行われていること
- [ ] Supabaseで行レベルセキュリティが有効であること
- [ ] ロールベースのアクセス制御が実装されていること
- [ ] セッション管理が安全であること

### 5. XSS 防止

#### HTMLのサニタイズ
```typescript
import DOMPurify from 'isomorphic-dompurify'

// ユーザー提供のHTMLは必ずサニタイズする
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

#### コンテンツセキュリティポリシー
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

#### 確認ステップ
- [ ] ユーザー提供のHTMLがサニタイズされていること
- [ ] CSPヘッダーが設定されていること
- [ ] 未検証の動的コンテンツレンダリングがないこと
- [ ] Reactの組み込みXSS保護が使用されていること

### 6. CSRF 対策

#### CSRFトークン
```typescript
import { csrf } from '@/lib/csrf'

export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token')

  if (!csrf.verify(token)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }

  // リクエストを処理
}
```

#### SameSite クッキー
```typescript
res.setHeader('Set-Cookie',
  `session=${sessionId}; HttpOnly; Secure; SameSite=Strict`)
```

#### 確認ステップ
- [ ] 状態を変更する操作にCSRFトークンが使用されていること
- [ ] すべてのクッキーにSameSite=Strictが設定されていること
- [ ] ダブルサブミットクッキーパターンが実装されていること

### 7. レート制限

#### APIレート制限
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // ウィンドウあたり100リクエスト
  message: 'Too many requests'
})

// ルートに適用
app.use('/api/', limiter)
```

#### 高コスト操作
```typescript
// 検索にはより厳しいレート制限
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分
  max: 10, // 1分あたり10リクエスト
  message: 'Too many search requests'
})

app.use('/api/search', searchLimiter)
```

#### 確認ステップ
- [ ] すべてのAPIエンドポイントにレート制限があること
- [ ] 高コスト操作にはより厳しい制限があること
- [ ] IPベースのレート制限があること
- [ ] ユーザーベースのレート制限があること（認証済み）

### 8. 機密データの漏洩

#### ロギング
```typescript
// ❌ 間違い: 機密データをログ出力
console.log('User login:', { email, password })
console.log('Payment:', { cardNumber, cvv })

// ✅ 正しい: 機密データをマスク
console.log('User login:', { email, userId })
console.log('Payment:', { last4: card.last4, userId })
```

#### エラーメッセージ
```typescript
// ❌ 間違い: 内部詳細を公開
catch (error) {
  return NextResponse.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  )
}

// ✅ 正しい: 汎用的なエラーメッセージ
catch (error) {
  console.error('Internal error:', error)
  return NextResponse.json(
    { error: 'An error occurred. Please try again.' },
    { status: 500 }
  )
}
```

#### 確認ステップ
- [ ] ログにパスワード、トークン、秘密情報がないこと
- [ ] エラーメッセージがユーザーに対して汎用的であること
- [ ] 詳細なエラーはサーバーログにのみ出力されること
- [ ] ユーザーにスタックトレースが公開されていないこと

### 9. ブロックチェーンセキュリティ（Solana）

#### ウォレット検証
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

#### トランザクション検証
```typescript
async function verifyTransaction(transaction: Transaction) {
  // 受取人を検証
  if (transaction.to !== expectedRecipient) {
    throw new Error('Invalid recipient')
  }

  // 金額を検証
  if (transaction.amount > maxAmount) {
    throw new Error('Amount exceeds limit')
  }

  // ユーザーに十分な残高があるか確認
  const balance = await getBalance(transaction.from)
  if (balance < transaction.amount) {
    throw new Error('Insufficient balance')
  }

  return true
}
```

#### 確認ステップ
- [ ] ウォレットの署名が検証されていること
- [ ] トランザクションの詳細がバリデーションされていること
- [ ] トランザクション前に残高チェックが行われていること
- [ ] ブラインドトランザクション署名がないこと

### 10. 依存関係のセキュリティ

#### 定期的な更新
```bash
# 脆弱性をチェック
npm audit

# 自動修正可能な問題を修正
npm audit fix

# 依存関係を更新
npm update

# 古いパッケージをチェック
npm outdated
```

#### ロックファイル
```bash
# ロックファイルは必ずコミットする
git add package-lock.json

# CI/CDでは再現可能なビルドのために使用
npm ci  # npm installの代わりに
```

#### 確認ステップ
- [ ] 依存関係が最新であること
- [ ] 既知の脆弱性がないこと（npm auditがクリーン）
- [ ] ロックファイルがコミットされていること
- [ ] GitHubでDependabotが有効であること
- [ ] 定期的なセキュリティ更新が行われていること

## セキュリティテスト

### 自動セキュリティテスト
```typescript
// 認証のテスト
test('requires authentication', async () => {
  const response = await fetch('/api/protected')
  expect(response.status).toBe(401)
})

// 認可のテスト
test('requires admin role', async () => {
  const response = await fetch('/api/admin', {
    headers: { Authorization: `Bearer ${userToken}` }
  })
  expect(response.status).toBe(403)
})

// 入力バリデーションのテスト
test('rejects invalid input', async () => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email' })
  })
  expect(response.status).toBe(400)
})

// レート制限のテスト
test('enforces rate limits', async () => {
  const requests = Array(101).fill(null).map(() =>
    fetch('/api/endpoint')
  )

  const responses = await Promise.all(requests)
  const tooManyRequests = responses.filter(r => r.status === 429)

  expect(tooManyRequests.length).toBeGreaterThan(0)
})
```

## デプロイ前セキュリティチェックリスト

本番デプロイの前に必ず確認：

- [ ] **秘密情報**: ハードコードされた秘密情報がなく、すべて環境変数に設定
- [ ] **入力バリデーション**: すべてのユーザー入力がバリデーションされている
- [ ] **SQLインジェクション**: すべてのクエリがパラメータ化されている
- [ ] **XSS**: ユーザーコンテンツがサニタイズされている
- [ ] **CSRF**: 対策が有効になっている
- [ ] **認証**: 適切なトークン処理が行われている
- [ ] **認可**: ロールチェックが実装されている
- [ ] **レート制限**: すべてのエンドポイントで有効
- [ ] **HTTPS**: 本番環境で強制されている
- [ ] **セキュリティヘッダー**: CSP、X-Frame-Optionsが設定されている
- [ ] **エラーハンドリング**: エラーに機密データが含まれていない
- [ ] **ロギング**: 機密データがログに出力されていない
- [ ] **依存関係**: 最新で、脆弱性がない
- [ ] **行レベルセキュリティ**: Supabaseで有効
- [ ] **CORS**: 適切に設定されている
- [ ] **ファイルアップロード**: バリデーション済み（サイズ、タイプ）
- [ ] **ウォレット署名**: 検証済み（ブロックチェーンの場合）

## リソース

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/security)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Web Security Academy](https://portswigger.net/web-security)

---

**忘れないでください**: セキュリティはオプションではありません。たった1つの脆弱性がプラットフォーム全体を危険にさらす可能性があります。迷ったときは、安全側に倒してください。
