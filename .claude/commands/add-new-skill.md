---
name: add-new-skill
description: Workflow command scaffold for add-new-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill

Use this workflow when working on **add-new-skill** in `everything-claude-code`.

## Goal

Adds a new skill to the project, typically as a modular capability for agents or workflows.

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

- Create a new SKILL.md file under skills/ or .agents/skills/ or .claude/skills/
- Document the skill's purpose, usage, and configuration in SKILL.md
- Optionally update documentation or manifests if the skill is part of a larger workflow

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.