---
name: laravel-security
description: Laravel security best practices for authn/authz, validation, CSRF, mass assignment, file uploads, secrets, rate limiting, and secure deployment.
origin: ECC
---

# Laravel Security Best Practices

Comprehensive security guidance for Laravel applications to protect against common vulnerabilities.

## When to Activate

- Adding authentication or authorization
- Handling user input and file uploads
- Building new API endpoints
- Managing secrets and environment settings
- Hardening production deployments

## Core Security Settings

- `APP_DEBUG=false` in production
- `APP_KEY` must be set and rotated on compromise
- Set `SESSION_SECURE_COOKIE=true` and `SESSION_SAME_SITE=lax` (or `strict` for sensitive apps)
- Configure trusted proxies for correct HTTPS detection

## Authentication and Tokens

- Use Laravel Sanctum or Passport for API auth
- Prefer short-lived tokens with refresh flows for sensitive data
- Revoke tokens on logout and compromised accounts

## Authorization: Policies and Gates

- Use policies for model-level authorization
- Enforce authorization in controllers and services

```php
$this->authorize('update', $project);
```

## Validation and Data Sanitization

- Always validate inputs with Form Requests
- Use strict validation rules and type checks
- Never trust request payloads for derived fields

## Mass Assignment Protection

- Use `$fillable` or `$guarded` and avoid `Model::unguard()`
- Prefer DTOs or explicit attribute mapping

## SQL Injection Prevention

- Use Eloquent or query builder parameter binding
- Avoid raw SQL unless strictly necessary

```php
DB::select('select * from users where email = ?', [$email]);
```

## XSS Prevention

- Blade escapes output by default (`{{ }}`)
- Use `{!! !!}` only for trusted, sanitized HTML
- Sanitize rich text with a dedicated library

## CSRF Protection

- Keep `VerifyCsrfToken` middleware enabled
- Include `@csrf` in forms and send XSRF tokens for SPA requests

## File Upload Safety

- Validate file size, MIME type, and extension
- Store uploads outside the public path when possible
- Scan files for malware if required

## Rate Limiting

- Apply `throttle` middleware on auth and write endpoints
- Use stricter limits for login, password reset, and OTP

## Secrets and Credentials

- Never commit secrets to source control
- Use environment variables and secret managers
- Rotate keys after exposure and invalidate sessions

## Security Headers

- Add CSP, HSTS, and frame protection where appropriate
- Use trusted proxy configuration to enforce HTTPS redirects

## Dependency Security

- Run `composer audit` regularly
- Pin dependencies with care and update promptly on CVEs
