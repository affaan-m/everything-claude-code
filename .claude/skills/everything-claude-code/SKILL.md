```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development conventions and workflows for the `everything-claude-code` repository. The codebase is written in JavaScript (no framework), and is organized to support modular agent, skill, and command development for automation and orchestration. It emphasizes clear commit patterns, consistent file naming, and a structured approach to adding or updating features, documentation, and CI/CD processes.

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and modules.
  - Example: `mySkillModule.js`, `installTargetScript.js`

**Import Style**
- Use **relative imports** for modules within the project.
  ```js
  // Good
  const helper = require('./utils/helper');
  // Avoid absolute or package imports for local files
  ```

**Export Style**
- Both CommonJS (`module.exports`) and ES6 (`export`) styles are used. Choose based on context.
  ```js
  // CommonJS
  module.exports = function myFunction() { ... };

  // ES6
  export function myFunction() { ... }
  ```

**Commit Patterns**
- Use [Conventional Commits](https://www.conventionalcommits.org/) with these prefixes:
  - `fix:`, `feat:`, `docs:`, `chore:`
- Keep commit messages clear and around 57 characters.
  ```
  feat: add support for new agent workflow
  fix: correct relative import path in install script
  ```

## Workflows

### Add or Update a Skill
**Trigger:** When introducing or updating a skill for agents or workflows  
**Command:** `/add-skill`

1. Create or update `SKILL.md` in `skills/`, `.agents/skills/`, or `.claude/skills/`.
2. Optionally update `manifests/install-modules.json` or related manifest files.
3. Optionally update `AGENTS.md`, `README.md`, or `WORKING-CONTEXT.md` to document the skill.
4. Optionally add or update test files or supporting scripts.

**Example:**
```bash
# Add a new skill
mkdir -p skills/myNewSkill
touch skills/myNewSkill/SKILL.md
# Document the skill and update manifests as needed
```

---

### Add or Update a Command
**Trigger:** When introducing or improving a command for agentic workflows  
**Command:** `/add-command`

1. Create or update a markdown file in `commands/`.
2. Optionally update `README.md`, `AGENTS.md`, or other documentation.
3. Optionally update supporting scripts or test files.

**Example:**
```bash
touch commands/myNewCommand.md
# Document the command and link in README.md if needed
```

---

### Add or Update an Agent
**Trigger:** When introducing or modifying an agent's definition or behavior  
**Command:** `/add-agent`

1. Create or update agent definition markdown files in `agents/`.
2. Optionally update `AGENTS.md` or related documentation.
3. Optionally update configuration files (e.g., `.opencode/opencode.json`, `.codex/agents/*.toml`).

**Example:**
```bash
touch agents/myAgent.md
# Update AGENTS.md to reflect the new agent
```

---

### Add or Update an Install Target
**Trigger:** When supporting a new IDE/platform or improving installation  
**Command:** `/add-install-target`

1. Add or update install scripts and documentation under a dot-directory (e.g., `.codebuddy/`, `.gemini/`).
2. Update `manifests/install-modules.json` and `schemas/ecc-install-config.schema.json`.
3. Update or add scripts in `scripts/lib/install-targets/*.js` for the new target.
4. Update or add tests for the new install target.

**Example:**
```bash
mkdir .myIDE
touch .myIDE/README.md
# Update manifests/install-modules.json
```

---

### Refactor Commands to Skills
**Trigger:** When migrating legacy command logic into skills-based architecture  
**Command:** `/refactor-to-skills`

1. Update or remove `commands/*.md` files as needed.
2. Create or update `skills/*/SKILL.md` files.
3. Update documentation (`AGENTS.md`, `README.md`, etc.) to reflect changes.
4. Update `manifests/install-modules.json` if needed.

---

### Documentation Sync or Update
**Trigger:** When updating documentation for new features or reducing drift  
**Command:** `/sync-docs`

1. Update `README.md`, `README.zh-CN.md`, `AGENTS.md`, `WORKING-CONTEXT.md`, and `docs/zh-CN/*`.
2. Update or add documentation in `.claude-plugin/`, `.codex-plugin/`, or other plugin directories.
3. Optionally update `package.json` or scripts if documentation affects tooling.

---

### CI/CD Workflow Update
**Trigger:** When updating CI/CD pipelines, dependencies, or automation  
**Command:** `/update-ci`

1. Update `.github/workflows/*.yml` files.
2. Optionally update `package.json` or `yarn.lock` for dependency alignment.
3. Optionally update scripts or test files related to CI/CD.

---

## Testing Patterns

- Test files are named with the pattern `*.test.js`.
- The testing framework is **unknown**; check existing test files for conventions.
- Place tests alongside the code they test or in a dedicated `tests/` directory.

**Example:**
```js
// mySkill.test.js
const mySkill = require('./mySkill');

test('should perform expected behavior', () => {
  expect(mySkill()).toBe(true);
});
```

## Commands

| Command            | Purpose                                                        |
|--------------------|----------------------------------------------------------------|
| /add-skill         | Add or update a skill and its documentation                    |
| /add-command       | Add or update a command for agent workflows                    |
| /add-agent         | Add or update an agent definition                              |
| /add-install-target| Add or update support for a new installation target            |
| /refactor-to-skills| Migrate command logic into skills-based architecture           |
| /sync-docs         | Synchronize or update documentation across files and languages |
| /update-ci         | Update CI/CD workflow files and dependencies                   |
```
