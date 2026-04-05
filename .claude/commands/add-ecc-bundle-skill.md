---
name: add-ecc-bundle-skill
description: Workflow command scaffold for add-ecc-bundle-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-ecc-bundle-skill

Use this workflow when working on **add-ecc-bundle-skill** in `everything-claude-code`.

## Goal

Adds a new ECC (everything-claude-code) skill by creating a SKILL.md file in both .claude/skills and .agents/skills directories.

## Common Files

- `.claude/skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create .claude/skills/everything-claude-code/SKILL.md
- Create .agents/skills/everything-claude-code/SKILL.md

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.