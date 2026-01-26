---
description: TDDワークフローを強制します。インターフェースをスキャフォールドし、最初にテストを生成し、その後テストを通過する最小限のコードを実装します。80%以上のカバレッジを確保します。
---

# TDD Command

このcommandは、TDD方法論を強制する**tdd-guide** agentを呼び出します。

## このCommandの機能

1. **インターフェースのスキャフォールド** - 最初に型/インターフェースを定義
2. **テストを先に生成** - 失敗するテストを書く（RED）
3. **最小限のコードを実装** - テストを通過するのに必要な最小限のコードを書く（GREEN）
4. **リファクタリング** - テストをグリーンに保ちながらコードを改善（REFACTOR）
5. **カバレッジを検証** - 80%以上のテストカバレッジを確保

## 使用するタイミング

以下の場合に`/tdd`を使用してください：
- 新機能を実装するとき
- 新しい関数/コンポーネントを追加するとき
- バグを修正するとき（まずバグを再現するテストを書く）
- 既存のコードをリファクタリングするとき
- 重要なビジネスロジックを構築するとき

## 動作の仕組み

tdd-guide agentは以下を行います：

1. 入力/出力の**インターフェースを定義**
2. **失敗するテストを書く**（コードがまだ存在しないため）
3. **テストを実行**し、正しい理由で失敗することを確認
4. テストを通過する**最小限の実装を書く**
5. **テストを実行**し、通過することを確認
6. テストをグリーンに保ちながら**コードをリファクタリング**
7. **カバレッジをチェック**し、80%未満の場合はテストを追加

## TDDサイクル

```
RED → GREEN → REFACTOR → REPEAT

RED:      失敗するテストを書く
GREEN:    テストを通過する最小限のコードを書く
REFACTOR: テストを通過させながらコードを改善
REPEAT:   次の機能/シナリオへ
```

## 使用例

```
User: /tdd マーケットの流動性スコアを計算する関数が必要

Agent (tdd-guide):
# TDDセッション: マーケット流動性スコア計算機

## ステップ1: インターフェースの定義（SCAFFOLD）

```typescript
// lib/liquidity.ts
export interface MarketData {
  totalVolume: number
  bidAskSpread: number
  activeTraders: number
  lastTradeTime: Date
}

export function calculateLiquidityScore(market: MarketData): number {
  // TODO: 実装
  throw new Error('Not implemented')
}
```

## ステップ2: 失敗するテストを書く（RED）

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
      lastTradeTime: new Date(Date.now() - 86400000) // 1日前
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

## ステップ3: テストを実行 - 失敗を確認

```bash
npm test lib/liquidity.test.ts

FAIL lib/liquidity.test.ts
  ✕ should return high score for liquid market (2 ms)
    Error: Not implemented

1 test failed, 0 passed
```

✅ 予想通りテストが失敗。実装の準備完了。

## ステップ4: 最小限のコードを実装（GREEN）

```typescript
// lib/liquidity.ts
export function calculateLiquidityScore(market: MarketData): number {
  // ボリュームゼロのエッジケースを処理
  if (market.totalVolume === 0) {
    return 0
  }

  // コンポーネントスコアを計算（0-100スケール）
  const volumeScore = Math.min(market.totalVolume / 1000, 100)
  const spreadScore = Math.max(100 - (market.bidAskSpread * 1000), 0)
  const traderScore = Math.min(market.activeTraders / 10, 100)

  // 最近の取引ボーナス
  const hoursSinceLastTrade = (Date.now() - market.lastTradeTime.getTime()) / (1000 * 60 * 60)
  const recencyScore = Math.max(100 - (hoursSinceLastTrade * 10), 0)

  // 加重平均
  const score = (
    volumeScore * 0.4 +
    spreadScore * 0.3 +
    traderScore * 0.2 +
    recencyScore * 0.1
  )

  return Math.min(Math.max(score, 0), 100) // 0-100に制限
}
```

## ステップ5: テストを実行 - 通過を確認

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

✅ すべてのテストが通過！

## ステップ6: リファクタリング（IMPROVE）

```typescript
// lib/liquidity.ts - 定数と可読性を改善してリファクタリング
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

## ステップ7: テストがまだ通過することを確認

```bash
npm test lib/liquidity.test.ts

PASS lib/liquidity.test.ts
  ✓ should return high score for liquid market (3 ms)
  ✓ should return low score for illiquid market (2 ms)
  ✓ should handle edge case: zero volume (1 ms)

3 tests passed
```

✅ リファクタリング完了、テストは引き続き通過！

## ステップ8: カバレッジを確認

```bash
npm test -- --coverage lib/liquidity.test.ts

File           | % Stmts | % Branch | % Funcs | % Lines
---------------|---------|----------|---------|--------
liquidity.ts   |   100   |   100    |   100   |   100

Coverage: 100% ✅ (目標: 80%)
```

✅ TDDセッション完了！
```

## TDDベストプラクティス

**すべきこと:**
- ✅ 実装の前にまずテストを書く
- ✅ 実装前にテストを実行して失敗を確認
- ✅ テストを通過する最小限のコードを書く
- ✅ テストがグリーンになってからリファクタリング
- ✅ エッジケースとエラーシナリオを追加
- ✅ 80%以上のカバレッジを目指す（重要なコードは100%）

**すべきでないこと:**
- ❌ テストの前に実装を書く
- ❌ 各変更後のテスト実行をスキップ
- ❌ 一度に大量のコードを書く
- ❌ 失敗するテストを無視
- ❌ 実装の詳細をテスト（振る舞いをテストする）
- ❌ すべてをモック（統合テストを優先）

## 含めるべきテストの種類

**ユニットテスト**（関数レベル）:
- ハッピーパスシナリオ
- エッジケース（空、null、最大値）
- エラー条件
- 境界値

**統合テスト**（コンポーネントレベル）:
- APIエンドポイント
- データベース操作
- 外部サービス呼び出し
- hooksを持つReactコンポーネント

**E2Eテスト**（`/e2e` commandを使用）:
- 重要なユーザーフロー
- 複数ステップのプロセス
- フルスタック統合

## カバレッジ要件

- すべてのコードで**最低80%**
- 以下には**100%必須**：
  - 財務計算
  - 認証ロジック
  - セキュリティ重要コード
  - コアビジネスロジック

## 重要な注意事項

**必須**: テストは実装の前に書かなければなりません。TDDサイクルは：

1. **RED** - 失敗するテストを書く
2. **GREEN** - 通過するように実装
3. **REFACTOR** - コードを改善

REDフェーズを決してスキップしないこと。テストの前にコードを書かないこと。

## 他のCommandとの連携

- まず`/plan`で何を構築するか理解
- `/tdd`でテストと共に実装
- ビルドエラーが発生した場合は`/build-and-fix`
- 実装のレビューには`/code-review`
- カバレッジの確認には`/test-coverage`

## 関連Agent

このcommandは以下にある`tdd-guide` agentを呼び出します：
`~/.claude/agents/tdd-guide.md`

また、以下の`tdd-workflow` skillを参照できます：
`~/.claude/skills/tdd-workflow/`
