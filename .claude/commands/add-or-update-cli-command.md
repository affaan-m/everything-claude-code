---
name: add-or-update-cli-command
description: Workflow command scaffold for add-or-update-cli-command in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-cli-command

Use this workflow when working on **add-or-update-cli-command** in `everything-claude-code`.

## Goal

Adds or updates a CLI command, including documentation and registration.

## Common Files

- `commands/*.md`
- `README.md`
- `AGENTS.md`
- `docs/zh-CN/README.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or modify a Markdown file in commands/ describing the command.
- If new, register the command in README.md, AGENTS.md, and/or relevant index files.
- Update or add tests if the command has associated logic.
- Optionally update docs/ mirrors (e.g., docs/zh-CN/README.md).

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.