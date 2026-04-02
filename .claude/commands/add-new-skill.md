---
name: add-new-skill
description: Workflow command scaffold for add-new-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill

Use this workflow when working on **add-new-skill** in `everything-claude-code`.

## Goal

Adds a new skill to the system, including documentation and registration in summary/index files.

## Common Files

- `skills/*/SKILL.md`
- `skills/*/references/*.md`
- `skills/*/assets/*`
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create a new SKILL.md file under skills/{skill-name}/
- Optionally add reference files or assets under skills/{skill-name}/references/ or assets/
- Update AGENTS.md and README.md to document the new skill
- Update docs/zh-CN/AGENTS.md and docs/zh-CN/README.md for Chinese documentation
- Optionally update manifests/install-components.json or install-modules.json if the skill is installable

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.