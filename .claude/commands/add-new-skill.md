---
name: add-new-skill
description: Workflow command scaffold for add-new-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill

Use this workflow when working on **add-new-skill** in `everything-claude-code`.

## Goal

Adds a new skill to the system, including documentation and registration.

## Common Files

- `skills/*/SKILL.md`
- `manifests/install-modules.json`
- `AGENTS.md`
- `README.md`
- `WORKING-CONTEXT.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or add a new SKILL.md file under skills/<skill-name>/SKILL.md
- Optionally add supporting files (rules/, agents/, etc.) under the skill directory
- Update manifests/install-modules.json to register the new skill under the appropriate module
- Update AGENTS.md and README.md to reflect the new skill count or description
- Update WORKING-CONTEXT.md or other documentation if needed

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.