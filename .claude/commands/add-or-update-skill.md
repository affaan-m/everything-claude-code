---
name: add-or-update-skill
description: Workflow command scaffold for add-or-update-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-skill

Use this workflow when working on **add-or-update-skill** in `everything-claude-code`.

## Goal

Adds a new skill or updates an existing skill in the agents or skills directory, including documentation and registration in manifests.

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
- Optionally add or update reference files (e.g., schemas, assets) in the skill directory
- Update manifests/install-modules.json and/or manifests/install-components.json to register the skill
- Update AGENTS.md, README.md, and docs/zh-CN/AGENTS.md for documentation
- If relevant, update WORKING-CONTEXT.md

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.