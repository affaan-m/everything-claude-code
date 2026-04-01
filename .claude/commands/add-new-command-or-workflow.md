---
name: add-new-command-or-workflow
description: Workflow command scaffold for add-new-command-or-workflow in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-command-or-workflow

Use this workflow when working on **add-new-command-or-workflow** in `everything-claude-code`.

## Goal

Introduces a new command or workflow file, often with supporting documentation and catalog updates.

## Common Files

- `commands/*.md`
- `.opencode/commands/*.md`
- `scripts/*.sh`
- `README.md`
- `AGENTS.md`
- `skills/*/SKILL.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create new command markdown file in commands/ or .opencode/commands/.
- If the command is part of a workflow, create or update related orchestrator scripts or shell files.
- Update AGENTS.md and/or README.md to reflect new command counts or document the new workflow.
- If the command is part of a skill, update the corresponding SKILL.md.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.