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
feat: add everything-claude-code ECC bundle (.claude/commands/add-new-skill-or-agent.md)
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
feat: add everything-claude-code ECC bundle (.claude/commands/refactoring.md)
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

### Add New Skill

Adds a new skill to the project, including documentation and configuration.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update SKILL.md in the appropriate skills directory.
2. Optionally update related manifests or documentation files.

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`

**Example commit sequence**:
```
Create or update SKILL.md in the appropriate skills directory.
Optionally update related manifests or documentation files.
```

### Add New Command

Adds a new command to the system, often for workflows or automation.

**Frequency**: ~2 times per month

**Steps**:
1. Create a new markdown file in the commands/ directory.
2. Optionally update related documentation or index files.

**Files typically involved**:
- `commands/*.md`

**Example commit sequence**:
```
Create a new markdown file in the commands/ directory.
Optionally update related documentation or index files.
```

### Add New Agent

Adds a new agent definition or updates agent configuration.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update agent definition markdown or TOML file.
2. Update agent registration/configuration files as needed.

**Files typically involved**:
- `agents/*.md`
- `.codex/agents/*.toml`
- `.opencode/prompts/agents/*.txt`
- `.opencode/opencode.json`

**Example commit sequence**:
```
Create or update agent definition markdown or TOML file.
Update agent registration/configuration files as needed.
```

### Feature Development Bundle

Implements a new feature or workflow, touching implementation, documentation, and manifests.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update SKILL.md, agent files, and command files.
2. Update manifests/install-modules.json and related schemas.
3. Update documentation (README, AGENTS.md, etc).
4. Add or update tests if needed.

**Files typically involved**:
- `skills/*/SKILL.md`
- `agents/*.md`
- `commands/*.md`
- `manifests/install-modules.json`
- `schemas/*.json`
- `README.md`
- `AGENTS.md`
- `tests/**/*.js`

**Example commit sequence**:
```
Add or update SKILL.md, agent files, and command files.
Update manifests/install-modules.json and related schemas.
Update documentation (README, AGENTS.md, etc).
Add or update tests if needed.
```

### Documentation Sync Or Update

Updates documentation files to reflect new features, workflows, or guidance.

**Frequency**: ~3 times per month

**Steps**:
1. Edit or add markdown files in docs/, README.md, AGENTS.md, or WORKING-CONTEXT.md.
2. Optionally update localized documentation (docs/zh-CN/).

**Files typically involved**:
- `README.md`
- `AGENTS.md`
- `WORKING-CONTEXT.md`
- `docs/**/*.md`
- `docs/zh-CN/**/*.md`

**Example commit sequence**:
```
Edit or add markdown files in docs/, README.md, AGENTS.md, or WORKING-CONTEXT.md.
Optionally update localized documentation (docs/zh-CN/).
```

### Refactor Or Collapse Workflow

Refactors existing commands or skills, often consolidating or migrating logic.

**Frequency**: ~1 times per month

**Steps**:
1. Edit or remove multiple command and skill files.
2. Update documentation to reflect new structure.
3. Update manifests or configuration as needed.

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`
- `README.md`
- `AGENTS.md`
- `manifests/install-modules.json`

**Example commit sequence**:
```
Edit or remove multiple command and skill files.
Update documentation to reflect new structure.
Update manifests or configuration as needed.
```

### Add Or Update Install Target

Adds or updates an install target (integration with external tool or platform).

**Frequency**: ~1 times per month

**Steps**:
1. Add or update install scripts and documentation in a tool-specific directory.
2. Update manifests/install-modules.json and schemas.
3. Update or add test files for the new install target.

**Files typically involved**:
- `.<tool>/*`
- `manifests/install-modules.json`
- `schemas/*.json`
- `scripts/lib/install-targets/*.js`
- `tests/lib/install-targets.test.js`

**Example commit sequence**:
```
Add or update install scripts and documentation in a tool-specific directory.
Update manifests/install-modules.json and schemas.
Update or add test files for the new install target.
```

### Dependency Update Via Dependabot

Automated dependency updates for CI, build, or runtime dependencies.

**Frequency**: ~2 times per month

**Steps**:
1. Update dependency version in package.json, yarn.lock, or workflow YAML files.
2. Commit with a standardized message.

**Files typically involved**:
- `package.json`
- `yarn.lock`
- `.github/workflows/*.yml`

**Example commit sequence**:
```
Update dependency version in package.json, yarn.lock, or workflow YAML files.
Commit with a standardized message.
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
