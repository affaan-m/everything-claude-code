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
feat: add everything-claude-code ECC bundle (.claude/commands/add-or-update-skill.md)
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

Adds a new skill to the codebase, typically as a new agentic capability or workflow.

**Frequency**: ~3 times per month

**Steps**:
1. Create a new SKILL.md file under skills/ or .agents/skills/ or .claude/skills/
2. Document the skill's purpose, usage, and configuration.
3. Optionally, update documentation or manifests if needed.

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`

**Example commit sequence**:
```
Create a new SKILL.md file under skills/ or .agents/skills/ or .claude/skills/
Document the skill's purpose, usage, and configuration.
Optionally, update documentation or manifests if needed.
```

### Add Or Update Agent

Adds or updates an agent definition, often for new automation or orchestration capabilities.

**Frequency**: ~2 times per month

**Steps**:
1. Create or modify agent markdown files under agents/ or .opencode/prompts/agents/
2. Update agent registration/configuration files (e.g., .opencode/opencode.json).
3. Optionally, update AGENTS.md or related documentation.

**Files typically involved**:
- `agents/*.md`
- `.opencode/prompts/agents/*.txt`
- `.opencode/opencode.json`
- `AGENTS.md`

**Example commit sequence**:
```
Create or modify agent markdown files under agents/ or .opencode/prompts/agents/
Update agent registration/configuration files (e.g., .opencode/opencode.json).
Optionally, update AGENTS.md or related documentation.
```

### Add Or Update Command

Adds or updates a command file, typically for new workflows, automation, or CLI features.

**Frequency**: ~2 times per month

**Steps**:
1. Create or modify command markdown files under commands/ or .claude/commands/
2. Document the command's phases, arguments, and usage.
3. Optionally, update related documentation or index files.

**Files typically involved**:
- `commands/*.md`
- `.claude/commands/*.md`

**Example commit sequence**:
```
Create or modify command markdown files under commands/ or .claude/commands/
Document the command's phases, arguments, and usage.
Optionally, update related documentation or index files.
```

### Add Install Target Or Adapter

Adds a new install target or adapts the project for a new environment (e.g., CodeBuddy, Gemini).

**Frequency**: ~2 times per month

**Steps**:
1. Add new install scripts and documentation under a dot-directory (e.g., .codebuddy/, .gemini/).
2. Update manifests/install-modules.json and relevant schema files.
3. Implement or update install-target scripts in scripts/lib/install-targets/.
4. Update or add tests for new install targets.

**Files typically involved**:
- `.codebuddy/*`
- `.gemini/*`
- `manifests/install-modules.json`
- `schemas/*.schema.json`
- `scripts/lib/install-targets/*.js`
- `tests/lib/install-targets.test.js`

**Example commit sequence**:
```
Add new install scripts and documentation under a dot-directory (e.g., .codebuddy/, .gemini/).
Update manifests/install-modules.json and relevant schema files.
Implement or update install-target scripts in scripts/lib/install-targets/.
Update or add tests for new install targets.
```

### Documentation Sync And Update

Synchronizes or updates documentation across multiple files and languages.

**Frequency**: ~2 times per month

**Steps**:
1. Edit README.md, AGENTS.md, WORKING-CONTEXT.md, and/or their zh-CN counterparts.
2. Update docs/zh-CN/* as needed.
3. Optionally, update package.json, scripts, or related doc files.

**Files typically involved**:
- `README.md`
- `README.zh-CN.md`
- `AGENTS.md`
- `docs/zh-CN/*.md`
- `WORKING-CONTEXT.md`

**Example commit sequence**:
```
Edit README.md, AGENTS.md, WORKING-CONTEXT.md, and/or their zh-CN counterparts.
Update docs/zh-CN/* as needed.
Optionally, update package.json, scripts, or related doc files.
```

### Add Or Update Hook Or Workflow

Adds or updates automation hooks or CI/CD workflows, often for formatting, typechecking, or release validation.

**Frequency**: ~2 times per month

**Steps**:
1. Edit hooks/hooks.json or scripts/hooks/*.js to add or update hooks.
2. Update or add related test files under tests/hooks/.
3. Optionally, update .github/workflows/*.yml for CI/CD changes.

**Files typically involved**:
- `hooks/hooks.json`
- `scripts/hooks/*.js`
- `tests/hooks/*.test.js`
- `.github/workflows/*.yml`

**Example commit sequence**:
```
Edit hooks/hooks.json or scripts/hooks/*.js to add or update hooks.
Update or add related test files under tests/hooks/.
Optionally, update .github/workflows/*.yml for CI/CD changes.
```

### Dependency Bump

Bumps dependency versions for npm packages or GitHub Actions, often via automated tooling.

**Frequency**: ~2 times per month

**Steps**:
1. Edit package.json and yarn.lock for npm dependencies.
2. Edit .github/workflows/*.yml for GitHub Actions dependencies.
3. Commit with a standardized message referencing the dependency and version.

**Files typically involved**:
- `package.json`
- `yarn.lock`
- `.github/workflows/*.yml`

**Example commit sequence**:
```
Edit package.json and yarn.lock for npm dependencies.
Edit .github/workflows/*.yml for GitHub Actions dependencies.
Commit with a standardized message referencing the dependency and version.
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
