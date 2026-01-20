# Hooks System

## Hook Types

- **PreToolUse**: Before tool execution (validation, parameter modification)
- **PostToolUse**: After tool execution (auto-format, checks)
- **Stop**: When session ends (final verification)

## Recommended Hooks for Odoo Development

### PreToolUse

```json
{
  "PreToolUse": [
    {
      "matcher": "tool == 'Bash' && tool_input.command matches 'docker.*-d.*--stop-after-init'",
      "hooks": [{"type": "confirm"}],
      "description": "Confirm before running Odoo update commands"
    },
    {
      "matcher": "tool == 'Write' && tool_input.file_path matches '\\.md$'",
      "hooks": [{"type": "block", "message": "Avoid creating markdown files unless explicitly requested"}],
      "description": "Block unnecessary documentation file creation"
    }
  ]
}
```

### PostToolUse

```json
{
  "PostToolUse": [
    {
      "matcher": "tool == 'Edit' && tool_input.file_path matches '\\.py$'",
      "hooks": [
        {"type": "command", "command": "flake8 ${file_path} --max-line-length=120"}
      ],
      "description": "Run flake8 on Python files after edit"
    },
    {
      "matcher": "tool == 'Edit' && tool_input.file_path matches '\\.py$'",
      "hooks": [
        {"type": "command", "command": "grep -n '_logger.info' ${file_path} && echo 'WARNING: Consider using _logger.debug instead'"}
      ],
      "description": "Warn about _logger.info usage - prefer _logger.debug"
    },
    {
      "matcher": "tool == 'Edit' && tool_input.file_path matches 'models/.*\\.py$'",
      "hooks": [
        {"type": "command", "command": "grep -L '_description' ${file_path} && echo 'WARNING: Model missing _description attribute'"}
      ],
      "description": "Check for missing _description on models"
    },
    {
      "matcher": "tool == 'Bash' && tool_input.command matches 'gh pr create'",
      "hooks": [
        {"type": "command", "command": "echo 'PR created. Check GitHub Actions status.'"}
      ],
      "description": "Remind to check GitHub Actions after PR creation"
    }
  ]
}
```

### Stop

```json
{
  "Stop": [
    {
      "hooks": [
        {"type": "command", "command": "git diff --name-only | xargs grep -l 'print(' 2>/dev/null && echo 'WARNING: print() statements found in modified files'"}
      ],
      "description": "Check for print() statements before session ends"
    },
    {
      "hooks": [
        {"type": "command", "command": "git diff --name-only | xargs grep -l '\\.sudo()' 2>/dev/null | xargs grep -L '#.*[Ss]udo' && echo 'WARNING: Undocumented sudo() usage found'"}
      ],
      "description": "Check for undocumented sudo() usage"
    }
  ]
}
```

## Odoo-Specific Hook Examples

### Model Security Check
```json
{
  "matcher": "tool == 'Write' && tool_input.file_path matches 'models/.*\\.py$' && tool_input.content matches '_name\\s*='",
  "hooks": [
    {"type": "command", "command": "echo 'REMINDER: New model detected. Ensure ACLs are added to ir.model.access.csv'"}
  ],
  "description": "Remind to add ACLs when creating new models"
}
```

### XML View Validation
```json
{
  "matcher": "tool == 'Edit' && tool_input.file_path matches '\\.xml$'",
  "hooks": [
    {"type": "command", "command": "xmllint --noout ${file_path} 2>&1 || echo 'XML syntax error'"}
  ],
  "description": "Validate XML syntax after editing views"
}
```

## Auto-Accept Permissions

Use with caution:
- Enable for trusted, well-defined plans
- Disable for exploratory work
- Never use dangerously-skip-permissions flag
- Configure `allowedTools` in `~/.claude.json` instead

## TodoWrite Best Practices

Use TodoWrite tool to:
- Track progress on multi-step tasks
- Verify understanding of instructions
- Enable real-time steering
- Show granular implementation steps

Todo list reveals:
- Out of order steps
- Missing items
- Extra unnecessary items
- Wrong granularity
- Misinterpreted requirements

## Environment Variable Placeholders

Hooks should use environment variables for flexibility:
- `$ODOO_CONTAINER` - Docker container name
- `$ODOO_DB` - Database name
- `$ODOO_PORT` - Web server port

Example:
```json
{
  "matcher": "tool == 'Bash' && tool_input.command matches 'odoo.*test'",
  "hooks": [
    {"type": "command", "command": "docker exec $ODOO_CONTAINER python3 -m odoo.tests.loader ${module}.tests"}
  ]
}
```
