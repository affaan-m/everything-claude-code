---
name: api-connector-builder
description: Build API integrations and connector plugins that follow existing patterns in the target repo. Use when building new integrations for platforms like Keep, Onyx, Cal.com.
origin: community
---

# API Connector Builder

## When to Activate

- "Build a Jira connector for this project"
- "Add an SNMP provider following the existing pattern"
- "Create an integration for this API"
- "Build a plugin matching the repo's connector style"

## How It Works

1. Clone the target repo
2. Find 2-3 existing connectors/providers to study the pattern
3. Identify: base class, required methods, config schema, test pattern
4. Build the new connector following the EXACT same pattern
5. Write tests matching existing test style
6. Update registry/config files that list available connectors
7. Submit PR

## Examples

### Provider Plugin Pattern
```
providers/
  existing_provider/
    __init__.py
    provider.py      # Main class extending BaseProvider
    config.py        # Pydantic config model
  new_provider/      # What we build — same structure
    __init__.py
    provider.py
    config.py
```

### Integration Connector Pattern
```
integrations/
  existing/
    client.py        # API client
    models.py        # Data models
    connector.py     # Main connector class
  new/               # Match exactly
    client.py
    models.py
    connector.py
```

## Key APIs

- **Jira**: REST API v3, Basic/OAuth auth, `jira` Python library
- **SNMP**: pysnmp library, OIDs for device metrics
- **IMAP**: `imaplib` + `email` stdlib, IDLE for push
- **CalDAV**: `caldav` library for calendar operations

## Quality Checklist

- [ ] Follows existing repo pattern exactly
- [ ] Config model with validation
- [ ] Error handling with meaningful messages
- [ ] Tests matching existing test style
- [ ] Documentation/README
- [ ] Registered in connector registry
