---
name: blueprint
description: >-
  把一句话目标转化为面向多会话、多 agent 工程项目的分步构建方案。每一步都附自包含的上下文简报，让一个全新 agent 可以冷启动执行。
  包含对抗式评审门、依赖图、并行步骤识别、反模式目录与方案变更协议。
  触发场景：用户为复杂多 PR 任务请求方案、蓝图或路线图，或描述的工作需要多个会话。
  不触发：任务在单个 PR 或不到 3 次工具调用内可完成，或用户说"直接做"。
origin: community
---

# Blueprint — Construction Plan Generator

Turn a one-line objective into a step-by-step construction plan that any coding agent can execute cold.

## When to Use

- Breaking a large feature into multiple PRs with clear dependency order
- Planning a refactor or migration that spans multiple sessions
- Coordinating parallel workstreams across sub-agents
- Any task where context loss between sessions would cause rework

**Do not use** for tasks completable in a single PR, fewer than 3 tool calls, or when the user says "just do it."

## How It Works

Blueprint runs a 5-phase pipeline:

1. **Research** — Pre-flight checks (git, gh auth, remote, default branch), then reads project structure, existing plans, and memory files to gather context.
2. **Design** — Breaks the objective into one-PR-sized steps (3–12 typical). Assigns dependency edges, parallel/serial ordering, model tier (strongest vs default), and rollback strategy per step.
3. **Draft** — Writes a self-contained Markdown plan file to `plans/`. Every step includes a context brief, task list, verification commands, and exit criteria — so a fresh agent can execute any step without reading prior steps.
4. **Review** — Delegates adversarial review to a strongest-model sub-agent (e.g., Opus) against a checklist and anti-pattern catalog. Fixes all critical findings before finalizing.
5. **Register** — Saves the plan, updates memory index, and presents the step count and parallelism summary to the user.

Blueprint detects git/gh availability automatically. With git + GitHub CLI, it generates full branch/PR/CI workflow plans. Without them, it switches to direct mode (edit-in-place, no branches).

## Examples

### Basic usage

```
/blueprint myapp "migrate database to PostgreSQL"
```

Produces `plans/myapp-migrate-database-to-postgresql.md` with steps like:
- Step 1: Add PostgreSQL driver and connection config
- Step 2: Create migration scripts for each table
- Step 3: Update repository layer to use new driver
- Step 4: Add integration tests against PostgreSQL
- Step 5: Remove old database code and config

### Multi-agent project

```
/blueprint chatbot "extract LLM providers into a plugin system"
```

Produces a plan with parallel steps where possible (e.g., "implement Anthropic plugin" and "implement OpenAI plugin" run in parallel after the plugin interface step is done), model tier assignments (strongest for the interface design step, default for implementation), and invariants verified after every step (e.g., "all existing tests pass", "no provider imports in core").

## Key Features

- **Cold-start execution** — Every step includes a self-contained context brief. No prior context needed.
- **Adversarial review gate** — Every plan is reviewed by a strongest-model sub-agent against a checklist covering completeness, dependency correctness, and anti-pattern detection.
- **Branch/PR/CI workflow** — Built into every step. Degrades gracefully to direct mode when git/gh is absent.
- **Parallel step detection** — Dependency graph identifies steps with no shared files or output dependencies.
- **Plan mutation protocol** — Steps can be split, inserted, skipped, reordered, or abandoned with formal protocols and audit trail.
- **Zero runtime risk** — Pure Markdown skill. The entire repository contains only `.md` files — no hooks, no shell scripts, no executable code, no `package.json`, no build step. Nothing runs on install or invocation beyond Claude Code's native Markdown skill loader.

## Installation

This skill ships with Everything Claude Code. No separate installation is needed when ECC is installed.

### Full ECC install

If you are working from the ECC repository checkout, verify the skill is present with:

```bash
test -f skills/blueprint/SKILL.md
```

To update later, review the ECC diff before updating:

```bash
cd /path/to/everything-claude-code
git fetch origin main
git log --oneline HEAD..origin/main       # review new commits before updating
git checkout <reviewed-full-sha>          # pin to a specific reviewed commit
```

### Vendored standalone install

If you are vendoring only this skill outside the full ECC install, copy the reviewed file from the ECC repository into `~/.claude/skills/blueprint/SKILL.md`. Vendored copies do not have a git remote, so update them by re-copying the file from a reviewed ECC commit rather than running `git pull`.

## Requirements

- Claude Code (for `/blueprint` slash command)
- Git + GitHub CLI (optional — enables full branch/PR/CI workflow; Blueprint detects absence and auto-switches to direct mode)

## Source

Inspired by antbotlab/blueprint — upstream project and reference design.
