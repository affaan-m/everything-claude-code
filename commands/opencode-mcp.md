---
description: Configure, test, and manage MCP (Model Context Protocol) servers
usage: opencode --opencode-mcp [action] [server-name]
---

# OpenCode MCP Manager

Configure and manage MCP servers that provide tools to OpenCode agents.

## Purpose

MCP servers extend OpenCode's capabilities by providing:
- Web tools (search, fetch, scrape)
- File system tools (SQLite, filesystem access)
- API tools (external services)
- Custom tool providers

This command helps you set up, test, and debug MCP servers.

## Actions

### `list` - Show configured MCP servers
```bash
opencode --opencode-mcp list
```

Shows:
- Server name and type (local/remote)
- Configuration
- Status (running/stopped/error)
- Available tools
- Last error (if any)

### `info` - Get detailed server information
```bash
opencode --opencode-mcp info <server-name>
```

Displays:
- Server configuration
- All available tools
- Tool descriptions and signatures
- Usage examples
- Performance metrics

### `test` - Test MCP server connectivity
```bash
opencode --opencode-mcp test <server-name>
```

Verifies:
- Server starts successfully
- Connects without timeout
- Can list tools
- Returns valid tool schemas
- No errors in initialization

### `call` - Make a test tool call
```bash
opencode --opencode-mcp call <server-name> <tool-name> [args...]
```

Examples:
```bash
# Test web search
opencode --opencode-mcp call web-search search "claude ai"

# Test file operations
opencode --opencode-mcp call sqlite query "SELECT * FROM users"

# Test custom tools
opencode --opencode-mcp call my-api fetch "https://api.example.com/data"
```

### `config` - Show/edit MCP configuration
```bash
opencode --opencode-mcp config [show|edit|validate]
```

**show**: Display current MCP configuration from `opencode.json`

```bash
opencode --opencode-mcp config show
```

Output:
```json
{
  "mcp": {
    "web-search": {
      "type": "local",
      "command": ["npx", "-y", "web-search"],
      "enabled": true
    },
    "api-tools": {
      "type": "remote",
      "url": "https://mcp.example.com/api",
      "oauth": {
        "clientId": "...",
        "clientSecret": "..."
      }
    }
  }
}
```

**edit**: Open MCP configuration in editor

```bash
opencode --opencode-mcp config edit
```

Then reload to apply changes.

**validate**: Check configuration validity

```bash
opencode --opencode-mcp config validate
```

Checks:
- Valid JSON syntax
- Required fields present
- Command paths exist (for local servers)
- URLs valid (for remote servers)
- OAuth credentials present (if needed)

### `add` - Add a new MCP server
```bash
opencode --opencode-mcp add <name> --type=local|remote [options]
```

**Add local MCP server**:
```bash
opencode --opencode-mcp add web-tools \
  --type=local \
  --command="npx -y mcp-web-search"
```

**Add remote MCP server**:
```bash
opencode --opencode-mcp add api-gateway \
  --type=remote \
  --url="https://mcp.api.example.com" \
  --oauth-id="client-id" \
  --oauth-secret="client-secret"
```

### `remove` - Remove an MCP server
```bash
opencode --opencode-mcp remove <server-name>
```

⚠️ Removes server from `opencode.json`. Backup first!

### `enable` - Enable a disabled server
```bash
opencode --opencode-mcp enable <server-name>
```

Sets `enabled: true` in configuration.

### `disable` - Disable a server temporarily
```bash
opencode --opencode-mcp disable <server-name>
```

Sets `enabled: false` without removing configuration.

### `reload` - Reload all MCP servers
```bash
opencode --opencode-mcp reload
```

Restarts all configured MCP servers.

### `logs` - View MCP server logs
```bash
opencode --opencode-mcp logs <server-name> [--tail=50]
```

Shows:
- Recent server output
- Error messages
- Startup logs
- Performance warnings

### `health` - Check MCP server health
```bash
opencode --opencode-mcp health
```

Comprehensive health report:
```
MCP Servers Health Report
═════════════════════════════════════════

Server Status Summary:
  3/4 servers healthy
  1 server has warnings
  0 servers offline

Per-Server Details:
─────────────────

✓ web-search (local)
  Status: Healthy
  Tools: 3 available
  Uptime: 2h 15m
  Response time: 245ms avg

✓ sqlite (local)
  Status: Healthy
  Tools: 4 available
  Uptime: 5h
  Response time: 12ms avg

⚠ api-gateway (remote)
  Status: Slow responses
  Tools: 8 available
  Uptime: 23h
  Response time: 2500ms avg
  → Suggestion: Check network or server load

✗ custom-api (remote)
  Status: Offline
  Tools: 2 configured (unreachable)
  Error: Connection timeout after 30s
  → Action: Check if server is running
```

## Configuration Format

### Local MCP Server
```json
{
  "mcp": {
    "server-name": {
      "type": "local",
      "command": ["npx", "-y", "mcp-package"],
      "args": ["--option", "value"],
      "environment": {
        "API_KEY": "${env:MY_API_KEY}",
        "DEBUG": "true"
      },
      "timeout": 30000,
      "enabled": true
    }
  }
}
```

### Remote MCP Server
```json
{
  "mcp": {
    "remote-server": {
      "type": "remote",
      "url": "https://mcp.example.com/api",
      "oauth": {
        "clientId": "your-client-id",
        "clientSecret": "${env:MCP_CLIENT_SECRET}"
      },
      "timeout": 60000,
      "enabled": true
    }
  }
}
```

## Common MCP Servers

### Web & Search Tools
```bash
# Web search (Exa)
opencode --opencode-mcp add web-search \
  --type=local \
  --command="npx -y @modelcontextprotocol/server-exa"

# Web fetch
opencode --opencode-mcp add web-fetch \
  --type=local \
  --command="npx -y web-fetch-mcp"
```

### File System & Database
```bash
# SQLite
opencode --opencode-mcp add sqlite \
  --type=local \
  --command="npx -y @modelcontextprotocol/server-sqlite" \
  --args="--db" --args="/path/to/database.db"

# Filesystem access
opencode --opencode-mcp add filesystem \
  --type=local \
  --command="npx -y @modelcontextprotocol/server-filesystem"
```

### API Gateways
```bash
# GraphQL
opencode --opencode-mcp add graphql \
  --type=remote \
  --url="https://graphql.api.example.com"

# REST API Gateway
opencode --opencode-mcp add rest-gateway \
  --type=remote \
  --url="https://api.example.com/mcp"
```

## Testing Workflow

### 1. Install MCP package
```bash
npm install -g mcp-package-name
# or
npx -y mcp-package-name  # To test without installing
```

### 2. Add to OpenCode
```bash
opencode --opencode-mcp add my-server \
  --type=local \
  --command="npx -y mcp-package-name"
```

### 3. Validate configuration
```bash
opencode --opencode-mcp config validate
```

### 4. Test connectivity
```bash
opencode --opencode-mcp test my-server
```

### 5. List available tools
```bash
opencode --opencode-mcp info my-server
```

### 6. Make test call
```bash
opencode --opencode-mcp call my-server my-tool "test argument"
```

### 7. Check health
```bash
opencode --opencode-mcp health
```

## Troubleshooting

### Server won't start

**Diagnosis**:
```bash
opencode --opencode-mcp test my-server
```

**Common causes**:

| Error | Cause | Fix |
|-------|-------|-----|
| "Command not found" | Package not installed | `npm install mcp-package` |
| "Timeout after 30s" | Server taking too long | Increase `timeout` in config |
| "Port already in use" | Another server running | Kill other process or change port |
| "Module not found" | Dependency missing | Check package.json dependencies |

**Solution steps**:
```bash
# 1. Verify package installed
npm list mcp-package

# 2. Test command directly
npx -y mcp-package

# 3. Check logs
opencode --opencode-mcp logs my-server --tail=100

# 4. Disable and re-enable
opencode --opencode-mcp disable my-server
opencode --opencode-mcp enable my-server

# 5. Reload all
opencode --opencode-mcp reload
```

### Tool call fails

**Diagnosis**:
```bash
opencode --opencode-mcp call my-server my-tool "test arg"
```

**Common causes**:

| Error | Solution |
|-------|----------|
| Tool not found | `opencode --opencode-mcp info my-server` to verify |
| Invalid arguments | Check tool schema: `opencode --opencode-mcp info my-server` |
| Authentication failed | Verify API keys/credentials in config |
| Timeout | Increase server timeout or check network |

### Performance degradation

**Check health**:
```bash
opencode --opencode-mcp health
```

**Solutions**:
- Increase timeout if server is slow
- Disable unused servers to reduce memory
- Restart servers: `opencode --opencode-mcp reload`
- Check server logs: `opencode --opencode-mcp logs <name>`

## Examples

### Set up web search
```bash
# 1. Add server
opencode --opencode-mcp add web-search \
  --type=local \
  --command="npx -y @modelcontextprotocol/server-exa"

# 2. Test
opencode --opencode-mcp test web-search

# 3. Make test call
opencode --opencode-mcp call web-search search "opencode platform"

# 4. Check health
opencode --opencode-mcp health
```

### Configure remote API gateway
```bash
# 1. Add remote server
opencode --opencode-mcp add api-gateway \
  --type=remote \
  --url="https://mcp.api.example.com" \
  --oauth-id="my-client-id" \
  --oauth-secret="my-client-secret"

# 2. Validate config
opencode --opencode-mcp config validate

# 3. Test connection
opencode --opencode-mcp test api-gateway

# 4. List tools
opencode --opencode-mcp info api-gateway
```

### Diagnose and fix broken server
```bash
# 1. Check health
opencode --opencode-mcp health

# 2. See what's wrong
opencode --opencode-mcp test broken-server

# 3. Check logs
opencode --opencode-mcp logs broken-server --tail=100

# 4. Validate config
opencode --opencode-mcp config validate

# 5. Reload
opencode --opencode-mcp reload

# 6. Test again
opencode --opencode-mcp test broken-server
```

## Best Practices

**DO:**
- Test servers before deploying to production
- Use environment variables for secrets (not hardcoded)
- Enable only servers you actively use
- Monitor server health regularly
- Document custom MCP servers in comments

**DON'T:**
- Hardcode API keys in configuration
- Leave slow servers enabled (they block other operations)
- Run too many servers (memory overhead)
- Ignore timeout warnings (tune timeouts)
- Use untrusted remote MCP servers

## Environment Variables in Config

Reference environment variables safely:

```json
{
  "mcp": {
    "api": {
      "type": "local",
      "command": ["npx", "-y", "mcp-api"],
      "environment": {
        "API_KEY": "${env:MY_API_KEY}",
        "API_URL": "${env:API_URL}",
        "DEBUG": "false"
      }
    }
  }
}
```

The `${env:VAR_NAME}` syntax is replaced with the value of environment variable `VAR_NAME` at startup.

## When to Use

- **Setting up MCP servers**: Use `add`, `test`, `info`
- **Debugging server issues**: Use `test`, `logs`, `health`
- **Managing multiple servers**: Use `list`, `enable`, `disable`
- **Monitoring performance**: Use `health`, `logs`
- **Configuring tools**: Use `config show/edit/validate`

## Verification Checklist

After configuring an MCP server:

- [ ] Server configuration valid JSON
- [ ] Command/URL correct and accessible
- [ ] Credentials (if needed) in environment variables
- [ ] Server passes connectivity test
- [ ] Tools appear in server info
- [ ] Test tool calls work
- [ ] Server shows healthy status
- [ ] No timeout errors in logs
