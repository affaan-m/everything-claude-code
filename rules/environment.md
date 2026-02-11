# Environment & Configuration Management

## `.env` File Structure

Required files in every project:

| File | Purpose | Git tracked? |
|------|---------|-------------|
| `.env.example` | Template with all variables (no real values) | Yes |
| `.env.local` | Local development overrides | No |
| `.env.test` | Test environment values | No |
| `.env.production` | Production values (CI/CD only) | No |

## Variable Naming Convention

Format: `SCOPE_SERVICE_PURPOSE`

```bash
# GOOD
DATABASE_SUPABASE_URL=
AUTH_JWT_SECRET=
NEXT_PUBLIC_APP_NAME=
REDIS_CACHE_TTL=

# BAD
url=
secret=
dbUrl=
```

## Runtime Validation (Required)

Validate ALL environment variables at startup:

```typescript
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_JWT_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_NAME: z.string(),
  REDIS_URL: z.string().url().optional(),
})

export const env = envSchema.parse(process.env)
```

Fail fast on missing variables. Never use `process.env.VAR` directly in business logic.

## `.env.example` Maintenance

- [ ] Every new env var MUST be added to `.env.example`
- [ ] Include descriptive comments for each variable
- [ ] Use placeholder values, NEVER real secrets
- [ ] Group variables by service/scope

```bash
# === Database ===
DATABASE_SUPABASE_URL=https://your-project.supabase.co
DATABASE_SUPABASE_ANON_KEY=your-anon-key-here

# === Auth ===
AUTH_JWT_SECRET=generate-a-32-char-secret-here

# === External APIs ===
OPENAI_API_KEY=sk-your-key-here
```

## Security Rules

- `NEXT_PUBLIC_*` variables are exposed to the browser - NEVER put secrets here
- Validate that `.env*` files (except `.env.example`) are in `.gitignore`
- Rotate secrets immediately if committed to git
- Use platform secret management (Vercel env vars, GitHub Secrets) for production
- Never log environment variable values

## When Issues Are Found

1. Missing `.env.example` entry - Add immediately
2. Secret in `NEXT_PUBLIC_*` variable - STOP, use **security-reviewer** agent
3. Missing runtime validation - Add zod schema before continuing
4. `.env` file not in `.gitignore` - Fix immediately
