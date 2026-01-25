# Authentication & Authorization Standards

[Purpose: unify auth model, token/session lifecycle, permission checks, and security]

## Philosophy
- Clear separation: authentication (who) vs authorization (what)
- Secure by default: least privilege, fail closed, short-lived tokens
- UX-aware: friction where risk is high, smooth otherwise

## Authentication

### Method (choose + rationale)
- Options: JWT, Session, OAuth2, hybrid
- Choice: [our method] because [reason]

### Flow (high-level)
```
1) User proves identity (credentials or provider)
2) Server verifies and issues token/session
3) Client sends token per request
4) Server verifies token and proceeds
```

### Token/Session Lifecycle
- Storage: httpOnly cookie or Authorization header
- Expiration: short-lived access, longer refresh (if used)
- Refresh: rotate tokens; respect revocation
- Revocation: blacklist/rotate on logout/compromise

### Security Pattern
- Enforce TLS; never expose tokens to JS when avoidable
- Bind token to audience/issuer; include minimal claims
- Consider device binding and IP/risk checks for sensitive actions

## Authorization

### Permission Model
- Choose one: RBAC / ABAC / ownership-based / hybrid
- Define roles/attributes centrally; avoid hardcoding across codebase

### Checks (where to enforce)
- Route/middleware: coarse-grained gate
- Domain/service: fine-grained decisions
- UI: conditional rendering (no security reliance)

Example pattern:
```typescript
requirePermission('resource:action'); // route
if (!user.can('resource:action')) throw ForbiddenError(); // domain
```

### Ownership
- Pattern: owner OR privileged role can act
- Verify on entity boundary before mutation

## Passwords & MFA
- Passwords: strong policy, hashed (bcrypt/argon2), never plaintext
- Reset: time-limited token, single-use, notify user
- MFA: step-up for risky operations (policy-driven)

## API-to-API Auth
- Use API keys or OAuth client credentials
- Scope keys minimally; rotate and audit usage
- Rate limit by identity (user/key)

---
_Focus on patterns and decisions. No library-specific code._
