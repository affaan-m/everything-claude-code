---
description: Display, validate, and debug OpenCode configuration
usage: opencode --opencode-config [action] [options]
---

# OpenCode Config Inspector

Comprehensive configuration diagnostics and debugging tool.

## Actions

### `show` - Display current configuration
```bash
opencode --opencode-config show
```

Shows:
- Active config file location
- All loaded settings
- Environment variable overrides
- Config merge result (local + global + env)
- MCP servers configured
- Plugins loaded
- Custom agents/skills/commands

### `validate` - Validate configuration without loading
```bash
opencode --opencode-config validate
```

Checks:
- JSON syntax validity
- Schema conformance
- File path existence
- MCP server accessibility
- Plugin syntax validity
- Circular dependencies

### `locations` - Show all config file locations
```bash
opencode --opencode-config locations
```

Displays:
- Global config: `~/.config/opencode/opencode.json`
- Project config: `.opencode/opencode.json`
- Environment variables active
- Config precedence order

### `diff` - Compare local vs global config
```bash
opencode --opencode-config diff
```

Shows:
- Fields in local but not global
- Fields with different values
- Merge result

### `env` - Show environment variable overrides
```bash
opencode --opencode-config env
```

Lists all `OPENCODE_*` environment variables and their values.

### `plugins` - List loaded plugins
```bash
opencode --opencode-config plugins
```

Shows:
- Plugin name and version
- Load status (✓ or ✗ with error)
- Hooks registered
- Tools provided

### `mcp` - Test MCP server connectivity
```bash
opencode --opencode-config mcp [server-name]
```

Verifies:
- Server starts successfully
- Tools are accessible
- Connection is stable
- No errors in initialization

### `backup` - Create config backup
```bash
opencode --opencode-config backup
```

Creates:
- `~/.config/opencode/opencode.json.backup.TIMESTAMP`
- Preserves current working configuration

### `restore` - Restore from backup
```bash
opencode --opencode-config restore [timestamp]
```

Restores:
- From specified backup file
- Validates restored config
- Restarts CLI if needed

### `reset` - Reset to defaults
```bash
opencode --opencode-config reset
```

⚠️ **Destructive**: Returns configuration to OpenCode defaults.

## Options

- `--json` - Output as JSON (for scripting)
- `--verbose` - Detailed diagnostics
- `--debug` - Enable debug logging

## Examples

### Diagnose config issues
```bash
# 1. Validate JSON
opencode --opencode-config validate

# 2. Show actual loaded values
opencode --opencode-config show

# 3. Check plugin status
opencode --opencode-config plugins

# 4. Test MCP servers
opencode --opencode-config mcp agent-bus
```

### Backup before changes
```bash
# 1. Backup current config
opencode --opencode-config backup

# 2. Make changes to opencode.json

# 3. Validate changes
opencode --opencode-config validate

# 4. If broken, restore
opencode --opencode-config restore
```

## When to Use

- **Before modifying config**: `validate` to ensure syntax
- **Debugging broken setup**: `show`, `plugins`, `mcp`
- **Safe experimentation**: `backup` then change, then `restore` if needed
- **Understanding precedence**: `diff` and `env`
- **Testing new MCP server**: `mcp server-name`
