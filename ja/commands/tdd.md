---
description: テスト駆動開発ワークフローを実施。インターフェースを定義し、テストを先に生成、最小限のコードで実装。80%以上のカバレッジを確保。
---

# TDD コマンド

このコマンドは **tdd-guide** エージェントを呼び出し、テスト駆動開発の手法を実施します。

## このコマンドの機能

1. **インターフェースの定義** - 型やインターフェースを最初に定義する
2. **テストを先に生成** - 失敗するテストを書く (RED)
3. **最小限のコードで実装** - テストが通るだけのコードを書く (GREEN)
4. **リファクタリング** - テストを維持しながらコードを改善する (REFACTOR)
5. **カバレッジの検証** - 80%以上のテストカバレッジを確保する

## 使用するタイミング

`/tdd` を使用する場面：
- 新機能を実装するとき
- 新しい関数やコンポーネントを追加するとき
- バグを修正するとき（まずバグを再現するテストを書く）
- 既存コードをリファクタリングするとき
- 重要なビジネスロジックを構築するとき

## 動作の仕組み

tdd-guide エージェントは以下を行います：

1. **インターフェースを定義** - 入出力のインターフェースを作成
2. **失敗するテストを書く** - コードがまだ存在しないため失敗するテスト
3. **テストを実行** - 正しい理由で失敗することを確認
4. **最小限の実装を書く** - テストが通るようにする
5. **テストを実行** - テストが通ることを確認
6. **リファクタリング** - テストが通る状態を維持しながらコードを改善
7. **カバレッジを確認** - 80%未満の場合はテストを追加

## TDD サイクル

```
RED → GREEN → REFACTOR → REPEAT

RED:      失敗するテストを書く
GREEN:    テストが通る最小限のコードを書く
REFACTOR: コードを改善し、テストが通る状態を維持
REPEAT:   次の機能やシナリオへ
```

## 使用例

```
User: /tdd I need a function to calculate market liquidity score

Agent (tdd-guide):
# TDD セッション：マーケット流動性スコア計算機

## ステップ 1：インターフェースの定義 (SCAFFOLD)

```typescript
// lib/liquidity.ts
export interface MarketData {
  totalVolume: number
  bidAskSpread: number
  activeTraders: number
  lastTradeTime: Date
}

export function calculateLiquidityScore(market: MarketData): number {
  // TODO: Implementation
  throw new Error('Not implemented')
}
```

## ステップ 2：失敗するテストを書く (RED)

```typescript
// lib/liquidity.test.ts
import { calculateLiquidityScore } from './liquidity'

describe('calculateLiquidityScore', () => {
  it('should return high score for liquid market', () => {
    const market = {
      totalVolume: 100000,
      bidAskSpread: 0.01,
      activeTraders: 500,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeGreaterThan(80)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('should return low score for illiquid market', () => {
    const market = {
      totalVolume: 100,
      bidAskSpread: 0.5,
      activeTraders: 2,
      lastTradeTime: new Date(Date.now() - 86400000) // 1 day ago
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeLessThan(30)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('should handle edge case: zero volume', () => {
    const market = {
      totalVolume: 0,
      bidAskSpread: 0,
      activeTraders: 0,
      lastTradeTime: new Date()
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBe(0)
  })
})
```

## ステップ 3：テストを実行 - 失敗を確認

```bash
npm test lib/liquidity.test.ts

FAIL lib/liquidity.test.ts
  ✕ should return high score for liquid market (2 ms)
    Error: Not implemented

1 test failed, 0 passed
```

テストが想定通り失敗しました。実装の準備ができました。

## ステップ 4：最小限のコードで実装 (GREEN)

```typescript
// lib/liquidity.ts
export function calculateLiquidityScore(market: MarketData): number {
  // ゼロ取引量のエッジケースを処理
  if (market.totalVolume === 0) {
    return 0
  }

  // 各要素のスコアを計算（0-100スケール）
  const volumeScore = Math.min(market.totalVolume / 1000, 100)
  const spreadScore = Math.max(100 - (market.bidAskSpread * 1000), 0)
  const traderScore = Math.min(market.activeTraders / 10, 100)

  // 直近の取引活動ボーナス
  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = Math.max(100 - (hoursSinceLastTrade * 10), 0)

  // 加重平均
  const score = (
    volumeScore * 0.4 +
    spreadScore * 0.3 +
    traderScore * 0.2 +
    recencyScore * 0.1
  )

  return Math.min(Math.max(score, 0), 100) // 0-100にクランプ
}
```

## ステップ 5：テストを実行 - 成功を確認

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

全てのテストが通りました！

## ステップ 6：リファクタリング (IMPROVE)

```typescript
// lib/liquidity.ts - 定数とより良い可読性でリファクタリング
const WEIGHTS = {
  VOLUME: 0.4,
  SPREAD: 0.3,
  TRADERS: 0.2,
  RECENCY: 0.1,
} as const

const SCALE_FACTORS = {
  VOLUME: 1000,
  SPREAD: 1000,
  TRADERS: 10,
  RECENCY_PENALTY: 10,
} as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function calculateLiquidityScore(market: MarketData): number {
  if (market.totalVolume === 0) return 0

  const volumeScore = Math.min(market.totalVolume / SCALE_FACTORS.VOLUME, 100)
  const spreadScore = clamp(100 - (market.bidAskSpread * SCALE_FACTORS.SPREAD), 0, 100)
  const traderScore = Math.min(market.activeTraders / SCALE_FACTORS.TRADERS, 100)

  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = clamp(100 - (hoursSinceLastTrade * SCALE_FACTORS.RECENCY_PENALTY), 0, 100)

  const weightedScore =
    volumeScore * WEIGHTS.VOLUME +
    spreadScore * WEIGHTS.SPREAD +
    traderScore * WEIGHTS.TRADERS +
    recencyScore * WEIGHTS.RECENCY

  return clamp(weightedScore, 0, 100)
}
```

## ステップ 7：テストがまだ通ることを確認

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

リファクタリング完了、テストは引き続き通っています！

## ステップ 8：カバレッジを確認

```bash
npm test -- --coverage lib/liquidity.test.ts

File           | % Stmts | % Branch | % Funcs | % Lines
---------------|---------|----------|---------|--------
liquidity.ts   |   100   |   100    |   100   |   100

Coverage: 100% ✅ (Target: 80%)
```

TDD セッション完了！
```

## TDD ベストプラクティス

**すべきこと：**
- テストを実装の前に必ず書く
- テストを実行し、実装前に失敗することを確認する
- テストが通る最小限のコードを書く
- テストが通ってからのみリファクタリングする
- エッジケースやエラーシナリオを追加する
- 80%以上のカバレッジを目指す（重要なコードは100%）

**してはいけないこと：**
- テストの前に実装を書く
- 変更のたびにテストを実行しない
- 一度に大量のコードを書く
- 失敗するテストを無視する
- 実装の詳細をテストする（振る舞いをテストすべき）
- すべてをモックする（統合テストを優先する）

## 含めるべきテストの種類

**ユニットテスト**（関数レベル）：
- 正常系のシナリオ
- エッジケース（空、null、最大値）
- エラー条件
- 境界値

**統合テスト**（コンポーネントレベル）：
- API エンドポイント
- データベース操作
- 外部サービス呼び出し
- hooks を使用した React コンポーネント

**E2E テスト**（`/e2e` コマンドを使用）：
- 重要なユーザーフロー
- 複数ステップのプロセス
- フルスタック統合

## カバレッジ要件

- **80% 最低ライン** - すべてのコード
- **100% 必須** - 以下の場合：
  - 金融計算
  - 認証ロジック
  - セキュリティ関連のコード
  - コアビジネスロジック

## 重要な注意事項

**必須**：テストは実装の前に必ず書くこと。TDD サイクルは以下の通り：

1. **RED** - 失敗するテストを書く
2. **GREEN** - テストが通るように実装する
3. **REFACTOR** - コードを改善する

RED フェーズを絶対にスキップしないこと。テストの前にコードを書かないこと。

## 他のコマンドとの連携

- `/plan` を先に使用して、構築すべきものを理解する
- `/tdd` でテストと共に実装する
- `/build-and-fix` でビルドエラーが発生した場合に対応する
- `/code-review` で実装をレビューする
- `/test-coverage` でカバレッジを確認する

## 関連エージェント

このコマンドは以下にある `tdd-guide` エージェントを呼び出します：
`~/.claude/agents/tdd-guide.md`

また、以下にある `tdd-workflow` スキルを参照できます：
`~/.claude/skills/tdd-workflow/`
