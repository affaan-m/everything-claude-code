# Debug Tricks

Tricks to speed up debugging Next.js applications.

## MCP Endpoint (Dev Server)

Next.js exposes a `/_next/mcp` endpoint in development for AI-assisted debugging via MCP (Model Context Protocol).

- **Next.js 16+**: Enabled by default, use `next-devtools-mcp`
- **Next.js < 16**: Requires `experimental.mcpServer: true` in next.config.js

Reference: https://nextjs.org/docs/app/guides/mcp

**Important**: Find the actual port of the running Next.js dev server (check terminal output or `package.json` scripts). Don't assume port 3000.

### Request Format

The endpoint uses JSON-RPC 2.0 over HTTP POST:

```bash
curl -X POST http://localhost:<port>/_next/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": "1",
    "method": "tools/call",
    "params": {
      "name": "<tool-name>",
      "arguments": {}
    }
  }'
```

### Available Tools

#### `get_errors`
Get current errors from dev server (build errors, runtime errors with source-mapped stacks):
```json
{ "name": "get_errors", "arguments": {} }
```

#### `get_routes`
Discover all routes by scanning filesystem:
```json
{ "name": "get_routes", "arguments": {} }
// Optional: { "name": "get_routes", "arguments": { "routerType": "app" } }
```
Returns: `{ "appRouter": ["/", "/api/users/[id]", ...], "pagesRouter": [...] }`

#### `get_project_metadata`
Get project path and dev server URL:
```json
{ "name": "get_project_metadata", "arguments": {} }
```
Returns: `{ "projectPath": "/path/to/project", "devServerUrl": "http://localhost:3000" }`

#### `get_page_metadata`
Get runtime metadata about current page render (requires active browser session):
```json
{ "name": "get_page_metadata", "arguments": {} }
```
Returns segment trie data showing layouts, boundaries, and page components.

#### `get_logs`
Get path to Next.js development log file:
```json
{ "name": "get_logs", "arguments": {} }
```
Returns path to `<distDir>/logs/next-development.log`

#### `get_server_action_by_id`
Locate a Server Action by ID:
```json
{ "name": "get_server_action_by_id", "arguments": { "actionId": "<action-id>" } }
```

### Example: Get Errors

```bash
curl -X POST http://localhost:<port>/_next/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":"1","method":"tools/call","params":{"name":"get_errors","arguments":{}}}'
```

## Rebuild Specific Routes (Next.js 16+)

Use `--debug-build-paths` to rebuild only specific routes instead of the entire app:

```bash
# Rebuild a specific route
next build --debug-build-paths "/dashboard"

# Rebuild routes matching a glob
next build --debug-build-paths "/api/*"

# Dynamic routes
next build --debug-build-paths "/blog/[slug]"
```

Use this to:
- Quickly verify a build fix without full rebuild
- Debug static generation issues for specific pages
- Iterate faster on build errors
