---
name: security-review
description: 認証の追加、ユーザー入力の処理、シークレットの操作、APIエンドポイントの作成、支払い/機密機能の実装時にこのスキルを使用。包括的なセキュリティチェックリストとパターンを提供。
---

# セキュリティレビュースキル

すべてのコードがセキュリティベストプラクティスに従い、潜在的な脆弱性を特定することを保証するスキル。

## 起動するタイミング

- 認証または認可の実装時
- ユーザー入力またはファイルアップロードの処理時
- 新しいAPIエンドポイントの作成時
- シークレットや認証情報の操作時
- 支払い機能の実装時
- 機密データの保存または送信時
- サードパーティAPIの統合時

## セキュリティチェックリスト

### 1. シークレット管理

#### ❌ 絶対にやってはいけない

```typescript
const apiKey = "sk-proj-xxxxx"  // ハードコードされたシークレット
const dbPassword = "password123"  // ソースコード内
```

#### ✅ 常にこうする

```typescript
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

// シークレットの存在を確認
if (!apiKey) {
  throw new Error('OPENAI_API_KEYが設定されていません')
}
```

#### 確認ステップ

- [ ] ハードコードされたAPIキー、トークン、パスワードがない
- [ ] すべてのシークレットが環境変数にある
- [ ] `.env.local`が.gitignoreにある
- [ ] git履歴にシークレットがない
- [ ] 本番シークレットがホスティングプラットフォームにある

### 2. 入力検証

#### 常にユーザー入力を検証

```typescript
import { z } from 'zod'

// 検証スキーマを定義
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

// 処理前に検証
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

#### ファイルアップロード検証

```typescript
function validateFileUpload(file: File) {
  // サイズチェック（最大5MB）
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('ファイルが大きすぎます（最大5MB）')
  }

  // タイプチェック
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('無効なファイルタイプです')
  }

  return true
}
```

### 3. SQLインジェクション防止

#### ❌ SQLを連結しない

```typescript
// 危険 - SQLインジェクション脆弱性
const query = `SELECT * FROM users WHERE email = '${userEmail}'`
await db.query(query)
```

#### ✅ 常にパラメータ化クエリを使用

```typescript
// 安全 - パラメータ化クエリ
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)

// 生のSQLを使用する場合
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
)
```

### 4. 認証と認可

#### JWTトークン処理

```typescript
// ❌ 間違い: localStorage（XSSに脆弱）
localStorage.setItem('token', token)

// ✅ 正しい: httpOnly Cookie
res.setHeader('Set-Cookie',
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`
)
```

#### 認可チェック

```typescript
export async function deleteUser(userId: string, requesterId: string) {
  // 常に最初に認可を確認
  const requester = await db.users.findUnique({
    where: { id: requesterId }
  })

  if (requester.role !== 'admin') {
    return NextResponse.json(
      { error: '権限がありません' },
      { status: 403 }
    )
  }

  // 削除を続行
  await db.users.delete({ where: { id: userId } })
}
```

#### Row Level Security（Supabase）

```sql
-- すべてのテーブルでRLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみ閲覧可能
CREATE POLICY "Users view own data" ON users
FOR SELECT USING (auth.uid() = id);

-- ユーザーは自分のデータのみ更新可能
CREATE POLICY "Users update own data" ON users
FOR UPDATE USING (auth.uid() = id);
```

### 5. XSS防止

#### HTMLをサニタイズ

```typescript
import DOMPurify from 'isomorphic-dompurify'

// 常にユーザー提供のHTMLをサニタイズ
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

### 6. レート制限

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15分
  max: 100,                   // ウィンドウあたり100リクエスト
  message: 'リクエストが多すぎます'
})

// ルートに適用
app.use('/api/', limiter)
```

### 7. 機密データの露出

#### ログ記録

```typescript
// ❌ 間違い: 機密データをログ
console.log('User login:', { email, password })

// ✅ 正しい: 機密データを除去
console.log('User login:', { email, userId })
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

// ✅ 正しい: 汎用エラーメッセージ
catch (error) {
  console.error('Internal error:', error)
  return NextResponse.json(
    { error: 'エラーが発生しました。再試行してください。' },
    { status: 500 }
  )
}
```

## デプロイ前セキュリティチェックリスト

本番デプロイの前に:

- [ ] **シークレット**: ハードコードされたシークレットなし
- [ ] **入力検証**: すべてのユーザー入力が検証済み
- [ ] **SQLインジェクション**: すべてのクエリがパラメータ化
- [ ] **XSS**: ユーザーコンテンツがサニタイズ済み
- [ ] **CSRF**: 保護が有効
- [ ] **認証**: 適切なトークン処理
- [ ] **認可**: ロールチェックが実装済み
- [ ] **レート制限**: すべてのエンドポイントで有効
- [ ] **HTTPS**: 本番で強制
- [ ] **セキュリティヘッダー**: CSP、X-Frame-Optionsが設定済み
- [ ] **エラーハンドリング**: エラーに機密データなし
- [ ] **ログ記録**: ログに機密データなし
- [ ] **依存関係**: 最新、脆弱性なし
- [ ] **RLS**: Supabaseで有効
- [ ] **CORS**: 適切に設定
- [ ] **ファイルアップロード**: 検証済み（サイズ、タイプ）

## リソース

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/security)
- [Supabase Security](https://supabase.com/docs/guides/auth)

---

**覚えておくこと**: セキュリティはオプションではありません。1つの脆弱性でプラットフォーム全体が危険にさらされます。疑わしい場合は、より慎重な側に倒してください。
