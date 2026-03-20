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
fix: sync catalog counts (27 agents, 114 skills, 59 commands)
```

*Commit message example*

```text
feat(skills): add rules-distill — extract cross-cutting principles from skills into rules
```

*Commit message example*

```text
chore: prepare v1.9.0 release (#666)
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
fix(skills): address CodeRabbit review — portability and scan scope
```

*Commit message example*

```text
fix(skills): address Servitor review feedback for rules-distill
```

*Commit message example*

```text
fix: update skill/command counts in README.md and AGENTS.md
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

**Frequency**: ~22 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `manifests/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
docs(skills): align documentation-lookup with CONTRIBUTING template; add cross-harness (Codex/Cursor) skill copies
fix: address PR review — skill template (When to use, How it works, Examples), bun.lock, next build note, rust-reviewer CI note, doc-lookup privacy/uncertainty
```

### Add New Skill

Adds a new skill to the repository, including documentation and harness copies if needed.

**Frequency**: ~4 times per month

**Steps**:
1. Create skills/<skill-name>/SKILL.md with full documentation and workflow.
2. Optionally add .agents/skills/<skill-name>/SKILL.md and/or .cursor/skills/<skill-name>/SKILL.md for harness compatibility.
3. If relevant, add agents/openai.yaml or similar config files for harness integration.
4. Address review feedback by updating SKILL.md and harness copies.
5. Remove duplicate .agents/ copies after sync, keeping canonical in skills/.

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`
- `.agents/skills/*/agents/openai.yaml`

**Example commit sequence**:
```
Create skills/<skill-name>/SKILL.md with full documentation and workflow.
Optionally add .agents/skills/<skill-name>/SKILL.md and/or .cursor/skills/<skill-name>/SKILL.md for harness compatibility.
If relevant, add agents/openai.yaml or similar config files for harness integration.
Address review feedback by updating SKILL.md and harness copies.
Remove duplicate .agents/ copies after sync, keeping canonical in skills/.
```

### Add New Agent

Adds a new agent to the repository, registers it in documentation and mapping files.

**Frequency**: ~2 times per month

**Steps**:
1. Create agents/<agent-name>.md with agent definition.
2. Update AGENTS.md to include the new agent in the summary table.
3. Update README.md with agent count and agent list.
4. Optionally update docs/COMMAND-AGENT-MAP.md or rules/common/agents.md for mapping.
5. Address review feedback and synchronize all references.

**Files typically involved**:
- `agents/*.md`
- `AGENTS.md`
- `README.md`
- `docs/COMMAND-AGENT-MAP.md`
- `rules/common/agents.md`

**Example commit sequence**:
```
Create agents/<agent-name>.md with agent definition.
Update AGENTS.md to include the new agent in the summary table.
Update README.md with agent count and agent list.
Optionally update docs/COMMAND-AGENT-MAP.md or rules/common/agents.md for mapping.
Address review feedback and synchronize all references.
```

### Add New Command

Adds a new slash command to the system, with documentation and (optionally) a backing skill.

**Frequency**: ~2 times per month

**Steps**:
1. Create commands/<command-name>.md with command documentation and usage.
2. If needed, create skills/<skill-name>/SKILL.md as the implementation backing.
3. Update README.md and AGENTS.md with command count if relevant.
4. Address review feedback and update sample output, usage, or implementation details.

**Files typically involved**:
- `commands/*.md`
- `skills/*/SKILL.md`
- `README.md`
- `AGENTS.md`

**Example commit sequence**:
```
Create commands/<command-name>.md with command documentation and usage.
If needed, create skills/<skill-name>/SKILL.md as the implementation backing.
Update README.md and AGENTS.md with command count if relevant.
Address review feedback and update sample output, usage, or implementation details.
```

### Add Language Support

Adds support for a new programming language, including rules, agents, commands, and tests.

**Frequency**: ~1 times per month

**Steps**:
1. Create rules/<language>/*.md for coding-style, hooks, patterns, security, testing.
2. Create agents/<language>-reviewer.md and/or <language>-build-resolver.md.
3. Create commands/<language>-build.md, <language>-review.md, <language>-test.md as needed.
4. Add tests for hooks and integration.
5. Update AGENTS.md and README.md with new agent and command counts.

**Files typically involved**:
- `rules/*/*.md`
- `agents/*-reviewer.md`
- `agents/*-build-resolver.md`
- `commands/*-build.md`
- `commands/*-review.md`
- `commands/*-test.md`
- `tests/hooks/*.test.js`
- `AGENTS.md`
- `README.md`

**Example commit sequence**:
```
Create rules/<language>/*.md for coding-style, hooks, patterns, security, testing.
Create agents/<language>-reviewer.md and/or <language>-build-resolver.md.
Create commands/<language>-build.md, <language>-review.md, <language>-test.md as needed.
Add tests for hooks and integration.
Update AGENTS.md and README.md with new agent and command counts.
```

### Update Catalog Counts

Synchronizes agent, skill, and command counts across documentation to match the catalog and pass CI.

**Frequency**: ~4 times per month

**Steps**:
1. Update agent, skill, and command counts in README.md and AGENTS.md.
2. Optionally update counts in other documentation files (e.g., zh-CN/README.md).
3. Commit with a message referencing the new counts and CI validation.
4. Address any CI failures due to mismatched counts.

**Files typically involved**:
- `README.md`
- `AGENTS.md`
- `docs/zh-CN/README.md`

**Example commit sequence**:
```
Update agent, skill, and command counts in README.md and AGENTS.md.
Optionally update counts in other documentation files (e.g., zh-CN/README.md).
Commit with a message referencing the new counts and CI validation.
Address any CI failures due to mismatched counts.
```

### Address Review Feedback

Responds to code review comments by updating implementation, documentation, and configuration files.

**Frequency**: ~6 times per month

**Steps**:
1. Edit relevant files (SKILL.md, scripts, configs, docs) to address specific review points.
2. Sync changes across harness copies if needed.
3. Clarify or expand documentation, fix naming, update examples.
4. Remove or update files as requested by reviewers.
5. Commit with a message referencing the review feedback.

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`
- `scripts/**/*.sh`
- `README.md`
- `AGENTS.md`

**Example commit sequence**:
```
Edit relevant files (SKILL.md, scripts, configs, docs) to address specific review points.
Sync changes across harness copies if needed.
Clarify or expand documentation, fix naming, update examples.
Remove or update files as requested by reviewers.
Commit with a message referencing the review feedback.
```

### Add Skill Harness Copies

Adds or syncs skill copies for multiple harnesses (Codex, Cursor) to ensure compatibility.

**Frequency**: ~2 times per month

**Steps**:
1. Copy or create .agents/skills/<skill>/SKILL.md and/or .cursor/skills/<skill>/SKILL.md from canonical skills/<skill>/SKILL.md.
2. Add or update agents/openai.yaml or other harness config files.
3. Align documentation and examples across all copies.
4. Remove duplicate or outdated harness copies as needed.

**Files typically involved**:
- `skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`
- `.agents/skills/*/agents/openai.yaml`

**Example commit sequence**:
```
Copy or create .agents/skills/<skill>/SKILL.md and/or .cursor/skills/<skill>/SKILL.md from canonical skills/<skill>/SKILL.md.
Add or update agents/openai.yaml or other harness config files.
Align documentation and examples across all copies.
Remove duplicate or outdated harness copies as needed.
```

### Fix Observer Orchestration

Updates observer/continuous-learning scripts and tests to fix bugs, improve portability, or address review.

**Frequency**: ~2 times per month

**Steps**:
1. Edit skills/continuous-learning-v2/hooks/observe.sh or agents/observer-loop.sh.
2. Update or add tests in tests/hooks/observer-memory.test.js or related files.
3. Address review feedback by adjusting logic, adding portability, or fixing edge cases.
4. Commit with a message referencing the fix and affected scripts/tests.

**Files typically involved**:
- `skills/continuous-learning-v2/hooks/observe.sh`
- `skills/continuous-learning-v2/agents/observer-loop.sh`
- `skills/continuous-learning-v2/scripts/*.sh`
- `tests/hooks/observer-memory.test.js`

**Example commit sequence**:
```
Edit skills/continuous-learning-v2/hooks/observe.sh or agents/observer-loop.sh.
Update or add tests in tests/hooks/observer-memory.test.js or related files.
Address review feedback by adjusting logic, adding portability, or fixing edge cases.
Commit with a message referencing the fix and affected scripts/tests.
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
