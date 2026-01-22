---
name: security-review
description: Security checklist for authentication, user input, secrets, API endpoints, and sensitive features.
---

# Security Review Skill

## When to Use
Use for: auth implementation, user input/file uploads, API endpoints, secrets handling, payment features, sensitive data.

## Security Checklist

### 1. Secrets Management

NEVER hardcode secrets. Use environment variables.

Verification:
- [ ] No hardcoded API keys, tokens, passwords
- [ ] All secrets in environment variables
- [ ] `.env.local` in .gitignore
- [ ] No secrets in git history

### 2. Input Validation

ALWAYS validate with schemas (zod). ALWAYS validate file uploads with 3 checks:

```typescript
function validateFileUpload(file: File) {
  // 1. Size check
  if (file.size > 5 * 1024 * 1024) throw new Error('File too large')

  // 2. MIME type check
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) throw new Error('Invalid type')

  // 3. Extension check
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!ext || !['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
    throw new Error('Invalid extension')
  }
}
```

Verification:
- [ ] All inputs validated with schemas
- [ ] File uploads: size, type, extension checked
- [ ] Whitelist validation (not blacklist)

### 3. SQL Injection

NEVER concatenate strings in SQL. ALWAYS use parameterized queries.

```typescript
// BAD: SQL injection vulnerability
const query = `SELECT * FROM users WHERE id = ${id}`

// GOOD: Parameterized query
const { data } = await supabase.from('users').eq('id', id)
```

### 4. Authentication & Authorization

Store tokens in httpOnly cookies, NOT localStorage. ALWAYS verify authorization before sensitive operations.

#### Row Level Security (PostgreSQL)
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

Verification:
- [ ] Tokens in httpOnly cookies
- [ ] Authorization checks before operations
- [ ] RLS enabled in Supabase

### 5. XSS Prevention

Sanitize user HTML with DOMPurify. Configure CSP headers:

```typescript
// next.config.js
const securityHeaders = [{
  key: 'Content-Security-Policy',
  value: `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://api.example.com;
  `.replace(/\s{2,}/g, ' ').trim()
}]
```

### 6. CSRF Protection

Use CSRF tokens on state-changing operations. Set `SameSite=Strict` on all cookies.

### 7. Rate Limiting

Apply rate limiting on all API endpoints. Use stricter limits for expensive operations (search, AI calls).

### 8. Sensitive Data Exposure

NEVER log passwords, tokens, card numbers. Return generic error messages to users.

### 9. Blockchain Security

```typescript
import { verify } from '@solana/web3.js'

async function verifyWalletOwnership(
  publicKey: string, signature: string, message: string
) {
  return verify(
    Buffer.from(message),
    Buffer.from(signature, 'base64'),
    Buffer.from(publicKey, 'base64')
  )
}

async function verifyTransaction(tx: Transaction) {
  if (tx.to !== expectedRecipient) throw new Error('Invalid recipient')
  if (tx.amount > maxAmount) throw new Error('Amount exceeds limit')
  const balance = await getBalance(tx.from)
  if (balance < tx.amount) throw new Error('Insufficient balance')
}
```

### 10. Dependencies

Run `npm audit` regularly. ALWAYS commit lock files. Use `npm ci` in CI/CD.

## Pre-Deployment Checklist

Before ANY production deployment:

- [ ] **Secrets**: No hardcoded, all in env vars
- [ ] **Input Validation**: All inputs validated
- [ ] **SQL Injection**: All queries parameterized
- [ ] **XSS**: User content sanitized, CSP configured
- [ ] **CSRF**: Protection enabled
- [ ] **Auth**: httpOnly cookies, role checks
- [ ] **Rate Limiting**: Enabled on all endpoints
- [ ] **HTTPS**: Enforced
- [ ] **Errors**: No sensitive data exposed
- [ ] **Logs**: No sensitive data logged
- [ ] **Dependencies**: No vulnerabilities
- [ ] **Database**: RLS enabled
- [ ] **File Uploads**: Validated
- [ ] **Blockchain**: Signatures verified (if applicable)

---

**Security is not optional.** One vulnerability can compromise the entire platform.
