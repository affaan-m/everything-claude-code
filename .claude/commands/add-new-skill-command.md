---
name: add-new-skill-command
description: Workflow command scaffold for add-new-skill-command in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill-command

Use this workflow when working on **add-new-skill-command** in `everything-claude-code`.

## Goal

Adds documentation or command specification for creating a new skill in the system.

## Common Files

- `.claude/commands/add-new-skill-command.md`
- `.claude/commands/add-new-skill.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update '.claude/commands/add-new-skill-command.md' or '.claude/commands/add-new-skill.md'
- Commit the new or updated command file

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.