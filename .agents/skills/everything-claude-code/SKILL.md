```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development patterns, coding conventions, and workflow automation for the `everything-claude-code` repository. The codebase is JavaScript-based (no framework), focused on modular agent and skill development, extensible install targets, and robust workflow automation. It emphasizes clear structure, maintainability, and automation via CLI commands and scripts.

## Coding Conventions

- **File Naming:**  
  Use `camelCase` for JavaScript files and folders.  
  _Example:_  
  ```
  scripts/lib/installTargets.js
  installModules.json
  ```

- **Import Style:**  
  Use **relative imports** for internal modules.  
  _Example:_  
  ```js
  const { installTarget } = require('./installTarget');
  ```

- **Export Style:**  
  Mixed usage of CommonJS (`module.exports`) and ES6 (`export`) depending on context.  
  _Example (CommonJS):_  
  ```js
  module.exports = function install() { ... };
  ```
  _Example (ES6):_  
  ```js
  export function install() { ... }
  ```

- **Commit Messages:**  
  Use prefixes: `fix:`, `feat:`, `docs:`, `chore:`  
  _Example:_  
  ```
  feat: add Gemini install target support
  fix: correct agent registration logic
  ```

## Workflows

### Add New Install Target
**Trigger:** When you want to support installation for a new platform or environment.  
**Command:** `/add-install-target`

1. Add or update the install target script in `scripts/lib/install-targets/`.
2. Add or update the manifest entry in `manifests/install-modules.json`.
3. Update or add schema in `schemas/ecc-install-config.schema.json` and/or `schemas/install-modules.schema.json`.
4. Update `scripts/lib/install-manifests.js` and `scripts/lib/install-targets/registry.js` as needed.
5. Add or update documentation in `README.md` and/or `.target/README.md`.
6. Add or update tests in `tests/lib/install-targets.test.js`.

_Example:_  
```js
// scripts/lib/install-targets/gemini.js
module.exports = function installGemini(config) {
  // implementation
};
```

---

### Add New Agent or Skill
**Trigger:** When introducing a new agent or skill for a workflow or capability.  
**Command:** `/add-skill`

1. Create the agent definition in `agents/` or `skills/<skill>/SKILL.md`.
2. Add supporting files (references, scripts, rules) under `skills/<skill>/`.
3. Update `AGENTS.md` and/or `manifests/install-modules.json` if needed.
4. Add or update related tests if applicable.

_Example:_  
```
skills/mySkill/SKILL.md
skills/mySkill/references/example.md
```

---

### Add or Extend Command Workflow
**Trigger:** When adding or improving a CLI command or agentic workflow.  
**Command:** `/add-command`

1. Create or update command documentation in `commands/*.md`.
2. If related to OpenCode, update `.opencode/commands/*.md`.
3. Address review feedback by refining docs or implementation.
4. Add or update related tests if applicable.

---

### Add or Update OpenCode Agent Prompts
**Trigger:** When introducing or updating OpenCode agent prompts.  
**Command:** `/add-opencode-agent`

1. Add or update prompt files in `.opencode/prompts/agents/*.txt`.
2. Update agent registration in `.opencode/opencode.json`.
3. Update `AGENTS.md` if agent count or details change.

---

### Add or Update Hook Script
**Trigger:** When adding, optimizing, or fixing a workflow hook (e.g., format, typecheck).  
**Command:** `/add-hook`

1. Add or update hook implementation in `scripts/hooks/*.js` or `scripts/hooks/*.sh`.
2. Update hook configuration in `hooks/hooks.json`.
3. Add or update related tests in `tests/hooks/*.test.js`.

---

### Add or Update Skill with Multiple Supporting Files
**Trigger:** When introducing or expanding a complex skill with rules, references, or scripts.  
**Command:** `/add-complex-skill`

1. Create `SKILL.md` in `skills/<skill>/`.
2. Add supporting files (rules, references, scripts).
3. Update `manifests/install-modules.json` if needed.
4. Update `AGENTS.md` or `README.md` if the skill catalog changes.

---

### CI or Dependency Update
**Trigger:** When updating CI workflows or bumping dependency versions.  
**Command:** `/update-deps`

1. Update workflow files in `.github/workflows/*.yml`.
2. Update `package.json`, `yarn.lock`, or `package-lock.json`.
3. Update `.github/dependabot.yml` if needed.

---

### Security or Supply Chain Hardening
**Trigger:** When addressing security or supply chain risks.  
**Command:** `/harden-security`

1. Remove or revert files introducing risky dependencies.
2. Pin dependency versions in config files (e.g., `.mcp.json`, `package.json`).
3. Update documentation or warnings in relevant skill/plugin docs.

---

### Merge Main or Feature Branch
**Trigger:** When syncing your feature branch with main or another branch.  
**Command:** `/merge-main`

1. Merge branch using git.
2. Resolve conflicts and update files across the codebase.
3. Update lockfiles and configuration as needed.

---

## Testing Patterns

- **Test Files:**  
  Use the pattern `*.test.js` for test files.
- **Framework:**  
  Testing framework is not specified; use standard Node.js testing or your preferred tool.
- **Location:**  
  Place tests alongside the code in `tests/` directories.

_Example:_  
```
tests/lib/install-targets.test.js
```

_Basic test example:_  
```js
// tests/lib/install-targets.test.js
const { installGemini } = require('../../scripts/lib/install-targets/gemini');

test('installGemini installs correctly', () => {
  // test implementation
});
```

## Commands

| Command             | Purpose                                                        |
|---------------------|----------------------------------------------------------------|
| /add-install-target | Add support for a new install target/platform                  |
| /add-skill          | Add a new agent or skill                                       |
| /add-command        | Add or extend a CLI/agentic command                            |
| /add-opencode-agent | Add or update OpenCode agent prompts                           |
| /add-hook           | Add or update a workflow hook script                           |
| /add-complex-skill  | Add or expand a skill with multiple supporting files           |
| /update-deps        | Update CI workflows or dependencies                            |
| /harden-security    | Harden security or supply chain (remove/pin risky dependencies)|
| /merge-main         | Merge main or another branch into your working branch          |
```
