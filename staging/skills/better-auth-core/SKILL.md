---
name: better-auth-core
description: "Use when setting up Better Auth, configuring core options, implementing email/password auth, or hardening security. For 2FA see two-factor-authentication-best-practices. For organizations see organization-best-practices."
---

# Better Auth Core

**Docs: [better-auth.com/docs](https://better-auth.com/docs) | [Options Reference](https://better-auth.com/docs/reference/options) | [LLMs.txt](https://better-auth.com/llms.txt)**

---

## 1. Quick Setup

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `BETTER_AUTH_SECRET` | Encryption secret (min 32 chars). Generate: `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Base URL (e.g., `https://example.com`) |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Comma-separated allowed origins |

Only define `baseURL`/`secret` in config if env vars are NOT set. Better Auth looks for secrets in order: `options.secret` > `BETTER_AUTH_SECRET` > `AUTH_SECRET`.

### File Location & CLI

Config file (`auth.ts`) is found in: `./`, `./lib`, `./utils`, or under `./src`. Use `--config` for custom path.

```bash
npx @better-auth/cli@latest migrate   # Apply schema (built-in adapter)
npx @better-auth/cli@latest generate  # Generate for Prisma/Drizzle
```

**Re-run CLI after adding/changing plugins.**

### Core Config

```ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  // secret: process.env.BETTER_AUTH_SECRET,  // only if env var not set
  // baseURL: "https://example.com",          // only if env var not set
  database: myDbConnection,                   // required for most features
  secondaryStorage: redisAdapter,             // Redis/KV for sessions & rate limits
  emailAndPassword: { enabled: true },
  socialProviders: { google: { clientId, clientSecret } },
  trustedOrigins: ["https://app.example.com"],
  plugins: [],
});
```

### Core Config Options

| Option | Notes |
|--------|-------|
| `appName` | Optional display name |
| `basePath` | Default `/api/auth`. Set `/` for root. |
| `database` | Required. Direct connection or ORM adapter. |
| `secondaryStorage` | Redis/KV for sessions & rate limits |
| `emailAndPassword` | `{ enabled: true }` to activate |
| `socialProviders` | `{ google: { clientId, clientSecret }, ... }` |
| `plugins` | Array of plugins. Import from dedicated paths for tree-shaking. |
| `trustedOrigins` | CSRF whitelist. Supports wildcards: `*.example.com` |

### Database

**Direct:** `pg.Pool`, `mysql2` pool, `better-sqlite3`, or `bun:sqlite`.
**ORM adapters:** `better-auth/adapters/drizzle`, `better-auth/adapters/prisma`, `better-auth/adapters/mongodb`.

**Critical:** Config uses ORM model name, NOT DB table name. If Prisma model is `User` mapping to table `users`, use `modelName: "user"`.

### User & Account Config

- `user.additionalFields` - Extra columns on user table
- `user.changeEmail.enabled` / `user.deleteUser.enabled` - Disabled by default
- `account.accountLinking.enabled` - Link multiple providers to one user
- Required for registration: `email` and `name` fields

### Client

Import from: `better-auth/client` (vanilla), `better-auth/react`, `better-auth/vue`, `better-auth/svelte`, `better-auth/solid`.

Key methods: `signUp.email()`, `signIn.email()`, `signIn.social()`, `signOut()`, `useSession()`, `getSession()`.

Type safety: `typeof auth.$Infer.Session`, `typeof auth.$Infer.Session.user`. For separate client/server: `createAuthClient<typeof auth>()`.

### Hooks

**Endpoint hooks:** `hooks.before` / `hooks.after` - Array of `{ matcher, handler }`. Use `createAuthMiddleware`. Access `ctx.path`, `ctx.context.session`.

**Database hooks:** `databaseHooks.user.create.before/after`, same for `session`, `account`. Return `false` from `before` hook to block the operation.

### Plugins

Import from dedicated paths for tree-shaking: `import { twoFactor } from "better-auth/plugins/two-factor"` (NOT `from "better-auth/plugins"`).

Popular: `twoFactor`, `organization`, `passkey`, `magicLink`, `emailOtp`, `username`, `phoneNumber`, `admin`, `apiKey`, `bearer`, `jwt`, `multiSession`, `sso`, `openAPI`.

Client plugins go in `createAuthClient({ plugins: [...] })`.

---

## 2. Email & Password

### Email Verification

```ts
export const auth = betterAuth({
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      });
    },
    sendOnSignUp: true,   // auto-send on registration
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // block sign-in until verified
  },
});
```

`requireEmailVerification` sends a new verification email on each unverified sign-in attempt. Requires `sendVerificationEmail` to be configured.

### Password Reset Flow

```ts
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      void sendEmail({ // void intentional: prevents timing attacks by not awaiting email delivery. Log failures separately via your email service's webhook/dashboard.
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
    resetPasswordTokenExpiresIn: 60 * 30, // 30 min (default: 1 hour)
    revokeSessionsOnPasswordReset: true,   // kill all sessions on reset
    minPasswordLength: 12,                 // default: 8
    maxPasswordLength: 256,                // default: 128
    onPasswordReset: async ({ user }, request) => {
      // post-reset hook
    },
  },
});
```

**Token security:** 24-char alphanumeric, cryptographically random, single-use (deleted after reset). `redirectTo` is validated against `trustedOrigins` to prevent open redirects.

**Sending reset (server):**
```ts
await auth.api.requestPasswordReset({
  body: { email: "user@example.com", redirectTo: "https://example.com/reset-password" },
});
```

**Sending reset (client):**
```ts
const { data, error } = await authClient.requestPasswordReset({
  email: "user@example.com",
  redirectTo: "https://example.com/reset-password",
});
```

### Password Hashing

Default: `scrypt` (Node.js native, OWASP recommended when Argon2id unavailable).

**Custom hashing (Argon2id):**
```ts
import { hash, verify, type Options } from "@node-rs/argon2";

const argon2Options: Options = {
  memoryCost: 65536, timeCost: 3, parallelism: 4, outputLen: 32, algorithm: 2,
};

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    password: {
      hash: (password) => hash(password, argon2Options),
      verify: ({ password, hash: storedHash }) => verify(storedHash, password, argon2Options),
    },
  },
});
```

**Warning:** Switching algorithms breaks existing passwords. Plan a migration strategy.

### Client-Side Validation

Always validate on client too (UX + reduced server load). Always use absolute URLs for `callbackURL`:

```ts
const { data, error } = await authClient.signUp.email({
  callbackURL: "https://example.com/callback", // absolute URL with origin
});
```

---

## 3. Security

### Rate Limiting

Enabled in production by default. Applied to all endpoints.

```ts
export const auth = betterAuth({
  rateLimit: {
    enabled: true,
    window: 10,   // seconds (default: 10)
    max: 100,     // requests per window (default: 100)
    storage: "secondary-storage", // "memory" | "database" | "secondary-storage"
  },
});
```

| Storage | Pros | Cons |
|---------|------|------|
| `memory` | Fast | Resets on restart. Bad for serverless. |
| `database` | Persistent | Adds DB load |
| `secondary-storage` | Fast + persistent (Redis) | Requires setup |

**Default strict limits:** `/sign-in`, `/sign-up`, `/change-password`, `/change-email` = 3 req / 10 sec.

**Custom per-endpoint rules:**
```ts
rateLimit: {
  customRules: {
    "/api/auth/sign-in/email": { window: 60, max: 5 },
    "/api/auth/some-safe-endpoint": false, // disable
  },
}
```

### CSRF Protection

Three layers, all enabled by default:
1. **Origin header validation** - `Origin`/`Referer` must match trusted origin when cookies present
2. **Fetch Metadata** - Blocks `Sec-Fetch-Site: cross-site` + `navigate` + `document`
3. **First-login protection** - Validates even without cookies on cross-site navigation

CSRF protection is enabled by default. Never set `advanced: { disableCSRFCheck: true }`.

### Trusted Origins

```ts
trustedOrigins: [
  "https://app.example.com",
  "*.example.com",                    // wildcard subdomains
  "exp://192.168.*.*:*/*",            // custom schemes (Expo)
]

// Or dynamic:
trustedOrigins: async (request) => {
  const tenant = getTenantFromRequest(request);
  return [`https://${tenant}.myapp.com`];
}
```

`baseURL` origin is auto-trusted. Validates: `callbackURL`, `redirectTo`, `errorCallbackURL`, `newUserCallbackURL`, `origin`. Invalid = 403.

### Session Security

```ts
session: {
  expiresIn: 60 * 60 * 24 * 7,  // 7 days (default)
  updateAge: 60 * 60 * 24,       // refresh every 24h (default)
  freshAge: 60 * 60 * 24,        // require re-auth for sensitive ops (default: 24h)
  cookieCache: {
    enabled: true,
    maxAge: 60 * 5,               // 5 minutes
    strategy: "compact",          // "compact" | "jwt" | "jwe"
  },
}
```

| Cache Strategy | Size | Security |
|----------------|------|----------|
| `compact` | Smallest | Base64url + HMAC-SHA256 (signed) |
| `jwt` | Medium | HS256 JWT (signed, readable) |
| `jwe` | Largest | AES-256 encrypted (use for sensitive session data) |

**Storage priority:** `secondaryStorage` > database > cookie-only (stateless). Set `session.storeSessionInDatabase: true` to persist to DB when using secondary storage.

**Gotcha:** Custom session fields are NOT cached in cookie cache -- they always re-fetch from DB.

### Cookie Configuration

| Default | Value |
|---------|-------|
| `secure` | `true` on HTTPS/prod |
| `sameSite` | `"lax"` |
| `httpOnly` | `true` |
| Prefix | `__Secure-` when secure enabled |

```ts
advanced: {
  useSecureCookies: true,
  cookiePrefix: "myapp",
  defaultCookieAttributes: { sameSite: "strict" },
  cookies: {
    session_token: { name: "auth-session", attributes: { sameSite: "strict" } },
  },
  crossSubDomainCookies: {
    enabled: true,
    domain: ".example.com",       // leading dot required
    additionalCookies: ["session_token", "session_data"],
  },
}
```

**Warning:** Cross-subdomain cookies expand attack surface. Only enable if you trust all subdomains.

### OAuth Security

- **PKCE** - Automatic for all OAuth flows (S256 code challenge)
- **State parameter** - 32-char random, expires 10 min, stored in cookie (default) or DB
- **Encrypt tokens:** `account.encryptOAuthTokens: true` (AES-256-GCM) -- enable if storing tokens for API access

### Timing Attack Prevention

```ts
advanced: {
  backgroundTasks: {
    handler: (promise) => {
      waitUntil(promise); // Vercel: waitUntil, Cloudflare: ctx.waitUntil
    },
  },
}
```

Built-in protections: consistent response messages ("If this email exists..."), dummy operations on invalid requests, background email sending. Configure `backgroundTasks.handler` on serverless platforms.

### IP & Proxy Configuration

```ts
advanced: {
  ipAddress: {
    ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    ipv6Subnet: 64,          // group IPv6 by /64 for rate limiting
    disableIpTracking: false, // keep enabled
  },
  trustedProxyHeaders: true,  // only if behind trusted reverse proxy
}
```

### Audit Logging via Database Hooks

```ts
databaseHooks: {
  session: {
    create: {
      after: async ({ data, ctx }) => {
        await auditLog("session.created", {
          userId: data.userId,
          // Only trustworthy behind a reverse proxy with trustedProxyHeaders configured
          ip: ctx?.request?.headers.get("x-forwarded-for"),
          userAgent: ctx?.request?.headers.get("user-agent"),
        });
      },
    },
  },
  user: {
    update: {
      after: async ({ data, oldData }) => {
        if (oldData?.email !== data.email) {
          await auditLog("user.email_changed", {
            userId: data.id, oldEmail: oldData?.email, newEmail: data.email,
          });
        }
      },
    },
    delete: {
      before: async ({ data }) => {
        if (protectedUserIds.includes(data.id)) return false; // block
      },
    },
  },
  account: {
    create: {
      after: async ({ data }) => {
        await auditLog("account.linked", { userId: data.userId, provider: data.providerId });
      },
    },
  },
}
```

---

## 4. Production Checklist

| Area | Check |
|------|-------|
| **Secret** | 32+ chars, high entropy. `openssl rand -base64 32` |
| **HTTPS** | `baseURL` uses HTTPS. Secure cookies auto-enabled. |
| **Trusted Origins** | All frontends, mobile apps listed. |
| **Rate Limiting** | Enabled. Storage = `database` or `secondary-storage` (not `memory`). |
| **CSRF** | `disableCSRFCheck: false` (default). Never disable. |
| **Email Verification** | `sendVerificationEmail` configured. `requireEmailVerification: true`. |
| **Password Reset** | `sendResetPassword` configured. `revokeSessionsOnPasswordReset: true`. |
| **Password Policy** | `minPasswordLength: 12`. |
| **Session** | Reasonable `expiresIn`. `freshAge` set for sensitive ops. |
| **Cookies** | `sameSite: "lax"` minimum. `httpOnly: true`. |
| **OAuth Tokens** | `encryptOAuthTokens: true` if storing for API access. |
| **Background Tasks** | `backgroundTasks.handler` configured on serverless. |
| **Audit Logging** | `databaseHooks` logging session/user/account events. |
| **IP Headers** | Configured if behind proxy (`ipAddressHeaders`). |
| **CLI** | Re-ran `migrate`/`generate` after plugin changes. |

---

## Common Gotchas

1. **Model vs table name** - Config uses ORM model name, not DB table name
2. **Plugin schema** - Re-run CLI after adding plugins
3. **Secondary storage** - Sessions go there by default, not DB
4. **Cookie cache** - Custom session fields NOT cached, always re-fetched
5. **Stateless mode** - No DB = session in cookie only, logout on cache expiry
6. **Switching hash algo** - Breaks existing passwords, need migration plan
7. **`memory` rate limiting** - Resets on restart, broken on serverless
