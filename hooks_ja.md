# Hooks（フック）解説

## フックとは

**フック**は、特定のイベント（ツール呼び出し、セッション開始/終了など）で自動的に実行されるシェルコマンドです。Claude Codeの動作を拡張・制御できます。

### 配置場所

```
~/.claude/settings.json  # フック設定
~/.claude/hooks/         # フックスクリプト
```

---

## フックイベント一覧

| イベント | タイミング | 用途 |
|---------|-----------|------|
| **PreToolUse** | ツール実行前 | 実行をブロック/修正、警告表示 |
| **PostToolUse** | ツール実行後 | 結果に基づく処理、フォーマット実行 |
| **SessionStart** | セッション開始時 | 前回コンテキストの読み込み |
| **PreCompact** | コンパクト前 | 状態の保存 |
| **Stop** | セッション終了時 | 状態の永続化、最終チェック |

---

## hooks.json の構造

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "tool == \"Bash\" && ...",
        "hooks": [{
          "type": "command",
          "command": "#!/bin/bash\n..."
        }],
        "description": "説明"
      }
    ]
  }
}
```

### matcher の書き方

| パターン | 説明 |
|---------|------|
| `tool == "Bash"` | Bashツール使用時 |
| `tool == "Edit"` | Editツール使用時 |
| `tool_input.file_path matches "\\.ts$"` | .tsファイル対象時 |
| `*` | すべてにマッチ |

---

## 含まれるフック一覧

### PreToolUse（ツール実行前）

| フック | 説明 | 動作 |
|--------|------|------|
| **devサーバーブロック** | `npm run dev`等をブロック | tmuxでの実行を推奨 |
| **tmuxリマインダー** | 長時間コマンドでtmux推奨 | 警告表示のみ |
| **git pushポーズ** | push前に確認 | Enter待ち |
| **不要ドキュメントブロック** | 不要な.mdファイル作成をブロック | README.md等は除外 |
| **コンパクト提案** | 一定操作後に手動コンパクト提案 | 50回で通知 |

### PostToolUse（ツール実行後）

| フック | 説明 | 動作 |
|--------|------|------|
| **PR作成ログ** | PR作成後にURL表示 | レビューコマンドも表示 |
| **Prettier自動実行** | JS/TS編集後にフォーマット | 自動適用 |
| **TypeScriptチェック** | TS編集後に型チェック | エラー表示 |
| **console.log警告** | console.logを検出 | 警告表示 |

### PreCompact（コンパクト前）

| フック | 説明 | 動作 |
|--------|------|------|
| **状態保存** | コンパクト前に状態を保存 | セッションファイルに記録 |

### SessionStart（セッション開始）

| フック | 説明 | 動作 |
|--------|------|------|
| **コンテキスト読み込み** | 過去7日のセッション確認 | 学習済みスキル数も表示 |

### Stop（セッション終了）

| フック | 説明 | 動作 |
|--------|------|------|
| **console.log最終監査** | 変更ファイルのconsole.log確認 | 警告表示 |
| **状態永続化** | セッション状態を保存 | session.tmpに記録 |
| **パターン評価** | 抽出可能なパターンを評価 | 継続的学習用 |

---

## スクリプトファイル

### memory-persistence/（メモリ永続化）

#### session-start.sh
セッション開始時に実行。過去7日のセッションファイルと学習済みスキルを確認。

#### session-end.sh
セッション終了時に実行。セッションファイルを作成/更新。

```
~/.claude/sessions/2025-01-24-session.tmp
```

#### pre-compact.sh
コンパクト前に実行。コンパクトイベントをログに記録。

### strategic-compact/（戦略的コンパクト）

#### suggest-compact.sh
ツール呼び出し回数をカウントし、50回で手動コンパクトを提案。

**なぜ手動コンパクトか：**
- auto-compactはタスク途中の任意のタイミングで発生
- 戦略的コンパクトは論理的なフェーズ区切りでコンテキストを保持
- 探索完了後、実装開始前にコンパクト
- マイルストーン完了後にコンパクト

---

## 設定方法

`~/.claude/settings.json`に追加：

```json
{
  "hooks": {
    "PreToolUse": [...],
    "PostToolUse": [...],
    "SessionStart": [...],
    "PreCompact": [...],
    "Stop": [...]
  }
}
```

または、`hooks/hooks.json`の内容をコピー。

---

## カスタマイズ提案

### 1. 不要なフックの削除

プロジェクトに合わせて調整：
- Prettierを使わない → PostToolUseのPrettier削除
- tmuxを使わない → devサーバーブロック削除

### 2. 新しいフックの追加例

#### ESLint自動実行
```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx)$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\neslint --fix \"$file_path\""
  }]
}
```

#### テスト自動実行
```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.test\\\\.ts$\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\nnpm test -- --findRelatedTests \"$file_path\""
  }]
}
```

### 3. プロジェクト固有のチェック

```json
{
  "matcher": "tool == \"Edit\"",
  "hooks": [{
    "type": "command",
    "command": "#!/bin/bash\n# プロジェクト固有のルールチェック\n..."
  }]
}
```

---

## 参考リンク

- [ロングフォームガイド - メモリ永続化](longform-guide_ja.md#2-メモリ永続化)
- [Claude Code Docs - Hooks](https://code.claude.com/docs/en/hooks)
- [元リポジトリ - hooks/](https://github.com/affaan-m/everything-claude-code/tree/main/hooks)
