---
name: add-new-agent-command
description: Workflow command scaffold for add-new-agent-command in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-agent-command

Use this workflow when working on **add-new-agent-command** in `everything-claude-code`.

## Goal

Adds a new agent command to the system, documenting the process for adding agents.

## Common Files

- `.claude/commands/add-new-agent-command.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update .claude/commands/add-new-agent-command.md with agent command documentation.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.