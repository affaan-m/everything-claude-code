---
name: batch-review-fixes-across-multiple-skills
description: Workflow command scaffold for batch-review-fixes-across-multiple-skills in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /batch-review-fixes-across-multiple-skills

Use this workflow when working on **batch-review-fixes-across-multiple-skills** in `everything-claude-code`.

## Goal

Applies review feedback or bugfixes to multiple existing skills in a single commit, often after code review or automated feedback.

## Common Files

- `skills/*/SKILL.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Collect review feedback for multiple skills.
- Edit each affected SKILL.md file to address the feedback.
- Commit all modified SKILL.md files together, with a detailed message summarizing the changes.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.