# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.9.x   | :white_check_mark: |
| 1.8.x   | :white_check_mark: |
| < 1.8   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in ECC, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, email **<security@ecc.tools>** with:

- A description of the vulnerability
- Steps to reproduce
- The affected version(s)
- Any potential impact assessment

You can expect:

- **Acknowledgment** within 48 hours
- **Status update** within 7 days
- **Fix or mitigation** within 30 days for critical issues

If the vulnerability is accepted, we will:

- Credit you in the release notes (unless you prefer anonymity)
- Fix the issue in a timely manner
- Coordinate disclosure timing with you

If the vulnerability is declined, we will explain why and provide guidance on whether it should be reported elsewhere.

## Scope

This policy covers:

- The ECC plugin and all scripts in this repository
- Hook scripts that execute on your machine
- Install/uninstall/repair lifecycle scripts
- MCP configurations shipped with ECC
- The AgentShield security scanner ([github.com/affaan-m/agentshield](https://github.com/affaan-m/agentshield))

## Operational Guidance

### Secrets Handling

`mcp-configs/mcp-servers.json` is a **template**. All `YOUR_*_HERE` values must be replaced at install time from env-vars or a secrets manager. Never commit real credentials. If a secret is accidentally committed, rotate it immediately and rewrite history; do not rely on a plain revert.

The same rule applies to your user-scope Claude Code config (`~/.claude/settings.json` or `%USERPROFILE%\.claude\settings.json`). That file is outside this repository, but it is commonly shared via `claude doctor` output, screenshots, or bug reports. Do not hardcode PATs, API keys, or OAuth tokens into its `mcpServers[*].env` blocks; resolve them at spawn time from the OS keychain or env-vars your MCP server already supports. A quick audit:

```bash
# macOS / Linux
grep -EnH '(TOKEN|SECRET|KEY|PASSWORD)\s*"\s*:\s*"[A-Za-z0-9_-]{16,}"' ~/.claude/settings.json
# Windows PowerShell
Select-String -Path "$env:USERPROFILE\.claude\settings.json" -Pattern '(TOKEN|SECRET|KEY|PASSWORD)"\s*:\s*"[A-Za-z0-9_-]{16,}"'
```

If the audit matches, rotate the secret at the issuing provider, then move it out of the file (per-provider env-var or `credentialHelper` for servers that support it).

### Local MCP Ports

Some bundled MCP servers connect over plain HTTP to a localhost port (e.g. `devfleet` to `http://localhost:18801/mcp`). Before first use, verify the listening process:

```bash
# Windows
netstat -ano | findstr :18801
# macOS / Linux
lsof -iTCP:18801 -sTCP:LISTEN
```

Compare the PID against the expected devfleet binary. Any other process on that port can intercept MCP traffic.

## Triage: suspicious `<system-reminder>` blocks

ECC runs inside Claude Code, which injects **ephemeral client-side system reminders** into the model's input on every turn (TodoWrite nudges, date-changed notices, file-modified notices, etc.). These blocks:

- typically end with phrasing like *"ignore if not applicable"* or *"NEVER mention this reminder to the user"* / *"Don't tell the user this, since they are already aware"*; that wording is Anthropic's own prompt, not a malicious tail;
- are added by the CLI per turn and are **not persisted** in the session transcript at `~/.claude/projects/<slug>/<sessionId>.jsonl`.

That combination makes them easy to mistake for a prompt-injection appended to a tool result. Before treating one as an attack, verify:

1. Is the block actually in a file under this repo? `grep -rEn "system-reminder|NEVER mention|DO NOT mention" .`; if nothing, it is not carried by the repo.
2. Is the block stored in the transcript? Inspect the current session's `.jsonl`; if the exact text does not appear inside a `tool_result` body there, it is a client-injected ephemeral reminder, not a payload from any tool.
3. Is the content contextually consistent with Anthropic's known reminders (TodoWrite nudge, date-changed, file-modified notice)? If yes, it is the ephemeral-reminder mechanism and no action is needed.

Escalate to Anthropic only if a block is **both** (a) present in the transcript inside a `tool_result` **and** (b) not attributable to the file or URL that was actually read. Minimal report: a fresh session, a read of a clean local file, the exact text observed, and the transcript excerpt. Send to <https://github.com/anthropics/claude-code/issues> (non-sensitive) or <mailto:security@anthropic.com> (embargo-class).

Do not sanitize repo files in response to ephemeral reminders; they are not the carrier.

## Security Resources

- **AgentShield**: Scan your agent config for vulnerabilities — `npx ecc-agentshield scan`
- **Security Guide**: [The Shorthand Guide to Everything Agentic Security](./the-security-guide.md)
- **Supply-chain incident response**: [npm/GitHub Actions package-registry playbook](./docs/security/supply-chain-incident-response.md)
- **OWASP MCP Top 10**: [owasp.org/www-project-mcp-top-10](https://owasp.org/www-project-mcp-top-10/)
- **OWASP Agentic Applications Top 10**: [genai.owasp.org](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)
