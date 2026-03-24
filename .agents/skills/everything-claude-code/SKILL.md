---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits.
---

# Everything Claude Code Conventions

> Generated from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) on 2026-03-24

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

- `fix`
- `feat`
- `docs`
- `test`

### Message Guidelines

- Average message length: ~62 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat(ecc2): add tool risk scoring and actions
```

*Commit message example*

```text
perf(hooks): move post-edit-format and post-edit-typecheck to strict-only (#757)
```

*Commit message example*

```text
fix: safe Codex config sync — merge AGENTS.md + add-only MCP servers (#723)
```

*Commit message example*

```text
docs(zh-CN): translate code block(plain text) (#753)
```

*Commit message example*

```text
security: remove supply chain risks, external promotions, and unauthorized credits
```

*Commit message example*

```text
feat: scaffold ECC 2.0 Rust TUI — agentic IDE control plane
```

*Commit message example*

```text
feat(skills): add santa-method - multi-agent adversarial verification (#760)
```

*Commit message example*

```text
feat: pending instinct TTL pruning and /prune command (#725)
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

### Import Style: Relative Imports

### Export Style: Mixed Style


*Preferred import style*

```typescript
// Use relative imports
import { Button } from '../components/Button'
import { useAuth } from './hooks/useAuth'
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

### Database Migration

Database schema changes with migration files

**Frequency**: ~2 times per month

**Steps**:
1. Create migration file
2. Update schema definitions
3. Generate/update types

**Files typically involved**:
- `migrations/*`

**Example commit sequence**:
```
feat(rules): add C# language support (#704)
fix: sanitize SessionStart session summaries (#710)
feat: add MCP health-check hook (#711)
```

### Feature Development

Standard feature implementation workflow

**Frequency**: ~16 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `manifests/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
feat: agent description compression with lazy loading (#696)
feat: add nuxt 4 patterns skill (#702)
feat(rules): add C# language support (#704)
```

### Add Or Update Skill Documentation

Adds a new skill or updates documentation for an existing skill, typically in the form of a SKILL.md file under skills/ or skills/*/SKILL.md.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update skills/<skill-name>/SKILL.md
2. Optionally update AGENTS.md or README.md to reflect new skill
3. Optionally add architecture diagrams or implementation notes

**Files typically involved**:
- `skills/*/SKILL.md`
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Create or update skills/<skill-name>/SKILL.md
Optionally update AGENTS.md or README.md to reflect new skill
Optionally add architecture diagrams or implementation notes
```

### Add Or Update Localized Documentation

Adds or updates documentation in a new or existing language, typically under docs/<lang>/, including agents, commands, skills, and rules.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update docs/<lang>/* (AGENTS.md, README.md, commands/, agents/, skills/, rules/ etc.)
2. Update README.md to add language link or increment language count

**Files typically involved**:
- `docs/*/*`
- `README.md`

**Example commit sequence**:
```
Create or update docs/<lang>/* (AGENTS.md, README.md, commands/, agents/, skills/, rules/ etc.)
Update README.md to add language link or increment language count
```

### Add Or Update Hook Script

Adds a new hook or updates an existing hook for agent workflows, involving hooks.json and a script in scripts/hooks/.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update scripts/hooks/<hook-name>.js
2. Update hooks/hooks.json to register the hook
3. Optionally add or update tests in tests/hooks/

**Files typically involved**:
- `hooks/hooks.json`
- `scripts/hooks/*.js`
- `tests/hooks/*.test.js`

**Example commit sequence**:
```
Create or update scripts/hooks/<hook-name>.js
Update hooks/hooks.json to register the hook
Optionally add or update tests in tests/hooks/
```

### Feature Development With Tests And Docs

Implements a new feature or enhancement, updates implementation, adds or updates tests, and documents the change.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or create implementation files (src/ or scripts/)
2. Edit or create corresponding test files (tests/)
3. Edit or create documentation files (docs/ or README.md)

**Files typically involved**:
- `src/**/*`
- `scripts/**/*`
- `tests/**/*`
- `docs/**/*`
- `README.md`

**Example commit sequence**:
```
Edit or create implementation files (src/ or scripts/)
Edit or create corresponding test files (tests/)
Edit or create documentation files (docs/ or README.md)
```

### Add Or Update Language Support

Adds support for a new programming language or updates language-specific rules and patterns.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update rules/<language>/* (coding-style.md, hooks.md, patterns.md, security.md, testing.md)
2. Optionally add or update install-manifests or mapping scripts
3. Optionally update tests for language resolution

**Files typically involved**:
- `rules/*/*`
- `scripts/lib/install-manifests.js`
- `manifests/install-components.json`
- `tests/lib/install-manifests.test.js`

**Example commit sequence**:
```
Create or update rules/<language>/* (coding-style.md, hooks.md, patterns.md, security.md, testing.md)
Optionally add or update install-manifests or mapping scripts
Optionally update tests for language resolution
```

### Documentation Catalog Update

Updates project-wide documentation catalogs, such as agent/skill counts, language counts, or links in AGENTS.md and README.md.

**Frequency**: ~2 times per month

**Steps**:
1. Edit AGENTS.md or README.md to update counts or add new entries
2. Optionally update language links or catalog tables

**Files typically involved**:
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Edit AGENTS.md or README.md to update counts or add new entries
Optionally update language links or catalog tables
```


## Best Practices

Based on analysis of the codebase, follow these practices:

### Do

- Use conventional commit format (feat:, fix:, etc.)
- Follow *.test.js naming pattern
- Use camelCase for file names
- Prefer mixed exports

### Don't

- Don't write vague commit messages
- Don't skip tests for new features
- Don't deviate from established patterns without discussion

---

*This skill was auto-generated by [ECC Tools](https://ecc.tools). Review and customize as needed for your team.*
