---
name: coding-standards
description: Project-specific coding standards for TypeScript, React, and Next.js.
---

# Coding Standards

## Core Principles

Follow KISS, DRY, YAGNI. Readability over cleverness.

## Critical Rules

### Immutability (CRITICAL)

```typescript
// ALWAYS use spread operator
const updatedUser = { ...user, name: 'New Name' }
const updatedArray = [...items, newItem]

// NEVER mutate directly
user.name = 'New Name'  // BAD
items.push(newItem)     // BAD
```

### Type Safety

NEVER use `any`. ALWAYS define proper types/interfaces.

### Async Operations

Use `Promise.all` for independent async operations:
```typescript
const [users, markets] = await Promise.all([fetchUsers(), fetchMarkets()])
```

## API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: { total: number; page: number; limit: number }
}

// Success
return NextResponse.json({ success: true, data: markets, meta: { total: 100, page: 1, limit: 10 } })

// Error
return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   └── (auth)/            # Route groups
├── components/
│   ├── ui/                # Generic UI
│   ├── forms/             # Form components
│   └── layouts/           # Layouts
├── hooks/                 # Custom hooks
├── lib/                   # Utilities
│   ├── api/              # API clients
│   ├── utils/            # Helpers
│   └── constants/        # Constants
├── types/                 # TypeScript types
└── styles/               # Global styles
```

## File Naming

```
components/Button.tsx      # PascalCase for components
hooks/useAuth.ts          # camelCase with 'use' prefix
lib/formatDate.ts         # camelCase for utilities
types/market.types.ts     # camelCase with .types suffix
```

## Code Quality

- Functions < 50 lines
- Nesting < 5 levels (use early returns)
- No magic numbers (use named constants)
- Comments explain WHY, not WHAT
- Descriptive test names: `test('returns empty array when no markets match')`

## Database Queries

Select only needed columns:
```typescript
// GOOD
const { data } = await supabase.from('markets').select('id, name, status').limit(10)

// BAD
const { data } = await supabase.from('markets').select('*')
```
