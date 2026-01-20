# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a **documentation and configuration repository** containing production-ready Claude Code configs adapted for **Odoo 15 Python development**: agents, skills, commands, rules, hooks, and MCP server configurations. There is no build system, test suite, or application code - only markdown files and JSON configurations.

## Repository Structure

```
agents/           # Subagent definitions with frontmatter (name, tools, model)
skills/           # Workflow definitions and domain knowledge
  odoo-15-developer/  # Complete Odoo 15 development reference
commands/         # Slash command definitions with frontmatter
rules/            # Always-follow guideline files
hooks/            # hooks.json with PreToolUse/PostToolUse automations
mcp-configs/      # MCP server configurations
examples/         # Example CLAUDE.md files for Odoo projects
plugins/          # Plugin ecosystem documentation
```

## File Format Conventions

**Agents** use frontmatter:
```markdown
---
name: agent-name
description: What it does
tools: Read, Grep, Glob, Bash
model: sonnet
---
```

**Commands** use frontmatter:
```markdown
---
description: Brief description
---
```

**Skills** as directories must contain a `SKILL.md` file.

**Hooks** in JSON include a `description` field alongside `matcher` and `hooks`.

## Odoo-Specific Patterns

This repository is configured for Odoo 15 development with:
- Two-Phase Testing methodology (Phase 1: DB verification, Phase 2: ORM tests)
- ACL and record rule validation
- ORM pattern enforcement
- Docker-based development workflow
- Python/PEP8 coding standards

## Environment Variables

Configs use placeholders for flexibility:
- `$ODOO_CONTAINER` - Docker container name
- `$ODOO_DB` - Database name
- `$ODOO_PORT` - Web server port (default: 8069)
- `$POSTGRES_CONTAINER` - PostgreSQL container name

## Contributing Workflow

1. Place files in appropriate directories matching their type
2. Use lowercase with hyphens for filenames: `odoo-reviewer.md`
3. Match filename to the agent/skill/command name
4. Never include actual API keys or sensitive data - use `YOUR_*_HERE` placeholders
5. Test configs with Claude Code on an Odoo project before submitting
6. Follow Python/PEP8 conventions in code examples
