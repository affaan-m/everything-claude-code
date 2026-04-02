---
name: add-or-update-skill
description: Workflow command scaffold for add-or-update-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-skill

Use this workflow when working on **add-or-update-skill** in `everything-claude-code`.

## Goal

Adds a new skill or updates an existing skill in the system, including documentation and registration in manifests.

## Common Files

- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `manifests/install-modules.json`
- `manifests/install-components.json`
- `AGENTS.md`
- `README.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update SKILL.md in skills/<skill-name>/ or .agents/skills/<skill-name>/
- Optionally add or update related reference files (e.g., assets, rules, schemas) in the skill directory
- Update manifests/install-modules.json and/or manifests/install-components.json to register the new skill
- Update AGENTS.md, README.md, README.zh-CN.md, docs/zh-CN/AGENTS.md, and docs/zh-CN/README.md to document the new skill
- Optionally add or update tests for the skill

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.