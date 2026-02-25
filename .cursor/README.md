# Everything Claude Code — Cursor IDE Support

Pre-translated configurations for [Cursor IDE](https://cursor.sh), part of the everything-claude-code (ECC) project.

## What's Here

This directory provides Cursor-compatible rule files (`.mdc` format) that are derived from
ECC's canonical `rules/` directory. Rules use Cursor's YAML frontmatter format with
`description`, `globs`, and `alwaysApply` fields.

## Installation

### Option 1: Copy rules to your project

```bash
# Copy the .cursor/rules/ directory into your project root
cp -r .cursor/rules/ /path/to/your/project/.cursor/rules/
```

### Option 2: Symlink (stays in sync with ECC updates)

```bash
# Symlink the rules directory
ln -s /path/to/ecc/.cursor/rules /path/to/your/project/.cursor/rules
```

### Option 3: Use install.sh

```bash
bash .cursor/install.sh --target /path/to/your/project
```

## Directory Structure

```
.cursor/
  rules/           # Cursor-native .mdc rule files
    common-coding-style.mdc
    common-git-workflow.mdc
    common-patterns.mdc
    common-performance.mdc
    common-security.mdc
    common-testing.mdc
    common-agents.mdc
    common-hooks.mdc
  install.sh       # Helper script for installation
  MIGRATION.md     # Guide: migrating from Claude Code to Cursor
```

## Key Differences from Claude Code

| Feature | Claude Code | Cursor |
|---------|-------------|--------|
| Rules location | `~/.claude/rules/` | `.cursor/rules/*.mdc` |
| Agents | `.claude/agents/` | `.cursor/agents/` |
| Skills | `.claude/skills/` | `.cursor/skills/` |
| Commands | `.claude/commands/` | `.cursor/commands/` |
| MCP config | `~/.claude.json` | `.cursor/mcp.json` |
| Hooks | `hooks.json` (PreToolUse/PostToolUse) | No direct equivalent |

See [MIGRATION.md](./MIGRATION.md) for detailed mapping.

## Rule Format

Cursor rules use `.mdc` files with YAML frontmatter:

```
---
description: Short description for agent selection
globs: "**/*.ts,**/*.tsx"  # optional: auto-apply to matching files
alwaysApply: true           # or false for agent-selected rules
---

# Rule Content Here
...
```

## Source

These files are generated from the canonical `rules/` directory.
The source files are the single source of truth — this directory
provides Cursor-formatted wrappers to avoid duplication.

For the latest rules, see the canonical files in:
- `rules/common/` — language-agnostic rules
- `rules/typescript/` — TypeScript-specific rules
- `rules/python/` — Python-specific rules
- `rules/golang/` — Go-specific rules
