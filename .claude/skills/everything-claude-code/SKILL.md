```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you how to contribute to the `everything-claude-code` JavaScript codebase. You'll learn the project's coding conventions, commit patterns, and the main workflows for adding skills, agents, CLI commands, install targets, plugin marketplace features, dependency updates, and hooks. Each workflow is documented with step-by-step instructions and example commands to streamline your contributions.

---

## Coding Conventions

- **Language:** JavaScript (no framework detected)
- **File Naming:** Use `camelCase` for file and directory names.
  - Example: `installTarget.js`, `pluginMarketplace.js`
- **Import Style:** Use relative imports.
  - Example:
    ```js
    const installTarget = require('./lib/installTarget');
    ```
- **Export Style:** Mixed (both `module.exports` and ES6 `export` are used).
  - Example (CommonJS):
    ```js
    module.exports = function foo() { ... };
    ```
  - Example (ES6):
    ```js
    export function foo() { ... }
    ```
- **Commits:** Use [Conventional Commits](https://www.conventionalcommits.org/) with prefixes: `fix`, `feat`, `docs`, `chore`.
  - Example: `feat: add plugin marketplace registry support`

---

## Workflows

### Add New Skill or Agent
**Trigger:** When introducing a new skill or agent to the system  
**Command:** `/add-skill`

1. Create a new `SKILL.md` or agent definition file in `skills/` or `agents/`.
2. Optionally add supporting files (scripts, references, sub-agents).
3. Update `manifests/install-modules.json` to register the new skill/agent.
4. Update `AGENTS.md` and/or `README.md` to document the addition.
5. Add or update relevant tests if applicable.

**Example:**
```bash
# Add a new skill
mkdir skills/myNewSkill
touch skills/myNewSkill/SKILL.md
# Register in manifest
# Update documentation
```

---

### Add or Update CLI Command
**Trigger:** When adding or updating a CLI command  
**Command:** `/add-command`

1. Create or modify a Markdown file in `commands/` describing the command.
2. If new, register the command in `README.md`, `AGENTS.md`, and/or relevant index files.
3. Update or add tests if the command has associated logic.
4. Optionally update documentation mirrors (e.g., `docs/zh-CN/README.md`).

**Example:**
```bash
# Add command documentation
touch commands/myCommand.md
# Update README.md with new command
```

---

### Add or Update Install Target
**Trigger:** When supporting a new installation target or updating an existing one  
**Command:** `/add-install-target`

1. Create or update `scripts/lib/install-targets/*.js` for the target.
2. Add or update install scripts (e.g., `install.sh`, `install.js`) in a dedicated directory.
3. Update `manifests/install-modules.json` and schemas (`schemas/ecc-install-config.schema.json`, `schemas/install-modules.schema.json`).
4. Add or update tests in `tests/lib/install-targets.test.js`.
5. Update `README.md` if necessary.

**Example:**
```js
// scripts/lib/install-targets/myPlatform.js
module.exports = function installMyPlatform() { ... }
```

---

### Add or Update Plugin Marketplace System
**Trigger:** When adding or improving plugin marketplace/registry functionality  
**Command:** `/add-plugin-marketplace`

1. Create or update `scripts/pluginMarketplace.js` and `scripts/pluginInstall.js`.
2. Update or create `scripts/lib/pluginRegistry.js` for registry logic.
3. Update or create `.claude-plugin/marketplaces.json` and `installed-plugins.json`.
4. Update `scripts/ecc.js` to wire up new sub-commands.
5. Write or update tests in `tests/lib/pluginRegistry.test.js`.
6. Document new commands in `commands/` and update `README.md`, `AGENTS.md`, and docs mirrors.

**Example:**
```js
// scripts/lib/pluginRegistry.js
export function registerPlugin(plugin) { ... }
```

---

### Dependency Update via Dependabot
**Trigger:** When a dependency is updated via Dependabot or manually  
**Command:** `/update-dependency`

1. Update dependency version in `package.json`, `yarn.lock`, or other manifest.
2. Update related GitHub Actions workflow files if the dependency is an action.
3. Commit with a standardized message referencing the dependency and version.
4. Optionally update `.github/dependabot.yml` to adjust update rules.

**Example:**
```bash
npm install some-package@latest
git commit -m "chore: bump some-package to 2.0.1"
```

---

### Add or Update Hook or Hook Script
**Trigger:** When adding or improving a hook (e.g., formatting, typechecking, session management)  
**Command:** `/add-hook`

1. Edit `hooks/hooks.json` to add or update hook configuration.
2. Create or update supporting scripts in `scripts/hooks/` (e.g., `post-edit-accumulator.js`).
3. Update or add tests in `tests/hooks/`.
4. Optionally update `.cursor/hooks/` or other adapter scripts if relevant.

**Example:**
```json
// hooks/hooks.json
{
  "pre-commit": "scripts/hooks/preCommit.js"
}
```

---

## Testing Patterns

- **Test Files:** Use the pattern `*.test.js`.
- **Framework:** Not explicitly detected; likely using a standard JS test runner (e.g., Jest, Mocha).
- **Location:** Tests are typically placed in `tests/` or alongside the code in relevant directories.
- **Example:**
  ```js
  // tests/lib/install-targets.test.js
  const installTarget = require('../../scripts/lib/install-targets/myTarget');
  test('should install target correctly', () => {
    expect(installTarget()).toBe(true);
  });
  ```

---

## Commands

| Command                | Purpose                                                        |
|------------------------|----------------------------------------------------------------|
| /add-skill             | Add a new skill or agent, including docs and registration      |
| /add-command           | Add or update a CLI command and documentation                  |
| /add-install-target    | Add or update an install target and related scripts/tests      |
| /add-plugin-marketplace| Implement or update plugin marketplace/registry functionality  |
| /update-dependency     | Update dependencies via Dependabot or manually                 |
| /add-hook              | Add or update CLI/agent hooks and supporting scripts           |
```
