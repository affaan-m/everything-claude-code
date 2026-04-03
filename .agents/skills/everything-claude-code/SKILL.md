```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and workflows for the `everything-claude-code` TypeScript repository. It covers coding conventions, commit practices, and the process for extending the ECC (everything-claude-code-conventions) bundle with new components like tools, skills, identity, or commands.

## Coding Conventions

**File Naming**
- Use `camelCase` for file names.
  - Example: `myComponent.ts`

**Import Style**
- Use relative imports.
  - Example:
    ```typescript
    import { myFunction } from './utils';
    ```

**Export Style**
- Prefer named exports.
  - Example:
    ```typescript
    export function myFunction() { /* ... */ }
    ```

**Commit Messages**
- Follow [Conventional Commits](https://www.conventionalcommits.org/) with the `feat` prefix for features.
  - Example:
    ```
    feat: add support for new ECC skill registration (refs #42)
    ```

## Workflows

### Add ECC Bundle Component
**Trigger:** When you want to expand the ECC bundle with a new capability or configuration (e.g., tools, skills, identity, or commands).  
**Command:** `/add-ecc-bundle-component`

1. Identify the type of component you want to add (tool, skill, identity, or command).
2. Create or update the relevant file in the appropriate ECC directory:
    - Tools: `.claude/ecc-tools.json`
    - Skills: `.claude/skills/everything-claude-code/SKILL.md` or `.agents/skills/everything-claude-code/SKILL.md`
    - Identity: `.claude/identity.json`
    - Commands: `.claude/commands/feature-development.md` or `.claude/commands/add-ecc-bundle-component.md`
3. Commit your changes with a message referencing the ECC bundle, following the conventional commit style.
    - Example:
      ```
      feat: add new skill to ECC bundle (refs #ecc)
      ```
4. (Optional) Use the `/add-ecc-bundle-component` command to document or automate the addition.

**Files Involved:**
- `.claude/ecc-tools.json`
- `.claude/skills/everything-claude-code/SKILL.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/identity.json`
- `.claude/commands/feature-development.md`
- `.claude/commands/add-ecc-bundle-component.md`

## Testing Patterns

- Test files follow the `*.test.*` naming pattern.
  - Example: `myComponent.test.ts`
- The testing framework is not explicitly specified in the repository.
- Place test files alongside the code they test or in a dedicated `tests` directory (if present).

**Example Test File:**
```typescript
// myComponent.test.ts
import { myFunction } from './myComponent';

describe('myFunction', () => {
  it('should return expected result', () => {
    expect(myFunction()).toBe('expected');
  });
});
```

## Commands

| Command                   | Purpose                                                      |
|---------------------------|--------------------------------------------------------------|
| /add-ecc-bundle-component | Add a new tool, skill, identity, or command to the ECC bundle|
```
