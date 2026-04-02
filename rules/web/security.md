> This file extends [common/security.md](../common/security.md) with web-specific security content.

# Web Security Rules

## Content Security Policy

Always configure CSP headers for production.

### Nonce-Based CSP (Recommended)

Use a per-request nonce to allowlist inline scripts instead of `'unsafe-inline'`.
The server generates a random nonce for each response and injects it into both
the CSP header and any `<script>` tags. This prevents execution of injected scripts
that lack the matching nonce.

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.example.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
```

Where `{RANDOM}` is a cryptographically random base64 value regenerated on every
HTTP response (e.g., via middleware). Each inline script must include the matching
`nonce` attribute: `<script nonce="{RANDOM}">...</script>`.

Adjust allowed origins per project needs. `'unsafe-inline'` remains acceptable for
`style-src` where nonce injection into every styled element is impractical, but
should never appear in `script-src`.

## XSS Prevention

- Never use `innerHTML` with user content — use `textContent`
- Sanitize any user-generated HTML with DOMPurify before rendering
- In React: avoid `dangerouslySetInnerHTML` unless content is sanitized
- Escape all dynamic values in templates

## Third-Party Scripts

- Load analytics/tracking scripts async
- Use `integrity` attribute (SRI) for CDN scripts
- Audit third-party scripts quarterly
- Prefer self-hosting critical third-party libraries

## HTTPS and Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Forms (If Applicable)

- CSRF tokens on all form submissions
- Rate limit form endpoints
- Validate on client AND server
- Honeypot fields for spam prevention (no CAPTCHAs on beautiful sites)
