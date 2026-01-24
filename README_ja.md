# Everything Claude Code

**Anthropicハッカソン優勝者による、Claude Code設定の完全コレクション**

実際のプロダクト開発で10ヶ月以上の集中的な日常使用を通じて進化した、本番環境対応のエージェント、スキル、フック、コマンド、ルール、MCP設定。

---

## ガイド

このリポジトリは生のコードのみです。ガイドですべてを解説しています。

### まずはここから：ショートハンドガイド

<img width="592" height="445" alt="image" src="https://github.com/user-attachments/assets/1a471488-59cc-425b-8345-5245c7efbcef" />

**[The Shorthand Guide to Everything Claude Code（日本語版）](shorthand-guide_ja.md)** | [原文](https://x.com/affaanmustafa/status/2012378465664745795)

基礎編 - 各設定タイプの役割、セットアップの構造化方法、コンテキストウィンドウ管理、そしてこれらの設定の背景にある哲学。**まずこれを読んでください。**

---

### 次に：ロングフォームガイド

<img width="609" height="428" alt="image" src="https://github.com/user-attachments/assets/c9ca43bc-b149-427f-b551-af6840c368f0" />

**[The Longform Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2014040193557471352)**

上級テクニック編 - トークン最適化、セッション間のメモリ永続化、検証ループと評価、並列化戦略、サブエージェントオーケストレーション、継続的学習。このガイドのすべての内容は、このリポジトリに動作するコードがあります。

| トピック | 学べること |
|---------|-----------|
| トークン最適化 | モデル選択、システムプロンプトのスリム化、バックグラウンドプロセス |
| メモリ永続化 | セッション間でコンテキストを自動保存・読み込みするフック |
| 継続的学習 | セッションからパターンを自動抽出し、再利用可能なスキルに |
| 検証ループ | チェックポイントvs継続評価、グレーダータイプ、pass@kメトリクス |
| 並列化 | Gitワークツリー、カスケードメソッド、インスタンスをスケールするタイミング |
| サブエージェントオーケストレーション | コンテキスト問題、反復的取得パターン |

---

## 内容

このリポジトリは**Claude Codeプラグイン**です - 直接インストールするか、手動でコンポーネントをコピーできます。

```
everything-claude-code/
|-- .claude-plugin/   # プラグインとマーケットプレイスマニフェスト
|   |-- plugin.json         # プラグインメタデータとコンポーネントパス
|   |-- marketplace.json    # /plugin marketplace add用のマーケットプレイスカタログ
|
|-- agents/           # 委任用の特化型サブエージェント
|   |-- planner.md           # 機能実装計画
|   |-- architect.md         # システム設計判断
|   |-- tdd-guide.md         # テスト駆動開発
|   |-- code-reviewer.md     # 品質とセキュリティレビュー
|   |-- security-reviewer.md # 脆弱性分析
|   |-- build-error-resolver.md
|   |-- e2e-runner.md        # Playwright E2Eテスト
|   |-- refactor-cleaner.md  # デッドコードクリーンアップ
|   |-- doc-updater.md       # ドキュメント同期
|
|-- skills/           # ワークフロー定義とドメイン知識
|   |-- coding-standards/           # 言語ベストプラクティス
|   |-- backend-patterns/           # API、データベース、キャッシングパターン
|   |-- frontend-patterns/          # React、Next.jsパターン
|   |-- continuous-learning/        # セッションからパターンを自動抽出（ロングフォームガイド）
|   |-- strategic-compact/          # 手動コンパクション提案（ロングフォームガイド）
|   |-- tdd-workflow/               # TDD方法論
|   |-- security-review/            # セキュリティチェックリスト
|   |-- eval-harness/               # 検証ループ評価（ロングフォームガイド）
|   |-- verification-loop/          # 継続的検証（ロングフォームガイド）
|
|-- commands/         # クイック実行用のスラッシュコマンド
|   |-- tdd.md              # /tdd - テスト駆動開発
|   |-- plan.md             # /plan - 実装計画
|   |-- e2e.md              # /e2e - E2Eテスト生成
|   |-- code-review.md      # /code-review - 品質レビュー
|   |-- build-fix.md        # /build-fix - ビルドエラー修正
|   |-- refactor-clean.md   # /refactor-clean - デッドコード削除
|   |-- learn.md            # /learn - セッション中にパターンを抽出（ロングフォームガイド）
|   |-- checkpoint.md       # /checkpoint - 検証状態を保存（ロングフォームガイド）
|   |-- verify.md           # /verify - 検証ループを実行（ロングフォームガイド）
|
|-- rules/            # 常に従うガイドライン（~/.claude/rules/にコピー）
|   |-- security.md         # 必須セキュリティチェック
|   |-- coding-style.md     # イミュータビリティ、ファイル構成
|   |-- testing.md          # TDD、80%カバレッジ要件
|   |-- git-workflow.md     # コミットフォーマット、PRプロセス
|   |-- agents.md           # サブエージェントに委任するタイミング
|   |-- performance.md      # モデル選択、コンテキスト管理
|
|-- hooks/            # トリガーベースの自動化
|   |-- hooks.json                # 全フック設定（PreToolUse、PostToolUse、Stopなど）
|   |-- memory-persistence/       # セッションライフサイクルフック（ロングフォームガイド）
|   |-- strategic-compact/        # コンパクション提案（ロングフォームガイド）
|
|-- contexts/         # 動的システムプロンプト注入コンテキスト（ロングフォームガイド）
|   |-- dev.md              # 開発モードコンテキスト
|   |-- review.md           # コードレビューモードコンテキスト
|   |-- research.md         # リサーチ/探索モードコンテキスト
|
|-- examples/         # 設定例とセッション例
|   |-- CLAUDE.md           # プロジェクトレベル設定例
|   |-- user-CLAUDE.md      # ユーザーレベル設定例
|
|-- mcp-configs/      # MCPサーバー設定
|   |-- mcp-servers.json    # GitHub、Supabase、Vercel、Railwayなど
|
|-- marketplace.json  # セルフホストマーケットプレイス設定（/plugin marketplace add用）
```

---

## インストール

### オプション1：プラグインとしてインストール（推奨）

最も簡単な方法 - Claude Codeプラグインとしてインストール：

```bash
# このリポジトリをマーケットプレイスとして追加
/plugin marketplace add affaan-m/everything-claude-code

# プラグインをインストール
/plugin install everything-claude-code@everything-claude-code
```

または`~/.claude/settings.json`に直接追加：

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

これにより、すべてのコマンド、エージェント、スキル、フックに即座にアクセスできます。

---

### オプション2：手動インストール

何をインストールするか手動で制御したい場合：

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

#### settings.jsonにフックを追加

`hooks/hooks.json`のフックを`~/.claude/settings.json`にコピーします。

#### MCPを設定

`mcp-configs/mcp-servers.json`から必要なMCPサーバーを`~/.claude.json`にコピーします。

**重要：** `YOUR_*_HERE`プレースホルダーを実際のAPIキーに置き換えてください。

---

### ガイドを読む

本当に、ガイドを読んでください。これらの設定は文脈があると10倍理解しやすくなります。

1. **[ショートハンドガイド（日本語版）](shorthand-guide_ja.md)** - セットアップと基礎
2. **[ロングフォームガイド](https://x.com/affaanmustafa/status/2014040193557471352)** - 上級テクニック（トークン最適化、メモリ永続化、評価、並列化）

---

## 主要コンセプト

### エージェント

サブエージェントは限定されたスコープで委任されたタスクを処理します。例：

```markdown
---
name: code-reviewer
description: コードの品質、セキュリティ、保守性をレビュー
tools: Read, Grep, Glob, Bash
model: opus
---

あなたはシニアコードレビュアーです...
```

### スキル

スキルはコマンドやエージェントによって呼び出されるワークフロー定義です：

```markdown
# TDDワークフロー

1. まずインターフェースを定義
2. 失敗するテストを書く（RED）
3. 最小限のコードを実装（GREEN）
4. リファクタリング（IMPROVE）
5. 80%以上のカバレッジを確認
```

### フック

フックはツールイベントで発火します。例 - console.logについて警告：

```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\ngrep -n 'console\\.log' \"$file_path\" && echo '[Hook] console.logを削除してください' >&2"
  }]
}
```

### ルール

ルールは常に従うガイドラインです。モジュール化して管理：

```
~/.claude/rules/
  security.md      # ハードコードされたシークレット禁止
  coding-style.md  # イミュータビリティ、ファイル制限
  testing.md       # TDD、カバレッジ要件
```

---

## コントリビューション

**コントリビューションは歓迎です。**

このリポジトリはコミュニティリソースとして意図されています。以下をお持ちの場合：
- 便利なエージェントやスキル
- 賢いフック
- より良いMCP設定
- 改善されたルール

ぜひコントリビュートしてください！ガイドラインは[CONTRIBUTING.md](CONTRIBUTING.md)をご覧ください。

### コントリビューションのアイデア

- 言語固有のスキル（Python、Go、Rustパターン）
- フレームワーク固有の設定（Django、Rails、Laravel）
- DevOpsエージェント（Kubernetes、Terraform、AWS）
- テスト戦略（異なるフレームワーク）
- ドメイン固有の知識（ML、データエンジニアリング、モバイル）

---

## 背景

私は実験的ロールアウトからClaude Codeを使用しています。2025年9月のAnthropic x Forum Venturesハッカソンで[@DRodriguezFX](https://x.com/DRodriguezFX)と一緒に[zenith.chat](https://zenith.chat)を構築して優勝しました - すべてClaude Codeを使用して。

これらの設定は複数の本番アプリケーションで実戦テスト済みです。

---

## 重要な注意事項

### コンテキストウィンドウ管理

**重要：** すべてのMCPを一度に有効にしないでください。200kのコンテキストウィンドウが、有効なツールが多すぎると70kに縮小する可能性があります。

目安：
- 20-30のMCPを設定
- プロジェクトごとに10未満を有効に
- アクティブなツールは80未満

未使用のものを無効にするにはプロジェクト設定で`disabledMcpServers`を使用してください。

### カスタマイズ

これらの設定は私のワークフロー向けです。あなたは：
1. 共感できるものから始める
2. 自分のスタックに合わせて修正
3. 使わないものを削除
4. 自分のパターンを追加

---

## リンク

- **ショートハンドガイド（ここから始める）：** [日本語版](shorthand-guide_ja.md) | [原文](https://x.com/affaanmustafa/status/2012378465664745795)
- **ロングフォームガイド（上級）：** [The Longform Guide to Everything Claude Code](https://x.com/affaanmustafa/status/2014040193557471352)
- **フォロー：** [@affaanmustafa](https://x.com/affaanmustafa)
- **zenith.chat：** [zenith.chat](https://zenith.chat)

---

## ライセンス

MIT - 自由に使用、必要に応じて修正、可能であればコントリビュートしてください。

---

**役に立ったらこのリポジトリにスターを。両方のガイドを読んでください。素晴らしいものを作りましょう。**
