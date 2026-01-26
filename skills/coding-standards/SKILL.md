---
name: coding-standards
description: TypeScript、JavaScript、React、Node.js開発における汎用的なコーディング標準、ベストプラクティス、パターン。
---

# コーディング標準とベストプラクティス

すべてのプロジェクトに適用される汎用的なコーディング標準。

## コード品質の原則

### 1. 可読性優先
- コードは書くより読む回数が多い
- 明確な変数名と関数名
- コメントよりも自己文書化コードを優先
- 一貫したフォーマット

### 2. KISS（Keep It Simple, Stupid）
- 動作する最もシンプルな解決策
- オーバーエンジニアリングを避ける
- 早すぎる最適化をしない
- 理解しやすい > 賢いコード

### 3. DRY（Don't Repeat Yourself）
- 共通ロジックを関数に抽出
- 再利用可能なコンポーネントを作成
- モジュール間でユーティリティを共有
- コピペプログラミングを避ける

### 4. YAGNI（You Aren't Gonna Need It）
- 必要になる前に機能を構築しない
- 投機的な汎用化を避ける
- 必要な場合のみ複雑さを追加
- シンプルに始め、必要に応じてリファクタリング

## TypeScript/JavaScript標準

### 変数の命名

```typescript
// 良い例：説明的な名前
const marketSearchQuery = 'election'
const isUserAuthenticated = true
const totalRevenue = 1000

// 悪い例：不明確な名前
const q = 'election'
const flag = true
const x = 1000
```

### 関数の命名

```typescript
// 良い例：動詞-名詞パターン
async function fetchMarketData(marketId: string) { }
function calculateSimilarity(a: number[], b: number[]) { }
function isValidEmail(email: string): boolean { }

// 悪い例：不明確または名詞のみ
async function market(id: string) { }
function similarity(a, b) { }
function email(e) { }
```

### イミュータビリティパターン（重要）

```typescript
// 常にスプレッド演算子を使用
const updatedUser = {
  ...user,
  name: 'New Name'
}

const updatedArray = [...items, newItem]

// 直接変更は絶対にしない
user.name = 'New Name'  // 悪い例
items.push(newItem)     // 悪い例
```

### エラーハンドリング

```typescript
// 良い例：包括的なエラーハンドリング
async function fetchData(url: string) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    throw new Error('Failed to fetch data')
  }
}

// 悪い例：エラーハンドリングなし
async function fetchData(url) {
  const response = await fetch(url)
  return response.json()
}
```

### Async/Awaitのベストプラクティス

```typescript
// 良い例：可能な場合は並列実行
const [users, markets, stats] = await Promise.all([
  fetchUsers(),
  fetchMarkets(),
  fetchStats()
])

// 悪い例：不必要な順次実行
const users = await fetchUsers()
const markets = await fetchMarkets()
const stats = await fetchStats()
```

### 型安全性

```typescript
// 良い例：適切な型
interface Market {
  id: string
  name: string
  status: 'active' | 'resolved' | 'closed'
  created_at: Date
}

function getMarket(id: string): Promise<Market> {
  // 実装
}

// 悪い例：'any'の使用
function getMarket(id: any): Promise<any> {
  // 実装
}
```

## Reactのベストプラクティス

### コンポーネント構造

```typescript
// 良い例：型付き関数コンポーネント
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}

// 悪い例：型なし、不明確な構造
export function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>
}
```

### カスタムフック

```typescript
// 良い例：再利用可能なカスタムフック
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// 使用例
const debouncedQuery = useDebounce(searchQuery, 500)
```

### ステート管理

```typescript
// 良い例：適切なステート更新
const [count, setCount] = useState(0)

// 前のステートに基づく更新には関数型更新を使用
setCount(prev => prev + 1)

// 悪い例：直接的なステート参照
setCount(count + 1)  // 非同期シナリオで古くなる可能性
```

### 条件付きレンダリング

```typescript
// 良い例：明確な条件付きレンダリング
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// 悪い例：三項演算子地獄
{isLoading ? <Spinner /> : error ? <ErrorMessage error={error} /> : data ? <DataDisplay data={data} /> : null}
```

## API設計標準

### REST API規約

```
GET    /api/markets              # 全マーケット一覧
GET    /api/markets/:id          # 特定のマーケット取得
POST   /api/markets              # 新規マーケット作成
PUT    /api/markets/:id          # マーケット更新（全体）
PATCH  /api/markets/:id          # マーケット更新（部分）
DELETE /api/markets/:id          # マーケット削除

# フィルタリング用クエリパラメータ
GET /api/markets?status=active&limit=10&offset=0
```

### レスポンス形式

```typescript
// 良い例：一貫したレスポンス構造
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// 成功レスポンス
return NextResponse.json({
  success: true,
  data: markets,
  meta: { total: 100, page: 1, limit: 10 }
})

// エラーレスポンス
return NextResponse.json({
  success: false,
  error: 'Invalid request'
}, { status: 400 })
```

### 入力バリデーション

```typescript
import { z } from 'zod'

// 良い例：スキーマバリデーション
const CreateMarketSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  endDate: z.string().datetime(),
  categories: z.array(z.string()).min(1)
})

export async function POST(request: Request) {
  const body = await request.json()

  try {
    const validated = CreateMarketSchema.parse(body)
    // バリデーション済みデータで続行
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }
  }
}
```

## ファイル構成

### プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # APIルート
│   ├── markets/           # マーケットページ
│   └── (auth)/           # 認証ページ（ルートグループ）
├── components/            # Reactコンポーネント
│   ├── ui/               # 汎用UIコンポーネント
│   ├── forms/            # フォームコンポーネント
│   └── layouts/          # レイアウトコンポーネント
├── hooks/                # カスタムReactフック
├── lib/                  # ユーティリティと設定
│   ├── api/             # APIクライアント
│   ├── utils/           # ヘルパー関数
│   └── constants/       # 定数
├── types/                # TypeScript型
└── styles/              # グローバルスタイル
```

### ファイル命名

```
components/Button.tsx          # コンポーネントはPascalCase
hooks/useAuth.ts              # フックはcamelCaseと'use'プレフィックス
lib/formatDate.ts             # ユーティリティはcamelCase
types/market.types.ts         # 型はcamelCaseと.typesサフィックス
```

## コメントとドキュメント

### コメントを書くべき時

```typescript
// 良い例：WHYを説明し、WHATではない
// 障害時にAPIを圧倒しないよう指数バックオフを使用
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// 大きな配列でのパフォーマンスのため、意図的にここでミューテーションを使用
items.push(newItem)

// 悪い例：自明なことを述べる
// カウンターを1増やす
count++

// 名前をユーザーの名前に設定
name = user.name
```

### 公開API向けJSDoc

```typescript
/**
 * セマンティック類似性を使用してマーケットを検索します。
 *
 * @param query - 自然言語の検索クエリ
 * @param limit - 結果の最大数（デフォルト：10）
 * @returns 類似度スコアでソートされたマーケットの配列
 * @throws {Error} OpenAI APIが失敗またはRedisが利用不可の場合
 *
 * @example
 * ```typescript
 * const results = await searchMarkets('election', 5)
 * console.log(results[0].name) // "Trump vs Biden"
 * ```
 */
export async function searchMarkets(
  query: string,
  limit: number = 10
): Promise<Market[]> {
  // 実装
}
```

## パフォーマンスのベストプラクティス

### メモ化

```typescript
import { useMemo, useCallback } from 'react'

// 良い例：高コストな計算をメモ化
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume)
}, [markets])

// 良い例：コールバックをメモ化
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])
```

### 遅延ロード

```typescript
import { lazy, Suspense } from 'react'

// 良い例：重いコンポーネントを遅延ロード
const HeavyChart = lazy(() => import('./HeavyChart'))

export function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  )
}
```

### データベースクエリ

```typescript
// 良い例：必要なカラムのみ選択
const { data } = await supabase
  .from('markets')
  .select('id, name, status')
  .limit(10)

// 悪い例：すべてを選択
const { data } = await supabase
  .from('markets')
  .select('*')
```

## テスト標準

### テスト構造（AAAパターン）

```typescript
test('calculates similarity correctly', () => {
  // Arrange（準備）
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act（実行）
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert（検証）
  expect(similarity).toBe(0)
})
```

### テストの命名

```typescript
// 良い例：説明的なテスト名
test('returns empty array when no markets match query', () => { })
test('throws error when OpenAI API key is missing', () => { })
test('falls back to substring search when Redis unavailable', () => { })

// 悪い例：曖昧なテスト名
test('works', () => { })
test('test search', () => { })
```

## コードスメルの検出

以下のアンチパターンに注意：

### 1. 長い関数
```typescript
// 悪い例：50行を超える関数
function processMarketData() {
  // 100行のコード
}

// 良い例：小さな関数に分割
function processMarketData() {
  const validated = validateData()
  const transformed = transformData(validated)
  return saveData(transformed)
}
```

### 2. 深いネスト
```typescript
// 悪い例：5レベル以上のネスト
if (user) {
  if (user.isAdmin) {
    if (market) {
      if (market.isActive) {
        if (hasPermission) {
          // 何かを実行
        }
      }
    }
  }
}

// 良い例：早期リターン
if (!user) return
if (!user.isAdmin) return
if (!market) return
if (!market.isActive) return
if (!hasPermission) return

// 何かを実行
```

### 3. マジックナンバー
```typescript
// 悪い例：説明のない数字
if (retryCount > 3) { }
setTimeout(callback, 500)

// 良い例：名前付き定数
const MAX_RETRIES = 3
const DEBOUNCE_DELAY_MS = 500

if (retryCount > MAX_RETRIES) { }
setTimeout(callback, DEBOUNCE_DELAY_MS)
```

**重要**：コード品質は妥協できません。明確で保守しやすいコードは、迅速な開発と自信を持ったリファクタリングを可能にします。
