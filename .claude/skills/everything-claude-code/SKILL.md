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
feat: expand lead intelligence outreach channels
```

### Add New Skill

Adds a new skill to the codebase, typically for a specific agent or workflow.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update SKILL.md in skills/{skill-name}/ or .agents/skills/{skill-name}/ or .claude/skills/{skill-name}/
2. Optionally update related manifests or documentation

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`

**Example commit sequence**:
```
Create or update SKILL.md in skills/{skill-name}/ or .agents/skills/{skill-name}/ or .claude/skills/{skill-name}/
Optionally update related manifests or documentation
```

### Add Or Update Command

Adds or updates a command file, often for new workflows or automation steps.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update commands/{command-name}.md
2. Optionally update related documentation or scripts

**Files typically involved**:
- `commands/*.md`
- `.claude/commands/*.md`

**Example commit sequence**:
```
Create or update commands/{command-name}.md
Optionally update related documentation or scripts
```

### Multi Agent Orchestration Workflow

Introduces a new multi-agent workflow, including agent definitions and a coordinating skill.

**Frequency**: ~2 times per month

**Steps**:
1. Add one or more agents/{agent-name}.md files
2. Add a coordinating skills/{workflow-name}/SKILL.md
3. Add or update related commands/*.md
4. Add example or documentation files

**Files typically involved**:
- `agents/*.md`
- `skills/*/SKILL.md`
- `commands/*.md`
- `examples/*/README.md`

**Example commit sequence**:
```
Add one or more agents/{agent-name}.md files
Add a coordinating skills/{workflow-name}/SKILL.md
Add or update related commands/*.md
Add example or documentation files
```

### Install Target Integration

Adds support for a new install target (platform or environment), including scripts, schema updates, and tests.

**Frequency**: ~2 times per month

**Steps**:
1. Add platform-specific install and uninstall scripts (e.g., .codebuddy/install.sh, .gemini/GEMINI.md)
2. Update manifests/install-modules.json
3. Update schemas (ecc-install-config.schema.json, install-modules.schema.json)
4. Update or create scripts/lib/install-targets/{platform}.js
5. Update or add relevant tests

**Files typically involved**:
- `.{platform}/*`
- `manifests/install-modules.json`
- `schemas/ecc-install-config.schema.json`
- `schemas/install-modules.schema.json`
- `scripts/lib/install-targets/*.js`
- `tests/lib/install-targets.test.js`

**Example commit sequence**:
```
Add platform-specific install and uninstall scripts (e.g., .codebuddy/install.sh, .gemini/GEMINI.md)
Update manifests/install-modules.json
Update schemas (ecc-install-config.schema.json, install-modules.schema.json)
Update or create scripts/lib/install-targets/{platform}.js
Update or add relevant tests
```

### Documentation Update

Updates or adds documentation files, often in response to new features or workflows.

**Frequency**: ~3 times per month

**Steps**:
1. Edit or add README.md, AGENTS.md, WORKING-CONTEXT.md, or docs/*
2. Optionally update .claude-plugin/README.md, .codex-plugin/README.md

**Files typically involved**:
- `README.md`
- `AGENTS.md`
- `WORKING-CONTEXT.md`
- `docs/**/*.md`
- `.claude-plugin/README.md`
- `.codex-plugin/README.md`

**Example commit sequence**:
```
Edit or add README.md, AGENTS.md, WORKING-CONTEXT.md, or docs/*
Optionally update .claude-plugin/README.md, .codex-plugin/README.md
```

### Refactor Commands To Skills

Migrates or collapses legacy command logic into skill definitions, updating related documentation and manifests.

**Frequency**: ~2 times per month

**Steps**:
1. Move or merge commands/*.md content into skills/*/SKILL.md
2. Update AGENTS.md, README.md, WORKING-CONTEXT.md
3. Update manifests/install-modules.json

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`
- `AGENTS.md`
- `README.md`
- `WORKING-CONTEXT.md`
- `manifests/install-modules.json`

**Example commit sequence**:
```
Move or merge commands/*.md content into skills/*/SKILL.md
Update AGENTS.md, README.md, WORKING-CONTEXT.md
Update manifests/install-modules.json
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
