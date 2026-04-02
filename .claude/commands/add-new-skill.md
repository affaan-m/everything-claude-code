---
name: add-new-skill
description: Workflow command scaffold for add-new-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill

Use this workflow when working on **add-new-skill** in `everything-claude-code`.

## Goal

Adds a new skill to the system, including documentation and sometimes references/assets.

## Common Files

- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
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

- Create or update skills/<skill-name>/SKILL.md (and/or .agents/skills/<skill-name>/SKILL.md)
- Optionally add related references or assets (e.g., references/, assets/)
- Update AGENTS.md, README.md, README.zh-CN.md, and docs/zh-CN/AGENTS.md to document the new skill
- Update manifests/install-components.json or install-modules.json if the skill is installable

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.