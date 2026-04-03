---
name: signbee-esignatures
description: E-signature workflows using the Signbee MCP server. Send documents for legally binding signing with SHA-256 audit certificates from agent workflows.
origin: community
---

# E-Signature Workflows with Signbee MCP

Patterns for integrating legally binding e-signatures into agentic workflows using the Signbee MCP server.

## When to Activate

- Agent needs to send a contract or agreement for signing
- Building deal-closing or onboarding pipelines
- Automating NDA, SOW, or services agreement workflows
- Any flow requiring a legally binding signature with an audit trail

## Setup

Install the MCP server:

```json
{
  "mcpServers": {
    "signbee": {
      "command": "npx",
      "args": ["-y", "signbee-mcp"],
      "env": {
        "SIGNBEE_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Core Tools

| Tool | Purpose |
|------|---------|
| `send_document` | Send a document (markdown or PDF) to one or more signers |
| `get_document_status` | Check signing progress and retrieve audit certificates |
| `list_documents` | List all documents and their current status |

## Workflow Patterns

### Simple Contract Signing

```
1. Draft a contract as markdown
2. Call send_document with signer email(s)
3. Signbee converts markdown to PDF automatically
4. Signers receive email with signing link
5. Poll get_document_status or listen for webhook callback
6. Download SHA-256 audit certificate on completion
```

### Multi-MCP Deal Pipeline

Chain Signbee with other MCP servers for end-to-end deal automation:

```
Firecrawl MCP → scrape prospect info
     ↓
Gmail/AgentMail → send outreach email
     ↓
Cal.com MCP → book meeting
     ↓
Agent drafts contract as markdown
     ↓
Signbee MCP → send for signing
     ↓
Webhook → trigger next steps
```

### Contract Templates

Keep reusable markdown templates in your project:

```
/templates
  ├── nda.md
  ├── services-agreement.md
  ├── sow.md
  └── freelancer-contract.md
```

The agent customises template variables (party names, dates, terms) before sending via Signbee.

## Key Decisions

- **Markdown contracts work.** Agents think in text. Signbee auto-converts markdown to formatted PDF for the signer.
- **SHA-256 certificates matter.** Every signed document gets a cryptographic audit certificate, establishing legal validity.
- **Webhooks over polling.** Configure webhook URLs to receive real-time notifications when documents are signed, rather than polling `get_document_status`.
- **Free tier for testing.** Signbee has a free plan for low-volume use, sufficient for testing full pipelines.

## Related

- [Signbee MCP on npm](https://www.npmjs.com/package/signbee-mcp)
- [signbee.com](https://signbee.com)
