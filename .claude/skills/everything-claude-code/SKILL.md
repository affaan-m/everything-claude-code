```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` JavaScript repository. It covers how to add new skills or agents, update commands, manage install targets, maintain tests, update documentation, automate hooks, and handle dependency updates. Following these patterns ensures consistency, maintainability, and ease of collaboration across the codebase.

---

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and folders.
  - Example: `installManifests.js`, `voiceProfileSchema.md`

**Import Style**
- Use relative imports.
  - Example:
    ```js
    const installManifests = require('./installManifests');
    ```

**Export Style**
- Mixed: Both CommonJS (`module.exports`) and ES6 (`export`) styles are present.
  - Example (CommonJS):
    ```js
    module.exports = function doSomething() { ... };
    ```
  - Example (ES6):
    ```js
    export function doSomething() { ... }
    ```

**Commit Messages**
- Use [Conventional Commits](https://www.conventionalcommits.org/).
- Prefixes: `fix`, `feat`, `docs`, `chore`
- Example:
  ```
  feat: add voice profile schema reference for new agent
  ```

---

## Workflows

### Add New Skill or Agent
**Trigger:** When introducing a new skill or agent to the system  
**Command:** `/add-skill`

1. Create or update `SKILL.md` in `skills/<skill-name>/` or `.agents/skills/<skill-name>/`.
2. Add or update documentation files (`README.md`, `AGENTS.md`, `docs/zh-CN/AGENTS.md`, etc.).
3. Register the new skill/agent in `manifests/install-components.json` or `manifests/install-modules.json`.
4. Optionally, add reference files or assets (e.g., `references/voice-profile-schema.md`, `assets/`).
5. If adding an agent, create `agents/<agent-name>.md`.

**Example:**
```bash
# Add a new skill called "voiceProfile"
mkdir -p skills/voiceProfile
touch skills/voiceProfile/SKILL.md
# Edit manifests/install-components.json to register
```

---

### Add or Update Command Workflow
**Trigger:** When adding or improving a CLI command  
**Command:** `/add-command`

1. Create or update `commands/<command-name>.md` with YAML frontmatter, usage, and implementation details.
2. Update related documentation (`README.md`, `AGENTS.md`).
3. Update or add corresponding skill or agent documentation if relevant.

**Example:**
```markdown
# commands/review.md

---
name: review
description: Run code review workflow
---

## Usage
...
```

---

### Add Install Target or Adapter
**Trigger:** When supporting a new IDE, tool, or platform for installation  
**Command:** `/add-install-target`

1. Create install scripts and documentation in a new folder (e.g., `.codebuddy/`, `.gemini/`).
2. Add or update install-manifests and registry scripts (`scripts/lib/install-manifests.js`, `scripts/lib/install-targets/*.js`).
3. Update schemas (`schemas/ecc-install-config.schema.json`, `schemas/install-modules.schema.json`).
4. Register the new target in `manifests/install-modules.json`.
5. Add or update tests for install targets.

**Example:**
```js
// scripts/lib/install-targets/codebuddy.js
module.exports = function installCodebuddy() { ... };
```

---

### Update or Fix Tests
**Trigger:** When fixing or updating tests for compatibility or new features  
**Command:** `/fix-test`

1. Edit test files in `tests/scripts/` or `tests/lib/` to address issues (e.g., path normalization, environment variables).
2. Update implementation files if needed to support the test fix.
3. Document the fix in the commit message.

**Example:**
```js
// tests/lib/install-targets.test.js
test('should normalize Windows paths', () => {
  ...
});
```

---

### Documentation and Guidance Update
**Trigger:** When improving or updating documentation for users or contributors  
**Command:** `/update-docs`

1. Edit or add files like `README.md`, `WORKING-CONTEXT.md`, `AGENTS.md`, `the-shortform-guide.md`, and `docs/zh-CN/*`.
2. Synchronize documentation across English and Chinese versions.
3. Update or add troubleshooting guides and best practices.

---

### Update Hooks or Automation Scripts
**Trigger:** When improving repo hooks or automation scripts  
**Command:** `/update-hook`

1. Edit `hooks/hooks.json` to add or update hook definitions.
2. Update or add scripts in `scripts/hooks/` or `scripts/lib/`.
3. Update or add tests for hooks in `tests/hooks/`.
4. Document changes in commit messages.

---

### Dependency Update via Dependabot
**Trigger:** When dependencies are bumped by dependabot or maintainers  
**Command:** `/bump-dep`

1. Update dependency version in `package.json` or workflow YAML.
2. Update lockfile (`yarn.lock` or `package-lock.json`).
3. Commit with standardized message (`chore(deps): ...`).
4. Update related workflow files if needed (`.github/workflows/*.yml`).

---

## Testing Patterns

- Test files use the pattern `*.test.js` and are located in `tests/scripts/` and `tests/lib/`.
- Testing framework is not explicitly specified; use standard Node.js test runners (e.g., Jest, Mocha).
- Tests focus on platform compatibility, feature coverage, and regression prevention.

**Example:**
```js
// tests/scripts/installScript.test.js
describe('installScript', () => {
  it('should handle environment variables', () => {
    ...
  });
});
```

---

## Commands

| Command         | Purpose                                                        |
|-----------------|----------------------------------------------------------------|
| /add-skill      | Add a new skill or agent, including docs and registration      |
| /add-command    | Add or update a CLI command and its documentation              |
| /add-install-target | Add a new install target or adapter for integration        |
| /fix-test       | Fix or update test files for compatibility or new features     |
| /update-docs    | Update documentation and guidance files                        |
| /update-hook    | Update hooks or automation scripts                             |
| /bump-dep       | Bump dependency versions via dependabot or manually            |
```
