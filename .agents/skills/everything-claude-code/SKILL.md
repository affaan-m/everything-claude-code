```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill provides a comprehensive guide to the development patterns, coding conventions, and common workflows used in the `everything-claude-code` TypeScript repository. It is designed to help contributors quickly understand the structure, style, and processes for adding new features, documenting skills, and configuring agents within the codebase.

## Coding Conventions

**File Naming**
- Use kebab-case for all file names.
  - Example: `my-feature-file.ts`

**Import Style**
- Use relative imports for all module dependencies.
  - Example:
    ```typescript
    import { myFunction } from './utils/my-function';
    ```

**Export Style**
- Use named exports exclusively.
  - Example:
    ```typescript
    // utils/my-function.ts
    export function myFunction() { /* ... */ }
    ```

**Commit Messages**
- Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.
- Use the `feat` prefix for new features.
  - Example: `feat: add support for ECC skill documentation workflow`

## Workflows

### add-ecc-bundle-skill-documentation
**Trigger:** When you need to document a new ECC (everything-claude-code) skill for both Claude and agent systems.  
**Command:** `/add-ecc-bundle-skill-docs`

1. Create or update the skill documentation in `.claude/skills/<skill-name>/SKILL.md`.
2. Create or update the corresponding documentation in `.agents/skills/<skill-name>/SKILL.md`.

**Example:**
```bash
# Create documentation for a new skill called "my-skill"
mkdir -p .claude/skills/my-skill
touch .claude/skills/my-skill/SKILL.md

mkdir -p .agents/skills/my-skill
touch .agents/skills/my-skill/SKILL.md
```
- Ensure both files contain up-to-date and consistent documentation for the skill.

### add-ecc-bundle-agent-config
**Trigger:** When you want to register new ECC bundle agents for codex and agent systems.  
**Command:** `/add-ecc-bundle-agent-config`

1. Create or update agent configuration files in `.codex/agents/<agent-name>.toml`.
2. Create or update agent YAML files in `.agents/skills/<skill-name>/agents/<agent-name>.yaml`.

**Example:**
```bash
# Add a new agent called "explorer"
touch .codex/agents/explorer.toml

mkdir -p .agents/skills/everything-claude-code/agents
touch .agents/skills/everything-claude-code/agents/explorer.yaml
```
- Populate these files with the appropriate agent configuration details.

## Testing Patterns

- Test files follow the `*.test.*` naming convention.
  - Example: `my-feature.test.ts`
- The testing framework is not explicitly specified; check existing test files for patterns.
- Place test files alongside the code they test or in a dedicated test directory.

**Example:**
```typescript
// my-feature.test.ts
import { myFunction } from './my-feature';

describe('myFunction', () => {
  it('should work as expected', () => {
    expect(myFunction()).toBe(true);
  });
});
```

## Commands

| Command                       | Purpose                                                      |
|-------------------------------|--------------------------------------------------------------|
| /add-ecc-bundle-skill-docs    | Document a new ECC skill for Claude and agent systems         |
| /add-ecc-bundle-agent-config  | Register new ECC bundle agents for codex and agent systems    |
```
