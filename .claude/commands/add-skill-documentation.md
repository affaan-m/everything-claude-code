---
name: add-skill-documentation
description: Workflow command scaffold for add-skill-documentation in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-skill-documentation

Use this workflow when working on **add-skill-documentation** in `everything-claude-code`.

## Goal

Adds or updates documentation for a skill in both .agents/skills and .claude/skills directories.

## Common Files

- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/skills/everything-claude-code/SKILL.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update SKILL.md in .agents/skills/everything-claude-code/
- Create or update SKILL.md in .claude/skills/everything-claude-code/
- Commit both files together.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.