```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill documents the core development patterns and workflows for the `everything-claude-code` TypeScript repository. It covers coding conventions, commit styles, testing patterns, and step-by-step instructions for extending the ECC (everything-claude-code-conventions) bundle with new components such as skills, agents, identities, and commands.

## Coding Conventions

**File Naming**
- Use `camelCase` for file names.
  - Example: `myComponent.ts`, `userProfile.test.ts`

**Import Style**
- Use relative imports.
  - Example:
    ```typescript
    import { myFunction } from './utils';
    ```

**Export Style**
- Use named exports.
  - Example:
    ```typescript
    // utils.ts
    export function myFunction() { /* ... */ }
    ```

**Commit Messages**
- Follow [Conventional Commits](https://www.conventionalcommits.org/) with the `feat` prefix for new features.
  - Example:
    ```
    feat: add user authentication to profile service
    ```

## Workflows

### Add ECC Bundle Component
**Trigger:** When you want to extend the ECC bundle with a new capability or configuration (e.g., skill, agent, identity, or command).  
**Command:** `/add-ecc-bundle-component`

1. **Create or update a component file** under the appropriate ECC-related directory:
    - Skills: `.claude/skills/<skill-name>/SKILL.md`
    - Agent skills: `.agents/skills/<skill-name>/SKILL.md`
    - Commands: `.claude/commands/<command-name>.md`
    - Identity: `.claude/identity.json`
    - ECC tools: `.claude/ecc-tools.json`
    - Codex agents: `.codex/agents/<agent-name>.toml`
2. **Write or update the component documentation/code** as needed.
3. **Commit your changes** with a message referencing the ECC bundle, using the conventional commit style:
    ```
    feat: add <component-type> <component-name> to ECC bundle
    ```
4. **Push your changes** and open a pull request if required.

**Example: Adding a new skill**
```bash
# Create the skill documentation
mkdir -p .claude/skills/myNewSkill
echo "# My New Skill" > .claude/skills/myNewSkill/SKILL.md

# Commit the change
git add .claude/skills/myNewSkill/SKILL.md
git commit -m "feat: add skill myNewSkill to ECC bundle"
git push
```

## Testing Patterns

- **Test Files:** Use the `*.test.*` naming pattern (e.g., `userProfile.test.ts`).
- **Testing Framework:** Not explicitly detected; use your preferred TypeScript-compatible test runner (e.g., Jest, Mocha).
- **Example Test File:**
    ```typescript
    // userProfile.test.ts
    import { getUserProfile } from './userProfile';

    describe('getUserProfile', () => {
      it('returns user data', () => {
        expect(getUserProfile('alice')).toEqual({ name: 'Alice' });
      });
    });
    ```

## Commands

| Command                     | Purpose                                                        |
|-----------------------------|----------------------------------------------------------------|
| /add-ecc-bundle-component   | Add a new skill, agent, identity, or command to the ECC bundle |
```