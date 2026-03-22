---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits.
---

# Everything Claude Code Conventions

> Generated from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) on 2026-03-22

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
feat: scaffold ECC 2.0 Rust TUI — agentic IDE control plane
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
feat(skills): add santa-method - multi-agent adversarial verification (#760)
```

*Commit message example*

```text
feat: pending instinct TTL pruning and /prune command (#725)
```

*Commit message example*

```text
feat: add click-path-audit skill — finds state interaction bugs (#729)
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
fix(tests): resolve Windows CI test failures (#701)
fix: stabilize windows project metadata assertions
feat: agent description compression with lazy loading (#696)
```

### Add Or Update Skill Documentation

Adds a new skill or updates documentation for an existing skill, typically by creating or modifying a SKILL.md file under skills/ or docs/[lang]/skills/.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update SKILL.md in the appropriate skills/ or docs/[lang]/skills/ directory
2. Optionally update AGENTS.md or README.md to reflect new skill count or catalog
3. Optionally add or update related diagrams or documentation files

**Files typically involved**:
- `skills/*/SKILL.md`
- `docs/*/skills/*/SKILL.md`
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Create or update SKILL.md in the appropriate skills/ or docs/[lang]/skills/ directory
Optionally update AGENTS.md or README.md to reflect new skill count or catalog
Optionally add or update related diagrams or documentation files
```

### Add Or Update Agent Documentation

Adds or updates documentation for an agent, typically by creating or modifying agent markdown files under agents/ or docs/[lang]/agents/.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update agent documentation markdown file in agents/ or docs/[lang]/agents/
2. Optionally update AGENTS.md or README.md to reflect new agent count or catalog

**Files typically involved**:
- `agents/*.md`
- `docs/*/agents/*.md`
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Create or update agent documentation markdown file in agents/ or docs/[lang]/agents/
Optionally update AGENTS.md or README.md to reflect new agent count or catalog
```

### Add Or Update Command Documentation

Adds or updates documentation for a CLI command, typically by creating or modifying command markdown files under docs/[lang]/commands/.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update command documentation markdown file in docs/[lang]/commands/
2. Optionally update README.md or AGENTS.md with new command references

**Files typically involved**:
- `docs/*/commands/*.md`
- `README.md`
- `AGENTS.md`

**Example commit sequence**:
```
Create or update command documentation markdown file in docs/[lang]/commands/
Optionally update README.md or AGENTS.md with new command references
```

### Add Or Update Multilingual Documentation

Adds or updates documentation in a new or existing language, typically by creating or updating docs/[lang]/ directories with translated files.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update docs/[lang]/ directory structure
2. Add or update translated markdown files for agents, commands, skills, rules, and guides
3. Update README.md to reference new language and increment supported language count

**Files typically involved**:
- `docs/*/README.md`
- `docs/*/agents/*.md`
- `docs/*/commands/*.md`
- `docs/*/skills/*/SKILL.md`
- `docs/*/rules/**/*.md`
- `README.md`

**Example commit sequence**:
```
Create or update docs/[lang]/ directory structure
Add or update translated markdown files for agents, commands, skills, rules, and guides
Update README.md to reference new language and increment supported language count
```

### Add Or Update Hook

Adds a new hook or updates an existing one, including configuration and implementation, and sometimes associated tests.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update hook implementation file in scripts/hooks/
2. Update hooks/hooks.json to register or configure the hook
3. Optionally add or update tests in tests/hooks/

**Files typically involved**:
- `scripts/hooks/*.js`
- `hooks/hooks.json`
- `tests/hooks/*.test.js`

**Example commit sequence**:
```
Add or update hook implementation file in scripts/hooks/
Update hooks/hooks.json to register or configure the hook
Optionally add or update tests in tests/hooks/
```

### Add Or Update Language Support

Adds or updates language-specific rules, patterns, or testing documentation, typically under rules/[language]/.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update markdown files in rules/[language]/ for coding-style, hooks, patterns, security, and testing
2. Optionally update manifests or mapping files if language is newly supported

**Files typically involved**:
- `rules/*/coding-style.md`
- `rules/*/hooks.md`
- `rules/*/patterns.md`
- `rules/*/security.md`
- `rules/*/testing.md`

**Example commit sequence**:
```
Create or update markdown files in rules/[language]/ for coding-style, hooks, patterns, security, and testing
Optionally update manifests or mapping files if language is newly supported
```

### Add Or Update Session Adapter Or State

Adds or updates session adapter logic, state management, and related documentation/tests.

**Frequency**: ~2 times per month

**Steps**:
1. Update session adapter implementation in scripts/lib/session-adapters/
2. Update or add documentation in docs/SESSION-ADAPTER-CONTRACT.md
3. Update or add tests in tests/lib/

**Files typically involved**:
- `scripts/lib/session-adapters/*.js`
- `docs/SESSION-ADAPTER-CONTRACT.md`
- `tests/lib/*.test.js`

**Example commit sequence**:
```
Update session adapter implementation in scripts/lib/session-adapters/
Update or add documentation in docs/SESSION-ADAPTER-CONTRACT.md
Update or add tests in tests/lib/
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
