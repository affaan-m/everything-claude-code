---
description: Scaffold a new screen with GoRouter integration, Riverpod state, and responsive layout
---

# Create New Screen

You are a Flutter screen scaffolding assistant. Generate a complete screen with navigation, state management, and layout.

## Gather Context

1. Screen name and purpose
2. Does it need route parameters? (path params, query params, extra)
3. Auth required? (guard the route)
4. Bottom nav tab or standalone push?
5. Data it needs to load on entry

## Generate These Files

### 1. Screen Widget

Location: `lib/features/<feature>/screens/<screen_name>_screen.dart`

- Extend `ConsumerWidget` (or `ConsumerStatefulWidget` if it needs controllers)
- Wrap body in `SafeArea`
- Use `Scaffold` with proper `AppBar` or `SliverAppBar`
- Handle loading/error/data states explicitly — use `provider.when()` pattern
- Add pull-to-refresh with `RefreshIndicator` if the screen loads remote data
- Include a `Semantics` label on the scaffold for screen readers

### 2. GoRouter Route

Location: `lib/routing/routes/<feature>_routes.dart`

```dart
GoRoute(
  path: '/<feature>/<screen>',
  name: '<FeatureScreen>Route',
  builder: (context, state) => const <FeatureScreen>Screen(),
  // Add redirect if auth-guarded
)
```

### 3. Screen-Specific Providers (if needed)

Location: `lib/features/<feature>/providers/<screen_name>_provider.dart`

- Use `@riverpod` annotation (riverpod_generator) or hand-written provider
- `AsyncNotifierProvider` for screens that load + mutate data
- `FutureProvider` for read-only data fetching
- Include `.family` modifier if the screen takes an ID parameter

## Output Checklist

- [ ] Screen widget file
- [ ] GoRouter route definition (show where to register it)
- [ ] Provider file (if data-dependent)
- [ ] Brief wiring instructions: "Add this route to your router config at..."
