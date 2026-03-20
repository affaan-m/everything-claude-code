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
- `feat`
- `test`
- `docs`

### Message Guidelines

- Average message length: ~66 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-new-agent.md)
```

*Commit message example*

```text
chore: prepare v1.9.0 release
```

*Commit message example*

```text
fix(clv2): use -e instead of -d for .git check in detect-project.sh
```

*Commit message example*

```text
merge: PR #529 — feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
```

*Commit message example*

```text
docs(skills): align documentation-lookup with CONTRIBUTING template; add cross-harness (Codex/Cursor) skill copies
```

*Commit message example*

```text
feat: add everything-claude-code ECC bundle (.claude/commands/add-new-skill.md)
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

### Import Style: Mixed Style

### Export Style: Mixed Style


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

**Frequency**: ~26 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `**/*.test.*`

**Example commit sequence**:
```
docs(skills): align documentation-lookup with CONTRIBUTING template; add cross-harness (Codex/Cursor) skill copies
fix: address PR review — skill template (When to use, How it works, Examples), bun.lock, next build note, rust-reviewer CI note, doc-lookup privacy/uncertainty
Address review: register rust-reviewer in AGENTS.md and rules, add openai.yaml for Codex skills
```

### Add New Agent

Adds a new agent to the project, including documentation and registration.

**Frequency**: ~3 times per month

**Steps**:
1. Create a new agent documentation file in agents/ (e.g., agents/agent-name.md)
2. Register the agent in AGENTS.md
3. Update README.md with agent count or agent list
4. Optionally update docs/COMMAND-AGENT-MAP.md if mapping is needed

**Files typically involved**:
- `agents/*.md`
- `AGENTS.md`
- `README.md`
- `docs/COMMAND-AGENT-MAP.md`

**Example commit sequence**:
```
Create a new agent documentation file in agents/ (e.g., agents/agent-name.md)
Register the agent in AGENTS.md
Update README.md with agent count or agent list
Optionally update docs/COMMAND-AGENT-MAP.md if mapping is needed
```

### Add New Skill

Adds a new skill to the project, including documentation and agent harnesses.

**Frequency**: ~3 times per month

**Steps**:
1. Create SKILL.md in skills/skill-name/
2. Create SKILL.md in .agents/skills/skill-name/ and/or .cursor/skills/skill-name/ for cross-harness support
3. Add agents/openai.yaml in .agents/skills/skill-name/ if applicable

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.agents/skills/*/agents/openai.yaml`
- `.cursor/skills/*/SKILL.md`

**Example commit sequence**:
```
Create SKILL.md in skills/skill-name/
Create SKILL.md in .agents/skills/skill-name/ and/or .cursor/skills/skill-name/ for cross-harness support
Add agents/openai.yaml in .agents/skills/skill-name/ if applicable
```

### Add Language Rules

Adds coding, security, and testing rules for a new programming language.

**Frequency**: ~2 times per month

**Steps**:
1. Create rules/language/coding-style.md
2. Create rules/language/hooks.md
3. Create rules/language/patterns.md
4. Create rules/language/security.md
5. Create rules/language/testing.md

**Files typically involved**:
- `rules/*/coding-style.md`
- `rules/*/hooks.md`
- `rules/*/patterns.md`
- `rules/*/security.md`
- `rules/*/testing.md`

**Example commit sequence**:
```
Create rules/language/coding-style.md
Create rules/language/hooks.md
Create rules/language/patterns.md
Create rules/language/security.md
Create rules/language/testing.md
```

### Feature Bundle Ecc Command

Adds or updates ECC command documentation and configuration files.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update .claude/commands/*.md for the new command
2. Optionally update .claude/ecc-tools.json, .claude/identity.json, .claude/team/*.json, .claude/rules/*.md, .claude/research/*.md

**Files typically involved**:
- `.claude/commands/*.md`
- `.claude/ecc-tools.json`
- `.claude/identity.json`
- `.claude/team/*.json`
- `.claude/rules/*.md`
- `.claude/research/*.md`

**Example commit sequence**:
```
Add or update .claude/commands/*.md for the new command
Optionally update .claude/ecc-tools.json, .claude/identity.json, .claude/team/*.json, .claude/rules/*.md, .claude/research/*.md
```

### Catalog Count Sync

Synchronizes agent and skill counts in documentation after new additions.

**Frequency**: ~2 times per month

**Steps**:
1. Update agent and skill counts in README.md (quick-start and comparison table)
2. Update agent and skill counts in AGENTS.md (summary and project structure)

**Files typically involved**:
- `README.md`
- `AGENTS.md`

**Example commit sequence**:
```
Update agent and skill counts in README.md (quick-start and comparison table)
Update agent and skill counts in AGENTS.md (summary and project structure)
```

### Feature Development With Tests And Docs

Implements a new feature (agent, skill, or command) along with tests and documentation.

**Frequency**: ~2 times per month

**Steps**:
1. Add implementation files (e.g., agents/, skills/, commands/)
2. Add or update documentation (README.md, AGENTS.md, rules/...)
3. Add or update relevant test files in tests/

**Files typically involved**:
- `agents/*.md`
- `skills/*/SKILL.md`
- `commands/*.md`
- `README.md`
- `AGENTS.md`
- `rules/**/*.md`
- `tests/**/*.js`

**Example commit sequence**:
```
Add implementation files (e.g., agents/, skills/, commands/)
Add or update documentation (README.md, AGENTS.md, rules/...)
Add or update relevant test files in tests/
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
