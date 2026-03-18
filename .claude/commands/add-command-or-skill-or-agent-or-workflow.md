---
name: add-command-or-skill-or-agent-or-workflow
description: Workflow command scaffold for add-command-or-skill-or-agent-or-workflow in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-command-or-skill-or-agent-or-workflow

Use this workflow when working on **add-command-or-skill-or-agent-or-workflow** in `everything-claude-code`.

## Goal

Adds a new command, skill, agent, or workflow to the system by creating a corresponding markdown file describing the addition.

## Common Files

- `.claude/commands/add-command-or-skill-or-agent-or-workflow.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create a new markdown file in .claude/commands/ with a name matching add-command-or-skill-or-agent-or-workflow.md or similar.
- Document the new command, skill, agent, or workflow in the markdown file.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.