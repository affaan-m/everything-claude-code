---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits.
---

# Everything Claude Code Conventions

> Generated from [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) on 2026-03-24

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
feat: add install catalog and project config autodetection
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
fix(tests): resolve Windows CI test failures (#701)
```

*Commit message example*

```text
fix: normalize bash metadata paths on windows
```

*Commit message example*

```text
fix: stabilize windows hook tests
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

Adds a new skill to the system, including its documentation and, if needed, cross-harness copies for Codex/Cursor/Antigravity compatibility.

**Frequency**: ~4 times per month

**Steps**:
1. Create a new SKILL.md file under skills/<skill-name>/SKILL.md with full documentation.
2. Optionally, add a condensed or harness-specific copy under .agents/skills/<skill-name>/SKILL.md and/or .cursor/skills/<skill-name>/SKILL.md.
3. If the skill requires agent harness support, add openai.yaml or similar config under .agents/skills/<skill-name>/agents/openai.yaml.
4. Address PR review feedback by updating SKILL.md and harness copies as needed.
5. Remove .agents/ duplicate and keep canonical in skills/ if required by repo convention.

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`
- `.agents/skills/*/agents/openai.yaml`

**Example commit sequence**:
```
Create a new SKILL.md file under skills/<skill-name>/SKILL.md with full documentation.
Optionally, add a condensed or harness-specific copy under .agents/skills/<skill-name>/SKILL.md and/or .cursor/skills/<skill-name>/SKILL.md.
If the skill requires agent harness support, add openai.yaml or similar config under .agents/skills/<skill-name>/agents/openai.yaml.
Address PR review feedback by updating SKILL.md and harness copies as needed.
Remove .agents/ duplicate and keep canonical in skills/ if required by repo convention.
```

### Add New Agent

Adds a new agent to the platform, including agent definition and registration in documentation/catalog.

**Frequency**: ~2 times per month

**Steps**:
1. Create a new agent definition markdown file under agents/<agent-name>.md.
2. Register the agent in AGENTS.md and/or README.md (agent table, summary, or project structure).
3. If relevant, update docs/COMMAND-AGENT-MAP.md or rules/common/agents.md.
4. Address PR review feedback and update documentation counts if necessary.

**Files typically involved**:
- `agents/*.md`
- `AGENTS.md`
- `README.md`
- `docs/COMMAND-AGENT-MAP.md`
- `rules/common/agents.md`

**Example commit sequence**:
```
Create a new agent definition markdown file under agents/<agent-name>.md.
Register the agent in AGENTS.md and/or README.md (agent table, summary, or project structure).
If relevant, update docs/COMMAND-AGENT-MAP.md or rules/common/agents.md.
Address PR review feedback and update documentation counts if necessary.
```

### Add Language Ruleset

Adds a new set of language-specific rules (coding style, hooks, patterns, security, testing) to the rules directory.

**Frequency**: ~2 times per month

**Steps**:
1. Create a new directory under rules/<language>/ if it does not exist.
2. Add coding-style.md, hooks.md, patterns.md, security.md, and testing.md files to the directory.
3. Address PR review feedback and revise as needed.

**Files typically involved**:
- `rules/*/coding-style.md`
- `rules/*/hooks.md`
- `rules/*/patterns.md`
- `rules/*/security.md`
- `rules/*/testing.md`

**Example commit sequence**:
```
Create a new directory under rules/<language>/ if it does not exist.
Add coding-style.md, hooks.md, patterns.md, security.md, and testing.md files to the directory.
Address PR review feedback and revise as needed.
```

### Add New Command With Backing Skill

Adds a new command to the system, along with a backing skill that implements its logic.

**Frequency**: ~1 times per month

**Steps**:
1. Create a new command markdown file under commands/<command-name>.md.
2. Create a new skill under skills/<skill-name>/SKILL.md that implements the command logic.
3. Iterate on both files to address review feedback and ensure consistency.
4. Update command/skill counts in README.md and AGENTS.md if needed.

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`
- `README.md`
- `AGENTS.md`

**Example commit sequence**:
```
Create a new command markdown file under commands/<command-name>.md.
Create a new skill under skills/<skill-name>/SKILL.md that implements the command logic.
Iterate on both files to address review feedback and ensure consistency.
Update command/skill counts in README.md and AGENTS.md if needed.
```

### Sync Catalog Counts In Documentation

Synchronizes the documented counts of agents, skills, and commands in README.md and AGENTS.md with the actual repository state.

**Frequency**: ~4 times per month

**Steps**:
1. Update agent, skill, and command counts in README.md (quick-start, comparison table, FAQ, etc.).
2. Update counts in AGENTS.md (summary, project structure, agent table).
3. Optionally, update related documentation in docs/zh-CN/README.md or CHANGELOG.md.
4. Address any catalog validation or CI errors caused by count mismatches.

**Files typically involved**:
- `README.md`
- `AGENTS.md`
- `docs/zh-CN/README.md`
- `CHANGELOG.md`

**Example commit sequence**:
```
Update agent, skill, and command counts in README.md (quick-start, comparison table, FAQ, etc.).
Update counts in AGENTS.md (summary, project structure, agent table).
Optionally, update related documentation in docs/zh-CN/README.md or CHANGELOG.md.
Address any catalog validation or CI errors caused by count mismatches.
```

### Add Or Update Hook Tests

Adds or updates test files for hooks and scripts, often in response to new features, bug fixes, or platform compatibility issues (e.g., Windows).

**Frequency**: ~6 times per month

**Steps**:
1. Create or update test files under tests/hooks/*.test.js, tests/lib/*.test.js, or tests/scripts/*.test.js.
2. Implement tests for new or modified hooks/scripts, including platform-specific logic as needed.
3. Iterate on tests to address review feedback or CI failures.
4. Optionally, update related scripts or hooks to ensure testability.

**Files typically involved**:
- `tests/hooks/*.test.js`
- `tests/lib/*.test.js`
- `tests/scripts/*.test.js`

**Example commit sequence**:
```
Create or update test files under tests/hooks/*.test.js, tests/lib/*.test.js, or tests/scripts/*.test.js.
Implement tests for new or modified hooks/scripts, including platform-specific logic as needed.
Iterate on tests to address review feedback or CI failures.
Optionally, update related scripts or hooks to ensure testability.
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
