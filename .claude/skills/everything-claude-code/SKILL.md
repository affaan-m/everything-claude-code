```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill documents the core development patterns, coding conventions, and workflows used in the `everything-claude-code` TypeScript repository. It is designed to help contributors quickly understand how to write, organize, and extend code in this project, including how to add new skills, commands, agent configurations, and identity files to the ECC (everything-claude-code-conventions) bundle.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `myFeatureComponent.ts`

### Import Style
- Use **relative imports** for referencing local modules.
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
- Follow the **Conventional Commits** format.
- Use the `feat` prefix for new features.
  - Example:
    ```
    feat: add support for ECC bundle component auto-registration
    ```

## Workflows

### Add ECC Bundle Component
**Trigger:** When you want to extend or update the ECC bundle with a new capability or configuration (such as adding a skill, command, agent config, or identity file).
**Command:** `/add-ecc-bundle-component`

1. Create or update a file in one of the ECC bundle directories:
    - `.claude/skills/`
    - `.agents/skills/`
    - `.claude/commands/`
    - `.claude/identity.json`
    - `.codex/agents/`
2. If adding a skill, create a `SKILL.md` file in the appropriate directory.
3. Commit the new or updated file with a message indicating the addition to the ECC bundle.
    - Example commit message:
      ```
      feat: add new agent config to ECC bundle
      ```
4. Push your changes and open a pull request if required.

**Files commonly involved:**
- `.claude/skills/everything-claude-code/SKILL.md`
- `.agents/skills/everything-claude-code/SKILL.md`
- `.claude/commands/feature-development.md`
- `.claude/commands/add-ecc-bundle-component.md`
- `.claude/identity.json`
- `.claude/ecc-tools.json`
- `.codex/agents/explorer.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/docs-researcher.toml`

## Testing Patterns

- **Test file pattern:** Files should be named with `.test.` in the filename, e.g., `myFeature.test.ts`.
- **Testing framework:** Not explicitly detected; check existing test files for patterns.
- **Example test file:**
    ```typescript
    // myFeature.test.ts
    import { myFunction } from './myFeature';

    describe('myFunction', () => {
      it('should return expected result', () => {
        expect(myFunction()).toBe('expected');
      });
    });
    ```

## Commands

| Command                    | Purpose                                                        |
|----------------------------|----------------------------------------------------------------|
| /add-ecc-bundle-component  | Add or update a skill, command, agent config, or identity file in the ECC bundle |
```