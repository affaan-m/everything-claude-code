# The Beginner's Guide to Everything Claude Code

A plain-language walkthrough of every concept in this repository — what it is, why it matters, and how to start using it today.

---

## Table of Contents

1. [What Is Claude Code?](#what-is-claude-code)
2. [What Is This Repository?](#what-is-this-repository)
3. [Core Concepts at a Glance](#core-concepts-at-a-glance)
4. [CLAUDE.md — Your Project's Brain](#claudemd--your-projects-brain)
5. [Rules — Always-On Guidelines](#rules--always-on-guidelines)
6. [Commands — Slash-Command Workflows](#commands--slash-command-workflows)
7. [Skills — Deep Knowledge Modules](#skills--deep-knowledge-modules)
8. [Agents (Subagents) — Specialist Delegates](#agents-subagents--specialist-delegates)
9. [Hooks — Automatic Event-Driven Automations](#hooks--automatic-event-driven-automations)
10. [MCP Servers — External Service Connections](#mcp-servers--external-service-connections)
11. [Contexts — Mode Switching](#contexts--mode-switching)
12. [Installation & Setup](#installation--setup)
13. [Recommended Workflow](#recommended-workflow)
14. [Tips, Tricks & Keyboard Shortcuts](#tips-tricks--keyboard-shortcuts)
15. [Editor Setup](#editor-setup)
16. [Context Window Management](#context-window-management)
17. [Glossary](#glossary)

---

## What Is Claude Code?

Claude Code is Anthropic's CLI (command-line interface) tool that lets you work with Claude directly in your terminal. Instead of copy-pasting code into a chat window, Claude Code operates inside your project — reading files, writing code, running commands, and making edits alongside you.

Think of it as a senior developer pair-programming with you in your terminal.

---

## What Is This Repository?

**Everything Claude Code** is a community-maintained collection of production-ready configurations for Claude Code. It was created by an Anthropic hackathon winner after 10+ months of daily use building real products.

The repo provides:

- **Agents** — Specialist AI assistants for specific tasks (code review, security, planning)
- **Skills** — Knowledge modules for languages, frameworks, and workflows
- **Commands** — Slash commands that trigger predefined workflows
- **Hooks** — Automatic scripts that fire on specific events
- **Rules** — Always-follow coding guidelines
- **MCP configs** — Pre-configured connections to external services
- **Contexts** — Mode-switching presets (development, review, research)

All of these are designed to be copied into your `~/.claude/` directory and used immediately.

---

## Core Concepts at a Glance

| Concept | What It Is | Where It Lives | How You Use It |
|---------|-----------|----------------|----------------|
| **CLAUDE.md** | Project instructions | Project root | Claude reads it automatically |
| **Rules** | Always-on guidelines | `~/.claude/rules/` | Claude follows them in every session |
| **Commands** | Slash commands | `~/.claude/commands/` | Type `/command-name` in Claude Code |
| **Skills** | Knowledge modules | `~/.claude/skills/` | Claude loads them based on context |
| **Agents** | Specialist delegates | `~/.claude/agents/` | Claude spawns them for specific tasks |
| **Hooks** | Event automations | `~/.claude/settings.json` | Run automatically on triggers |
| **MCP Servers** | Service connectors | `~/.claude.json` | Connect Claude to external tools |
| **Contexts** | Mode presets | `~/.claude/contexts/` | Switch Claude's behavior mode |

---

## CLAUDE.md — Your Project's Brain

`CLAUDE.md` is the single most important file for working with Claude Code. It sits in your project root and tells Claude everything it needs to know: what the project is, how to build it, what patterns to follow, and what to avoid.

Claude reads this file automatically at the start of every session.

### What to put in CLAUDE.md

```markdown
# CLAUDE.md

## Project Overview
Brief description — what the project does, the tech stack, key dependencies.

## Critical Rules
- Code style preferences (e.g., "no emojis", "immutability always")
- File organization rules (e.g., "200-400 lines per file, 800 max")
- Testing requirements (e.g., "TDD mandatory, 80% coverage")
- Security rules (e.g., "no hardcoded secrets, parameterized queries only")

## How to Build & Test
- Build command: `npm run build`
- Test command: `npm test`
- Lint command: `npm run lint`

## File Structure
Describe the layout of your src/ directory.

## Available Commands
List the slash commands you use: /tdd, /plan, /code-review, etc.

## Git Workflow
Commit format, branching strategy, PR process.
```

### Levels of CLAUDE.md

There are actually **three** levels where you can provide instructions:

1. **User-level** (`~/.claude/CLAUDE.md`) — Your personal preferences across all projects
2. **Project-level** (`./CLAUDE.md`) — Project-specific rules in the repo root
3. **Folder-level** (`./src/CLAUDE.md`) — Rules for a specific directory

Claude merges all three, with more specific levels taking priority.

### Example

See `examples/CLAUDE.md` in this repo for a complete template.

---

## Rules — Always-On Guidelines

Rules are `.md` files that Claude follows in **every single session**. They live in `~/.claude/rules/` and define your non-negotiable coding standards.

### How rules are organized in this repo

```
rules/
├── common/           # Language-agnostic rules
│   ├── coding-style.md    # Immutability, file size limits, naming
│   ├── security.md        # No hardcoded secrets, input validation
│   ├── testing.md         # TDD workflow, 80% coverage
│   ├── git-workflow.md    # Commit format, PR process
│   ├── performance.md     # Model selection, caching
│   ├── patterns.md        # API patterns, error handling
│   ├── hooks.md           # Hook architecture guidelines
│   └── agents.md          # When to delegate to subagents
├── typescript/       # TypeScript-specific rules
├── python/           # Python-specific rules
├── golang/           # Go-specific rules
└── swift/            # Swift-specific rules
```

### Key rules you get out of the box

**Coding Style** (`rules/common/coding-style.md`):
- Always use immutable patterns (spread operator, never mutate)
- Keep files between 200-400 lines, 800 max
- Functions should be under 50 lines
- No deep nesting (4 levels max — use early returns)
- Handle errors explicitly, never swallow them

**Security** (`rules/common/security.md`):
- Never hardcode secrets — use environment variables
- Parameterized queries only (no string concatenation for SQL)
- Validate all user input
- CSRF protection on state-changing endpoints
- Rate limiting on all public endpoints

**Testing** (`rules/common/testing.md`):
- TDD is mandatory: write tests first, then implement
- 80% minimum coverage
- Unit tests for functions, integration tests for APIs, E2E for critical flows
- Use the `tdd-guide` agent proactively

**Git Workflow** (`rules/common/git-workflow.md`):
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Comprehensive PR descriptions
- Never commit to main directly

### Installing rules

```bash
# Install common + TypeScript rules
./install.sh typescript

# Install common + multiple languages
./install.sh typescript python golang

# Rules are copied to ~/.claude/rules/
```

---

## Commands — Slash-Command Workflows

Commands are prompts you invoke by typing `/command-name` in Claude Code. They trigger predefined workflows — saving you from typing out complex instructions every time.

### Available commands in this repo

| Command | What It Does |
|---------|-------------|
| `/plan` | Creates a detailed implementation plan before writing code. Claude analyzes requirements, identifies risks, breaks work into phases, and **waits for your approval** before touching any code. |
| `/tdd` | Enforces test-driven development. Scaffolds interfaces, writes failing tests first, implements minimal code to pass, then refactors. Targets 80%+ coverage. |
| `/code-review` | Runs a thorough code review checking security, quality, performance, and best practices. Outputs findings by severity (CRITICAL/HIGH/MEDIUM/LOW). |
| `/e2e` | Generates and runs end-to-end tests using Playwright or similar frameworks. |
| `/build-fix` | Diagnoses and fixes build errors automatically. |
| `/refactor-clean` | Cleans dead code, unused imports, and loose files after a long coding session. |
| `/test-coverage` | Checks test coverage and adds tests where coverage is below threshold. |
| `/verify` | Runs a full verification loop: build, typecheck, lint, tests, security scan, diff review. |
| `/learn` | Extracts reusable patterns from the current session into skills. |
| `/skill-create` | Generates a new skill from your git history and coding patterns. |
| `/checkpoint` | Creates a save point you can rewind to. |
| `/update-docs` | Updates documentation to match current code. |
| `/update-codemaps` | Regenerates code maps for navigation. |
| `/orchestrate` | Coordinates multi-agent workflows. |
| `/setup-pm` | Configures package manager detection (npm/pnpm/yarn/bun). |

### How commands work together

A typical development flow chains commands:

```
/plan          →  Plan the feature (get approval first)
/tdd           →  Implement with test-driven development
/build-fix     →  Fix any build errors
/code-review   →  Review code quality and security
/verify        →  Run full verification before PR
```

### Where commands live

Commands are markdown files in `commands/`. Each has a frontmatter `description` and a workflow definition. To install them, copy the `commands/` folder to `~/.claude/commands/`.

---

## Skills — Deep Knowledge Modules

Skills are knowledge packages that Claude loads based on context. While rules are short and always-on, skills are detailed reference documents for specific domains.

### Skills in this repo

**General Development:**
| Skill | Purpose |
|-------|---------|
| `coding-standards` | TypeScript/JavaScript best practices, naming, patterns |
| `tdd-workflow` | Detailed TDD cycle with mocking patterns and examples |
| `verification-loop` | Build/type/lint/test/security verification pipeline |
| `frontend-patterns` | React, Next.js component patterns |
| `backend-patterns` | API design, database operations |
| `security-review` | OWASP Top 10 checklist and vulnerability patterns |
| `strategic-compact` | Context window management strategies |
| `e2e-testing` | End-to-end testing with Playwright |
| `api-design` | REST API conventions and schemas |
| `search-first` | Search before writing patterns |

**Language-Specific:**
| Skill | Purpose |
|-------|---------|
| `python-patterns` | Python best practices |
| `python-testing` | pytest patterns and fixtures |
| `golang-patterns` | Go idioms and patterns |
| `golang-testing` | Go testing with table-driven tests |
| `java-coding-standards` | Java conventions |
| `cpp-coding-standards` | C++ modern practices |
| `cpp-testing` | C++ testing frameworks |
| `swift-concurrency-6-2` | Swift 6.2 concurrency patterns |
| `swiftui-patterns` | SwiftUI view patterns |

**Framework-Specific:**
| Skill | Purpose |
|-------|---------|
| `django-patterns` | Django project patterns |
| `django-tdd` | Django test-driven development |
| `django-security` | Django security checklist |
| `django-verification` | Django verification loop |
| `springboot-patterns` | Spring Boot patterns |
| `springboot-tdd` | Spring Boot TDD |
| `springboot-security` | Spring Boot security |
| `springboot-verification` | Spring Boot verification |

**Infrastructure & Data:**
| Skill | Purpose |
|-------|---------|
| `docker-patterns` | Dockerfile and compose best practices |
| `deployment-patterns` | CI/CD and deployment strategies |
| `postgres-patterns` | PostgreSQL query optimization |
| `database-migrations` | Safe migration patterns |
| `clickhouse-io` | ClickHouse analytics patterns |

**Advanced:**
| Skill | Purpose |
|-------|---------|
| `continuous-learning` | Session pattern extraction |
| `continuous-learning-v2` | Advanced learning with observer agents |
| `eval-harness` | Evaluation harness for testing Claude's outputs |
| `iterative-retrieval` | Multi-step code retrieval strategies |
| `configure-ecc` | How to configure this plugin itself |

### How skills work

Skills are markdown files in `skills/<skill-name>/SKILL.md`. Each skill has:

1. **Frontmatter** — Name and description (helps Claude decide when to load it)
2. **When to Use** — Situations where this skill applies
3. **Core Content** — Detailed guidelines, patterns, and code examples
4. **Best Practices** — Do's and don'ts

Claude automatically activates relevant skills based on what you're working on. You can also reference them explicitly: "use the tdd-workflow skill."

---

## Agents (Subagents) — Specialist Delegates

Agents are specialized AI assistants that your main Claude session can delegate tasks to. Each agent has a focused role, limited tools, and a specific model assignment.

### Why use agents?

- **Focus** — Each agent has a narrow expertise, leading to better results
- **Parallel execution** — Agents can run in background while you keep working
- **Context protection** — Agent work happens in a separate context, preserving your main session
- **Tool scoping** — Agents only get the tools they need, reducing errors

### Agents in this repo

| Agent | Model | Tools | What It Does |
|-------|-------|-------|-------------|
| **planner** | Opus | Read, Grep, Glob | Creates comprehensive implementation plans with phases, risks, and testing strategies. Read-only — doesn't write code. |
| **architect** | Opus | Read, Grep, Glob | Designs system architecture, evaluates trade-offs, creates ADRs (Architecture Decision Records). Read-only. |
| **tdd-guide** | Sonnet | Read, Write, Edit, Bash, Grep | Enforces test-driven development. Writes tests first, then implements minimal code to pass. |
| **code-reviewer** | Sonnet | Read, Grep, Glob, Bash | Reviews code for security, quality, and maintainability. Outputs findings by severity. |
| **security-reviewer** | Sonnet | Read, Write, Edit, Bash, Grep, Glob | Scans for OWASP Top 10 vulnerabilities, hardcoded secrets, injection attacks. |
| **build-error-resolver** | Sonnet | Read, Write, Edit, Bash, Grep, Glob | Diagnoses and fixes build errors automatically. |
| **e2e-runner** | Sonnet | Read, Write, Edit, Bash, Grep, Glob | Generates and runs end-to-end tests. |
| **refactor-cleaner** | Sonnet | Read, Write, Edit, Bash, Grep, Glob | Removes dead code, unused imports, and cleans up after long sessions. |
| **doc-updater** | Sonnet | Read, Write, Edit, Grep, Glob | Keeps documentation in sync with code changes. |
| **go-reviewer** | Sonnet | Read, Grep, Glob, Bash | Go-specific code review. |
| **go-build-resolver** | Sonnet | Read, Write, Edit, Bash, Grep, Glob | Fixes Go build errors. |
| **python-reviewer** | Sonnet | Read, Grep, Glob, Bash | Python-specific code review. |

### Agent anatomy

Each agent is a markdown file with YAML frontmatter:

```markdown
---
name: code-reviewer
description: Expert code review specialist. Use immediately after writing code.
tools: ["Read", "Grep", "Glob", "Bash"]
model: sonnet
---

You are a senior code reviewer ensuring high standards...

## Review Process
1. Gather context — Run git diff
2. Understand scope
3. Read surrounding code
4. Apply review checklist
5. Report findings
```

Key fields:
- **name** — Lowercase, hyphenated identifier
- **description** — Tells Claude *when* to use this agent (be specific)
- **tools** — Only the tools this agent needs (principle of least privilege)
- **model** — `haiku` (simple tasks), `sonnet` (coding), `opus` (complex reasoning)

### Installing agents

Copy the `agents/` folder to `~/.claude/agents/`.

---

## Hooks — Automatic Event-Driven Automations

Hooks are scripts that fire automatically when specific events happen in Claude Code. They enforce quality, catch mistakes, and automate repetitive tasks — without you having to remember to do them.

### Hook lifecycle

```
You send a message
    → UserPromptSubmit hooks fire
        → Claude picks a tool
            → PreToolUse hooks fire (can BLOCK or WARN)
                → Tool executes
                    → PostToolUse hooks fire (can WARN)
                        → Claude finishes
                            → Stop hooks fire
```

### Hook types

| Type | When It Fires | Can Block? | Use For |
|------|--------------|------------|---------|
| **PreToolUse** | Before a tool runs | Yes (exit code 2) | Validation, warnings, blocking dangerous commands |
| **PostToolUse** | After a tool runs | No | Formatting, type checking, linting |
| **SessionStart** | When a session begins | No | Loading previous context, detecting environment |
| **SessionEnd** | When a session ends | No | Saving state, extracting patterns |
| **PreCompact** | Before context compaction | No | Saving important state before compression |
| **Stop** | After Claude responds | No | Auditing, cleanup checks |

### Hooks included in this repo

**PreToolUse (before tool runs):**
- **Dev server blocker** — Blocks `npm run dev` outside tmux (ensures you can access logs)
- **Tmux reminder** — Suggests tmux for long-running commands (npm test, cargo build, docker)
- **Git push reminder** — Reminds you to review changes before pushing
- **Doc file warning** — Warns about creating non-standard markdown files
- **Strategic compact** — Suggests `/compact` every ~50 tool calls

**PostToolUse (after tool runs):**
- **Auto-format** — Runs Prettier/Biome on JS/TS files after edits
- **TypeScript check** — Runs `tsc --noEmit` after editing `.ts`/`.tsx` files
- **Console.log warning** — Warns about `console.log` statements in edited files
- **PR logger** — Logs the PR URL after `gh pr create`
- **Build analysis** — Background analysis after build commands

**Lifecycle:**
- **Session start** — Loads previous context and detects package manager
- **Pre-compact** — Saves state before context compaction
- **Session end** — Persists session state
- **Pattern extraction** — Evaluates session for reusable patterns (continuous learning)
- **Console.log audit** — Checks all modified files for `console.log` after each response

### Hook exit codes

- `0` — Success, continue normally
- `2` — **Block** the tool call (PreToolUse only)
- Other non-zero — Error, logged but doesn't block

### Writing your own hook

Hooks receive JSON on stdin and must output JSON on stdout:

```javascript
// my-hook.js
let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  const input = JSON.parse(data);

  // Access tool info
  const toolName = input.tool_name;     // "Edit", "Bash", etc.
  const toolInput = input.tool_input;   // Tool parameters

  // Warn (non-blocking)
  console.error('[Hook] Warning: something to note');

  // Block (PreToolUse only)
  // process.exit(2);

  // Always output original data
  console.log(data);
});
```

### Common hook recipes

**Block files over 800 lines:**
```json
{
  "matcher": "Write",
  "hooks": [{
    "type": "command",
    "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const lines=(i.tool_input?.content||'').split('\\n').length;if(lines>800){console.error('[Hook] BLOCKED: File exceeds 800 lines');process.exit(2)}console.log(d)})\""
  }],
  "description": "Block creation of files larger than 800 lines"
}
```

**Auto-format Python with ruff:**
```json
{
  "matcher": "Edit",
  "hooks": [{
    "type": "command",
    "command": "node -e \"let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const p=i.tool_input?.file_path||'';if(/\\.py$/.test(p)){require('child_process').execFileSync('ruff',['format',p],{stdio:'pipe'})}console.log(d)})\""
  }],
  "description": "Auto-format Python files with ruff after edits"
}
```

All hooks in this repo use Node.js for cross-platform compatibility (Windows, macOS, Linux).

---

## MCP Servers — External Service Connections

MCP (Model Context Protocol) servers connect Claude to external services. Instead of you copy-pasting data from databases, deployment platforms, or documentation, Claude can query them directly.

### Pre-configured MCPs in this repo

| MCP Server | What It Connects To |
|-----------|-------------------|
| **github** | GitHub PRs, issues, repos |
| **supabase** | Supabase database operations |
| **vercel** | Vercel deployments and projects |
| **railway** | Railway deployments |
| **firecrawl** | Web scraping and crawling |
| **memory** | Persistent memory across sessions |
| **sequential-thinking** | Chain-of-thought reasoning |
| **cloudflare-docs** | Cloudflare documentation search |
| **cloudflare-workers-bindings** | Cloudflare Workers bindings |
| **cloudflare-observability** | Cloudflare logs |
| **clickhouse** | ClickHouse analytics queries |
| **context7** | Live documentation lookup |
| **magic** | Magic UI components |
| **filesystem** | Filesystem operations |

### Installing MCPs

Copy the servers you need from `mcp-configs/mcp-servers.json` into your `~/.claude.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

### Critical rule: context window management

Each enabled MCP adds tools to Claude's context window. Too many enabled MCPs will significantly shrink your usable context.

- Configure 20-30 MCPs in total
- Keep **under 10 enabled** at any time
- Keep **under 80 tools active**
- Disable unused MCPs per-project via `/mcp` or `/plugins`

---

## Contexts — Mode Switching

Contexts are presets that change Claude's behavior based on what you're doing. This repo includes three contexts:

### Development Context (`contexts/dev.md`)
- **Focus:** Implementation, coding, building
- **Behavior:** Write code first, explain after. Prefer working solutions. Run tests. Keep commits atomic.
- **Priorities:** (1) Get it working, (2) Get it right, (3) Get it clean

### Review Context (`contexts/review.md`)
- **Focus:** PR review, code analysis
- **Behavior:** Read thoroughly, prioritize by severity, suggest fixes, check security
- **Checklist:** Logic errors, edge cases, error handling, security, performance, readability, test coverage

### Research Context (`contexts/research.md`)
- **Focus:** Investigation, exploration
- **Behavior:** Read-only, gather information, summarize findings

---

## Installation & Setup

### Quick start (recommended)

```bash
# Clone the repo
git clone https://github.com/affaan-m/everything-claude-code.git
cd everything-claude-code

# Install rules for your language(s)
./install.sh typescript          # Common + TypeScript rules
./install.sh typescript python   # Multiple languages

# Manually copy what you need
cp -r agents/ ~/.claude/agents/
cp -r commands/ ~/.claude/commands/
cp -r skills/ ~/.claude/skills/
cp -r contexts/ ~/.claude/contexts/
```

### Via npm

```bash
npx everything-claude-code typescript
```

### What gets installed where

| Component | Destination |
|-----------|------------|
| Rules | `~/.claude/rules/` |
| Agents | `~/.claude/agents/` |
| Commands | `~/.claude/commands/` |
| Skills | `~/.claude/skills/` |
| Contexts | `~/.claude/contexts/` |
| Hooks | Copy entries into `~/.claude/settings.json` |
| MCP Servers | Copy entries into `~/.claude.json` |

### For Cursor users

```bash
./install.sh --target cursor typescript
```

This installs to `.cursor/` with the appropriate format for Cursor.

---

## Recommended Workflow

Here is a suggested workflow using the tools in this repo:

### 1. Start a new feature

```
/plan I need to add user authentication with OAuth
```

Claude's **planner** agent creates a phased plan with risks and dependencies. Review it. Modify if needed. Approve when ready.

### 2. Implement with TDD

```
/tdd Implement the OAuth callback handler from Phase 2 of the plan
```

Claude's **tdd-guide** agent:
1. Defines interfaces
2. Writes failing tests (RED)
3. Implements minimal code (GREEN)
4. Refactors (IMPROVE)
5. Verifies 80%+ coverage

### 3. Fix build errors

```
/build-fix
```

The **build-error-resolver** agent diagnoses and fixes any build failures.

### 4. Review your code

```
/code-review
```

The **code-reviewer** agent checks for security vulnerabilities, code quality issues, and React/Node.js anti-patterns. It outputs a severity-rated report.

### 5. Run full verification

```
/verify
```

Runs the complete verification loop: build, typecheck, lint, tests, security scan, and diff review. Produces a PASS/FAIL report.

### 6. Clean up

```
/refactor-clean
```

Removes dead code, unused imports, and stale files.

---

## Tips, Tricks & Keyboard Shortcuts

### Essential keyboard shortcuts

| Shortcut | What It Does |
|----------|-------------|
| `Ctrl+U` | Delete entire input line (faster than backspace) |
| `Shift+Enter` | Multi-line input |
| `Tab` | Toggle extended thinking display |
| `Shift+Tab` | Cycle between modes (code, plan, etc.) |
| `Esc Esc` | Interrupt Claude mid-response / restore code |
| `!` | Quick bash command prefix |
| `@` | Search for files by name |
| `/` | Open slash command menu |

### Parallel workflows

**Forking conversations:** Use `/fork` to split your session into parallel tracks for non-overlapping tasks.

**Git worktrees:** For running multiple Claude instances on the same repo without conflicts:

```bash
git worktree add ../feature-branch feature-branch
# Run a separate Claude instance in each worktree
```

### tmux for long-running commands

Always run dev servers and long builds inside tmux so you can detach and reattach:

```bash
tmux new -s dev         # Start a named session
# Run your dev server here
# Ctrl+B, D to detach
tmux attach -t dev      # Reattach later
```

The included hooks will remind you about this automatically.

### Other useful built-in commands

- `/compact` — Manually trigger context compaction when you're running low
- `/rewind` — Go back to a previous state
- `/statusline` — Customize your status bar (branch, context %, model, todos)
- `/fork` — Fork conversation for parallel work

---

## Editor Setup

Claude Code works from any terminal, but pairing it with a good editor amplifies the experience.

### Zed

Fast, Rust-based editor that keeps up with rapid Claude edits. Features:
- Real-time file tracking as Claude edits
- Minimal resource usage (won't compete with Claude for RAM/CPU)
- Agent panel integration
- `CMD+Shift+R` command palette for quick access

### VS Code / Cursor

Works well in terminal mode or via the Claude Code extension:
- Automatic sync with LSP using `\ide`
- Native graphical interface via extension
- Split terminal view for Claude + editor side by side

### General editor tips

1. **Split your screen** — Terminal with Claude on one side, editor on the other
2. **Enable auto-save** — So Claude's file reads are always current
3. **Enable file watchers** — Most editors auto-reload changed files
4. **Use git integration** — Review Claude's changes via your editor's diff view

---

## Context Window Management

Claude has a ~200k token context window, but it shrinks significantly with MCPs and plugins enabled. Managing your context is critical for long sessions.

### Key strategies

1. **Disable unused MCPs** — Keep under 10 enabled, under 80 tools active
2. **Use `/compact` proactively** — Don't wait for automatic compaction; compact at logical breakpoints
3. **Fork conversations** — Use `/fork` for separate subtasks instead of one long thread
4. **Scope your agents** — Give agents only the tools they need
5. **Use strategic compaction** — The `strategic-compact` skill/hook suggests compaction every ~50 tool calls
6. **Delegate to subagents** — Heavy analysis runs in a separate context, preserving your main session

---

## Glossary

| Term | Definition |
|------|-----------|
| **CLAUDE.md** | A markdown file in your project root that gives Claude project-specific instructions. Read automatically at session start. |
| **Rule** | A markdown file in `~/.claude/rules/` that Claude always follows. Short, focused, non-negotiable. |
| **Skill** | A detailed knowledge module in `~/.claude/skills/` that Claude loads based on context. Includes patterns, examples, and best practices. |
| **Command** | A slash command (e.g., `/tdd`) defined in `~/.claude/commands/` that triggers a predefined workflow. |
| **Agent / Subagent** | A specialized AI assistant in `~/.claude/agents/` that Claude can delegate tasks to. Has limited tools and a focused role. |
| **Hook** | An automatic script that fires on events like PreToolUse or PostToolUse. Defined in settings.json. |
| **MCP** | Model Context Protocol — a standard for connecting Claude to external services (databases, deployment platforms, etc.). |
| **Context** | A mode preset (dev, review, research) that changes Claude's behavior and priorities. |
| **Context window** | The total amount of text Claude can hold in memory during a session (~200k tokens, reduced by active tools). |
| **Compact / Compaction** | Summarizing earlier parts of the conversation to free up context window space. |
| **TDD** | Test-Driven Development — write tests first, then implement code to pass them. Red-Green-Refactor cycle. |
| **Worktree** | A git feature that creates independent checkouts of your repo, allowing parallel Claude instances without conflicts. |
| **Frontmatter** | YAML metadata at the top of a markdown file (between `---` markers) that defines properties like name, description, tools, and model. |

---

## Next Steps

1. **Start simple** — Create a `CLAUDE.md` in your project with basic instructions
2. **Install rules** — Run `./install.sh` with your language to get coding standards
3. **Try a command** — Use `/plan` on your next feature to see the planner agent in action
4. **Add hooks gradually** — Start with the auto-format and console.log warning hooks
5. **Explore skills** — Browse the `skills/` folder for your framework or language

For more advanced patterns, see:
- [The Shortform Guide](./the-shortform-guide.md) — Quick reference with the author's setup
- [The Longform Guide](./the-longform-guide.md) — Deep dive into advanced workflows

---

*Built on the [Everything Claude Code](https://github.com/affaan-m/everything-claude-code) repository — an Anthropic hackathon-winning collection of production-ready Claude Code configurations.*
