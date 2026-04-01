```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the core development conventions and collaborative workflows used in the `everything-claude-code` repository. The codebase is JavaScript-based (no framework), and is organized around modular skills, agents, commands, and install targets. It emphasizes clear documentation, conventional commits, and automation-friendly file structures. By following these patterns, contributors can efficiently add features, refactor code, and keep documentation in sync.

---

## Coding Conventions

**File Naming**
- Use `camelCase` for file names.
  - Example: `mySkill.js`, `installTarget.js`

**Imports**
- Use relative import paths.
  - Example:
    ```js
    const utils = require('./utils');
    ```

**Exports**
- Mixed export styles: both CommonJS (`module.exports`) and ES6 (`export`) may be found.
  - Example (CommonJS):
    ```js
    module.exports = myFunction;
    ```
  - Example (ES6):
    ```js
    export default myFunction;
    ```

**Commit Messages**
- Use [Conventional Commits](https://www.conventionalcommits.org/):
  - Prefixes: `fix`, `feat`, `docs`, `chore`
  - Example: `feat: add new agent workflow for ECC`
  - Average message length: ~57 characters

**Documentation**
- Each skill, agent, or command should have a corresponding `SKILL.md` or `.md` file in its directory.
- Update manifests and high-level docs (`README.md`, `AGENTS.md`, `WORKING-CONTEXT.md`) when adding or modifying features.

---

## Workflows

### Add Skill or Agent Workflow
**Trigger:** When introducing a new skill or agent for ECC or related workflows  
**Command:** `/add-skill`

1. Create or update `SKILL.md` in `skills/`, `.agents/skills/`, or `.claude/skills/`.
2. Add or update the agent definition in `agents/` or `.agents/skills/`.
3. Update `manifests/install-modules.json` if new modules are required.
4. Update related documentation: `AGENTS.md`, `README.md`, `WORKING-CONTEXT.md`, etc.

**Example:**
```bash
# Add a new skill
/add-skill myNewSkill
```

---

### Add or Update Command Workflow
**Trigger:** When adding or improving a workflow command or agent orchestration  
**Command:** `/add-command`

1. Create or update a command markdown file in `commands/` or `.claude/commands/`.
2. Update related documentation if needed.
3. Update or create supporting scripts or configuration.

**Example:**
```bash
# Add a new command
/add-command syncData
```

---

### Multi-File Refactor or Feature Workflow
**Trigger:** When refactoring legacy code or implementing a cross-cutting feature  
**Command:** `/refactor-feature`

1. Edit multiple source files (`skills/`, `commands/`, `scripts/`, `agents/`).
2. Update documentation (`README.md`, `AGENTS.md`, `WORKING-CONTEXT.md`, `docs/`).
3. Update manifests or configuration files.
4. Update or add tests.

**Example:**
```bash
# Refactor feature across multiple modules
/refactor-feature collapseCommandsToSkills
```

---

### Add Install Target or Adapter Workflow
**Trigger:** When supporting a new IDE, tool, or platform for ECC installation  
**Command:** `/add-install-target`

1. Create install scripts (`install.js`, `install.sh`, `uninstall.js`, `uninstall.sh`) in a new directory.
2. Update `manifests/install-modules.json`.
3. Update or add schemas (`schemas/ecc-install-config.schema.json`, `schemas/install-modules.schema.json`).
4. Update `scripts/lib/install-manifests.js` and `scripts/lib/install-targets/*.js`.
5. Add or update tests for install targets.

**Example:**
```bash
# Add a new install target
/add-install-target vscode
```

---

### Documentation Sync and Guidance Update Workflow
**Trigger:** When synchronizing documentation or updating guidance files  
**Command:** `/sync-docs`

1. Update or create documentation files (`README.md`, `WORKING-CONTEXT.md`, `AGENTS.md`, `docs/`).
2. Update plugin or marketplace guidance (`.claude-plugin/README.md`, `.codex-plugin/README.md`).
3. Update or create supporting JSON or configuration files.

**Example:**
```bash
# Sync documentation
/sync-docs
```

---

### CI/CD Workflow Update
**Trigger:** When updating GitHub Actions or CI/CD configuration  
**Command:** `/update-ci`

1. Edit one or more `.github/workflows/*.yml` files.
2. Update related lockfiles or configuration if needed (`package.json`, `yarn.lock`).

**Example:**
```bash
# Update CI configuration
/update-ci
```

---

## Testing Patterns

- Test files use the pattern: `*.test.js`
- Testing framework is not specified; check for test runners in `package.json` or project docs.
- Place tests in `tests/` or alongside source files.
- Example test file: `utils.test.js`
- Example test structure:
  ```js
  // utils.test.js
  const utils = require('./utils');

  test('should add numbers', () => {
    expect(utils.add(2, 3)).toBe(5);
  });
  ```

---

## Commands

| Command             | Purpose                                                        |
|---------------------|----------------------------------------------------------------|
| /add-skill          | Add a new skill or agent, including documentation and config   |
| /add-command        | Add or update a workflow command                               |
| /refactor-feature   | Refactor legacy code or implement a cross-cutting feature      |
| /add-install-target | Add a new install target or platform integration               |
| /sync-docs          | Synchronize and update documentation and guidance files        |
| /update-ci          | Update CI/CD workflow files and related configuration          |
```
