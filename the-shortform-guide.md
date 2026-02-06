# Everything Claude Code 簡易ガイド

---

**2月の実験的ロールアウト以来、Claude Code を愛用しています。[@DRodriguezFX](https://x.com/DRodriguezFX) と共に [zenith.chat](https://zenith.chat) を開発し、Anthropic x Forum Ventures ハッカソンで優勝しました。すべて Claude Code だけで構築しています。**

10ヶ月以上の日常利用を経た、私の完全なセットアップを紹介します：スキル、フック、サブエージェント、MCP、プラグイン、そして実際に効果があったものをまとめました。

---

## スキルとコマンド

スキルはルールのように機能しますが、特定のスコープやワークフローに限定されます。特定のワークフローを実行する際のプロンプトの省略形です。

Opus 4.5 との長いコーディングセッションの後、デッドコードや不要な .md ファイルを整理したい場合は `/refactor-clean` を実行します。テストが必要な場合は `/tdd`、`/e2e`、`/test-coverage` を使います。スキルにはコードマップも含められます。これは Claude がコンテキストを消費せずにコードベースを素早くナビゲートする方法です。

コマンドはスラッシュコマンドとして実行されるスキルです。両者は重複しますが、保存場所が異なります：

- **スキル**: `~/.claude/skills/` - より広範なワークフロー定義
- **コマンド**: `~/.claude/commands/` - すぐに実行できるプロンプト

```bash
# スキル構成の例
~/.claude/skills/
  pmx-guidelines.md      # プロジェクト固有のパターン
  coding-standards.md    # 言語のベストプラクティス
  tdd-workflow/          # 複数ファイルからなるスキル（README.md付き）
  security-review/       # チェックリスト型スキル
```

---

## フック

フックは特定のイベントで発火するトリガーベースの自動化です。スキルとは異なり、ツールコールとライフサイクルイベントに限定されます。

**フックの種類:**

1. **PreToolUse** - ツール実行前（バリデーション、リマインダー）
2. **PostToolUse** - ツール完了後（フォーマット、フィードバックループ）
3. **UserPromptSubmit** - メッセージ送信時
4. **Stop** - Claude の応答完了時
5. **PreCompact** - コンテキスト圧縮前
6. **Notification** - 権限リクエスト時

**例: 長時間実行コマンド前の tmux リマインダー**

```json
{
  "PreToolUse": [
    {
      "matcher": "tool == \"Bash\" && tool_input.command matches \"(npm|pnpm|yarn|cargo|pytest)\"",
      "hooks": [
        {
          "type": "command",
          "command": "if [ -z \"$TMUX\" ]; then echo '[Hook] Consider tmux for session persistence' >&2; fi"
        }
      ]
    }
  ]
}
```

**ヒント:** `hookify` プラグインを使えば、JSON を手書きする代わりに会話形式でフックを作成できます。`/hookify` を実行して、やりたいことを説明するだけです。

---

## サブエージェント

サブエージェントは、オーケストレータ（メインの Claude）が限定されたスコープでタスクを委任できるプロセスです。バックグラウンドまたはフォアグラウンドで実行でき、メインエージェントのコンテキストを解放します。

サブエージェントはスキルとうまく連携します。スキルのサブセットを実行できるサブエージェントにタスクを委任し、それらのスキルを自律的に使用させることができます。また、特定のツール権限でサンドボックス化することも可能です。

```bash
# サブエージェント構成の例
~/.claude/agents/
  planner.md           # 機能実装の計画
  architect.md         # システム設計の判断
  tdd-guide.md         # テスト駆動開発
  code-reviewer.md     # 品質・セキュリティレビュー
  security-reviewer.md # 脆弱性分析
  build-error-resolver.md
  e2e-runner.md
  refactor-cleaner.md
```

サブエージェントごとに、許可されるツール、MCP、権限を設定して適切なスコープを確保してください。

---

## ルールとメモリ

`.rules` フォルダには、Claude が**常に**従うべきベストプラクティスを記述した `.md` ファイルを配置します。2つのアプローチがあります：

1. **単一の CLAUDE.md** - すべてを1つのファイルに（ユーザーレベルまたはプロジェクトレベル）
2. **rules フォルダ** - 関心事ごとにモジュール化された `.md` ファイル

```bash
~/.claude/rules/
  security.md      # シークレットのハードコード禁止、入力バリデーション
  coding-style.md  # イミュータビリティ、ファイル構成
  testing.md       # TDD ワークフロー、80% カバレッジ
  git-workflow.md  # コミットフォーマット、PR プロセス
  agents.md        # サブエージェントへの委任タイミング
  performance.md   # モデル選択、コンテキスト管理
```

**ルールの例:**

- コードベースに絵文字を使わない
- フロントエンドで紫系の色を避ける
- デプロイ前に必ずテストする
- 巨大ファイルよりモジュール化されたコードを優先
- console.log をコミットしない

---

## MCP（Model Context Protocol）

MCP は Claude を外部サービスに直接接続します。API の代替ではなく、API のプロンプト駆動型ラッパーであり、情報のナビゲーションにおいてより柔軟性を提供します。

**例:** Supabase MCP を使えば、Claude は特定のデータを取得し、コピー＆ペーストなしで上流に直接 SQL を実行できます。データベース、デプロイプラットフォームなども同様です。

**Chrome in Claude（ブラウザ操作）:** Claude がブラウザを自律的に操作できる組み込みプラグイン MCP です。クリックして動作を確認できます。

**重要: コンテキストウィンドウの管理**

MCP の選択は慎重に行ってください。すべての MCP をユーザー設定に登録していますが、**使用しないものはすべて無効化**しています。`/plugins` に移動してスクロールするか、`/mcp` を実行してください。

圧縮前の 200k コンテキストウィンドウも、ツールを有効化しすぎると 70k 程度にまで縮小する可能性があります。パフォーマンスが大幅に低下します。

**目安:** 設定には 20〜30 個の MCP を登録しつつ、有効化は 10 個未満、アクティブなツールは 80 個未満に抑えてください。

```bash
# 有効な MCP を確認
/mcp

# ~/.claude.json の projects.disabledMcpServers で未使用のものを無効化
```

---

## プラグイン

プラグインは、面倒な手動セットアップの代わりにツールをパッケージ化して簡単にインストールできるようにしたものです。プラグインはスキル + MCP の組み合わせや、フック/ツールのバンドルになり得ます。

**プラグインのインストール:**

```bash
# マーケットプレイスを追加
claude plugin marketplace add https://github.com/mixedbread-ai/mgrep

# Claude を開き、/plugins を実行、新しいマーケットプレイスを見つけてインストール
```

**LSP プラグイン**は、エディタ外で Claude Code を頻繁に使用する場合に特に便利です。Language Server Protocol により、IDE を開かなくてもリアルタイムの型チェック、定義へのジャンプ、インテリジェントな補完が可能になります。

```bash
# 有効なプラグインの例
typescript-lsp@claude-plugins-official  # TypeScript インテリジェンス
pyright-lsp@claude-plugins-official     # Python 型チェック
hookify@claude-plugins-official         # 会話形式でフック作成
mgrep@Mixedbread-Grep                   # ripgrep より優れた検索
```

MCP と同様の注意点として、コンテキストウィンドウに注意してください。

---

## ヒントとテクニック

### キーボードショートカット

- `Ctrl+U` - 行全体を削除（バックスペース連打より高速）
- `!` - クイック bash コマンドプレフィックス
- `@` - ファイル検索
- `/` - スラッシュコマンドの開始
- `Shift+Enter` - 複数行入力
- `Tab` - 思考プロセスの表示切り替え
- `Esc Esc` - Claude の中断 / コードの復元

### 並列ワークフロー

- **Fork**（`/fork`）- 会話をフォークして、重複しないタスクをキューに溜めたメッセージの代わりに並列実行
- **Git Worktrees** - コンフリクトなしに複数の Claude を並列実行。各 worktree は独立したチェックアウト

```bash
git worktree add ../feature-branch feature-branch
# 各 worktree で個別の Claude インスタンスを実行
```

### 長時間実行コマンド用の tmux

Claude が実行するログや bash プロセスをストリーミングで監視できます：

https://github.com/user-attachments/assets/shortform/07-tmux-video.mp4

```bash
tmux new -s dev
# Claude がここでコマンドを実行、デタッチ・リアタッチ可能
tmux attach -t dev
```

### mgrep > grep

`mgrep` は ripgrep/grep から大幅に改善されたツールです。プラグインマーケットプレイスからインストールし、`/mgrep` スキルを使用してください。ローカル検索と Web 検索の両方に対応しています。

```bash
mgrep "function handleSubmit"  # ローカル検索
mgrep --web "Next.js 15 app router changes"  # Web 検索
```

### その他の便利なコマンド

- `/rewind` - 以前の状態に戻る
- `/statusline` - ブランチ、コンテキスト残量 %、TODO でカスタマイズ
- `/checkpoints` - ファイルレベルのアンドゥポイント
- `/compact` - コンテキスト圧縮を手動で実行

### GitHub Actions CI/CD

GitHub Actions で PR のコードレビューを設定できます。設定すれば、Claude が自動的に PR をレビューします。

### サンドボックス

リスクのある操作にはサンドボックスモードを使用してください。Claude は実際のシステムに影響を与えない制限された環境で実行されます。

---

## エディタについて

エディタの選択は Claude Code のワークフローに大きく影響します。Claude Code はどのターミナルからでも動作しますが、優れたエディタと組み合わせることで、リアルタイムのファイル追跡、素早いナビゲーション、統合されたコマンド実行が可能になります。

### Zed（私の推奨）

私は [Zed](https://zed.dev) を使用しています。Rust で書かれているため、本当に高速です。瞬時に起動し、大規模なコードベースでも問題なく処理でき、システムリソースをほとんど消費しません。

**Zed + Claude Code が優れた組み合わせである理由:**

- **速度** - Rust ベースのパフォーマンスにより、Claude が高速にファイルを編集してもラグがありません。エディタが追従します
- **エージェントパネル統合** - Zed の Claude 統合により、Claude がファイルを編集する際のリアルタイムな変更追跡が可能です。エディタを離れずに Claude が参照するファイル間を移動できます
- **CMD+Shift+R コマンドパレット** - カスタムスラッシュコマンド、デバッガー、ビルドスクリプトに検索可能な UI から素早くアクセス
- **最小限のリソース使用** - 重い操作中に Claude と RAM/CPU を奪い合いません。Opus を実行する際に重要です
- **Vim モード** - 完全な vim キーバインディングをサポート

**エディタに依存しないヒント:**

1. **画面を分割** - 片側に Claude Code のターミナル、もう片側にエディタ
2. **Ctrl + G** - Zed で Claude が現在作業中のファイルを素早く開く
3. **自動保存** - 自動保存を有効にして、Claude のファイル読み取りが常に最新になるようにする
4. **Git 統合** - エディタの Git 機能を使って、コミット前に Claude の変更をレビュー
5. **ファイルウォッチャー** - ほとんどのエディタは変更されたファイルを自動リロードします。有効になっていることを確認してください

### VSCode / Cursor

こちらも有力な選択肢で、Claude Code とうまく連携します。ターミナル形式で使用でき、`\ide` でエディタとの自動同期により LSP 機能が有効になります（プラグインの登場でやや冗長になりましたが）。または、エディタにより統合された UI を持つ拡張機能を選ぶこともできます。

---

## 著者の構成

### プラグイン

**インストール済み:**（通常、同時に有効にするのは 4〜5 個程度です）

```markdown
ralph-wiggum@claude-code-plugins       # ループ自動化
frontend-design@claude-code-plugins    # UI/UX パターン
commit-commands@claude-code-plugins    # Git ワークフロー
security-guidance@claude-code-plugins  # セキュリティチェック
pr-review-toolkit@claude-code-plugins  # PR 自動化
typescript-lsp@claude-plugins-official # TS インテリジェンス
hookify@claude-plugins-official        # フック作成
code-simplifier@claude-plugins-official
feature-dev@claude-code-plugins
explanatory-output-style@claude-code-plugins
code-review@claude-code-plugins
context7@claude-plugins-official       # ライブドキュメント
pyright-lsp@claude-plugins-official    # Python 型チェック
mgrep@Mixedbread-Grep                  # 高性能検索
```

### MCP サーバー

**設定済み（ユーザーレベル）:**

```json
{
  "github": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"] },
  "firecrawl": { "command": "npx", "args": ["-y", "firecrawl-mcp"] },
  "supabase": {
    "command": "npx",
    "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref=YOUR_REF"]
  },
  "memory": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-memory"] },
  "sequential-thinking": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
  },
  "vercel": { "type": "http", "url": "https://mcp.vercel.com" },
  "railway": { "command": "npx", "args": ["-y", "@railway/mcp-server"] },
  "cloudflare-docs": { "type": "http", "url": "https://docs.mcp.cloudflare.com/mcp" },
  "cloudflare-workers-bindings": {
    "type": "http",
    "url": "https://bindings.mcp.cloudflare.com/mcp"
  },
  "clickhouse": { "type": "http", "url": "https://mcp.clickhouse.cloud/mcp" },
  "AbletonMCP": { "command": "uvx", "args": ["ableton-mcp"] },
  "magic": { "command": "npx", "args": ["-y", "@magicuidesign/mcp@latest"] }
}
```

ポイントは、14 個の MCP を設定していますが、プロジェクトごとに有効にするのは約 5〜6 個だけということです。コンテキストウィンドウを健全に保てます。

### 主要なフック

```json
{
  "PreToolUse": [
    { "matcher": "npm|pnpm|yarn|cargo|pytest", "hooks": ["tmux リマインダー"] },
    { "matcher": "Write && .md file", "hooks": ["README/CLAUDE 以外はブロック"] },
    { "matcher": "git push", "hooks": ["レビュー用にエディタを開く"] }
  ],
  "PostToolUse": [
    { "matcher": "Edit && .ts/.tsx/.js/.jsx", "hooks": ["prettier --write"] },
    { "matcher": "Edit && .ts/.tsx", "hooks": ["tsc --noEmit"] },
    { "matcher": "Edit", "hooks": ["console.log 警告を grep"] }
  ],
  "Stop": [
    { "matcher": "*", "hooks": ["変更ファイルの console.log を確認"] }
  ]
}
```

### カスタムステータスライン

ユーザー名、ディレクトリ、ダーティインジケーター付き Git ブランチ、コンテキスト残量 %、モデル、時刻、TODO 数を表示します：

```
affoon:~ ctx:65% Opus 4.5 19:52
▌▌ plan mode on (shift+tab to cycle)
```

### ルール構成

```
~/.claude/rules/
  security.md      # 必須のセキュリティチェック
  coding-style.md  # イミュータビリティ、ファイルサイズ制限
  testing.md       # TDD、80% カバレッジ
  git-workflow.md  # Conventional Commits
  agents.md        # サブエージェント委任ルール
  patterns.md      # API レスポンスフォーマット
  performance.md   # モデル選択（Haiku vs Sonnet vs Opus）
  hooks.md         # フックのドキュメント
```

### サブエージェント

```
~/.claude/agents/
  planner.md           # 機能の分解
  architect.md         # システム設計
  tdd-guide.md         # テストファースト
  code-reviewer.md     # 品質レビュー
  security-reviewer.md # 脆弱性スキャン
  build-error-resolver.md
  e2e-runner.md        # Playwright テスト
  refactor-cleaner.md  # デッドコード削除
  doc-updater.md       # ドキュメント同期
```

---

## まとめ

1. **複雑にしすぎない** - 設定はアーキテクチャではなくファインチューニングとして扱う
2. **コンテキストウィンドウは貴重** - 未使用の MCP やプラグインは無効化する
3. **並列実行** - 会話のフォーク、Git worktrees を活用する
4. **繰り返し作業を自動化** - フォーマット、リント、リマインダーにフックを使う
5. **サブエージェントのスコープを限定** - ツールを制限 = 集中した実行

---

## 参考リンク

- [Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Hooks Documentation](https://code.claude.com/docs/en/hooks)
- [Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Interactive Mode](https://code.claude.com/docs/en/interactive-mode)
- [Memory System](https://code.claude.com/docs/en/memory)
- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [MCP Overview](https://code.claude.com/docs/en/mcp-overview)

---

*NYC で開催された Anthropic x Forum Ventures ハッカソンで、[@DRodriguezFX](https://x.com/DRodriguezFX) と共に [zenith.chat](https://zenith.chat) を開発して優勝しました*
