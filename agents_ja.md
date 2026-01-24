# Agents（サブエージェント）解説

## サブエージェントとは

**サブエージェント**は、特定のタスクに特化した専門家として動作する独立したAIアシスタントです。メインのClaude Codeから特定のタスクを委任され、独自のコンテキストウィンドウで動作します。

### ファイル構造

```yaml
---
name: agent-name           # エージェント名
description: 説明文          # いつ使うか、何ができるか
tools: Read, Write, Edit   # 使用可能なツール
model: opus                # 使用するモデル（opus/sonnet/haiku）
---

[システムプロンプト・指示内容]
```

### メリット

| メリット | 説明 |
|---------|------|
| **コンテキスト保護** | メイン会話のコンテキストを消費しない |
| **専門性** | 特定タスクに最適化された指示 |
| **ツール制限** | 必要なツールのみに限定可能 |
| **コスト制御** | Haikuなど安価なモデルにルーティング可能 |

---

## エージェント一覧

| エージェント | 用途 | 詳細 | モデル | ツール |
|-------------|------|------|--------|--------|
| **architect** | システム設計・アーキテクチャ判断 | アーキテクチャレビュー、トレードオフ分析、ADR作成、スケーラビリティ計画 | opus | Read, Grep, Glob |
| **build-error-resolver** | TypeScript/ビルドエラー解決 | 最小diffでのエラー修正、インポート/依存関係の問題解決（アーキテクチャ変更はしない） | opus | Read, Write, Edit, Bash, Grep, Glob |
| **code-reviewer** | コード品質・セキュリティレビュー | OWASP Top 10チェック、パフォーマンス・コード品質評価、Critical/Warning/Suggestionで分類 | opus | Read, Grep, Glob, Bash |
| **doc-updater** | ドキュメント・コードマップ更新 | コードマップ生成（docs/CODEMAPS/）、ts-morphでAST分析、READMEの自動更新 | opus | Read, Write, Edit, Bash, Grep, Glob |
| **e2e-runner** | Playwright E2Eテスト | Playwright設定・テスト作成、Page Object Modelパターン、フレーキーテスト管理 | opus | Read, Write, Edit, Bash, Grep, Glob |
| **planner** | 機能実装の計画作成 | 実装計画の作成、フェーズ分け、リスク評価、テスト戦略の策定 | opus | Read, Grep, Glob |
| **refactor-cleaner** | デッドコード削除・リファクタリング | knip, depcheck, ts-pruneでデッドコード検出、DELETION_LOG.md管理、安全な削除プロセス | opus | Read, Write, Edit, Bash, Grep, Glob |
| **security-reviewer** | セキュリティ脆弱性検出 | OWASP Top 10チェック、シークレット検出、npm audit実行 | opus | Read, Write, Edit, Bash, Grep, Glob |
| **tdd-guide** | テスト駆動開発 | Red-Green-Refactorサイクル、80%+カバレッジ目標、モック戦略 | opus | Read, Write, Edit, Bash, Grep |

---

## カスタマイズ提案

### 1. 日本語化

すべてのエージェントは英語で書かれています。日本語で作業したい場合は日本語版を作成することを検討。

### 2. モデル選択の最適化

現在すべて`opus`ですが、コスト削減のため以下を検討：

| エージェント | 現在 | 提案 | 理由 |
|-------------|------|------|------|
| planner | opus | sonnet | 計画作成はsonnetでも十分 |
| doc-updater | opus | sonnet | ドキュメント生成はsonnetでも動作可能 |
| refactor-cleaner | opus | sonnet/haiku | 分析系は軽量モデルでも可 |

### 3. プロジェクト固有のカスタマイズ

各エージェントには「Example Project-Specific」セクションがあり、これを**自分のプロジェクト用に書き換える**のが重要です。

**例：security-reviewer.md**
```markdown
## Project-Specific Security Checks

現在：Solana、Supabase、Privy向けのチェック
↓
あなたのプロジェクト用に変更
```

### 4. 不要なエージェントの削除

使わない技術スタックのエージェントは削除可能：

- Solanaを使わない → 関連コード削除
- Playwrightを使わない → e2e-runner削除または別フレームワーク用に変更

### 5. 新しいエージェントの追加例

- `api-designer.md` - REST/GraphQL API設計専門
- `performance-optimizer.md` - パフォーマンス最適化専門
- `migration-helper.md` - DB/フレームワーク移行支援

---

## 参考リンク

- [Claude Code Docs - Subagents](https://code.claude.com/docs/en/sub-agents)
- [元リポジトリ - agents/](https://github.com/affaan-m/everything-claude-code/tree/main/agents)
