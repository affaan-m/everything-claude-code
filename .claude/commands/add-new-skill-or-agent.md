---
name: add-new-skill-or-agent
description: Workflow command scaffold for add-new-skill-or-agent in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill-or-agent

Use this workflow when working on **add-new-skill-or-agent** in `everything-claude-code`.

## Goal

Adds a new skill or agent to the codebase, including documentation and configuration.

## Common Files

- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`
- `agents/*.md`
- `manifests/install-modules.json`
- `AGENTS.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update SKILL.md in skills/ or .agents/skills/ or .claude/skills/
- Add or update agent definition in agents/ or .agents/skills/
- Update manifests/install-modules.json or similar manifest/config files
- Update AGENTS.md and/or README.md to document the new skill/agent

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.