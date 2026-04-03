---
name: api-connector
description: Build API integrations and connector plugins for platforms like Keep, Onyx, Cal.com. Creates provider plugins that follow existing patterns in the target repo. Use when a bounty requires building a new integration or connector.
origin: community---

# API Connector Builder Skill

You build connector plugins and API integrations that follow existing patterns in the target codebase.

## Workflow

1. Clone the target repo
2. Find 2-3 existing connectors/providers to study the pattern
3. Identify: base class, required methods, config schema, test pattern
4. Build the new connector following the EXACT same pattern
5. Write tests matching existing test style
6. Update any registry/config files that list available connectors
7. Submit PR

## Common Connector Patterns

### Provider Plugin (Keep, SigNoz)
```
providers/
  existing_provider/
    __init__.py
    provider.py      # Main class extending BaseProvider
    config.py        # Pydantic config model
    README.md
  new_provider/      # What we build
    __init__.py
    provider.py
    config.py
    README.md
```

### Integration Connector (Onyx, Cal.com)
```
integrations/
  existing/
    client.py        # API client
    models.py        # Data models
    connector.py     # Main connector class
  new/               # What we build
    client.py
    models.py
    connector.py
```

## Key APIs We Can Integrate

### Jira Service Management
- REST API v3: /rest/api/3/
- Auth: Basic (email:api-token) or OAuth 2.0
- Key endpoints: issues, projects, service desks, request types
- Python: `jira` library or raw `requests`

### SNMP
- pysnmp library for Python
- Key: OIDs for device metrics, walk vs get
- Common MIBs: IF-MIB, HOST-RESOURCES-MIB, SNMPv2-MIB

### Proton Calendar
- Proton Bridge provides IMAP/SMTP access
- CalDAV for calendar operations
- Python: `caldav` library

### IMAP (Email)
- Python: `imaplib` + `email` stdlib
- Key: IDLE for push, SEARCH for filtering
- OAuth2 for Gmail/Outlook

## Quality Checklist
- [ ] Follows existing repo pattern exactly
- [ ] Config model with validation
- [ ] Error handling with meaningful messages
- [ ] Tests matching existing test style
- [ ] Documentation/README
- [ ] Registered in connector registry
