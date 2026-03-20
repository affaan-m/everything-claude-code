---
name: add-new-skill
description: Workflow command scaffold for add-new-skill in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill

Use this workflow when working on **add-new-skill** in `everything-claude-code`.

## Goal

Adds a new skill to the repository, following the SKILL.md format and conventions.

## Common Files

- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create a new directory under skills/ (e.g., skills/skill-name/).
- Add SKILL.md with required sections (When to Use, How It Works, Examples, etc.).
- Optionally add cross-harness copies in .agents/skills/ and .cursor/skills/ if needed.
- Address PR review feedback to align with CONTRIBUTING.md conventions.
- Sync or remove cross-harness copies as needed after review.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.