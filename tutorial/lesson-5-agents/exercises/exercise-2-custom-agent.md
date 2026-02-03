# Exercise 2: Create a Custom Agent

## Goal

Create a `config-auditor` agent that reviews configuration files for security
issues specific to your RMF project.

## Step 1: Create the Agent File

Save as `.claude/agents/config-auditor.md`:

```yaml
---
name: config-auditor
description: >
  Audits configuration files for security issues and compliance gaps.
  Use when the user creates, modifies, or asks about configuration files
  such as YAML, JSON, INI, TOML, or .conf files.
allowed-tools:
  - Read
  - Grep
  - Glob
model: haiku
---

# Configuration Auditor

You are a configuration security specialist. When given a config file, check:

## Security Checks
1. Default credentials or passwords present?
2. Debug mode or verbose logging enabled in production?
3. Insecure protocols (HTTP, FTP, Telnet) configured?
4. Unnecessary ports or services enabled?
5. Missing encryption settings?
6. Overly permissive access controls?

## Compliance Checks (NIST 800-53)
1. CM-6: Configuration settings match security benchmarks?
2. CM-7: Unnecessary functions disabled?
3. SC-8: Transmission confidentiality (TLS/SSL)?
4. SC-28: Protection of information at rest (encryption)?
5. AC-17: Remote access properly restricted?

## Output Format

Rate each check: PASS / FAIL / WARNING / N/A

Provide:
- Overall security score (1-10)
- Critical findings (must fix)
- Recommendations (should fix)
- Informational notes
```

## Step 2: Create Test Files

Create `test-configs/nginx.conf`:

```nginx
server {
    listen 80;
    server_name example.com;

    # No HTTPS redirect!

    location / {
        proxy_pass http://backend:3000;
    }

    location /admin {
        # No authentication required!
        proxy_pass http://backend:3000/admin;
    }

    # Server version exposed
    server_tokens on;

    # Directory listing enabled
    autoindex on;
}
```

Create `test-configs/app-config.yaml`:

```yaml
database:
  host: db.internal.example.com
  port: 5432
  username: admin
  password: admin123  # Default password!
  ssl: false

logging:
  level: DEBUG  # Should be INFO/WARN in production
  include_sensitive_data: true  # Should be false!

session:
  timeout: 86400  # 24 hours - too long
  secure_cookie: false

api:
  rate_limit: 0  # No rate limiting
  cors_origin: "*"  # Too permissive
```

## Step 3: Test the Agent

Start Claude Code and:

```
"Review the config files in test-configs/ for security issues"
```

Claude should detect that config files are involved and delegate to
your config-auditor agent.

## Step 4: Verify

- [ ] Agent was triggered (check for subagent activity)
- [ ] nginx.conf issues found: no HTTPS, no auth on /admin, server_tokens, autoindex
- [ ] app-config.yaml issues found: default password, SSL off, debug logging, etc.
- [ ] NIST controls referenced (CM-6, CM-7, SC-8, etc.)
- [ ] Security score provided
- [ ] Actionable fix recommendations given

## Bonus Challenge

Modify the agent to also check against CIS Benchmarks. Add a section for
CIS-specific checks and test it against your config files.
