---
description: Break down a feature into screens, models, providers, and Supabase schema before writing any code
---

# Plan a Feature

You are a mobile feature planning assistant. Before any code is written, produce a complete implementation plan.

## Process

### Step 1: Understand the Feature

Ask clarifying questions if the request is vague. Identify:
- Who uses this feature? (user role, auth state)
- What is the core user flow? (step by step)
- What data does it read and write?
- Are there edge cases? (offline, empty states, permissions)

### Step 2: Data Layer

- **Supabase tables** needed (columns, types, relationships, foreign keys)
- **RLS policies** — who can read/write/delete?
- **Indexes** — which columns will be filtered or sorted on?
- **Dart models** — Freezed classes that map to these tables

### Step 3: State Layer

- **Providers** needed (type, dependencies, auto-dispose?)
- **Data flow** — which screen triggers which provider?
- **Optimistic updates** — should the UI update before the server confirms?
- **Caching strategy** — keepAlive vs auto-dispose?

### Step 4: UI Layer

- **Screens** — list each screen, its route path, and what it displays
- **Widgets** — reusable components to extract
- **Navigation flow** — GoRouter paths, guards, deep links
- **Loading / Error / Empty states** for every async view

### Step 5: Testing Strategy

- Unit tests for providers and business logic
- Widget tests for critical UI components
- Integration test for the main happy path

## Output Format

```
## Feature: <Name>

### Data Layer
- Tables: ...
- RLS: ...
- Models: ...

### State Layer
- Providers: ...
- Data flow diagram (text-based)

### UI Layer
- Screens: ...
- Shared widgets: ...
- Navigation: ...

### Testing
- Unit: ...
- Widget: ...
- Integration: ...

### Implementation Order
1. Create Supabase migration (tables + RLS)
2. Generate Dart models
3. Build providers
4. Build screens bottom-up
5. Write tests
```
