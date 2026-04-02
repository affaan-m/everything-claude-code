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
- `chore`

### Message Guidelines

- Average message length: ~57 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-or-update-command.md)
```

*Commit message example*

```text
fix: port safe ci cleanup from backlog
```

*Commit message example*

```text
refactor: collapse legacy command bodies into skills
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
feat: add everything-claude-code ECC bundle (.claude/commands/add-or-update-skill.md)
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
feat: add GAN-style generator-evaluator harness (#1029)
feat(agents,skills): add opensource-pipeline — 3-agent workflow for safe public releases (#1036)
feat(install): add CodeBuddy(Tencent) adaptation with installation scripts (#1038)
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

### Add Or Update Skill

Adds a new skill or updates an existing skill, including documentation and configuration.

**Frequency**: ~6 times per month

**Steps**:
1. Create or update a SKILL.md file in the appropriate skills directory (e.g., skills/skill-name/SKILL.md or .agents/skills/skill-name/SKILL.md or .claude/skills/skill-name/SKILL.md).
2. Optionally update related manifests or documentation (e.g., AGENTS.md, README.md).

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.claude/skills/*/SKILL.md`

**Example commit sequence**:
```
Create or update a SKILL.md file in the appropriate skills directory (e.g., skills/skill-name/SKILL.md or .agents/skills/skill-name/SKILL.md or .claude/skills/skill-name/SKILL.md).
Optionally update related manifests or documentation (e.g., AGENTS.md, README.md).
```

### Add Or Update Command

Adds a new workflow command or updates an existing command for agentic workflows.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update a markdown file in the commands/ directory (e.g., commands/command-name.md).
2. Optionally update related documentation or reference files.

**Files typically involved**:
- `commands/*.md`

**Example commit sequence**:
```
Create or update a markdown file in the commands/ directory (e.g., commands/command-name.md).
Optionally update related documentation or reference files.
```

### Add Skill And Agents Bundle

Adds a new feature or workflow by bundling new agents, skills, and supporting scripts or commands.

**Frequency**: ~3 times per month

**Steps**:
1. Create agent definition markdown files in agents/ (e.g., agents/agent-name.md).
2. Create a SKILL.md file in skills/ (e.g., skills/feature-name/SKILL.md).
3. Optionally add supporting scripts or commands.
4. Update documentation or manifests as needed.

**Files typically involved**:
- `agents/*.md`
- `skills/*/SKILL.md`
- `scripts/*.sh`
- `commands/*.md`

**Example commit sequence**:
```
Create agent definition markdown files in agents/ (e.g., agents/agent-name.md).
Create a SKILL.md file in skills/ (e.g., skills/feature-name/SKILL.md).
Optionally add supporting scripts or commands.
Update documentation or manifests as needed.
```

### Add Install Target

Adds a new install target (integration with an external tool or platform) including scripts, schemas, and manifest updates.

**Frequency**: ~2 times per month

**Steps**:
1. Add a new directory for the target (e.g., .codebuddy/, .gemini/), including README and install/uninstall scripts.
2. Update manifests/install-modules.json and schemas/ecc-install-config.schema.json.
3. Add or update scripts in scripts/lib/install-targets/.
4. Add or update tests for the new install target.

**Files typically involved**:
- `.codebuddy/*`
- `.gemini/*`
- `manifests/install-modules.json`
- `schemas/ecc-install-config.schema.json`
- `schemas/install-modules.schema.json`
- `scripts/lib/install-targets/*.js`
- `tests/lib/install-targets.test.js`

**Example commit sequence**:
```
Add a new directory for the target (e.g., .codebuddy/, .gemini/), including README and install/uninstall scripts.
Update manifests/install-modules.json and schemas/ecc-install-config.schema.json.
Add or update scripts in scripts/lib/install-targets/.
Add or update tests for the new install target.
```

### Sync Or Update Codex Ecc Baseline

Synchronizes or updates configuration and scripts between ECC and Codex, ensuring consistency across tools.

**Frequency**: ~2 times per month

**Steps**:
1. Update or create scripts in scripts/codex/ and scripts/sync-ecc-to-codex.sh.
2. Update configuration files such as package.json and related test files.
3. Update documentation (e.g., WORKING-CONTEXT.md).

**Files typically involved**:
- `scripts/codex/*.js`
- `scripts/sync-ecc-to-codex.sh`
- `package.json`
- `tests/scripts/*.test.js`
- `WORKING-CONTEXT.md`

**Example commit sequence**:
```
Update or create scripts in scripts/codex/ and scripts/sync-ecc-to-codex.sh.
Update configuration files such as package.json and related test files.
Update documentation (e.g., WORKING-CONTEXT.md).
```

### Update Hooks And Hook Tests

Updates hook configuration and logic, often with corresponding test updates.

**Frequency**: ~3 times per month

**Steps**:
1. Update hooks/hooks.json and/or scripts/hooks/*.js.
2. Update or add related test files in tests/hooks/ or tests/scripts/.
3. Optionally update documentation (e.g., WORKING-CONTEXT.md).

**Files typically involved**:
- `hooks/hooks.json`
- `scripts/hooks/*.js`
- `tests/hooks/*.test.js`
- `tests/scripts/*.test.js`
- `WORKING-CONTEXT.md`

**Example commit sequence**:
```
Update hooks/hooks.json and/or scripts/hooks/*.js.
Update or add related test files in tests/hooks/ or tests/scripts/.
Optionally update documentation (e.g., WORKING-CONTEXT.md).
```

### Update Or Add Documentation

Adds or updates documentation files, including troubleshooting, guides, and context files.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update markdown files in docs/ or root directory.
2. Optionally update related context files (e.g., WORKING-CONTEXT.md).

**Files typically involved**:
- `docs/*.md`
- `WORKING-CONTEXT.md`
- `README.md`
- `README.zh-CN.md`

**Example commit sequence**:
```
Create or update markdown files in docs/ or root directory.
Optionally update related context files (e.g., WORKING-CONTEXT.md).
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
