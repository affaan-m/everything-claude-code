---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits.
---

# Everything Claude Code Conventions

> Generated from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) on 2026-04-02

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

### Message Guidelines

- Average message length: ~56 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
fix(codex): remove duplicate agents table from reference config (#1032)
```

*Commit message example*

```text
feat: add gitagent format for cross-harness portability
```

*Commit message example*

```text
test: isolate codex hook sync env (#1023)
```

*Commit message example*

```text
chore: revert lockfile churn
```

*Commit message example*

```text
docs(readme): fix agent count in repo tree
```

*Commit message example*

```text
ETA-561: Add error logging to remaining bare catch blocks
```

*Commit message example*

```text
fix(ci): harden codex hook regression test (#1028)
```

*Commit message example*

```text
Merge pull request #833 from shreyas-lyzr/feat/gitagent-format
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

### Feature Development

Standard feature implementation workflow

**Frequency**: ~7 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `**/*.test.*`

**Example commit sequence**:
```
feat: add omega-memory MCP server to mcp-configs
Merge pull request #818 from 694344851/docs/zh-cn-prune-command
Merge pull request #959 from sreedhargs89/feat/skill-context-keeper
```

### Add New Skill

Adds a new skill to the codebase, including documentation and implementation files.

**Frequency**: ~2 times per month

**Steps**:
1. Create new SKILL.md file under skills/<skill-name>/
2. Add implementation files (e.g., .py, .sh, .mjs) under skills/<skill-name>/
3. Add reference or supporting markdown files under skills/<skill-name>/references/ if needed
4. Add or update corresponding test file under tests/scripts/ or tests/hooks/
5. Update AGENTS.md and/or README.md to reference the new skill

**Files typically involved**:
- `skills/*/SKILL.md`
- `skills/*/*.py`
- `skills/*/*.sh`
- `skills/*/*.mjs`
- `skills/*/references/*.md`
- `tests/scripts/*-<skill-name>*.test.js`
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Create new SKILL.md file under skills/<skill-name>/
Add implementation files (e.g., .py, .sh, .mjs) under skills/<skill-name>/
Add reference or supporting markdown files under skills/<skill-name>/references/ if needed
Add or update corresponding test file under tests/scripts/ or tests/hooks/
Update AGENTS.md and/or README.md to reference the new skill
```

### Harden Or Fix Skill Or Hook

Improves robustness, fixes bugs, or clarifies documentation for an existing skill or hook, often with tests.

**Frequency**: ~4 times per month

**Steps**:
1. Edit SKILL.md and/or implementation files under skills/<skill-name>/ or scripts/hooks/
2. Edit or add test files under tests/scripts/ or tests/hooks/
3. Update related documentation files (README.md, AGENTS.md, etc.) if needed

**Files typically involved**:
- `skills/*/SKILL.md`
- `skills/*/*.py`
- `skills/*/*.sh`
- `skills/*/*.mjs`
- `skills/*/references/*.md`
- `scripts/hooks/*.js`
- `tests/scripts/*-<skill-name>*.test.js`
- `tests/hooks/*.test.js`
- `README.md`
- `AGENTS.md`

**Example commit sequence**:
```
Edit SKILL.md and/or implementation files under skills/<skill-name>/ or scripts/hooks/
Edit or add test files under tests/scripts/ or tests/hooks/
Update related documentation files (README.md, AGENTS.md, etc.) if needed
```

### Add Or Update Hook

Adds a new git or CI hook, or updates an existing one, including registration in hooks.json and relevant tests.

**Frequency**: ~2 times per month

**Steps**:
1. Create or edit hook implementation in scripts/hooks/
2. Register or update hook in hooks/hooks.json
3. Update hooks/README.md if needed
4. Add or update test in tests/hooks/
5. Update skills/git-workflow/SKILL.md if relevant

**Files typically involved**:
- `scripts/hooks/*.js`
- `hooks/hooks.json`
- `hooks/README.md`
- `tests/hooks/*.test.js`
- `skills/git-workflow/SKILL.md`

**Example commit sequence**:
```
Create or edit hook implementation in scripts/hooks/
Register or update hook in hooks/hooks.json
Update hooks/README.md if needed
Add or update test in tests/hooks/
Update skills/git-workflow/SKILL.md if relevant
```

### Add Or Update Agent

Adds a new agent or updates agent-related documentation/configuration.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update agent documentation in agents/*.md
2. Update AGENTS.md and README.md to reflect the new or changed agent
3. Update manifests/install-modules.json if relevant

**Files typically involved**:
- `agents/*.md`
- `AGENTS.md`
- `README.md`
- `manifests/install-modules.json`

**Example commit sequence**:
```
Create or update agent documentation in agents/*.md
Update AGENTS.md and README.md to reflect the new or changed agent
Update manifests/install-modules.json if relevant
```

### Add Or Update Mcp Server Config

Adds or updates an MCP server configuration for agent memory or coordination.

**Frequency**: ~2 times per month

**Steps**:
1. Edit mcp-configs/mcp-servers.json to add or update server entry
2. Optionally update documentation or description fields

**Files typically involved**:
- `mcp-configs/mcp-servers.json`

**Example commit sequence**:
```
Edit mcp-configs/mcp-servers.json to add or update server entry
Optionally update documentation or description fields
```

### Ci Or Hook Policy Hardening

Improves CI scripts, hook enforcement, or project policy files for robustness or coverage.

**Frequency**: ~3 times per month

**Steps**:
1. Edit scripts/ci/* or scripts/hooks/* or scripts/codex/*
2. Edit or add tests in tests/scripts/ or tests/hooks/
3. Update documentation if needed

**Files typically involved**:
- `scripts/ci/*.js`
- `scripts/ci/*.sh`
- `scripts/hooks/*.js`
- `scripts/codex/*.sh`
- `tests/scripts/*.test.js`
- `tests/hooks/*.test.js`
- `README.md`

**Example commit sequence**:
```
Edit scripts/ci/* or scripts/hooks/* or scripts/codex/*
Edit or add tests in tests/scripts/ or tests/hooks/
Update documentation if needed
```

### Multi Locale Or Multilingual Doc Update

Updates documentation across multiple locales/languages for commands, skills, or agents.

**Frequency**: ~2 times per month

**Steps**:
1. Edit docs/<locale>/* and/or skills/*/SKILL.md
2. Edit README.md or CONTRIBUTING.md if needed

**Files typically involved**:
- `docs/*/*.md`
- `skills/*/SKILL.md`
- `README.md`
- `CONTRIBUTING.md`

**Example commit sequence**:
```
Edit docs/<locale>/* and/or skills/*/SKILL.md
Edit README.md or CONTRIBUTING.md if needed
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
