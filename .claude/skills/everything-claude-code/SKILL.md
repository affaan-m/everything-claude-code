```markdown
# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill introduces the core development patterns, coding conventions, and collaborative workflows used in the `everything-claude-code` JavaScript repository. It covers how to add new agents, skills, commands, and install targets, as well as how to maintain code quality and consistency through standardized commit messages, file organization, and testing practices. Whether you're contributing features, refactoring scripts, or updating dependencies, this guide will help you follow established best practices.

## Coding Conventions

**File Naming**
- Use `camelCase` for JavaScript files and modules.
  - Example: `installManifests.js`, `installTargets.test.js`

**Import Style**
- Use relative imports for modules within the repository.
  ```js
  // Example
  const installManifests = require('../lib/installManifests');
  ```

**Export Style**
- Mixed: both CommonJS (`module.exports = ...`) and ES6 (`export default ...`) patterns may be present.

**Commit Messages**
- Use [Conventional Commits](https://www.conventionalcommits.org/):
  - Prefixes: `fix`, `feat`, `docs`, `chore`
  - Example: `feat: add support for new install target`
  - Typical length: ~57 characters

**Documentation**
- Markdown files are used for agents, skills, commands, and workflows.
- Place skill documentation in `skills/<name>/SKILL.md`.

## Workflows

### Add New Agent or Skill
**Trigger:** When introducing a new agent or skill  
**Command:** `/add-agent-or-skill`

1. Create a new agent or skill definition file:
   - Agents: `agents/<name>.md`
   - Skills: `skills/<name>/SKILL.md`
2. Update or add related documentation:
   - `README.md`, `AGENTS.md`
3. Register the agent or skill in configuration files if necessary:
   - `.opencode/opencode.json`

**Example:**
```bash
# Add a new skill
mkdir -p skills/myNewSkill
touch skills/myNewSkill/SKILL.md
# Document the skill in AGENTS.md and README.md
```

---

### Add or Update Command
**Trigger:** When creating or enhancing a workflow command  
**Command:** `/add-command`

1. Create or update a command file in `commands/` (e.g., `commands/myCommand.md`)
2. Update related documentation or templates as needed.
3. Address review feedback and iterate on the command file.

**Example:**
```bash
touch commands/myCommand.md
# Edit and document the command
```

---

### Feature Bundle Addition
**Trigger:** When introducing a set of related features, conventions, or team/process configs  
**Command:** `/add-convention-bundle`

1. Add multiple markdown or config files under `.claude/` or `.codex/` directories.
2. Document new workflows, rules, or team configurations.
3. Optionally update identity or tools JSON files.

**Example:**
```bash
touch .claude/commands/newWorkflow.md
touch .claude/skills/mySkill/SKILL.md
touch .claude/team/newTeam.json
```

---

### Install Target Addition or Update
**Trigger:** When supporting a new installation environment or updating an existing one  
**Command:** `/add-install-target`

1. Add or update install scripts:
   - `.target/install.js`, `.target/install.sh`, `.target/uninstall.js`, `.target/uninstall.sh`
2. Update manifests and related schema files:
   - `manifests/install-modules.json`
   - `schemas/ecc-install-config.schema.json`
   - `schemas/install-modules.schema.json`
3. Update or add tests for install targets:
   - `tests/lib/install-targets.test.js`
4. Update documentation (e.g., `README.md` for the install target).

**Example:**
```bash
touch .vscode/install.js
touch .vscode/uninstall.js
# Update manifests/install-modules.json
```

---

### Dependency Bump (GitHub Actions)
**Trigger:** When a GitHub Actions dependency update is available  
**Command:** `/bump-action`

1. Update the version of a GitHub Action in `.github/workflows/*.yml`.
2. Commit with a standardized message indicating the dependency and new version.

**Example:**
```yaml
# .github/workflows/ci.yml
uses: actions/checkout@v4
```
```bash
git commit -m "chore: bump actions/checkout to v4"
```

---

### Hook or Script Refactor
**Trigger:** When improving, fixing, or refactoring hooks or supporting scripts  
**Command:** `/refactor-hook`

1. Edit `hooks/hooks.json` to update hook configuration.
2. Edit or add scripts in `scripts/hooks/` or `tests/hooks/`.
3. Update or add tests for the changed hooks or scripts.

**Example:**
```bash
vim hooks/hooks.json
touch scripts/hooks/newHook.js
touch tests/hooks/newHook.test.js
```

## Testing Patterns

- Test files use the pattern `*.test.js`.
- The testing framework is not explicitly specified; check for test runner usage in scripts or documentation.
- Place tests alongside implementation or in dedicated `tests/` directories.
- Example test file: `tests/lib/install-targets.test.js`

**Example:**
```js
// tests/lib/install-targets.test.js
const installTargets = require('../../scripts/lib/install-targets');

test('should install target correctly', () => {
  // ...test implementation...
});
```

## Commands

| Command                | Purpose                                                         |
|------------------------|-----------------------------------------------------------------|
| /add-agent-or-skill    | Add a new agent or skill with documentation and configuration   |
| /add-command           | Add or update a workflow command                               |
| /add-convention-bundle | Add a bundle of features, conventions, or team/process configs |
| /add-install-target    | Add or update an install target and related scripts/tests      |
| /bump-action           | Bump GitHub Actions dependency versions in workflows           |
| /refactor-hook         | Refactor or fix hooks and supporting scripts                   |
```
