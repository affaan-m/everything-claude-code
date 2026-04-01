---
name: add-new-skill
description: Workflow command scaffold for add-new-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill

Use this workflow when working on **add-new-skill** in `everything-claude-code`.

## Goal

Adds a new skill to the repository, typically as a modular agent capability or workflow.

## Common Files

- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create a new SKILL.md file in skills/ or .agents/skills/ or .claude/skills/
- Document the skill's purpose, usage, and configuration
- Optionally, add supporting files (rules, scripts, etc.) in the skill's directory

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.