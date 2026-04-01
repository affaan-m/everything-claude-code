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

Adds a new skill to the codebase, making it available for use by agents or workflows.

**Frequency**: ~4 times per month

**Steps**:
1. Create a new SKILL.md file under skills/ or .agents/skills/ or .claude/skills/
2. Optionally update related manifests or documentation

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`

**Example commit sequence**:
```
Create a new SKILL.md file under skills/ or .agents/skills/ or .claude/skills/
Optionally update related manifests or documentation
```

### Add New Command

Introduces a new command or workflow step for agents or users.

**Frequency**: ~3 times per month

**Steps**:
1. Create a new markdown file under commands/ or .claude/commands/
2. Optionally update documentation or link to the new command

**Files typically involved**:
- `commands/*.md`
- `.claude/commands/*.md`

**Example commit sequence**:
```
Create a new markdown file under commands/ or .claude/commands/
Optionally update documentation or link to the new command
```

### Add New Agent Or Agent Prompt

Adds a new agent definition or prompt, enabling new automation or review capabilities.

**Frequency**: ~2 times per month

**Steps**:
1. Create a new agent definition markdown file under agents/
2. Or add a new prompt file under .opencode/prompts/agents/
3. Update agent registry/configuration files as needed

**Files typically involved**:
- `agents/*.md`
- `.opencode/prompts/agents/*.txt`
- `.opencode/opencode.json`

**Example commit sequence**:
```
Create a new agent definition markdown file under agents/
Or add a new prompt file under .opencode/prompts/agents/
Update agent registry/configuration files as needed
```

### Add Install Target Or Adapter

Adds support for a new installation target or adapts installation scripts for a new environment.

**Frequency**: ~2 times per month

**Steps**:
1. Create new install/uninstall scripts and documentation under a dot-directory (e.g., .codebuddy/, .gemini/)
2. Update manifests/install-modules.json and relevant schema files
3. Update scripts/lib/install-manifests.js and scripts/lib/install-targets/
4. Add or update tests for the new install target

**Files typically involved**:
- `.codebuddy/*`
- `.gemini/*`
- `manifests/install-modules.json`
- `schemas/ecc-install-config.schema.json`
- `schemas/install-modules.schema.json`
- `scripts/lib/install-manifests.js`
- `scripts/lib/install-targets/*.js`
- `tests/lib/install-targets.test.js`

**Example commit sequence**:
```
Create new install/uninstall scripts and documentation under a dot-directory (e.g., .codebuddy/, .gemini/)
Update manifests/install-modules.json and relevant schema files
Update scripts/lib/install-manifests.js and scripts/lib/install-targets/
Add or update tests for the new install target
```

### Refactor Or Collapse Commands Into Skills

Refactors legacy command files, collapsing their logic into skill definitions for a skills-first workflow.

**Frequency**: ~2 times per month

**Steps**:
1. Update or remove commands/*.md files
2. Update or create skills/*/SKILL.md files
3. Update documentation (README, AGENTS.md, WORKING-CONTEXT.md, etc.)
4. Update manifests if needed

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`
- `README.md`
- `AGENTS.md`
- `WORKING-CONTEXT.md`
- `manifests/install-modules.json`

**Example commit sequence**:
```
Update or remove commands/*.md files
Update or create skills/*/SKILL.md files
Update documentation (README, AGENTS.md, WORKING-CONTEXT.md, etc.)
Update manifests if needed
```

### Documentation Update Or Sync

Updates or synchronizes documentation across multiple files and languages.

**Frequency**: ~3 times per month

**Steps**:
1. Edit or add documentation files (README.md, AGENTS.md, WORKING-CONTEXT.md, docs/zh-CN/*, etc.)
2. Optionally update related configuration or manifest files

**Files typically involved**:
- `README.md`
- `README.zh-CN.md`
- `AGENTS.md`
- `WORKING-CONTEXT.md`
- `docs/zh-CN/*.md`
- `.claude-plugin/README.md`
- `.codex-plugin/README.md`

**Example commit sequence**:
```
Edit or add documentation files (README.md, AGENTS.md, WORKING-CONTEXT.md, docs/zh-CN/*, etc.)
Optionally update related configuration or manifest files
```

### Ci Cd Or Github Actions Update

Updates CI/CD workflows or GitHub Actions dependencies for automation and release processes.

**Frequency**: ~2 times per month

**Steps**:
1. Edit .github/workflows/*.yml files
2. Optionally update related lockfiles or package.json

**Files typically involved**:
- `.github/workflows/*.yml`

**Example commit sequence**:
```
Edit .github/workflows/*.yml files
Optionally update related lockfiles or package.json
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
