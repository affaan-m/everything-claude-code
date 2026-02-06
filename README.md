**Language:** English | [繁體中文](docs/zh-TW/README.md)

# Everything Claude Code

[![Stars](https://img.shields.io/github/stars/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/stargazers)
[![Forks](https://img.shields.io/github/forks/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/network/members)
[![Contributors](https://img.shields.io/github/contributors/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/graphs/contributors)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Shell](https://img.shields.io/badge/-Shell-4EAA25?logo=gnu-bash&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white)
![Go](https://img.shields.io/badge/-Go-00ADD8?logo=go&logoColor=white)
![Java](https://img.shields.io/badge/-Java-ED8B00?logo=openjdk&logoColor=white)
![Markdown](https://img.shields.io/badge/-Markdown-000000?logo=markdown&logoColor=white)

> **41K+ stars** | **5K+ forks** | **22 contributors** | **6 languages supported**

---

<div align="center">

**🌐 Language / 语言 / 語言**

[**English**](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](docs/zh-TW/README.md)

</div>

---

**Anthropic ハッカソン優勝者による Claude Code 設定の完全コレクション。**

実際のプロダクト開発で10ヶ月以上にわたる集中的な日常使用を通じて進化した、本番環境対応の agent、skill、hook、command、rule、MCP 設定。

---

## ガイド

このリポジトリはコードのみです。ガイドですべてを解説しています。

<table>
<tr>
<td width="50%">
<a href="https://x.com/affaanmustafa/status/2012378465664745795">
<img src="https://github.com/user-attachments/assets/1a471488-59cc-425b-8345-5245c7efbcef" alt="The Shorthand Guide to Everything Claude Code" />
</a>
</td>
<td width="50%">
<a href="https://x.com/affaanmustafa/status/2014040193557471352">
<img src="https://github.com/user-attachments/assets/c9ca43bc-b149-427f-b551-af6840c368f0" alt="The Longform Guide to Everything Claude Code" />
</a>
</td>
</tr>
<tr>
<td align="center"><b>簡易ガイド</b><br/>セットアップ、基礎、哲学。<b>まずこちらをお読みください。</b></td>
<td align="center"><b>詳細ガイド</b><br/>トークン最適化、メモリ永続化、eval、並列化。</td>
</tr>
</table>

| トピック | 学べること |
|---------|-----------|
| トークン最適化 | モデル選択、システムプロンプトの軽量化、バックグラウンドプロセス |
| メモリ永続化 | セッション間でコンテキストを自動的に保存・読み込む hook |
| 継続的学習 | セッションから再利用可能な skill へパターンを自動抽出 |
| 検証ループ | チェックポイント vs 継続的 eval、grader の種類、pass@k メトリクス |
| 並列化 | Git worktree、カスケード方式、インスタンスをスケールするタイミング |
| サブエージェントオーケストレーション | コンテキスト問題、反復的取得パターン |

---

## What's New

### v1.4.1 — Bug Fix (Feb 2026)

- **Fixed instinct import content loss** — `parse_instinct_file()` was silently dropping all content after frontmatter (Action, Evidence, Examples sections) during `/instinct-import`. Fixed by community contributor @ericcai0814 ([#148](https://github.com/affaan-m/everything-claude-code/issues/148), [#161](https://github.com/affaan-m/everything-claude-code/pull/161))

### v1.4.0 — Multi-Language Rules, Installation Wizard & PM2 (Feb 2026)

- **Interactive installation wizard** — New `configure-ecc` skill provides guided setup with merge/overwrite detection
- **PM2 & multi-agent orchestration** — 6 new commands (`/pm2`, `/multi-plan`, `/multi-execute`, `/multi-backend`, `/multi-frontend`, `/multi-workflow`) for managing complex multi-service workflows
- **Multi-language rules architecture** — Rules restructured from flat files into `common/` + `typescript/` + `python/` + `golang/` directories. Install only the languages you need
- **Chinese (zh-CN) translations** — Complete translation of all agents, commands, skills, and rules (80+ files)
- **GitHub Sponsors support** — Sponsor the project via GitHub Sponsors
- **Enhanced CONTRIBUTING.md** — Detailed PR templates for each contribution type

### v1.3.0 — OpenCode Plugin Support (Feb 2026)

- **Full OpenCode integration** — 12 agents, 24 commands, 16 skills with hook support via OpenCode's plugin system (20+ event types)
- **3 native custom tools** — run-tests, check-coverage, security-audit
- **LLM documentation** — `llms.txt` for comprehensive OpenCode docs

### v1.2.0 — Unified Commands & Skills (Feb 2026)

- **Python/Django support** — Django patterns, security, TDD, and verification skills
- **Java Spring Boot skills** — Patterns, security, TDD, and verification for Spring Boot
- **Session management** — `/sessions` command for session history
- **Continuous learning v2** — Instinct-based learning with confidence scoring, import/export, evolution

See the full changelog in [Releases](https://github.com/affaan-m/everything-claude-code/releases).

---

## Quick Start

Get up and running in under 2 minutes:

### Step 1: Install the Plugin

```bash
# Add marketplace
/plugin marketplace add affaan-m/everything-claude-code

# Install plugin
/plugin install everything-claude-code@everything-claude-code
```

### Step 2: Install Rules (Required)

> **Important:** Claude Code plugins cannot distribute `rules` automatically. Install them manually:

```bash
# Clone the repo first
git clone https://github.com/affaan-m/everything-claude-code.git

# Install common rules (required)
cp -r everything-claude-code/rules/common/* ~/.claude/rules/

# Install language-specific rules (pick your stack)
cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/
cp -r everything-claude-code/rules/python/* ~/.claude/rules/
cp -r everything-claude-code/rules/golang/* ~/.claude/rules/
```

### Step 3: Start Using

```bash
# Try a command
/plan "Add user authentication"

# Check available commands
/plugin list everything-claude-code@everything-claude-code
```

**That's it!** You now have access to 15+ agents, 30+ skills, and 30+ commands.

---

## クロスプラットフォームサポート

このプラグインは **Windows、macOS、Linux** を完全サポートしています。すべての hook とスクリプトは最大限の互換性のために Node.js で書き直されました。

### パッケージマネージャー検出

プラグインは以下の優先順位で優先パッケージマネージャー（npm、pnpm、yarn、または bun）を自動検出します：

1. **環境変数**: `CLAUDE_PACKAGE_MANAGER`
2. **プロジェクト設定**: `.claude/package-manager.json`
3. **package.json**: `packageManager` フィールド
4. **ロックファイル**: package-lock.json、yarn.lock、pnpm-lock.yaml、または bun.lockb から検出
5. **グローバル設定**: `~/.claude/package-manager.json`
6. **フォールバック**: 利用可能な最初のパッケージマネージャー

優先パッケージマネージャーを設定するには：

```bash
# 環境変数経由
export CLAUDE_PACKAGE_MANAGER=pnpm

# グローバル設定経由
node scripts/setup-package-manager.js --global pnpm

# プロジェクト設定経由
node scripts/setup-package-manager.js --project bun

# 現在の設定を検出
node scripts/setup-package-manager.js --detect
```

または Claude Code で `/setup-pm` command を使用してください。

---

## 内容

このリポジトリは **Claude Code プラグイン** です - 直接インストールするか、手動でコンポーネントをコピーできます。

```
everything-claude-code/
|-- .claude-plugin/   # プラグインとマーケットプレイスのマニフェスト
|   |-- plugin.json         # プラグインのメタデータとコンポーネントパス
|   |-- marketplace.json    # /plugin marketplace add 用のマーケットプレイスカタログ
|
|-- agents/           # 委譲用の特化型サブエージェント
|   |-- planner.md           # 機能実装計画
|   |-- architect.md         # システム設計判断
|   |-- tdd-guide.md         # テスト駆動開発
|   |-- code-reviewer.md     # 品質とセキュリティレビュー
|   |-- security-reviewer.md # 脆弱性分析
|   |-- build-error-resolver.md
|   |-- e2e-runner.md        # Playwright E2E テスト
|   |-- refactor-cleaner.md  # デッドコードクリーンアップ
|   |-- doc-updater.md       # ドキュメント同期
|   |-- go-reviewer.md       # Go code review
|   |-- go-build-resolver.md # Go build error resolution
|   |-- python-reviewer.md   # Python code review (NEW)
|   |-- database-reviewer.md # Database/Supabase review (NEW)
|
|-- skills/           # ワークフロー定義とドメイン知識
|   |-- coding-standards/           # 言語ベストプラクティス
|   |-- backend-patterns/           # API、データベース、キャッシュパターン
|   |-- frontend-patterns/          # React、Next.js パターン
|   |-- continuous-learning/        # セッションからパターンを自動抽出（詳細ガイド）
|   |-- continuous-learning-v2/     # 信頼度スコアリング付きの instinct ベース学習
|   |-- iterative-retrieval/        # サブエージェント用の段階的コンテキスト精緻化
|   |-- strategic-compact/          # 手動コンパクション提案（詳細ガイド）
|   |-- tdd-workflow/               # TDD 方法論
|   |-- security-review/            # セキュリティチェックリスト
|   |-- eval-harness/               # 検証ループ評価（詳細ガイド）
|   |-- verification-loop/          # 継続的検証（詳細ガイド）
|   |-- golang-patterns/            # Go idioms and best practices
|   |-- golang-testing/             # Go testing patterns, TDD, benchmarks
|   |-- django-patterns/            # Django patterns, models, views (NEW)
|   |-- django-security/            # Django security best practices (NEW)
|   |-- django-tdd/                 # Django TDD workflow (NEW)
|   |-- django-verification/        # Django verification loops (NEW)
|   |-- python-patterns/            # Python idioms and best practices (NEW)
|   |-- python-testing/             # Python testing with pytest (NEW)
|   |-- springboot-patterns/        # Java Spring Boot patterns (NEW)
|   |-- springboot-security/        # Spring Boot security (NEW)
|   |-- springboot-tdd/             # Spring Boot TDD (NEW)
|   |-- springboot-verification/    # Spring Boot verification (NEW)
|   |-- configure-ecc/              # Interactive installation wizard (NEW)
|
|-- commands/         # クイック実行用スラッシュコマンド
|   |-- tdd.md              # /tdd - テスト駆動開発
|   |-- plan.md             # /plan - 実装計画
|   |-- e2e.md              # /e2e - E2E テスト生成
|   |-- code-review.md      # /code-review - 品質レビュー
|   |-- build-fix.md        # /build-fix - ビルドエラー修正
|   |-- refactor-clean.md   # /refactor-clean - デッドコード削除
|   |-- learn.md            # /learn - セッション中にパターンを抽出（詳細ガイド）
|   |-- checkpoint.md       # /checkpoint - 検証状態を保存（詳細ガイド）
|   |-- verify.md           # /verify - 検証ループを実行（詳細ガイド）
|   |-- setup-pm.md         # /setup-pm - パッケージマネージャーを設定
|   |-- go-review.md        # /go-review - Go code review (NEW)
|   |-- go-test.md          # /go-test - Go TDD workflow (NEW)
|   |-- go-build.md         # /go-build - Fix Go build errors (NEW)
|   |-- skill-create.md     # /skill-create - Generate skills from git history (NEW)
|   |-- instinct-status.md  # /instinct-status - View learned instincts (NEW)
|   |-- instinct-import.md  # /instinct-import - Import instincts (NEW)
|   |-- instinct-export.md  # /instinct-export - Export instincts (NEW)
|   |-- evolve.md           # /evolve - Cluster instincts into skills
|   |-- pm2.md              # /pm2 - PM2 service lifecycle management (NEW)
|   |-- multi-plan.md       # /multi-plan - Multi-agent task decomposition (NEW)
|   |-- multi-execute.md    # /multi-execute - Orchestrated multi-agent workflows (NEW)
|   |-- multi-backend.md    # /multi-backend - Backend multi-service orchestration (NEW)
|   |-- multi-frontend.md   # /multi-frontend - Frontend multi-service orchestration (NEW)
|   |-- multi-workflow.md   # /multi-workflow - General multi-service workflows (NEW)
|
|-- rules/            # 常に従うガイドライン（~/.claude/rules/ にコピー）
|   |-- README.md            # Structure overview and installation guide
|   |-- common/              # Language-agnostic principles
|   |   |-- coding-style.md    # Immutability, file organization
|   |   |-- git-workflow.md    # Commit format, PR process
|   |   |-- testing.md         # TDD, 80% coverage requirement
|   |   |-- performance.md     # Model selection, context management
|   |   |-- patterns.md        # Design patterns, skeleton projects
|   |   |-- hooks.md           # Hook architecture, TodoWrite
|   |   |-- agents.md          # When to delegate to subagents
|   |   |-- security.md        # Mandatory security checks
|   |-- typescript/          # TypeScript/JavaScript specific
|   |-- python/              # Python specific
|   |-- golang/              # Go specific
|
|-- hooks/            # トリガーベースの自動化
|   |-- hooks.json                # すべての hook 設定（PreToolUse、PostToolUse、Stop など）
|   |-- memory-persistence/       # セッションライフサイクル hook（詳細ガイド）
|   |-- strategic-compact/        # コンパクション提案（詳細ガイド）
|
|-- scripts/          # クロスプラットフォーム Node.js スクリプト（新規）
|   |-- lib/                     # 共有ユーティリティ
|   |   |-- utils.js             # クロスプラットフォームファイル/パス/システムユーティリティ
|   |   |-- package-manager.js   # パッケージマネージャー検出と選択
|   |-- hooks/                   # hook 実装
|   |   |-- session-start.js     # セッション開始時にコンテキストを読み込む
|   |   |-- session-end.js       # セッション終了時に状態を保存
|   |   |-- pre-compact.js       # コンパクション前の状態保存
|   |   |-- suggest-compact.js   # 戦略的コンパクション提案
|   |   |-- evaluate-session.js  # セッションからパターンを抽出
|   |-- setup-package-manager.js # インタラクティブ PM セットアップ
|
|-- tests/            # テストスイート（新規）
|   |-- lib/                     # ライブラリテスト
|   |-- hooks/                   # hook テスト
|   |-- run-all.js               # すべてのテストを実行
|
|-- contexts/         # 動的システムプロンプト注入 context（詳細ガイド）
|   |-- dev.md              # 開発モード context
|   |-- review.md           # コードレビューモード context
|   |-- research.md         # リサーチ/探索モード context
|
|-- examples/         # 設定例とセッション例
|   |-- CLAUDE.md           # プロジェクトレベル設定例
|   |-- user-CLAUDE.md      # ユーザーレベル設定例
|
|-- mcp-configs/      # MCP サーバー設定
|   |-- mcp-servers.json    # GitHub、Supabase、Vercel、Railway など
|
|-- marketplace.json  # セルフホストマーケットプレイス設定（/plugin marketplace add 用）
```

---

## エコシステムツール

### Skill Creator

リポジトリから Claude Code skill を自動生成します。

#### Option A: Local Analysis (Built-in)

Use the `/skill-create` command for local analysis without external services:

```bash
/skill-create                    # Analyze current repo
/skill-create --instincts        # Also generate instincts for continuous-learning
```

This analyzes your git history locally and generates SKILL.md files.

#### Option B: GitHub App (Advanced)

For advanced features (10k+ commits, auto-PRs, team sharing):

[GitHub App をインストール](https://github.com/apps/skill-creator) | [ecc.tools](https://ecc.tools)

```bash
# Comment on any issue:
/skill-creator analyze

# Or auto-triggers on push to default branch
```

リポジトリを分析して以下を作成します：
- **SKILL.md ファイル** - Claude Code ですぐに使える skill
- **Instinct コレクション** - continuous-learning-v2 用
- **パターン抽出** - コミット履歴から学習

### Continuous Learning v2

The instinct-based learning system automatically learns your patterns:

```bash
/instinct-status        # Show learned instincts with confidence
/instinct-import <file> # Import instincts from others
/instinct-export        # Export your instincts for sharing
/evolve                 # Cluster related instincts into skills
```

See `skills/continuous-learning-v2/` for full documentation.

---

## Requirements

### Claude Code CLI Version

**Minimum version: v2.1.0 or later**

This plugin requires Claude Code CLI v2.1.0+ due to changes in how the plugin system handles hooks.

Check your version:
```bash
claude --version
```

### Important: Hooks Auto-Loading Behavior

> **For Contributors:** Do NOT add a `"hooks"` field to `.claude-plugin/plugin.json`. This is enforced by a regression test.

Claude Code v2.1+ **automatically loads** `hooks/hooks.json` from any installed plugin by convention. Explicitly declaring it in `plugin.json` causes a duplicate detection error:

```
Duplicate hooks file detected: ./hooks/hooks.json resolves to already-loaded file
```

**History:** This has caused repeated fix/revert cycles in this repo ([#29](https://github.com/affaan-m/everything-claude-code/issues/29), [#52](https://github.com/affaan-m/everything-claude-code/issues/52), [#103](https://github.com/affaan-m/everything-claude-code/issues/103)). The behavior changed between Claude Code versions, leading to confusion. We now have a regression test to prevent this from being reintroduced.

---

## インストール

### オプション 1: プラグインとしてインストール（推奨）

このリポジトリを使う最も簡単な方法 - Claude Code プラグインとしてインストール：

```bash
# このリポジトリをマーケットプレイスとして追加
/plugin marketplace add affaan-m/everything-claude-code

# プラグインをインストール
/plugin install everything-claude-code@everything-claude-code
```

または `~/.claude/settings.json` に直接追加：

```json
{
  "extraKnownMarketplaces": {
    "everything-claude-code": {
      "source": {
        "source": "github",
        "repo": "affaan-m/everything-claude-code"
      }
    }
  },
  "enabledPlugins": {
    "everything-claude-code@everything-claude-code": true
  }
}
```

これですべての command、agent、skill、hook に即座にアクセスできます。

> **Note:** The Claude Code plugin system does not support distributing `rules` via plugins ([upstream limitation](https://code.claude.com/docs/en/plugins-reference)). You need to install rules manually:
>
> ```bash
> # Clone the repo first
> git clone https://github.com/affaan-m/everything-claude-code.git
>
> # Option A: User-level rules (applies to all projects)
> cp -r everything-claude-code/rules/common/* ~/.claude/rules/
> cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/   # pick your stack
> cp -r everything-claude-code/rules/python/* ~/.claude/rules/
> cp -r everything-claude-code/rules/golang/* ~/.claude/rules/
>
> # Option B: Project-level rules (applies to current project only)
> mkdir -p .claude/rules
> cp -r everything-claude-code/rules/common/* .claude/rules/
> cp -r everything-claude-code/rules/typescript/* .claude/rules/     # pick your stack
> ```

---

### オプション 2: 手動インストール

インストール内容を手動で制御したい場合：

```bash
# リポジトリをクローン
git clone https://github.com/affaan-m/everything-claude-code.git

# agent を Claude 設定にコピー
cp everything-claude-code/agents/*.md ~/.claude/agents/

# rule をコピー（common + 言語固有）
cp -r everything-claude-code/rules/common/* ~/.claude/rules/
cp -r everything-claude-code/rules/typescript/* ~/.claude/rules/   # pick your stack
cp -r everything-claude-code/rules/python/* ~/.claude/rules/
cp -r everything-claude-code/rules/golang/* ~/.claude/rules/

# command をコピー
cp everything-claude-code/commands/*.md ~/.claude/commands/

# skill をコピー
cp -r everything-claude-code/skills/* ~/.claude/skills/
```

#### settings.json に hook を追加

`hooks/hooks.json` から hook を `~/.claude/settings.json` にコピーしてください。

#### MCP を設定

`mcp-configs/mcp-servers.json` から必要な MCP サーバーを `~/.claude.json` にコピーしてください。

**重要:** `YOUR_*_HERE` プレースホルダーを実際の API キーに置き換えてください。

---

## 主要コンセプト

### Agents

サブエージェントは限定されたスコープで委譲されたタスクを処理します。例：

```markdown
---
name: code-reviewer
description: 品質、セキュリティ、保守性のためにコードをレビューする
tools: ["Read", "Grep", "Glob", "Bash"]
model: opus
---

あなたはシニアコードレビュアーです...
```

### Skills

skill は command または agent によって呼び出されるワークフロー定義です：

```markdown
# TDD ワークフロー

1. まずインターフェースを定義
2. 失敗するテストを書く（RED）
3. 最小限のコードを実装（GREEN）
4. リファクタリング（IMPROVE）
5. 80%以上のカバレッジを確認
```

### Hooks

hook はツールイベントで発火します。例 - console.log について警告：

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] console.log を削除してください' >&2"
  }]
}
```

### Rules

rule は常に従うガイドラインです。`common/`（言語非依存）+ 言語固有のディレクトリで構成されています：

```
rules/
  common/          # 普遍的な原則（常にインストール）
  typescript/      # TS/JS 固有のパターンとツール
  python/          # Python 固有のパターンとツール
  golang/          # Go 固有のパターンとツール
```

See [`rules/README.md`](rules/README.md) for installation and structure details.

---

## テストの実行

プラグインには包括的なテストスイートが含まれています：

```bash
# すべてのテストを実行
node tests/run-all.js

# 個別のテストファイルを実行
node tests/lib/utils.test.js
node tests/lib/package-manager.test.js
node tests/hooks/hooks.test.js
```

---

## コントリビュート

**コントリビュートを歓迎し、推奨しています。**

このリポジトリはコミュニティリソースとなることを目的としています。以下をお持ちの場合：
- 便利な agent や skill
- 賢い hook
- より良い MCP 設定
- 改善された rule

ぜひコントリビュートしてください！ガイドラインは [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。

### コントリビュートのアイデア

- 言語固有の skill（Rust、C#、Swift、Kotlin）-- Go、Python、Java は含まれています
- フレームワーク固有の設定（Rails、Laravel、FastAPI、NestJS）-- Django、Spring Boot は含まれています
- DevOps agent（Kubernetes、Terraform、AWS、Docker）
- テスト戦略（さまざまなフレームワーク、ビジュアルリグレッション）
- ドメイン固有の知識（ML、データエンジニアリング、モバイル）

---

## OpenCode Support

ECC provides **full OpenCode support** including plugins and hooks.

### Quick Start

```bash
# Install OpenCode
npm install -g opencode

# Run in the repository root
opencode
```

The configuration is automatically detected from `.opencode/opencode.json`.

### Feature Parity

| Feature | Claude Code | OpenCode | Status |
|---------|-------------|----------|--------|
| Agents | 14 agents | 12 agents | **Claude Code leads** |
| Commands | 30 commands | 24 commands | **Claude Code leads** |
| Skills | 28 skills | 16 skills | **Claude Code leads** |
| Hooks | 3 phases | 20+ events | **OpenCode has more!** |
| Rules | 8 rules | 8 rules | **Full parity** |
| MCP Servers | Full | Full | **Full parity** |
| Custom Tools | Via hooks | Native support | **OpenCode is better** |

### Hook Support via Plugins

OpenCode's plugin system is MORE sophisticated than Claude Code with 20+ event types:

| Claude Code Hook | OpenCode Plugin Event |
|-----------------|----------------------|
| PreToolUse | `tool.execute.before` |
| PostToolUse | `tool.execute.after` |
| Stop | `session.idle` |
| SessionStart | `session.created` |
| SessionEnd | `session.deleted` |

**Additional OpenCode events**: `file.edited`, `file.watcher.updated`, `message.updated`, `lsp.client.diagnostics`, `tui.toast.show`, and more.

### Available Commands (24)

| Command | Description |
|---------|-------------|
| `/plan` | Create implementation plan |
| `/tdd` | Enforce TDD workflow |
| `/code-review` | Review code changes |
| `/security` | Run security review |
| `/build-fix` | Fix build errors |
| `/e2e` | Generate E2E tests |
| `/refactor-clean` | Remove dead code |
| `/orchestrate` | Multi-agent workflow |
| `/learn` | Extract patterns from session |
| `/checkpoint` | Save verification state |
| `/verify` | Run verification loop |
| `/eval` | Evaluate against criteria |
| `/update-docs` | Update documentation |
| `/update-codemaps` | Update codemaps |
| `/test-coverage` | Analyze coverage |
| `/go-review` | Go code review |
| `/go-test` | Go TDD workflow |
| `/go-build` | Fix Go build errors |
| `/skill-create` | Generate skills from git |
| `/instinct-status` | View learned instincts |
| `/instinct-import` | Import instincts |
| `/instinct-export` | Export instincts |
| `/evolve` | Cluster instincts into skills |
| `/setup-pm` | Configure package manager |

### Plugin Installation

**Option 1: Use directly**
```bash
cd everything-claude-code
opencode
```

**Option 2: Install as npm package**
```bash
npm install opencode-ecc
```

Then add to your `opencode.json`:
```json
{
  "plugin": ["opencode-ecc"]
}
```

### Documentation

- **Migration Guide**: `.opencode/MIGRATION.md`
- **OpenCode Plugin README**: `.opencode/README.md`
- **Consolidated Rules**: `.opencode/instructions/INSTRUCTIONS.md`
- **LLM Documentation**: `llms.txt` (complete OpenCode docs for LLMs)

---

## 背景

私は実験的ロールアウトから Claude Code を使用しています。2025年9月に [@DRodriguezFX](https://x.com/DRodriguezFX) と共に [zenith.chat](https://zenith.chat) を構築して Anthropic x Forum Ventures ハッカソンで優勝しました - すべて Claude Code を使用して。

これらの設定は複数の本番アプリケーションで実戦テスト済みです。

---

## 重要な注意事項

### コンテキストウィンドウ管理

**重要:** すべての MCP を一度に有効にしないでください。有効なツールが多すぎると、200k のコンテキストウィンドウが 70k に縮小する可能性があります。

目安：
- 20-30 の MCP を設定
- プロジェクトごとに 10 個未満を有効化
- アクティブなツールは 80 個未満

プロジェクト設定で `disabledMcpServers` を使用して未使用のものを無効にしてください。

### カスタマイズ

これらの設定は私のワークフロー向けです。あなたは：
1. 共感できるものから始める
2. 自分のスタックに合わせて修正
3. 使わないものは削除
4. 独自のパターンを追加

---

## Star 履歴

[![Star History Chart](https://api.star-history.com/svg?repos=affaan-m/everything-claude-code&type=Date)](https://star-history.com/#affaan-m/everything-claude-code&Date)

---

## リンク

- **簡易ガイド（まずはこちら）:** [The Shorthand Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2012378465664745795)
- **詳細ガイド（上級）:** [The Longform Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2014040193557471352)
- **フォロー:** [@affaanmustafa](https://x.com/affaanmustafa)
- **zenith.chat:** [zenith.chat](https://zenith.chat)

---

## ライセンス

MIT - 自由に使用し、必要に応じて修正し、可能であればコントリビュートしてください。

---

**役に立ったらこのリポジトリに Star を。両方のガイドを読んでください。素晴らしいものを作りましょう。**
