---
name: add-new-skill
description: Workflow command scaffold for add-new-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill

Use this workflow when working on **add-new-skill** in `everything-claude-code`.

## Goal

Adds a new skill to the codebase, including documentation and implementation files.

## Common Files

- `skills/*/SKILL.md`
- `skills/*/*.py`
- `skills/*/*.sh`
- `skills/*/*.mjs`
- `skills/*/references/*.md`
- `tests/scripts/*-<skill-name>*.test.js`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create new SKILL.md file under skills/<skill-name>/
- Add implementation files (e.g., .py, .sh, .mjs) under skills/<skill-name>/
- Add reference or supporting markdown files under skills/<skill-name>/references/ if needed
- Add or update corresponding test file under tests/scripts/ or tests/hooks/
- Update AGENTS.md and/or README.md to reference the new skill

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.