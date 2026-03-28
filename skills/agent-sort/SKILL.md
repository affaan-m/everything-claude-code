---
name: agent-sort
description: >
  Sort and install ECC for any project. Launches 6 parallel agents that read every
  ECC item, search the actual codebase for evidence, and sort into DAILY vs LIBRARY.
  Use when: "sort ECC", "set up ECC", "install ECC for this project", "cherry pick ECC",
  "configure ECC skills", or when starting ECC setup on a new repo.
---

# Agent-Sort: Automated ECC Cherry-Picker

## Prerequisites

ECC must be cloned locally. Check these locations in order:
1. `~/ecc-reference/`
2. `/tmp/everything-claude-code/`
3. Ask the user for the path if neither exists.

## Step 1: Locate ECC

```bash
ECC_PATH=""
if [ -d ~/ecc-reference/agents ]; then ECC_PATH=~/ecc-reference
elif [ -d /tmp/everything-claude-code/agents ]; then ECC_PATH=/tmp/everything-claude-code
fi
```

If not found, tell the user:
```
ECC not found. Run: git clone https://github.com/affaan-m/everything-claude-code.git ~/ecc-reference
```

## Step 2: Launch 6 Parallel Agents

Launch ALL 6 agents simultaneously using the Agent tool. Each agent reads every ECC item in its category and searches THIS repo for matching languages, frameworks, imports, and file types.

### Agent 1 — AGENTS (reads ~/ecc-reference/agents/*.md)

```
Read the first 20 lines of each agent .md file in {ECC_PATH}/agents/.
For each, search THIS repo for matching languages, frameworks, imports, file extensions.

Evidence checks:
- Glob("**/*.ts", "**/*.tsx") for TypeScript
- Glob("**/*.py") for Python
- Glob("**/*.go", "**/go.mod") for Go
- Glob("**/*.rs", "**/Cargo.toml") for Rust
- Check package.json for framework dependencies

Output format:
DAILY:
- agent-name.md | one-line evidence from repo

LIBRARY:
- agent-name.md | reason

SKIP:
- agent-name.md | reason
```

### Agent 2 — SKILLS (reads ~/ecc-reference/skills/*/SKILL.md)

```
Read the SKILL.md frontmatter (first 15 lines) in each {ECC_PATH}/skills/*/ folder.
For each, search THIS repo for matching patterns, dependencies, and file structure.

Output: DAILY / LIBRARY / SKIP with evidence.
```

### Agent 3 — COMMANDS (reads ~/ecc-reference/commands/*.md)

```
Read the first 15 lines of each {ECC_PATH}/commands/*.md.
- Language-specific commands (/go-review, /rust-build) → match to project languages
- General dev commands (/plan, /verify, /tdd) → DAILY for any project
- Meta-tool commands (/instinct-status, /evolve) → LIBRARY

Output: DAILY / LIBRARY / SKIP with evidence.
```

### Agent 4 — RULES (reads ~/ecc-reference/rules/**/*.md)

```
List all rule files in {ECC_PATH}/rules/ (all subdirectories).
Check this repo for matching languages:
- Glob("**/*.ts") → install rules/typescript/
- Glob("**/*.py") → install rules/python/
- rules/common/ → always install

Check if .claude/rules/ already exists. Flag duplicates.

Output: INSTALL / SKIP per file.
```

### Agent 5 — HOOKS (reads ~/ecc-reference/hooks/)

```
Read {ECC_PATH}/hooks/hooks.json and {ECC_PATH}/hooks/README.md.
List all scripts in {ECC_PATH}/scripts/hooks/ and {ECC_PATH}/scripts/lib/.
Check this repo for:
- Prettier config (.prettierrc, prettier in package.json)
- TypeScript (tsconfig.json)
- ESLint config
- OS: flag tmux hooks on Windows, osascript hooks on non-macOS

Output: INSTALL / SKIP / NEEDS-ADAPTATION per item.
```

### Agent 6 — EXTRAS (contexts, guides, configs)

```
Read {ECC_PATH}/contexts/*.md → always DAILY (lightweight mode-switchers).
Check {ECC_PATH}/mcp-configs/, examples/, guides → LIBRARY-REFERENCE.
Check .agents/, docs/, tests/ → SKIP (ECC internals).

Output: DAILY / LIBRARY-REFERENCE / SKIP per item.
```

## Step 3: Compile Results

After all 6 agents return, combine results into a single sorted list:
- DAILY items (typically ~50)
- LIBRARY items (typically ~170)
- INSTALL rules (typically ~14 for one language)
- INSTALL hooks/scripts (typically ~40)

## Step 4: Install

### Create directory structure
```bash
mkdir -p .claude/skills/skill-library/references
mkdir -p .claude/rules
mkdir -p .claude/hooks
mkdir -p .claude/scripts/hooks .claude/scripts/lib
```

### Copy DAILY items
```
Agents     → .claude/skills/{name}/SKILL.md
Skills     → .claude/skills/{name}/ (cp -r, keeps references/)
Commands   → .claude/skills/cmd-{name}/SKILL.md
Contexts   → .claude/skills/context-{name}/SKILL.md
```

### Copy LIBRARY items
```
All non-DAILY → .claude/skills/skill-library/references/{prefix}-{name}.md
Prefix: agent-, skill-, cmd- to avoid name collisions
```

### Create router
Create `.claude/skills/skill-library/SKILL.md` with a trigger table listing every library item with keywords that would activate it. This is the ONLY way Claude finds library items.

### Copy rules
Only matching languages + common/:
```
{ECC_PATH}/rules/common/*.md     → .claude/rules/common/
{ECC_PATH}/rules/{language}/*.md → .claude/rules/{language}/
```

### Copy hooks + scripts
```
{ECC_PATH}/hooks/hooks.json              → .claude/hooks/
{ECC_PATH}/scripts/hooks/*.js            → .claude/scripts/hooks/
{ECC_PATH}/scripts/lib/*.js              → .claude/scripts/lib/
{ECC_PATH}/scripts/setup-package-manager.js → .claude/scripts/
```

Skip any items marked NEEDS-ADAPTATION with a note to the user.

### Copy guides as references
```
{ECC_PATH}/the-shortform-guide.md  → .claude/skills/skill-library/references/
{ECC_PATH}/the-longform-guide.md   → .claude/skills/skill-library/references/
{ECC_PATH}/the-security-guide.md   → .claude/skills/skill-library/references/
```

## Step 5: Verify

Check every item landed on disk:
```bash
# Count daily skills (exclude skill-library)
ls -d .claude/skills/*/ | grep -v skill-library | wc -l

# Count library references
ls .claude/skills/skill-library/references/ | wc -l

# Count rules
ls .claude/rules/**/*.md | wc -l

# Verify hooks
test -f .claude/hooks/hooks.json && echo "✓" || echo "✗"

# Count scripts
ls .claude/scripts/hooks/ | wc -l
ls .claude/scripts/lib/ | wc -l
```

Print summary:
```
Daily skills:     XX folders
Library refs:     XX files
Router:           ✓/✗
Rules:            XX files (common + {language})
Hook scripts:     XX files
Lib scripts:      XX files
Total files:      XX
Token cost:       ~X,XXX always loaded
```

## Step 6: Clean up stale rules

If `.claude/rules/` has language directories for languages NOT found in the repo, remove them:
```bash
# Example: if no Python files exist
test $(find . -name "*.py" -not -path "./node_modules/*" | wc -l) -eq 0 && rm -rf .claude/rules/python/
```

## What stays the same across every project

These are always DAILY regardless of stack:
```
Agents:    planner, architect, code-reviewer, security-reviewer,
           build-error-resolver, refactor-cleaner, tdd-guide,
           docs-lookup, doc-updater
Skills:    coding-standards, tdd-workflow, security-review, security-scan,
           continuous-learning, strategic-compact, verification-loop
Commands:  learn, checkpoint, docs, aside, plan, verify, save-session,
           resume-session, quality-gate, build-fix, code-review, refactor-clean
Contexts:  dev, review, research
```

~35 items always daily. The remaining ~15 daily items come from matching the project's stack.
