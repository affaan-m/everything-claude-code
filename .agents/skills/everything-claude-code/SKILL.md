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
feat: add everything-claude-code ECC bundle (.claude/commands/add-or-update-skill.md)
```

*Commit message example*

```text
refactor: extract social graph ranking core
```

*Commit message example*

```text
fix: port safe ci cleanup from backlog
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
- `**/api/**`

**Example commit sequence**:
```
feat(install): add CodeBuddy(Tencent) adaptation with installation scripts (#1038)
chore(deps-dev): bump c8 from 10.1.3 to 11.0.0 (#1065)
chore(deps): bump actions/checkout from 4.3.1 to 6.0.2 (#1060)
```

### Refactoring

Code refactoring and cleanup workflow

**Frequency**: ~4 times per month

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

Adds a new skill or updates an existing skill, including documentation and registration in manifests.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update SKILL.md in skills/<skill-name>/ or .agents/skills/<skill-name>/
2. Optionally add or update related reference files (e.g., assets, schemas, rules)
3. Update manifests/install-modules.json and/or manifests/install-components.json to register the skill
4. Update AGENTS.md, README.md, README.zh-CN.md, docs/zh-CN/AGENTS.md, and docs/zh-CN/README.md for documentation
5. Add or update any related test files

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `manifests/install-modules.json`
- `manifests/install-components.json`
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`
- `docs/zh-CN/AGENTS.md`
- `docs/zh-CN/README.md`

**Example commit sequence**:
```
Create or update SKILL.md in skills/<skill-name>/ or .agents/skills/<skill-name>/
Optionally add or update related reference files (e.g., assets, schemas, rules)
Update manifests/install-modules.json and/or manifests/install-components.json to register the skill
Update AGENTS.md, README.md, README.zh-CN.md, docs/zh-CN/AGENTS.md, and docs/zh-CN/README.md for documentation
Add or update any related test files
```

### Add Or Update Command

Adds or updates a workflow command, often for new automation or process steps.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update command markdown files in commands/ (e.g., prp-implement.md, code-review.md)
2. Optionally update related scripts or documentation
3. Update references in documentation or manifests if needed

**Files typically involved**:
- `commands/*.md`

**Example commit sequence**:
```
Create or update command markdown files in commands/ (e.g., prp-implement.md, code-review.md)
Optionally update related scripts or documentation
Update references in documentation or manifests if needed
```

### Refactor Skill Or Command

Refactors or reorganizes existing skills or commands, often merging, extracting, or collapsing logic.

**Frequency**: ~2 times per month

**Steps**:
1. Modify multiple SKILL.md files and/or command markdown files
2. Update documentation files (AGENTS.md, README.md, etc.) to reflect changes
3. Update manifests/install-modules.json or related registration files

**Files typically involved**:
- `skills/*/SKILL.md`
- `commands/*.md`
- `manifests/install-modules.json`
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`
- `docs/zh-CN/AGENTS.md`
- `docs/zh-CN/README.md`

**Example commit sequence**:
```
Modify multiple SKILL.md files and/or command markdown files
Update documentation files (AGENTS.md, README.md, etc.) to reflect changes
Update manifests/install-modules.json or related registration files
```

### Add Or Update Agent Or Agent Prompt

Adds or updates an agent definition or agent prompt, and registers it in the agent configuration.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update agent prompt files in .opencode/prompts/agents/
2. Update .opencode/opencode.json to register the agent
3. Update AGENTS.md for documentation

**Files typically involved**:
- `.opencode/prompts/agents/*.txt`
- `.opencode/opencode.json`
- `AGENTS.md`

**Example commit sequence**:
```
Create or update agent prompt files in .opencode/prompts/agents/
Update .opencode/opencode.json to register the agent
Update AGENTS.md for documentation
```

### Add Or Update Install Target

Adds or updates a supported install target (e.g., new IDE integration), including scripts, schemas, and registration.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update install scripts and documentation in a new or existing directory (e.g., .codebuddy/, .gemini/)
2. Update manifests/install-modules.json and schemas/ecc-install-config.schema.json
3. Update or create scripts/lib/install-targets/<target>.js
4. Update tests for install targets

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
Create or update install scripts and documentation in a new or existing directory (e.g., .codebuddy/, .gemini/)
Update manifests/install-modules.json and schemas/ecc-install-config.schema.json
Update or create scripts/lib/install-targets/<target>.js
Update tests for install targets
```

### Documentation Sync And Guidance Update

Updates documentation to reflect new workflows, skills, or guidance, often across multiple language versions.

**Frequency**: ~3 times per month

**Steps**:
1. Update AGENTS.md, README.md, README.zh-CN.md, WORKING-CONTEXT.md
2. Update docs/zh-CN/* for Chinese documentation
3. Update or add troubleshooting or guidance markdown files

**Files typically involved**:
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`
- `WORKING-CONTEXT.md`
- `docs/zh-CN/*`
- `docs/TROUBLESHOOTING.md`
- `the-shortform-guide.md`

**Example commit sequence**:
```
Update AGENTS.md, README.md, README.zh-CN.md, WORKING-CONTEXT.md
Update docs/zh-CN/* for Chinese documentation
Update or add troubleshooting or guidance markdown files
```

### Ci Hook Or Test Infrastructure Update

Updates continuous integration hooks, scripts, or test infrastructure for improved automation or validation.

**Frequency**: ~2 times per month

**Steps**:
1. Update hooks/hooks.json and related hook scripts in scripts/hooks/
2. Update or add test files in tests/hooks/ or tests/scripts/
3. Update related configuration files (e.g., package.json, workflows)

**Files typically involved**:
- `hooks/hooks.json`
- `scripts/hooks/*.js`
- `tests/hooks/*.test.js`
- `tests/scripts/*.test.js`
- `.github/workflows/*.yml`
- `package.json`

**Example commit sequence**:
```
Update hooks/hooks.json and related hook scripts in scripts/hooks/
Update or add test files in tests/hooks/ or tests/scripts/
Update related configuration files (e.g., package.json, workflows)
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
