---
name: add-new-agent
description: Workflow command scaffold for add-new-agent in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-agent

Use this workflow when working on **add-new-agent** in `everything-claude-code`.

## Goal

Adds a new agent to the system, including registration and documentation updates.

## Common Files

- `agents/*.md`
- `AGENTS.md`
- `README.md`
- `docs/COMMAND-AGENT-MAP.md`
- `rules/common/agents.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create agents/<agent-name>.md with agent definition and instructions.
- Update AGENTS.md to register the new agent and increment agent count.
- If needed, update README.md and docs/COMMAND-AGENT-MAP.md to reflect new agent.
- If the agent is language-specific, update rules/common/agents.md or similar files.
- Address PR review feedback and sync documentation counts.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.