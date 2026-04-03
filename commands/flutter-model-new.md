---
description: Generate Dart data models with Freezed, JSON serialization, and Supabase table mapping
---

# Create New Data Model

Generate production-ready Dart data models that work with both Freezed and Supabase.

## Gather Context

1. What entity does this model represent?
2. List the fields (name, type, nullable?, default?)
3. Does it map to a Supabase table? If so, which one?
4. Does it need union types / sealed variants? (e.g., `PaymentStatus.pending | .completed | .failed`)

## Code Generation

### Model File

Location: `lib/features/<feature>/models/<model_name>.dart`

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part '<model_name>.freezed.dart';
part '<model_name>.g.dart';

@freezed
class ModelName with _$ModelName {
  const factory ModelName({
    required String id,
    // ... fields
  }) = _ModelName;

  factory ModelName.fromJson(Map<String, dynamic> json) =>
      _$ModelNameFromJson(json);
}
```

### Rules

- Use `@JsonKey(name: 'snake_case')` when Dart field names differ from Supabase column names
- Use `DateTime` for timestamps, not `String` — add `@JsonKey(fromJson: ...)` if needed
- Mark optional fields as `Type?` with `@Default(null)` or a sensible default
- Add `@JsonEnum(valueString)` for enums that map to Supabase text columns
- If the model has nested objects, create separate Freezed classes for each
- Include a `toInsertJson()` extension method that strips `id` and `created_at` for Supabase inserts

### Companion: Repository Stub

If mapped to a Supabase table, also generate a minimal repository interface:

```dart
abstract class ModelNameRepository {
  Future<List<ModelName>> getAll();
  Future<ModelName?> getById(String id);
  Future<ModelName> create(ModelName item);
  Future<void> delete(String id);
}
```

## Output

1. The Freezed model file
2. A repository stub (if Supabase-mapped)
3. Remind the user to run `dart run build_runner build --delete-conflicting-outputs`
