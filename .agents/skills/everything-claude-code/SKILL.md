```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill outlines the core development patterns and workflows for the `everything-claude-code` TypeScript repository. It covers coding conventions, file organization, commit practices, and the process for adding new components to the ECC (everything-claude-code-conventions) bundle. This guide is intended to help contributors maintain consistency and efficiency when working within this codebase.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `myComponent.ts`, `userProfile.test.ts`

### Import Style
- Use **relative imports** for referencing modules within the codebase.
  - Example:
    ```typescript
    import { myFunction } from './utils';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    // utils.ts
    export function myFunction() { /* ... */ }
    ```

### Commit Messages
- Follow **Conventional Commits** with the `feat` prefix for new features.
  - Example:
    ```
    feat: add user authentication to login component
    ```

## Workflows

### Add ECC Bundle Component
**Trigger:** When you want to introduce a new standardized component or capability (such as tools, skills, identity, agents, or commands) to the ECC bundle.  
**Command:** `/add-ecc-bundle-component`

1. **Create or update** the relevant file under the ECC bundle directory. Common locations include:
    - `.claude/ecc-tools.json`
    - `.claude/skills/everything-claude-code/SKILL.md`
    - `.agents/skills/everything-claude-code/SKILL.md`
    - `.claude/identity.json`
    - `.claude/commands/feature-development.md`
    - `.claude/commands/add-ecc-bundle-component.md`
2. **Commit** your changes with a message indicating the addition to the ECC bundle.
    - Example commit message:
      ```
      feat: add new agent skill to ECC bundle
      ```
3. **(Optional)** Use the `/add-ecc-bundle-component` command to document or automate the process.

#### Example: Adding a New Skill
```bash
# Create the skill markdown file
touch .claude/skills/everything-claude-code/SKILL.md

# Add your documentation and code

# Commit your changes
git add .claude/skills/everything-claude-code/SKILL.md
git commit -m "feat: add new skill to ECC bundle"
git push
```

## Testing Patterns

- **Test files** use the pattern `*.test.*` (e.g., `myComponent.test.ts`).
- **Testing framework** is currently unknown; follow existing patterns or consult maintainers for guidance.
- Place tests alongside the files they test or in a dedicated `__tests__` directory if present.

#### Example Test File
```typescript
// myComponent.test.ts
import { myFunction } from './myComponent';

describe('myFunction', () => {
  it('should return true', () => {
    expect(myFunction()).toBe(true);
  });
});
```

## Commands

| Command                    | Purpose                                                        |
|----------------------------|----------------------------------------------------------------|
| /add-ecc-bundle-component  | Initiate the process to add a new component to the ECC bundle. |

```