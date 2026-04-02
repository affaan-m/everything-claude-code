```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` repository. The project is written in JavaScript (no framework), and focuses on modular, extensible automation for skills, agents, commands, and install targets. The repository emphasizes clear documentation, conventional commit messages, and a structured approach to adding or updating features.

## Coding Conventions

- **File Naming:** Use `camelCase` for JavaScript files and directories.
  - Example: `installTargetAdapter.js`, `mySkillDirectory/`
- **Import Style:** Use relative imports.
  ```js
  // Example
  const utils = require('../lib/utils');
  ```
- **Export Style:** Mixed (both CommonJS and ES module patterns may be found).
  ```js
  // CommonJS
  module.exports = function myFunction() { ... };

  // ES Module
  export function myFunction() { ... }
  ```
- **Commit Messages:** Follow [Conventional Commits](https://www.conventionalcommits.org/)
  - Prefixes: `fix`, `feat`, `docs`, `chore`
  - Example: `feat: add support for new install target`
- **Test Files:** Named as `*.test.js` and placed alongside or within a `tests/` directory.

## Workflows

### Add or Update Skill

**Trigger:** When introducing a new skill or improving an existing skill's capabilities or documentation.  
**Command:** `/add-skill`

1. Create or update `skills/<skill-name>/SKILL.md`.
2. Optionally update `AGENTS.md`, `README.md`, or related documentation.
3. Optionally add supporting files (examples, rules, etc.).

**Example:**
```bash
# Add a new skill
mkdir -p skills/myNewSkill
nano skills/myNewSkill/SKILL.md
# Update documentation if needed
nano README.md
```

---

### Add or Update Agent

**Trigger:** When introducing a new agent or modifying agent behavior.  
**Command:** `/add-agent`

1. Create or update `agents/<agent-name>.md`.
2. Optionally update `AGENTS.md` or related documentation.

**Example:**
```bash
nano agents/myAgent.md
nano AGENTS.md
```

---

### Add or Update Command

**Trigger:** When introducing a new command-line workflow or improving an existing command.  
**Command:** `/add-command`

1. Create or update `commands/<command-name>.md`.
2. Optionally update related documentation or tests.

**Example:**
```bash
nano commands/deploy.md
```

---

### Add Install Target or Adapter

**Trigger:** When supporting installation or integration with a new platform or tool.  
**Command:** `/add-install-target`

1. Create `scripts/lib/install-targets/<target>.js`.
2. Update `manifests/install-modules.json`.
3. Update `schemas/ecc-install-config.schema.json` and/or `schemas/install-modules.schema.json`.
4. Add or update install/uninstall scripts in `.<target>/`.
5. Update `tests/lib/install-targets.test.js`.

**Example:**
```bash
touch scripts/lib/install-targets/myPlatform.js
nano manifests/install-modules.json
nano schemas/ecc-install-config.schema.json
nano tests/lib/install-targets.test.js
```

---

### Update or Add CI/CD Workflow

**Trigger:** When upgrading dependencies, adding new CI steps, or improving automation.  
**Command:** `/update-ci`

1. Update `.github/workflows/*.yml` files.
2. Optionally update `package.json`, `yarn.lock`, or related config.

**Example:**
```bash
nano .github/workflows/ci.yml
```

---

### Improve or Fix Hooks and Scripts

**Trigger:** When improving reliability, performance, or security of hooks and related scripts.  
**Command:** `/fix-hook`

1. Update `hooks/hooks.json`.
2. Update or create `scripts/hooks/*.js` or `.sh`.
3. Update or create `tests/hooks/*.test.js`.

**Example:**
```bash
nano hooks/hooks.json
nano scripts/hooks/precommit.js
nano tests/hooks/precommit.test.js
```

---

### Documentation Sync or Enhancement

**Trigger:** When documenting new features, updating guides, or synchronizing docs across languages.  
**Command:** `/update-docs`

1. Update `README.md`, `AGENTS.md`, `WORKING-CONTEXT.md`, and/or `docs/zh-CN/*`.
2. Optionally update or add `the-shortform-guide.md`, `TROUBLESHOOTING.md`, or other guides.

**Example:**
```bash
nano README.md
nano docs/zh-CN/README.md
```

## Testing Patterns

- **Test Framework:** Not explicitly detected; use standard Node.js assertions or your preferred test runner.
- **Test File Naming:** Use `*.test.js`.
- **Test Location:** Place test files in `tests/` directories or alongside the code being tested.

**Example:**
```js
// tests/lib/install-targets.test.js
const assert = require('assert');
const installTarget = require('../../scripts/lib/install-targets/myPlatform');

describe('installTarget', () => {
  it('should install correctly', () => {
    assert(installTarget.install());
  });
});
```

## Commands

| Command           | Purpose                                                      |
|-------------------|--------------------------------------------------------------|
| /add-skill        | Add or update a skill and its documentation                  |
| /add-agent        | Add or update an agent definition                            |
| /add-command      | Add or update a command workflow                             |
| /add-install-target | Add support for a new install target or adapter            |
| /update-ci        | Update or add CI/CD workflow files                           |
| /fix-hook         | Improve or fix hooks and related scripts                     |
| /update-docs      | Synchronize or enhance documentation                         |
```