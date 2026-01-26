# Everything Claude Code へのコントリビュート

コントリビュートに興味を持っていただきありがとうございます。このリポジトリは Claude Code ユーザーのためのコミュニティリソースとなることを目的としています。

## 求めているもの

### Agents

特定のタスクをうまく処理する新しい agent：
- 言語固有のレビュアー（Python、Go、Rust）
- フレームワークエキスパート（Django、Rails、Laravel、Spring）
- DevOps スペシャリスト（Kubernetes、Terraform、CI/CD）
- ドメインエキスパート（ML パイプライン、データエンジニアリング、モバイル）

### Skills

ワークフロー定義とドメイン知識：
- 言語ベストプラクティス
- フレームワークパターン
- テスト戦略
- アーキテクチャガイド
- ドメイン固有の知識

### Commands

便利なワークフローを呼び出すスラッシュコマンド：
- デプロイメント command
- テスト command
- ドキュメント command
- コード生成 command

### Hooks

便利な自動化：
- リンティング/フォーマット hook
- セキュリティチェック
- バリデーション hook
- 通知 hook

### Rules

常に従うガイドライン：
- セキュリティルール
- コードスタイルルール
- テスト要件
- 命名規則

### MCP 設定

新規または改善された MCP サーバー設定：
- データベース統合
- クラウドプロバイダー MCP
- モニタリングツール
- コミュニケーションツール

---

## コントリビュート方法

### 1. リポジトリをフォーク

```bash
git clone https://github.com/YOUR_USERNAME/everything-claude-code.git
cd everything-claude-code
```

### 2. ブランチを作成

```bash
git checkout -b add-python-reviewer
```

### 3. コントリビュートを追加

適切なディレクトリにファイルを配置：
- `agents/` - 新しい agent
- `skills/` - skill（単一の .md またはディレクトリ）
- `commands/` - スラッシュ command
- `rules/` - rule ファイル
- `hooks/` - hook 設定
- `mcp-configs/` - MCP サーバー設定

### 4. フォーマットに従う

**Agents** には frontmatter が必要：

```markdown
---
name: agent-name
description: 何をするか
tools: Read, Grep, Glob, Bash
model: sonnet
---

ここに指示...
```

**Skills** は明確で実行可能に：

```markdown
# Skill 名

## 使用するタイミング

...

## 動作方法

...

## 例

...
```

**Commands** は何をするか説明：

```markdown
---
description: command の簡単な説明
---

# Command 名

詳細な指示...
```

**Hooks** には説明を含める：

```json
{
  "matcher": "...",
  "hooks": [...],
  "description": "この hook が何をするか"
}
```

### 5. コントリビュートをテスト

送信前に設定が Claude Code で動作することを確認してください。

### 6. PR を送信

```bash
git add .
git commit -m "Add Python code reviewer agent"
git push origin add-python-reviewer
```

その後、以下を含む PR を開いてください：
- 追加したもの
- なぜ便利か
- どのようにテストしたか

---

## ガイドライン

### すべきこと

- 設定をフォーカスしてモジュラーに保つ
- 明確な説明を含める
- 送信前にテスト
- 既存のパターンに従う
- 依存関係をドキュメント化

### すべきでないこと

- 機密データを含める（API キー、トークン、パス）
- 過度に複雑またはニッチな設定を追加
- テストしていない設定を送信
- 重複した機能を作成
- 代替なしに特定の有料サービスを必要とする設定を追加

---

## ファイル命名

- 小文字とハイフンを使用：`python-reviewer.md`
- 説明的に：`tdd-workflow.md`（`workflow.md` ではない）
- agent/skill 名をファイル名と一致させる

---

## 質問がありますか？

Issue を開くか、X で連絡してください：[@affaanmustafa](https://x.com/affaanmustafa)

---

コントリビュートありがとうございます。一緒に素晴らしいリソースを作りましょう。
