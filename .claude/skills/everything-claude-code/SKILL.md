```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill introduces the core development patterns and workflows used in the `everything-claude-code` TypeScript repository. It covers file organization, code style, commit conventions, and the process for extending the ECC (everything-claude-code-conventions) bundle with new components such as tools, skills, identities, agents, or commands. By following these guidelines, contributors can ensure consistency and maintainability across the codebase.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `myComponent.ts`, `userService.test.ts`

### Import Style
- Use **relative imports** for all modules.
  - Example:
    ```typescript
    import { myFunction } from './utils';
    ```

### Export Style
- Use **named exports** exclusively.
  - Example:
    ```typescript
    // utils.ts
    export function myFunction() { /* ... */ }

    // usage
    import { myFunction } from './utils';
    ```

### Commit Messages
- Follow the **conventional commit** format.
- Use the `feat` prefix for new features or additions.
  - Example:
    ```
    feat: add ECC bundle component for agent identity management
    ```

## Workflows

### Add ECC Bundle Component
**Trigger:** When you want to extend the ECC bundle with a new capability or documentation (e.g., tools, skills, identity, agents, or commands).  
**Command:** `/add-ecc-bundle-component`

1. **Identify** the type of component you want to add (tool, skill, identity, agent, or command).
2. **Create or update** the relevant file in the appropriate ECC bundle directory:
    - `.claude/ecc-tools.json` (for tools)
    - `.claude/skills/everything-claude-code/SKILL.md` (for skills)
    - `.agents/skills/everything-claude-code/SKILL.md` (for agent skills)
    - `.claude/identity.json` (for identity)
    - `.claude/commands/feature-development.md` (for feature development commands)
    - `.claude/commands/add-ecc-bundle-component.md` (for documentation of this workflow)
3. **Write or update** the documentation or code as needed.
4. **Commit** your changes with a message referencing the ECC bundle addition, using the conventional commit format:
    ```
    feat: add [component type] to ECC bundle ([short description])
    ```
5. **Submit** your changes for review.

#### Example: Adding a New Skill
1. Create or edit `.claude/skills/everything-claude-code/SKILL.md`.
2. Add your skill documentation.
3. Commit with:
    ```
    feat: add new skill for ECC bundle (SKILL.md)
    ```

## Testing Patterns

- **Test files** use the pattern `*.test.*` (e.g., `userService.test.ts`).
- **Testing framework** is not specified; check existing test files for structure.
- Place tests alongside the modules they test or in a dedicated `tests` directory if present.

#### Example Test File
```typescript
// userService.test.ts
import { getUser } from './userService';

describe('getUser', () => {
  it('returns user data for valid ID', () => {
    // test implementation
  });
});
```

## Commands

| Command                   | Purpose                                                      |
|---------------------------|--------------------------------------------------------------|
| /add-ecc-bundle-component | Add a new component to the ECC bundle (tools, skills, etc.)  |

```