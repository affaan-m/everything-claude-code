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

## Security Resources

- **AgentShield**: Scan your agent config for vulnerabilities — `npx ecc-agentshield scan`
- **Security Guide**: [The Shorthand Guide to Everything Agentic Security](./the-security-guide.md)
- **OWASP MCP Top 10**: [owasp.org/www-project-mcp-top-10](https://owasp.org/www-project-mcp-top-10/)
- **OWASP Agentic Applications Top 10**: [genai.owasp.org](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)
