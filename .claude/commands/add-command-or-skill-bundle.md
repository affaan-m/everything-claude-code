---
name: add-command-or-skill-bundle
description: Workflow command scaffold for add-command-or-skill-bundle in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-command-or-skill-bundle

Use this workflow when working on **add-command-or-skill-bundle** in `everything-claude-code`.

## Goal

Adds a new command or skill bundle to the ECC system, typically by creating or updating files in .claude/commands/, .claude/skills/, .agents/skills/, or related directories.

## Common Files

- `.claude/commands/*.md`
- `.claude/skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/team/*.json`
- `.claude/rules/*.md`
- `.claude/research/*.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update a markdown or JSON file in .claude/commands/, .claude/skills/, .agents/skills/, .claude/team/, .claude/rules/, .claude/research/, .claude/enterprise/, .codex/agents/, or similar directories.
- Commit the new or updated file(s) with a message indicating the addition of an ECC bundle.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.