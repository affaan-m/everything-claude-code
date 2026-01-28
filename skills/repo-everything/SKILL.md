---
name: everything
description: Claude Code plugin and learning system - complete collection of agents, skills, hooks, commands
repo: chunrui-qashier/everything-claude-code
auto_generated: true
created: 2026-01-28
---

# Everything Claude Code

Complete Claude Code configuration collection including production-ready agents, skills, hooks, commands, rules, and MCP configs.

This repo is our Claude Code plugin system for:
- Auto-learning and extracting work patterns
- Managing cross-project skills and instincts
- Unified hooks and commands configuration

## Repository Info

- **Org:** chunrui-qashier
- **Repo:** everything-claude-code
- **Local Path:** ~/everything-claude-code

## Key Components

| Directory | Purpose |
|-----------|---------|
| `agents/` | Specialized sub-agents (planner, architect, code-reviewer) |
| `commands/` | Custom commands (/auto-learn, /verify, /tdd) |
| `hooks/` | Lifecycle hooks (PreCompact, SessionStart) |
| `skills/` | Reusable skill sets |
| `config/` | Configuration files (auto-learn.json) |

## Learned Patterns

_No patterns learned yet. Run `/auto-learn` after working in this repo._

## Notes

- This is our "meta" project - improves Claude Code experience
- Changes to this repo affect Claude Code behavior in all other projects
- Be careful with hook modifications - may impact performance
