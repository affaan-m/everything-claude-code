---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits.
---

# Everything Claude Code Conventions

> Generated from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) on 2026-04-01

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
- `chore`

### Message Guidelines

- Average message length: ~57 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-or-update-cli-command.md)
```

*Commit message example*

```text
refactor: collapse legacy command bodies into skills
```

*Commit message example*

```text
fix: dedupe managed hooks by semantic identity
```

*Commit message example*

```text
docs: close bundle drift and sync plugin guidance
```

*Commit message example*

```text
chore: ignore local orchestration artifacts
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-new-skill-or-agent.md)
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

**Frequency**: ~19 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `.opencode/*`
- `.opencode/plugins/*`
- `.opencode/plugins/lib/*`
- `**/*.test.*`

**Example commit sequence**:
```
feat: install claude-hud plugin (jarrodwatts/claude-hud) (#1041)
feat: add GAN-style generator-evaluator harness (#1029)
feat(agents,skills): add opensource-pipeline — 3-agent workflow for safe public releases (#1036)
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
refactor: collapse legacy command bodies into skills
feat: add connected operator workflow skills
feat: expand lead intelligence outreach channels
```

### Add New Skill Or Agent

Adds a new skill or agent to the codebase, including documentation and configuration.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update SKILL.md in skills/ or .agents/skills/ or .claude/skills/
2. Optionally add or update agent definition in agents/ or .agents/skills/
3. Update manifests/install-modules.json if skill/agent is installable
4. Update AGENTS.md and/or README.md to document the new skill/agent

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`
- `agents/*.md`
- `manifests/install-modules.json`
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Create or update SKILL.md in skills/ or .agents/skills/ or .claude/skills/
Optionally add or update agent definition in agents/ or .agents/skills/
Update manifests/install-modules.json if skill/agent is installable
Update AGENTS.md and/or README.md to document the new skill/agent
```

### Add Or Update Command

Adds or updates a CLI or workflow command, often with supporting documentation and implementation.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update a command file in commands/
2. Update related documentation (README.md, AGENTS.md, etc.) if needed
3. Optionally update scripts or tests if command has code or testable behavior

**Files typically involved**:
- `commands/*.md`
- `README.md`
- `AGENTS.md`
- `tests/**/*.js`

**Example commit sequence**:
```
Create or update a command file in commands/
Update related documentation (README.md, AGENTS.md, etc.) if needed
Optionally update scripts or tests if command has code or testable behavior
```

### Feature Development Or Refactor

Implements a new feature or refactors an existing one, including code, documentation, and tests.

**Frequency**: ~2 times per month

**Steps**:
1. Implement or refactor code in skills/, agents/, scripts/, or commands/
2. Update or add relevant documentation (README.md, AGENTS.md, WORKING-CONTEXT.md, etc.)
3. Update or add tests in tests/
4. Update manifests or configuration files if needed

**Files typically involved**:
- `skills/*/SKILL.md`
- `agents/*.md`
- `scripts/**/*.js`
- `commands/*.md`
- `README.md`
- `AGENTS.md`
- `WORKING-CONTEXT.md`
- `tests/**/*.js`
- `manifests/*.json`

**Example commit sequence**:
```
Implement or refactor code in skills/, agents/, scripts/, or commands/
Update or add relevant documentation (README.md, AGENTS.md, WORKING-CONTEXT.md, etc.)
Update or add tests in tests/
Update manifests or configuration files if needed
```

### Add Or Update Install Target

Adds or updates an install target (integration with external tool or platform), including scripts, schemas, and tests.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update install scripts (install.sh, install.js, uninstall.sh, uninstall.js) in a tool-specific directory
2. Update manifests/install-modules.json and schemas/ecc-install-config.schema.json
3. Update scripts/lib/install-manifests.js and scripts/lib/install-targets/*.js
4. Add or update tests in tests/lib/install-targets.test.js

**Files typically involved**:
- `*/install.sh`
- `*/install.js`
- `*/uninstall.sh`
- `*/uninstall.js`
- `manifests/install-modules.json`
- `schemas/ecc-install-config.schema.json`
- `schemas/install-modules.schema.json`
- `scripts/lib/install-manifests.js`
- `scripts/lib/install-targets/*.js`
- `tests/lib/install-targets.test.js`

**Example commit sequence**:
```
Add or update install scripts (install.sh, install.js, uninstall.sh, uninstall.js) in a tool-specific directory
Update manifests/install-modules.json and schemas/ecc-install-config.schema.json
Update scripts/lib/install-manifests.js and scripts/lib/install-targets/*.js
Add or update tests in tests/lib/install-targets.test.js
```

### Documentation Update Or Sync

Updates documentation, synchronizes guidance, or adds new docs related to workflows, skills, or plugins.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or add markdown files in docs/, README.md, AGENTS.md, WORKING-CONTEXT.md, or plugin directories
2. Synchronize documentation across multiple language or context variants if needed
3. Update related configuration or manifest files if documentation references them

**Files typically involved**:
- `README.md`
- `README.zh-CN.md`
- `AGENTS.md`
- `WORKING-CONTEXT.md`
- `docs/**/*.md`
- `.claude-plugin/README.md`
- `.codex-plugin/README.md`
- `.claude/commands/*.md`

**Example commit sequence**:
```
Edit or add markdown files in docs/, README.md, AGENTS.md, WORKING-CONTEXT.md, or plugin directories
Synchronize documentation across multiple language or context variants if needed
Update related configuration or manifest files if documentation references them
```

### Ci Cd Or Dependency Update

Updates CI/CD workflows or bumps dependencies (e.g., GitHub Actions, npm packages).

**Frequency**: ~2 times per month

**Steps**:
1. Edit workflow files in .github/workflows/
2. Update package.json and yarn.lock for npm dependencies
3. Update lockfiles or schema files as needed

**Files typically involved**:
- `.github/workflows/*.yml`
- `package.json`
- `yarn.lock`
- `package-lock.json`

**Example commit sequence**:
```
Edit workflow files in .github/workflows/
Update package.json and yarn.lock for npm dependencies
Update lockfiles or schema files as needed
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
