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
| `/learn` | パターン抽出 | セッション中の発見をスキルとして保存、継続的学習 | - |
| `/orchestrate` | エージェント連携 | 複数エージェントを順次/並列実行、ワークフロー自動化 | 複数 |
| ~~/plan~~ | ~~実装計画~~ | **削除済み** - cc-sdd（仕様駆動開発）を使用 | - |
| `/refactor-clean` | デッドコード削除 | knip/depcheck/ts-pruneで検出、テスト検証後に削除 | refactor-cleaner |
| `/tdd` | テスト駆動開発 | RED→GREEN→REFACTORサイクル、80%+カバレッジ目標 | tdd-guide |
| `/test-coverage` | カバレッジ分析 | 80%未満のファイルを特定、不足テストを生成 | - |
| `/update-codemaps` | コードマップ更新 | アーキテクチャドキュメント自動生成、変更30%超で承認要求 | doc-updater |
| `/update-docs` | ドキュメント更新 | package.json/.env.exampleからドキュメント生成 | doc-updater |
| `/verify` | 検証 | ビルド・型・リント・テスト・シークレット・console.logを一括チェック | - |
| **`/my:spec-impl`** | **スマート実装** | **cc-sddタスクをTDD+品質レビュー+PR作成まで一気通貫で実行** | code-reviewer, build-error-resolver |
| `/kiro:spec-impl` | TDD実装 | cc-sddのタスクをTDDで実装（シンプル版） | - |

---

## カテゴリ別詳細

### 開発フロー系

#### `/my:spec-impl` - スマート実装（cc-sdd連携）

cc-sddで分解されたタスクを、TDD・品質レビュー・PR作成まで一気通貫で実行。

```bash
# 全ての未完了タスクを実行（デフォルト）
/my:spec-impl auth-feature

# 特定のタスクのみ実行
/my:spec-impl auth-feature 1.1
/my:spec-impl auth-feature 1,2,3
```

**ワークフロー：**
```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: タスク実装（順次処理）                                  │
│    For each unchecked task:                                      │
│      1. サブエージェントにタスクを委任（コンテキスト分離）        │
│      2. TDD実装 (RED → GREEN → REFACTOR)                         │
│      3. tasks.md を [ ] → [x] に更新                             │
│      4. コミット（日本語メッセージ）                              │
│                              ↓                                   │
│  PHASE 2: 品質向上・レビュー（全タスク完了後）                   │
│    1. /refactor-clean → デッドコード削除                         │
│    2. /test-coverage → カバレッジ改善                            │
│    3. verification-loop skill → ビルド・型・リント・テスト       │
│    4. code-reviewer agent → CRITICALがあれば修正                 │
│                              ↓                                   │
│  PHASE 3: PR作成                                                 │
│    gh pr create でプルリクエストを作成                           │
└─────────────────────────────────────────────────────────────────┘
```

**エラー処理：**
- 環境エラー（ポート競合、権限不足等）→ 即時停止
- 同一エラー5回 → 停止、別アプローチ提案

#### `/kiro:spec-impl` - TDD実装（シンプル版）

cc-sddのオリジナルコマンド。TDDでタスクを実装するシンプルなバージョン。

```bash
/kiro:spec-impl auth-feature        # 全未完了タスク
/kiro:spec-impl auth-feature 1.1    # 特定タスク
```

**フロー**：タスク読み込み → TDD（RED→GREEN→REFACTOR） → tasks.md更新

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
> /my:spec-impl [spec-name]    # ← スマート実装（推奨）
> # または
> /kiro:spec-impl [spec-name]  # ← シンプル版
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
