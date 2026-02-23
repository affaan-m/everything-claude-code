---
name: auth-patterns
description: Authentication and authorization patterns — JWT, OAuth 2.0/OIDC, session management, RBAC, API keys, MFA, and security hardening across TypeScript and Python.
---

# Authentication & Authorization Patterns

Secure identity verification and access control for production applications.

## When to Activate

- Implementing user authentication (login, signup, password reset)
- Adding JWT-based or session-based auth to APIs
- Integrating OAuth 2.0 / OpenID Connect providers
- Designing role-based or attribute-based access control
- Securing API keys for service-to-service communication
- Adding multi-factor authentication (MFA/2FA)
- Reviewing auth code for security vulnerabilities

## Core Principles

1. **Never roll your own crypto** — use battle-tested libraries (bcrypt, argon2, jose)
2. **Defense in depth** — layer multiple controls (auth + authz + rate limiting + logging)
3. **Least privilege** — grant minimum permissions required for each role
4. **Fail closed** — deny access by default, explicitly grant permissions
5. **Secrets belong in env vars** — never hardcode tokens, keys, or passwords

## JWT Authentication

### Token Pair (Access + Refresh)

```typescript
import { SignJWT, jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);

interface TokenPayload {
  sub: string;
  role: string;
}

async function generateTokens(user: { id: string; role: string }) {
  const accessToken = await new SignJWT({ sub: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(ACCESS_SECRET);

  const refreshToken = await new SignJWT({ sub: user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(REFRESH_SECRET);

  return { accessToken, refreshToken };
}

async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, ACCESS_SECRET);
  return payload as unknown as TokenPayload;
}

// Refresh token rotation — invalidate old token, issue new pair
async function rotateRefreshToken(oldRefreshToken: string, db: TokenStore) {
  const { payload } = await jwtVerify(oldRefreshToken, REFRESH_SECRET);

  // Check if token was already used (replay detection)
  const isRevoked = await db.isRevoked(oldRefreshToken);
  if (isRevoked) {
    // Possible token theft — revoke entire family
    await db.revokeAllForUser(payload.sub as string);
    throw new Error("Token reuse detected");
  }

  await db.revoke(oldRefreshToken);
  return generateTokens({ id: payload.sub as string, role: "user" });
}
```

### Python JWT

```python
from datetime import datetime, timedelta, timezone
import jwt
from os import environ

ACCESS_SECRET = environ["JWT_ACCESS_SECRET"]
REFRESH_SECRET = environ["JWT_REFRESH_SECRET"]

def generate_tokens(user_id: str, role: str) -> dict[str, str]:
    now = datetime.now(timezone.utc)
    access_token = jwt.encode(
        {"sub": user_id, "role": role, "exp": now + timedelta(minutes=15)},
        ACCESS_SECRET,
        algorithm="HS256",
    )
    refresh_token = jwt.encode(
        {"sub": user_id, "exp": now + timedelta(days=7)},
        REFRESH_SECRET,
        algorithm="HS256",
    )
    return {"access_token": access_token, "refresh_token": refresh_token}

def verify_access_token(token: str) -> dict:
    return jwt.decode(token, ACCESS_SECRET, algorithms=["HS256"])
```

## OAuth 2.0 / OIDC with PKCE

### Authorization Code Flow

```typescript
import crypto from "node:crypto";

// Step 1: Generate PKCE challenge
function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

// Step 2: Build authorization URL
function getAuthUrl(provider: OAuthConfig, pkce: { challenge: string }, state: string) {
  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: provider.redirectUri,
    response_type: "code",
    scope: provider.scopes.join(" "),
    state,
    code_challenge: pkce.challenge,
    code_challenge_method: "S256",
  });
  return `${provider.authorizationEndpoint}?${params}`;
}

// Step 3: Exchange code for tokens
async function exchangeCode(
  provider: OAuthConfig,
  code: string,
  codeVerifier: string,
): Promise<OAuthTokens> {
  const resp = await fetch(provider.tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: provider.clientId,
      client_secret: provider.clientSecret,
      redirect_uri: provider.redirectUri,
      code,
      code_verifier: codeVerifier,
    }),
  });
  if (!resp.ok) throw new Error(`Token exchange failed: ${resp.status}`);
  return resp.json();
}
```

## Session Management

### Secure Cookie-Based Sessions

```typescript
import { randomBytes, createHash } from "node:crypto";

// Session ID: cryptographically random, hashed before storage
function createSession(userId: string, redis: RedisClient) {
  const sessionId = randomBytes(32).toString("hex");
  const hashedId = createHash("sha256").update(sessionId).digest("hex");

  redis.set(`session:${hashedId}`, JSON.stringify({
    userId,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  }), "EX", 86400); // 24h TTL

  return sessionId; // Store unhashed in cookie
}

// Cookie settings
const COOKIE_OPTIONS = {
  httpOnly: true,     // No JS access
  secure: true,       // HTTPS only
  sameSite: "lax" as const,  // CSRF protection
  maxAge: 86400000,   // 24 hours
  path: "/",
};

// Session fixation prevention — regenerate session after login
async function loginUser(userId: string, req: Request, redis: RedisClient) {
  // Destroy old session
  const oldSessionId = req.cookies?.sessionId;
  if (oldSessionId) {
    const hashedOld = createHash("sha256").update(oldSessionId).digest("hex");
    await redis.del(`session:${hashedOld}`);
  }
  // Create new session
  return createSession(userId, redis);
}
```

## Password Security

### Hashing with Argon2

```typescript
import argon2 from "argon2";

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,  // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}

async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}
```

### Python (bcrypt)

```python
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())
```

### Password Policy

```typescript
const PASSWORD_RULES = {
  minLength: 12,
  requireUppercase: true,
  requireNumber: true,
  requireSpecial: true,
  checkBreached: true,
};

function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < PASSWORD_RULES.minLength) errors.push("Too short");
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) errors.push("Needs uppercase");
  if (PASSWORD_RULES.requireNumber && !/\d/.test(password)) errors.push("Needs number");
  if (PASSWORD_RULES.requireSpecial && !/[^A-Za-z0-9]/.test(password)) errors.push("Needs special char");
  return { valid: errors.length === 0, errors };
}
```

## Role-Based Access Control (RBAC)

### Permission Model

```typescript
const ROLES = {
  admin: ["users:read", "users:write", "users:delete", "reports:read", "settings:write"],
  editor: ["users:read", "reports:read", "reports:write"],
  viewer: ["users:read", "reports:read"],
} as const;

type Role = keyof typeof ROLES;
type Permission = (typeof ROLES)[Role][number];

function hasPermission(role: Role, permission: Permission): boolean {
  return (ROLES[role] as readonly string[]).includes(permission);
}

// Express middleware
function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !hasPermission(req.user.role as Role, permission)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

// Usage
router.delete("/users/:id", authenticate, requirePermission("users:delete"), deleteUser);
```

### Python Decorator

```python
from functools import wraps
from flask import request, jsonify, g

ROLES: dict[str, set[str]] = {
    "admin": {"users:read", "users:write", "users:delete"},
    "editor": {"users:read", "reports:write"},
    "viewer": {"users:read"},
}

def require_permission(permission: str):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user_role = g.current_user.get("role", "viewer")
            if permission not in ROLES.get(user_role, set()):
                return jsonify({"error": "Insufficient permissions"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

@app.route("/users/<user_id>", methods=["DELETE"])
@require_permission("users:delete")
def delete_user(user_id: str):
    ...
```

## API Key Authentication

```typescript
import { randomBytes, createHash } from "node:crypto";

// Generate: store hash, return raw key to user once
function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const raw = `sk_live_${randomBytes(32).toString("hex")}`;
  const hash = createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 12); // For identification without exposing key
  return { raw, hash, prefix };
}

// Verify: hash incoming key and compare
async function verifyApiKey(rawKey: string, db: ApiKeyStore): Promise<ApiKey | null> {
  const hash = createHash("sha256").update(rawKey).digest("hex");
  const record = await db.findByHash(hash);
  if (!record || record.revokedAt) return null;

  // Update last used timestamp
  await db.updateLastUsed(record.id);
  return record;
}

// Middleware
function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-api-key"] as string;
  if (!key) return res.status(401).json({ error: "API key required" });

  verifyApiKey(key, apiKeyStore).then((record) => {
    if (!record) return res.status(401).json({ error: "Invalid API key" });
    req.apiKey = record;
    next();
  });
}
```

## Multi-Factor Authentication (TOTP)

```typescript
import { createHmac, randomBytes } from "node:crypto";

// Generate TOTP secret and provisioning URI
function setupMFA(userEmail: string) {
  const secret = randomBytes(20).toString("base32");
  const uri = `otpauth://totp/MyApp:${userEmail}?secret=${secret}&issuer=MyApp&algorithm=SHA1&digits=6&period=30`;
  const backupCodes = Array.from({ length: 10 }, () =>
    randomBytes(4).toString("hex"),
  );
  return { secret, uri, backupCodes };
}

// Verify TOTP (use a library like otpauth in production)
function verifyTOTP(secret: string, token: string, window: number = 1): boolean {
  const now = Math.floor(Date.now() / 30000);
  for (let i = -window; i <= window; i++) {
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(now + i));
    const hmac = createHmac("sha1", Buffer.from(secret, "base32")).update(counter).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code = ((hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000)
      .toString()
      .padStart(6, "0");
    if (code === token) return true;
  }
  return false;
}
```

## Security Hardening

### CSRF Protection

```typescript
import { randomBytes } from "node:crypto";

// Double-submit cookie pattern
function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers["x-csrf-token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: "CSRF validation failed" });
  }
  next();
}
```

### Brute-Force Protection

```typescript
class LoginRateLimiter {
  private attempts = new Map<string, { count: number; lockedUntil: number }>();

  check(identifier: string): { allowed: boolean; retryAfter?: number } {
    const record = this.attempts.get(identifier);
    const now = Date.now();

    if (record?.lockedUntil && record.lockedUntil > now) {
      return { allowed: false, retryAfter: Math.ceil((record.lockedUntil - now) / 1000) };
    }

    return { allowed: true };
  }

  recordFailure(identifier: string) {
    const record = this.attempts.get(identifier) ?? { count: 0, lockedUntil: 0 };
    record.count++;

    // Progressive lockout: 1min, 5min, 15min, 1hr
    const lockoutMinutes = [1, 5, 15, 60][Math.min(record.count - 3, 3)];
    if (record.count >= 3) {
      record.lockedUntil = Date.now() + lockoutMinutes * 60 * 1000;
    }

    this.attempts.set(identifier, record);
  }

  recordSuccess(identifier: string) {
    this.attempts.delete(identifier);
  }
}
```

## Auth Checklist

Before shipping authentication:

- [ ] Passwords hashed with argon2id or bcrypt (cost factor >= 12)
- [ ] JWT access tokens expire in <= 15 minutes
- [ ] Refresh tokens are rotated on use and revocable
- [ ] Session IDs are cryptographically random (>= 256 bits)
- [ ] Cookies set with httpOnly, secure, sameSite flags
- [ ] Session regenerated after login (fixation prevention)
- [ ] CSRF protection on all state-changing endpoints
- [ ] Brute-force protection with progressive lockout
- [ ] Rate limiting on auth endpoints (login, register, reset)
- [ ] OAuth state parameter validated to prevent CSRF
- [ ] PKCE used for all OAuth public clients
- [ ] API keys hashed before storage, rotatable
- [ ] MFA available for sensitive accounts
- [ ] Failed login attempts logged with IP (no passwords logged)
- [ ] Password reset tokens are single-use and time-limited
- [ ] Secrets stored in environment variables, never in code
