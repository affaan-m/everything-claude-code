# everything-claude-code Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you how to work with the everything-claude-code repository, which is a comprehensive Claude Code plugin system built in JavaScript. The repository provides AI agents, commands, skills, and rules for extending Claude's capabilities through a structured plugin architecture. It emphasizes extensibility, internationalization, and cross-platform compatibility.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names
- Agent files: `agents/agentName.md`
- Skill files: `skills/skillName/SKILL.md`
- Command files: `commands/commandName.md`
- Test files: `*.test.js`

### Import/Export Style
- Mixed import styles are acceptable (ES6 modules and CommonJS)
- Prefer consistent patterns within individual files
- Use relative paths for local modules

### Commit Messages
- Follow conventional commit format
- Common prefixes: `fix:`, `feat:`, `docs:`
- Keep messages around 53 characters average
- Examples:
  ```
  feat: add new translation agent
  fix: resolve plugin manifest validation
  docs: update skill documentation
  ```

## Workflows

### Add New Agent
**Trigger:** When someone wants to add a new AI agent for specific tasks
**Command:** `/add-agent`

1. Create agent markdown file in `agents/` directory with descriptive name
2. Add comprehensive agent description, capabilities, and usage examples
3. Update `README.md` agents section with new agent entry
4. Update `.claude-plugin/plugin.json` to include the new agent in the agents array
5. Test agent functionality through the plugin system

Example agent structure:
```markdown
# Agent Name

## Description
Brief description of what this agent does

## Capabilities
- Capability 1
- Capability 2

## Usage
Example usage patterns
```

### Add New Skill
**Trigger:** When someone wants to add a new skill domain or capability
**Command:** `/add-skill`

1. Create skill directory under `skills/` with descriptive name
2. Add `SKILL.md` file with detailed documentation including overview, patterns, and examples
3. Update `README.md` skills section with new skill entry
4. Add skill to `.claude-plugin/plugin.json` skills array
5. Include code examples and best practices in the skill documentation

### Add New Command
**Trigger:** When someone wants to add a new executable command
**Command:** `/add-command`

1. Create command markdown file in `commands/` directory
2. Document command syntax, parameters, and usage examples
3. Update `README.md` commands section with command reference
4. Add command to `.claude-plugin/plugin.json` commands array
5. Test command execution and error handling

### Plugin Manifest Fix
**Trigger:** When plugin validation fails or manifest needs updates
**Command:** `/fix-plugin-manifest`

1. Open `.claude-plugin/plugin.json` for editing
2. Validate JSON structure against Claude Code requirements
3. Fix validation errors with proper field formats and required fields
4. Reference `.claude-plugin/PLUGIN_SCHEMA_NOTES.md` for schema guidance
5. Test with plugin validator to ensure compliance

Common manifest issues:
```json
{
  "name": "string (required)",
  "version": "semver format",
  "agents": ["array of agent names"],
  "commands": ["array of command names"],
  "skills": ["array of skill names"]
}
```

### Hooks Implementation Fix
**Trigger:** When hooks need to be added, fixed, or made cross-platform
**Command:** `/fix-hooks`

1. Update `hooks/hooks.json` configuration with proper hook definitions
2. Create or update hook scripts in `scripts/hooks/` directory
3. Ensure cross-platform compatibility (Windows, macOS, Linux)
4. Add comprehensive tests in `tests/hooks/*.test.js`
5. Validate hook execution in different environments

### Documentation Localization
**Trigger:** When adding support for new languages
**Command:** `/add-translation`

1. Create `docs/{language-code}/` directory structure
2. Translate all agent, command, skill, and rule files to target language
3. Add language-specific README files (`README.{lang}.md`)
4. Update main `README.md` with language switcher navigation
5. Maintain consistency in technical terminology across translations

### Cross-Platform Compatibility
**Trigger:** When bash scripts cause issues on Windows/macOS
**Command:** `/make-cross-platform`

1. Convert shell scripts to Node.js equivalents in `scripts/` directory
2. Add utility functions to `scripts/lib/` for common operations
3. Update `hooks/hooks.json` configuration to use JavaScript scripts
4. Add comprehensive test coverage for all platforms
5. Use Node.js built-in modules for file system and process operations

Example conversion:
```javascript
// Instead of bash: ls -la
const fs = require('fs');
const files = fs.readdirSync('.', { withFileTypes: true });
```

### Security Vulnerability Fix
**Trigger:** When security vulnerabilities are discovered in code
**Command:** `/fix-security`

1. Identify command injection, XSS, or other security vulnerabilities
2. Replace unsafe string concatenation with parameterized queries/safe APIs
3. Add input validation and sanitization for user inputs
4. Update documentation with security warnings and best practices
5. Conduct security review of related code patterns

Security patterns:
```javascript
// Unsafe
const command = `git ${userInput}`;

// Safe
const { spawn } = require('child_process');
spawn('git', [sanitizedInput]);
```

## Testing Patterns

- Test files follow `*.test.js` naming convention
- Focus on testing hook functionality and cross-platform compatibility
- Include integration tests for plugin manifest validation
- Test internationalization features with multiple languages

Example test structure:
```javascript
describe('Hook functionality', () => {
  it('should execute on all platforms', () => {
    // Test implementation
  });
});
```

## Commands

| Command | Purpose |
|---------|---------|
| `/add-agent` | Add a new specialized AI agent to the project |
| `/add-skill` | Add a new skill with comprehensive documentation |
| `/add-command` | Add a new slash command to the system |
| `/fix-plugin-manifest` | Fix plugin.json validation and configuration issues |
| `/fix-hooks` | Create or fix hook implementations and configurations |
| `/add-translation` | Add translations and localized documentation |
| `/make-cross-platform` | Convert bash scripts to Node.js for cross-platform support |
| `/fix-security` | Fix security issues in scripts and configurations |