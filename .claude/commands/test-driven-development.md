---
name: test-driven-development
description: Workflow command scaffold for test-driven-development in everything-claude-code.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /test-driven-development

Use this workflow when working on **test-driven-development** in `everything-claude-code`.

## Goal

Test-first development workflow (TDD)

## Common Files

- `**/*.test.*`
- `**/*.spec.*`
- `src/**/*`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Write failing test
- Implement code to pass test
- Refactor if needed

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.