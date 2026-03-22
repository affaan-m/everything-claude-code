---
name: dart-patterns
description: Dart and Flutter development patterns, state management, testing, code generation, and best practices for building cross-platform applications.
origin: ECC
---

# Dart & Flutter Development Patterns

Idiomatic Dart and Flutter patterns for building cross-platform mobile, web, and desktop applications.

## When to Use

- Writing new Dart or Flutter code
- Setting up state management (Riverpod, Bloc, Provider)
- Working with code generation (Freezed, json_serializable, build_runner)
- Writing tests (unit, widget, integration)

## How It Works

This skill covers six areas: null safety and sound typing to catch errors at compile time, immutable data models with Freezed for predictable state, Riverpod for scalable dependency injection and state management, widget composition patterns for reusable UIs, structured error handling with sealed classes, and testing at every layer (unit, widget, golden, integration).

## Core Principles

### 1. Null Safety and Sound Typing

Dart's sound null safety eliminates null reference errors at compile time.

```dart
// Good: Use nullable types explicitly
String? findUser(int id) {
  final user = _cache[id];
  return user?.name;
}

// Good: Use late for guaranteed initialization
late final DatabaseConnection _db;

// Good: Use required for non-optional named parameters
void createUser({required String name, required String email}) {
  // name and email are guaranteed non-null
}

// Avoid: Force unwrapping without checks
// String name = nullableValue!; // Throws at runtime
```

### 2. Immutable Data Models with Freezed

Use Freezed for immutable, copyable data classes with built-in equality.

```dart
// pubspec.yaml: freezed, freezed_annotation, json_annotation, json_serializable

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String name,
    required String email,
    @Default(false) bool isAdmin,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

// Usage: immutable with copy
final updated = user.copyWith(name: 'New Name');

// Sealed unions for state
@freezed
sealed class AuthState with _$AuthState {
  const factory AuthState.initial() = AuthInitial;
  const factory AuthState.loading() = AuthLoading;
  const factory AuthState.authenticated(User user) = AuthAuthenticated;
  const factory AuthState.error(String message) = AuthError;
}
```

Run code generation after changes:
```bash
dart run build_runner build --delete-conflicting-outputs
```

### 3. State Management with Riverpod

Riverpod provides compile-safe dependency injection and reactive state.

```dart
// Provider for a repository
@riverpod
UserRepository userRepository(Ref ref) {
  return UserRepository(ref.watch(httpClientProvider));
}

// Async provider for data fetching
@riverpod
Future<List<User>> users(Ref ref) async {
  final repo = ref.watch(userRepositoryProvider);
  return repo.getUsers();
}

// Notifier for mutable state
@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  AuthState build() => const AuthState.initial();

  Future<void> login(String email, String password) async {
    state = const AuthState.loading();
    try {
      final user = await ref.read(authRepositoryProvider).login(email, password);
      state = AuthState.authenticated(user);
    } catch (e) {
      state = AuthState.error(e.toString());
    }
  }
}

// In widgets: watch providers reactively
class UserListPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usersAsync = ref.watch(usersProvider);

    return usersAsync.when(
      data: (users) => ListView.builder(
        itemCount: users.length,
        itemBuilder: (_, i) => UserTile(user: users[i]),
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error: $e')),
    );
  }
}
```

### 4. Widget Composition

Build reusable, composable widgets. Prefer composition over inheritance.

```dart
// Good: Small, focused widgets
class UserAvatar extends StatelessWidget {
  const UserAvatar({super.key, required this.url, this.radius = 24});

  final String url;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      radius: radius,
      backgroundImage: NetworkImage(url),
    );
  }
}

// Good: Use extensions for theme access
extension BuildContextX on BuildContext {
  ThemeData get theme => Theme.of(this);
  TextTheme get textTheme => theme.textTheme;
  ColorScheme get colorScheme => theme.colorScheme;
}

// Good: Prefer const constructors
class AppButton extends StatelessWidget {
  const AppButton({super.key, required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      child: Text(label),
    );
  }
}
```

### 5. Error Handling

Use sealed classes and Result types for structured error handling.

```dart
// Sealed error hierarchy
sealed class AppError {
  String get message;
}

class NetworkError extends AppError {
  @override
  final String message;
  final int? statusCode;
  NetworkError(this.message, {this.statusCode});
}

class ValidationError extends AppError {
  @override
  final String message;
  final Map<String, String> fieldErrors;
  ValidationError(this.message, {this.fieldErrors = const {}});
}

// Sealed Result type — impossible states are unrepresentable
sealed class Result<T> {
  const Result();
}

class Success<T> extends Result<T> {
  final T data;
  const Success(this.data);
}

class Failure<T> extends Result<T> {
  final AppError error;
  const Failure(this.error);
}

Future<Result<User>> getUser(String id) async {
  try {
    final response = await _client.get('/users/$id');
    return Success(User.fromJson(response.data));
  } on DioException catch (e) {
    return Failure(NetworkError(e.message ?? 'Network error'));
  }
}
```

### 6. Testing

Test at every layer: unit, widget, and integration.

```dart
// Unit test with mockito
@GenerateMocks([UserRepository])
void main() {
  late MockUserRepository mockRepo;
  late UserService service;

  setUp(() {
    mockRepo = MockUserRepository();
    service = UserService(mockRepo);
  });

  test('getUser returns user when found', () async {
    when(mockRepo.findById('1')).thenAnswer((_) async => testUser);

    final result = await service.getUser('1');

    expect(result, equals(testUser));
    verify(mockRepo.findById('1')).called(1);
  });
}

// Widget test
void main() {
  testWidgets('UserTile displays name and email', (tester) async {
  await tester.pumpWidget(
    MaterialApp(
      home: UserTile(user: testUser),
    ),
  );

    expect(find.text('John Doe'), findsOneWidget);
    expect(find.text('john@example.com'), findsOneWidget);
  });
}

// Integration test
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('login flow', (tester) async {
    app.main();
    await tester.pumpAndSettle();

    await tester.enterText(find.byKey(const Key('email')), 'test@example.com');
    await tester.enterText(find.byKey(const Key('password')), 'password123');
    await tester.tap(find.byKey(const Key('login-button')));
    await tester.pumpAndSettle();

    expect(find.text('Welcome'), findsOneWidget);
  });
}
```

## Tooling

| Command | Purpose |
|---------|---------|
| `dart analyze` | Static analysis |
| `dart fix --apply` | Auto-fix lint issues |
| `dart format .` | Format code |
| `dart test` | Run unit tests |
| `flutter test` | Run Flutter tests |
| `flutter test --coverage` | Coverage report |
| `dart run build_runner build` | Run code generation |
| `dart run build_runner watch` | Watch mode for codegen |
| `flutter pub get` | Install dependencies |
| `flutter pub upgrade --major-versions` | Upgrade deps |

## Project Structure

```
lib/
├── main.dart                 # Entry point
├── app.dart                  # App widget, router setup
├── features/                 # Feature-first organization
│   ├── auth/
│   │   ├── data/             # Repositories, data sources
│   │   ├── domain/           # Models, interfaces
│   │   └── presentation/     # Widgets, pages, controllers
│   └── home/
├── shared/                   # Cross-feature utilities
│   ├── widgets/              # Reusable UI components
│   ├── extensions/           # Dart extension methods
│   └── providers/            # Shared Riverpod providers
test/
├── unit/                     # Pure Dart tests
├── widget/                   # Widget tests
└── integration/              # Full app integration tests
```
