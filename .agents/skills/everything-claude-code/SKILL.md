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
feat: add everything-claude-code-conventions ECC bundle (.claude/commands/add-or-update-skill.md)
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
feat: add everything-claude-code-conventions ECC bundle (.claude/commands/refactoring.md)
```

*Commit message example*

```text
feat: add everything-claude-code-conventions ECC bundle (.claude/commands/feature-development.md)
```

*Commit message example*

```text
feat: add everything-claude-code-conventions ECC bundle (.claude/enterprise/controls.md)
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
feat(agents,skills): add opensource-pipeline — 3-agent workflow for safe public releases (#1036)
feat(install): add CodeBuddy(Tencent) adaptation with installation scripts (#1038)
chore(deps-dev): bump c8 from 10.1.3 to 11.0.0 (#1065)
```

### Refactoring

Code refactoring and cleanup workflow

**Frequency**: ~3 times per month

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

Adds or updates a skill module, including documentation and references, and registers it in manifests and documentation.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update SKILL.md in skills/<skill-name>/ or .agents/skills/<skill-name>/
2. Optionally add or update references or assets under skills/<skill-name>/references/ or assets/
3. Update manifests/install-modules.json and/or manifests/install-components.json
4. Update AGENTS.md, README.md, README.zh-CN.md, and docs/zh-CN/* as needed
5. Update WORKING-CONTEXT.md if context changes
6. Optionally update or create related test files

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `skills/*/references/*.md`
- `skills/*/assets/*`
- `manifests/install-modules.json`
- `manifests/install-components.json`
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`
- `docs/zh-CN/AGENTS.md`
- `docs/zh-CN/README.md`
- `WORKING-CONTEXT.md`

**Example commit sequence**:
```
Create or update SKILL.md in skills/<skill-name>/ or .agents/skills/<skill-name>/
Optionally add or update references or assets under skills/<skill-name>/references/ or assets/
Update manifests/install-modules.json and/or manifests/install-components.json
Update AGENTS.md, README.md, README.zh-CN.md, and docs/zh-CN/* as needed
Update WORKING-CONTEXT.md if context changes
Optionally update or create related test files
```

### Add Or Update Command Workflow

Adds or updates command documentation and workflow scripts for agentic or PRP workflows.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update command markdown files under commands/ (e.g., prp-prd.md, code-review.md)
2. If extending, update related commands (e.g., plan.md cross-references prp-plan.md)
3. Address review feedback and iterate on command logic and documentation

**Files typically involved**:
- `commands/*.md`

**Example commit sequence**:
```
Create or update command markdown files under commands/ (e.g., prp-prd.md, code-review.md)
If extending, update related commands (e.g., plan.md cross-references prp-plan.md)
Address review feedback and iterate on command logic and documentation
```

### Add Or Update Agent Or Agent Prompt

Adds or updates agent configuration, prompt files, and registers agents in orchestration manifests.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update agent prompt files under .opencode/prompts/agents/
2. Update .opencode/opencode.json to register or modify agent configuration
3. Update AGENTS.md to document the new or updated agent

**Files typically involved**:
- `.opencode/prompts/agents/*.txt`
- `.opencode/opencode.json`
- `AGENTS.md`

**Example commit sequence**:
```
Create or update agent prompt files under .opencode/prompts/agents/
Update .opencode/opencode.json to register or modify agent configuration
Update AGENTS.md to document the new or updated agent
```

### Feature Development Skill And Docs

Implements a new feature or workflow by adding skills, updating documentation, and synchronizing manifests and context.

**Frequency**: ~3 times per month

**Steps**:
1. Add or update SKILL.md and related files in skills/ or .agents/skills/
2. Update or create supporting documentation (README.md, AGENTS.md, docs/zh-CN/*, WORKING-CONTEXT.md)
3. Update manifests/install-modules.json and/or manifests/install-components.json
4. Synchronize or update related scripts or test files

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`
- `docs/zh-CN/AGENTS.md`
- `docs/zh-CN/README.md`
- `WORKING-CONTEXT.md`
- `manifests/install-modules.json`
- `manifests/install-components.json`

**Example commit sequence**:
```
Add or update SKILL.md and related files in skills/ or .agents/skills/
Update or create supporting documentation (README.md, AGENTS.md, docs/zh-CN/*, WORKING-CONTEXT.md)
Update manifests/install-modules.json and/or manifests/install-components.json
Synchronize or update related scripts or test files
```

### Refactor Or Sync Manifests And Context

Refactors commands, skills, or agents and synchronizes manifests and working context documentation.

**Frequency**: ~2 times per month

**Steps**:
1. Update or remove command files under commands/
2. Update or create SKILL.md files as needed
3. Update manifests/install-modules.json and/or install-components.json
4. Update AGENTS.md, README.md, README.zh-CN.md, docs/zh-CN/*, WORKING-CONTEXT.md

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`
- `manifests/install-modules.json`
- `manifests/install-components.json`
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`
- `docs/zh-CN/AGENTS.md`
- `docs/zh-CN/README.md`
- `WORKING-CONTEXT.md`

**Example commit sequence**:
```
Update or remove command files under commands/
Update or create SKILL.md files as needed
Update manifests/install-modules.json and/or install-components.json
Update AGENTS.md, README.md, README.zh-CN.md, docs/zh-CN/*, WORKING-CONTEXT.md
```

### Add Or Update Install Target

Adds or updates an install target (e.g., CodeBuddy, Gemini) with scripts, schemas, and manifest registration.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update install/uninstall scripts under .<target>/
2. Update or create README files for the target
3. Update schemas (ecc-install-config.schema.json, install-modules.schema.json)
4. Update scripts/lib/install-targets/<target>-project.js and registry.js
5. Update manifests/install-modules.json
6. Update or add related test files

**Files typically involved**:
- `.<target>/*`
- `manifests/install-modules.json`
- `schemas/ecc-install-config.schema.json`
- `schemas/install-modules.schema.json`
- `scripts/lib/install-manifests.js`
- `scripts/lib/install-targets/<target>-project.js`
- `scripts/lib/install-targets/registry.js`
- `tests/lib/install-targets.test.js`

**Example commit sequence**:
```
Add or update install/uninstall scripts under .<target>/
Update or create README files for the target
Update schemas (ecc-install-config.schema.json, install-modules.schema.json)
Update scripts/lib/install-targets/<target>-project.js and registry.js
Update manifests/install-modules.json
Update or add related test files
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
