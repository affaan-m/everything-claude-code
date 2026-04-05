```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill documents the core development conventions and workflows for the `everything-claude-code` TypeScript repository. It covers file organization, code style, commit patterns, and the main workflows for adding ECC bundle skills, agent configurations, and metadata. Use this guide to contribute effectively and maintain consistency across the codebase.

## Coding Conventions

- **Language:** TypeScript
- **Framework:** None detected
- **File Naming:** Use kebab-case for all file names.
  - Example: `my-feature-file.ts`
- **Import Style:** Use relative imports.
  - Example:
    ```typescript
    import { myFunction } from './utils/my-function';
    ```
- **Export Style:** Use named exports.
  - Example:
    ```typescript
    export function myFunction() { /* ... */ }
    ```
- **Commit Messages:** Follow the [Conventional Commits](https://www.conventionalcommits.org/) standard.
  - Prefix: `feat`
  - Example: `feat: add user authentication module`
  - Average commit message length: ~84 characters

## Workflows

### Add ECC Bundle Skill Documentation

**Trigger:** When someone wants to document a new ECC bundle skill for both Claude and agent environments.  
**Command:** `/add-ecc-bundle-skill-docs`

1. Create or update `.claude/skills/everything-claude-code/SKILL.md` with the relevant skill documentation.
2. Create or update `.agents/skills/everything-claude-code/SKILL.md` to mirror or adapt the documentation for agent environments.

**Files Involved:**
- `.claude/skills/*/SKILL.md`
- `.agents/skills/*/SKILL.md`

**Example:**
```bash
/add-ecc-bundle-skill-docs
```

---

### Add ECC Bundle Agent Config

**Trigger:** When someone wants to register a new ECC bundle agent configuration.  
**Command:** `/add-ecc-bundle-agent-config`

1. Create or update `.agents/skills/everything-claude-code/agents/openai.yaml` with agent-specific configuration.
2. Create or update `.codex/agents/explorer.toml` for explorer agent settings.
3. Create or update `.codex/agents/reviewer.toml` for reviewer agent settings.
4. Create or update `.codex/agents/docs-researcher.toml` for documentation researcher agent settings.

**Files Involved:**
- `.agents/skills/*/agents/*.yaml`
- `.codex/agents/*.toml`

**Example:**
```bash
/add-ecc-bundle-agent-config
```

---

### Add ECC Bundle Metadata and Commands

**Trigger:** When someone wants to register a new ECC bundle with identity and command documentation.  
**Command:** `/add-ecc-bundle-metadata`

1. Create or update `.claude/ecc-tools.json` with tool metadata.
2. Create or update `.claude/identity.json` with identity information.
3. Create or update `.claude/commands/feature-development.md` for feature development documentation.
4. Create or update `.claude/commands/add-ecc-bundle-skill-documentation.md` for skill documentation workflow.
5. Create or update `.claude/commands/add-ecc-bundle-agent-config.md` for agent config workflow.

**Files Involved:**
- `.claude/ecc-tools.json`
- `.claude/identity.json`
- `.claude/commands/*.md`

**Example:**
```bash
/add-ecc-bundle-metadata
```

## Testing Patterns

- **Test File Pattern:** All test files follow the `*.test.*` naming convention.
  - Example: `user-service.test.ts`
- **Testing Framework:** Not explicitly detected; check project dependencies or ask maintainers for specifics.
- **Test Location:** Tests are typically located alongside the files they test, following the same kebab-case naming.

**Example Test File:**
```typescript
// user-service.test.ts
import { getUser } from './user-service';

describe('getUser', () => {
  it('should return user data', () => {
    // test implementation
  });
});
```

## Commands

| Command                        | Purpose                                                        |
|---------------------------------|----------------------------------------------------------------|
| /add-ecc-bundle-skill-docs      | Add or update ECC bundle skill documentation in both environments |
| /add-ecc-bundle-agent-config    | Add or update agent configuration files for a new ECC bundle     |
| /add-ecc-bundle-metadata        | Add or update metadata and command documentation for a bundle    |
```
