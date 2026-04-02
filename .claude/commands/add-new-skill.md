---
name: add-new-skill
description: Workflow command scaffold for add-new-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill

Use this workflow when working on **add-new-skill** in `everything-claude-code`.

## Goal

Adds a new AI agent skill to the codebase, including documentation and registration.

## Common Files

- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`
- `docs/zh-CN/AGENTS.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create a new SKILL.md file in skills/<skill-name>/ or .agents/skills/<skill-name>/
- Optionally add supporting scripts or references under the skill directory
- Update AGENTS.md and/or README.md to document the new skill
- Update docs/zh-CN/AGENTS.md and docs/zh-CN/README.md for Chinese documentation
- Update manifests/install-modules.json or install-components.json to register the skill

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.