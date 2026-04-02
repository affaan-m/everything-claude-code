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
fix: address all review feedback on agent definitions
```

*Commit message example*

```text
feat(agents): add 17 specialized agent definitions with model routing
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
feat: expand lead intelligence outreach channels
```

*Commit message example*

```text
feat: add connected operator workflow skills
```

*Commit message example*

```text
fix: dedupe managed hooks by semantic identity
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
feat: expand lead intelligence outreach channels
```

### Add New Agent Definitions

Adds one or more new agent definitions, typically for specialized workflows or pipelines, by creating new agent markdown files with frontmatter and routing/model/tool configuration.

**Frequency**: ~2 times per month

**Steps**:
1. Create one or more new markdown files in agents/ (e.g., agents/agent-name.md) with frontmatter specifying tools, model, and behavior.
2. Optionally update agent catalogs or routing files (e.g., dispatch.md, opencode.json) to register the new agents.
3. Document escalation paths, tool restrictions, and output protocols in the agent files.
4. If part of a pipeline, add orchestrator skill or workflow documentation.

**Files typically involved**:
- `agents/*.md`
- `skills/*/SKILL.md`
- `agents/dispatch.md`
- `.opencode/opencode.json`

**Example commit sequence**:
```
Create one or more new markdown files in agents/ (e.g., agents/agent-name.md) with frontmatter specifying tools, model, and behavior.
Optionally update agent catalogs or routing files (e.g., dispatch.md, opencode.json) to register the new agents.
Document escalation paths, tool restrictions, and output protocols in the agent files.
If part of a pipeline, add orchestrator skill or workflow documentation.
```

### Add Or Update Skill

Adds a new skill or updates an existing one, often with supporting rules, documentation, and catalog registration.

**Frequency**: ~3 times per month

**Steps**:
1. Create or edit skills/skill-name/SKILL.md with documentation and workflow details.
2. If the skill has subcomponents (e.g., rules), add or update files in skills/skill-name/rules/.
3. Update manifests/install-modules.json to register the new skill under the appropriate module.
4. Update AGENTS.md and/or README.md to reflect the new skill count or description.
5. Sync or validate the skill catalog if required.

**Files typically involved**:
- `skills/*/SKILL.md`
- `skills/*/rules/*.md`
- `manifests/install-modules.json`
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Create or edit skills/skill-name/SKILL.md with documentation and workflow details.
If the skill has subcomponents (e.g., rules), add or update files in skills/skill-name/rules/.
Update manifests/install-modules.json to register the new skill under the appropriate module.
Update AGENTS.md and/or README.md to reflect the new skill count or description.
Sync or validate the skill catalog if required.
```

### Add Or Extend Command Workflow

Introduces new command files or extends existing ones, often for new workflows, PRP pipelines, or review loops.

**Frequency**: ~2 times per month

**Steps**:
1. Create new command markdown files in commands/ (e.g., commands/command-name.md) with YAML frontmatter and detailed usage.
2. If extending, update existing command files with new sections or features.
3. Document usage, output, and integration points in the command files.
4. Optionally update AGENTS.md or README.md to reference the new/updated commands.

**Files typically involved**:
- `commands/*.md`
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Create new command markdown files in commands/ (e.g., commands/command-name.md) with YAML frontmatter and detailed usage.
If extending, update existing command files with new sections or features.
Document usage, output, and integration points in the command files.
Optionally update AGENTS.md or README.md to reference the new/updated commands.
```

### Refactor Or Migrate Commands To Skills

Refactors legacy command files by collapsing their logic into skills, updating documentation and catalogs accordingly.

**Frequency**: ~1 times per month

**Steps**:
1. Move or merge logic from commands/*.md into skills/*/SKILL.md.
2. Update AGENTS.md, README.md, and WORKING-CONTEXT.md to reference the new skill-based workflow.
3. Remove or deprecate the old command files.
4. Update manifests/install-modules.json if skill registration changes.

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`
- `AGENTS.md`
- `README.md`
- `WORKING-CONTEXT.md`
- `manifests/install-modules.json`

**Example commit sequence**:
```
Move or merge logic from commands/*.md into skills/*/SKILL.md.
Update AGENTS.md, README.md, and WORKING-CONTEXT.md to reference the new skill-based workflow.
Remove or deprecate the old command files.
Update manifests/install-modules.json if skill registration changes.
```

### Batch Update Agent Or Skill Metadata

Performs a batch update across multiple agent or skill files to normalize metadata, fix frontmatter, or address review feedback.

**Frequency**: ~1 times per month

**Steps**:
1. Edit multiple agents/*.md or skills/*/SKILL.md files to update frontmatter or metadata fields.
2. Apply normalization (e.g., model aliases, tool lists, output criteria) as needed.
3. Optionally update related documentation or catalogs to reflect changes.

**Files typically involved**:
- `agents/*.md`
- `skills/*/SKILL.md`

**Example commit sequence**:
```
Edit multiple agents/*.md or skills/*/SKILL.md files to update frontmatter or metadata fields.
Apply normalization (e.g., model aliases, tool lists, output criteria) as needed.
Optionally update related documentation or catalogs to reflect changes.
```

### Add New Install Target Or Adapter

Adds a new install target (e.g., plugin, integration, or IDE adapter) with supporting scripts, schemas, and tests.

**Frequency**: ~1 times per month

**Steps**:
1. Create a new directory for the install target (e.g., .codebuddy/, .gemini/).
2. Add install/uninstall scripts and README documentation.
3. Update manifests/install-modules.json and schemas/ecc-install-config.schema.json to register the new target.
4. Add or update scripts/lib/install-targets/*.js for the new adapter logic.
5. Update or add tests for the new install target.

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
Create a new directory for the install target (e.g., .codebuddy/, .gemini/).
Add install/uninstall scripts and README documentation.
Update manifests/install-modules.json and schemas/ecc-install-config.schema.json to register the new target.
Add or update scripts/lib/install-targets/*.js for the new adapter logic.
Update or add tests for the new install target.
```

### Update Or Harden Hooks And Automation

Updates or hardens hook scripts and configuration for formatting, typechecking, session management, or audit logging.

**Frequency**: ~2 times per month

**Steps**:
1. Edit hooks/hooks.json to change hook configuration or add/remove hooks.
2. Update or add scripts/hooks/*.js or shell scripts for hook logic.
3. Update or add tests for hook behavior.
4. Optionally update related documentation or CI scripts.

**Files typically involved**:
- `hooks/hooks.json`
- `scripts/hooks/*.js`
- `tests/hooks/*.test.js`

**Example commit sequence**:
```
Edit hooks/hooks.json to change hook configuration or add/remove hooks.
Update or add scripts/hooks/*.js or shell scripts for hook logic.
Update or add tests for hook behavior.
Optionally update related documentation or CI scripts.
```

### Dependency Bump Via Dependabot

Automated workflow to update dependencies (npm packages or GitHub Actions) via dependabot, updating manifests and lockfiles.

**Frequency**: ~5 times per month

**Steps**:
1. Update version in package.json, yarn.lock, or relevant workflow YAML files.
2. Commit with a standardized message referencing the dependency and version.
3. Co-author with dependabot and optionally a maintainer.

**Files typically involved**:
- `package.json`
- `yarn.lock`
- `package-lock.json`
- `.github/workflows/*.yml`

**Example commit sequence**:
```
Update version in package.json, yarn.lock, or relevant workflow YAML files.
Commit with a standardized message referencing the dependency and version.
Co-author with dependabot and optionally a maintainer.
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
