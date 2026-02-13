# Everything Claude Codeへのコントリビューション

コントリビューションに興味を持っていただきありがとうございます。このリポジトリはClaude Codeユーザーのためのコミュニティリソースとして作られています。

## 求めているもの

### エージェント

特定のタスクを適切に処理する新しいエージェント：
- 言語固有のレビューア（Python、Go、Rust）
- フレームワークの専門家（Django、Rails、Laravel、Spring）
- DevOpsスペシャリスト（Kubernetes、Terraform、CI/CD）
- ドメインエキスパート（MLパイプライン、データエンジニアリング、モバイル）

### スキル

ワークフロー定義とドメイン知識：
- 言語のベストプラクティス
- フレームワークパターン
- テスト戦略
- アーキテクチャガイド
- ドメイン固有の知識

### コマンド

便利なワークフローを呼び出すスラッシュコマンド：
- デプロイメントコマンド
- テストコマンド
- ドキュメントコマンド
- コード生成コマンド

### フック

便利な自動化：
- リント・フォーマットフック
- セキュリティチェック
- バリデーションフック
- 通知フック

### ルール

常に従うべきガイドライン：
- セキュリティルール
- コードスタイルルール
- テスト要件
- 命名規則

### MCP設定

新規または改善されたMCPサーバー設定：
- データベース連携
- クラウドプロバイダーMCP
- モニタリングツール
- コミュニケーションツール

---

## コントリビューションの方法

### 1. リポジトリをフォーク

```bash
git clone https://github.com/YOUR_USERNAME/everything-claude-code.git
cd everything-claude-code
```

### 2. ブランチを作成

```bash
git checkout -b add-python-reviewer
```

### 3. コントリビューションを追加

ファイルを適切なディレクトリに配置してください：
- `agents/` - 新しいエージェント
- `skills/` - スキル（単一の.mdファイルまたはディレクトリ）
- `commands/` - スラッシュコマンド
- `rules/` - ルールファイル
- `hooks/` - フック設定
- `mcp-configs/` - MCPサーバー設定

### 4. フォーマットに従う

**エージェント**にはフロントマターを付けてください：

```markdown
---
name: agent-name
description: What it does
tools: Read, Grep, Glob, Bash
model: sonnet
---

Instructions here...
```

**スキル**は明確で実行可能な内容にしてください：

```markdown
# Skill Name

## When to Use

...

## How It Works

...

## Examples

...
```

**コマンド**は何をするか説明してください：

```markdown
---
description: Brief description of command
---

# Command Name

Detailed instructions...
```

**フック**には説明を含めてください：

```json
{
  "matcher": "...",
  "hooks": [...],
  "description": "What this hook does"
}
```

### 5. コントリビューションをテスト

提出前に、設定がClaude Codeで動作することを確認してください。

### 6. PRを提出

```bash
git add .
git commit -m "Add Python code reviewer agent"
git push origin add-python-reviewer
```

PRには以下を含めてください：
- 追加した内容
- なぜ便利なのか
- どのようにテストしたか

---

## ガイドライン

### 推奨事項

- 設定は焦点を絞ってモジュール化する
- 明確な説明を含める
- 提出前にテストする
- 既存のパターンに従う
- 依存関係があればドキュメント化する

### 禁止事項

- 機密データを含めない（APIキー、トークン、パス）
- 過度に複雑またはニッチな設定を追加しない
- テストしていない設定を提出しない
- 重複する機能を作成しない
- 代替手段なしに特定の有料サービスを必要とする設定を追加しない

---

## ファイル命名規則

- 小文字とハイフンを使用：`python-reviewer.md`
- わかりやすい名前にする：`workflow.md`ではなく`tdd-workflow.md`
- エージェント/スキル名とファイル名を一致させる

---

## 質問がありますか？

Issueを作成するか、Xでご連絡ください：[@affaanmustafa](https://x.com/affaanmustafa)

---

コントリビューションありがとうございます。一緒に素晴らしいリソースを作りましょう。
