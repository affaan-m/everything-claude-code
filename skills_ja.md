# Skills（スキル）解説

## スキルとは

**スキル**は、コマンドやエージェントが参照するワークフロー定義・ドメイン知識です。再利用可能な手順、パターン、ベストプラクティスを定義します。

### 配置場所

```
~/.claude/skills/
```

### コマンドとの違い

| 項目 | スキル | コマンド |
|------|--------|----------|
| 呼び出し方 | エージェントが自動参照 | `/command-name`で直接実行 |
| 用途 | 知識・手順の定義 | 素早いアクション実行 |
| 粒度 | 広範な知識ベース | 単一タスク |

---

## スキル一覧

| スキル | 説明 | カテゴリ |
|--------|------|---------|
| **coding-standards** | TypeScript/JavaScript/Reactのベストプラクティス | 基本 |
| **tdd-workflow** | テスト駆動開発のワークフロー | 基本 |
| **security-review** | セキュリティチェックリスト | 基本 |
| **backend-patterns** | API、データベース、キャッシングパターン | パターン |
| **frontend-patterns** | React、Next.jsパターン | パターン |
| **continuous-learning** | セッションからパターン自動抽出 | 上級（ロングフォーム） |
| **verification-loop** | 継続的検証ワークフロー | 上級（ロングフォーム） |
| **eval-harness** | 検証ループ評価 | 上級（ロングフォーム） |
| **strategic-compact** | 手動コンパクション提案 | 上級（ロングフォーム） |
| **clickhouse-io** | ClickHouse操作 | 特定技術 |
| **project-guidelines-example** | プロジェクトガイドライン例 | 例 |

---

## 主要スキルの詳細

### coding-standards - コーディング規約

TypeScript/JavaScript/Reactの包括的なベストプラクティス集。

**コード品質原則：**
1. **Readability First** - 読みやすさ優先
2. **KISS** - シンプルに保つ
3. **DRY** - 繰り返しを避ける
4. **YAGNI** - 必要になるまで作らない

**含まれる内容：**
- 変数・関数の命名規則
- イミュータビリティパターン
- エラーハンドリング
- Async/Awaitベストプラクティス
- 型安全性
- Reactコンポーネント構造
- カスタムフック
- APIデザイン標準
- ファイル構成
- コメント・ドキュメント
- パフォーマンスベストプラクティス
- テスト標準
- コードスメル検出

---

### tdd-workflow - テスト駆動開発

TDDの完全なワークフロー定義。

**TDDサイクル：**
```
RED → GREEN → REFACTOR → REPEAT
```

1. **ユーザージャーニー記述**
2. **テストケース生成**
3. **テスト実行（失敗確認）**
4. **最小実装**
5. **テスト実行（成功確認）**
6. **リファクタリング**
7. **カバレッジ確認（80%+）**

**含まれる内容：**
- ユニットテストパターン
- APIインテグレーションテストパターン
- E2Eテストパターン（Playwright）
- モック戦略（Supabase、Redis、OpenAI）
- カバレッジ設定
- よくある間違い

---

### continuous-learning - 継続的学習

セッション終了時に自動でパターンを抽出し、スキルとして保存。

**動作：**
1. Stopフックでセッション評価
2. 抽出可能なパターンを検出
3. `~/.claude/skills/learned/`に保存

**検出するパターン：**
| パターン | 説明 |
|---------|------|
| `error_resolution` | エラー解決方法 |
| `user_corrections` | ユーザー修正からのパターン |
| `workarounds` | フレームワーク/ライブラリの回避策 |
| `debugging_techniques` | 効果的なデバッグ手法 |
| `project_specific` | プロジェクト固有の規約 |

---

### verification-loop - 検証ループ

機能完成時やPR前の包括的検証システム。

**検証フェーズ：**
1. **Build Verification** - ビルド成功確認
2. **Type Check** - 型エラー確認
3. **Lint Check** - リントエラー確認
4. **Test Suite** - テスト実行とカバレッジ
5. **Security Scan** - シークレット・console.log検出
6. **Diff Review** - 変更内容レビュー

**出力フォーマット：**
```
VERIFICATION REPORT
==================
Build:     [PASS/FAIL]
Types:     [PASS/FAIL] (X errors)
Lint:      [PASS/FAIL] (X warnings)
Tests:     [PASS/FAIL] (X/Y passed, Z% coverage)
Security:  [PASS/FAIL] (X issues)
Diff:      [X files changed]

Overall:   [READY/NOT READY] for PR
```

---

### strategic-compact - 戦略的コンパクト

手動コンパクトのタイミングを提案。

**なぜ手動コンパクトか：**
- auto-compactはタスク途中の任意のタイミングで発生
- 戦略的コンパクトは論理的なフェーズ区切りで実行
- 探索完了後、実装開始前にコンパクト
- マイルストーン完了後にコンパクト

**動作：**
- 50ツール呼び出しで通知
- 25呼び出しごとにリマインダー

---

## スキルファイル構造

### SKILL.md

```yaml
---
name: skill-name
description: いつ使うか、何ができるか
---

# スキル名

## いつ活性化するか
- 条件1
- 条件2

## ワークフロー
1. ステップ1
2. ステップ2

## パターン/テンプレート
[コード例など]
```

---

## カスタマイズ提案

### 1. プロジェクト固有スキルの追加

```
~/.claude/skills/my-project/
├── SKILL.md           # プロジェクト固有のパターン
├── api-patterns.md    # API設計パターン
└── db-schema.md       # データベーススキーマ
```

### 2. 学習済みスキルの活用

`/learn`コマンドで抽出したスキルは以下に保存：
```
~/.claude/skills/learned/
├── redis-connection-fix.md
├── nextjs-image-optimization.md
└── supabase-rls-pattern.md
```

### 3. 技術スタック別スキル

使用する技術に応じてスキルを追加：

- `python-patterns/` - Pythonベストプラクティス
- `go-patterns/` - Goベストプラクティス
- `rust-patterns/` - Rustベストプラクティス

### 4. 不要なスキルの削除

使わない技術のスキルは削除：
- ClickHouseを使わない → `clickhouse-io/`削除
- Playwrightを使わない → E2E関連を調整

---

## 参考リンク

- [ロングフォームガイド - 継続的学習](longform-guide_ja.md#3-継続的学習)
- [Claude Code Docs - Skills](https://code.claude.com/docs/en/skills)
- [元リポジトリ - skills/](https://github.com/affaan-m/everything-claude-code/tree/main/skills)
