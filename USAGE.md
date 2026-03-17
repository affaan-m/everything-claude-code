# Usage Guide

How to use this plugin and keep it updated.

## How It Works

This repo is a **Claude Code plugin** — a collection of agents, skills, commands, hooks, and rules. The installer copies everything into `~/.claude/`, where Claude Code reads it from. Once installed, the plugin is active in **every** Claude Code session, in any project folder.

```
drixxodev-ai (source)  -->  ./install.sh  -->  ~/.claude/ (active config)
```

## First-Time Setup

```bash
cd ~/WebstormProjects/drixxodev-ai
./install.sh typescript    # or: ./install.sh python, ./install.sh golang, etc.
```

This copies all agents, skills, commands, hooks, and rules into `~/.claude/`.

## Using With Your Projects

You do **not** install this repo into your project. Instead:

1. Create/open your project in a separate folder:
   ```bash
   cd ~/WebstormProjects/my-app
   claude
   ```

2. All skills, agents, and commands from this plugin are already available. Use them:
   ```
   /plan Add user authentication
   /tdd Write a new feature
   /code-review
   /build-fix
   ```

> **Important**: Never clone project repos into `drixxodev-ai`. This folder is for the plugin only. Projects go in `~/WebstormProjects/`.

## Adding or Editing Plugin Components

After you add, edit, or remove any file in this repo, **re-run the installer** to sync changes:

```bash
./install.sh typescript
```

Then start a new Claude Code session to pick up the changes.

### Quick reference

| Action | Where to add/edit | Then run |
|---|---|---|
| New agent | `agents/my-agent.md` | `./install.sh typescript` |
| New skill | `skills/my-skill/SKILL.md` | `./install.sh typescript` |
| New command | `commands/my-command.md` | `./install.sh typescript` |
| Edit a hook | `hooks/` | `./install.sh typescript` |
| Edit a rule | `rules/` | `./install.sh typescript` |

### File formats

- **Agents**: Markdown with YAML frontmatter (`name`, `description`, `tools`, `model`)
- **Skills**: Markdown with clear sections (When to Use, How It Works, Examples)
- **Commands**: Markdown with `description` frontmatter
- **Hooks**: JSON with `matcher` and `hooks` array
- **Rules**: Plain Markdown

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed format guides.

## Running Tests

```bash
node tests/run-all.js
```

## Folder Layout

```
drixxodev-ai/
  agents/       # Specialized subagents (planner, reviewer, tdd-guide, ...)
  skills/       # Workflow definitions and domain knowledge
  commands/     # Slash commands (/tdd, /plan, /e2e, ...)
  hooks/        # Trigger-based automations
  rules/        # Always-follow guidelines
  mcp-configs/  # MCP server configurations
  scripts/      # Utilities for hooks and setup
  tests/        # Test suite
```