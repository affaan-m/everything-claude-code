---
name: add-command-or-skill-or-agent-or-workflow
description: Workflow command scaffold for add-command-or-skill-or-agent-or-workflow in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-command-or-skill-or-agent-or-workflow

Use this workflow when working on **add-command-or-skill-or-agent-or-workflow** in `everything-claude-code`.

## Goal

Adds a new command, skill, agent, or workflow to the system by creating or updating the corresponding markdown file in the .claude/commands directory.

## Common Files

- `.claude/commands/add-command-or-skill-or-agent-or-workflow.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update .claude/commands/add-command-or-skill-or-agent-or-workflow.md

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.