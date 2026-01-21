---
description: Diagnose OpenCode configuration and component health
usage: opencode --opencode-doctor [--verbose] [--fix]
---

# OpenCode Doctor

Comprehensive diagnostic tool for identifying and fixing OpenCode issues.

## Purpose

Run automated health checks on your OpenCode installation to detect:
- Configuration errors
- Missing or misconfigured components
- Path issues
- Permission problems
- Common misconfigurations

## Actions

### Basic diagnosis
```bash
opencode --opencode-doctor
```

Runs all diagnostic checks and reports findings.

### Verbose mode
```bash
opencode --opencode-doctor --verbose
```

Shows detailed information for each check.

### Auto-fix mode
```bash
opencode --opencode-doctor --fix
```

⚠️ **Experimental**: Attempts to fix issues automatically. Always backup first!

## Diagnostic Checks

### 1. Configuration Files

**Checks**:
- Does `~/.config/opencode/opencode.json` exist?
- Is JSON syntax valid?
- Does `.opencode/opencode.json` exist (project-level)?
- Is project config valid JSON?
- Do both files have required fields?

**Output**:
```
✓ Global config valid
✓ Project config valid
✓ No merge conflicts
```

**Errors**:
```
✗ Global config has invalid JSON at line 15
  → Fix: python -m json.tool ~/.config/opencode/opencode.json

✗ Project config missing required fields
  → Add: "model", "theme", or other required fields
```

### 2. Component Discovery

**Checks**:
- Are skills discoverable in both locations?
- Are commands in correct directories with `.md` extension?
- Are plugins properly structured?
- Are agents properly formatted?

**Output**:
```
Global skills:  3 found
  ✓ skill-1/SKILL.md
  ✓ skill-2/SKILL.md
  ✓ skill-3/SKILL.md

Project skills: 1 found
  ✓ project-skill/SKILL.md

Commands:      6 found (all global)
  ✓ command-1.md
  ✓ command-2.md
```

**Errors**:
```
✗ Command in wrong location: command.txt (should be command.md)
✗ Skill SKILL.md frontmatter invalid YAML
✗ Plugin missing plugin.json manifest
```

### 3. YAML/JSON Validation

**Checks**:
- All YAML frontmatter in `.md` files valid?
- All JSON files parse correctly?
- All hooks.json files valid?

**Output**:
```
✓ All YAML frontmatter valid
✓ All JSON files valid
✓ All JSONC files parse
```

**Errors**:
```
✗ SKILL.md frontmatter invalid:
  Error on line 5: unexpected token

✗ hooks.json parse error:
  Duplicate key 'PreToolUse'
```

### 4. Path Portability

**Checks**:
- Any hardcoded `/home/user/` paths?
- Any paths using `~` instead of variables?
- Hooks using non-portable paths?

**Output**:
```
✓ All paths portable (using ${...} variables)
✓ No hardcoded user paths found
```

**Errors**:
```
✗ Hardcoded path in hooks.json:
  Line 12: "/home/mikeb/.opencode/hooks/script.sh"
  → Fix: Use ${OPENCODE_PLUGIN_ROOT}/hooks/script.sh

✗ Home directory shortcut in plugin:
  Line 5: "~/Documents/..."
  → Fix: Use ${HOME}/Documents/...
```

### 5. File Permissions

**Checks**:
- Are `.sh` hook scripts executable?
- Are config files readable?
- Are component directories accessible?

**Output**:
```
✓ Hook scripts executable
✓ Config files readable
✓ Component directories accessible
```

**Errors**:
```
✗ Hook script not executable:
  hooks/scripts/validate.sh
  → Fix: chmod +x hooks/scripts/validate.sh

✗ Config file not readable:
  .opencode/opencode.json
  → Fix: chmod 644 .opencode/opencode.json
```

### 6. Component Integrity

**Checks**:
- Skill SKILL.md present in all skill directories?
- Command files have proper frontmatter?
- Plugin manifests have required fields?
- All referenced files exist?

**Output**:
```
✓ All skills have SKILL.md
✓ All commands have frontmatter
✓ All plugins have manifests
✓ All file references valid
```

**Errors**:
```
✗ Skill missing SKILL.md:
  .opencode/skill/my-skill/ (SKILL.md not found)

✗ Command missing frontmatter:
  .opencode/command/test.md (no --- markers)

✗ Referenced file not found:
  plugin.json references ${OPENCODE_PLUGIN_ROOT}/lib/util.js
  → File doesn't exist
```

### 7. Naming Conflicts

**Checks**:
- Any duplicate component names (global + project)?
- Any conflicting command names?
- Any skill name collisions?

**Output**:
```
✓ No naming conflicts
✓ All component names unique
```

**Errors**:
```
✗ Naming conflict:
  Skill "setup" defined in both:
  - ~/.config/opencode/skill/setup/
  - .opencode/skill/setup/
  → Decision: Which should be used? (local wins by default)
```

### 8. MCP Server Health

**Checks**:
- Do MCP servers in config exist?
- Can local MCP commands execute?
- Are remote MCP URLs accessible?

**Output**:
```
MCP Servers: 3 configured
  ✓ local-sqlite (local) - OK
  ✓ local-fetch (local) - OK
  ✗ remote-api (remote) - UNREACHABLE
```

**Errors**:
```
✗ MCP server not found:
  Command: npx -y @modelcontextprotocol/server-sqlite
  Error: Package not installed
  → Fix: npm install @modelcontextprotocol/server-sqlite

✗ Remote MCP server unreachable:
  URL: https://mcp.example.com/api
  → Fix: Check network connection or server status
```

## Report Format

### Summary Section
```
═══════════════════════════════════════════════════════════
              OPENCODE HEALTH REPORT
═══════════════════════════════════════════════════════════

Status: ⚠️  WARNINGS FOUND (3 issues detected)

Issues by severity:
  2 critical (will break functionality)
  1 warning (should be fixed)
  0 info
```

### Detailed Findings
```
CRITICAL ISSUES (Fix immediately):
─────────────────────────────────
1. Global config has invalid JSON
   File: ~/.config/opencode/opencode.json
   Error: Syntax error at line 15, column 5
   Fix: python -m json.tool to validate

2. Hook script not executable
   File: .opencode/plugin/my-plugin/hooks/scripts/validate.sh
   Fix: chmod +x .opencode/plugin/my-plugin/hooks/scripts/validate.sh

WARNINGS (Recommended fixes):
─────────────────────────────
1. Hardcoded path in hooks.json
   File: .opencode/plugin/api-tester/hooks.json
   Line: 12
   Current: /home/user/.opencode/hooks/validate.sh
   Suggested: ${OPENCODE_PLUGIN_ROOT}/hooks/validate.sh
   Impact: Plugin won't work on different machines
```

### Summary Statistics
```
Configuration:
  Global config:    VALID ✓
  Project config:   VALID ✓
  Merge conflicts:  NONE ✓

Components:
  Skills:    3 global + 1 project (no conflicts)
  Commands:  6 global + 2 project (all unique)
  Hooks:     0 global + 1 project (valid)
  Plugins:   1 global + 2 project (valid)
  Agents:    2 global + 0 project (all unique)

Integrity:
  YAML frontmatter:  ALL VALID ✓
  JSON files:        ALL VALID ✓
  Path portability:  3 issues found
  File permissions:  1 issue found
  Naming conflicts:  NONE ✓

MCP Servers:
  Configured:  3
  Reachable:   2/3
  Issues:      1 server unreachable
```

## When to Use

Run `opencode --opencode-doctor`:

- **After adding/modifying components**: Verify syntax and structure
- **When OpenCode won't start**: Diagnose configuration issues
- **Before deploying to production**: Ensure no hidden issues
- **When components don't appear**: Check discovery and naming
- **When migrating to new machine**: Verify path portability

## Examples

### Full diagnostic
```bash
opencode --opencode-doctor

# Output shows all findings with actionable fixes
```

### Verbose analysis
```bash
opencode --opencode-doctor --verbose

# Shows detailed info for each component checked
```

### Auto-fix (experimental)
```bash
# Backup first!
cp -r ~/.config/opencode ~/.config/opencode.backup

# Auto-fix
opencode --opencode-doctor --fix

# Review changes
diff -r ~/.config/opencode ~/.config/opencode.backup
```

## Common Issues & Fixes

| Issue | Diagnosis | Fix |
|-------|-----------|-----|
| "Command not found" | Doctor says command file exists but not discoverable | Check file location and extension (must be `.md` in `command/` dir) |
| "Skill not activating" | Doctor says SKILL.md invalid | Validate YAML frontmatter with: `python -c "import yaml; yaml.safe_load(open('SKILL.md'))"` |
| "Hook won't fire" | Doctor says hook script not executable | Run: `chmod +x hooks/scripts/script.sh` |
| "Component won't load globally" | Doctor says naming conflict | Rename or remove duplicate in project config |
| "Path error on new machine" | Doctor finds hardcoded paths | Replace with `${OPENCODE_PLUGIN_ROOT}` or `${HOME}` |

## Exit Codes

- `0`: All checks pass ✓
- `1`: Warnings found (non-critical)
- `2`: Errors found (critical)
- `3`: Fatal errors (OpenCode may not work)

## Recovery

If doctor finds critical issues:

1. **Backup your config**:
   ```bash
   cp -r ~/.config/opencode ~/.config/opencode.backup-$(date +%s)
   ```

2. **Read the detailed error message**: It explains the problem

3. **Apply the suggested fix** or research the solution

4. **Run doctor again** to verify fix worked:
   ```bash
   opencode --opencode-doctor
   ```

5. **If still broken**, restore backup:
   ```bash
   rm -rf ~/.config/opencode
   mv ~/.config/opencode.backup-<timestamp> ~/.config/opencode
   ```

## Tips

- Run doctor **before** deploying changes
- Use `--verbose` when investigating specific components
- Check doctor output **regularly** (at least monthly)
- Always **backup** before using `--fix`
- Document what doctor found in your setup notes
