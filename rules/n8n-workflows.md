---
paths:
  - "**/*.n8n.json"
  - "**/workflows/**"
  - "**/n8n/**"
---

# n8n Workflow Best Practices

## Node Configuration

- Always use meaningful node names (not "HTTP Request 1")
- Configure error handling on critical nodes
- Use sticky notes for documentation
- Group related nodes visually
- Add descriptions to complex nodes

## Expressions Syntax

- Always start expressions with `={{ }}`
- Reference previous nodes: `{{ $('NodeName').item.json.field }}`
- Current node input: `{{ $json.fieldName }}`
- Access all items: `{{ $('NodeName').all() }}`
- First item only: `{{ $('NodeName').first().json.field }}`

## Common Patterns

### Webhook Trigger
```json
{
  "httpMethod": "POST",
  "path": "unique-webhook-path",
  "responseMode": "onReceived"
}
```

### HTTP Request
```json
{
  "method": "POST",
  "url": "={{ $json.apiUrl }}",
  "authentication": "genericCredentialType",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      { "name": "Content-Type", "value": "application/json" }
    ]
  }
}
```

## Error Handling

- Add Error Trigger node for workflow errors
- Use IF node to check for error conditions
- Send notifications on critical failures
- Log errors with context for debugging

## Testing

- Use validate_workflow before deploying
- Test with sample data before production
- Add error output connections for debugging
- Use Execute Workflow for modular testing

## Security

- Store credentials in n8n credential manager
- Never hardcode API keys in expressions
- Use environment variables via `$env`
- Validate and sanitize webhook inputs
- Use authentication on webhooks

## Performance

- Avoid loops when batch operations are available
- Use Split In Batches for large datasets
- Configure appropriate timeouts
- Monitor execution times

## Documentation

- Add sticky notes explaining workflow purpose
- Document webhook endpoints
- Note any external dependencies
- Include example payloads in notes
