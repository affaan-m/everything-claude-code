```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` repository. The project is a JavaScript codebase (no framework detected) focused on modular skills, agent orchestration, automation workflows, and extensible install targets. It emphasizes clear documentation, conventional commits, and a structured approach to adding new capabilities.

## Coding Conventions

- **File Naming:**  
  Use `camelCase` for JavaScript files and directories.  
  _Example:_  
  ```
  installTargetProject.js
  agentPipeline.md
  ```

- **Import Style:**  
  Use **relative imports** for modules within the codebase.  
  _Example:_  
  ```js
  const installTarget = require('../lib/install-targets/codeBuddy-project.js');
  ```

- **Export Style:**  
  Mixed usage of CommonJS (`module.exports`) and ES module (`export`) patterns, depending on context.  
  _Example (CommonJS):_  
  ```js
  module.exports = function installTarget() { ... };
  ```
  _Example (ESM):_  
  ```js
  export function installTarget() { ... }
  ```

- **Commit Messages:**  
  Use [Conventional Commits](https://www.conventionalcommits.org/) with prefixes: `fix`, `feat`, `docs`, `chore`.  
  _Example:_  
  ```
  feat: add support for new agent pipeline
  fix: correct install script path resolution
  ```

## Workflows

### Add New Skill
**Trigger:** When you want to add a new skill (capability, agent, or workflow)  
**Command:** `/add-skill`

1. Create a new `SKILL.md` file under `skills/<skill-name>/` or `.agents/skills/<skill-name>/`.
2. Optionally add related reference files (schemas, assets) in the skill directory.
3. Update documentation files to reference the new skill:
    - `AGENTS.md`
    - `README.md`
    - `README.zh-CN.md`
    - `docs/zh-CN/AGENTS.md`
4. Optionally update install manifests (e.g., `manifests/install-components.json`) if the skill is installable.

_Example directory structure:_
```
skills/myNewSkill/SKILL.md
skills/myNewSkill/schema.json
```

### Add New Command or Workflow
**Trigger:** When introducing a new command-line workflow or process  
**Command:** `/add-command`

1. Create a new markdown file under `commands/` (e.g., `commands/myWorkflow.md`).
2. Document the workflow with YAML frontmatter, usage, and output sections.
3. Update `AGENTS.md`, `README.md`, or other summary files to reference the new command.
4. Optionally update scripts or examples if automation is included.

_Example:_
```markdown
---
name: santa-loop
description: Automates the Santa workflow
---
# santa-loop
Usage: ...
```

### Add New Agent or Agent Pipeline
**Trigger:** When adding a new agent or multi-agent pipeline  
**Command:** `/add-agent-pipeline`

1. Create agent definition markdown files under `agents/` (e.g., `agents/myAgent.md`).
2. Optionally, create a new orchestrator skill under `skills/<pipeline>/SKILL.md`.
3. Update `AGENTS.md` and `README.md` to reference the new agent(s) or pipeline.
4. Optionally add example or configuration files.

_Example:_
```
agents/opensource-pipeline.md
skills/opensource-pipeline/SKILL.md
```

### Add or Update Install Target
**Trigger:** When supporting a new install target (IDE, platform) or updating install logic  
**Command:** `/add-install-target`

1. Add or update install scripts and documentation under `.<target>/`.
2. Update `manifests/install-modules.json` and related schemas.
3. Add or update scripts in `scripts/lib/install-targets/<target>-project.js`.
4. Update registry and test files as needed.
5. Update `README.md` or other summary docs.

_Example:_
```
.codeBuddy/install.sh
scripts/lib/install-targets/codeBuddy-project.js
```

### Update or Add Hooks and Automation
**Trigger:** When modifying or extending hooks and automation scripts  
**Command:** `/update-hooks`

1. Edit `hooks/hooks.json` to add or update hook definitions.
2. Modify or create scripts in `scripts/hooks/*.js` for hook logic.
3. Update or add related test files under `tests/hooks/`.
4. Optionally update `.cursor/hooks/` or other adapter-specific files.

_Example:_
```json
// hooks/hooks.json
{
  "pre-commit": "node scripts/hooks/format.js"
}
```

### Documentation and Guidance Update
**Trigger:** When updating documentation or adding new guidance  
**Command:** `/update-docs`

1. Edit or create markdown files in the repo root or `docs/` directories.
2. Update `WORKING-CONTEXT.md` to reflect current practices.
3. Update or add `README.md`, `README.zh-CN.md`, and `AGENTS.md`.
4. Optionally update `.claude-plugin/` or `.codex-plugin/` README files.

### Test or CI Fix
**Trigger:** When fixing or improving tests and CI integration  
**Command:** `/fix-test`

1. Edit test files under `tests/`.
2. Optionally edit scripts or hooks related to the test.
3. Update CI workflow files under `.github/workflows/` if needed.

## Testing Patterns

- **Test Framework:** Not explicitly specified; test files follow the `*.test.js` pattern.
- **Test File Location:** Place test files under `tests/`, mirroring the structure of the code they test.
- **Example:**
  ```
  tests/lib/install-targets.test.js
  tests/hooks/format.test.js
  ```
- **Running Tests:**  
  Ensure your tests are named with `.test.js` and can be run via your preferred test runner (e.g., `node`, `jest`, etc.).

## Commands

| Command            | Purpose                                                      |
|--------------------|--------------------------------------------------------------|
| /add-skill         | Add a new skill (capability, agent, or workflow)             |
| /add-command       | Add a new command or workflow                                |
| /add-agent-pipeline| Add a new agent or multi-agent pipeline                      |
| /add-install-target| Add or update an install target (IDE, platform, plugin host) |
| /update-hooks      | Update or add hooks and automation scripts                   |
| /update-docs       | Update documentation and guidance                            |
| /fix-test          | Fix or improve tests and CI integration                      |
```
