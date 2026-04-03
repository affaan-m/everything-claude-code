```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill documents the core development patterns, coding conventions, and workflows for the `everything-claude-code` TypeScript repository. It provides guidance on file organization, code style, commit practices, and the process for extending the ECC (everything-claude-code-conventions) bundle with new components such as tools, skills, identity, or commands.

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
- Use **named exports** rather than default exports.
  - Example:
    ```typescript
    // utils.ts
    export function myFunction() { /* ... */ }

    // usage
    import { myFunction } from './utils';
    ```

### Commit Messages
- Follow the **Conventional Commits** specification.
- Use the `feat` prefix for new features.
  - Example:  
    ```
    feat: add user authentication to login flow
    ```

## Workflows

### Add ECC Bundle Component
**Trigger:** When you want to extend the ECC bundle with a new capability, convention, or configuration.  
**Command:** `/add-ecc-bundle-component`

1. **Identify** the type of component you want to add (e.g., tool, skill, identity, command).
2. **Create or update** the relevant file under the appropriate ECC directory:
    - `.claude/ecc-tools.json` for tools
    - `.claude/skills/everything-claude-code/SKILL.md` or `.agents/skills/everything-claude-code/SKILL.md` for skills
    - `.claude/identity.json` for identity
    - `.claude/commands/*.md` for commands
3. **Commit** the new or updated file with a message referencing the ECC bundle.
    - Example:
      ```
      feat: add new skill to everything-claude-code ECC bundle
      ```
4. **Push** your changes to the repository.

#### Example: Adding a New Skill
```bash
# Create the skill file
touch .claude/skills/everything-claude-code/newSkill.md

# Edit the file as needed

# Commit your changes
git add .claude/skills/everything-claude-code/newSkill.md
git commit -m "feat: add newSkill to ECC bundle"
git push
```

## Testing Patterns

- **Test File Naming:** Test files follow the `*.test.*` pattern.
  - Example: `userProfile.test.ts`
- **Testing Framework:** Not explicitly detected; ensure to use a consistent testing approach.
- **Typical Test Structure:**
  ```typescript
  // userProfile.test.ts
  import { getUserProfile } from './userProfile';

  describe('getUserProfile', () => {
    it('returns user data for valid ID', () => {
      // test implementation
    });
  });
  ```

## Commands

| Command                    | Purpose                                                        |
|----------------------------|----------------------------------------------------------------|
| /add-ecc-bundle-component  | Add a new tool, skill, identity, or command to the ECC bundle. |

```