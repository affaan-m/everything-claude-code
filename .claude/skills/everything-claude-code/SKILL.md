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
feat: add everything-claude-code ECC bundle (.claude/commands/add-new-skill.md)
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

### Add Or Update Skill

Adds a new skill or updates an existing skill in the ECC system, often with documentation and/or configuration.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update SKILL.md in skills/ or .agents/skills/ or .claude/skills/
2. Optionally update manifests/install-modules.json or related config files
3. Optionally add or update documentation (README.md, AGENTS.md, etc.)

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`
- `manifests/install-modules.json`
- `README.md`
- `AGENTS.md`

**Example commit sequence**:
```
Create or update SKILL.md in skills/ or .agents/skills/ or .claude/skills/
Optionally update manifests/install-modules.json or related config files
Optionally add or update documentation (README.md, AGENTS.md, etc.)
```

### Add Or Update Command

Adds a new command or updates an existing command for agent workflows, including PRP and GAN workflows.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update commands/*.md file(s)
2. Optionally update related documentation or configuration
3. Optionally add test cases or examples

**Files typically involved**:
- `commands/*.md`
- `README.md`
- `AGENTS.md`
- `examples/*`

**Example commit sequence**:
```
Create or update commands/*.md file(s)
Optionally update related documentation or configuration
Optionally add test cases or examples
```

### Agent Or Agent Prompt Registration

Adds or updates agent definitions and registers them in the appropriate configuration files.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update agent definition files (e.g., agents/*.md, .opencode/prompts/agents/*.txt)
2. Update agent registry/configuration (e.g., .opencode/opencode.json)
3. Optionally update AGENTS.md or related documentation

**Files typically involved**:
- `agents/*.md`
- `.opencode/prompts/agents/*.txt`
- `.opencode/opencode.json`
- `AGENTS.md`

**Example commit sequence**:
```
Create or update agent definition files (e.g., agents/*.md, .opencode/prompts/agents/*.txt)
Update agent registry/configuration (e.g., .opencode/opencode.json)
Optionally update AGENTS.md or related documentation
```

### Add Or Update Install Target

Adds or updates a supported install target (e.g., Gemini, CodeBuddy) with scripts, schemas, and config.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update install scripts and documentation under a .<target>/ directory
2. Update manifests/install-modules.json and schemas
3. Update or add scripts/lib/install-targets/*.js
4. Update or add related tests

**Files typically involved**:
- `.<target>/*`
- `manifests/install-modules.json`
- `schemas/ecc-install-config.schema.json`
- `schemas/install-modules.schema.json`
- `scripts/lib/install-manifests.js`
- `scripts/lib/install-targets/*.js`
- `tests/lib/install-targets.test.js`

**Example commit sequence**:
```
Add or update install scripts and documentation under a .<target>/ directory
Update manifests/install-modules.json and schemas
Update or add scripts/lib/install-targets/*.js
Update or add related tests
```

### Documentation Sync Or Guidance Update

Synchronizes or updates documentation and guidance files, often after major feature or workflow changes.

**Frequency**: ~3 times per month

**Steps**:
1. Edit or add README.md, AGENTS.md, WORKING-CONTEXT.md, and docs/*
2. Optionally update .claude-plugin/* or .codex-plugin/* guidance
3. Update or add examples and guides

**Files typically involved**:
- `README.md`
- `AGENTS.md`
- `WORKING-CONTEXT.md`
- `docs/*`
- `.claude-plugin/*`
- `.codex-plugin/*`

**Example commit sequence**:
```
Edit or add README.md, AGENTS.md, WORKING-CONTEXT.md, and docs/*
Optionally update .claude-plugin/* or .codex-plugin/* guidance
Update or add examples and guides
```

### Ci Cd Or Hook Logic Update

Updates CI/CD workflow files or hook logic for formatting, typechecking, or audit logging.

**Frequency**: ~3 times per month

**Steps**:
1. Edit .github/workflows/*.yml for CI/CD changes
2. Edit hooks/hooks.json or scripts/hooks/*.js for hook logic
3. Optionally update or add related tests

**Files typically involved**:
- `.github/workflows/*.yml`
- `hooks/hooks.json`
- `scripts/hooks/*.js`
- `tests/hooks/*.test.js`

**Example commit sequence**:
```
Edit .github/workflows/*.yml for CI/CD changes
Edit hooks/hooks.json or scripts/hooks/*.js for hook logic
Optionally update or add related tests
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
