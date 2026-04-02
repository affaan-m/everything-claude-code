```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the core development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` repository. The project is a JavaScript codebase (no framework) that organizes modular skills, agents, commands, and automation scripts to support agent workflows and extensibility. You'll learn how to contribute new features, update documentation, manage dependencies, and maintain code quality in a collaborative, automation-friendly environment.

---

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and directories.
  - Example: `installTargets.js`, `addSkill.js`

**Import Style**
- Use relative imports for modules.
  ```js
  // Example
  const install = require('../lib/installTargets');
  ```

**Export Style**
- Mixed: both CommonJS (`module.exports`) and ES module (`export`) styles may be used.
  ```js
  // CommonJS example
  module.exports = function installTarget() { ... };

  // ES module example
  export function addSkill() { ... }
  ```

**Commit Messages**
- Use [Conventional Commits](https://www.conventionalcommits.org/) with these prefixes: `fix`, `feat`, `docs`, `chore`
  - Example: `feat: add support for new install target`
- Average commit message length: ~56 characters

---

## Workflows

### Add or Update a Skill
**Trigger:** When introducing or enhancing a skill for agents  
**Command:** `/add-skill`

1. Create or update `skills/<skill-name>/SKILL.md`
2. Optionally update `AGENTS.md`, `README.md`, and `docs/zh-CN/AGENTS.md` to reflect new skill counts or documentation
3. If related, update manifest files like `manifests/install-modules.json`

```plaintext
skills/myNewSkill/SKILL.md
AGENTS.md
README.md
docs/zh-CN/AGENTS.md
manifests/install-modules.json
```

---

### Add or Update an Agent
**Trigger:** When adding a new agent or modifying agent behavior  
**Command:** `/add-agent`

1. Create or update `agents/<agent-name>.md`
2. Optionally update `AGENTS.md` and `README.md` to reflect the new agent
3. If part of a workflow, add or update `skills/<workflow>/SKILL.md`

---

### Add or Update a Command
**Trigger:** When introducing a new command or enhancing an existing workflow  
**Command:** `/add-command`

1. Create or update `commands/<command-name>.md`
2. If related to a workflow, update `skills/<workflow>/SKILL.md`
3. Optionally update documentation or examples

---

### Add or Update an Install Target
**Trigger:** When supporting a new install environment or tool  
**Command:** `/add-install-target`

1. Create or update `scripts/lib/install-targets/<target>.js`
2. Update `manifests/install-modules.json` and `schemas/ecc-install-config.schema.json`
3. Add or update documentation in `.<target>/README.md` and install scripts
4. Update or add tests in `tests/lib/install-targets.test.js`

```js
// Example: scripts/lib/install-targets/vscode.js
module.exports = function installVSCode() {
  // installation logic here
};
```

---

### Update Catalog or Documentation
**Trigger:** When syncing documentation and catalogs with codebase changes  
**Command:** `/update-docs`

1. Update `AGENTS.md`, `README.md`, `README.zh-CN.md`
2. Update `docs/zh-CN/AGENTS.md` and `docs/zh-CN/README.md`
3. Optionally update `WORKING-CONTEXT.md` and other supporting docs

---

### Add or Update a Hook or Script
**Trigger:** When improving or fixing automation in the development workflow  
**Command:** `/update-hook`

1. Update `hooks/hooks.json` or `scripts/hooks/*.js`
2. Update or add related test files in `tests/hooks/`
3. If needed, update supporting shell scripts

---

### Dependency Bump via Dependabot
**Trigger:** When dependabot detects an out-of-date dependency  
**Command:** `/bump-dependency`

1. Update dependency version in `package.json` or workflow YAML
2. Update lockfile (`yarn.lock` or `package-lock.json`)
3. Update `.github/workflows/*.yml` as needed

---

## Testing Patterns

- Test files use the pattern `*.test.js`
- Testing framework is not explicitly specified; use standard Node.js testing conventions
- Place tests alongside related modules or in a `tests/` directory

```js
// Example: tests/lib/install-targets.test.js
const installTarget = require('../../scripts/lib/install-targets/vscode');
test('should install VSCode target', () => {
  expect(installTarget()).toBe(true);
});
```

---

## Commands

| Command            | Purpose                                                      |
|--------------------|--------------------------------------------------------------|
| /add-skill         | Add or update a skill module                                 |
| /add-agent         | Add or update an agent definition                            |
| /add-command       | Add or update a user-facing command/workflow                 |
| /add-install-target| Add or update support for a new install environment/platform |
| /update-docs       | Update documentation and catalogs                            |
| /update-hook       | Add or update automation hooks or scripts                    |
| /bump-dependency   | Bump dependencies via dependabot or manually                 |
```
