---
description: Playwright を使用してエンドツーエンドテストを生成・実行。テストジャーニーの作成、テスト実行、スクリーンショット/動画/トレースのキャプチャ、アーティファクトのアップロードを行う。
---

# E2E コマンド

このコマンドは **e2e-runner** エージェントを呼び出し、Playwright を使用したエンドツーエンドテストの生成、メンテナンス、実行を行います。

## このコマンドの機能

1. **テストジャーニーの生成** - ユーザーフロー用の Playwright テストを作成
2. **E2E テストの実行** - 複数のブラウザでテストを実行
3. **アーティファクトのキャプチャ** - 失敗時にスクリーンショット、動画、トレースを記録
4. **結果のアップロード** - HTML レポートと JUnit XML を生成
5. **不安定なテストの検出** - 不安定なテストを隔離する

## 使用するタイミング

`/e2e` を使用する場面：
- 重要なユーザージャーニーのテスト（ログイン、取引、決済）
- 複数ステップのフローがエンドツーエンドで動作することの検証
- UI インタラクションとナビゲーションのテスト
- フロントエンドとバックエンドの統合検証
- 本番デプロイの準備

## 動作の仕組み

e2e-runner エージェントは以下を行います：

1. **ユーザーフローを分析** - テストシナリオを特定する
2. **Playwright テストを生成** - Page Object Model パターンを使用
3. **テストを実行** - 複数のブラウザで実行（Chrome、Firefox、Safari）
4. **失敗をキャプチャ** - スクリーンショット、動画、トレースで記録
5. **レポートを生成** - 結果とアーティファクトを含むレポート
6. **不安定なテストを特定** - 修正を推奨する

## 使用例

```
User: /e2e Test the market search and view flow

Agent (e2e-runner):
# E2E テスト生成：マーケット検索・閲覧フロー

## 特定されたテストシナリオ

**ユーザージャーニー：** マーケット検索 → 結果表示 → マーケットをクリック → 詳細を表示

**テストカバレッジ：**
1. マーケットページに移動
2. セマンティック検索を実行
3. 検索結果を確認
4. 最初の結果をクリック
5. マーケット詳細ページが読み込まれることを確認
6. チャートが描画されることを確認

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

    // API レスポンスを待つ
    await page.waitForResponse(resp =>
      resp.url().includes('/api/markets/search') && resp.status() === 200
    )

    // 3. 検索結果を確認
    const marketCards = marketsPage.marketCards
    await expect(marketCards.first()).toBeVisible()
    const resultCount = await marketCards.count()
    expect(resultCount).toBeGreaterThan(0)

    // 検索結果のスクリーンショットを取得
    await page.screenshot({ path: 'artifacts/search-results.png' })

    // 4. 最初の結果をクリック
    const firstMarketTitle = await marketCards.first().textContent()
    await marketCards.first().click()

    // 5. マーケット詳細ページが読み込まれたことを確認
    await expect(page).toHaveURL(/\/markets\/[a-z0-9-]+/)

    const detailsPage = new MarketDetailsPage(page)
    await expect(detailsPage.marketName).toBeVisible()
    await expect(detailsPage.marketDescription).toBeVisible()

    // 6. チャートが描画されたことを確認
    await expect(detailsPage.priceChart).toBeVisible()

    // マーケット名が一致することを確認
    const detailsTitle = await detailsPage.marketName.textContent()
    expect(detailsTitle?.toLowerCase()).toContain(
      firstMarketTitle?.toLowerCase().substring(0, 20) || ''
    )

    // マーケット詳細のスクリーンショットを取得
    await page.screenshot({ path: 'artifacts/market-details.png' })
  })

  test('search with no results shows empty state', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // 存在しないマーケットを検索
    await marketsPage.searchMarkets('xyznonexistentmarket123456')

    // 空の状態が表示されることを確認
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

    // 初期のマーケット数
    const initialCount = await marketsPage.marketCards.count()

    // 検索を実行
    await marketsPage.searchMarkets('trump')
    await page.waitForLoadState('networkidle')

    // フィルタリング結果を確認
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

アーティファクト生成：
- artifacts/search-results.png
- artifacts/market-details.png
- playwright-report/index.html
```

## テストレポート

```
╔══════════════════════════════════════════════════════════════╗
║                    E2E テスト結果                             ║
╠══════════════════════════════════════════════════════════════╣
║ ステータス：   全テスト通過                                     ║
║ 合計：        3 テスト                                        ║
║ 成功：        3 (100%)                                       ║
║ 失敗：        0                                              ║
║ 不安定：      0                                              ║
║ 所要時間：    9.1秒                                           ║
╚══════════════════════════════════════════════════════════════╝

アーティファクト：
スクリーンショット：2 ファイル
動画：0 ファイル（失敗時のみ）
トレース：0 ファイル（失敗時のみ）
HTML レポート：playwright-report/index.html

レポートを表示：npx playwright show-report
```

E2E テストスイートが CI/CD 統合の準備完了！
```

## テストアーティファクト

テスト実行時に以下のアーティファクトがキャプチャされます：

**全テスト共通：**
- タイムラインと結果を含む HTML レポート
- CI 統合用の JUnit XML

**失敗時のみ：**
- 失敗状態のスクリーンショット
- テストの動画記録
- デバッグ用トレースファイル（ステップごとのリプレイ）
- ネットワークログ
- コンソールログ

## アーティファクトの確認

```bash
# ブラウザで HTML レポートを表示
npx playwright show-report

# 特定のトレースファイルを表示
npx playwright show-trace artifacts/trace-abc123.zip

# スクリーンショットは artifacts/ ディレクトリに保存
open artifacts/search-results.png
```

## 不安定なテストの検出

テストが断続的に失敗する場合：

```
⚠️  不安定なテスト検出：tests/e2e/markets/trade.spec.ts

テスト通過率：7/10回（70%）

よくある失敗原因：
"Timeout waiting for element '[data-testid="confirm-btn"]'"

推奨される修正：
1. 明示的な待機を追加：await page.waitForSelector('[data-testid="confirm-btn"]')
2. タイムアウトを延長：{ timeout: 10000 }
3. コンポーネントの競合状態を確認
4. アニメーションによる要素の非表示を確認

隔離の推奨：修正されるまで test.fixme() としてマークする
```

## ブラウザ設定

テストはデフォルトで複数のブラウザで実行されます：
- Chromium（デスクトップ Chrome）
- Firefox（デスクトップ）
- WebKit（デスクトップ Safari）
- Mobile Chrome（オプション）

ブラウザの調整は `playwright.config.ts` で設定します。

## CI/CD 統合

CI パイプラインに追加：

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

## PMX 固有の重要フロー

PMX では以下の E2E テストを優先します：

**最重要（常に通過が必須）：**
1. ユーザーがウォレットを接続できる
2. ユーザーがマーケットを閲覧できる
3. ユーザーがマーケットを検索できる（セマンティック検索）
4. ユーザーがマーケット詳細を閲覧できる
5. ユーザーが取引を実行できる（テスト資金で）
6. マーケットが正しく解決される
7. ユーザーが資金を引き出せる

**重要：**
1. マーケット作成フロー
2. ユーザープロフィールの更新
3. リアルタイム価格更新
4. チャートの描画
5. マーケットのフィルターとソート
6. モバイルレスポンシブレイアウト

## ベストプラクティス

**すべきこと：**
- メンテナンス性のため Page Object Model を使用する
- セレクターには data-testid 属性を使用する
- 任意のタイムアウトではなく API レスポンスを待つ
- 重要なユーザージャーニーをエンドツーエンドでテストする
- main へのマージ前にテストを実行する
- テスト失敗時にアーティファクトを確認する

**してはいけないこと：**
- 脆いセレクターを使用する（CSS クラスは変更される可能性がある）
- 実装の詳細をテストする
- 本番環境に対してテストを実行する
- 不安定なテストを無視する
- 失敗時のアーティファクト確認をスキップする
- すべてのエッジケースを E2E でテストする（ユニットテストを使用する）

## 重要な注意事項

**PMX における重要事項：**
- 実際の資金を扱う E2E テストはテストネット/ステージングでのみ実行すること
- 本番環境に対して取引テストを絶対に実行しないこと
- 金融テストには `test.skip(process.env.NODE_ENV === 'production')` を設定する
- 少額のテスト資金のみでテストウォレットを使用する

## 他のコマンドとの連携

- `/plan` でテストすべき重要なジャーニーを特定する
- `/tdd` でユニットテストを行う（より高速で細かい粒度）
- `/e2e` で統合テストとユーザージャーニーテストを行う
- `/code-review` でテストの品質を確認する

## 関連エージェント

このコマンドは以下にある `e2e-runner` エージェントを呼び出します：
`~/.claude/agents/e2e-runner.md`

## クイックコマンド

```bash
# すべての E2E テストを実行
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
