# The Shorthand Guide to Everything Claude Code - 日本語版

**原文：[@affaanmustafa](https://x.com/affaanmustafa/status/2012378465664745795)**

Anthropicハッカソン優勝者が10ヶ月以上の日常使用で培ったClaude Code設定の完全ガイド。スキル、フック、サブエージェント、MCP、プラグインなど、実際に機能するものをまとめています。

---

## 1. スキルとコマンドの違い

| 項目 | スキル | コマンド |
|------|--------|----------|
| 保存場所 | `~/.claude/skills/` | `~/.claude/commands/` |
| 役割 | 広範なワークフロー定義 | 素早く実行できるプロンプト |

**使用例：**
- `/refactor-clean` - 長いセッション後のデッドコードや不要な.mdファイルの削除
- `/tdd`, `/e2e`, `/test-coverage` - テスト関連のワークフロー

---

## 2. MCP管理（重要）

### コンテキストウィンドウの罠

- 200kのコンテキストウィンドウが、MCPを有効にしすぎると**70kまで縮小**する可能性がある
- パフォーマンスが著しく低下する

### 推奨ルール

- 設定には20〜30のMCPを持つ
- **プロジェクトごとに有効にするのは10未満**
- **アクティブなツールは80未満**
- `disabledMcpServers`で未使用のものを無効化

---

## 3. フック（Hooks）

フックはツール呼び出しやライフサイクルイベントに基づいて発火するトリガーベースの自動化。

**Pro Tip：** `hookify`プラグインを使うと、JSONを手動で書く代わりに会話形式でフックを作成できる。

---

## 4. 並列作業のテクニック

| ツール | 用途 |
|--------|------|
| `/fork` | 会話をフォークして重複しないタスクを並列実行。キューにメッセージを溜めるより効率的 |
| **Git Worktrees** | 競合なしで複数のClaudeを並列実行。各ワークツリーは独立したチェックアウト |
| **tmux** | Claudeが実行する長時間のログやbashプロセスをストリーム&監視 |

---

## 5. 検索の改善

### mgrep > grep

`mgrep`はripgrep/grepより大幅に改善されたツール。プラグインマーケットプレイスからインストールし、`/mgrep`スキルで使用。ローカル検索とWeb検索の両方に対応。

---

## 6. エディタ連携

エディタは必須ではないが、ワークフローに影響を与える。

### Zed推奨

- Rustベースで軽量、高速、高度にカスタマイズ可能
- **Agent Panel連携** - Claudeがファイルを編集する様子をリアルタイムで追跡
- Claudeが参照するファイル間をエディタを離れずにジャンプ可能

---

## 7. サブエージェント

サブエージェントは限定されたスコープで委任されたタスクを処理する専門エージェント。

**例：**
```markdown
---
name: code-reviewer
description: コードの品質、セキュリティ、保守性をレビュー
tools: Read, Grep, Glob, Bash
model: opus
---
```

デフォルトではメイン会話からすべてのツール（MCPツール含む）を継承。`tools`フィールドで許可リスト、`disallowedTools`で拒否リストを設定可能。

---

## 8. インストール方法

```bash
# マーケットプレイスとして追加
/plugin marketplace add affaan-m/everything-claude-code

# プラグインをインストール
/plugin install everything-claude-code@everything-claude-code
```

Windows、macOS、Linux完全対応。すべてのフックとスクリプトはNode.jsで書き直され、最大の互換性を実現。

---

## まとめ：重要ポイント

1. **MCPは厳選する** - 有効にしすぎるとコンテキストが激減
2. **スキルとコマンドを活用** - 繰り返しのワークフローを効率化
3. **フックで自動化** - トリガーベースで品質を維持
4. **並列作業を活用** - /fork、Git Worktrees、tmux
5. **サブエージェントに委任** - 専門タスクは専門エージェントへ

---

## 参考リンク

- [原文（X/Twitter）](https://x.com/affaanmustafa/status/2012378465664745795)
- [GitHub - affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- [Claude Code Docs - Subagents](https://code.claude.com/docs/en/sub-agents)
