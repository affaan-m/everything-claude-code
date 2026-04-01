```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the core development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` JavaScript repository. You'll learn how to add or update skills, agents, commands, install targets, and documentation, as well as how to maintain code quality and consistency across the project. The guide is based on real repository analysis and is designed to help contributors onboard quickly and work effectively.

---

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and directories.
  - Example: `installManifests.js`, `installTargets/registry.js`

**Import Style**
- Use relative imports for modules within the project.
  ```js
  // Example
  const registry = require('./registry');
  ```

**Export Style**
- Mixed: both CommonJS (`module.exports`) and ES6 (`export`) styles may be present.
  ```js
  // CommonJS
  module.exports = function install() { ... };

  // ES6 (if present)
  export function install() { ... }
  ```

**Commit Messages**
- Use [Conventional Commits](https://www.conventionalcommits.org/) with prefixes:
  - `fix`, `feat`, `docs`, `chore`
- Keep commit messages concise (average ~56 characters).
  - Example: `feat: add support for new install target`

---

## Workflows

### Add or Update Skill
**Trigger:** When introducing or updating a skill for agents  
**Command:** `/add-skill`

1. Create or update `SKILL.md` in `skills/<skill-name>/`
2. Optionally add or update related agent or command files
3. Update `manifests/install-modules.json` to register the skill
4. Update `AGENTS.md` and/or `README.md` to reflect the new skill
5. If documentation is multilingual, update `docs/zh-CN/` and `README.zh-CN.md`

**Example:**
```bash
# Add a new skill
mkdir -p skills/myNewSkill
nano skills/myNewSkill/SKILL.md

# Register the skill
nano manifests/install-modules.json

# Update documentation
nano AGENTS.md
nano README.md
```

---

### Add or Update Agent
**Trigger:** When introducing or updating an agent definition  
**Command:** `/add-agent`

1. Create or update agent definition in `agents/<agent-name>.md` or `.opencode/prompts/agents/`
2. Update `.opencode/opencode.json` or similar registry/config
3. Update `AGENTS.md` to reflect new/changed agents
4. Optionally update orchestration or skills that reference the agent

---

### Add or Update Command
**Trigger:** When introducing or improving a workflow command  
**Command:** `/add-command`

1. Create or update command markdown file in `commands/<command-name>.md`
2. If related, update `AGENTS.md` or `README.md` to document the new command
3. If command is part of a workflow, update or add related agent/skill files

---

### Add New Install Target or Adapter
**Trigger:** When supporting a new install environment or integration  
**Command:** `/add-install-target`

1. Create new install scripts and documentation under a dedicated directory (e.g., `.codebuddy/`, `.gemini/`)
2. Add or update install target file in `scripts/lib/install-targets/`
3. Update `manifests/install-modules.json` and `schemas/*.schema.json` as needed
4. Update `scripts/lib/install-manifests.js` and `scripts/lib/install-targets/registry.js`
5. Add or update related tests in `tests/lib/install-targets.test.js`

---

### Dependency Update via Dependabot
**Trigger:** When Dependabot detects an outdated dependency  
**Command:** `/update-dependency`

1. Update dependency version in `package.json`, `yarn.lock`, or workflow YAML
2. Regenerate lockfiles if needed
3. Commit with a standardized message referencing dependency and version
4. Optionally update `.github/dependabot.yml`

---

### Hook or CI Script Refactor or Fix
**Trigger:** When fixing, optimizing, or refactoring hooks or CI scripts  
**Command:** `/fix-hook`

1. Edit `hooks/hooks.json` and/or `scripts/hooks/*.js` or shell scripts
2. Update or add related test files in `tests/hooks/` or `tests/scripts/`
3. If needed, update configuration or schema files
4. Optionally update documentation (`WORKING-CONTEXT.md`, `README.md`)

---

### Documentation Update or Sync
**Trigger:** When updating, clarifying, or synchronizing documentation  
**Command:** `/update-docs`

1. Edit or add markdown files in `docs/`, `AGENTS.md`, `README.md`, `WORKING-CONTEXT.md`, etc.
2. If multilingual, update `docs/zh-CN/` and `README.zh-CN.md`
3. Optionally update related skill or agent documentation

---

## Testing Patterns

- **Test Files:** Use the pattern `*.test.js` for test files.
- **Framework:** No specific testing framework detected; use standard Node.js or your preferred test runner.
- **Location:** Tests are typically placed alongside the code they test or in `tests/` subdirectories.
- **Example:**
  ```js
  // tests/lib/install-targets.test.js
  const assert = require('assert');
  const installTarget = require('../../scripts/lib/install-targets/myTarget');

  describe('installTarget', () => {
    it('should install correctly', () => {
      assert(installTarget.install());
    });
  });
  ```

---

## Commands

| Command            | Purpose                                                         |
|--------------------|-----------------------------------------------------------------|
| /add-skill         | Add or update a skill and register it with documentation        |
| /add-agent         | Add or update an agent definition and registry                  |
| /add-command       | Add or update a workflow command for agents                     |
| /add-install-target| Add support for a new install target or integration             |
| /update-dependency | Update dependencies via Dependabot or manually                  |
| /fix-hook          | Refactor or fix hooks and CI scripts                            |
| /update-docs       | Update or synchronize documentation in one or more languages    |
```
