# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

Production-ready Claude Code configurations (agents, skills, hooks, commands, rules, contexts, MCP configs) from an Anthropic hackathon winner. Battle-tested over 10+ months of daily use.

## Architecture

This is a **configuration repository**, not a code project. It contains markdown files, JSON configs, and shell scripts that users copy to `~/.claude/` to customize Claude Code behavior.

### Component Types

| Directory | Purpose | Format |
|-----------|---------|--------|
| `agents/` | Subagents for delegated tasks | Markdown with YAML frontmatter |
| `skills/` | Workflow definitions, domain knowledge | Markdown or directory with SKILL.md |
| `commands/` | Slash commands (`/tdd`, `/plan`) | Markdown with description frontmatter |
| `rules/` | Always-follow guidelines | Markdown, one domain per file |
| `hooks/` | Tool event automations | JSON config + shell scripts |
| `contexts/` | Dynamic system prompt injection | Markdown |
| `mcp-configs/` | MCP server configurations | JSON |

### File Formats

**Agents** require frontmatter:
```markdown
---
name: agent-name
description: What it does
tools: Read, Grep, Glob, Bash
model: opus|sonnet|haiku
---
```

**Commands** require description:
```markdown
---
description: Brief description
---
```

**Hooks** in `hooks/hooks.json`:
```json
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"...\""",
  "hooks": [{"type": "command", "command": "..."}],
  "description": "What this hook does"
}
```

## Key Design Principles

1. **Agent-first** - Delegate complex tasks to specialized subagents
2. **Parallel execution** - Launch independent agents simultaneously
3. **Plan before execute** - Use planner agent for complex features
4. **Modular rules** - One domain per rule file, not monolithic configs

## Conventions

- Filenames: lowercase with hyphens (`code-reviewer.md`, `tdd-workflow.md`)
- No emojis in any files
- Agent/skill name should match filename
- API keys use `YOUR_*_HERE` placeholders in examples

## Hook Event Types

- `PreToolUse` - Before tool execution (validation, blocking)
- `PostToolUse` - After tool execution (formatting, warnings)
- `PreCompact` - Before context compaction (save state)
- `SessionStart` - New session initialization
- `Stop` - Session end processing

## When Contributing

1. Place files in the correct directory
2. Follow the format for that component type
3. Test with Claude Code before submitting
4. Use conventional commits: `feat:`, `fix:`, `docs:`
