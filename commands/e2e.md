---
description: Playwrightでエンドツーエンドテストを生成・実行する。テストジャーニーを作成し、テストを実行し、スクリーンショット/動画/トレースをキャプチャし、アーティファクトをアップロード。
---

# E2Eコマンド

このコマンドは**e2e-runner**エージェントを呼び出して、Playwrightを使用したエンドツーエンドテストを生成、保守、実行します。

## このコマンドの機能

1. **テストジャーニーの生成** - ユーザーフロー用のPlaywrightテストを作成
2. **E2Eテストの実行** - ブラウザ間でテストを実行
3. **アーティファクトのキャプチャ** - 失敗時にスクリーンショット、動画、トレース
4. **結果のアップロード** - HTMLレポートとJUnit XML
5. **不安定なテストの特定** - 不安定なテストを隔離

## 使用するタイミング

`/e2e`を使用する場合:

- 重要なユーザージャーニーのテスト（ログイン、取引、支払い）
- マルチステップフローがエンドツーエンドで機能することを検証
- UI操作とナビゲーションのテスト
- フロントエンドとバックエンド間の統合を検証
- 本番デプロイの準備

## 動作方法

e2e-runnerエージェントは:

1. ユーザーフローを**分析**し、テストシナリオを特定
2. Page Object Modelパターンを使用して**Playwrightテストを生成**
3. 複数のブラウザ（Chrome、Firefox、Safari）で**テストを実行**
4. スクリーンショット、動画、トレースで**失敗をキャプチャ**
5. 結果とアーティファクトを含む**レポートを生成**
6. **不安定なテストを特定**し、修正を推奨

## 使用例

```
ユーザー: /e2e マーケット検索と閲覧フローをテスト

エージェント（e2e-runner）:

# E2Eテスト生成: マーケット検索と閲覧フロー

## 特定されたテストシナリオ

**ユーザージャーニー:** マーケット検索 → 結果表示 → マーケットクリック → 詳細表示

**テストカバレッジ:**
1. マーケットページに移動
2. セマンティック検索を実行
3. 検索結果を確認
4. 最初の結果をクリック
5. マーケット詳細ページがロードされることを確認
6. チャートがレンダリングされることを確認

## 生成されたテストコード

// tests/e2e/markets/search-and-view.spec.ts
import { test, expect } from '@playwright/test'
import { MarketsPage } from '../../pages/MarketsPage'
import { MarketDetailsPage } from '../../pages/MarketDetailsPage'

test.describe('マーケット検索と閲覧フロー', () => {
  test('ユーザーがマーケットを検索して詳細を閲覧できる', async ({ page }) => {
    // 1. マーケットページに移動
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // ページがロードされたことを確認
    await expect(page).toHaveTitle(/Markets/)
    await expect(page.locator('h1')).toContainText('Markets')

    // 2. セマンティック検索を実行
    await marketsPage.searchMarkets('election')

    // APIレスポンスを待機
    await page.waitForResponse(resp =>
      resp.url().includes('/api/markets/search') &&
      resp.status() === 200
    )

    // 3. 検索結果を確認
    const marketCards = marketsPage.marketCards
    await expect(marketCards.first()).toBeVisible()

    // 4. 最初の結果をクリック
    await marketCards.first().click()

    // 5. マーケット詳細ページがロードされることを確認
    await expect(page).toHaveURL(/\/markets\/[a-z0-9-]+/)

    // 6. チャートがレンダリングされることを確認
    const detailsPage = new MarketDetailsPage(page)
    await expect(detailsPage.priceChart).toBeVisible()
  })
})

## テストの実行

# 生成されたテストを実行
npx playwright test tests/e2e/markets/search-and-view.spec.ts

3件のテストを実行中、3ワーカー使用

✓ [chromium] › search-and-view.spec.ts:5:3 › ユーザーがマーケットを検索して詳細を閲覧できる (4.2s)
✓ [chromium] › search-and-view.spec.ts:52:3 › 結果がない検索で空状態を表示 (1.8s)
✓ [chromium] › search-and-view.spec.ts:67:3 › 検索をクリアして全マーケットを再表示 (2.9s)

3件パス (9.1s)

✅ E2Eテストスイートがci/cd統合の準備完了！
```

## テストアーティファクト

テスト実行時に以下のアーティファクトがキャプチャされます:

**すべてのテストで:**

- タイムラインと結果を含むHTMLレポート
- CI統合用のJUnit XML

**失敗時のみ:**

- 失敗状態のスクリーンショット
- テストの動画録画
- デバッグ用トレースファイル（ステップバイステップの再生）
- ネットワークログ
- コンソールログ

## アーティファクトの表示

```bash
# ブラウザでHTMLレポートを表示
npx playwright show-report

# 特定のトレースファイルを表示
npx playwright show-trace artifacts/trace-abc123.zip

# スクリーンショットはartifacts/ディレクトリに保存
open artifacts/search-results.png
```

## 不安定なテストの検出

テストが断続的に失敗する場合:

```
⚠️ 不安定なテスト検出: tests/e2e/markets/trade.spec.ts

テストは7/10回パス（70%パス率）

一般的な失敗: "Timeout waiting for element '[data-testid="confirm-btn"]'"

推奨される修正:
1. 明示的な待機を追加: await page.waitForSelector('[data-testid="confirm-btn"]')
2. タイムアウトを増加: { timeout: 10000 }
3. コンポーネントの競合状態をチェック
4. 要素がアニメーションで隠れていないか確認

隔離の推奨: 修正されるまでtest.fixme()としてマーク
```

## ブラウザ設定

テストはデフォルトで複数のブラウザで実行:

- ✅ Chromium（デスクトップChrome）
- ✅ Firefox（デスクトップ）
- ✅ WebKit（デスクトップSafari）
- ✅ モバイルChrome（オプション）

`playwright.config.ts`で設定してブラウザを調整します。

## CI/CD統合

CIパイプラインに追加:

```yaml
# .github/workflows/e2e.yml
- name: Playwrightをインストール
  run: npx playwright install --with-deps

- name: E2Eテストを実行
  run: npx playwright test

- name: アーティファクトをアップロード
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 重要な注意事項

**重要:**

- 実際のお金が関わるE2Eテストはテストネット/ステージングのみで実行する必要がある
- 本番環境に対して取引テストを実行しない
- 金融テストには`test.skip(process.env.NODE_ENV === 'production')`を設定
- 少額のテスト資金のみを持つテストウォレットを使用

## ベストプラクティス

**すべきこと:**

- ✅ 保守性のためにPage Object Modelを使用
- ✅ セレクタにdata-testid属性を使用
- ✅ 任意のタイムアウトではなくAPIレスポンスを待機
- ✅ 重要なユーザージャーニーをエンドツーエンドでテスト
- ✅ メインブランチへのマージ前にテストを実行
- ✅ テストが失敗した際はアーティファクトをレビュー

**してはいけないこと:**

- ❌ 脆いセレクタを使用（CSSクラスは変わる可能性がある）
- ❌ 実装の詳細をテスト
- ❌ 本番に対してテストを実行
- ❌ 不安定なテストを無視
- ❌ 失敗時のアーティファクトレビューをスキップ
- ❌ すべてのエッジケースをE2Eでテスト（ユニットテストを使用）

## クイックコマンド

```bash
# すべてのE2Eテストを実行
npx playwright test

# 特定のテストファイルを実行
npx playwright test tests/e2e/markets/search.spec.ts

# ヘッドモードで実行（ブラウザを表示）
npx playwright test --headed

# テストをデバッグ
npx playwright test --debug

# テストコードを生成
npx playwright codegen http://localhost:3000

# レポートを表示
npx playwright show-report
```

## 関連エージェント

このコマンドは以下の`e2e-runner`エージェントを呼び出します:
`~/.claude/agents/e2e-runner.md`
