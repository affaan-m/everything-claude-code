---
description: "Guidance on achieving hook-like functionality in Cursor IDE"
alwaysApply: false
---

# Hooks Guidance for Cursor

Cursor does not have a native hooks system like Claude Code's PreToolUse/PostToolUse/Stop hooks. However, you can achieve similar automation through:

## Formatting on Save

Configure your editor settings to run formatters on save:
- **TypeScript/JavaScript**: Prettier, ESLint with `--fix`
- **Python**: Black, Ruff
- **Go**: gofmt, goimports

## Linting Integration

Use Cursor's built-in linter support:
- ESLint for TypeScript/JavaScript
- Ruff/Flake8 for Python
- golangci-lint for Go

## Pre-Commit Hooks

Use git pre-commit hooks (via tools like `husky` or `pre-commit`) for:
- Running formatters before commit
- Checking for console.log/print statements
- Running type checks
- Validating no hardcoded secrets

## CI/CD Checks

For checks that ran as Stop hooks in Claude Code:
- Add them to your CI/CD pipeline instead
- GitHub Actions, GitLab CI, etc.
