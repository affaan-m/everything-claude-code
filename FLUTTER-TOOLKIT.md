# Flutter & Supabase Toolkit

Quick reference for all Flutter/Supabase agents and commands integrated from [flutter-mobile-toolkit](https://github.com/RamiroRivas2/flutter-mobile-toolkit).

## Agents

### Existing (ECC core)

| Agent | Purpose |
|-------|---------|
| `flutter-reviewer` | Code review for Flutter/Dart — widget patterns, state management, security |
| `dart-build-resolver` | Fix `dart analyze` errors, Flutter build failures, pub dependency conflicts |

### Added from flutter-mobile-toolkit

| Agent | Purpose |
|-------|---------|
| `flutter-architect` | App architecture — widget composition, feature structure, navigation |
| `supabase-architect` | Backend design — schema, RLS, auth flows, Edge Functions, Realtime |
| `riverpod-expert` | Riverpod state management — provider patterns, dependency graphs, caching |
| `mobile-ui-engineer` | UI engineering — Material 3, slivers, animations, theming, accessibility |
| `mobile-perf-engineer` | Performance — frame budget, widget rebuilds, memory, network, startup |
| `mobile-security-engineer` | Security — vulnerabilities, secure storage, auth, RLS auditing |
| `flutter-testing-specialist` | Testing — unit, widget, integration, golden tests, mocking strategy |
| `flutter-release-engineer` | Releases — build flavors, signing, store submissions, CI/CD |
| `flutter-refactoring-expert` | Refactoring — widget extraction, Riverpod migration, Freezed adoption |
| `flutter-research-agent` | Research — package evaluation, pattern comparison, evidence-based recs |

## Commands

### Existing (ECC core)

| Command | What it does |
|---------|-------------|
| `/flutter-build` | Fix Dart analyzer errors and Flutter build failures |
| `/flutter-test` | Run Flutter test suite, diagnose and fix failures |
| `/flutter-review` | Full code review via `flutter-reviewer` agent |

### Flutter Scaffolding (new)

| Command | What it does |
|---------|-------------|
| `/flutter-widget-new` | Scaffold a widget (Stateless, Consumer, ConsumerStateful) |
| `/flutter-screen-new` | Scaffold a screen with GoRouter route and Riverpod state |
| `/flutter-model-new` | Generate Freezed data models with Supabase mapping |
| `/flutter-provider-new` | Scaffold Riverpod providers (Future, Stream, AsyncNotifier) |
| `/flutter-feature-plan` | Plan a feature: data layer, state layer, UI layer, testing |
| `/flutter-lint` | Run `dart analyze`, auto-fix issues, report what needs review |
| `/flutter-test-gen` | Generate unit, widget, and integration tests |

### Supabase (new)

| Command | What it does |
|---------|-------------|
| `/supa-migrate` | Generate SQL migrations (tables, RLS, indexes, triggers) |
| `/supa-edge` | Scaffold Deno Edge Functions with CORS, auth, error handling |
| `/supa-rls` | Audit or generate Row Level Security policies |
| `/supa-types` | Generate Dart Freezed models from Supabase table schemas |

## Existing Skills & Rules

These ECC resources complement the toolkit:

| Resource | Path |
|----------|------|
| Dart/Flutter patterns skill | `skills/dart-flutter-patterns/SKILL.md` |
| Flutter code review skill | `skills/flutter-dart-code-review/SKILL.md` |
| Dart coding style rules | `rules/dart/coding-style.md` |
| Dart testing rules | `rules/dart/testing.md` |
| Dart patterns rules | `rules/dart/patterns.md` |
| Dart security rules | `rules/dart/security.md` |
| Dart hooks rules | `rules/dart/hooks.md` |

## Supabase MCP

ECC includes a Supabase MCP server config in `mcp-configs/mcp-servers.json`. To connect Claude Code directly to your Supabase project, configure the `SUPABASE_ACCESS_TOKEN` and project ref in your environment.

## Upstream Compatibility

All toolkit files are **additive only** — no existing ECC files were modified. You can safely `git pull` from upstream ECC without merge conflicts. After pulling, optionally run `node scripts/ci/catalog.js --write` to resync documentation counts.
