---
name: add-or-update-skill
description: Workflow command scaffold for add-or-update-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-skill

Use this workflow when working on **add-or-update-skill** in `everything-claude-code`.

## Goal

Adds a new skill or updates an existing skill, typically by creating or modifying a SKILL.md file under a skills/ or .agents/skills/ directory.

## Common Files

- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `AGENTS.md`
- `README.md`
- `WORKING-CONTEXT.md`
- `manifests/install-modules.json`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update SKILL.md in the appropriate skills/ or .agents/skills/ subdirectory
- Optionally update related documentation (AGENTS.md, README.md, WORKING-CONTEXT.md, etc.)
- Optionally update manifests/install-modules.json if the skill needs to be registered

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.