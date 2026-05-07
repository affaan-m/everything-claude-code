---
name: security-review
description: "Universal security checklist for code review — secrets, input validation, injection prevention, auth, XSS/CSRF, rate limiting, sensitive data, and dependency hygiene. Language and framework agnostic; defers framework-specific wiring (Next.js middleware, Supabase RLS, Spring Security, Django middleware) to the dedicated per-stack security skills. Use when adding authentication, handling user input, working with secrets, creating API endpoints, or implementing payment / sensitive-data features."
origin: ECC
---

# Security Review

Universal pre-merge checklist. Per-framework specifics live in
dedicated skills (`django-security`, `springboot-security`,
`laravel-security`, `perl-security`, etc.) — this skill is the
language-agnostic spine.

## When to Activate

- Implementing authentication or authorization
- Handling user input or file uploads
- Creating new API endpoints
- Working with secrets or credentials
- Implementing payment features
- Storing or transmitting sensitive data
- Integrating third-party APIs

## Severity legend

| Level | Meaning | Action |
|-------|---------|--------|
| CRITICAL | Vuln or data-loss risk | **BLOCK** merge until fixed |
| HIGH | Bug or significant quality issue | Fix before merge |
| MEDIUM | Maintainability / best-practice gap | Fix when reasonable |
| LOW | Style / minor suggestion | Optional |

## Security Checklist

### 1. Secrets Management

**Principle**: secrets live in environment variables (or a secret
manager), never in source. Validate they exist at startup; fail fast
if missing.

```typescript
// ❌ never
const apiKey = "sk-proj-xxxxx"

// ✅ always
const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) throw new Error("OPENAI_API_KEY not configured")
```

```python
import os
api_key = os.environ["OPENAI_API_KEY"]  # KeyError at startup if missing
```

Verify:
- [ ] No hardcoded API keys, tokens, or passwords
- [ ] All secrets in env vars or a secret manager
- [ ] `.env*` files in `.gitignore`
- [ ] No secrets in git history (`git log -p` audit if uncertain)
- [ ] Production secrets stored in the hosting platform's vault

### 2. Input Validation

**Principle**: validate at the system boundary using a declarative
schema. Reject early; never trust shape.

```typescript
import { z } from 'zod'
const CreateUser = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150),
})
const validated = CreateUser.parse(input)  // throws ZodError on bad shape
```

```python
from pydantic import BaseModel, EmailStr, conint, constr
class CreateUser(BaseModel):
    email: EmailStr
    name: constr(min_length=1, max_length=100)
    age: conint(ge=0, le=150) | None = None
```

**File uploads** must validate three orthogonal things:
- Size (e.g. 5 MB cap)
- MIME type (whitelist, not blacklist)
- Extension (whitelist) — and never trust the client-reported type
  alone; sniff content for sensitive flows

Verify:
- [ ] All user inputs validated with schemas
- [ ] File uploads bounded (size, type, extension)
- [ ] Whitelist validation, not blacklist
- [ ] Error messages don't leak internal structure

### 3. Injection Prevention (SQL / NoSQL / Command)

**Principle**: parameterize. Never concatenate untrusted strings into
queries or shell commands.

```python
# ❌ string concat
cur.execute(f"SELECT * FROM users WHERE email = '{user_email}'")

# ✅ parameterized
cur.execute("SELECT * FROM users WHERE email = %s", (user_email,))
```

```typescript
// ❌ template string into query
db.query(`SELECT * FROM users WHERE email = '${email}'`)

// ✅ ORM / parameterized
db.query("SELECT * FROM users WHERE email = $1", [email])
```

For shell exec: prefer language-native APIs (Python `subprocess` with
`shell=False` and a list arg, Node `execFile` not `exec`). If shell
is unavoidable, escape via the language's shell-quote helper — never
hand-roll quoting.

Verify:
- [ ] All DB queries parameterized
- [ ] No string concatenation in SQL or shell exec
- [ ] ORM / query builder used correctly (no raw escape hatches with
      user input)

### 4. Authentication & Authorization

**Principle**: tokens in `httpOnly`, `Secure`, `SameSite=Strict` (or
`Lax` for top-level navigations) cookies — never `localStorage`,
which is XSS-readable. Authorize *every* sensitive operation
server-side; never trust the client's claim.

```python
# ✅ verify role on the server before the action
if requester.role != "admin":
    return forbidden()
db.users.delete(target_user_id)
```

For row-level access control, prefer database-enforced policies
(Postgres RLS, Supabase RLS, FGAC) over application-layer checks.
See per-stack security skills for the wiring.

Verify:
- [ ] Auth tokens in httpOnly cookies (not localStorage)
- [ ] Authorization checks on every sensitive endpoint
- [ ] Role / scope checks before destructive operations
- [ ] Session lifetime is bounded; idle timeout configured
- [ ] Password reset flows are rate-limited and use single-use tokens

### 5. XSS Prevention

**Principle**: encode output by default; sanitize when rendering
user-provided HTML; restrict what scripts can execute via CSP.

```typescript
import DOMPurify from 'isomorphic-dompurify'
const safe = DOMPurify.sanitize(userHtml, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
  ALLOWED_ATTR: [],
})
```

#### Content Security Policy

Use a per-request nonce. **Do NOT default to `'unsafe-inline'` or
`'unsafe-eval'`** — they neutralize CSP's main purpose.

```
default-src 'self';
script-src  'self' 'nonce-<RANDOM>' 'strict-dynamic';
style-src   'self' 'nonce-<RANDOM>';
img-src     'self' data: https:;
font-src    'self';
connect-src 'self' https://api.example.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

Wire the nonce in your framework's middleware/template layer:
- **Next.js**: `middleware.ts` sets `Content-Security-Policy` and
  exposes the nonce via `headers()` for `next/script`.
- **Django**: `django-csp` middleware + `{% csp_nonce %}` template tag.
- **Spring**: `WebSecurityConfigurerAdapter` + `HeaderWriter`.
- **Laravel**: middleware that injects nonce into Blade templates.

When you legitimately need `'unsafe-inline'` / `'unsafe-eval'` (legacy
analytics, dev-only HMR), scope it as narrowly as possible and treat
it as tech debt with a removal plan — not a default.

Verify:
- [ ] User-provided HTML sanitized
- [ ] CSP configured; no blanket `'unsafe-inline'` / `'unsafe-eval'`
- [ ] Templating engine auto-escapes by default; no
      `dangerouslySetInnerHTML` / `\| safe` without explicit review

### 6. CSRF Protection

**Principle**: state-changing requests must require either a
synchronizer token, the double-submit cookie pattern, or
`SameSite=Strict` cookies + same-origin checks.

```
Cookie:        session=...; HttpOnly; Secure; SameSite=Strict
Request header: X-CSRF-Token: <token from server-rendered form/page>
```

Most modern frameworks have built-in CSRF middleware (Django
`CsrfViewMiddleware`, Rails `protect_from_forgery`, Laravel's
`VerifyCsrfToken`, Spring Security `csrf()`). Use them; don't
reinvent.

Verify:
- [ ] CSRF protection enabled on all state-changing endpoints
- [ ] `SameSite=Strict` (or `Lax`) on session cookies
- [ ] Cross-site `POST`s without a token are rejected

### 7. Rate Limiting

**Principle**: bound abuse on every endpoint, especially auth
(login / signup / password reset) and expensive operations (search,
AI calls, file processing). In multi-instance / serverless
deployments, **in-memory limiters do not work** — each replica has
its own counter. Use a shared store (Redis, DynamoDB, Upstash).

```
Key by authenticated user-id when available; fall back to IP.
IP alone is bypassable behind shared NATs and trivial via IPv6 rotation.
On rejection, return 429 with a `Retry-After` header.
```

Common patterns:
- Sliding window (`@upstash/ratelimit`, `redis-rate-limit`)
- Token bucket (Cloudflare Workers, Envoy)
- Stack-native middleware (Django Ratelimit, Laravel `RateLimiter`,
  Spring's `bucket4j-spring-boot-starter`)

Verify:
- [ ] Rate limits on all public endpoints
- [ ] Stricter limits on auth + expensive ops
- [ ] Shared store used in serverless / multi-instance deployments
- [ ] User-id-based key when authenticated; IP fallback otherwise
- [ ] `Retry-After` header on 429s
- [ ] `trust proxy` configured correctly behind a load balancer
      (otherwise everyone shares the LB's IP)

### 8. Sensitive Data Exposure

**Principle**: never log secrets or PII; user-facing errors are
generic; detailed errors only on the server side.

```typescript
// ❌ leaks credentials
logger.info("login", { email, password })
// ✅ identifiers only
logger.info("login", { email, userId })
```

```python
# ❌ leaks card data
logger.info("payment", extra={"card": card_number})
# ✅ only what's safe
logger.info("payment", extra={"last4": card.last4, "userId": user.id})
```

For errors:

```typescript
// ❌ exposes internals
return res.status(500).json({ error: err.message, stack: err.stack })
// ✅ generic for the user, detail in server logs
console.error("Internal", err)
return res.status(500).json({ error: "Something went wrong" })
```

Verify:
- [ ] No passwords, tokens, secrets, or full PII in logs
- [ ] User-facing errors are generic
- [ ] Stack traces only in server logs, never in API responses
- [ ] Sensitive fields scrubbed in error reporters (Sentry, etc.)

### 9. Wallet / Blockchain Security (when applicable)

If the project uses wallet auth or on-chain operations:

- **Sign-In With X (Solana / Ethereum)**: verify signatures with a
  real ed25519 / secp256k1 verifier (`tweetnacl` /
  `@noble/curves/ed25519` for Solana; `ethers.js` / `viem` for EVM).
  Never invent your own verify function.
- **Server-issued single-use nonce** on every sign-in flow; store in
  a TTL'd cache (Redis); delete on first use. Otherwise the signature
  is replayable.
- **Verify confirmed transactions by signature**, not signed-but-
  unsubmitted blobs the client hands you. Decode the *specific
  instruction* (Solana: `SystemProgram` transfer / SPL-token
  transfer; EVM: `Transfer` event log) — top-level fields like `to`/
  `amount` don't exist on a Solana tx.
- **Check `tx.meta.err == null`** before treating a Solana tx as
  successful.
- For SPL tokens: also verify mint address and token-account ownership.

Beyond this checklist, escalate to a wallet-specific reviewer or
dedicated chain-security skill — this is dense, fast-moving terrain.

### 10. Dependency Security

**Principle**: pin lockfiles, audit on every CI run, update on a
cadence, watch for transitive vulns.

| Stack | Audit | Update |
|-------|-------|--------|
| Node | `npm audit` / `pnpm audit` | `npm update` / `pnpm update` |
| Python | `pip-audit` / `safety check` | `pip install -U` per locked deps |
| Go | `govulncheck ./...` | `go get -u ./...` |
| Rust | `cargo audit` | `cargo update` |
| Ruby | `bundler-audit` | `bundle update` |
| Java | `mvn dependency-check:check` (OWASP plugin) | `mvn versions:use-latest-versions` |

In CI, prefer the deterministic install (`npm ci`, `pip install
--require-hashes`, `cargo build --locked`) over the resolver to
guarantee the lockfile is honored.

Verify:
- [ ] Lock file committed
- [ ] No known critical / high vulns from the audit tool
- [ ] Dependabot / Renovate enabled
- [ ] CI uses the deterministic install command

## Pre-Deployment Checklist

Before any production deploy:

- [ ] **Secrets**: no hardcodes, all in env / vault
- [ ] **Input validation**: schema-based at every boundary
- [ ] **Injection**: parameterized queries; safe shell exec
- [ ] **XSS**: HTML sanitized; CSP without blanket `'unsafe-*'`
- [ ] **CSRF**: tokens or `SameSite=Strict` on state-changing endpoints
- [ ] **Auth**: tokens in httpOnly cookies; authz checks server-side
- [ ] **Rate limiting**: shared store in serverless; user-id keyed
- [ ] **HTTPS**: enforced; HSTS configured
- [ ] **Security headers**: CSP, X-Frame-Options, X-Content-Type-Options
- [ ] **Errors**: generic to users; detailed in server logs
- [ ] **Logging**: no secrets, no full PII
- [ ] **Dependencies**: audit clean; lockfile committed
- [ ] **CORS**: explicit allow-list; no `*` for credentialed requests
- [ ] **File uploads**: size, type, extension validated
- [ ] **DB-level access control**: RLS / policies enabled where the
      data model supports it

## Per-stack security skills (use these for wiring)

| Stack | Skill |
|-------|-------|
| Django | `django-security` |
| Spring Boot | `springboot-security` |
| Laravel | `laravel-security` |
| Perl | `perl-security` |

These cover framework middleware, ORM-specific patterns, and
ecosystem-particular pitfalls. Use them after this checklist
identifies the WHAT to verify HOW in your stack.

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Web Security Academy (PortSwigger)](https://portswigger.net/web-security)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

Security is not optional. One vulnerability can compromise the
entire system. When in doubt, err conservative — and use the
per-stack skill for the parts this checklist abstracts away.
