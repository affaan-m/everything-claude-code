> This file extends [common/security.md](../common/security.md) with web-specific security content.

# Web Security Rules

## Content Security Policy

Always configure CSP headers for production:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.*;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
```

Adjust per project needs. `unsafe-inline` for scripts should be replaced with nonces when possible.

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
