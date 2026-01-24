# Examples（設定例）解説

## CLAUDE.mdとは

**CLAUDE.md**は、Claude Codeに対するプロジェクトまたはユーザーレベルの設定ファイルです。Claudeの動作ルール、コーディング規約、プロジェクト固有の情報を定義します。

### 2つのレベル

| レベル | 配置場所 | スコープ |
|--------|---------|---------|
| **プロジェクトレベル** | プロジェクトルート `/CLAUDE.md` | そのプロジェクトのみ |
| **ユーザーレベル** | `~/.claude/CLAUDE.md` | 全プロジェクト共通 |

---

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `CLAUDE.md` | プロジェクトレベル設定の例 |
| `user-CLAUDE.md` | ユーザーレベル設定の例 |
| `statusline.json` | ステータスライン設定の例 |

---

## CLAUDE.md（プロジェクトレベル）

プロジェクトルートに配置する設定ファイル。

### 含めるべき内容

#### 1. プロジェクト概要
```markdown
## Project Overview
[プロジェクトの説明、技術スタック]
```

#### 2. コード規約
```markdown
## Critical Rules

### Code Organization
- 小さなファイルを多数 > 大きなファイルを少数
- 200-400行が標準、800行が上限
- 機能/ドメインで整理（型ではなく）

### Code Style
- 絵文字禁止
- イミュータビリティ必須
- console.log禁止（本番）
- 適切なエラーハンドリング
```

#### 3. ファイル構造
```markdown
## File Structure
src/
|-- app/              # Next.js app router
|-- components/       # 再利用可能なUIコンポーネント
|-- hooks/            # カスタムReactフック
|-- lib/              # ユーティリティライブラリ
|-- types/            # TypeScript定義
```

#### 4. キーパターン
```markdown
## Key Patterns

### API Response Format
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

#### 5. 環境変数
```markdown
## Environment Variables
# Required
DATABASE_URL=
API_KEY=
```

#### 6. Gitワークフロー
```markdown
## Git Workflow
- Conventional commits: feat:, fix:, refactor:, docs:, test:
- mainへの直接コミット禁止
- PRはレビュー必須
```

---

## user-CLAUDE.md（ユーザーレベル）

`~/.claude/CLAUDE.md`に配置する全プロジェクト共通設定。

### 含めるべき内容

#### 1. コア哲学
```markdown
## Core Philosophy

**Key Principles:**
1. Agent-First: 複雑な作業は専門エージェントに委任
2. Parallel Execution: 可能な限り並列実行
3. Plan Before Execute: 複雑な操作は計画を先に
4. Test-Driven: 実装前にテスト
5. Security-First: セキュリティは妥協しない
```

#### 2. モジュラールールへの参照
```markdown
## Modular Rules

Detailed guidelines are in ~/.claude/rules/:

| Rule File | Contents |
|-----------|----------|
| security.md | セキュリティチェック |
| coding-style.md | コードスタイル |
| testing.md | TDDワークフロー |
```

#### 3. 利用可能なエージェント
```markdown
## Available Agents

| Agent | Purpose |
|-------|---------|
| planner | 実装計画 |
| architect | システム設計 |
| tdd-guide | TDD |
```

#### 4. 個人の好み
```markdown
## Personal Preferences

### Code Style
- 絵文字禁止
- イミュータビリティ優先
- 小さなファイルを多数

### Editor
- Zed使用
- Vimモード有効
```

---

## statusline.json（ステータスライン）

Claude Codeのステータスライン表示をカスタマイズする設定。

### 表示内容

```
user:~/projects/myapp main* ctx:73% sonnet-4.5 14:30 todos:3
```

| 要素 | 説明 | 色 |
|------|------|-----|
| `user` | ユーザー名 | シアン |
| `~/projects/myapp` | カレントディレクトリ | 青 |
| `main*` | Gitブランチ（*は未コミット変更あり） | 緑/黄 |
| `ctx:73%` | コンテキスト残量 | マゼンタ |
| `sonnet-4.5` | 使用中のモデル | グレー |
| `14:30` | 現在時刻 | 黄 |
| `todos:3` | 残りTODO数 | シアン |

### 設定方法

`~/.claude/settings.json`に追加：

```json
{
  "statusLine": {
    "type": "command",
    "command": "[statusline.jsonのcommandをコピー]",
    "description": "Custom status line"
  }
}
```

---

## カスタマイズ提案

### 1. プロジェクトCLAUDE.mdの作成

各プロジェクトのルートに、そのプロジェクト固有の情報を含むCLAUDE.mdを作成：

- 使用技術スタック
- ディレクトリ構造
- コーディング規約
- 環境変数
- デプロイ手順

### 2. ユーザーCLAUDE.mdの作成

`~/.claude/CLAUDE.md`に個人の共通設定を記述：

- 好みのコードスタイル
- 使用するエディタ
- 常に適用したいルール

### 3. ステータスラインのカスタマイズ

必要に応じて表示項目を追加/削除：

- ビルド状態
- テスト結果
- メモリ使用量

---

## 参考リンク

- [Claude Code Docs - CLAUDE.md](https://code.claude.com/docs/en/claude-md)
- [元リポジトリ - examples/](https://github.com/affaan-m/everything-claude-code/tree/main/examples)
