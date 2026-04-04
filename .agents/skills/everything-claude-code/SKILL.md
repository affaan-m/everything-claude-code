```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `everything-claude-code` repository, a TypeScript codebase with a focus on modular skill, agent, and command components. It covers file naming, import/export style, commit message conventions, and the primary workflow for adding new ECC (everything-claude-code-conventions) bundle components.

## Coding Conventions

**File Naming**
- Use camelCase for all file and directory names.
  - Example: `myComponent.ts`, `userProfile.test.ts`

**Import Style**
- Use relative imports for all modules.
  - Example:
    ```typescript
    import { myFunction } from './utils';
    ```

**Export Style**
- Use named exports instead of default exports.
  - Example:
    ```typescript
    // Good
    export function myFunction() { ... }

    // Avoid
    // export default function myFunction() { ... }
    ```

**Commit Messages**
- Follow the [Conventional Commits](https://www.conventionalcommits.org/) format.
- Use the `feat` prefix for new features.
  - Example: `feat: add user authentication module`

## Workflows

### add-ecc-bundle-component
**Trigger:** When you want to add a new ECC bundle component (skill, agent, command, or config) to the repository.  
**Command:** `/add-ecc-bundle-component`

1. Create or update a file under one of the ECC bundle directories:
    - `.claude/skills/`
    - `.agents/skills/`
    - `.claude/commands/`
    - `.claude/`
    - `.codex/agents/`
2. Ensure your file follows the coding conventions (camelCase naming, relative imports, named exports).
3. Commit your changes with a message referencing the ECC bundle, using the conventional commit format.
    - Example: `feat: add SKILL.md for everything-claude-code ECC bundle`
4. (Optional) Use the `/add-ecc-bundle-component` command if supported by your workflow tools.

**Files commonly involved:**
- `.claude/skills/everything-claude-code/SKILL.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/commands/feature-development.md`
- `.claude/commands/add-ecc-bundle-component.md`
- `.claude/ecc-tools.json`
- `.claude/identity.json`

## Testing Patterns

- Test files use the pattern `*.test.*` (e.g., `userProfile.test.ts`).
- The specific testing framework is not detected, but tests should be placed alongside or near the code they cover, following the same camelCase naming convention.

**Example test file:**
```typescript
// userProfile.test.ts
import { getUserProfile } from './userProfile';

describe('getUserProfile', () => {
  it('returns user data for a valid ID', () => {
    // test implementation
  });
});
```

## Commands

| Command                   | Purpose                                                      |
|---------------------------|--------------------------------------------------------------|
| /add-ecc-bundle-component | Add a new skill, agent, command, or config to the ECC bundle |
```
