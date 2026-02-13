---
name: tdd-workflow
description: 新機能の実装、バグ修正、リファクタリング時に使用するスキル。ユニット、統合、E2Eテストを含む80%以上のカバレッジでテスト駆動開発を実施。
---

# テスト駆動開発ワークフロー

このスキルは、すべてのコード開発がTDDの原則に従い、包括的なテストカバレッジを確保します。

## 使用するタイミング

- 新機能や機能の実装時
- バグや問題の修正時
- 既存コードのリファクタリング時
- APIエンドポイントの追加時
- 新しいコンポーネントの作成時

## 基本原則

### 1. テストをコードより先に書く
常にテストを最初に書き、テストが通るようにコードを実装します。

### 2. カバレッジ要件
- 最低80%のカバレッジ（ユニット + 統合 + E2E）
- すべてのエッジケースをカバー
- エラーシナリオをテスト
- 境界条件を検証

### 3. テストの種類

#### ユニットテスト
- 個々の関数とユーティリティ
- コンポーネントのロジック
- 純粋関数
- ヘルパーとユーティリティ

#### 統合テスト
- APIエンドポイント
- データベース操作
- サービス間のインタラクション
- 外部API呼び出し

#### E2Eテスト（Playwright）
- 重要なユーザーフロー
- 完全なワークフロー
- ブラウザ自動化
- UIインタラクション

## TDD ワークフローのステップ

### ステップ 1: ユーザージャーニーを記述する
```
[役割]として、[アクション]したい。[メリット]を得るために。

例:
ユーザーとして、マーケットをセマンティック検索したい。
正確なキーワードがなくても関連するマーケットを見つけるために。
```

### ステップ 2: テストケースを生成する
各ユーザージャーニーに対して、包括的なテストケースを作成します：

```typescript
describe('Semantic Search', () => {
  it('returns relevant markets for query', async () => {
    // テストの実装
  })

  it('handles empty query gracefully', async () => {
    // エッジケースのテスト
  })

  it('falls back to substring search when Redis unavailable', async () => {
    // フォールバック動作のテスト
  })

  it('sorts results by similarity score', async () => {
    // ソートロジックのテスト
  })
})
```

### ステップ 3: テストを実行する（失敗するはず）
```bash
npm test
# テストは失敗するはず - まだ実装していないため
```

### ステップ 4: コードを実装する
テストが通るための最小限のコードを書きます：

```typescript
// テストに導かれた実装
export async function searchMarkets(query: string) {
  // ここに実装
}
```

### ステップ 5: テストを再実行する
```bash
npm test
# テストが通るはず
```

### ステップ 6: リファクタリング
テストをグリーンに保ちながらコード品質を改善します：
- 重複を除去する
- 命名を改善する
- パフォーマンスを最適化する
- 可読性を向上させる

### ステップ 7: カバレッジを検証する
```bash
npm run test:coverage
# 80%以上のカバレッジが達成されていることを確認
```

## テスティングパターン

### ユニットテストパターン（Jest/Vitest）
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### API統合テストパターン
```typescript
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/markets', () => {
  it('returns markets successfully', async () => {
    const request = new NextRequest('http://localhost/api/markets')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('validates query parameters', async () => {
    const request = new NextRequest('http://localhost/api/markets?limit=invalid')
    const response = await GET(request)

    expect(response.status).toBe(400)
  })

  it('handles database errors gracefully', async () => {
    // データベース障害をモック
    const request = new NextRequest('http://localhost/api/markets')
    // エラーハンドリングをテスト
  })
})
```

### E2Eテストパターン（Playwright）
```typescript
import { test, expect } from '@playwright/test'

test('user can search and filter markets', async ({ page }) => {
  // マーケットページに移動
  await page.goto('/')
  await page.click('a[href="/markets"]')

  // ページが読み込まれたことを確認
  await expect(page.locator('h1')).toContainText('Markets')

  // マーケットを検索
  await page.fill('input[placeholder="Search markets"]', 'election')

  // デバウンスと結果を待つ
  await page.waitForTimeout(600)

  // 検索結果が表示されたことを確認
  const results = page.locator('[data-testid="market-card"]')
  await expect(results).toHaveCount(5, { timeout: 5000 })

  // 結果に検索語が含まれていることを確認
  const firstResult = results.first()
  await expect(firstResult).toContainText('election', { ignoreCase: true })

  // ステータスでフィルタリング
  await page.click('button:has-text("Active")')

  // フィルタリング結果を確認
  await expect(results).toHaveCount(3)
})

test('user can create a new market', async ({ page }) => {
  // まずログイン
  await page.goto('/creator-dashboard')

  // マーケット作成フォームに入力
  await page.fill('input[name="name"]', 'Test Market')
  await page.fill('textarea[name="description"]', 'Test description')
  await page.fill('input[name="endDate"]', '2025-12-31')

  // フォームを送信
  await page.click('button[type="submit"]')

  // 成功メッセージを確認
  await expect(page.locator('text=Market created successfully')).toBeVisible()

  // マーケットページへのリダイレクトを確認
  await expect(page).toHaveURL(/\/markets\/test-market/)
})
```

## テストファイルの構成

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx          # ユニットテスト
│   │   └── Button.stories.tsx       # Storybook
│   └── MarketCard/
│       ├── MarketCard.tsx
│       └── MarketCard.test.tsx
├── app/
│   └── api/
│       └── markets/
│           ├── route.ts
│           └── route.test.ts         # 統合テスト
└── e2e/
    ├── markets.spec.ts               # E2Eテスト
    ├── trading.spec.ts
    └── auth.spec.ts
```

## 外部サービスのモック

### Supabase モック
```typescript
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: [{ id: 1, name: 'Test Market' }],
          error: null
        }))
      }))
    }))
  }
}))
```

### Redis モック
```typescript
jest.mock('@/lib/redis', () => ({
  searchMarketsByVector: jest.fn(() => Promise.resolve([
    { slug: 'test-market', similarity_score: 0.95 }
  ])),
  checkRedisHealth: jest.fn(() => Promise.resolve({ connected: true }))
}))
```

### OpenAI モック
```typescript
jest.mock('@/lib/openai', () => ({
  generateEmbedding: jest.fn(() => Promise.resolve(
    new Array(1536).fill(0.1) // 1536次元のエンベディングをモック
  ))
}))
```

## テストカバレッジの検証

### カバレッジレポートの実行
```bash
npm run test:coverage
```

### カバレッジしきい値
```json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## よくあるテストの間違いを避ける

### ❌ 間違い: 実装の詳細をテストしている
```typescript
// 内部状態をテストしない
expect(component.state.count).toBe(5)
```

### ✅ 正しい: ユーザーに見える振る舞いをテストする
```typescript
// ユーザーが見るものをテスト
expect(screen.getByText('Count: 5')).toBeInTheDocument()
```

### ❌ 間違い: 壊れやすいセレクター
```typescript
// 簡単に壊れる
await page.click('.css-class-xyz')
```

### ✅ 正しい: セマンティックなセレクター
```typescript
// 変更に強い
await page.click('button:has-text("Submit")')
await page.click('[data-testid="submit-button"]')
```

### ❌ 間違い: テストの分離がない
```typescript
// テストが互いに依存している
test('creates user', () => { /* ... */ })
test('updates same user', () => { /* 前のテストに依存 */ })
```

### ✅ 正しい: 独立したテスト
```typescript
// 各テストが独自のデータをセットアップ
test('creates user', () => {
  const user = createTestUser()
  // テストロジック
})

test('updates user', () => {
  const user = createTestUser()
  // 更新ロジック
})
```

## 継続的テスト

### 開発中のウォッチモード
```bash
npm test -- --watch
# ファイル変更時にテストが自動実行
```

### Pre-Commit フック
```bash
# すべてのコミット前に実行
npm test && npm run lint
```

### CI/CD 統合
```yaml
# GitHub Actions
- name: Run Tests
  run: npm test -- --coverage
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## ベストプラクティス

1. **テストを先に書く** - 常にTDDで
2. **テストごとに1つのアサーション** - 単一の振る舞いに集中
3. **説明的なテスト名** - 何をテストしているかを明示
4. **Arrange-Act-Assert** - 明確なテスト構造
5. **外部依存をモック** - ユニットテストを分離
6. **エッジケースをテスト** - null、undefined、空、大量データ
7. **エラーパスをテスト** - ハッピーパスだけでなく
8. **テストを高速に保つ** - ユニットテストは各50ms未満
9. **テスト後にクリーンアップ** - 副作用を残さない
10. **カバレッジレポートを確認** - ギャップを特定する

## 成功メトリクス

- 80%以上のコードカバレッジを達成
- すべてのテストが通過（グリーン）
- スキップまたは無効化されたテストがない
- 高速なテスト実行（ユニットテストは30秒未満）
- E2Eテストが重要なユーザーフローをカバー
- テストが本番環境に入る前にバグを検出

---

**忘れないでください**: テストはオプションではありません。自信を持ったリファクタリング、迅速な開発、本番環境の信頼性を支える安全ネットです。
