---
name: add-new-skill
description: Workflow command scaffold for add-new-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill

Use this workflow when working on **add-new-skill** in `everything-claude-code`.

## Goal

Adds a new skill to the codebase, including documentation and configuration.

## Common Files

- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`
- `manifests/install-modules.json`
- `AGENTS.md`
- `README.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update SKILL.md in skills/<skill-name>/ or .agents/skills/<skill-name>/ or .claude/skills/<skill-name>/
- Optionally update manifests/install-modules.json or related manifest files
- Optionally update AGENTS.md, README.md, or WORKING-CONTEXT.md to document the new skill

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.