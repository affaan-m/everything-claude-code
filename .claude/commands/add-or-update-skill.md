---
name: add-or-update-skill
description: Workflow command scaffold for add-or-update-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-skill

Use this workflow when working on **add-or-update-skill** in `everything-claude-code`.

## Goal

Adds a new skill or updates an existing skill in the codebase, including documentation and registration in manifests.

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

- Create or update skills/<skill-name>/SKILL.md (or .agents/skills/<skill-name>/SKILL.md)
- Update AGENTS.md and/or README.md to document the new skill
- Update manifests/install-modules.json and/or manifests/install-components.json to register the skill
- Optionally add or update related files such as references, assets, or language-specific documentation

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.