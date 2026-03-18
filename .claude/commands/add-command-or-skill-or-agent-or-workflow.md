---
name: add-command-or-skill-or-agent-or-workflow
description: Workflow command scaffold for add-command-or-skill-or-agent-or-workflow in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-command-or-skill-or-agent-or-workflow

Use this workflow when working on **add-command-or-skill-or-agent-or-workflow** in `everything-claude-code`.

## Goal

Adds a new command, skill, agent, or workflow to the system.

## Common Files

- `.claude/commands/add-command-or-skill-or-agent-or-workflow.md`
- `.claude/skills/everything-claude-code/SKILL.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.codex/agents/docs-researcher.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/explorer.toml`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update .claude/commands/add-command-or-skill-or-agent-or-workflow.md
- Create or update .claude/skills/everything-claude-code/SKILL.md or .agents/skills/everything-claude-code/SKILL.md for skills
- Create or update agent definitions in .codex/agents/*.toml

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.