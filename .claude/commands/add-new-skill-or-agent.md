---
name: add-new-skill-or-agent
description: Workflow command scaffold for add-new-skill-or-agent in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill-or-agent

Use this workflow when working on **add-new-skill-or-agent** in `everything-claude-code`.

## Goal

Adds a new skill or agent to the system, including documentation and registration.

## Common Files

- `skills/*/SKILL.md`
- `agents/*.md`
- `AGENTS.md`
- `rules/common/agents.md`
- `.agents/skills/*/SKILL.md`
- `.agents/skills/*/agents/openai.yaml`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update SKILL.md in skills/<skill-name>/ or agents/<agent-name>.md
- Add or update agent/skill documentation in AGENTS.md or rules/common/agents.md
- Optionally, add openai.yaml for agent harness integration
- Register new skill/agent in install manifests or documentation counts

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.