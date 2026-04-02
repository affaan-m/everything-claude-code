---
name: add-or-update-skill
description: Workflow command scaffold for add-or-update-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-skill

Use this workflow when working on **add-or-update-skill** in `everything-claude-code`.

## Goal

Adds a new skill or updates an existing skill, often with supporting documentation and sometimes related agent or command files.

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

- Create or update skills/<skill-name>/SKILL.md (or .agents/skills/<skill-name>/SKILL.md)
- Optionally update AGENTS.md, README.md, WORKING-CONTEXT.md, manifests/install-modules.json, or related docs
- If the skill is agentic, may also add agents/<agent-name>.md
- If the skill is a workflow, may also add or update commands/<command>.md

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.