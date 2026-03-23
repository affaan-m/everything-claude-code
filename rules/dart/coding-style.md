# Dart & Flutter Coding Style

## Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate:

```dart
// WRONG: Mutation
void updateUser(User user, String name) {
  user.name = name; // MUTATION - fields should be final
}

// CORRECT: Immutability with copyWith
User updateUser(User user, String name) {
  return user.copyWith(name: name); // Returns new instance
}

// CORRECT: Immutable collections
final updatedList = [...items, newItem];
final updatedMap = {...existingMap, 'key': 'value'};
```

## Null Safety

ALWAYS use sound null safety:

```dart
// WRONG: Unnecessary bang operator
final name = user.name!;

// CORRECT: Safe null handling
final name = user.name ?? 'Unknown';
// or
if (user.name case final name?) {
  print(name);
}
```

## File Organization

MANY SMALL FILES > FEW LARGE FILES:
- High cohesion, low coupling
- 200-400 lines typical, 800 max
- Organize by feature, not by type
- One class/widget per file (exceptions for private helpers)

## Error Handling

ALWAYS handle errors comprehensively:

```dart
try {
  final result = await riskyOperation();
  return Success(result);
} on NetworkException catch (e) {
  logger.error('Network failed', error: e);
  return Failure(e);
} on ValidationException catch (e) {
  logger.warning('Validation failed', error: e);
  return Failure(e);
} catch (e, stackTrace) {
  logger.error('Unexpected error', error: e, stackTrace: stackTrace);
  rethrow;
}
```

## Widget Guidelines

- Use `const` constructors everywhere possible
- Extract widgets when `build()` exceeds 30 lines
- Prefer `StatelessWidget` over `StatefulWidget`
- Use `ListView.builder` for dynamic lists
- Add `Key` to list item widgets

## Input Validation

ALWAYS validate user input:

```dart
class CreateUserDto {
  final String email;
  final String name;

  CreateUserDto._({required this.email, required this.name});

  factory CreateUserDto.validated({
    required String email,
    required String name,
  }) {
    if (email.isEmpty || !email.contains('@')) {
      throw ValidationException('Invalid email');
    }
    if (name.trim().isEmpty) {
      throw ValidationException('Name is required');
    }
    return CreateUserDto._(email: email.trim(), name: name.trim());
  }
}
```

## Naming Conventions

```
lib/features/auth/login_screen.dart        # snake_case for files
class LoginScreen                           # PascalCase for classes
final userName = 'Alice';                   # camelCase for variables
void fetchUserData() {}                     # camelCase for functions
const maxRetries = 3;                       # camelCase for constants
bool get isAuthenticated => ...;            # camelCase for getters
_PrivateHelper                              # _ prefix for private
```

## Tooling Commands

```bash
dart analyze                    # Run linter
dart fix --apply                # Auto-fix lint issues
dart format .                   # Format code
flutter test --coverage         # Run tests with coverage
dart run build_runner build     # Generate code
```

## Code Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling
- [ ] No print() statements (use logger)
- [ ] No hardcoded values (use constants or config)
- [ ] No mutation (immutable patterns used)
- [ ] const constructors used where possible
- [ ] Null safety properly enforced
- [ ] Generated files up to date
