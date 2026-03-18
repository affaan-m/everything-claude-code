---
name: add-new-command
description: Workflow command scaffold for add-new-command in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-command

Use this workflow when working on **add-new-command** in `everything-claude-code`.

## Goal

Adds a new user-facing command to the system, including documentation.

## Common Files

- `commands/*.md`
- `.opencode/commands/*.md`
- `README.md`
- `AGENTS.md`
- `tests/scripts/*.test.js`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create commands/<command-name>.md with usage and documentation
- If mirrored, also add .opencode/commands/<command-name>.md
- Update README.md or AGENTS.md with command count or description
- Add or update tests for the command if applicable

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.