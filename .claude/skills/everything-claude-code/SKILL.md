```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development patterns and workflows used in the `everything-claude-code` TypeScript repository. It covers coding conventions, commit styles, and step-by-step instructions for maintaining skill documentation and agent configuration for ECC bundles. This guide is intended for contributors who want to ensure consistency and follow best practices when working in this codebase.

## Coding Conventions

### File Naming

- Use **kebab-case** for all file and directory names.
  - **Example:**  
    ```
    user-profile.ts
    ecc-bundle-handler/
    ```

### Import Style

- Use **relative imports** for all module references.
  - **Example:**
    ```typescript
    import { fetchData } from './utils/fetch-data';
    import { ECCBundle } from '../models/ecc-bundle';
    ```

### Export Style

- Use **named exports** exclusively.
  - **Example:**
    ```typescript
    // Good
    export function processBundle(bundle: ECCBundle) { ... }
    export const ECC_BUNDLE_VERSION = '1.0.0';

    // Avoid default exports
    // export default processBundle; // Not recommended
    ```

### Commit Messages

- Follow **conventional commit** style.
- Use the `feat` prefix for new features.
- Keep commit messages concise but descriptive (average ~84 characters).
  - **Example:**
    ```
    feat: add ECC bundle handler for new agent configuration
    ```

## Workflows

### Add ECC Bundle Skill Documentation

**Trigger:** When someone adds a new ECC bundle and needs to document the skill in both Claude and agent contexts.  
**Command:** `/add-ecc-bundle-skill-docs`

1. Create a skill documentation file for the new ECC bundle in both the `.claude/skills/{bundle-name}/` and `.agents/skills/{bundle-name}/` directories.
2. Name the file `SKILL.md` in both locations.
3. Fill out the documentation with relevant details about the skill.

**Example:**
```
.  
├── .claude/skills/my-ecc-bundle/SKILL.md  
└── .agents/skills/my-ecc-bundle/SKILL.md  
```

### Add ECC Bundle Agent Configuration

**Trigger:** When someone adds a new ECC bundle and needs to configure agents for it.  
**Command:** `/add-ecc-bundle-agent-config`

1. Create a new agent configuration file in the `.codex/agents/` directory.
2. Name the file `{agent-name}.toml` (replace `{agent-name}` with your agent's name).
3. Populate the TOML file with the required configuration for your agent.

**Example:**
```
.  
└── .codex/agents/my-agent.toml  
```

## Testing Patterns

- Test files follow the pattern `*.test.*` (e.g., `user-profile.test.ts`).
- The specific testing framework is not defined in this repository, so check existing test files for structure and conventions.
- Place test files alongside the modules they test or in a dedicated test directory as appropriate.

**Example:**
```
user-profile.ts
user-profile.test.ts
```

## Commands

| Command                        | Purpose                                                           |
|--------------------------------|-------------------------------------------------------------------|
| /add-ecc-bundle-skill-docs     | Add skill documentation files for a new ECC bundle                |
| /add-ecc-bundle-agent-config   | Add agent configuration file for a new ECC bundle                 |
```
