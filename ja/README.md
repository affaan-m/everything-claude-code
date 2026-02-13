# Everything Claude Code

**Anthropicハッカソン優勝者による、Claude Code設定ファイルの完全コレクション。**

このリポジトリには、Claude Codeで日常的に使用している本番環境対応のエージェント、スキル、フック、コマンド、ルール、MCP設定が含まれています。これらの設定は、実際のプロダクトを構築しながら10ヶ月以上の集中的な使用を経て進化してきたものです。

---

## まずは完全ガイドをお読みください

**これらの設定ファイルに取りかかる前に、Xの完全ガイドをお読みください：**


<img width="592" height="445" alt="image" src="https://github.com/user-attachments/assets/1a471488-59cc-425b-8345-5245c7efbcef" />


**[The Shorthand Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2012378465664745795)**



ガイドの内容：
- 各設定タイプの役割と使用タイミング
- Claude Codeセットアップの構成方法
- コンテキストウィンドウの管理（パフォーマンスに極めて重要）
- 並列ワークフローと高度なテクニック
- これらの設定の背後にある思想

**このリポジトリは設定ファイルのみです！ヒント、コツ、その他の例はXの記事や動画にあります（リンクはこのREADMEの更新に合わせて追記されます）。**

---

## リポジトリの内容

```
everything-claude-code/
|-- agents/           # 委任用の特化型サブエージェント
|   |-- planner.md           # 機能実装の計画
|   |-- architect.md         # システム設計の意思決定
|   |-- tdd-guide.md         # テスト駆動開発
|   |-- code-reviewer.md     # 品質・セキュリティレビュー
|   |-- security-reviewer.md # 脆弱性分析
|   |-- build-error-resolver.md
|   |-- e2e-runner.md        # Playwright E2Eテスト
|   |-- refactor-cleaner.md  # 不要コードの削除
|   |-- doc-updater.md       # ドキュメント同期
|
|-- skills/           # ワークフロー定義とドメイン知識
|   |-- coding-standards.md         # 言語ごとのベストプラクティス
|   |-- backend-patterns.md         # API、データベース、キャッシュパターン
|   |-- frontend-patterns.md        # React、Next.jsパターン
|   |-- project-guidelines-example.md # プロジェクト固有スキルの例
|   |-- tdd-workflow/               # TDD手法
|   |-- security-review/            # セキュリティチェックリスト
|   |-- clickhouse-io.md            # ClickHouseアナリティクス
|
|-- commands/         # 素早い実行のためのスラッシュコマンド
|   |-- tdd.md              # /tdd - テスト駆動開発
|   |-- plan.md             # /plan - 実装計画
|   |-- e2e.md              # /e2e - E2Eテスト生成
|   |-- code-review.md      # /code-review - 品質レビュー
|   |-- build-fix.md        # /build-fix - ビルドエラーの修正
|   |-- refactor-clean.md   # /refactor-clean - 不要コードの削除
|   |-- test-coverage.md    # /test-coverage - カバレッジ分析
|   |-- update-codemaps.md  # /update-codemaps - ドキュメントの更新
|   |-- update-docs.md      # /update-docs - ドキュメント同期
|
|-- rules/            # 常に従うべきガイドライン
|   |-- security.md         # 必須のセキュリティチェック
|   |-- coding-style.md     # イミュータビリティ、ファイル構成
|   |-- testing.md          # TDD、カバレッジ80%要件
|   |-- git-workflow.md     # コミットフォーマット、PRプロセス
|   |-- agents.md           # サブエージェントへの委任タイミング
|   |-- performance.md      # モデル選択、コンテキスト管理
|   |-- patterns.md         # APIレスポンスフォーマット、フック
|   |-- hooks.md            # フックのドキュメント
|
|-- hooks/            # トリガーベースの自動化
|   |-- hooks.json          # PreToolUse、PostToolUse、Stopフック
|
|-- mcp-configs/      # MCPサーバー設定
|   |-- mcp-servers.json    # GitHub、Supabase、Vercel、Railwayなど
|
|-- plugins/          # プラグインエコシステムのドキュメント
|   |-- README.md           # プラグイン、マーケットプレイス、スキルガイド
|
|-- examples/         # 設定例
    |-- CLAUDE.md           # プロジェクトレベルの設定例
    |-- user-CLAUDE.md      # ユーザーレベルの設定例（~/.claude/CLAUDE.md）
    |-- statusline.json     # カスタムステータスラインの設定
```

---

## クイックスタート

### 1. 必要なものをコピー

```bash
# リポジトリをクローン
git clone https://github.com/affaan-m/everything-claude-code.git

# エージェントをClaude設定にコピー
cp everything-claude-code/agents/*.md ~/.claude/agents/

# ルールをコピー
cp everything-claude-code/rules/*.md ~/.claude/rules/

# コマンドをコピー
cp everything-claude-code/commands/*.md ~/.claude/commands/

# スキルをコピー
cp -r everything-claude-code/skills/* ~/.claude/skills/
```

### 2. settings.jsonにフックを追加

`hooks/hooks.json`のフックを`~/.claude/settings.json`にコピーしてください。

### 3. MCPの設定

`mcp-configs/mcp-servers.json`から必要なMCPサーバーを`~/.claude.json`にコピーしてください。

**重要：** `YOUR_*_HERE`のプレースホルダーを実際のAPIキーに置き換えてください。

### 4. ガイドを読む

本当に、[ガイドを読んでください](https://x.com/affaanmustafa/status/2012378465664745795)。これらの設定はコンテキストがあると理解度が10倍高まります。

---

## 主要コンセプト

### エージェント

サブエージェントは限定されたスコープで委任されたタスクを処理します。例：

```markdown
---
name: code-reviewer
description: Reviews code for quality, security, and maintainability
tools: Read, Grep, Glob, Bash
model: opus
---

You are a senior code reviewer...
```

### スキル

スキルはコマンドやエージェントから呼び出されるワークフロー定義です：

```markdown
# TDD Workflow

1. Define interfaces first
2. Write failing tests (RED)
3. Implement minimal code (GREEN)
4. Refactor (IMPROVE)
5. Verify 80%+ coverage
```

### フック

フックはツールイベントに応じて発火します。例 - console.logの警告：

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] Remove console.log' >&2"
  }]
}
```

### ルール

ルールは常に従うべきガイドラインです。モジュール化して管理しましょう：

```
~/.claude/rules/
  security.md      # シークレットのハードコード禁止
  coding-style.md  # イミュータビリティ、ファイル制限
  testing.md       # TDD、カバレッジ要件
```

---

## コントリビューション

**コントリビューションは歓迎・推奨されています。**

このリポジトリはコミュニティリソースとして作られています。以下をお持ちの方はぜひご貢献ください：
- 便利なエージェントやスキル
- 巧みなフック
- より良いMCP設定
- 改善されたルール

詳しくは[CONTRIBUTING.md](CONTRIBUTING.md)のガイドラインをご覧ください。

### コントリビューションのアイデア

- 言語固有のスキル（Python、Go、Rustパターン）
- フレームワーク固有の設定（Django、Rails、Laravel）
- DevOpsエージェント（Kubernetes、Terraform、AWS）
- テスト戦略（各種フレームワーク）
- ドメイン固有の知識（ML、データエンジニアリング、モバイル）

---

## 背景

私は実験的ロールアウトの頃からClaude Codeを使用しています。2025年9月にAnthropicとForum Venturesのハッカソンで、[@DRodriguezFX](https://x.com/DRodriguezFX)と共に[zenith.chat](https://zenith.chat)を構築して優勝しました - すべてClaude Codeを使用して。

これらの設定は複数の本番アプリケーションで実戦テスト済みです。

---

## 重要な注意事項

### コンテキストウィンドウの管理

**極めて重要：** すべてのMCPを一度に有効にしないでください。200kのコンテキストウィンドウが、有効なツールが多すぎると70kまで縮小する可能性があります。

目安：
- MCPは20〜30個を設定
- プロジェクトごとに有効化するのは10個未満
- アクティブなツールは80個未満

プロジェクト設定で`disabledMcpServers`を使用して、未使用のものを無効化してください。

### カスタマイズ

これらの設定は私のワークフローに合わせたものです。以下を推奨します：
1. 共感できるものから始める
2. 自分の技術スタックに合わせて修正する
3. 使わないものは削除する
4. 独自のパターンを追加する

---

## リンク

- **完全ガイド：** [The Shorthand Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2012378465664745795)
- **フォロー：** [@affaanmustafa](https://x.com/affaanmustafa)
- **zenith.chat：** [zenith.chat](https://zenith.chat)

---

## ライセンス

MIT - 自由に使用・修正し、可能であればコントリビューションをお願いします。

---

**役に立ったらスターをお願いします。ガイドを読んで、素晴らしいものを作りましょう。**

---
