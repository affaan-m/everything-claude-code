---
name: tdd-workflow
description: 新機能の作成、バグ修正、コードのリファクタリング時にこのスキルを使用。ユニット、統合、E2Eテストを含む80%以上のカバレッジでテスト駆動開発を強制。
---

# テスト駆動開発ワークフロー

すべてのコード開発がTDDの原則に従い、包括的なテストカバレッジを持つことを保証するスキル。

## 起動するタイミング

- 新機能や機能を書くとき
- バグや問題を修正するとき
- 既存のコードをリファクタリングするとき
- APIエンドポイントを追加するとき
- 新しいコンポーネントを作成するとき

## コア原則

### 1. コードの前にテスト

常にまずテストを書き、テストをパスするためのコードを実装します。

### 2. カバレッジ要件

- 最低80%カバレッジ（ユニット + 統合 + E2E）
- すべてのエッジケースをカバー
- エラーシナリオをテスト
- 境界条件を検証

### 3. テストタイプ

#### ユニットテスト
- 個々の関数とユーティリティ
- コンポーネントロジック
- 純粋関数
- ヘルパーとユーティリティ

#### 統合テスト
- APIエンドポイント
- データベース操作
- サービス間の連携
- 外部API呼び出し

#### E2Eテスト（Playwright）
- 重要なユーザーフロー
- 完全なワークフロー
- ブラウザ自動化
- UIインタラクション

## TDDワークフローステップ

### ステップ1: ユーザージャーニーを書く

```
[ロール]として、
[アクション]したい、
そうすれば[ベネフィット]が得られる

例:
ユーザーとして、
セマンティックにマーケットを検索したい、
そうすれば正確なキーワードがなくても関連するマーケットを見つけられる。
```

### ステップ2: テストケースを生成

各ユーザージャーニーについて、包括的なテストケースを作成:

```typescript
describe('セマンティック検索', () => {
  it('クエリに対して関連するマーケットを返す', async () => {
    // テスト実装
  })

  it('空のクエリを適切に処理する', async () => {
    // エッジケースをテスト
  })

  it('Redis利用不可時にサブストリング検索にフォールバック', async () => {
    // フォールバック動作をテスト
  })

  it('類似度スコアで結果をソート', async () => {
    // ソートロジックをテスト
  })
})
```

### ステップ3: テストを実行（失敗するはず）

```bash
npm test  # テストは失敗するはず - まだ実装していない
```

### ステップ4: コードを実装

テストをパスする最小限のコードを書く:

```typescript
// テストに導かれた実装
export async function searchMarkets(query: string) {
  // ここに実装
}
```

### ステップ5: 再度テストを実行

```bash
npm test  # テストはパスするはず
```

### ステップ6: リファクタリング

テストをグリーンに保ちながらコード品質を改善:

- 重複を削除
- 命名を改善
- パフォーマンスを最適化
- 可読性を向上

### ステップ7: カバレッジを確認

```bash
npm run test:coverage  # 80%以上のカバレッジを確認
```

## テストパターン

### ユニットテストパターン（Jest/Vitest）

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Buttonコンポーネント', () => {
  it('正しいテキストでレンダリングする', () => {
    render(<Button>クリック</Button>)
    expect(screen.getByText('クリック')).toBeInTheDocument()
  })

  it('クリック時にonClickを呼び出す', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>クリック</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('disabledプロップがtrueの時に無効になる', () => {
    render(<Button disabled>クリック</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### API統合テストパターン

```typescript
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/markets', () => {
  it('マーケットを正常に返す', async () => {
    const request = new NextRequest('http://localhost/api/markets')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('クエリパラメータを検証する', async () => {
    const request = new NextRequest('http://localhost/api/markets?limit=invalid')
    const response = await GET(request)

    expect(response.status).toBe(400)
  })

  it('データベースエラーを適切に処理する', async () => {
    // データベース失敗をモック
    const request = new NextRequest('http://localhost/api/markets')
    // エラーハンドリングをテスト
  })
})
```

### E2Eテストパターン（Playwright）

```typescript
import { test, expect } from '@playwright/test'

test('ユーザーがマーケットを検索してフィルタリングできる', async ({ page }) => {
  // マーケットページに移動
  await page.goto('/')
  await page.click('a[href="/markets"]')

  // ページがロードされたことを確認
  await expect(page.locator('h1')).toContainText('Markets')

  // マーケットを検索
  await page.fill('input[placeholder="Search markets"]', 'election')

  // デバウンスと結果を待機
  await page.waitForTimeout(600)

  // 検索結果が表示されたことを確認
  const results = page.locator('[data-testid="market-card"]')
  await expect(results).toHaveCount(5, { timeout: 5000 })

  // 結果に検索語が含まれていることを確認
  const firstResult = results.first()
  await expect(firstResult).toContainText('election', { ignoreCase: true })
})
```

## 外部サービスのモック

### Supabaseモック

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

### Redisモック

```typescript
jest.mock('@/lib/redis', () => ({
  searchMarketsByVector: jest.fn(() => Promise.resolve([
    { slug: 'test-market', similarity_score: 0.95 }
  ]))
}))
```

### OpenAIモック

```typescript
jest.mock('@/lib/openai', () => ({
  generateEmbedding: jest.fn(() => Promise.resolve(
    new Array(1536).fill(0.1)  // 1536次元のモック埋め込み
  ))
}))
```

## 避けるべき一般的なテストミス

### ❌ 間違い: 実装の詳細をテスト

```typescript
// 内部状態をテストしない
expect(component.state.count).toBe(5)
```

### ✅ 正しい: ユーザーに見える動作をテスト

```typescript
// ユーザーが見るものをテスト
expect(screen.getByText('Count: 5')).toBeInTheDocument()
```

### ❌ 間違い: テストの分離がない

```typescript
// テストが互いに依存
test('ユーザーを作成', () => { /* ... */ })
test('同じユーザーを更新', () => { /* 前のテストに依存 */ })
```

### ✅ 正しい: 独立したテスト

```typescript
// 各テストが自分のデータをセットアップ
test('ユーザーを作成', () => {
  const user = createTestUser()
  // テストロジック
})
test('ユーザーを更新', () => {
  const user = createTestUser()
  // 更新ロジック
})
```

## ベストプラクティス

1. **テストを先に書く** - 常にTDD
2. **テストごとに1つのアサート** - 単一の動作に集中
3. **説明的なテスト名** - 何がテストされているか説明
4. **Arrange-Act-Assert** - 明確なテスト構造
5. **外部依存関係をモック** - ユニットテストを分離
6. **エッジケースをテスト** - null、undefined、空、大きな値
7. **エラーパスをテスト** - ハッピーパスだけでなく
8. **テストを高速に保つ** - ユニットテストは各50ms以下
9. **テスト後にクリーンアップ** - 副作用なし
10. **カバレッジレポートをレビュー** - ギャップを特定

## 成功メトリクス

- 80%以上のコードカバレッジ達成
- すべてのテストがパス（グリーン）
- スキップまたは無効なテストなし
- 高速なテスト実行（ユニットテストは30秒以内）
- E2Eテストが重要なユーザーフローをカバー
- テストが本番前にバグをキャッチ

---

**覚えておくこと**: テストはオプションではありません。自信を持ったリファクタリング、迅速な開発、本番の信頼性を可能にするセーフティネットです。
