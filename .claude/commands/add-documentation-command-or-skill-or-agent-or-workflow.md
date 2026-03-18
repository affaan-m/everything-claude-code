---
name: add-documentation-command-or-skill-or-agent-or-workflow
description: Workflow command scaffold for add-documentation-command-or-skill-or-agent-or-workflow in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-documentation-command-or-skill-or-agent-or-workflow

Use this workflow when working on **add-documentation-command-or-skill-or-agent-or-workflow** in `everything-claude-code`.

## Goal

Adds documentation for a new command, skill, agent, or workflow.

## Common Files

- `.claude/commands/add-documentation-command-or-skill-or-agent-or-workflow.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/skills/everything-claude-code/SKILL.md`
- `.codex/AGENTS.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update .claude/commands/add-documentation-command-or-skill-or-agent-or-workflow.md
- Create or update .agents/skills/everything-claude-code/SKILL.md or .claude/skills/everything-claude-code/SKILL.md (for skills)
- Create or update .codex/AGENTS.md (for agents)

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.