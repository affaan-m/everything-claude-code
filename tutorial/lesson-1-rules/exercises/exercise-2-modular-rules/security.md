# Security Rules

## Secrets Management
- NEVER hardcode passwords, API keys, tokens, or certificates in source code
- Use environment variables or a secrets manager (AWS Secrets Manager, Vault)
- If you see a hardcoded secret, flag it immediately and suggest remediation

## Input Validation
- Validate all external input (user input, API payloads, file uploads)
- Use parameterized queries — never string-concatenate SQL
- Sanitize file paths to prevent directory traversal

## Authentication & Authorization
- All API endpoints must require authentication
- Use role-based access control (RBAC) for authorization
- Session tokens must expire after 15 minutes of inactivity

## Logging
- Log all authentication events (success and failure)
- Log all authorization failures
- NEVER log sensitive data (passwords, SSNs, tokens)
- Use structured logging format (JSON)

## Compliance
- All changes must be traceable to an RMF control
- Reference NIST SP 800-53 controls in comments where applicable
- Example: `# AC-2: Account Management - auto-disable after 90 days`
