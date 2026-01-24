# Commands（スラッシュコマンド）解説

## コマンドとは

**コマンド**は、`/コマンド名`でClaude Codeから呼び出せるショートカットプロンプトです。特定のワークフローを素早く実行できます。

### 配置場所

```
~/.claude/commands/
```

### スキルとの違い

| 項目 | コマンド | スキル |
|------|---------|--------|
| 呼び出し方 | `/command-name` | エージェントが参照 |
| 用途 | ユーザーが直接実行 | ワークフロー定義・知識ベース |
| 粒度 | 単一アクション | 広範な知識・手順 |

---

## コマンド一覧

| コマンド | 用途 | 詳細 | 関連エージェント |
|---------|------|------|-----------------|
| `/build-fix` | ビルドエラー修正 | TypeScript/ビルドエラーを1つずつ安全に修正、3回失敗で停止 | build-error-resolver |
| `/checkpoint` | チェックポイント管理 | 作業状態の保存・復元・比較、git stash/commitと連携 | - |
| `/code-review` | コードレビュー | セキュリティ・品質チェック、CRITICAL/HIGH/MEDIUM/LOWで分類 | code-reviewer |
| `/e2e` | E2Eテスト | Playwright テスト生成・実行、Page Object Model、アーティファクト管理 | e2e-runner |
| `/eval` | 評価管理 | 機能の評価定義・チェック・レポート、pass@k メトリクス | - |
| **`/impl`** | **スマート実装** | **cc-sddタスクをTDD+レビュー+検証で実装、エージェント自動連携** | tdd-guide, code-reviewer, security-reviewer |
| `/learn` | パターン抽出 | セッション中の発見をスキルとして保存、継続的学習 | - |
| `/orchestrate` | エージェント連携 | 複数エージェントを順次/並列実行、ワークフロー自動化 | 複数 |
| ~~/plan~~ | ~~実装計画~~ | **削除済み** - cc-sdd（仕様駆動開発）を使用 | - |
| `/refactor-clean` | デッドコード削除 | knip/depcheck/ts-pruneで検出、テスト検証後に削除 | refactor-cleaner |
| `/tdd` | テスト駆動開発 | RED→GREEN→REFACTORサイクル、80%+カバレッジ目標 | tdd-guide |
| `/test-coverage` | カバレッジ分析 | 80%未満のファイルを特定、不足テストを生成 | - |
| `/update-codemaps` | コードマップ更新 | アーキテクチャドキュメント自動生成、変更30%超で承認要求 | doc-updater |
| `/update-docs` | ドキュメント更新 | package.json/.env.exampleからドキュメント生成 | doc-updater |
| `/verify` | 検証 | ビルド・型・リント・テスト・シークレット・console.logを一括チェック | - |

---

## カテゴリ別詳細

### 開発フロー系

#### `/impl` - スマート実装（cc-sdd連携）

cc-sddで分解されたタスクを、複数のエージェントを自動連携してスマートに実装。

```bash
# cc-sddタスクファイルを指定
/impl .kiro/specs/auth-feature/tasks/task-001.md

# タスク名で指定
/impl task-001

# 直接タスク説明
/impl "JWTトークン検証ミドルウェアを実装"
```

**ワークフロー：**
```
1. タスク分析 → 実装計画を簡潔に提示
2. TDD実装 (tdd-guide) → RED→GREEN→REFACTOR
3. コードレビュー (code-reviewer) → 品質・セキュリティチェック
4. セキュリティレビュー (security-reviewer) → 認証/決済関連のみ
5. 検証 (/verify) → ビルド・テスト・カバレッジ
6. 完了レポート → サマリー、次のタスク提案
```

**オプション：**
- `--auto`: 確認なしで進行（CI用）
- `--loop`: Ralph loop統合（完成まで自動リトライ）
- `--skip-review`: レビューをスキップ（非推奨）

#### `/plan` - 実装計画（削除済み）

> **注意**: `/plan`コマンドは削除されました。
>
> 実装計画・仕様策定には **[cc-sdd（仕様駆動開発）](https://github.com/gotalab/cc-sdd)** を使用してください。
>
> ```bash
> # cc-sddのセットアップ
> npx cc-sdd@latest --claude --lang ja
>
> # 仕様駆動開発ワークフロー
> /kiro:spec-init [要件説明]
> /kiro:spec-requirements [spec-name]
> /kiro:spec-design [spec-name]
> /kiro:spec-tasks [spec-name]
> /impl [task-name]  # ← /kiro:spec-implの代わり
> ```
>
> cc-sddは、要件→設計→タスク→実装を構造化し、`.kiro/specs/`に永続化します。

#### `/tdd` - テスト駆動開発
```
/tdd 流動性スコア計算関数を作成
```
1. インターフェース定義
2. 失敗するテスト作成（RED）
3. 最小実装（GREEN）
4. リファクタリング
5. カバレッジ確認（80%+目標）

#### `/orchestrate` - エージェント連携
```
/orchestrate feature "ユーザー認証を追加"
```
ワークフロータイプ：
- `feature`: tdd-guide → code-reviewer → security-reviewer（計画はcc-sddで）
- `bugfix`: explorer → tdd-guide → code-reviewer
- `refactor`: architect → code-reviewer → tdd-guide
- `security`: security-reviewer → code-reviewer → architect

---

### 品質管理系

#### `/code-review` - コードレビュー
```
/code-review
```
チェック項目：
- **CRITICAL**: ハードコードされた認証情報、SQLインジェクション、XSS
- **HIGH**: 50行超の関数、800行超のファイル、console.log
- **MEDIUM**: ミュータブルパターン、テスト不足

#### `/verify` - 検証
```
/verify full
```
オプション：
- `quick`: ビルド + 型チェックのみ
- `full`: 全チェック（デフォルト）
- `pre-commit`: コミット前チェック
- `pre-pr`: フルチェック + セキュリティスキャン

#### `/test-coverage` - カバレッジ分析
```
/test-coverage
```
- 80%未満のファイルを特定
- 不足しているテストを生成
- before/afterのメトリクス表示

---

### テスト系

#### `/e2e` - E2Eテスト
```
/e2e マーケット検索と詳細表示のフローをテスト
```
- Playwright テスト生成
- Page Object Model パターン
- 複数ブラウザ対応（Chrome, Firefox, Safari）
- 失敗時のスクリーンショット・動画・トレース

---

### リファクタリング系

#### `/build-fix` - ビルドエラー修正
```
/build-fix
```
- エラーを1つずつ修正
- 修正後に再ビルドで検証
- 3回失敗で停止
- 新しいエラー発生で停止

#### `/refactor-clean` - デッドコード削除
```
/refactor-clean
```
ツール：
- `knip`: 未使用エクスポート・ファイル検出
- `depcheck`: 未使用依存関係検出
- `ts-prune`: TypeScript未使用エクスポート検出

---

### ドキュメント系

#### `/update-docs` - ドキュメント更新
```
/update-docs
```
- package.jsonからスクリプト一覧生成
- .env.exampleから環境変数ドキュメント生成
- docs/CONTRIB.md, docs/RUNBOOK.md 生成

#### `/update-codemaps` - コードマップ更新
```
/update-codemaps
```
生成物：
- `codemaps/architecture.md` - 全体アーキテクチャ
- `codemaps/backend.md` - バックエンド構造
- `codemaps/frontend.md` - フロントエンド構造
- `codemaps/data.md` - データモデル・スキーマ

---

### 継続的学習系（ロングフォームガイド）

#### `/learn` - パターン抽出
```
/learn
```
セッション中に発見した以下をスキルとして保存：
- エラー解決パターン
- デバッグテクニック
- ワークアラウンド
- プロジェクト固有パターン

#### `/checkpoint` - チェックポイント
```
/checkpoint create "feature-start"
/checkpoint verify "feature-start"
/checkpoint list
```
- 作業状態の保存
- 前の状態との比較
- git stash/commitと連携

#### `/eval` - 評価管理
```
/eval define auth-feature
/eval check auth-feature
/eval report auth-feature
```
- 機能の評価基準定義
- pass@k メトリクス（pass@1, pass@3）
- SHIP / NEEDS WORK / BLOCKED 判定

---

## カスタマイズ提案

### 1. 不要なコマンドの削除

使わない技術スタックのコマンドは削除可能：
- Playwrightを使わない → `/e2e` 削除または別フレームワーク用に変更
- 特定のリンターを使わない → `/verify` を調整

### 2. 新しいコマンドの追加例

- `/deploy` - デプロイ手順の実行
- `/db-migrate` - データベースマイグレーション
- `/perf-check` - パフォーマンステスト

### 3. プロジェクト固有の調整

各コマンドには「PMX-Specific」などプロジェクト固有のセクションがあります。自分のプロジェクト名に置き換えてカスタマイズ。

---

## 参考リンク

- [Claude Code Docs - Commands](https://code.claude.com/docs/en/commands)
- [元リポジトリ - commands/](https://github.com/affaan-m/everything-claude-code/tree/main/commands)
