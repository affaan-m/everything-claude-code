---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits.
---

# Everything Claude Code Conventions

> Generated from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) on 2026-03-20

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

- Average message length: ~66 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-language-rules.md)
```

*Commit message example*

```text
chore(deps-dev): bump flatted (#675)
```

*Commit message example*

```text
fix: auto-detect ECC root from plugin cache when CLAUDE_PLUGIN_ROOT is unset (#547) (#691)
```

*Commit message example*

```text
docs: add Antigravity setup and usage guide (#552)
```

*Commit message example*

```text
merge: PR #529 — feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/feature-development.md)
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/database-migration.md)
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
Add Kiro IDE support (.kiro/) (#548)
Revert "Add Kiro IDE support (.kiro/) (#548)"
feat(rules): add C# language support
```

### Feature Development

Standard feature implementation workflow

**Frequency**: ~30 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
feat(skills): add rules-distill skill (rebased #561) (#678)
feat: add block-no-verify hook for Claude Code and Cursor (#649)
Add Kiro IDE support (.kiro/) (#548)
```

### Add Command Or Skill Bundle

Adds a new command or skill bundle to the ECC system, typically by creating or updating files in .claude/commands/, .claude/skills/, .agents/skills/, or related directories.

**Frequency**: ~10 times per month

**Steps**:
1. Create or update a markdown or JSON file in .claude/commands/, .claude/skills/, .agents/skills/, .claude/team/, .claude/rules/, .claude/research/, .claude/enterprise/, .codex/agents/, or similar directories.
2. Commit the new or updated file(s) with a message indicating the addition of an ECC bundle.

**Files typically involved**:
- `.claude/commands/*.md`
- `.claude/skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/team/*.json`
- `.claude/rules/*.md`
- `.claude/research/*.md`
- `.claude/enterprise/*.md`
- `.codex/agents/*.toml`
- `.claude/identity.json`
- `.claude/ecc-tools.json`

**Example commit sequence**:
```
Create or update a markdown or JSON file in .claude/commands/, .claude/skills/, .agents/skills/, .claude/team/, .claude/rules/, .claude/research/, .claude/enterprise/, .codex/agents/, or similar directories.
Commit the new or updated file(s) with a message indicating the addition of an ECC bundle.
```

### Language Support Rules Bundle

Adds support for a new programming language by creating a set of rules and patterns files for that language.

**Frequency**: ~1 times per month

**Steps**:
1. Create a new directory under rules/ for the language.
2. Add multiple markdown files: coding-style.md, hooks.md, patterns.md, security.md, testing.md.
3. Commit all new files together with a message indicating language support.

**Files typically involved**:
- `rules/<language>/*.md`

**Example commit sequence**:
```
Create a new directory under rules/ for the language.
Add multiple markdown files: coding-style.md, hooks.md, patterns.md, security.md, testing.md.
Commit all new files together with a message indicating language support.
```

### Add Or Revert Large Feature Bundle

Adds or reverts a large, multi-file feature or integration (such as IDE support), involving many agent, skill, hook, and documentation files.

**Frequency**: ~1 times per month

**Steps**:
1. Add or remove a large set of files under a new or existing directory (e.g., .kiro/).
2. Include multiple agent definitions, skills, hooks, scripts, and documentation files.
3. Commit all files in a single commit with a descriptive message.

**Files typically involved**:
- `.kiro/**/*`

**Example commit sequence**:
```
Add or remove a large set of files under a new or existing directory (e.g., .kiro/).
Include multiple agent definitions, skills, hooks, scripts, and documentation files.
Commit all files in a single commit with a descriptive message.
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
