---
name: add-new-agent-or-skill
description: Workflow command scaffold for add-new-agent-or-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-agent-or-skill

Use this workflow when working on **add-new-agent-or-skill** in `everything-claude-code`.

## Goal

Adds a new agent or skill to the codebase, including documentation and catalog registration.

## Common Files

- `agents/*.md`
- `skills/*/SKILL.md`
- `skills/*/references/*.md`
- `manifests/install-modules.json`
- `AGENTS.md`
- `README.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create new agent or skill markdown file in agents/ or skills/ directory.
- Optionally add supporting files (e.g., references/, scripts/, agents/ subfiles).
- Update manifests/install-modules.json if the skill/agent must be registered for installation.
- Update AGENTS.md and/or README.md to reflect new counts or list the new agent/skill.
- If needed, add or update test files to validate the new agent/skill.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.