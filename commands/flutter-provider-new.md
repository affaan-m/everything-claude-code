---
description: Scaffold Riverpod providers with proper async patterns, error handling, and caching
---

# Create New Riverpod Provider

Generate well-structured Riverpod providers for state management.

## Gather Context

1. What data or state does this provider manage?
2. Provider type needed:
   - **FutureProvider** — one-time async fetch (read-only)
   - **StreamProvider** — real-time data (Supabase realtime, streams)
   - **AsyncNotifierProvider** — async data + mutations (CRUD)
   - **NotifierProvider** — synchronous state with methods
   - **StateProvider** — simple primitive state (filters, toggles)
3. Does it depend on other providers? (`.family` modifier? Watching other providers?)
4. Should it auto-dispose or stay alive?

## Code Standards

- Use `@riverpod` annotation (riverpod_generator) when the project uses code generation
- Use `ref.keepAlive()` sparingly — only for providers that cache expensive data
- Always handle the error state — never let exceptions silently fail
- Use `ref.invalidateSelf()` after mutations to trigger a refetch
- For `.family` providers, use a record or Freezed class as the parameter — not multiple primitives
- Add `///` doc comment explaining what the provider does and when to use it

## Pattern: AsyncNotifier with Supabase

```dart
@riverpod
class ItemList extends _$ItemList {
  @override
  Future<List<Item>> build() async {
    final supabase = ref.watch(supabaseClientProvider);
    final data = await supabase.from('items').select();
    return data.map((json) => Item.fromJson(json)).toList();
  }

  Future<void> add(Item item) async {
    final supabase = ref.read(supabaseClientProvider);
    await supabase.from('items').insert(item.toInsertJson());
    ref.invalidateSelf();
  }

  Future<void> remove(String id) async {
    final supabase = ref.read(supabaseClientProvider);
    await supabase.from('items').delete().eq('id', id);
    ref.invalidateSelf();
  }
}
```

## Pattern: StreamProvider with Supabase Realtime

```dart
@riverpod
Stream<List<Message>> chatMessages(ref, {required String channelId}) {
  final supabase = ref.watch(supabaseClientProvider);
  return supabase
      .from('messages')
      .stream(primaryKey: ['id'])
      .eq('channel_id', channelId)
      .map((data) => data.map((json) => Message.fromJson(json)).toList());
}
```

## Output

1. Provider file at `lib/features/<feature>/providers/<name>_provider.dart`
2. Usage example in a widget showing `.when(data:, error:, loading:)`
3. Note any providers it depends on that may need to be created first
