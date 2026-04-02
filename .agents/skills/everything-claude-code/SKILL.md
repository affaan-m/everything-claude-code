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

- Average message length: ~56 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat(skills): add argus-dispatch — multi-model task dispatcher
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
feat(skills): add brand voice and network ops lanes
```

*Commit message example*

```text
feat: sync the codex baseline and agent roles
```

*Commit message example*

```text
fix: harden install and codex sync portability
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

**Frequency**: ~14 times per month

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
feat(team-builder): use `claude agents` command for agent discovery (#1021)
fix: extract inline SessionStart bootstrap to separate file (#1035)
feat: add hexagonal architecture SKILL. (#1034)
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

### Add New Skill

Adds a new AI agent skill to the codebase, including documentation and registration.

**Frequency**: ~3 times per month

**Steps**:
1. Create a new SKILL.md file in skills/<skill-name>/ or .agents/skills/<skill-name>/
2. Optionally add supporting scripts or references under the skill directory
3. Update AGENTS.md and/or README.md to document the new skill
4. Update docs/zh-CN/AGENTS.md and docs/zh-CN/README.md for Chinese documentation
5. Update manifests/install-modules.json or install-components.json to register the skill

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`
- `docs/zh-CN/AGENTS.md`
- `docs/zh-CN/README.md`
- `manifests/install-modules.json`
- `manifests/install-components.json`

**Example commit sequence**:
```
Create a new SKILL.md file in skills/<skill-name>/ or .agents/skills/<skill-name>/
Optionally add supporting scripts or references under the skill directory
Update AGENTS.md and/or README.md to document the new skill
Update docs/zh-CN/AGENTS.md and docs/zh-CN/README.md for Chinese documentation
Update manifests/install-modules.json or install-components.json to register the skill
```

### Add New Agent Or Pipeline

Adds a new agent or multi-agent workflow pipeline, including agent definitions and orchestration skills.

**Frequency**: ~2 times per month

**Steps**:
1. Create one or more agent definition files in agents/
2. Create or update a SKILL.md in skills/<pipeline-name>/ to orchestrate or document the workflow
3. Optionally add supporting commands, scripts, or examples
4. Update AGENTS.md and/or README.md to document the new pipeline

**Files typically involved**:
- `agents/*.md`
- `skills/*/SKILL.md`
- `commands/*.md`
- `scripts/*.sh`
- `examples/*/README.md`
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Create one or more agent definition files in agents/
Create or update a SKILL.md in skills/<pipeline-name>/ to orchestrate or document the workflow
Optionally add supporting commands, scripts, or examples
Update AGENTS.md and/or README.md to document the new pipeline
```

### Add Or Update Command Workflow

Adds or extends a CLI command for agent workflows, often with review feedback iterations.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update one or more command markdown files in commands/
2. Iterate with fixes based on review feedback (improving YAML frontmatter, usage, output, etc.)
3. Optionally update AGENTS.md or documentation to reference the new command

**Files typically involved**:
- `commands/*.md`
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Create or update one or more command markdown files in commands/
Iterate with fixes based on review feedback (improving YAML frontmatter, usage, output, etc.)
Optionally update AGENTS.md or documentation to reference the new command
```

### Add Install Target Or Adapter

Adds support for a new install target (e.g., Gemini, CodeBuddy), including scripts, schemas, and manifest updates.

**Frequency**: ~2 times per month

**Steps**:
1. Add a new directory for the install target (e.g., .gemini/, .codebuddy/)
2. Add install/uninstall scripts and README(s)
3. Update schemas/ecc-install-config.schema.json and/or install-modules.schema.json
4. Update manifests/install-modules.json
5. Update scripts/lib/install-manifests.js and scripts/lib/install-targets/<target>.js
6. Add or update tests for the new install target

**Files typically involved**:
- `.<target>/*`
- `schemas/ecc-install-config.schema.json`
- `schemas/install-modules.schema.json`
- `manifests/install-modules.json`
- `scripts/lib/install-manifests.js`
- `scripts/lib/install-targets/*.js`
- `tests/lib/install-targets.test.js`

**Example commit sequence**:
```
Add a new directory for the install target (e.g., .gemini/, .codebuddy/)
Add install/uninstall scripts and README(s)
Update schemas/ecc-install-config.schema.json and/or install-modules.schema.json
Update manifests/install-modules.json
Update scripts/lib/install-manifests.js and scripts/lib/install-targets/<target>.js
Add or update tests for the new install target
```

### Update Hooks Or Automation

Refactors or fixes hooks and automation scripts for CI, formatting, or agent workflow integration.

**Frequency**: ~3 times per month

**Steps**:
1. Edit hooks/hooks.json to update hook configuration
2. Edit or add scripts/hooks/*.js or scripts/hooks/*.sh for hook logic
3. Update or add tests for the hooks in tests/hooks/*.test.js
4. Optionally update related scripts or documentation

**Files typically involved**:
- `hooks/hooks.json`
- `scripts/hooks/*.js`
- `scripts/hooks/*.sh`
- `tests/hooks/*.test.js`

**Example commit sequence**:
```
Edit hooks/hooks.json to update hook configuration
Edit or add scripts/hooks/*.js or scripts/hooks/*.sh for hook logic
Update or add tests for the hooks in tests/hooks/*.test.js
Optionally update related scripts or documentation
```

### Documentation Sync And Localization

Updates documentation and ensures Chinese and English docs are in sync, including AGENTS.md and README files.

**Frequency**: ~3 times per month

**Steps**:
1. Edit AGENTS.md, README.md, README.zh-CN.md
2. Edit docs/zh-CN/AGENTS.md, docs/zh-CN/README.md
3. Optionally update skills/*/SKILL.md and .agents/skills/*/SKILL.md for doc improvements
4. Edit WORKING-CONTEXT.md or the-shortform-guide.md as needed

**Files typically involved**:
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`
- `docs/zh-CN/AGENTS.md`
- `docs/zh-CN/README.md`
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `WORKING-CONTEXT.md`
- `the-shortform-guide.md`

**Example commit sequence**:
```
Edit AGENTS.md, README.md, README.zh-CN.md
Edit docs/zh-CN/AGENTS.md, docs/zh-CN/README.md
Optionally update skills/*/SKILL.md and .agents/skills/*/SKILL.md for doc improvements
Edit WORKING-CONTEXT.md or the-shortform-guide.md as needed
```

### Dependency Or Ci Update

Updates dependencies or CI workflow files, often via automated bots like dependabot.

**Frequency**: ~4 times per month

**Steps**:
1. Edit .github/workflows/*.yml to update actions or workflow steps
2. Edit package.json, yarn.lock, or package-lock.json for dependency updates
3. Optionally update related scripts or lockfiles

**Files typically involved**:
- `.github/workflows/*.yml`
- `package.json`
- `yarn.lock`
- `package-lock.json`

**Example commit sequence**:
```
Edit .github/workflows/*.yml to update actions or workflow steps
Edit package.json, yarn.lock, or package-lock.json for dependency updates
Optionally update related scripts or lockfiles
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
