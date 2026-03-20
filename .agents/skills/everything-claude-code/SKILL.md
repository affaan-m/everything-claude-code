---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits.
---

# Everything Claude Code Conventions

> Generated from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) on 2026-03-20

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
- `test`
- `feat`
- `docs`

### Message Guidelines

- Average message length: ~65 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: agent compression, inspection logic, governance hooks (#491, #485, #482)
```

*Commit message example*

```text
chore: prepare v1.9.0 release (#666)
```

*Commit message example*

```text
fix: resolve Windows CI failures and markdown lint (#667)
```

*Commit message example*

```text
docs: add Antigravity setup and usage guide (#552)
```

*Commit message example*

```text
merge: PR #529 — feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
```

*Commit message example*

```text
feat: implement --with/--without selective install flags (#679)
```

*Commit message example*

```text
feat(skills): add architecture-decision-records skill (#555)
```

*Commit message example*

```text
feat(commands): add /context-budget optimizer command (#554)
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

**Frequency**: ~22 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `manifests/*`
- `schemas/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
docs(skills): align documentation-lookup with CONTRIBUTING template; add cross-harness (Codex/Cursor) skill copies
fix: address PR review — skill template (When to use, How it works, Examples), bun.lock, next build note, rust-reviewer CI note, doc-lookup privacy/uncertainty
```

### Add New Skill

Adds a new skill to the codebase, including documentation and review fixes.

**Frequency**: ~6 times per month

**Steps**:
1. Create a new SKILL.md file under skills/<skill-name>/
2. Optionally add cross-harness copies under .agents/skills/ and/or .cursor/skills/
3. Address PR review feedback by updating SKILL.md (sections: When to Use, How It Works, Examples, etc.)
4. Sync or remove duplicate copies as needed
5. Merge after review

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`

**Example commit sequence**:
```
Create a new SKILL.md file under skills/<skill-name>/
Optionally add cross-harness copies under .agents/skills/ and/or .cursor/skills/
Address PR review feedback by updating SKILL.md (sections: When to Use, How It Works, Examples, etc.)
Sync or remove duplicate copies as needed
Merge after review
```

### Add New Agent

Registers a new agent, including documentation and catalog updates.

**Frequency**: ~3 times per month

**Steps**:
1. Create a new agent markdown file under agents/<agent-name>.md
2. Register the agent in AGENTS.md (update summary table and/or project structure)
3. Update README.md with agent count and/or agent tree
4. Optionally update docs/COMMAND-AGENT-MAP.md
5. Address review feedback and sync documentation counts

**Files typically involved**:
- `agents/*.md`
- `AGENTS.md`
- `README.md`
- `docs/COMMAND-AGENT-MAP.md`

**Example commit sequence**:
```
Create a new agent markdown file under agents/<agent-name>.md
Register the agent in AGENTS.md (update summary table and/or project structure)
Update README.md with agent count and/or agent tree
Optionally update docs/COMMAND-AGENT-MAP.md
Address review feedback and sync documentation counts
```

### Add Language Support

Introduces a new programming language to the system, including rules, agents, commands, and tests.

**Frequency**: ~2 times per month

**Steps**:
1. Add language rules under rules/<language>/(coding-style.md, hooks.md, patterns.md, security.md, testing.md)
2. Add agents for the language (e.g., <language>-reviewer.md, <language>-build-resolver.md)
3. Add commands for the language (e.g., <language>-build.md, <language>-review.md, <language>-test.md)
4. Add or update skills for language-specific patterns/testing
5. Update AGENTS.md and README.md with new agent/skill counts
6. Add or update relevant tests

**Files typically involved**:
- `rules/<language>/*.md`
- `agents/<language>-reviewer.md`
- `agents/<language>-build-resolver.md`
- `commands/<language>-build.md`
- `commands/<language>-review.md`
- `commands/<language>-test.md`
- `skills/<language>-patterns/SKILL.md`
- `skills/<language>-testing/SKILL.md`
- `AGENTS.md`
- `README.md`
- `tests/*`

**Example commit sequence**:
```
Add language rules under rules/<language>/(coding-style.md, hooks.md, patterns.md, security.md, testing.md)
Add agents for the language (e.g., <language>-reviewer.md, <language>-build-resolver.md)
Add commands for the language (e.g., <language>-build.md, <language>-review.md, <language>-test.md)
Add or update skills for language-specific patterns/testing
Update AGENTS.md and README.md with new agent/skill counts
Add or update relevant tests
```

### Update Install Manifests

Expands or refines the install system by updating component/module/profile manifests and schemas.

**Frequency**: ~2 times per month

**Steps**:
1. Edit manifests/install-components.json to add or update components (skills, agents, etc.)
2. Edit manifests/install-modules.json and/or install-profiles.json to group or profile new modules
3. Update schemas/install-components.schema.json if new family prefixes or structure are introduced
4. Update scripts/lib/install-manifests.js for new logic or validation
5. Add or update tests for install logic
6. Validate and commit changes

**Files typically involved**:
- `manifests/install-components.json`
- `manifests/install-modules.json`
- `manifests/install-profiles.json`
- `schemas/install-components.schema.json`
- `scripts/lib/install-manifests.js`
- `tests/lib/selective-install.test.js`

**Example commit sequence**:
```
Edit manifests/install-components.json to add or update components (skills, agents, etc.)
Edit manifests/install-modules.json and/or install-profiles.json to group or profile new modules
Update schemas/install-components.schema.json if new family prefixes or structure are introduced
Update scripts/lib/install-manifests.js for new logic or validation
Add or update tests for install logic
Validate and commit changes
```

### Catalog Counts And Documentation Sync

Synchronizes catalog counts and documentation to reflect the current state of agents, skills, and commands.

**Frequency**: ~3 times per month

**Steps**:
1. Update agent and skill counts in README.md and AGENTS.md (quick-start, comparison table, summary)
2. Update command counts if necessary
3. Optionally update related documentation files (e.g., docs/zh-CN/README.md, CHANGELOG.md)
4. Run and verify catalog integrity tests

**Files typically involved**:
- `README.md`
- `AGENTS.md`
- `CHANGELOG.md`
- `docs/zh-CN/README.md`
- `tests/ci/validators.test.js`

**Example commit sequence**:
```
Update agent and skill counts in README.md and AGENTS.md (quick-start, comparison table, summary)
Update command counts if necessary
Optionally update related documentation files (e.g., docs/zh-CN/README.md, CHANGELOG.md)
Run and verify catalog integrity tests
```

### Add Or Update Command

Adds a new slash command or updates an existing one, often with a corresponding skill or agent.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update command markdown file under commands/<command-name>.md
2. If needed, add or update a corresponding skill under skills/<skill-name>/SKILL.md
3. Address review feedback (e.g., fix output format, add examples, clarify steps)
4. Sync with documentation or agent registry if command is agent-specific

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`

**Example commit sequence**:
```
Create or update command markdown file under commands/<command-name>.md
If needed, add or update a corresponding skill under skills/<skill-name>/SKILL.md
Address review feedback (e.g., fix output format, add examples, clarify steps)
Sync with documentation or agent registry if command is agent-specific
```

### Ci Catalog Integrity And Test Fixes

Fixes CI failures related to catalog integrity, test flakiness, or cross-platform issues.

**Frequency**: ~2 times per month

**Steps**:
1. Update or fix test files (tests/ci/validators.test.js, other test files)
2. Update scripts or logic to resolve platform-specific issues (e.g., path normalization, environment variables)
3. Update documentation or catalog files if needed
4. Rerun CI to verify fixes

**Files typically involved**:
- `tests/ci/validators.test.js`
- `tests/hooks/*.test.js`
- `tests/lib/*.test.js`
- `tests/scripts/*.test.js`
- `scripts/lib/*.js`
- `README.md`
- `AGENTS.md`

**Example commit sequence**:
```
Update or fix test files (tests/ci/validators.test.js, other test files)
Update scripts or logic to resolve platform-specific issues (e.g., path normalization, environment variables)
Update documentation or catalog files if needed
Rerun CI to verify fixes
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
