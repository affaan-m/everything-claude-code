---
description: Playwrightを使用してE2Eテストを生成し実行します。テストジャーニーを作成し、テストを実行し、スクリーンショット/動画/トレースをキャプチャし、成果物をアップロードします。
---

# E2E Command

このcommandは、Playwrightを使用してE2Eテストを生成、保守、実行する**e2e-runner** agentを呼び出します。

## このCommandの機能

1. **テストジャーニーの生成** - ユーザーフロー用のPlaywrightテストを作成
2. **E2Eテストの実行** - 複数のブラウザでテストを実行
3. **成果物のキャプチャ** - 失敗時のスクリーンショット、動画、トレース
4. **結果のアップロード** - HTMLレポートとJUnit XML
5. **フレーキーテストの特定** - 不安定なテストを隔離

## 使用するタイミング

以下の場合に`/e2e`を使用してください：
- 重要なユーザージャーニーをテストするとき（ログイン、取引、支払い）
- 複数ステップのフローがエンドツーエンドで機能することを確認するとき
- UIインタラクションとナビゲーションをテストするとき
- フロントエンドとバックエンド間の統合を検証するとき
- 本番デプロイの準備をするとき

## 動作の仕組み

e2e-runner agentは以下を行います：

1. **ユーザーフローを分析**し、テストシナリオを特定
2. Page Object Modelパターンを使用して**Playwrightテストを生成**
3. 複数のブラウザで**テストを実行**（Chrome、Firefox、Safari）
4. スクリーンショット、動画、トレースで**失敗をキャプチャ**
5. 結果と成果物を含む**レポートを生成**
6. **フレーキーテストを特定**し、修正を推奨

## 使用例

```
User: /e2e マーケット検索と表示フローをテスト

Agent (e2e-runner):
# E2Eテスト生成: マーケット検索と表示フロー

## 特定されたテストシナリオ

**ユーザージャーニー:** マーケット検索 → 結果表示 → マーケットクリック → 詳細表示

**テストカバレッジ:**
1. マーケットページに移動
2. セマンティック検索を実行
3. 検索結果を確認
4. 最初の結果をクリック
5. マーケット詳細ページが読み込まれることを確認
6. チャートがレンダリングされることを確認

## 生成されたテストコード

```typescript
// tests/e2e/markets/search-and-view.spec.ts
import { test, expect } from '@playwright/test'
import { MarketsPage } from '../../pages/MarketsPage'
import { MarketDetailsPage } from '../../pages/MarketDetailsPage'

test.describe('Market Search and View Flow', () => {
  test('user can search markets and view details', async ({ page }) => {
    // 1. マーケットページに移動
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // ページが読み込まれたことを確認
    await expect(page).toHaveTitle(/Markets/)
    await expect(page.locator('h1')).toContainText('Markets')

    // 2. セマンティック検索を実行
    await marketsPage.searchMarkets('election')

    // APIレスポンスを待機
    await page.waitForResponse(resp =>
      resp.url().includes('/api/markets/search') && resp.status() === 200
    )

    // 3. 検索結果を確認
    const marketCards = marketsPage.marketCards
    await expect(marketCards.first()).toBeVisible()
    const resultCount = await marketCards.count()
    expect(resultCount).toBeGreaterThan(0)

    // 検索結果のスクリーンショットを撮影
    await page.screenshot({ path: 'artifacts/search-results.png' })

    // 4. 最初の結果をクリック
    const firstMarketTitle = await marketCards.first().textContent()
    await marketCards.first().click()

    // 5. マーケット詳細ページが読み込まれることを確認
    await expect(page).toHaveURL(/\/markets\/[a-z0-9-]+/)

    const detailsPage = new MarketDetailsPage(page)
    await expect(detailsPage.marketName).toBeVisible()
    await expect(detailsPage.marketDescription).toBeVisible()

    // 6. チャートがレンダリングされることを確認
    await expect(detailsPage.priceChart).toBeVisible()

    // マーケット名が一致することを確認
    const detailsTitle = await detailsPage.marketName.textContent()
    expect(detailsTitle?.toLowerCase()).toContain(
      firstMarketTitle?.toLowerCase().substring(0, 20) || ''
    )

    // マーケット詳細のスクリーンショットを撮影
    await page.screenshot({ path: 'artifacts/market-details.png' })
  })

  test('search with no results shows empty state', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // 存在しないマーケットを検索
    await marketsPage.searchMarkets('xyznonexistentmarket123456')

    // 空の状態を確認
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="no-results"]')).toContainText(
      /no.*results|no.*markets/i
    )

    const marketCount = await marketsPage.marketCards.count()
    expect(marketCount).toBe(0)
  })

  test('can clear search and see all markets again', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // 初期マーケット数
    const initialCount = await marketsPage.marketCards.count()

    // 検索を実行
    await marketsPage.searchMarkets('trump')
    await page.waitForLoadState('networkidle')

    // フィルタされた結果を確認
    const filteredCount = await marketsPage.marketCards.count()
    expect(filteredCount).toBeLessThan(initialCount)

    // 検索をクリア
    await marketsPage.searchInput.clear()
    await page.waitForLoadState('networkidle')

    // すべてのマーケットが再表示されることを確認
    const finalCount = await marketsPage.marketCards.count()
    expect(finalCount).toBe(initialCount)
  })
})
```

## テストの実行

```bash
# 生成されたテストを実行
npx playwright test tests/e2e/markets/search-and-view.spec.ts

Running 3 tests using 3 workers

  ✓  [chromium] › search-and-view.spec.ts:5:3 › user can search markets and view details (4.2s)
  ✓  [chromium] › search-and-view.spec.ts:52:3 › search with no results shows empty state (1.8s)
  ✓  [chromium] › search-and-view.spec.ts:67:3 › can clear search and see all markets again (2.9s)

  3 passed (9.1s)

生成された成果物:
- artifacts/search-results.png
- artifacts/market-details.png
- playwright-report/index.html
```

## テストレポート

```
╔══════════════════════════════════════════════════════════════╗
║                    E2Eテスト結果                              ║
╠══════════════════════════════════════════════════════════════╣
║ ステータス:     ✅ すべてのテスト通過                          ║
║ 合計:          3テスト                                       ║
║ 通過:          3 (100%)                                      ║
║ 失敗:          0                                             ║
║ フレーキー:    0                                             ║
║ 所要時間:      9.1秒                                         ║
╚══════════════════════════════════════════════════════════════╝

成果物:
📸 スクリーンショット: 2ファイル
📹 動画: 0ファイル（失敗時のみ）
🔍 トレース: 0ファイル（失敗時のみ）
📊 HTMLレポート: playwright-report/index.html

レポートを表示: npx playwright show-report
```

✅ E2Eテストスイートがci/cd統合の準備完了！
```

## テスト成果物

テスト実行時に以下の成果物がキャプチャされます：

**すべてのテストで:**
- タイムラインと結果を含むHTMLレポート
- CI統合用のJUnit XML

**失敗時のみ:**
- 失敗状態のスクリーンショット
- テストの動画記録
- デバッグ用トレースファイル（ステップバイステップのリプレイ）
- ネットワークログ
- コンソールログ

## 成果物の表示

```bash
# ブラウザでHTMLレポートを表示
npx playwright show-report

# 特定のトレースファイルを表示
npx playwright show-trace artifacts/trace-abc123.zip

# スクリーンショットはartifacts/ディレクトリに保存
open artifacts/search-results.png
```

## フレーキーテストの検出

テストが断続的に失敗する場合：

```
⚠️  フレーキーテストを検出: tests/e2e/markets/trade.spec.ts

テストは10回中7回通過（70%の通過率）

一般的な失敗:
"Timeout waiting for element '[data-testid="confirm-btn"]'"

推奨される修正:
1. 明示的な待機を追加: await page.waitForSelector('[data-testid="confirm-btn"]')
2. タイムアウトを増加: { timeout: 10000 }
3. コンポーネントのレースコンディションを確認
4. 要素がアニメーションで非表示になっていないか確認

隔離の推奨: 修正するまでtest.fixme()としてマーク
```

## ブラウザ設定

テストはデフォルトで複数のブラウザで実行されます：
- ✅ Chromium（デスクトップChrome）
- ✅ Firefox（デスクトップ）
- ✅ WebKit（デスクトップSafari）
- ✅ モバイルChrome（オプション）

ブラウザを調整するには`playwright.config.ts`で設定してください。

## CI/CD統合

CIパイプラインに追加：

```yaml
# .github/workflows/e2e.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npx playwright test

- name: Upload artifacts
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## PMX固有の重要フロー

PMXでは、これらのE2Eテストを優先してください：

**🔴 重要（常に通過する必要がある）:**
1. ユーザーがウォレットを接続できる
2. ユーザーがマーケットを閲覧できる
3. ユーザーがマーケットを検索できる（セマンティック検索）
4. ユーザーがマーケット詳細を表示できる
5. ユーザーが取引を実行できる（テスト資金使用）
6. マーケットが正しく解決される
7. ユーザーが資金を引き出せる

**🟡 重要:**
1. マーケット作成フロー
2. ユーザープロファイル更新
3. リアルタイム価格更新
4. チャートレンダリング
5. マーケットのフィルタとソート
6. モバイルレスポンシブレイアウト

## ベストプラクティス

**すべきこと:**
- ✅ 保守性のためPage Object Modelを使用
- ✅ セレクターにdata-testid属性を使用
- ✅ 任意のタイムアウトではなくAPIレスポンスを待機
- ✅ 重要なユーザージャーニーをエンドツーエンドでテスト
- ✅ mainにマージする前にテストを実行
- ✅ テストが失敗したら成果物をレビュー

**すべきでないこと:**
- ❌ 脆いセレクターを使用（CSSクラスは変更される可能性がある）
- ❌ 実装の詳細をテスト
- ❌ 本番環境に対してテストを実行
- ❌ フレーキーテストを無視
- ❌ 失敗時の成果物レビューをスキップ
- ❌ すべてのエッジケースをE2Eでテスト（ユニットテストを使用）

## 重要な注意事項

**PMXにおいて重要:**
- 実際のお金を扱うE2Eテストはテストネット/ステージングのみで実行すること
- 取引テストを本番環境に対して実行しないこと
- 財務テストには`test.skip(process.env.NODE_ENV === 'production')`を設定
- 少額のテスト資金のみを持つテストウォレットを使用

## 他のCommandとの連携

- `/plan`でテストすべき重要なジャーニーを特定
- `/tdd`でユニットテスト（より高速で詳細）
- `/e2e`で統合テストとユーザージャーニーテスト
- `/code-review`でテスト品質を検証

## 関連Agent

このcommandは以下にある`e2e-runner` agentを呼び出します：
`~/.claude/agents/e2e-runner.md`

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
