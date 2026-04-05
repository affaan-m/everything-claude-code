---
name: single-skill-targeted-fix
description: Workflow command scaffold for single-skill-targeted-fix in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /single-skill-targeted-fix

Use this workflow when working on **single-skill-targeted-fix** in `everything-claude-code`.

## Goal

Makes a focused fix or improvement to a single skill's SKILL.md file, often for a specific bug or clarification.

## Common Files

- `skills/*/SKILL.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Identify the specific issue in one SKILL.md file.
- Edit the file to fix the problem.
- Commit the change with a concise message referencing the skill and fix.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.