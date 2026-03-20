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
fix: sync catalog counts (27 agents, 114 skills, 58 commands)
```

*Commit message example*

```text
chore: remove not good practices to prevent duplicate variable names
```

*Commit message example*

```text
feat: add nuxt-4 patterns
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
fix: update type parameter
```

*Commit message example*

```text
fix: resolve p2 issues for debounced search and third party script management
```

*Commit message example*

```text
fix: resolve p2 issues
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

**Frequency**: ~17 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `manifests/*`
- `**/*.test.*`

**Example commit sequence**:
```
feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
docs(skills): align documentation-lookup with CONTRIBUTING template; add cross-harness (Codex/Cursor) skill copies
fix: address PR review — skill template (When to use, How it works, Examples), bun.lock, next build note, rust-reviewer CI note, doc-lookup privacy/uncertainty
```

### Add New Skill

Adds a new skill to the codebase, including documentation and cross-harness copies if needed.

**Frequency**: ~4 times per month

**Steps**:
1. Create or copy SKILL.md in skills/<skill-name>/SKILL.md
2. Optionally add .agents/skills/<skill-name>/SKILL.md and/or .cursor/skills/<skill-name>/SKILL.md for harness support
3. Optionally add openai.yaml in .agents/skills/<skill-name>/agents/ for Codex harness
4. Address PR review feedback by updating SKILL.md and syncing harness copies
5. Remove .agents/ duplicate if canonical version is in skills/

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`
- `.agents/skills/*/agents/openai.yaml`

**Example commit sequence**:
```
Create or copy SKILL.md in skills/<skill-name>/SKILL.md
Optionally add .agents/skills/<skill-name>/SKILL.md and/or .cursor/skills/<skill-name>/SKILL.md for harness support
Optionally add openai.yaml in .agents/skills/<skill-name>/agents/ for Codex harness
Address PR review feedback by updating SKILL.md and syncing harness copies
Remove .agents/ duplicate if canonical version is in skills/
```

### Add New Agent

Adds a new agent to the codebase, registers it in documentation and mapping files.

**Frequency**: ~2 times per month

**Steps**:
1. Create agents/<agent-name>.md with agent definition
2. Update AGENTS.md to register the new agent
3. Update README.md and docs/COMMAND-AGENT-MAP.md to reflect the new agent
4. Optionally update rules/common/agents.md if agent is language-specific

**Files typically involved**:
- `agents/*.md`
- `AGENTS.md`
- `README.md`
- `docs/COMMAND-AGENT-MAP.md`
- `rules/common/agents.md`

**Example commit sequence**:
```
Create agents/<agent-name>.md with agent definition
Update AGENTS.md to register the new agent
Update README.md and docs/COMMAND-AGENT-MAP.md to reflect the new agent
Optionally update rules/common/agents.md if agent is language-specific
```

### Add New Language Rules

Adds a new set of language rules (coding-style, hooks, patterns, security, testing) for a supported language.

**Frequency**: ~1 times per month

**Steps**:
1. Create rules/<language>/*.md (coding-style.md, hooks.md, patterns.md, security.md, testing.md)
2. Optionally update rules/common/agents.md if agents are tied to the new language

**Files typically involved**:
- `rules/*/coding-style.md`
- `rules/*/hooks.md`
- `rules/*/patterns.md`
- `rules/*/security.md`
- `rules/*/testing.md`
- `rules/common/agents.md`

**Example commit sequence**:
```
Create rules/<language>/*.md (coding-style.md, hooks.md, patterns.md, security.md, testing.md)
Optionally update rules/common/agents.md if agents are tied to the new language
```

### Sync Catalog Counts

Synchronizes the documented counts of agents, skills, and commands in AGENTS.md and README.md with the actual catalog.

**Frequency**: ~2 times per month

**Steps**:
1. Update agent and skill counts in AGENTS.md (summary, tables)
2. Update agent and skill counts in README.md (quick-start, tables)
3. Optionally update command counts if relevant

**Files typically involved**:
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Update agent and skill counts in AGENTS.md (summary, tables)
Update agent and skill counts in README.md (quick-start, tables)
Optionally update command counts if relevant
```

### Add New Command And Backing Skill

Adds a new command (CLI or agent command) and its backing skill, including documentation and review feedback.

**Frequency**: ~1 times per month

**Steps**:
1. Create commands/<command-name>.md with command documentation
2. Create skills/<skill-name>/SKILL.md as the backing implementation
3. Address PR review feedback by updating both files
4. Optionally slim the command to a delegator if the skill does most of the work

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`

**Example commit sequence**:
```
Create commands/<command-name>.md with command documentation
Create skills/<skill-name>/SKILL.md as the backing implementation
Address PR review feedback by updating both files
Optionally slim the command to a delegator if the skill does most of the work
```

### Release Preparation

Prepares the repository for a new release, updating version numbers, changelogs, and documentation.

**Frequency**: ~1 times per month

**Steps**:
1. Update version in package.json, package-lock.json, .opencode/package.json
2. Add or update CHANGELOG.md with commit summaries and highlights
3. Update README.md with release notes and catalog counts
4. Update AGENTS.md with new/changed agents
5. Update docs/zh-CN/README.md and other localized docs if needed

**Files typically involved**:
- `package.json`
- `package-lock.json`
- `.opencode/package.json`
- `CHANGELOG.md`
- `README.md`
- `AGENTS.md`
- `docs/zh-CN/README.md`

**Example commit sequence**:
```
Update version in package.json, package-lock.json, .opencode/package.json
Add or update CHANGELOG.md with commit summaries and highlights
Update README.md with release notes and catalog counts
Update AGENTS.md with new/changed agents
Update docs/zh-CN/README.md and other localized docs if needed
```

### Fix Skill Or Doc Iteration

Iterative fixes and improvements to an existing skill's documentation, often in a burst of small commits.

**Frequency**: ~4 times per month

**Steps**:
1. Edit skills/<skill-name>/SKILL.md to fix errors, clarify sections, or update examples
2. Repeat as needed for multiple small issues (may be several sequential commits)

**Files typically involved**:
- `skills/*/SKILL.md`

**Example commit sequence**:
```
Edit skills/<skill-name>/SKILL.md to fix errors, clarify sections, or update examples
Repeat as needed for multiple small issues (may be several sequential commits)
```

### Agent Or Skill Test Fix

Fixes or updates to agent/skill scripts and their corresponding test files, often in response to CI failures or platform compatibility.

**Frequency**: ~2 times per month

**Steps**:
1. Edit agent or skill script (e.g., .sh, .js) to fix the issue
2. Edit or add corresponding test file in tests/hooks/ or tests/lib/
3. Commit both changes together

**Files typically involved**:
- `skills/*/agents/*.sh`
- `skills/*/hooks/*.sh`
- `skills/*/scripts/*.sh`
- `tests/hooks/*.test.js`
- `tests/lib/*.test.js`

**Example commit sequence**:
```
Edit agent or skill script (e.g., .sh, .js) to fix the issue
Edit or add corresponding test file in tests/hooks/ or tests/lib/
Commit both changes together
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
