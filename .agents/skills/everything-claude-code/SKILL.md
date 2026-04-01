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

- Average message length: ~56 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
chore: update catalog counts for argus-design-review skill
```

*Commit message example*

```text
fix(skills): address review findings on argus-design-review
```

*Commit message example*

```text
feat(skills): add argus-design-review — three-tier design doc review
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
feat: add connected operator workflow skills
```

*Commit message example*

```text
fix: dedupe managed hooks by semantic identity
```

*Commit message example*

```text
docs: shift repo guidance to skills-first workflows
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
- `skills/remotion-video-creation/rules/assets/*`
- `.opencode/*`
- `.opencode/plugins/*`
- `**/*.test.*`

**Example commit sequence**:
```
fix: CI fixes, security audit, remotion skill, lead-intelligence, npm audit (#1039)
chore(deps-dev): bump globals in the minor-and-patch group (#1062)
chore(deps): bump actions/github-script from 7.1.0 to 8.0.0 (#1059)
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
feat(skills): add argus-design-review — three-tier design doc review
```

### Add New Skill

Adds a new skill to the system, including documentation and registration in catalogs.

**Frequency**: ~6 times per month

**Steps**:
1. Create or update a SKILL.md file under skills/<skill-name>/SKILL.md
2. Optionally add supporting files (agents, rules, etc.) under the skill directory
3. Update manifests/install-modules.json to register the skill in the installable modules
4. Update AGENTS.md and/or README.md to reflect the new skill count or catalog
5. If necessary, update docs/zh-CN/AGENTS.md and README.zh-CN.md for localization

**Files typically involved**:
- `skills/*/SKILL.md`
- `manifests/install-modules.json`
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`
- `docs/zh-CN/AGENTS.md`
- `docs/zh-CN/README.md`

**Example commit sequence**:
```
Create or update a SKILL.md file under skills/<skill-name>/SKILL.md
Optionally add supporting files (agents, rules, etc.) under the skill directory
Update manifests/install-modules.json to register the skill in the installable modules
Update AGENTS.md and/or README.md to reflect the new skill count or catalog
If necessary, update docs/zh-CN/AGENTS.md and README.zh-CN.md for localization
```

### Add New Command

Introduces a new workflow or automation command, often for agentic or review flows.

**Frequency**: ~3 times per month

**Steps**:
1. Create a new markdown file under commands/ (e.g., commands/<command-name>.md)
2. Document the command with YAML frontmatter, Purpose, Usage, and Output sections
3. Optionally update AGENTS.md or README.md to reference the new command
4. If the command is part of a workflow, add supporting scripts or shell orchestrators

**Files typically involved**:
- `commands/*.md`
- `AGENTS.md`
- `README.md`
- `scripts/**/*.sh`

**Example commit sequence**:
```
Create a new markdown file under commands/ (e.g., commands/<command-name>.md)
Document the command with YAML frontmatter, Purpose, Usage, and Output sections
Optionally update AGENTS.md or README.md to reference the new command
If the command is part of a workflow, add supporting scripts or shell orchestrators
```

### Add New Agent

Registers a new agent persona or tool, including prompt files and catalog updates.

**Frequency**: ~2 times per month

**Steps**:
1. Create a new agent definition markdown file under agents/ (e.g., agents/<agent-name>.md)
2. If OpenCode, add prompt files under .opencode/prompts/agents/
3. Update .opencode/opencode.json or other agent catalogs to register the agent
4. Update AGENTS.md to reflect the new agent

**Files typically involved**:
- `agents/*.md`
- `.opencode/prompts/agents/*.txt`
- `.opencode/opencode.json`
- `AGENTS.md`

**Example commit sequence**:
```
Create a new agent definition markdown file under agents/ (e.g., agents/<agent-name>.md)
If OpenCode, add prompt files under .opencode/prompts/agents/
Update .opencode/opencode.json or other agent catalogs to register the agent
Update AGENTS.md to reflect the new agent
```

### Install Target Adaptation

Adds support for a new install target (IDE, platform, or plugin), including install scripts and schema updates.

**Frequency**: ~2 times per month

**Steps**:
1. Add a new directory for the install target (e.g., .codebuddy/, .gemini/)
2. Create install/uninstall scripts and README files in the new directory
3. Update manifests/install-modules.json to include the new target
4. Update schemas/ecc-install-config.schema.json and/or schemas/install-modules.schema.json
5. Update scripts/lib/install-manifests.js and scripts/lib/install-targets/<target>.js
6. Update tests/lib/install-targets.test.js to cover the new target

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
Add a new directory for the install target (e.g., .codebuddy/, .gemini/)
Create install/uninstall scripts and README files in the new directory
Update manifests/install-modules.json to include the new target
Update schemas/ecc-install-config.schema.json and/or schemas/install-modules.schema.json
Update scripts/lib/install-manifests.js and scripts/lib/install-targets/<target>.js
Update tests/lib/install-targets.test.js to cover the new target
```

### Update Catalog And Documentation

Synchronizes skill/agent/command counts and documentation across multiple catalog and readme files.

**Frequency**: ~4 times per month

**Steps**:
1. Update AGENTS.md, README.md, and README.zh-CN.md with new counts or listings
2. Update docs/zh-CN/AGENTS.md and docs/zh-CN/README.md for localization
3. Optionally update WORKING-CONTEXT.md and other catalog scripts (e.g., scripts/ci/catalog.js)
4. Update tests/ci/validators.test.js to ensure catalog consistency

**Files typically involved**:
- `AGENTS.md`
- `README.md`
- `README.zh-CN.md`
- `docs/zh-CN/AGENTS.md`
- `docs/zh-CN/README.md`
- `WORKING-CONTEXT.md`
- `scripts/ci/catalog.js`
- `tests/ci/validators.test.js`

**Example commit sequence**:
```
Update AGENTS.md, README.md, and README.zh-CN.md with new counts or listings
Update docs/zh-CN/AGENTS.md and docs/zh-CN/README.md for localization
Optionally update WORKING-CONTEXT.md and other catalog scripts (e.g., scripts/ci/catalog.js)
Update tests/ci/validators.test.js to ensure catalog consistency
```

### Refactor Or Migrate Commands To Skills

Migrates legacy command documentation or logic into the new skills-based architecture.

**Frequency**: ~2 times per month

**Steps**:
1. Move or rewrite command markdown files from commands/ to skills/<skill>/SKILL.md
2. Update AGENTS.md, README.md, and WORKING-CONTEXT.md to reflect the migration
3. Update manifests/install-modules.json to register the new or refactored skill
4. Remove or update legacy command files as needed

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`
- `AGENTS.md`
- `README.md`
- `WORKING-CONTEXT.md`
- `manifests/install-modules.json`

**Example commit sequence**:
```
Move or rewrite command markdown files from commands/ to skills/<skill>/SKILL.md
Update AGENTS.md, README.md, and WORKING-CONTEXT.md to reflect the migration
Update manifests/install-modules.json to register the new or refactored skill
Remove or update legacy command files as needed
```

### Ci Workflow Update

Updates CI/CD workflows, often for dependency bumps or security fixes.

**Frequency**: ~4 times per month

**Steps**:
1. Update .github/workflows/*.yml files for CI, release, or maintenance
2. Update package.json, yarn.lock, or package-lock.json for dependency changes
3. Optionally update .github/dependabot.yml for automation

**Files typically involved**:
- `.github/workflows/*.yml`
- `package.json`
- `yarn.lock`
- `package-lock.json`
- `.github/dependabot.yml`

**Example commit sequence**:
```
Update .github/workflows/*.yml files for CI, release, or maintenance
Update package.json, yarn.lock, or package-lock.json for dependency changes
Optionally update .github/dependabot.yml for automation
```

### Add Or Update Hook Or Script

Adds or modifies automation hooks and supporting scripts, often to improve workflow automation or fix issues.

**Frequency**: ~3 times per month

**Steps**:
1. Edit or add hook configuration in hooks/hooks.json
2. Add or update supporting scripts in scripts/hooks/
3. Update or add relevant tests in tests/hooks/
4. Optionally update documentation or WORKING-CONTEXT.md

**Files typically involved**:
- `hooks/hooks.json`
- `scripts/hooks/*.js`
- `tests/hooks/*.js`
- `WORKING-CONTEXT.md`

**Example commit sequence**:
```
Edit or add hook configuration in hooks/hooks.json
Add or update supporting scripts in scripts/hooks/
Update or add relevant tests in tests/hooks/
Optionally update documentation or WORKING-CONTEXT.md
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
