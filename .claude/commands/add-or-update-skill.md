---
name: add-or-update-skill
description: Workflow command scaffold for add-or-update-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-skill

Use this workflow when working on **add-or-update-skill** in `everything-claude-code`.

## Goal

Adds a new skill or updates an existing skill, including documentation and sometimes tests.

## Common Files

- `skills/*/SKILL.md`
- `skills/*/gacha.py`
- `skills/*/gacha.sh`
- `skills/*/references/*.md`
- `skills/*/README.md`
- `tests/scripts/*-*.test.js`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or modify skills/<skill-name>/SKILL.md
- Optionally add or update related scripts, references, or README files under skills/<skill-name>/
- Optionally add or update tests/scripts/<skill-name>-*.test.js
- Update AGENTS.md and/or README.md if the skill is noteworthy or agent-facing

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.