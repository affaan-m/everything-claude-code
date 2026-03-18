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
- `test`
- `docs`

### Message Guidelines

- Average message length: ~67 characters
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

Adds documentation or command specification for creating a new agent in the system.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update '.claude/commands/add-new-agent-command.md' or '.claude/commands/add-new-agent.md'
2. Commit the new or updated command file

**Files typically involved**:
- `.claude/commands/add-new-agent-command.md`
- `.claude/commands/add-new-agent.md`

**Example commit sequence**:
```
Create or update '.claude/commands/add-new-agent-command.md' or '.claude/commands/add-new-agent.md'
Commit the new or updated command file
```

### Add New Skill Command

Adds documentation or command specification for creating a new skill in the system.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update '.claude/commands/add-new-skill-command.md' or '.claude/commands/add-new-skill.md'
2. Commit the new or updated command file

**Files typically involved**:
- `.claude/commands/add-new-skill-command.md`
- `.claude/commands/add-new-skill.md`

**Example commit sequence**:
```
Create or update '.claude/commands/add-new-skill-command.md' or '.claude/commands/add-new-skill.md'
Commit the new or updated command file
```

### Feature Development Command

Documents or specifies the workflow for feature development.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update '.claude/commands/feature-development.md'
2. Commit the new or updated file

**Files typically involved**:
- `.claude/commands/feature-development.md`

**Example commit sequence**:
```
Create or update '.claude/commands/feature-development.md'
Commit the new or updated file
```

### Update Team Config

Updates the team configuration for everything-claude-code.

**Frequency**: ~3 times per month

**Steps**:
1. Edit '.claude/team/everything-claude-code-team-config.json'
2. Commit the updated config file

**Files typically involved**:
- `.claude/team/everything-claude-code-team-config.json`

**Example commit sequence**:
```
Edit '.claude/team/everything-claude-code-team-config.json'
Commit the updated config file
```

### Update Research Playbook

Updates the research playbook documentation for the project.

**Frequency**: ~3 times per month

**Steps**:
1. Edit '.claude/research/everything-claude-code-research-playbook.md'
2. Commit the updated playbook

**Files typically involved**:
- `.claude/research/everything-claude-code-research-playbook.md`

**Example commit sequence**:
```
Edit '.claude/research/everything-claude-code-research-playbook.md'
Commit the updated playbook
```

### Update Guardrails

Updates the rules or guardrails documentation for the project.

**Frequency**: ~3 times per month

**Steps**:
1. Edit '.claude/rules/everything-claude-code-guardrails.md'
2. Commit the updated guardrails file

**Files typically involved**:
- `.claude/rules/everything-claude-code-guardrails.md`

**Example commit sequence**:
```
Edit '.claude/rules/everything-claude-code-guardrails.md'
Commit the updated guardrails file
```

### Update Ecc Tools

Updates the ECC tools configuration for the project.

**Frequency**: ~3 times per month

**Steps**:
1. Edit '.claude/ecc-tools.json'
2. Commit the updated tools file

**Files typically involved**:
- `.claude/ecc-tools.json`

**Example commit sequence**:
```
Edit '.claude/ecc-tools.json'
Commit the updated tools file
```

### Add Or Update Skill Md

Adds or updates skill documentation markdown files for everything-claude-code.

**Frequency**: ~3 times per month

**Steps**:
1. Create or edit '.agents/skills/everything-claude-code/SKILL.md' or '.claude/skills/everything-claude-code/SKILL.md'
2. Commit the new or updated skill documentation

**Files typically involved**:
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/skills/everything-claude-code/SKILL.md`

**Example commit sequence**:
```
Create or edit '.agents/skills/everything-claude-code/SKILL.md' or '.claude/skills/everything-claude-code/SKILL.md'
Commit the new or updated skill documentation
```

### Update Identity Json

Updates the identity configuration for everything-claude-code.

**Frequency**: ~3 times per month

**Steps**:
1. Edit '.claude/identity.json'
2. Commit the updated identity file

**Files typically involved**:
- `.claude/identity.json`

**Example commit sequence**:
```
Edit '.claude/identity.json'
Commit the updated identity file
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
