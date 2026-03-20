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
feat: add everything-claude-code ECC bundle (.claude/commands/add-new-skill.md)
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
feat: add everything-claude-code ECC bundle (.claude/commands/add-new-agent.md)
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

**Frequency**: ~24 times per month

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

Adds a new skill to the project, including documentation and implementation.

**Frequency**: ~5 times per month

**Steps**:
1. Create a new SKILL.md file under skills/<skill-name>/SKILL.md
2. Optionally add agent YAML under .agents/skills/<skill-name>/agents/openai.yaml
3. Optionally add cross-harness skill docs under .agents/skills/ and .cursor/skills/
4. Register or update related documentation if needed

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.agents/skills/*/agents/openai.yaml`
- `.cursor/skills/*/SKILL.md`

**Example commit sequence**:
```
Create a new SKILL.md file under skills/<skill-name>/SKILL.md
Optionally add agent YAML under .agents/skills/<skill-name>/agents/openai.yaml
Optionally add cross-harness skill docs under .agents/skills/ and .cursor/skills/
Register or update related documentation if needed
```

### Add New Agent

Adds a new agent to the project, including documentation and registration.

**Frequency**: ~3 times per month

**Steps**:
1. Create a new agent markdown file under agents/<agent-name>.md
2. Register the agent in AGENTS.md
3. Optionally update README.md and docs/COMMAND-AGENT-MAP.md
4. Optionally add agent TOML config under .codex/agents/

**Files typically involved**:
- `agents/*.md`
- `AGENTS.md`
- `README.md`
- `docs/COMMAND-AGENT-MAP.md`
- `.codex/agents/*.toml`

**Example commit sequence**:
```
Create a new agent markdown file under agents/<agent-name>.md
Register the agent in AGENTS.md
Optionally update README.md and docs/COMMAND-AGENT-MAP.md
Optionally add agent TOML config under .codex/agents/
```

### Add Language Support

Adds support for a new programming language, including rules, agents, commands, and tests.

**Frequency**: ~1 times per month

**Steps**:
1. Add language rules under rules/<language>/ (coding-style.md, hooks.md, patterns.md, security.md, testing.md)
2. Add new agents for the language under agents/<language>-reviewer.md and/or agents/<language>-build-resolver.md
3. Add new commands for the language under commands/<language>-*.md
4. Add or update tests for new hooks or features

**Files typically involved**:
- `rules/*/*.md`
- `agents/*-reviewer.md`
- `agents/*-build-resolver.md`
- `commands/*-*.md`
- `tests/hooks/*.test.js`

**Example commit sequence**:
```
Add language rules under rules/<language>/ (coding-style.md, hooks.md, patterns.md, security.md, testing.md)
Add new agents for the language under agents/<language>-reviewer.md and/or agents/<language>-build-resolver.md
Add new commands for the language under commands/<language>-*.md
Add or update tests for new hooks or features
```

### Catalog Count Update

Synchronizes agent/skill/command counts in documentation and CI to match the actual catalog.

**Frequency**: ~2 times per month

**Steps**:
1. Update agent and skill counts in README.md and AGENTS.md
2. Update catalog count checks in CI scripts and tests
3. Update package.json or related metadata if needed

**Files typically involved**:
- `README.md`
- `AGENTS.md`
- `package.json`
- `scripts/ci/catalog.js`
- `tests/ci/validators.test.js`

**Example commit sequence**:
```
Update agent and skill counts in README.md and AGENTS.md
Update catalog count checks in CI scripts and tests
Update package.json or related metadata if needed
```

### Fix Observer Orchestrator Hook

Implements or fixes observer/orchestrator logic, including shell scripts and corresponding tests.

**Frequency**: ~2 times per month

**Steps**:
1. Modify shell scripts under skills/continuous-learning-v2/hooks/ or agents/
2. Update or add corresponding tests under tests/hooks/
3. Document or reference the fix in commit messages

**Files typically involved**:
- `skills/continuous-learning-v2/hooks/*.sh`
- `skills/continuous-learning-v2/agents/*.sh`
- `skills/continuous-learning-v2/scripts/*.sh`
- `tests/hooks/*.test.js`

**Example commit sequence**:
```
Modify shell scripts under skills/continuous-learning-v2/hooks/ or agents/
Update or add corresponding tests under tests/hooks/
Document or reference the fix in commit messages
```

### Update Install Manifests

Updates install manifests to include new or missing skills/modules/profiles.

**Frequency**: ~1 times per month

**Steps**:
1. Edit manifests/install-components.json to add new skills/components
2. Edit manifests/install-modules.json to group new skills into modules
3. Edit manifests/install-profiles.json to update install profiles

**Files typically involved**:
- `manifests/install-components.json`
- `manifests/install-modules.json`
- `manifests/install-profiles.json`

**Example commit sequence**:
```
Edit manifests/install-components.json to add new skills/components
Edit manifests/install-modules.json to group new skills into modules
Edit manifests/install-profiles.json to update install profiles
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
