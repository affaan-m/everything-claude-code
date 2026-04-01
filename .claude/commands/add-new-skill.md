---
name: add-new-skill
description: Workflow command scaffold for add-new-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill

Use this workflow when working on **add-new-skill** in `everything-claude-code`.

## Goal

Adds a new skill to the system, including documentation and registration in catalogs.

## Common Files

- `skills/*/SKILL.md`
- `manifests/install-modules.json`
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`
- `docs/zh-CN/AGENTS.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update a SKILL.md file under skills/<skill-name>/SKILL.md
- Optionally add supporting files (agents, rules, etc.) under the skill directory
- Update manifests/install-modules.json to register the skill in the installable modules
- Update AGENTS.md and/or README.md to reflect the new skill count or catalog
- If necessary, update docs/zh-CN/AGENTS.md and README.zh-CN.md for localization

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.