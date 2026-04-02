---
name: harden-or-update-skill
description: Workflow command scaffold for harden-or-update-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /harden-or-update-skill

Use this workflow when working on **harden-or-update-skill** in `everything-claude-code`.

## Goal

Improves, clarifies, or fixes an existing skill, often for bugfixes, documentation, or robustness.

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

- Edit SKILL.md in skills/<skill-name>/
- Optionally update implementation files in the skill directory
- Update AGENTS.md and/or README.md if needed
- Update manifests/install-modules.json if installability changes
- Update or add relevant tests

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.