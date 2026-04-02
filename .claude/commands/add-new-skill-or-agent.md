---
name: add-new-skill-or-agent
description: Workflow command scaffold for add-new-skill-or-agent in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill-or-agent

Use this workflow when working on **add-new-skill-or-agent** in `everything-claude-code`.

## Goal

Adds a new skill or agent to the codebase, including documentation and registration in manifests and index files.

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

- Create or update SKILL.md in skills/<skill-name>/ or .agents/skills/<skill-name>/
- Add or update documentation files (README.md, AGENTS.md, docs/zh-CN/AGENTS.md, etc.)
- Update manifests/install-components.json or manifests/install-modules.json to register the new skill/agent
- Optionally add reference files or assets (e.g., references/voice-profile-schema.md, assets/)
- If agent, add agents/<agent-name>.md

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.