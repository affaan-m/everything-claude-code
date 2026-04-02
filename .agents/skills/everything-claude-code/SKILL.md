```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development patterns, coding conventions, and workflow practices used in the `everything-claude-code` repository. The project is written in JavaScript (no framework detected) and focuses on modular skills, agent extensibility, and robust automation for installation, documentation, and CI/CD. This guide will help you contribute effectively by following established conventions and workflows.

## Coding Conventions

**File Naming**
- Use camelCase for JavaScript files and folders.
  - Example: `voiceProfileSchema.js`, `installManifests.js`

**Import Style**
- Use relative imports.
  - Example:
    ```js
    const installManifests = require('./installManifests');
    ```

**Export Style**
- Mixed: both CommonJS (`module.exports`) and ES module (`export`) patterns may be found.
  - Example (CommonJS):
    ```js
    module.exports = function doSomething() { ... };
    ```
  - Example (ES module):
    ```js
    export function doSomething() { ... }
    ```

**Commit Messages**
- Use [Conventional Commits](https://www.conventionalcommits.org/):
  - Prefixes: `fix:`, `feat:`, `docs:`, `chore:`
  - Example: `feat: add support for new install target (Gemini)`

## Workflows

### Add New Skill or Agent
**Trigger:** When you want to introduce a new capability, workflow, or agent to the platform.  
**Command:** `/add-skill`

1. Create a new `SKILL.md` in `skills/<skill-name>/` or `.agents/skills/<skill-name>/`.
2. Optionally add reference files (e.g., `references/voice-profile-schema.md`) or assets.
3. Update `AGENTS.md` to document the new skill/agent.
4. Update `README.md` and `README.zh-CN.md` for user-facing documentation.
5. Update `docs/zh-CN/AGENTS.md` and `docs/zh-CN/README.md` for Chinese docs.
6. Update `manifests/install-modules.json` and/or `install-components.json` to register the skill/agent.

**Example directory structure:**
```
skills/
  voiceAssistant/
    SKILL.md
    index.js
references/
  voice-profile-schema.md
```

---

### Add or Update Command Workflow
**Trigger:** When you want to introduce a new command-line workflow or extend an existing one.  
**Command:** `/add-command`

1. Create or update command markdown files in `commands/`.
2. Document usage, purpose, and output in the command file.
3. Optionally update related agent or skill docs if command is part of a larger workflow.
4. Address review feedback and iterate on command implementation.

**Example:**
```
commands/
  prp.md
  gan.md
```

---

### Install Target Adaptation
**Trigger:** When you want to support a new IDE, platform, or environment for installation.  
**Command:** `/add-install-target`

1. Add install and uninstall scripts for the new target (e.g., `.codebuddy/install.sh`, `.codebuddy/install.js`).
2. Add or update README files for the new target.
3. Update `manifests/install-modules.json` and `schemas/ecc-install-config.schema.json`.
4. Update `scripts/lib/install-manifests.js` and `scripts/lib/install-targets/<target>.js`.
5. Update tests for install targets.

**Example:**
```
.codebuddy/
  install.sh
  install.js
schemas/
  ecc-install-config.schema.json
scripts/lib/
  install-manifests.js
  install-targets/codebuddy.js
```

---

### Documentation and Guidance Update
**Trigger:** When you want to improve or synchronize documentation and repo guidance.  
**Command:** `/update-docs`

1. Edit or add files in `README.md`, `README.zh-CN.md`, `AGENTS.md`, `WORKING-CONTEXT.md`, and `docs/zh-CN/*`.
2. Optionally update or add new markdown files for troubleshooting or guidance.
3. Synchronize documentation across English and Chinese versions.

**Example:**
```
README.md
README.zh-CN.md
docs/zh-CN/README.md
docs/TROUBLESHOOTING.md
```

---

### CI/CD GitHub Actions Dependency Bump
**Trigger:** When you want to keep CI/CD dependencies up to date for security or compatibility.  
**Command:** `/bump-ci-deps`

1. Update version numbers for actions in `.github/workflows/*.yml`.
2. Commit with a standardized message (often via dependabot).
3. Optionally update lockfiles or related config.

**Example:**
```yaml
# .github/workflows/ci.yml
- uses: actions/checkout@v4
- uses: actions/setup-node@v3
```

---

### Hook or Script Refactor and Hardening
**Trigger:** When you want to improve reliability, performance, or security of hooks and scripts.  
**Command:** `/refactor-hook`

1. Edit `hooks/hooks.json` to adjust hook configuration.
2. Refactor or add scripts in `scripts/hooks/`.
3. Update or add related test files in `tests/hooks/` or `tests/scripts/`.
4. Address review feedback for edge cases or platform compatibility.

**Example:**
```
hooks/hooks.json
scripts/hooks/pre-commit.js
tests/hooks/pre-commit.test.js
```

## Testing Patterns

- Test files are named with the pattern `*.test.js`.
- The testing framework is not explicitly specified; look for standard Node.js or popular test runners (e.g., Jest, Mocha).
- Place tests alongside the code they cover or in dedicated `tests/` directories.

**Example:**
```
tests/lib/install-targets.test.js
scripts/hooks/pre-commit.js
tests/hooks/pre-commit.test.js
```

## Commands

| Command           | Purpose                                                      |
|-------------------|--------------------------------------------------------------|
| /add-skill        | Add a new skill or agent, including documentation and assets |
| /add-command      | Add or update a workflow command                             |
| /add-install-target | Add support for a new install target (IDE/platform)        |
| /update-docs      | Update or synchronize documentation and guidance             |
| /bump-ci-deps     | Update CI/CD GitHub Actions dependencies                    |
| /refactor-hook    | Refactor or harden hook scripts and related tests            |
```