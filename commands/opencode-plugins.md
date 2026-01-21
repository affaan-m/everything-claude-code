---
description: Manage OpenCode plugins and extensions
usage: opencode --opencode-plugins [action] [options]
---

# OpenCode Plugins Manager

Install, configure, debug, and manage plugins.

## Actions

### `list` - Show installed plugins
```bash
opencode --opencode-plugins list
```

Displays:
- Plugin name and version
- Load status (✓ or ✗)
- URL/location
- Hooks registered
- Tools provided
- Last error (if any)

### `install` - Add a new plugin
```bash
opencode --opencode-plugins install <url|npm-package>
```

Examples:
```bash
# Install from npm
opencode --opencode-plugins install @opencode/supermemory

# Install from local file
opencode --opencode-plugins install file:///path/to/plugin.js

# Install from GitHub
opencode --opencode-plugins install https://github.com/user/plugin/raw/main/dist/plugin.js
```

Adds to `opencode.json` → `plugin` array and reloads.

### `remove` - Uninstall a plugin
```bash
opencode --opencode-plugins remove <plugin-name>
```

Removes from `opencode.json` and reloads.

### `validate` - Check plugin syntax
```bash
opencode --opencode-plugins validate <plugin-url>
```

Tests:
- JavaScript syntax validity
- Module exports structure
- Required `init` function exists
- No obvious errors

### `test` - Run plugin in isolation
```bash
opencode --opencode-plugins test <plugin-url> [--hook=<event>]
```

Tests:
- Plugin loads successfully
- `init` function completes
- Can register hooks
- No startup errors

### `enable` - Enable a disabled plugin
```bash
opencode --opencode-plugins enable <plugin-name>
```

Sets `enabled: true` in config.

### `disable` - Disable a plugin temporarily
```bash
opencode --opencode-plugins disable <plugin-name>
```

Sets `enabled: false` in config without removing.

### `reload` - Reload all plugins
```bash
opencode --opencode-plugins reload
```

Useful after editing plugin files.

### `doctor` - Diagnose plugin issues
```bash
opencode --opencode-plugins doctor
```

Checks:
- All plugin URLs are accessible
- JavaScript syntax is valid
- Required functions are exported
- No circular dependencies
- No version conflicts
- Hook registrations are consistent

### `info` - Show plugin details
```bash
opencode --opencode-plugins info <plugin-name>
```

Displays:
- Full plugin metadata
- Source URL
- All hooks registered (with line numbers)
- All tools provided
- Error history

## Plugin Structure

A valid plugin exports:

```javascript
module.exports = {
  name: "my-plugin",
  version: "1.0.0",
  
  async init(hooks, config) {
    // Required: initialization function
    console.log("Plugin initialized");
    
    // Register hooks
    hooks.before('command', async (payload) => {
      return payload;
    });
    
    hooks.after('command', async (payload) => {
      console.log("Command completed");
    });
  }
};
```

## Plugin Best Practices

**DO:**
- Keep plugins focused on ONE concern
- Initialize quickly (< 1 second)
- Handle errors gracefully
- Document hooks clearly
- Use consistent naming

**DON'T:**
- Load large dependencies synchronously
- Make blocking network calls in `init`
- Access files outside allowed paths
- Modify global state
- Register duplicate hooks

## Common Plugin Patterns

### Pattern: Audit logging
```javascript
module.exports = {
  name: 'audit-logger',
  async init(hooks) {
    hooks.after('write', async (p) => {
      console.log(`[AUDIT] ${p.path} modified`);
    });
  }
};
```

### Pattern: Input validation
```javascript
module.exports = {
  name: 'input-validator',
  async init(hooks) {
    hooks.before('command', async (p) => {
      if (p.args.user === 'admin') {
        throw new Error('Admin commands disabled');
      }
      return p;
    });
  }
};
```

### Pattern: Rate limiting
```javascript
module.exports = {
  name: 'rate-limiter',
  version: '1.0.0',
  
  async init(hooks) {
    const calls = {};
    const LIMIT = 10; // per minute
    
    hooks.before('command', async (p) => {
      const key = p.name;
      calls[key] = (calls[key] || 0) + 1;
      
      if (calls[key] > LIMIT) {
        throw new Error(`Rate limit exceeded for ${key}`);
      }
      
      return p;
    });
  }
};
```

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Plugin won't load | Syntax error | `opencode --opencode-plugins validate <url>` |
| Hooks not firing | Not registered in `init` | Check that `hooks.before/after` is called |
| Plugin slow | Heavy initialization | Profile with `opencode --opencode-plugins test --debug` |
| Conflicts with other plugins | Hook order issues | Use `opencode --opencode-hooks trace` to debug |
| Permission denied | File access issue | Check that paths are in allowed directories |

## Examples

### Install supermemory plugin
```bash
opencode --opencode-plugins install @opencode/supermemory
opencode --opencode-plugins validate @opencode/supermemory
opencode --opencode-plugins info supermemory
```

### Create and test custom plugin
```bash
# Create plugin
cat > ~/.config/opencode/plugin/my-plugin.js << 'EOF'
module.exports = {
  name: 'my-plugin',
  version: '1.0.0',
  async init(hooks) {
    hooks.on('startup', async () => {
      console.log('My plugin started');
    });
  }
};
EOF

# Validate
opencode --opencode-plugins validate file:///home/user/.config/opencode/plugin/my-plugin.js

# Install
opencode --opencode-plugins install file:///home/user/.config/opencode/plugin/my-plugin.js

# Verify
opencode --opencode-plugins list
```

### Disable a problematic plugin
```bash
# See what's broken
opencode --opencode-plugins doctor

# Disable it
opencode --opencode-plugins disable problematic-plugin

# Test if system works
opencode help

# Re-enable when fixed
opencode --opencode-plugins enable problematic-plugin
```
