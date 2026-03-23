---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits.
---

# Everything Claude Code Conventions

> Generated from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) on 2026-03-23

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
feat(ecc2): implement session create/destroy lifecycle (#764)
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

### Refactoring

Code refactoring and cleanup workflow

**Frequency**: ~2 times per month

**Steps**:
1. Ensure tests pass before refactor
2. Refactor code structure
3. Verify tests still pass

**Files typically involved**:
- `src/**/*`

**Example commit sequence**:
```
feat(ecc2): implement session create/destroy lifecycle (#764)
```

### Add Or Update Skill Documentation

Adds a new skill or updates documentation for an existing skill. Typically involves creating or editing a SKILL.md file under a skill-specific directory.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update skills/<skill-name>/SKILL.md or docs/zh-CN/skills/<skill-name>/SKILL.md or docs/tr/skills/<skill-name>/SKILL.md
2. Document architecture, patterns, and integration details
3. Optionally, update catalog or README if the skill is new

**Files typically involved**:
- `skills/*/SKILL.md`
- `docs/zh-CN/skills/*/SKILL.md`
- `docs/tr/skills/*/SKILL.md`

**Example commit sequence**:
```
Create or update skills/<skill-name>/SKILL.md or docs/zh-CN/skills/<skill-name>/SKILL.md or docs/tr/skills/<skill-name>/SKILL.md
Document architecture, patterns, and integration details
Optionally, update catalog or README if the skill is new
```

### Add Or Update Agent Documentation

Adds or updates agent documentation, typically for a new reviewer, builder, or operator agent. Involves creating or editing agent markdown files in language or locale-specific directories.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update agents/<agent-name>.md or docs/zh-CN/agents/<agent-name>.md or docs/pt-BR/agents/<agent-name>.md or docs/tr/agents/<agent-name>.md
2. Describe agent responsibilities, configuration, and usage

**Files typically involved**:
- `agents/*.md`
- `docs/zh-CN/agents/*.md`
- `docs/pt-BR/agents/*.md`
- `docs/tr/agents/*.md`

**Example commit sequence**:
```
Create or update agents/<agent-name>.md or docs/zh-CN/agents/<agent-name>.md or docs/pt-BR/agents/<agent-name>.md or docs/tr/agents/<agent-name>.md
Describe agent responsibilities, configuration, and usage
```

### Add Or Update Command Documentation

Adds or updates documentation for CLI commands, often in multiple languages. Involves creating or editing command markdown files.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update docs/zh-CN/commands/<command>.md or docs/pt-BR/commands/<command>.md or docs/tr/commands/<command>.md or commands/<command>.md
2. Describe command usage, flags, and examples

**Files typically involved**:
- `docs/zh-CN/commands/*.md`
- `docs/pt-BR/commands/*.md`
- `docs/tr/commands/*.md`
- `commands/*.md`

**Example commit sequence**:
```
Create or update docs/zh-CN/commands/<command>.md or docs/pt-BR/commands/<command>.md or docs/tr/commands/<command>.md or commands/<command>.md
Describe command usage, flags, and examples
```

### Add Or Update Language Support

Adds support for a new programming language (rules, patterns, testing, security) or updates existing language rules.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update rules/<language>/(coding-style.md|hooks.md|patterns.md|security.md|testing.md)
2. Document language-specific coding standards, hooks, and security practices
3. Optionally, add translations under docs/zh-CN/rules/<language>/*.md or docs/pt-BR/rules/<language>/*.md or docs/tr/rules/<language>/*.md

**Files typically involved**:
- `rules/*/*.md`
- `docs/zh-CN/rules/*/*.md`
- `docs/pt-BR/rules/*/*.md`
- `docs/tr/rules/*/*.md`

**Example commit sequence**:
```
Create or update rules/<language>/(coding-style.md|hooks.md|patterns.md|security.md|testing.md)
Document language-specific coding standards, hooks, and security practices
Optionally, add translations under docs/zh-CN/rules/<language>/*.md or docs/pt-BR/rules/<language>/*.md or docs/tr/rules/<language>/*.md
```

### Add Or Update Localization

Adds or updates documentation translations for a new or existing language. Involves creating or updating many files under a locale-specific docs directory.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update docs/<locale>/* (agents, commands, skills, rules, README, etc.)
2. Translate or sync content from the main documentation
3. Update README.md to reference the new language

**Files typically involved**:
- `docs/zh-CN/**/*`
- `docs/pt-BR/**/*`
- `docs/tr/**/*`
- `README.md`

**Example commit sequence**:
```
Create or update docs/<locale>/* (agents, commands, skills, rules, README, etc.)
Translate or sync content from the main documentation
Update README.md to reference the new language
```

### Feature Or Fix With Tests

Implements a feature or bugfix and adds/updates corresponding tests. Typically involves changes to implementation files and test files in parallel.

**Frequency**: ~3 times per month

**Steps**:
1. Edit or add implementation files (e.g., scripts/hooks/*.js, scripts/lib/*.js, ecc2/src/**/*.rs)
2. Edit or add corresponding test files (e.g., tests/hooks/*.test.js, tests/lib/*.test.js, tests/integration/*.test.js)
3. Commit both implementation and tests together

**Files typically involved**:
- `scripts/hooks/*.js`
- `scripts/lib/*.js`
- `ecc2/src/**/*.rs`
- `tests/hooks/*.test.js`
- `tests/lib/*.test.js`
- `tests/integration/*.test.js`

**Example commit sequence**:
```
Edit or add implementation files (e.g., scripts/hooks/*.js, scripts/lib/*.js, ecc2/src/**/*.rs)
Edit or add corresponding test files (e.g., tests/hooks/*.test.js, tests/lib/*.test.js, tests/integration/*.test.js)
Commit both implementation and tests together
```

### Add Or Update Ecc2 Rust Module

Adds or updates a Rust module in the ecc2 directory, often involving multiple files for session, worktree, or TUI functionality, and updating Cargo.toml/Cargo.lock.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or add ecc2/src/<module>/*.rs files
2. Update ecc2/Cargo.toml and ecc2/Cargo.lock as needed
3. Implement new functionality or refactor existing modules

**Files typically involved**:
- `ecc2/src/**/*.rs`
- `ecc2/Cargo.toml`
- `ecc2/Cargo.lock`

**Example commit sequence**:
```
Edit or add ecc2/src/<module>/*.rs files
Update ecc2/Cargo.toml and ecc2/Cargo.lock as needed
Implement new functionality or refactor existing modules
```

### Add Or Update Hook

Adds or modifies a hook (pre/post tool use, config protection, health check, etc.), typically updating hooks.json and adding/modifying scripts/hooks/*.js and their tests.

**Frequency**: ~2 times per month

**Steps**:
1. Edit hooks/hooks.json to register the hook
2. Add or update scripts/hooks/<hook>.js
3. Add or update tests/hooks/<hook>.test.js
4. Optionally, update integration tests

**Files typically involved**:
- `hooks/hooks.json`
- `scripts/hooks/*.js`
- `tests/hooks/*.test.js`
- `tests/integration/hooks.test.js`

**Example commit sequence**:
```
Edit hooks/hooks.json to register the hook
Add or update scripts/hooks/<hook>.js
Add or update tests/hooks/<hook>.test.js
Optionally, update integration tests
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
