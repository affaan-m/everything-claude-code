# Everything Claude Code

[![Stars](https://img.shields.io/github/stars/affaan-m/everything-claude-code?style=flat)](https://github.com/affaan-m/everything-claude-code/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Shell](https://img.shields.io/badge/-Shell-4EAA25?logo=gnu-bash&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Markdown](https://img.shields.io/badge/-Markdown-000000?logo=markdown&logoColor=white)

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
|   |-- setup-pm.md         # /setup-pm - パッケージマネージャーを設定（新規）
|
|-- rules/            # 常に従うガイドライン（~/.claude/rules/ にコピー）
|   |-- security.md         # 必須セキュリティチェック
|   |-- coding-style.md     # イミュータビリティ、ファイル構成
|   |-- testing.md          # TDD、80% カバレッジ要件
|   |-- git-workflow.md     # コミット形式、PR プロセス
|   |-- agents.md           # サブエージェントに委譲するタイミング
|   |-- performance.md      # モデル選択、コンテキスト管理
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

### ecc.tools - Skill Creator

リポジトリから Claude Code skill を自動生成します。

[GitHub App をインストール](https://github.com/apps/skill-creator) | [ecc.tools](https://ecc.tools)

リポジトリを分析して以下を作成します：
- **SKILL.md ファイル** - Claude Code ですぐに使える skill
- **Instinct コレクション** - continuous-learning-v2 用
- **パターン抽出** - コミット履歴から学習

```bash
# GitHub App インストール後、skill は以下に表示されます：
~/.claude/skills/generated/
```

`continuous-learning-v2` skill と連携して instinct を継承します。

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

---

### オプション 2: 手動インストール

インストール内容を手動で制御したい場合：

```bash
# リポジトリをクローン
git clone https://github.com/affaan-m/everything-claude-code.git

# agent を Claude 設定にコピー
cp everything-claude-code/agents/*.md ~/.claude/agents/

# rule をコピー
cp everything-claude-code/rules/*.md ~/.claude/rules/

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

rule は常に従うガイドラインです。モジュラーに保ちましょう：

```
~/.claude/rules/
  security.md      # シークレットのハードコード禁止
  coding-style.md  # イミュータビリティ、ファイル制限
  testing.md       # TDD、カバレッジ要件
```

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

- 言語固有の skill（Python、Go、Rust パターン）
- フレームワーク固有の設定（Django、Rails、Laravel）
- DevOps agent（Kubernetes、Terraform、AWS）
- テスト戦略（さまざまなフレームワーク）
- ドメイン固有の知識（ML、データエンジニアリング、モバイル）

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
