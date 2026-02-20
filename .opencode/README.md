# OpenCode ECC Plugin

> ⚠️ This README is specific to OpenCode usage.  
> If you installed ECC via npm (e.g. `npm install opencode-ecc`), refer to the root README instead.

Everything Claude Code (ECC) plugin for OpenCode - agents, commands, hooks, and skills.

## Installation

## Installation Overview

There are two ways to use Everything Claude Code (ECC):

1. **npm package (recommended for most users)**  
   Install via npm/bun/yarn and use the `ecc-install` CLI to set up rules and agents.

2. **Direct clone / plugin mode**  
   Clone the repository and run OpenCode directly inside it.

Choose the method that matches your workflow below.

### Option 1: npm Package

```bash
npm install ecc-universal
```

Add to your `opencode.json`:

```json
{
  "plugin": ["ecc-universal"]
}
```
After installation, the `ecc-install` CLI becomes available:

```bash
npx ecc-install typescript
```

### Option 2: Direct Use

Clone and run OpenCode in the repository:

```bash
git clone https://github.com/affaan-m/everything-claude-code
cd everything-claude-code
opencode
```

## Features

### Agents (12)

| Agent | Description |
|-------|-------------|
| planner | Implementation planning |
| architect | System design |
| code-reviewer | Code review |
| security-reviewer | Security analysis |
| tdd-guide | Test-driven development |
| build-error-resolver | Build error fixes |
| e2e-runner | E2E testing |
| doc-updater | Documentation |
| refactor-cleaner | Dead code cleanup |
| go-reviewer | Go code review |
| go-build-resolver | Go build errors |
| database-reviewer | Database optimization |

### Commands (24)

| Command | Description |
|---------|-------------|
| `/plan` | Create implementation plan |
| `/tdd` | TDD workflow |
| `/code-review` | Review code changes |
| `/security` | Security review |
| `/build-fix` | Fix build errors |
| `/e2e` | E2E tests |
| `/refactor-clean` | Remove dead code |
| `/orchestrate` | Multi-agent workflow |
| `/learn` | Extract patterns |
| `/checkpoint` | Save progress |
| `/verify` | Verification loop |
| `/eval` | Evaluation |
| `/update-docs` | Update docs |
| `/update-codemaps` | Update codemaps |
| `/test-coverage` | Coverage analysis |
| `/setup-pm` | Package manager |
| `/go-review` | Go code review |
| `/go-test` | Go TDD |
| `/go-build` | Go build fix |
| `/skill-create` | Generate skills |
| `/instinct-status` | View instincts |
| `/instinct-import` | Import instincts |
| `/instinct-export` | Export instincts |
| `/evolve` | Cluster instincts |

### Plugin Hooks

| Hook | Event | Purpose |
|------|-------|---------|
| Prettier | `file.edited` | Auto-format JS/TS |
| TypeScript | `tool.execute.after` | Check for type errors |
| console.log | `file.edited` | Warn about debug statements |
| Notification | `session.idle` | Desktop notification |
| Security | `tool.execute.before` | Check for secrets |

### Custom Tools

| Tool | Description |
|------|-------------|
| run-tests | Run test suite with options |
| check-coverage | Analyze test coverage |
| security-audit | Security vulnerability scan |

## Hook Event Mapping

OpenCode's plugin system maps to Claude Code hooks:

| Claude Code | OpenCode |
|-------------|----------|
| PreToolUse | `tool.execute.before` |
| PostToolUse | `tool.execute.after` |
| Stop | `session.idle` |
| SessionStart | `session.created` |
| SessionEnd | `session.deleted` |

OpenCode has 20+ additional events not available in Claude Code.

## Skills

All 16 ECC skills are available via the `instructions` array:

- coding-standards
- backend-patterns
- frontend-patterns
- security-review
- tdd-workflow
- continuous-learning
- continuous-learning-v2
- iterative-retrieval
- strategic-compact
- eval-harness
- verification-loop
- golang-patterns
- golang-testing
- clickhouse-io
- pmx-guidelines

## Configuration

Full configuration in `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "small_model": "anthropic/claude-haiku-4-5",
  "plugin": ["./.opencode/plugins"],
  "instructions": [
    "skills/tdd-workflow/SKILL.md",
    "skills/security-review/SKILL.md"
  ],
  "agent": { /* 12 agents */ },
  "command": { /* 24 commands */ }
}
```

## License

MIT
