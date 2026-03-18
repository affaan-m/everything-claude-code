---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits.
---

# Everything Claude Code Conventions

> Generated from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) on 2026-03-18

## Overview

This skill teaches Claude the development patterns and conventions used in everything-claude-code.

## Tech Stack

- **Primary Language**: JavaScript
- **Architecture**: hybrid module organization
- **Test Location**: separate

## When to Use This Skill

Activate this skill when:
- Making changes to this repository
- Adding new features following established patterns
- Writing tests that match project conventions
- Creating commits with proper message format

## Commit Conventions

Follow these commit message conventions based on 500 analyzed commits.

### Commit Style: Conventional Commits

### Prefixes Used

- `feat`
- `fix`
- `docs`

### Message Guidelines

- Average message length: ~70 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-new-agent-command.md)
```

*Commit message example*

```text
fix: resolve 8 test failures on main (install pipeline, orchestrator, repair) (#564)
```

*Commit message example*

```text
merge: PR #529 — feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
```

*Commit message example*

```text
docs(skills): align documentation-lookup with CONTRIBUTING template; add cross-harness (Codex/Cursor) skill copies
```

*Commit message example*

```text
chore(config): governance and config foundation (#292)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-new-skill-command.md)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/feature-development.md)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/enterprise/controls.md)
```

## Architecture

### Project Structure: Single Package

This project uses **hybrid** module organization.

### Configuration Files

- `.github/workflows/ci.yml`
- `.github/workflows/maintenance.yml`
- `.github/workflows/monthly-metrics.yml`
- `.github/workflows/release.yml`
- `.github/workflows/reusable-release.yml`
- `.github/workflows/reusable-test.yml`
- `.github/workflows/reusable-validate.yml`
- `.opencode/package.json`
- `.opencode/tsconfig.json`
- `.prettierrc`
- `eslint.config.js`
- `package.json`

### Guidelines

- This project uses a hybrid organization
- Follow existing patterns when adding new code

## Code Style

### Language: JavaScript

### Naming Conventions

| Element | Convention |
|---------|------------|
| Files | camelCase |
| Functions | camelCase |
| Classes | PascalCase |
| Constants | SCREAMING_SNAKE_CASE |

### Import Style: Mixed Style

### Export Style: Named Exports


*Preferred export style*

```typescript
// Use named exports
export function calculateTotal() { ... }
export const TAX_RATE = 0.1
export interface Order { ... }
```

## Testing

### Test Framework

No specific test framework detected — use the repository's existing test patterns.

### File Pattern: `*.test.js`

### Test Types

- **Unit tests**: Test individual functions and components in isolation
- **Integration tests**: Test interactions between multiple components/services

### Coverage

This project has coverage reporting configured. Aim for 80%+ coverage.


## Error Handling

### Error Handling Style: Try-Catch Blocks


*Standard error handling pattern*

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('User-friendly message')
}
```

## Common Workflows

These workflows were detected from analyzing commit patterns.

### Feature Development

Standard feature implementation workflow

**Frequency**: ~30 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Example commit sequence**:
```
feat: add everything-claude-code ECC bundle (.claude/team/everything-claude-code-team-config.json)
feat: add everything-claude-code ECC bundle (.claude/enterprise/controls.md)
feat: add everything-claude-code ECC bundle (.claude/commands/feature-development.md)
```

### Add New Agent Command

Adds a new agent command to the system, documenting how to add new agents.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update '.claude/commands/add-new-agent-command.md' with documentation or instructions.

**Files typically involved**:
- `.claude/commands/add-new-agent-command.md`

**Example commit sequence**:
```
Create or update '.claude/commands/add-new-agent-command.md' with documentation or instructions.
```

### Add New Skill Command

Adds a new skill command to the system, documenting how to add new skills.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update '.claude/commands/add-new-skill-command.md' with documentation or instructions.

**Files typically involved**:
- `.claude/commands/add-new-skill-command.md`

**Example commit sequence**:
```
Create or update '.claude/commands/add-new-skill-command.md' with documentation or instructions.
```

### Add Skill Documentation

Adds or updates documentation for a specific skill in both agent and Claude directories.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update '.agents/skills/everything-claude-code/SKILL.md'.
2. Create or update '.claude/skills/everything-claude-code/SKILL.md'.

**Files typically involved**:
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/skills/everything-claude-code/SKILL.md`

**Example commit sequence**:
```
Create or update '.agents/skills/everything-claude-code/SKILL.md'.
Create or update '.claude/skills/everything-claude-code/SKILL.md'.
```

### Update Team Config

Updates the team configuration for everything-claude-code.

**Frequency**: ~4 times per month

**Steps**:
1. Edit '.claude/team/everything-claude-code-team-config.json' to reflect changes.

**Files typically involved**:
- `.claude/team/everything-claude-code-team-config.json`

**Example commit sequence**:
```
Edit '.claude/team/everything-claude-code-team-config.json' to reflect changes.
```

### Update Identity

Updates the identity configuration for everything-claude-code.

**Frequency**: ~4 times per month

**Steps**:
1. Edit '.claude/identity.json' to reflect new identity information.

**Files typically involved**:
- `.claude/identity.json`

**Example commit sequence**:
```
Edit '.claude/identity.json' to reflect new identity information.
```

### Update Guardrails

Updates the guardrails or rules for the system.

**Frequency**: ~4 times per month

**Steps**:
1. Edit '.claude/rules/everything-claude-code-guardrails.md' to update rules.

**Files typically involved**:
- `.claude/rules/everything-claude-code-guardrails.md`

**Example commit sequence**:
```
Edit '.claude/rules/everything-claude-code-guardrails.md' to update rules.
```

### Update Ecc Tools

Updates the ECC tools configuration.

**Frequency**: ~4 times per month

**Steps**:
1. Edit '.claude/ecc-tools.json' to add or update tool definitions.

**Files typically involved**:
- `.claude/ecc-tools.json`

**Example commit sequence**:
```
Edit '.claude/ecc-tools.json' to add or update tool definitions.
```


## Best Practices

Based on analysis of the codebase, follow these practices:

### Do

- Use conventional commit format (feat:, fix:, etc.)
- Follow *.test.js naming pattern
- Use camelCase for file names
- Prefer named exports

### Don't

- Don't write vague commit messages
- Don't skip tests for new features
- Don't deviate from established patterns without discussion

---

*This skill was auto-generated by [ECC Tools](https://ecc.tools). Review and customize as needed for your team.*
