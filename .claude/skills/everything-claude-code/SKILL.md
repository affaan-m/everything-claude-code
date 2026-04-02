```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development patterns, workflows, and conventions used in the `everything-claude-code` repository. It covers how to contribute new skills, agents, commands, install targets, and documentation, as well as how to follow the project's coding and commit standards. This guide is essential for consistent, high-quality contributions to the codebase.

## Coding Conventions

**Language:** JavaScript  
**Framework:** None detected

### File Naming

- Use **camelCase** for file names.
  - Example: `mySkillHandler.js`, `installTargetManager.js`

### Import Style

- Use **relative imports** for modules within the repository.
  - Example:
    ```js
    const utils = require('./utils');
    import { runTest } from '../testHelpers';
    ```

### Export Style

- **Mixed**: Both CommonJS (`module.exports`) and ES module (`export`) styles may be present.
  - Example (CommonJS):
    ```js
    module.exports = function doSomething() { ... };
    ```
  - Example (ES Module):
    ```js
    export function doSomethingElse() { ... }
    ```

### Commit Messages

- Use **conventional commit** prefixes: `fix`, `feat`, `docs`, `chore`.
- Average commit message length: ~56 characters.
  - Example:
    ```
    feat: add new agent pipeline for document summarization
    fix: correct import path in installTargetManager.js
    ```

## Workflows

### Add New Skill
**Trigger:** When introducing a new skill (capability, workflow, or integration) to the platform  
**Command:** `/add-skill`

1. Create or update `skills/<skill-name>/SKILL.md` (and/or `.agents/skills/<skill-name>/SKILL.md`).
2. Optionally add related references or assets (e.g., `references/`, `assets/`).
3. Update documentation: `AGENTS.md`, `README.md`, `README.zh-CN.md`, and `docs/zh-CN/AGENTS.md`.
4. If the skill is installable, update `manifests/install-components.json` or `install-modules.json`.

**Example:**
```bash
# Add a new skill called "summarizer"
mkdir -p skills/summarizer
touch skills/summarizer/SKILL.md
# Document the skill and update manifests if needed
```

---

### Add New Agent or Agent Pipeline
**Trigger:** When adding a new agent or multi-agent workflow to the system  
**Command:** `/add-agent-pipeline`

1. Create `agents/<agent-name>.md` for each new agent.
2. Create or update `skills/<pipeline-or-skill-name>/SKILL.md` to document/orchestrate the pipeline.
3. Optionally add related commands (`commands/<command>.md`) or scripts.
4. Update `AGENTS.md` and related documentation.

**Example:**
```bash
touch agents/summarizerAgent.md
touch skills/summarizerPipeline/SKILL.md
```

---

### Add or Extend Command Workflow
**Trigger:** When adding or updating a workflow command (e.g., PRP, review, GAN)  
**Command:** `/add-command`

1. Create or update `commands/<command-name>.md` with YAML frontmatter, usage, and output sections.
2. Iterate on the command file to address review feedback.
3. Optionally update related skills or agent documentation.

**Example:**
```markdown
---
name: summarize
description: Summarizes input text using the summarizer agent.
---
# Usage
...
```

---

### Add New Install Target or Adapter
**Trigger:** When supporting a new install target (platform, IDE, or agent runtime)  
**Command:** `/add-install-target`

1. Add a new directory for the install target (e.g., `.codebuddy/`, `.gemini/`).
2. Add install/uninstall scripts and README files.
3. Update `manifests/install-modules.json` and `schemas/ecc-install-config.schema.json`.
4. Update scripts in `scripts/lib/install-manifests.js` and `scripts/lib/install-targets/<target>.js`.
5. Update or add tests for the new target.

**Example:**
```bash
mkdir .codebuddy
touch .codebuddy/README.md
```

---

### Update Hooks or Hook Scripts
**Trigger:** When changing how hooks are triggered, processed, or validated  
**Command:** `/update-hook`

1. Edit `hooks/hooks.json` to add, remove, or modify hook definitions.
2. Update or add scripts in `scripts/hooks/` (e.g., `session-start.js`, `post-edit-accumulator.js`).
3. Update or add tests in `tests/hooks/`.
4. Optionally update related documentation or configuration.

**Example:**
```json
// hooks/hooks.json
{
  "pre-commit": ["scripts/hooks/format.js"]
}
```

---

### Dependency Update via Dependabot
**Trigger:** When a new version of a dependency is available  
**Command:** `/bump-dependency`

1. Update `package.json` and/or `yarn.lock` for npm dependencies.
2. Update `.github/workflows/*.yml` for GitHub Actions dependencies.
3. Commit with a standardized message and co-authored-by dependabot.

**Example:**
```bash
npm install some-package@latest
git commit -m "chore: bump some-package to 1.2.3"
```

---

### Docs and Guidance Update
**Trigger:** When improving or adding documentation or guidance  
**Command:** `/update-docs`

1. Edit or add markdown files in the root, `docs/`, or `skills/` directories.
2. Update `WORKING-CONTEXT.md`, `AGENTS.md`, `README.md`, and/or `docs/zh-CN/*`.
3. Optionally update plugin or skill documentation.

**Example:**
```bash
vim README.md
git commit -m "docs: clarify agent pipeline usage"
```

## Testing Patterns

- **Test files:** Use the `*.test.js` pattern.
- **Testing framework:** Not explicitly detected; use standard Node.js testing or your preferred framework.
- **Location:** Tests are typically placed alongside implementation files or in a `tests/` directory.

**Example:**
```js
// skills/summarizer/summarizer.test.js
const summarizer = require('./summarizer');

test('summarizes text', () => {
  expect(summarizer('This is a long text.')).toBe('Summary.');
});
```

## Commands

| Command            | Purpose                                                    |
|--------------------|------------------------------------------------------------|
| /add-skill         | Add a new skill, including documentation and assets        |
| /add-agent-pipeline| Add a new agent or multi-agent pipeline                    |
| /add-command       | Add or extend a workflow command                           |
| /add-install-target| Add support for a new install target or adapter            |
| /update-hook       | Update hooks or hook scripts                               |
| /bump-dependency   | Update dependencies via Dependabot                         |
| /update-docs       | Update documentation or guidance                           |
```
