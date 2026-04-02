---
name: add-new-agent-or-skill
description: Workflow command scaffold for add-new-agent-or-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-agent-or-skill

Use this workflow when working on **add-new-agent-or-skill** in `everything-claude-code`.

## Goal

Adds a new agent or skill to the system, including definition, documentation, and registration in manifests/catalogs.

## Common Files

- `agents/*.md`
- `skills/*/SKILL.md`
- `manifests/install-modules.json`
- `AGENTS.md`
- `README.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create agent or skill definition file (e.g., agents/agent-name.md or skills/skill-name/SKILL.md)
- Update manifest/catalog files (e.g., manifests/install-modules.json, AGENTS.md, README.md)
- If applicable, add supporting files (e.g., commands, orchestrators, tests)
- Update documentation (README, AGENTS.md, etc.)

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.