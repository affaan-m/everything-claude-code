---
description: テスト駆動開発ワークフローを強制する。インターフェースをスキャフォールドし、まずテストを生成し、それからパスするための最小限のコードを実装。80%以上のカバレッジを確保。
---

# TDDコマンド

このコマンドは**tdd-guide**エージェントを呼び出して、テスト駆動開発の方法論を強制します。

## このコマンドの機能

1. **インターフェースをスキャフォールド** - まず型/インターフェースを定義
2. **まずテストを生成** - 失敗するテストを書く（RED）
3. **最小限のコードを実装** - パスするのに十分なだけ書く（GREEN）
4. **リファクタリング** - テストをグリーンに保ちながらコードを改善（REFACTOR）
5. **カバレッジを確認** - 80%以上のテストカバレッジを確保

## 使用するタイミング

`/tdd`を使用する場合:

- 新機能を実装する
- 新しい関数/コンポーネントを追加する
- バグを修正する（まずバグを再現するテストを書く）
- 既存のコードをリファクタリングする
- 重要なビジネスロジックを構築する

## 動作方法

tdd-guideエージェントは:

1. 入力/出力の**インターフェースを定義**
2. **失敗するテストを書く**（コードがまだ存在しないため）
3. テストを**実行**し、正しい理由で失敗することを確認
4. テストをパスさせるための**最小限の実装を書く**
5. テストを**実行**し、パスすることを確認
6. テストをグリーンに保ちながら**コードをリファクタリング**
7. **カバレッジをチェック**し、80%未満ならテストを追加

## TDDサイクル

```
RED → GREEN → REFACTOR → 繰り返し

RED: 失敗するテストを書く
GREEN: パスするための最小限のコードを書く
REFACTOR: コードを改善、テストはパスを維持
繰り返し: 次の機能/シナリオ
```

## 使用例

```
ユーザー: /tdd マーケット流動性スコアを計算する関数が必要

エージェント（tdd-guide）:

# TDDセッション: マーケット流動性スコア計算機

## ステップ1: インターフェースの定義（スキャフォールド）

// lib/liquidity.ts
export interface MarketData {
  totalVolume: number
  bidAskSpread: number
  activeTraders: number
  lastTradeTime: Date
}

export function calculateLiquidityScore(market: MarketData): number {
  // TODO: 実装
  throw new Error('未実装')
}

## ステップ2: 失敗するテストを書く（RED）

// lib/liquidity.test.ts
import { calculateLiquidityScore } from './liquidity'

describe('calculateLiquidityScore', () => {
  it('流動性の高いマーケットに対して高いスコアを返す', () => {
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

  it('流動性の低いマーケットに対して低いスコアを返す', () => {
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

  it('エッジケースを処理: ゼロボリューム', () => {
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

## ステップ3: テストを実行 - 失敗を確認

npm test lib/liquidity.test.ts

FAIL  lib/liquidity.test.ts
  ✕ 流動性の高いマーケットに対して高いスコアを返す (2 ms)
    Error: 未実装

1テスト失敗、0パス

✅ テストは期待通り失敗。実装の準備完了。

## ステップ4: 最小限のコードを実装（GREEN）

// lib/liquidity.ts
export function calculateLiquidityScore(market: MarketData): number {
  // ゼロボリュームのエッジケースを処理
  if (market.totalVolume === 0) {
    return 0
  }

  // コンポーネントスコアを計算（0-100スケール）
  const volumeScore = Math.min(market.totalVolume / 1000, 100)
  const spreadScore = Math.max(100 - (market.bidAskSpread * 1000), 0)
  const traderScore = Math.min(market.activeTraders / 10, 100)

  // 最近のアクティビティボーナス
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

## ステップ5: テストを実行 - パスを確認

npm test lib/liquidity.test.ts

PASS  lib/liquidity.test.ts
  ✓ 流動性の高いマーケットに対して高いスコアを返す (3 ms)
  ✓ 流動性の低いマーケットに対して低いスコアを返す (2 ms)
  ✓ エッジケースを処理: ゼロボリューム (1 ms)

3テストパス

✅ すべてのテストがパス！

## ステップ6: リファクタリング（改善）

定数とより良い可読性でリファクタリング...

## ステップ7: テストがまだパスすることを確認

npm test lib/liquidity.test.ts

PASS  lib/liquidity.test.ts
  ✓ すべてのテストがパス

✅ リファクタリング完了、テストはまだパス！

## ステップ8: カバレッジをチェック

npm test -- --coverage lib/liquidity.test.ts

File           | % Stmts | % Branch | % Funcs | % Lines
---------------|---------|----------|---------|--------
liquidity.ts   |   100   |   100    |   100   |   100

カバレッジ: 100% ✅（目標: 80%）

✅ TDDセッション完了！
```

## TDDベストプラクティス

**すべきこと:**

- ✅ 実装の前にまずテストを書く
- ✅ 実装前にテストを実行して失敗することを確認
- ✅ テストをパスさせるための最小限のコードを書く
- ✅ テストがグリーンになってからのみリファクタリング
- ✅ エッジケースとエラーシナリオを追加
- ✅ 80%以上のカバレッジを目指す（重要なコードは100%）

**してはいけないこと:**

- ❌ テストの前に実装を書く
- ❌ 各変更後のテスト実行をスキップ
- ❌ 一度に多くのコードを書く
- ❌ 失敗するテストを無視
- ❌ 実装の詳細をテスト（動作をテスト）
- ❌ すべてをモック（統合テストを優先）

## 含めるべきテストタイプ

**ユニットテスト**（関数レベル）:

- ハッピーパスシナリオ
- エッジケース（空、null、最大値）
- エラー条件
- 境界値

**統合テスト**（コンポーネントレベル）:

- APIエンドポイント
- データベース操作
- 外部サービス呼び出し
- フック付きReactコンポーネント

**E2Eテスト**（`/e2e`コマンドを使用）:

- 重要なユーザーフロー
- マルチステッププロセス
- フルスタック統合

## カバレッジ要件

- すべてのコードに**最低80%**
- 以下には**100%必須**:
  - 金融計算
  - 認証ロジック
  - セキュリティ重要コード
  - コアビジネスロジック

## 重要な注意事項

**必須**: テストは実装の前に書く必要があります。TDDサイクルは:

1. **RED** - 失敗するテストを書く
2. **GREEN** - パスするよう実装
3. **REFACTOR** - コードを改善

REDフェーズをスキップしない。テストの前にコードを書かない。

## 他のコマンドとの統合

- まず`/plan`を使用して何を構築するか理解
- `/tdd`を使用してテスト付きで実装
- ビルドエラーが発生したら`/build-and-fix`を使用
- 実装をレビューするには`/code-review`を使用
- カバレッジを確認するには`/test-coverage`を使用

## 関連エージェント

このコマンドは以下の`tdd-guide`エージェントを呼び出します:
`~/.claude/agents/tdd-guide.md`
