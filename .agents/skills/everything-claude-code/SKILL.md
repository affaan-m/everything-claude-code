```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill documents the core development patterns and workflows for the `everything-claude-code` repository. The project is written in TypeScript and is organized to support modular skill and agent development for Claude Code environments. It emphasizes clear coding conventions, structured commit messages, and repeatable workflows for adding new skills, agent configurations, and bundle metadata.

## Coding Conventions

### File Naming

- Use **kebab-case** for all file names.
  - Example: `my-feature-file.ts`, `user-profile.test.ts`

### Import Style

- Use **relative imports** for internal modules.
  - Example:
    ```typescript
    import { myFunction } from './utils/my-function';
    ```

### Export Style

- Use **named exports** for all modules.
  - Example:
    ```typescript
    // In utils/my-function.ts
    export function myFunction() { /* ... */ }
    ```

### Commit Messages

- Follow the **Conventional Commits** standard.
- Use the `feat` prefix for new features.
- Keep commit messages concise but descriptive (average ~83 characters).
  - Example:
    ```
    feat: add ECC bundle skill workflow and documentation
    ```

## Workflows

### Add ECC Bundle Skill

**Trigger:** When you want to add a new ECC bundle skill to the project.  
**Command:** `/add-ecc-bundle-skill`

1. Create a `SKILL.md` file in `.claude/skills/everything-claude-code/`.
2. Create a `SKILL.md` file in `.agents/skills/everything-claude-code/`.

**Example:**
```bash
# Create the skill documentation in both locations
touch .claude/skills/everything-claude-code/SKILL.md
touch .agents/skills/everything-claude-code/SKILL.md
```

---

### Add ECC Bundle Agent Config

**Trigger:** When you want to add agent configuration for a new ECC bundle.  
**Command:** `/add-ecc-bundle-agent-config`

1. Create an agent config YAML file in `.agents/skills/everything-claude-code/agents/` (e.g., `openai.yaml`).
2. Create agent TOML files in `.codex/agents/` for each agent (e.g., `explorer.toml`, `reviewer.toml`, `docs-researcher.toml`).

**Example:**
```bash
# Create agent YAML config
touch .agents/skills/everything-claude-code/agents/openai.yaml

# Create agent TOML configs
touch .codex/agents/explorer.toml
touch .codex/agents/reviewer.toml
touch .codex/agents/docs-researcher.toml
```

---

### Add ECC Bundle Metadata and Commands

**Trigger:** When you want to register a new ECC bundle and its commands.  
**Command:** `/add-ecc-bundle-metadata`

1. Add ECC tools metadata to `.claude/ecc-tools.json`.
2. Add bundle identity to `.claude/identity.json`.
3. Add command documentation files to `.claude/commands/` (e.g., `feature-development.md`, `add-ecc-bundle-skill.md`, `add-ecc-bundle-agent-config.md`).

**Example:**
```bash
# Edit or create metadata files
nano .claude/ecc-tools.json
nano .claude/identity.json

# Add command documentation
touch .claude/commands/feature-development.md
touch .claude/commands/add-ecc-bundle-skill.md
touch .claude/commands/add-ecc-bundle-agent-config.md
```

## Testing Patterns

- Test files follow the pattern `*.test.*` (e.g., `user-profile.test.ts`).
- The specific testing framework is not specified; ensure tests are colocated with the code they verify and follow the naming convention.

**Example:**
```typescript
// user-profile.test.ts
import { getUserProfile } from './user-profile';

describe('getUserProfile', () => {
  it('returns user data for valid ID', () => {
    // test implementation
  });
});
```

## Commands

| Command                       | Purpose                                                        |
|-------------------------------|----------------------------------------------------------------|
| /add-ecc-bundle-skill         | Add a new ECC bundle skill and its documentation               |
| /add-ecc-bundle-agent-config  | Add agent configuration files for a new ECC bundle             |
| /add-ecc-bundle-metadata      | Register a new ECC bundle and add related command documentation|
```
