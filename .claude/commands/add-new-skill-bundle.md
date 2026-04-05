---
name: add-new-skill-bundle
description: Workflow command scaffold for add-new-skill-bundle in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-skill-bundle

Use this workflow when working on **add-new-skill-bundle** in `everything-claude-code`.

## Goal

Adds a new set of skills, each as a separate SKILL.md file under the skills/ directory.

## Common Files

- `skills/*/SKILL.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create a new directory under skills/ for each new skill.
- Add a SKILL.md file in each new skill directory with structured content.
- Commit all new SKILL.md files together as a bundle.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.