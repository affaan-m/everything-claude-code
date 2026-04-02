```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches the core development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` JavaScript repository. It covers how to add new agents and skills, implement multi-agent workflows, manage commands, maintain documentation, and handle CI/CD and dependency updates. By following these patterns, contributors can ensure consistency, reliability, and maintainability across the codebase.

---

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and directories.
  - Example: `myUtility.js`, `agentManager.js`

**Import Style**
- Use relative imports for internal modules.
  ```js
  // Good
  import utils from './utils';
  import Agent from '../agents/agentManager';
  ```

**Export Style**
- Mixed: both default and named exports are used.
  ```js
  // Default export
  export default function runAgent() { ... }

  // Named export
  export function registerSkill(skill) { ... }
  ```

**Commit Messages**
- Use [Conventional Commits](https://www.conventionalcommits.org/) with prefixes: `fix`, `feat`, `docs`, `chore`.
  - Example: `feat: add multi-agent orchestrator for PRP workflow`

---

## Workflows

### Add New Agent or Skill
**Trigger:** When introducing a new specialized agent or skill  
**Command:** `/add-agent-or-skill`

1. Create a definition file:
    - Agents: `agents/agent-name.md`
    - Skills: `skills/skill-name/SKILL.md`
2. Update manifest/catalog files:
    - `manifests/install-modules.json`
    - `AGENTS.md`
    - `README.md`
3. (If needed) Add supporting files (commands, orchestrators, tests)
4. Update documentation as needed

**Example:**
```bash
# Create a new skill
touch skills/mySkill/SKILL.md

# Update manifest
vim manifests/install-modules.json
```

---

### Multi-Agent Workflow Pipeline
**Trigger:** When automating a complex, multi-step process using chained agents/skills  
**Command:** `/add-multi-agent-workflow`

1. Add multiple agent definition files (`agents/*.md`)
2. Add orchestrator skill (`skills/*/SKILL.md`)
3. Add supporting commands (`commands/*.md`)
4. Update manifests/catalogs (`manifests/install-modules.json`, `AGENTS.md`, `README.md`)
5. Add documentation/examples (`examples/*`)

---

### Add or Update Command
**Trigger:** When introducing or enhancing a command-line workflow  
**Command:** `/add-command`

1. Create or update command markdown file (`commands/*.md`)
2. (If needed) Add or update supporting scripts or orchestrators
3. Update documentation (`README.md`, `AGENTS.md`, etc.)

**Example:**
```markdown
# commands/myNewCommand.md
## myNewCommand
Description: Does something useful.
Usage: npx myNewCommand [options]
```

---

### Agent or Skill Bugfix and Review Alignment
**Trigger:** When updating multiple agents/skills for consistency, protocol changes, or review feedback  
**Command:** `/bulk-agent-skill-fix`

1. Edit multiple agent or skill definition files (`agents/*.md` or `skills/*/SKILL.md`)
2. Normalize fields, fix references, update frontmatter, etc.
3. Update documentation/catalogs as needed

---

### Add Install Target or Adapter
**Trigger:** When enabling installation/integration with a new platform or tool  
**Command:** `/add-install-target`

1. Add install/uninstall scripts and README under new directory (e.g., `.gemini/`, `.codebuddy/`)
2. Update install target registry scripts (`scripts/lib/install-targets/*.js`)
3. Update schemas (`schemas/ecc-install-config.schema.json`, `schemas/install-modules.schema.json`)
4. Update manifests (`manifests/install-modules.json`)
5. Add or update tests (`tests/lib/install-targets.test.js`)

---

### Hook or CI Pipeline Improvement
**Trigger:** When improving or fixing automation and validation infrastructure  
**Command:** `/improve-hooks-or-ci`

1. Edit hooks (`hooks/hooks.json`, `scripts/hooks/*.js`, `.cursor/hooks/*.js`, etc.)
2. Edit or add tests for hooks/scripts
3. Edit CI/CD workflow files (`.github/workflows/*.yml`)
4. Update related documentation if needed

---

### Dependency Bump and Security Audit
**Trigger:** When dependencies require updates for security or compatibility  
**Command:** `/bump-dependencies`

1. Update `package.json`, `yarn.lock`, and/or `package-lock.json`
2. Update `.github/workflows/*.yml` if action versions are bumped
3. Apply `npm audit fix` or similar security updates
4. Update related documentation if needed

---

### Documentation and Catalog Sync
**Trigger:** When new features/skills/agents are added or workflows change, and documentation/catalogs need to be updated  
**Command:** `/sync-docs-catalogs`

1. Edit documentation files (`README.md`, `AGENTS.md`, `WORKING-CONTEXT.md`, etc.)
2. Edit catalog/manifest files (`manifests/install-modules.json`, `package.json`, etc.)
3. Sync counts, lists, and references

---

## Testing Patterns

- **Test File Pattern:** All test files use the `*.test.js` suffix.
- **Framework:** Not explicitly specified; likely using a standard JS test runner (e.g., Jest, Mocha).
- **Placement:** Tests are placed alongside or within a `tests/` directory.
- **Example:**
  ```js
  // tests/agentManager.test.js
  import { registerAgent } from '../agents/agentManager';

  test('registerAgent adds agent to registry', () => {
    // ...test logic...
  });
  ```

---

## Commands

| Command                  | Purpose                                                                 |
|--------------------------|-------------------------------------------------------------------------|
| /add-agent-or-skill      | Add a new agent or skill, update manifests and documentation            |
| /add-multi-agent-workflow| Implement a multi-step workflow with chained agents/skills              |
| /add-command             | Add or update a CLI command and related docs                            |
| /bulk-agent-skill-fix    | Bulk update agents/skills for bugfixes or protocol alignment            |
| /add-install-target      | Add support for a new install target or adapter                         |
| /improve-hooks-or-ci     | Refactor or fix hooks, CI/CD scripts, or workflow YAMLs                 |
| /bump-dependencies       | Update dependencies and perform security audits                         |
| /sync-docs-catalogs      | Update documentation and catalogs for new features or workflow changes  |
```
