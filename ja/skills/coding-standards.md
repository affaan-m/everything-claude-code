---
name: coding-standards
description: TypeScript、JavaScript、React、Node.js開発のためのユニバーサルコーディング規約とベストプラクティス。
---

# コーディング規約とベストプラクティス

すべてのプロジェクトに適用できるユニバーサルコーディング規約。

## コード品質の原則

### 1. 可読性を最優先に
- コードは書く回数よりも読む回数の方が多い
- 明確な変数名と関数名を使用する
- コメントよりも自己文書化されたコードを優先する
- 一貫したフォーマットを維持する

### 2. KISS（Keep It Simple, Stupid）
- 動作する最もシンプルな解決策を選ぶ
- 過剰設計を避ける
- 早すぎる最適化をしない
- 賢いコードよりも理解しやすいコードを選ぶ

### 3. DRY（Don't Repeat Yourself）
- 共通ロジックを関数に抽出する
- 再利用可能なコンポーネントを作成する
- モジュール間でユーティリティを共有する
- コピー&ペーストプログラミングを避ける

### 4. YAGNI（You Aren't Gonna Need It）
- 必要になる前に機能を作らない
- 推測的な汎用化を避ける
- 必要な場合にのみ複雑さを追加する
- シンプルに始めて、必要に応じてリファクタリングする

## TypeScript/JavaScript 規約

### 変数の命名

```typescript
// ✅ 良い例: 説明的な名前
const marketSearchQuery = 'election'
const isUserAuthenticated = true
const totalRevenue = 1000

// ❌ 悪い例: 不明確な名前
const q = 'election'
const flag = true
const x = 1000
```

### 関数の命名

```typescript
// ✅ 良い例: 動詞+名詞パターン
async function fetchMarketData(marketId: string) { }
function calculateSimilarity(a: number[], b: number[]) { }
function isValidEmail(email: string): boolean { }

// ❌ 悪い例: 不明確または名詞のみ
async function market(id: string) { }
function similarity(a, b) { }
function email(e) { }
```

### イミュータビリティパターン（重要）

```typescript
// ✅ 常にスプレッド演算子を使用する
const updatedUser = {
  ...user,
  name: 'New Name'
}

const updatedArray = [...items, newItem]

// ❌ 直接ミューテーションしない
user.name = 'New Name'  // NG
items.push(newItem)     // NG
```

### エラーハンドリング

```typescript
// ✅ 良い例: 包括的なエラーハンドリング
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

// ❌ 悪い例: エラーハンドリングなし
async function fetchData(url) {
  const response = await fetch(url)
  return response.json()
}
```

### Async/Await ベストプラクティス

```typescript
// ✅ 良い例: 可能な場合は並列実行
const [users, markets, stats] = await Promise.all([
  fetchUsers(),
  fetchMarkets(),
  fetchStats()
])

// ❌ 悪い例: 不必要な直列実行
const users = await fetchUsers()
const markets = await fetchMarkets()
const stats = await fetchStats()
```

### 型安全性

```typescript
// ✅ 良い例: 適切な型定義
interface Market {
  id: string
  name: string
  status: 'active' | 'resolved' | 'closed'
  created_at: Date
}

function getMarket(id: string): Promise<Market> {
  // 実装
}

// ❌ 悪い例: 'any' の使用
function getMarket(id: any): Promise<any> {
  // 実装
}
```

## React ベストプラクティス

### コンポーネント構造

```typescript
// ✅ 良い例: 型付きの関数コンポーネント
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

// ❌ 悪い例: 型なし、不明確な構造
export function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>
}
```

### カスタムフック

```typescript
// ✅ 良い例: 再利用可能なカスタムフック
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

### 状態管理

```typescript
// ✅ 良い例: 適切な状態更新
const [count, setCount] = useState(0)

// 前の状態に基づく関数型更新
setCount(prev => prev + 1)

// ❌ 悪い例: 直接的な状態参照
setCount(count + 1)  // 非同期シナリオで古い値になる可能性あり
```

### 条件付きレンダリング

```typescript
// ✅ 良い例: 明確な条件付きレンダリング
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// ❌ 悪い例: 三項演算子の入れ子
{isLoading ? <Spinner /> : error ? <ErrorMessage error={error} /> : data ? <DataDisplay data={data} /> : null}
```

## API 設計規約

### REST API 規約

```
GET    /api/markets              # 全マーケットの一覧取得
GET    /api/markets/:id          # 特定のマーケットを取得
POST   /api/markets              # 新しいマーケットを作成
PUT    /api/markets/:id          # マーケットを更新（全体）
PATCH  /api/markets/:id          # マーケットを更新（部分）
DELETE /api/markets/:id          # マーケットを削除

# フィルタリング用クエリパラメータ
GET /api/markets?status=active&limit=10&offset=0
```

### レスポンスフォーマット

```typescript
// ✅ 良い例: 一貫したレスポンス構造
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

// ✅ 良い例: スキーマバリデーション
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
    // バリデーション済みデータで処理を続行
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
├── types/                # TypeScript型定義
└── styles/              # グローバルスタイル
```

### ファイル命名規則

```
components/Button.tsx          # コンポーネントはPascalCase
hooks/useAuth.ts              # フックはcamelCaseで'use'プレフィックス
lib/formatDate.ts             # ユーティリティはcamelCase
types/market.types.ts         # 型定義はcamelCaseで.typesサフィックス
```

## コメントとドキュメント

### コメントすべき場面

```typescript
// ✅ 良い例: 「何を」ではなく「なぜ」を説明する
// 障害時にAPIに負荷をかけないよう指数バックオフを使用
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// 大きな配列のパフォーマンスのため、意図的にミューテーションを使用
items.push(newItem)

// ❌ 悪い例: 自明なことを述べている
// カウンターを1増やす
count++

// nameにユーザーの名前を設定
name = user.name
```

### パブリックAPIのJSDoc

```typescript
/**
 * セマンティック類似度を使用してマーケットを検索します。
 *
 * @param query - 自然言語の検索クエリ
 * @param limit - 最大結果数（デフォルト: 10）
 * @returns 類似度スコア順にソートされたマーケットの配列
 * @throws {Error} OpenAI APIが失敗した場合またはRedisが利用不可の場合
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

// ✅ 良い例: 高コストな計算をメモ化
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume)
}, [markets])

// ✅ 良い例: コールバックをメモ化
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])
```

### 遅延読み込み

```typescript
import { lazy, Suspense } from 'react'

// ✅ 良い例: 重いコンポーネントを遅延読み込み
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
// ✅ 良い例: 必要なカラムのみ選択
const { data } = await supabase
  .from('markets')
  .select('id, name, status')
  .limit(10)

// ❌ 悪い例: すべてを選択
const { data } = await supabase
  .from('markets')
  .select('*')
```

## テスト規約

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
// ✅ 良い例: 説明的なテスト名
test('returns empty array when no markets match query', () => { })
test('throws error when OpenAI API key is missing', () => { })
test('falls back to substring search when Redis unavailable', () => { })

// ❌ 悪い例: 曖昧なテスト名
test('works', () => { })
test('test search', () => { })
```

## コードスメルの検出

以下のアンチパターンに注意してください：

### 1. 長すぎる関数
```typescript
// ❌ 悪い例: 50行を超える関数
function processMarketData() {
  // 100行のコード
}

// ✅ 良い例: 小さな関数に分割
function processMarketData() {
  const validated = validateData()
  const transformed = transformData(validated)
  return saveData(transformed)
}
```

### 2. 深いネスト
```typescript
// ❌ 悪い例: 5段階以上のネスト
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

// ✅ 良い例: 早期リターン
if (!user) return
if (!user.isAdmin) return
if (!market) return
if (!market.isActive) return
if (!hasPermission) return

// 何かを実行
```

### 3. マジックナンバー
```typescript
// ❌ 悪い例: 説明のない数値
if (retryCount > 3) { }
setTimeout(callback, 500)

// ✅ 良い例: 名前付き定数
const MAX_RETRIES = 3
const DEBOUNCE_DELAY_MS = 500

if (retryCount > MAX_RETRIES) { }
setTimeout(callback, DEBOUNCE_DELAY_MS)
```

**忘れないでください**: コード品質は妥協できません。明確で保守しやすいコードが、迅速な開発と自信を持ったリファクタリングを可能にします。
