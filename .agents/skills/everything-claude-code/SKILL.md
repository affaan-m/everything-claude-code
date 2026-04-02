```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` repository. The project is a JavaScript codebase (no framework) that organizes agent and skill modules, command workflows, and install targets, with a strong emphasis on documentation, localization, and cross-platform compatibility.

## Coding Conventions

- **File Naming:**  
  Use `camelCase` for JavaScript files and folders.  
  _Example:_  
  ```
  scripts/lib/installManifests.js
  skills/textSummarizer/SKILL.md
  ```

- **Import Style:**  
  Use relative imports for modules.  
  _Example:_  
  ```js
  const installManifests = require('../lib/installManifests');
  ```

- **Export Style:**  
  Mixed usage of CommonJS (`module.exports`) and ES6 (`export`) depending on context.  
  _Example (CommonJS):_  
  ```js
  module.exports = function doSomething() { ... };
  ```
  _Example (ES6):_  
  ```js
  export function doSomething() { ... }
  ```

- **Commit Messages:**  
  Follow [Conventional Commits](https://www.conventionalcommits.org/) with prefixes: `fix`, `feat`, `docs`, `chore`.  
  _Example:_  
  ```
  feat: add Gemini install target support
  fix: normalize Windows path in install scripts
  ```

## Workflows

### Add or Update Skill
**Trigger:** When introducing or enhancing a skill  
**Command:** `/add-skill`

1. Create or update `skills/<skill-name>/SKILL.md`.
2. Optionally add/update scripts in `skills/<skill-name>/scripts/`.
3. Update `AGENTS.md` and/or `README.md` to reflect the new or updated skill.
4. Update `manifests/install-modules.json` if the skill is installable.
5. Update `docs/zh-CN/AGENTS.md` and/or `docs/zh-CN/README.md` for localization.

_Example:_
```bash
# Add a new skill
/add-skill
```

---

### Add or Extend Command Workflow
**Trigger:** When adding or enhancing a CLI/agent command workflow  
**Command:** `/add-command`

1. Create or update `commands/<command-name>.md`.
2. Document YAML frontmatter, usage, and output in the command file.
3. Update `AGENTS.md` or `README.md` if relevant.
4. Add or update `examples/` or `scripts/` if needed.
5. Address PR review feedback for command files.

_Example:_
```bash
# Add a new command workflow
/add-command
```

---

### Install Target Adaptation
**Trigger:** When supporting a new install target (e.g., Gemini, CodeBuddy)  
**Command:** `/add-install-target`

1. Create `.target/README.md` and install/uninstall scripts as needed.
2. Update `manifests/install-modules.json` and `schemas/ecc-install-config.schema.json`.
3. Add or update `scripts/lib/install-targets/<target>-project.js`.
4. Update `scripts/lib/install-manifests.js` and `registry.js`.
5. Add or update `tests/lib/install-targets.test.js`.

_Example:_
```bash
# Add support for a new install target
/add-install-target
```

---

### Documentation and Localization Update
**Trigger:** When updating documentation or synchronizing localization  
**Command:** `/sync-docs`

1. Update `AGENTS.md`, `README.md`, and/or `WORKING-CONTEXT.md`.
2. Update `docs/zh-CN/AGENTS.md` and `docs/zh-CN/README.md`.
3. Optionally update `skills/*/SKILL.md` and `docs/zh-CN/skills/*/SKILL.md`.

_Example:_
```bash
# Sync documentation and localization
/sync-docs
```

---

### Test Fix or Portability Fix
**Trigger:** When fixing test failures or improving cross-platform compatibility  
**Command:** `/fix-test-portability`

1. Update `tests/scripts/*.test.js` for platform compatibility.
2. Normalize paths or environment variables (e.g., `HOME` vs `USERPROFILE`).
3. Optionally update related scripts in `scripts/lib/install/*.js` or hooks.

_Example:_
```js
// Normalize home directory for tests
const home = process.env.HOME || process.env.USERPROFILE;
```
```bash
# Fix test portability issues
/fix-test-portability
```

---

### Agent and Skill Catalog Sync
**Trigger:** When synchronizing agent/skill catalogs after additions or refactors  
**Command:** `/sync-catalog`

1. Update `AGENTS.md` and/or `.opencode/opencode.json`.
2. Update `skills/*/SKILL.md` and/or `.opencode/prompts/agents/*.txt`.
3. Update `manifests/install-modules.json` or `scripts/ci/catalog.js`.
4. Update `README.md` if agent/skill counts change.

_Example:_
```bash
# Sync agent and skill catalog
/sync-catalog
```

## Testing Patterns

- **Test Files:**  
  Use the pattern `*.test.js` for test files, located in relevant `tests/` directories.

- **Framework:**  
  No specific test framework detected; likely uses Node.js assertions or a lightweight runner.

- **Cross-Platform:**  
  Tests often normalize environment variables and paths for Windows/Linux compatibility.

_Example:_
```js
// Example test file: tests/scripts/installManifests.test.js
const assert = require('assert');
const installManifests = require('../../scripts/lib/installManifests');

describe('installManifests', () => {
  it('should return a manifest object', () => {
    const manifest = installManifests();
    assert(manifest && typeof manifest === 'object');
  });
});
```

## Commands

| Command               | Purpose                                                    |
|-----------------------|------------------------------------------------------------|
| /add-skill            | Add or update a skill, including docs and scripts          |
| /add-command          | Add or extend a CLI/agent command workflow                 |
| /add-install-target   | Add support for a new install target/platform              |
| /sync-docs            | Synchronize or update documentation and localization       |
| /fix-test-portability | Fix or improve test scripts for cross-platform compatibility|
| /sync-catalog         | Synchronize agent/skill catalogs and related manifests     |
```
