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
feat: add nuxt 4 patterns skill
```

*Commit message example*

```text
fix: stabilize windows project metadata assertions
```

*Commit message example*

```text
chore(deps-dev): bump flatted (#675)
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
feat: agent description compression with lazy loading (#696)
```

*Commit message example*

```text
fix(tests): resolve Windows CI test failures (#701)
```

*Commit message example*

```text
fix: normalize bash metadata paths on windows
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

### Database Migration

Database schema changes with migration files

**Frequency**: ~2 times per month

**Steps**:
1. Create migration file
2. Update schema definitions
3. Generate/update types

**Files typically involved**:
- `**/schema.*`
- `migrations/*`

**Example commit sequence**:
```
feat: implement --with/--without selective install flags (#679)
fix: sync catalog counts with filesystem (27 agents, 113 skills, 58 commands) (#693)
feat(rules): add Rust language rules (rebased #660) (#686)
```

### Feature Development

Standard feature implementation workflow

**Frequency**: ~20 times per month

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

Adds a new skill to the system, including documentation and sometimes scripts.

**Frequency**: ~4 times per month

**Steps**:
1. Create a new directory under skills/ with the skill name.
2. Add SKILL.md with full documentation of the skill.
3. Optionally add scripts/ subdirectory with supporting scripts.
4. Optionally add .agents/skills/ and/or .cursor/skills/ copies for cross-harness support.
5. Update AGENTS.md and/or README.md skill counts if necessary.

**Files typically involved**:
- `skills/*/SKILL.md`
- `skills/*/scripts/*.sh`
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Create a new directory under skills/ with the skill name.
Add SKILL.md with full documentation of the skill.
Optionally add scripts/ subdirectory with supporting scripts.
Optionally add .agents/skills/ and/or .cursor/skills/ copies for cross-harness support.
Update AGENTS.md and/or README.md skill counts if necessary.
```

### Add New Agent

Adds a new agent to the system, with documentation and catalog registration.

**Frequency**: ~2 times per month

**Steps**:
1. Create a new agent markdown file under agents/.
2. Update AGENTS.md to include the new agent in the agent table.
3. Update README.md agent counts and/or agent tree.
4. Optionally update docs/COMMAND-AGENT-MAP.md if mapping is relevant.

**Files typically involved**:
- `agents/*.md`
- `AGENTS.md`
- `README.md`
- `docs/COMMAND-AGENT-MAP.md`

**Example commit sequence**:
```
Create a new agent markdown file under agents/.
Update AGENTS.md to include the new agent in the agent table.
Update README.md agent counts and/or agent tree.
Optionally update docs/COMMAND-AGENT-MAP.md if mapping is relevant.
```

### Add Language Rules

Adds a new programming language's rule set (coding style, hooks, patterns, security, testing).

**Frequency**: ~1 times per month

**Steps**:
1. Create a new directory under rules/ with the language name.
2. Add coding-style.md, hooks.md, patterns.md, security.md, and testing.md to the new directory.
3. Optionally update rules/common/agents.md if new agents are associated.

**Files typically involved**:
- `rules/*/coding-style.md`
- `rules/*/hooks.md`
- `rules/*/patterns.md`
- `rules/*/security.md`
- `rules/*/testing.md`
- `rules/common/agents.md`

**Example commit sequence**:
```
Create a new directory under rules/ with the language name.
Add coding-style.md, hooks.md, patterns.md, security.md, and testing.md to the new directory.
Optionally update rules/common/agents.md if new agents are associated.
```

### Sync Catalog Counts

Synchronizes documented counts of agents, skills, and commands in AGENTS.md and README.md with the actual filesystem/catalog.

**Frequency**: ~2 times per month

**Steps**:
1. Count agents, skills, and commands in the codebase.
2. Update AGENTS.md summary and agent table with correct numbers.
3. Update README.md quick-start, comparison table, and summary counts.
4. Optionally update other documentation referencing counts.

**Files typically involved**:
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Count agents, skills, and commands in the codebase.
Update AGENTS.md summary and agent table with correct numbers.
Update README.md quick-start, comparison table, and summary counts.
Optionally update other documentation referencing counts.
```

### Add New Command

Adds a new command to the system, often with a corresponding backing skill.

**Frequency**: ~1 times per month

**Steps**:
1. Create a new markdown file under commands/ describing the command.
2. Optionally create a corresponding skill under skills/ with SKILL.md.
3. Update README.md and AGENTS.md command counts if needed.

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`
- `README.md`
- `AGENTS.md`

**Example commit sequence**:
```
Create a new markdown file under commands/ describing the command.
Optionally create a corresponding skill under skills/ with SKILL.md.
Update README.md and AGENTS.md command counts if needed.
```

### Fix Windows Ci Tests

Applies targeted fixes to tests and scripts to ensure Windows CI compatibility, often after failures are detected.

**Frequency**: ~2 times per month

**Steps**:
1. Identify failing test files (usually under tests/ci/ or tests/hooks/).
2. Update test code to skip or adapt for Windows (e.g., add guards, handle CRLF, adjust env vars).
3. Update scripts or utilities if needed for cross-platform compatibility.
4. Commit with a message referencing Windows CI/test stabilization.

**Files typically involved**:
- `tests/ci/*.js`
- `tests/hooks/*.test.js`
- `tests/integration/*.test.js`
- `tests/lib/*.test.js`
- `scripts/lib/*.js`

**Example commit sequence**:
```
Identify failing test files (usually under tests/ci/ or tests/hooks/).
Update test code to skip or adapt for Windows (e.g., add guards, handle CRLF, adjust env vars).
Update scripts or utilities if needed for cross-platform compatibility.
Commit with a message referencing Windows CI/test stabilization.
```

### Add Cross Harness Skill Copies

Adds or updates skill copies for different harnesses (Codex, Cursor, .agents/, .cursor/).

**Frequency**: ~1 times per month

**Steps**:
1. Copy or create SKILL.md in .agents/skills/ and/or .cursor/skills/ for the new or updated skill.
2. Add or update openai.yaml in the same directories if required.
3. Ensure the canonical version in skills/ is up to date.
4. Optionally update rules/common/agents.md if agents are involved.

**Files typically involved**:
- `.agents/skills/*/SKILL.md`
- `.agents/skills/*/agents/openai.yaml`
- `.cursor/skills/*/SKILL.md`
- `skills/*/SKILL.md`

**Example commit sequence**:
```
Copy or create SKILL.md in .agents/skills/ and/or .cursor/skills/ for the new or updated skill.
Add or update openai.yaml in the same directories if required.
Ensure the canonical version in skills/ is up to date.
Optionally update rules/common/agents.md if agents are involved.
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
