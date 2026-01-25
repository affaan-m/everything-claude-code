# Error Handling Standards

[Purpose: unify how errors are classified, shaped, propagated, logged, and monitored]

## Philosophy
- Fail fast where possible; degrade gracefully at system boundaries
- Consistent error shape across the stack (human + machine readable)
- Handle known errors close to source; surface unknowns to a global handler

## Classification (decide handling by source)
- Client: Input/validation/user action issues → 4xx
- Server: System failures/unexpected exceptions → 5xx
- Business: Rule/state violations → 4xx (e.g., 409)
- External: 3rd-party/network failures → map to 5xx or 4xx with context

## Error Shape (single canonical format)
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "requestId": "trace-id",
    "timestamp": "ISO-8601"
  }
}
```
Principles: stable code enums, no secrets, include trace info.

## Propagation (where to convert)
- API layer: Convert domain errors → HTTP status + canonical body
- Service layer: Throw typed business errors, avoid stringly-typed errors
- Data/external layer: Wrap provider errors with safe, actionable codes
- Unknown errors: Bubble to global handler → 500 + generic message

Example pattern:
```typescript
try { return await useCase(); }
catch (e) {
  if (e instanceof BusinessError) return respondMapped(e);
  logError(e); return respondInternal();
}
```

## Logging (context over noise)
Log: operation, userId (if available), code, message, stack, requestId, minimal context.
Do not log: passwords, tokens, secrets, full PII, full bodies with sensitive data.
Levels: ERROR (failures), WARN (recoverable/edge), INFO (key events), DEBUG (diagnostics).

## Retry (only when safe)
Retry when: network/timeouts/transient 5xx AND operation is idempotent.
Do not retry: 4xx, business errors, non-idempotent flows.
Strategy: exponential backoff + jitter, capped attempts; require idempotency keys.

## Monitoring & Health
Track: error rates by code/category, latency, saturation; alert on spikes/SLI breaches.
Expose health: `/health` (live), `/health/ready` (ready). Link errors to traces.

---
_Focus on patterns and decisions. No implementation details or exhaustive lists._
