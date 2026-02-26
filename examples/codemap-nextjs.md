# Codemap: Next.js SaaS Application

> Stack: Next.js 15 (App Router), Supabase, Stripe, Tailwind CSS

## Project Structure

```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
      layout.tsx
    (dashboard)/
      dashboard/page.tsx
      settings/page.tsx
      billing/page.tsx
      layout.tsx
    api/
      webhooks/stripe/route.ts
      users/[id]/route.ts
      health/route.ts
    layout.tsx
    page.tsx
  components/
    ui/              # Primitives (Button, Input, Card)
    forms/           # Form components (LoginForm, SettingsForm)
    layouts/         # Layout components (Sidebar, Header)
    features/        # Feature-specific (BillingCard, UserTable)
  lib/
    supabase/
      client.ts      # Browser client
      server.ts      # Server client
      middleware.ts   # Auth middleware
    stripe/
      client.ts      # Stripe SDK setup
      webhooks.ts    # Webhook handlers
    utils/
      format.ts      # Date, currency formatters
      validation.ts  # Zod schemas
  hooks/
    use-user.ts      # Current user hook
    use-debounce.ts  # Input debounce
  types/
    database.ts      # Generated Supabase types
    api.ts           # API response types
```

## Key File Responsibilities

| File | Responsibility |
|------|---------------|
| `app/layout.tsx` | Root layout, providers, fonts |
| `app/(dashboard)/layout.tsx` | Auth guard, sidebar, header |
| `lib/supabase/server.ts` | Server-side Supabase client with cookies |
| `lib/supabase/middleware.ts` | Session refresh in middleware |
| `lib/stripe/webhooks.ts` | Handle subscription events |
| `lib/utils/validation.ts` | Shared Zod schemas for forms + API |

## Data Flow

```
Browser → Middleware (auth check) → Server Component → Supabase
                                  → Server Action → Supabase → Revalidate

Stripe → Webhook → /api/webhooks/stripe → Update subscription in DB
```

## Request Flow: Server Components

```
1. Request hits Next.js
2. Middleware checks auth (lib/supabase/middleware.ts)
3. Server Component renders (app/(dashboard)/dashboard/page.tsx)
4. Fetches data server-side (lib/supabase/server.ts)
5. Returns HTML with data hydrated
```

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/webhooks/stripe` | Stripe event handler |
| GET | `/api/users/[id]` | Get user profile |
| GET | `/api/health` | Health check |

## Component Hierarchy

```
RootLayout
  ├── (auth)/Layout
  │   ├── LoginPage → LoginForm
  │   └── RegisterPage → RegisterForm
  └── (dashboard)/Layout → Sidebar + Header
      ├── DashboardPage → StatsCards + RecentActivity
      ├── SettingsPage → SettingsForm
      └── BillingPage → PlanSelector + InvoiceList
```

## State Management

| State | Location | Method |
|-------|----------|--------|
| Auth session | Server | Supabase cookies |
| User profile | Server Component | Direct DB query |
| Form state | Client Component | React state |
| Server cache | Next.js | `revalidatePath`/`revalidateTag` |
| Client cache | Client | SWR/React Query |

## Database Schema

| Table | Key Columns |
|-------|-------------|
| `users` | id, email, name, avatar_url, created_at |
| `subscriptions` | id, user_id, stripe_id, status, plan |
| `invoices` | id, subscription_id, amount, paid_at |

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=
```
