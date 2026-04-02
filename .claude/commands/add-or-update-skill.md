---
name: add-or-update-skill
description: Workflow command scaffold for add-or-update-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-skill

Use this workflow when working on **add-or-update-skill** in `everything-claude-code`.

## Goal

Adds a new skill or updates an existing skill, including documentation and sometimes associated scripts.

## Common Files

- `skills/*/SKILL.md`
- `skills/*/scripts/*.sh`
- `AGENTS.md`
- `README.md`
- `docs/zh-CN/AGENTS.md`
- `docs/zh-CN/README.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update skills/<skill-name>/SKILL.md
- Optionally add or update related scripts in skills/<skill-name>/scripts/
- Update AGENTS.md and/or README.md to reflect new skill
- Update manifests/install-modules.json if the skill is installable
- Update docs/zh-CN/AGENTS.md and/or docs/zh-CN/README.md for localization

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.