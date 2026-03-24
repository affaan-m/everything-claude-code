---
name: add-or-update-skill
description: Workflow command scaffold for add-or-update-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-skill

Use this workflow when working on **add-or-update-skill** in `everything-claude-code`.

## Goal

Adds or updates a skill in the everything-claude-code system, including documentation and configuration.

## Common Files

- `.claude/commands/add-or-update-skill.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/skills/everything-claude-code/SKILL.md`
- `.agents/skills/everything-claude-code/agents/openai.yaml`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update .claude/commands/add-or-update-skill.md
- Create or update .agents/skills/everything-claude-code/SKILL.md and/or .claude/skills/everything-claude-code/SKILL.md
- Optionally update .agents/skills/everything-claude-code/agents/openai.yaml

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.