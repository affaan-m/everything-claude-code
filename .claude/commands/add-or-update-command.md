---
name: add-or-update-command
description: Workflow command scaffold for add-or-update-command in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-command

Use this workflow when working on **add-or-update-command** in `everything-claude-code`.

## Goal

Adds or updates a command for the system, often with documentation and sometimes with implementation scripts.

## Common Files

- `commands/*.md`
- `.opencode/commands/*.md`
- `.claude/commands/*.md`
- `scripts/*.js`
- `tests/scripts/*.test.js`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or modify commands/<command-name>.md
- Optionally create or update .opencode/commands/<command-name>.md or .claude/commands/<command-name>.md for internal/agentic commands
- Optionally add or update scripts/<command-name>.js
- Optionally add or update tests/scripts/<command-name>.test.js

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.