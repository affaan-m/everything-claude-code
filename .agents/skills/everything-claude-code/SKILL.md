```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development patterns and workflows used in the `everything-claude-code` repository. The codebase is written in TypeScript and focuses on modular, maintainable code with clear conventions for file naming, imports/exports, and workflow documentation. The repository supports a set of repeatable workflows for adding new ECC bundle skills and agent configurations, with suggested commands to streamline contributions.

## Coding Conventions

**File Naming**
- Use **kebab-case** for all file names.
  - Example: `my-feature-file.ts`

**Import Style**
- Use **relative imports** for referencing local modules.
  - Example:
    ```typescript
    import { myFunction } from './utils/my-function';
    ```

**Export Style**
- Use **named exports** for all modules.
  - Example:
    ```typescript
    // In utils/my-function.ts
    export function myFunction() { ... }
    ```

**Commit Messages**
- Follow **conventional commits** with the `feat` prefix for new features.
  - Example: `feat: add ECC bundle agent configuration for new tool`

## Workflows

### Add ECC Bundle Skill Documentation
**Trigger:** When someone wants to document a new ECC skill for both Claude and agent environments.  
**Command:** `/add-ecc-bundle-skill-docs`

1. Create or update `.claude/skills/<skill-name>/SKILL.md` with documentation for the new skill.
2. Create or update `.agents/skills/<skill-name>/SKILL.md` with corresponding agent documentation.
3. Ensure both files are consistent and up-to-date.

**Example Directory Structure:**
```
.claude/skills/my-new-skill/SKILL.md
.agents/skills/my-new-skill/SKILL.md
```

### Add ECC Bundle Agent Configuration
**Trigger:** When someone wants to register a new agent or tool configuration for an ECC bundle.  
**Command:** `/add-ecc-bundle-agent-config`

1. Create or update `.codex/agents/<agent-name>.toml` with the configuration for the new agent.
2. Fill in all necessary fields in the TOML file according to the agent's requirements.
3. Commit the changes with a descriptive message.

**Example:**
```
.codex/agents/my-agent.toml
```

## Testing Patterns

- Test files follow the pattern `*.test.*` (e.g., `feature.test.ts`).
- The specific testing framework is not specified, but tests should be colocated with or near the code they validate.
- Example test file:
  ```
  src/utils/my-function.test.ts
  ```

## Commands

| Command                        | Purpose                                                      |
|--------------------------------|--------------------------------------------------------------|
| /add-ecc-bundle-skill-docs     | Add or update ECC skill documentation for Claude and agents.  |
| /add-ecc-bundle-agent-config   | Add or update agent configuration for a new ECC bundle.       |
```
