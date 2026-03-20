---
name: add-new-agent
description: Workflow command scaffold for add-new-agent in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-agent

Use this workflow when working on **add-new-agent** in `everything-claude-code`.

## Goal

Registers a new agent, including documentation and catalog updates.

## Common Files

- `agents/*.md`
- `AGENTS.md`
- `README.md`
- `rules/common/agents.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create agents/<agent-name>.md with agent details.
- Register the agent in AGENTS.md (table and/or summary).
- Update README.md with agent count and/or agent tree.
- If agent is related to a language, update rules/common/agents.md or similar.
- If agent is for a new language, add to install manifests as needed.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.