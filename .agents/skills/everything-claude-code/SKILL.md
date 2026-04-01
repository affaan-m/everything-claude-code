```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches the core development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` repository. The codebase is JavaScript-based, with no specific framework, and focuses on modular skills, agent orchestration, and extensible install targets. It emphasizes clear documentation, conventional commits, and structured workflows for adding, updating, and refactoring both code and documentation.

---

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and directories.
  - Example: `mySkill.js`, `installTarget.js`

**Import Style**
- Use relative imports.
  ```js
  // Good
  const helper = require('./helper');
  ```

**Export Style**
- Both CommonJS (`module.exports`) and ES module (`export`) styles are used.
  ```js
  // CommonJS
  module.exports = function mySkill() { ... };

  // ES Module
  export function mySkill() { ... }
  ```

**Commit Messages**
- Follow [Conventional Commits](https://www.conventionalcommits.org/) with prefixes:
  - `fix:`, `feat:`, `docs:`, `chore:`
  - Example: `feat: add Gemini install target support`

---

## Workflows

### Add New Skill or Agent
**Trigger:** When introducing a new skill or agent to the system  
**Command:** `/add-skill`

1. Create or update `SKILL.md` in `skills/`, `.agents/skills/`, or `.claude/skills/`.
2. Add or update the agent definition in `agents/` or `.agents/skills/`.
3. Update `manifests/install-modules.json` or similar manifest/config files.
4. Update `AGENTS.md` and/or `README.md` to document the new skill/agent.

**Example Directory Structure:**
```
skills/
  myNewSkill/
    index.js
    SKILL.md
agents/
  myAgent.js
manifests/
  install-modules.json
```

---

### Add or Update Command Workflow
**Trigger:** When introducing or improving a workflow command for agents or skills  
**Command:** `/add-command`

1. Create or update a command file in `commands/`.
2. Update related documentation (`README.md`, `AGENTS.md`, etc.).
3. If needed, update scripts or manifests to register the command.

**Example:**
```
commands/
  orchestrateAgents.md
README.md
```

---

### Refactor Skill or Agent
**Trigger:** When improving, merging, or restructuring existing skills or agent definitions  
**Command:** `/refactor-skill`

1. Update or merge `SKILL.md` files in `skills/` or `.agents/skills/`.
2. Remove or update legacy command files in `commands/`.
3. Update documentation (`AGENTS.md`, `README.md`, etc.).
4. Update manifests or scripts as needed.

---

### Add or Update Install Target
**Trigger:** When supporting a new environment or platform for installation  
**Command:** `/add-install-target`

1. Add or update install scripts in a dedicated directory (e.g., `.gemini/`, `.codebuddy/`).
2. Update `manifests/install-modules.json` and relevant schemas.
3. Update or add scripts in `scripts/lib/install-targets/*.js`.
4. Update or add tests for the new install target.

**Example:**
```
.gemini/
  install.js
schemas/
  install-modules.schema.json
scripts/lib/install-targets/
  gemini.js
tests/lib/
  install-targets.test.js
```

---

### Documentation Update or Sync
**Trigger:** When updating, syncing, or clarifying documentation  
**Command:** `/update-docs`

1. Update documentation files (`README.md`, `AGENTS.md`, `WORKING-CONTEXT.md`, `docs/zh-CN/*`, etc.).
2. Update or add related markdown files for troubleshooting or guides.
3. Sync documentation across different language versions if needed.

---

### CI/CD Workflow Update
**Trigger:** When updating CI/CD pipeline configuration or dependencies  
**Command:** `/update-ci`

1. Update `.github/workflows/*.yml` files.
2. Update `package.json`, `yarn.lock`, or similar dependency files.
3. Update or add tests or validation scripts as needed.

---

## Testing Patterns

- Test files use the pattern `*.test.js`.
- The testing framework is not explicitly specified; check for usage of common tools like Jest or Mocha.
- Place tests alongside the code they cover or in a dedicated `tests/` directory.

**Example:**
```
tests/
  lib/
    install-targets.test.js
```

---

## Commands

| Command           | Purpose                                                        |
|-------------------|----------------------------------------------------------------|
| /add-skill        | Add a new skill or agent, including documentation and config   |
| /add-command      | Add or update a workflow command for agents or skills          |
| /refactor-skill   | Refactor or merge skills/agents and update related docs        |
| /add-install-target | Add or update an install target and related scripts/tests    |
| /update-docs      | Update or synchronize documentation across the codebase        |
| /update-ci        | Update CI/CD workflows, dependencies, or validation scripts    |
```
