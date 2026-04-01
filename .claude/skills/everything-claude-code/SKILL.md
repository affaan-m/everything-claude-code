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
feat: add everything-claude-code ECC bundle (.claude/commands/add-skill-or-agent-workflow.md)
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
feat: add everything-claude-code ECC bundle (.claude/ecc-tools.json)
```

### Add New Skill Or Agent

Adds a new skill or agent to the codebase, including documentation and configuration.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update SKILL.md in skills/ or .agents/skills/ or .claude/skills/ directory.
2. Optionally add or update agent YAML or TOML configuration in .agents/skills/ or .codex/agents/.
3. Update AGENTS.md or related documentation files.
4. Update manifests/install-modules.json or similar registry/config files if needed.

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`
- `.agents/skills/*/*.yaml`
- `.codex/agents/*.toml`
- `AGENTS.md`
- `manifests/install-modules.json`

**Example commit sequence**:
```
Create or update SKILL.md in skills/ or .agents/skills/ or .claude/skills/ directory.
Optionally add or update agent YAML or TOML configuration in .agents/skills/ or .codex/agents/.
Update AGENTS.md or related documentation files.
Update manifests/install-modules.json or similar registry/config files if needed.
```

### Add Or Update Command Workflow

Adds or updates a workflow command for automation or agent orchestration.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update a command markdown file in commands/ or .claude/commands/.
2. Update or create related documentation in .claude/commands/.
3. If relevant, update or create artifacts in .claude/PRPs/ or similar directories.

**Files typically involved**:
- `commands/*.md`
- `.claude/commands/*.md`
- `.claude/PRPs/*`

**Example commit sequence**:
```
Create or update a command markdown file in commands/ or .claude/commands/.
Update or create related documentation in .claude/commands/.
If relevant, update or create artifacts in .claude/PRPs/ or similar directories.
```

### Feature Development Or Refactor With Docs

Implements a new feature or refactors code, updating documentation and manifests as needed.

**Frequency**: ~3 times per month

**Steps**:
1. Edit or add implementation files (skills, agents, scripts, commands).
2. Update documentation files (README.md, AGENTS.md, WORKING-CONTEXT.md, docs/).
3. Update manifests or configuration files (manifests/install-modules.json, package.json, scripts/ci/catalog.js).
4. If needed, update or add tests.

**Files typically involved**:
- `skills/*/SKILL.md`
- `agents/*.md`
- `commands/*.md`
- `README.md`
- `README.zh-CN.md`
- `AGENTS.md`
- `WORKING-CONTEXT.md`
- `docs/**/*.md`
- `manifests/install-modules.json`
- `package.json`
- `scripts/ci/catalog.js`
- `tests/**/*.js`

**Example commit sequence**:
```
Edit or add implementation files (skills, agents, scripts, commands).
Update documentation files (README.md, AGENTS.md, WORKING-CONTEXT.md, docs/).
Update manifests or configuration files (manifests/install-modules.json, package.json, scripts/ci/catalog.js).
If needed, update or add tests.
```

### Add Install Target Or Adaptation

Adds support for a new install target or adapts the system for a new environment (e.g., Gemini, CodeBuddy).

**Frequency**: ~2 times per month

**Steps**:
1. Add or update install scripts and README in a new dot-directory (e.g., .gemini/, .codebuddy/).
2. Update manifests/install-modules.json and relevant schema files.
3. Update or add scripts/lib/install-targets/*.js for the new target.
4. Add or update tests for the new install target.

**Files typically involved**:
- `.gemini/*`
- `.codebuddy/*`
- `manifests/install-modules.json`
- `schemas/*.json`
- `scripts/lib/install-targets/*.js`
- `scripts/lib/install-manifests.js`
- `tests/lib/install-targets.test.js`

**Example commit sequence**:
```
Add or update install scripts and README in a new dot-directory (e.g., .gemini/, .codebuddy/).
Update manifests/install-modules.json and relevant schema files.
Update or add scripts/lib/install-targets/*.js for the new target.
Add or update tests for the new install target.
```

### Update Or Add Ci Cd Workflow

Updates or adds CI/CD workflow files, typically for dependency upgrades or workflow improvements.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or add files in .github/workflows/.
2. Update related lockfiles or configuration if needed (package.json, yarn.lock).

**Files typically involved**:
- `.github/workflows/*.yml`
- `package.json`
- `yarn.lock`

**Example commit sequence**:
```
Edit or add files in .github/workflows/.
Update related lockfiles or configuration if needed (package.json, yarn.lock).
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
