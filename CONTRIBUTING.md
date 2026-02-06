# Everything Claude Code へのコントリビュート

コントリビュートに興味を持っていただきありがとうございます。このリポジトリは Claude Code ユーザーのためのコミュニティリソースとなることを目的としています。

## Table of Contents

- [What We're Looking For](#what-were-looking-for)
- [Quick Start](#quick-start)
- [Contributing Skills](#contributing-skills)
- [Contributing Agents](#contributing-agents)
- [Contributing Hooks](#contributing-hooks)
- [Contributing Commands](#contributing-commands)
- [Pull Request Process](#pull-request-process)

---

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

```bash
# 1. Fork and clone
gh repo fork affaan-m/everything-claude-code --clone
cd everything-claude-code

# 2. Create a branch
git checkout -b feat/my-contribution

# 3. Add your contribution (see sections below)

# 4. Test locally
cp -r skills/my-skill ~/.claude/skills/  # for skills
# Then test with Claude Code

# 5. Submit PR
git add . && git commit -m "feat: add my-skill" && git push
```

---

## Contributing Skills

Skills are knowledge modules that Claude Code loads based on context.

### Directory Structure

```
skills/
└── your-skill-name/
    └── SKILL.md
```

### SKILL.md Template

```markdown
---
name: your-skill-name
description: Brief description shown in skill list
---

# Your Skill Title

Brief overview of what this skill covers.

## Core Concepts

Explain key patterns and guidelines.

## Code Examples

\`\`\`typescript
// Include practical, tested examples
function example() {
  // Well-commented code
}
\`\`\`

## Best Practices

- Actionable guidelines
- Do's and don'ts
- Common pitfalls to avoid

## 使用するタイミング

Describe scenarios where this skill applies.
```

### Skill Checklist

- [ ] Focused on one domain/technology
- [ ] Includes practical code examples
- [ ] Under 500 lines
- [ ] Uses clear section headers
- [ ] Tested with Claude Code

### Example Skills

| Skill | Purpose |
|-------|---------|
| `coding-standards/` | TypeScript/JavaScript patterns |
| `frontend-patterns/` | React and Next.js best practices |
| `backend-patterns/` | API and database patterns |
| `security-review/` | Security checklist |

---

## Contributing Agents

Agents are specialized assistants invoked via the Task tool.

### File Location

```
agents/your-agent-name.md
```

### Agent Template

```markdown
---
name: your-agent-name
description: What this agent does and when Claude should invoke it. Be specific!
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]
model: sonnet
---

You are a [role] specialist.

## Your Role

- Primary responsibility
- Secondary responsibility
- What you DO NOT do (boundaries)

## Workflow

### Step 1: Understand
How you approach the task.

### Step 2: Execute
How you perform the work.

### Step 3: Verify
How you validate results.

## Output Format

What you return to the user.

## Examples

### Example: [Scenario]
Input: [what user provides]
Action: [what you do]
Output: [what you return]
```

### Agent Fields

| Field | Description | Options |
|-------|-------------|---------|
| `name` | Lowercase, hyphenated | `code-reviewer` |
| `description` | Used to decide when to invoke | Be specific! |
| `tools` | Only what's needed | `Read, Write, Edit, Bash, Grep, Glob, WebFetch, Task` |
| `model` | Complexity level | `haiku` (simple), `sonnet` (coding), `opus` (complex) |

### Example Agents

| Agent | Purpose |
|-------|---------|
| `tdd-guide.md` | Test-driven development |
| `code-reviewer.md` | Code review |
| `security-reviewer.md` | Security scanning |
| `build-error-resolver.md` | Fix build errors |

---

## Contributing Hooks

Hooks are automatic behaviors triggered by Claude Code events.

### File Location

```
hooks/hooks.json
```

### Hook Types

| Type | Trigger | Use Case |
|------|---------|----------|
| `PreToolUse` | Before tool runs | Validate, warn, block |
| `PostToolUse` | After tool runs | Format, check, notify |
| `SessionStart` | Session begins | Load context |
| `Stop` | Session ends | Cleanup, audit |

### Hook Format

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "tool == \"Bash\" && tool_input.command matches \"rm -rf /\"",
        "hooks": [
          {
            "type": "command",
            "command": "echo '[Hook] BLOCKED: Dangerous command' && exit 1"
          }
        ],
        "description": "Block dangerous rm commands"
      }
    ]
  }
}
```

### Matcher Syntax

```javascript
// Match specific tools
tool == "Bash"
tool == "Edit"
tool == "Write"

// Match input patterns
tool_input.command matches "npm install"
tool_input.file_path matches "\\.tsx?$"

// Combine conditions
tool == "Bash" && tool_input.command matches "git push"
```

### Hook Examples

```json
// Block dev servers outside tmux
{
  "matcher": "tool == \"Bash\" && tool_input.command matches \"npm run dev\"",
  "hooks": [{"type": "command", "command": "echo 'Use tmux for dev servers' && exit 1"}],
  "description": "Ensure dev servers run in tmux"
}

// Auto-format after editing TypeScript
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\.tsx?$\"",
  "hooks": [{"type": "command", "command": "npx prettier --write \"$file_path\""}],
  "description": "Format TypeScript files after edit"
}

// Warn before git push
{
  "matcher": "tool == \"Bash\" && tool_input.command matches \"git push\"",
  "hooks": [{"type": "command", "command": "echo '[Hook] Review changes before pushing'"}],
  "description": "Reminder to review before push"
}
```

### Hook Checklist

- [ ] Matcher is specific (not overly broad)
- [ ] Includes clear error/info messages
- [ ] Uses correct exit codes (`exit 1` blocks, `exit 0` allows)
- [ ] Tested thoroughly
- [ ] Has description

---

## Contributing Commands

Commands are user-invoked actions with `/command-name`.

### File Location

```
commands/your-command.md
```

### Command Template

```markdown
---
description: Brief description shown in /help
---

# Command 名

## Purpose

What this command does.

## Usage

\`\`\`
/your-command [args]
\`\`\`

## Workflow

1. First step
2. Second step
3. Final step

## Output

What the user receives.
```

### Example Commands

| Command | Purpose |
|---------|---------|
| `commit.md` | Create git commits |
| `code-review.md` | Review code changes |
| `tdd.md` | TDD workflow |
| `e2e.md` | E2E testing |

---

## Pull Request Process

### 1. PR Title Format

```
feat(skills): add rust-patterns skill
feat(agents): add api-designer agent
feat(hooks): add auto-format hook
fix(skills): update React patterns
docs: improve contributing guide
```

### 2. PR Description

```markdown
## Summary
What you're adding and why.

## Type
- [ ] Skill
- [ ] Agent
- [ ] Hook
- [ ] Command

## Testing
How you tested this.

## Checklist
- [ ] Follows format guidelines
- [ ] Tested with Claude Code
- [ ] No sensitive info (API keys, paths)
- [ ] Clear descriptions
```

### 3. Review Process

1. Maintainers review within 48 hours
2. Address feedback if requested
3. Once approved, merged to main

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

- **Issues:** [github.com/affaan-m/everything-claude-code/issues](https://github.com/affaan-m/everything-claude-code/issues)
- **X/Twitter:** [@affaanmustafa](https://x.com/affaanmustafa)

---

コントリビュートありがとうございます。一緒に素晴らしいリソースを作りましょう。
