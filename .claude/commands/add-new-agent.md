---
name: add-new-agent
description: Workflow command scaffold for add-new-agent in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-agent

Use this workflow when working on **add-new-agent** in `everything-claude-code`.

## Goal

Adds a new agent to the repository, including registration and documentation updates.

## Common Files

- `agents/*.md`
- `AGENTS.md`
- `README.md`
- `rules/common/agents.md`
- `docs/COMMAND-AGENT-MAP.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create a new agent markdown file under agents/ (e.g., agents/agent-name.md).
- Register the agent in AGENTS.md (add to summary table and/or project structure).
- Update README.md with agent count and/or agent tree if needed.
- Optionally update rules/common/agents.md or docs/COMMAND-AGENT-MAP.md if mapping is needed.
- Address PR review feedback for format and registration.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.