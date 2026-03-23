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
feat(ecc2): implement live output streaming per agent (#774)
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

### Add Or Update Language Localization

Adds or updates documentation and guides for a new or existing language localization (e.g., Chinese, Turkish, Brazilian Portuguese).

**Frequency**: ~2 times per month

**Steps**:
1. Add or update multiple files under docs/<lang>/ (agents, commands, skills, rules, guides, etc.)
2. Update README.md to reflect new language and increment language count
3. Optionally update or add language-specific images or references

**Files typically involved**:
- `README.md`
- `docs/zh-CN/**`
- `docs/tr/**`
- `docs/pt-BR/**`

**Example commit sequence**:
```
Add or update multiple files under docs/<lang>/ (agents, commands, skills, rules, guides, etc.)
Update README.md to reflect new language and increment language count
Optionally update or add language-specific images or references
```

### Add Or Update Skill Guide

Adds a new skill or updates an existing skill's documentation, often with detailed guides, patterns, or architecture diagrams.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update skills/<skill-name>/SKILL.md
2. Optionally add images or diagrams to assets/images/
3. Optionally update AGENTS.md or README.md to reflect new skill

**Files typically involved**:
- `skills/*/SKILL.md`
- `assets/images/**`
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Create or update skills/<skill-name>/SKILL.md
Optionally add images or diagrams to assets/images/
Optionally update AGENTS.md or README.md to reflect new skill
```

### Feature Or Infra Development With Tests And Docs

Implements a new feature or infrastructure improvement, accompanied by tests and documentation updates.

**Frequency**: ~2 times per month

**Steps**:
1. Implement feature in source files (e.g., src/, scripts/)
2. Add or update corresponding test files (e.g., tests/)
3. Update or create relevant documentation (e.g., README.md, AGENTS.md, docs/)

**Files typically involved**:
- `src/**`
- `scripts/**`
- `tests/**`
- `README.md`
- `AGENTS.md`
- `docs/**`

**Example commit sequence**:
```
Implement feature in source files (e.g., src/, scripts/)
Add or update corresponding test files (e.g., tests/)
Update or create relevant documentation (e.g., README.md, AGENTS.md, docs/)
```

### Add Or Update Hook Or Script

Adds or modifies a hook or automation script, often with configuration and test updates.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update hook script in scripts/hooks/ or hooks/
2. Update hooks/hooks.json to register or modify the hook
3. Add or update corresponding test files in tests/hooks/

**Files typically involved**:
- `scripts/hooks/*.js`
- `hooks/hooks.json`
- `tests/hooks/*.test.js`

**Example commit sequence**:
```
Add or update hook script in scripts/hooks/ or hooks/
Update hooks/hooks.json to register or modify the hook
Add or update corresponding test files in tests/hooks/
```

### Config Or Metadata Sync And Merge

Synchronizes, merges, or updates configuration or metadata files, often with marker-based merging to preserve user content.

**Frequency**: ~2 times per month

**Steps**:
1. Update or create config/metadata files (e.g., AGENTS.md, config.toml, install-components.json)
2. Implement or update a sync/merge script (e.g., scripts/sync-*.sh, scripts/codex/merge-*.js)
3. Update README.md or related docs to reflect changes

**Files typically involved**:
- `AGENTS.md`
- `README.md`
- `scripts/sync-*.sh`
- `scripts/codex/merge-*.js`
- `manifests/install-components.json`
- `scripts/lib/install-manifests.js`

**Example commit sequence**:
```
Update or create config/metadata files (e.g., AGENTS.md, config.toml, install-components.json)
Implement or update a sync/merge script (e.g., scripts/sync-*.sh, scripts/codex/merge-*.js)
Update README.md or related docs to reflect changes
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
