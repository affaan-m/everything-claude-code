```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill documents the core development patterns and conventions used in the `everything-claude-code` TypeScript repository. It covers file naming, import/export styles, commit message conventions, and the main workflow for extending the ECC (everything-claude-code-conventions) bundle with new components such as tools, skills, identity, or commands. Use this guide to contribute code and documentation that fits seamlessly into the project.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `myComponent.ts`, `userService.test.ts`

### Import Style
- Use **relative imports** for referencing local modules.
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
    ```

### Commit Messages
- Follow the **conventional commit** format.
- Use the `feat` prefix for new features.
- Example:
  ```
  feat: add user authentication module with JWT support
  ```

## Workflows

### add-ecc-bundle-component
**Trigger:** When you want to extend the ECC bundle with a new capability, convention, or documentation.  
**Command:** `/add-ecc-bundle-component`

1. **Identify** the type of component you wish to add (tool, skill, identity, or command).
2. **Create or update** the relevant file in the appropriate ECC bundle directory:
    - For tools: `.claude/ecc-tools.json`
    - For skills: `.claude/skills/everything-claude-code/SKILL.md` or `.agents/skills/everything-claude-code/SKILL.md`
    - For identity: `.claude/identity.json`
    - For commands: `.claude/commands/*.md`
3. **Edit** the file to include your new component or update existing documentation.
4. **Commit** your changes using a standardized commit message referencing the ECC bundle.
    - Example:  
      ```
      feat: add logging tool to ECC bundle
      ```
5. **Push** your changes and open a pull request if required.

**Files Involved:**
- `.claude/ecc-tools.json`
- `.claude/skills/everything-claude-code/SKILL.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/identity.json`
- `.claude/commands/feature-development.md`
- `.claude/commands/add-ecc-bundle-component.md`

## Testing Patterns

- **Testing Framework:** Unknown (not specified in the repository).
- **File Pattern:** Test files are named using the `*.test.*` convention.
  - Example: `userService.test.ts`
- **Location:** Test files are typically placed alongside the modules they test.
- **Style:** Follow the same import/export conventions as production code.

## Commands

| Command                    | Purpose                                                         |
|----------------------------|-----------------------------------------------------------------|
| /add-ecc-bundle-component  | Add or update a component in the ECC bundle (tools, skills, etc.) |

```