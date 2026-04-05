```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill introduces the core development patterns and workflows used in the `everything-claude-code` TypeScript repository. It covers coding conventions, file organization, commit style, and the primary workflows for adding new skills, agent configurations, and command documentation. By following these patterns, contributors can ensure consistency and maintainability across the codebase.

## Coding Conventions

### File Naming
- Use **kebab-case** for all file names.
  - Example: `my-feature-file.ts`

### Imports
- Use **relative imports** for referencing other modules within the project.
  - Example:
    ```typescript
    import { myFunction } from './utils/my-function';
    ```

### Exports
- Use **named exports** for all exported functions, types, or constants.
  - Example:
    ```typescript
    // utils/my-function.ts
    export function myFunction() { /* ... */ }
    ```

### Commit Messages
- Follow **conventional commit** style.
- Use the `feat` prefix for new features.
  - Example: `feat: add ECC agent config workflow for OpenAI integration`

## Workflows

### Add ECC Bundle Skill
**Trigger:** When someone wants to introduce a new ECC skill to the project.  
**Command:** `/add-ecc-skill`

1. Create a SKILL.md file describing the new skill in:
    - `.claude/skills/everything-claude-code/SKILL.md`
    - `.agents/skills/everything-claude-code/SKILL.md`
2. Ensure the documentation clearly explains the purpose and usage of the skill.

**Example:**
```bash
# Create the SKILL.md files
mkdir -p .claude/skills/everything-claude-code
mkdir -p .agents/skills/everything-claude-code
touch .claude/skills/everything-claude-code/SKILL.md
touch .agents/skills/everything-claude-code/SKILL.md
```

---

### Add ECC Bundle Agent Config
**Trigger:** When someone wants to register a new agent or update agent configuration for ECC.  
**Command:** `/add-ecc-agent-config`

1. Create agent configuration files as needed:
    - `.agents/skills/everything-claude-code/agents/openai.yaml`
    - `.codex/agents/explorer.toml`
    - `.codex/agents/reviewer.toml`
    - `.codex/agents/docs-researcher.toml`
2. Follow the appropriate format for YAML or TOML files.

**Example:**
```yaml
# .agents/skills/everything-claude-code/agents/openai.yaml
name: openai
type: language-model
api_key: ${OPENAI_API_KEY}
```
```toml
# .codex/agents/explorer.toml
[agent]
name = "explorer"
role = "code-explorer"
```

---

### Add ECC Bundle Command Doc
**Trigger:** When someone wants to document a new ECC-related command.  
**Command:** `/add-ecc-command-doc`

1. Create a markdown documentation file in `.claude/commands/`:
    - `.claude/commands/feature-development.md`
    - `.claude/commands/add-ecc-bundle-skill-documentation.md`
    - `.claude/commands/add-ecc-bundle-agent-config.md`
2. Clearly describe the command's purpose, usage, and any parameters.

**Example:**
```markdown
# Feature Development

## Purpose
Describes how to develop and add new features to the ECC bundle.

## Usage
...
```

## Testing Patterns

- Test files use the `*.test.*` naming convention.
  - Example: `my-function.test.ts`
- The testing framework is not explicitly specified; check existing test files for framework clues.
- Place test files alongside the modules they test or in a dedicated `tests/` directory if present.

**Example:**
```typescript
// my-function.test.ts
import { myFunction } from './my-function';

describe('myFunction', () => {
  it('should return expected result', () => {
    expect(myFunction()).toBe(/* expected value */);
  });
});
```

## Commands

| Command                | Purpose                                                     |
|------------------------|-------------------------------------------------------------|
| /add-ecc-skill         | Add a new ECC skill by creating SKILL.md in skills folders  |
| /add-ecc-agent-config  | Add or update agent configuration files for ECC bundle      |
| /add-ecc-command-doc   | Add documentation for a new ECC command in .claude/commands |
```
