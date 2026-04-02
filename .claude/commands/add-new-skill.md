---
name: add-new-skill
description: Workflow command scaffold for add-new-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill

Use this workflow when working on **add-new-skill** in `everything-claude-code`.

## Goal

Adds a new skill to the project, including documentation and registration.

## Common Files

- `skills/*/SKILL.md`
- `skills/*/*`
- `AGENTS.md`
- `README.md`
- `manifests/install-modules.json`
- `tests/**/*`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create new SKILL.md in skills/<skill-name>/
- Optionally add implementation files (e.g., scripts, commands, references) in the skill directory
- Update AGENTS.md and/or README.md to reference the new skill
- Update manifests/install-modules.json if the skill is installable
- Add or update relevant test files

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.