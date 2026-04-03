---
description: Generate unit, widget, and integration tests for Flutter features
---

# Generate Tests

Create comprehensive tests for Flutter code.

## Gather Context

1. What should be tested? (a widget, a provider, a model, a service, a full flow)
2. Determine test type:
   - **Unit test** — providers, models, business logic, repositories
   - **Widget test** — individual widgets in isolation
   - **Integration test** — full user flows across multiple screens

## Unit Tests (Providers & Logic)

Location: `test/features/<feature>/providers/<name>_test.dart`

- Use `ProviderContainer` for testing Riverpod providers in isolation
- Mock Supabase client with a fake or `mocktail`
- Test: initial state, successful data load, error state, mutations, edge cases
- Use `createContainer` helper with overrides for dependency injection

```dart
final container = ProviderContainer(
  overrides: [
    supabaseClientProvider.overrideWithValue(mockSupabase),
  ],
);
addTearDown(container.dispose);
```

## Widget Tests

Location: `test/features/<feature>/widgets/<name>_test.dart`

- Wrap tested widget in `ProviderScope` with mocked providers
- Use `pumpWidget` with `MaterialApp` wrapper for theme/navigation context
- Test: renders correctly, responds to taps, shows loading state, shows error state, shows empty state
- Use `find.byType`, `find.text`, `find.byKey` — prefer `Key` for important interactive elements
- Test accessibility: `expect(tester, meetsGuideline(androidTapTargetGuideline))`

## Integration Tests

Location: `integration_test/<feature>_test.dart`

- Test the full happy path end-to-end
- Use `patrolTest` if Patrol is in the project, otherwise `IntegrationTestWidgetsFlutterBinding`
- Mock external services at the HTTP layer, not at the provider layer
- Include at least: navigate to screen -> interact -> verify result

## Output

1. Complete test files with all imports
2. A mock/fake file if new mocks are needed
3. Run command: `flutter test test/features/<feature>/` or `flutter test integration_test/`
