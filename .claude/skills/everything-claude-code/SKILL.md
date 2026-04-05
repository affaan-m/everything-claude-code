```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill documents the core development patterns, coding conventions, and workflows for the `everything-claude-code` repository. The codebase is written in TypeScript and focuses on modular, convention-driven development without a specific framework. It emphasizes clarity, maintainability, and extensibility, particularly around the ECC (everything-claude-code-conventions) bundle.

## Coding Conventions

### File Naming

- Use **camelCase** for file names.
  - Example: `myComponent.ts`, `userProfile.test.ts`

### Import Style

- Use **relative imports** for all modules.
  - Example:
    ```typescript
    import { myFunction } from './utils';
    ```

### Export Style

- Use **named exports** rather than default exports.
  - Example:
    ```typescript
    // utils.ts
    export function myFunction() { /* ... */ }

    // usage
    import { myFunction } from './utils';
    ```

### Commit Messages

- Follow **conventional commit** patterns.
- Use the `feat` prefix for new features.
  - Example:  
    ```
    feat: add user authentication to ECC bundle (94 chars avg)
    ```

## Workflows

### add-ecc-bundle-component

**Trigger:** When you want to extend the ECC bundle with a new capability, convention, or agent skill.

**Command:** `/add-ecc-bundle-component`

1. **Create or update** a file in the relevant ECC bundle directory. Common locations include:
    - `.claude/ecc-tools.json`
    - `.claude/skills/everything-claude-code/SKILL.md`
    - `.agents/skills/everything-claude-code/SKILL.md`
    - `.claude/identity.json`
    - `.claude/commands/feature-development.md`
    - `.claude/commands/add-ecc-bundle-component.md`
    - `.codex/agents/explorer.toml`
    - `.codex/agents/reviewer.toml`
    - `.codex/agents/docs-researcher.toml`
2. **Commit** your changes with a message referencing the ECC bundle, following the conventional commit style.
    - Example:  
      ```
      feat: add new agent config to ECC bundle
      ```
3. **Push** your changes and open a pull request if required.

#### Example: Adding a New Tool

1. Edit `.claude/ecc-tools.json` to include your new tool.
2. Commit:
    ```
    feat: add 'dataCleaner' tool to ECC bundle
    ```
3. Push and submit for review.

## Testing Patterns

- **Test File Naming:** All test files follow the `*.test.*` pattern.
  - Example: `userService.test.ts`
- **Testing Framework:** Not explicitly detected; check project documentation or existing test files for specifics.
- **Test Example:**
    ```typescript
    // userService.test.ts
    import { getUser } from './userService';

    describe('getUser', () => {
      it('returns user data', () => {
        // test implementation
      });
    });
    ```

## Commands

| Command                   | Purpose                                                         |
|---------------------------|-----------------------------------------------------------------|
| /add-ecc-bundle-component | Add a new component or skill to the ECC bundle                  |

```