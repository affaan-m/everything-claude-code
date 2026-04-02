---
name: add-or-update-skill
description: Workflow command scaffold for add-or-update-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-skill

Use this workflow when working on **add-or-update-skill** in `everything-claude-code`.

## Goal

Adds or updates a skill module, including documentation and references, and registers it in manifests and documentation.

## Common Files

- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `skills/*/references/*.md`
- `skills/*/assets/*`
- `manifests/install-modules.json`
- `manifests/install-components.json`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update SKILL.md in skills/<skill-name>/ or .agents/skills/<skill-name>/
- Optionally add or update references or assets under skills/<skill-name>/references/ or assets/
- Update manifests/install-modules.json and/or manifests/install-components.json
- Update AGENTS.md, README.md, README.zh-CN.md, and docs/zh-CN/* as needed
- Update WORKING-CONTEXT.md if context changes

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.