---
name: harden-or-fix-skill-or-hook
description: Workflow command scaffold for harden-or-fix-skill-or-hook in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /harden-or-fix-skill-or-hook

Use this workflow when working on **harden-or-fix-skill-or-hook** in `everything-claude-code`.

## Goal

Improves robustness, fixes bugs, or clarifies documentation for an existing skill or hook, often with tests.

## Common Files

- `skills/*/SKILL.md`
- `skills/*/*.py`
- `skills/*/*.sh`
- `skills/*/*.mjs`
- `skills/*/references/*.md`
- `scripts/hooks/*.js`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit SKILL.md and/or implementation files under skills/<skill-name>/ or scripts/hooks/
- Edit or add test files under tests/scripts/ or tests/hooks/
- Update related documentation files (README.md, AGENTS.md, etc.) if needed

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.