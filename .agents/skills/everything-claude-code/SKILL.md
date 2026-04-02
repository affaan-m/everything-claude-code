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
fix(commands): address review findings on santa-loop
```

*Commit message example*

```text
feat(commands): enhance santa-loop with argus-dispatch
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
fix(tests): add USERPROFILE to repair.test.js for Windows
```

*Commit message example*

```text
fix(lint): add missing trailing newlines to remotion rules
```

*Commit message example*

```text
fix(tests): normalize path separators in CLAUDE_PLUGIN_ROOT test
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

**Frequency**: ~16 times per month

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
feat(team-builder): use `claude agents` command for agent discovery (#1021)
fix: extract inline SessionStart bootstrap to separate file (#1035)
feat: add hexagonal architecture SKILL. (#1034)
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
feat(commands): enhance santa-loop with argus-dispatch
```

### Add Or Update Skill

Adds a new skill or updates an existing skill, often with supporting documentation and sometimes related agent or command files.

**Frequency**: ~6 times per month

**Steps**:
1. Create or update skills/<skill-name>/SKILL.md (or .agents/skills/<skill-name>/SKILL.md)
2. Optionally update AGENTS.md, README.md, WORKING-CONTEXT.md, manifests/install-modules.json, or related docs
3. If the skill is agentic, may also add agents/<agent-name>.md
4. If the skill is a workflow, may also add or update commands/<command>.md

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `AGENTS.md`
- `README.md`
- `WORKING-CONTEXT.md`
- `manifests/install-modules.json`
- `agents/*.md`
- `commands/*.md`

**Example commit sequence**:
```
Create or update skills/<skill-name>/SKILL.md (or .agents/skills/<skill-name>/SKILL.md)
Optionally update AGENTS.md, README.md, WORKING-CONTEXT.md, manifests/install-modules.json, or related docs
If the skill is agentic, may also add agents/<agent-name>.md
If the skill is a workflow, may also add or update commands/<command>.md
```

### Add Or Update Command Workflow

Adds a new command workflow or updates an existing command, often with YAML frontmatter, usage, and output sections, and sometimes with related skill or agent changes.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update commands/<command-name>.md with frontmatter and documentation
2. Optionally update related skill (skills/<skill>/SKILL.md) or agent files
3. Address PR review feedback by refining command logic, usage, or documentation

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`
- `agents/*.md`

**Example commit sequence**:
```
Create or update commands/<command-name>.md with frontmatter and documentation
Optionally update related skill (skills/<skill>/SKILL.md) or agent files
Address PR review feedback by refining command logic, usage, or documentation
```

### Add Or Update Install Target

Adds or updates an install target (e.g., Gemini, CodeBuddy) with supporting scripts, schemas, and tests.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update scripts/lib/install-targets/<target>-project.js
2. Update manifests/install-modules.json and schemas/ecc-install-config.schema.json
3. Add or update install/uninstall scripts under .<target>/
4. Update scripts/lib/install-manifests.js and registry.js as needed
5. Add or update tests/lib/install-targets.test.js

**Files typically involved**:
- `scripts/lib/install-targets/*.js`
- `manifests/install-modules.json`
- `schemas/ecc-install-config.schema.json`
- `schemas/install-modules.schema.json`
- `.*/install.*`
- `.*/uninstall.*`
- `scripts/lib/install-manifests.js`
- `scripts/lib/install-targets/registry.js`
- `tests/lib/install-targets.test.js`

**Example commit sequence**:
```
Create or update scripts/lib/install-targets/<target>-project.js
Update manifests/install-modules.json and schemas/ecc-install-config.schema.json
Add or update install/uninstall scripts under .<target>/
Update scripts/lib/install-manifests.js and registry.js as needed
Add or update tests/lib/install-targets.test.js
```

### Ci Or Hook Hardening And Fix

Improves or fixes CI workflows, hook scripts, or related validation logic to ensure reliability, portability, and security.

**Frequency**: ~4 times per month

**Steps**:
1. Update hooks/hooks.json and/or scripts/hooks/*.js for logic, race conditions, or portability
2. Update or add related tests under tests/hooks/ or tests/scripts/
3. Update CI workflow files under .github/workflows/ as needed
4. Update package.json, yarn.lock, or package-lock.json if dependencies are involved

**Files typically involved**:
- `hooks/hooks.json`
- `scripts/hooks/*.js`
- `tests/hooks/*.test.js`
- `tests/scripts/*.test.js`
- `.github/workflows/*.yml`
- `package.json`
- `yarn.lock`
- `package-lock.json`

**Example commit sequence**:
```
Update hooks/hooks.json and/or scripts/hooks/*.js for logic, race conditions, or portability
Update or add related tests under tests/hooks/ or tests/scripts/
Update CI workflow files under .github/workflows/ as needed
Update package.json, yarn.lock, or package-lock.json if dependencies are involved
```

### Documentation And Guidance Update

Updates documentation, guidance, or repo-level docs to reflect new workflows, skills, or best practices.

**Frequency**: ~3 times per month

**Steps**:
1. Update README.md, AGENTS.md, WORKING-CONTEXT.md, or docs/ files
2. Update or add .claude-plugin/README.md, .codex-plugin/README.md, or similar plugin docs
3. Update or add troubleshooting, guidance, or classification docs

**Files typically involved**:
- `README.md`
- `AGENTS.md`
- `WORKING-CONTEXT.md`
- `docs/**/*.md`
- `.claude-plugin/README.md`
- `.codex-plugin/README.md`
- `.agents/skills/*/SKILL.md`

**Example commit sequence**:
```
Update README.md, AGENTS.md, WORKING-CONTEXT.md, or docs/ files
Update or add .claude-plugin/README.md, .codex-plugin/README.md, or similar plugin docs
Update or add troubleshooting, guidance, or classification docs
```

### Dependency Bump Via Dependabot

Automated update of dependencies in package.json, yarn.lock, or CI workflow actions via Dependabot.

**Frequency**: ~3 times per month

**Steps**:
1. Update package.json and yarn.lock (for JS deps) or .github/workflows/*.yml (for GitHub Actions)
2. Commit with a standardized message referencing the dependency and version
3. Co-authored-by: dependabot[bot]

**Files typically involved**:
- `package.json`
- `yarn.lock`
- `.github/workflows/*.yml`

**Example commit sequence**:
```
Update package.json and yarn.lock (for JS deps) or .github/workflows/*.yml (for GitHub Actions)
Commit with a standardized message referencing the dependency and version
Co-authored-by: dependabot[bot]
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
