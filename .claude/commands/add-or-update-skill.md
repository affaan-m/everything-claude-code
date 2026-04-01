---
name: add-or-update-skill
description: Workflow command scaffold for add-or-update-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-skill

Use this workflow when working on **add-or-update-skill** in `everything-claude-code`.

## Goal

Adds a new skill or updates an existing skill, typically for a new workflow, agent, or capability.

## Common Files

- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`
- `AGENTS.md`
- `README.md`
- `manifests/install-modules.json`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update a SKILL.md file in skills/<skill-name>/ or .agents/skills/<skill-name>/ or .claude/skills/<skill-name>/
- Optionally update AGENTS.md, README.md, or manifests/install-modules.json to reference the new skill
- Document the skill's usage and integration points

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.