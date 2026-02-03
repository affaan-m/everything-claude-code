# Lesson 6: MCPs — Connecting to the Outside World

## What Are MCPs?

MCP stands for **Model Context Protocol**. MCPs are **connectors** that give
Claude Code access to external tools, services, and data sources.

Without MCPs, Claude can only work with local files and terminal commands.
With MCPs, Claude can:
- Query databases directly
- Create GitHub issues and PRs
- Check monitoring dashboards
- Send messages
- Deploy applications
- Access documentation portals

## Real-World Analogy

As a system engineer, your workstation connects to many tools:

| Tool | What You Do With It |
|------|-------------------|
| JIRA/ServiceNow | Track tickets and changes |
| Splunk/ELK | Search logs |
| Nessus/Tenable | Run vulnerability scans |
| GitHub/GitLab | Manage code |
| AWS Console | Manage infrastructure |
| Confluence | Read/write documentation |

MCPs are like giving Claude Code login credentials to these same tools.
Instead of switching between 6 browser tabs, you tell Claude:
"Check Splunk for failed login attempts in the last hour" — and it does.

## How MCPs Work

```
You: "Show me open security tickets"
        ↓
Claude Code
        ↓
MCP Server (Jira connector)
        ↓
Jira API
        ↓
Results flow back to Claude
        ↓
Claude: "Here are 5 open security tickets..."
```

### MCP Architecture

```
Claude Code  ←→  MCP Server  ←→  External Service
  (client)      (translator)        (API)
```

The MCP Server translates Claude's requests into API calls. Each MCP server
exposes **tools** that Claude can use.

## Installing MCP Servers

### Method 1: CLI Commands

```bash
# HTTP-based (for cloud services)
claude mcp add --transport http github https://api.githubcopilot.com/mcp/

# SSE-based (server-sent events)
claude mcp add --transport sse my-server https://my-server.com/mcp

# Local stdio (runs on your machine)
claude mcp add --transport stdio database -- npx -y @bytebase/dbhub \
  --dsn "postgresql://user:pass@localhost/mydb"
```

### Method 2: Config File

Create or edit `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-filesystem"],
      "env": {
        "ALLOWED_PATHS": "/home/user/projects"
      }
    }
  }
}
```

### Method 3: Interactive

```
/mcp
```

## Scopes — Where MCPs Apply

```bash
# Local (default) — private to you, this project, not in git
claude mcp add --transport http myservice https://example.com/mcp

# Project — shared with team, saved in .mcp.json (in git)
claude mcp add --transport http myservice --scope project https://example.com/mcp

# User — available across ALL your projects
claude mcp add --transport http myservice --scope user https://example.com/mcp
```

## Managing MCPs

```bash
# List all configured MCPs
claude mcp list

# Get details about one
claude mcp get github

# Remove one
claude mcp remove github

# Inside Claude Code
/mcp          # Interactive MCP management
```

## Popular MCP Servers

### For System Engineers

| MCP Server | What It Provides |
|-----------|-----------------|
| **GitHub** | PRs, issues, code search, reviews |
| **Postgres/MySQL** | Direct database queries |
| **Filesystem** | Controlled file system access |
| **Memory** | Persistent key-value memory |
| **Sequential Thinking** | Structured reasoning steps |
| **Sentry** | Error monitoring and debugging |

### For Cloud/Infrastructure

| MCP Server | What It Provides |
|-----------|-----------------|
| **AWS** | EC2, S3, IAM, CloudWatch |
| **Cloudflare** | Workers, DNS, firewall |
| **Vercel** | Deployments, functions |
| **Railway** | App deployments |

### For Documentation/Knowledge

| MCP Server | What It Provides |
|-----------|-----------------|
| **Context7** | Up-to-date library docs |
| **Firecrawl** | Web scraping and crawling |
| **Notion** | Notes, databases, wikis |

## Practical Example: Database MCP

### Setup

```bash
claude mcp add --transport stdio postgres -- \
  npx -y @bytebase/dbhub \
  --dsn "postgresql://readonly:password@localhost:5432/rmf_db"
```

### Usage in Claude Code

```
"Show me all controls that are marked as 'Not Implemented'"

"How many POA&M items are overdue?"

"Which systems have the most open findings?"
```

Claude translates your natural language into SQL queries, runs them through
the MCP, and presents the results.

## Practical Example: GitHub MCP

### Setup

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

### Usage in Claude Code

```
"Show me all open PRs in the compliance-tools repo"

"Create an issue for the SSH hardening finding we discussed"

"Review the latest PR and check for security issues"
```

## Environment Variables in MCP Config

Use `${VAR}` syntax for secrets so they're not stored in config files:

```json
{
  "mcpServers": {
    "database": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@bytebase/dbhub"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

Set the env var before starting Claude Code:
```bash
export DATABASE_URL="postgresql://user:pass@host/db"
claude
```

---

## Exercises

### Exercise 1: Set Up Your First MCP

See `exercises/exercise-1-first-mcp.md`

### Exercise 2: Use the Memory MCP

See `exercises/exercise-2-memory-mcp.md`

### Exercise 3: Use the Sequential Thinking MCP

See `exercises/exercise-3-thinking-mcp.md`

---

## Security Considerations

MCPs give Claude access to external systems. Be careful:

1. **Use read-only credentials** when possible
2. **Scope access narrowly** — don't give Claude admin access
3. **Use environment variables** for secrets — never hardcode in `.mcp.json`
4. **Review MCP permissions** with `/mcp` before starting work
5. **Project-scope MCPs** are shared — don't put secrets in them
6. **Audit usage** — check what MCPs are doing in your sessions

## Tips

- **Start with read-only MCPs**: Give Claude read access first. Add write
  access only when needed.
- **Use `--scope project`** for team-shared MCPs that everyone needs.
- **Environment variables**: Always use `${VAR}` for any credentials.
- **Check `/mcp`**: Run this periodically to see what's connected and
  authenticated.

## What's Next?

You've learned all six core concepts! In the **Mini Project**, you'll put
everything together in an RMF-themed project that uses rules, commands,
skills, hooks, agents, and MCPs.
