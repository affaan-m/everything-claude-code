---
name: dart-testing
description: Use this skill when writing Dart/Flutter tests. Covers unit tests, widget tests, integration tests, mocking with Mockito, and Flutter-specific testing patterns for Riverpod, Bloc, and GoRouter.
---

# Dart & Flutter Testing Workflow

This skill ensures all Dart and Flutter code follows TDD principles with comprehensive test coverage across unit, widget, and integration tests.

## When to Activate

- Writing new Dart/Flutter features
- Fixing bugs in Flutter applications
- Refactoring existing Dart code
- Adding new screens or widgets
- Creating new providers, blocs, or repositories
- Implementing business logic

## Core Principles

### 1. Tests BEFORE Code
ALWAYS write tests first, then implement code to make tests pass.

### 2. Coverage Requirements
- Minimum 80% coverage (unit + widget + integration)
- All edge cases covered
- Error scenarios tested
- Boundary conditions verified

### 3. Test Types

#### Unit Tests
- Individual functions and utilities
- Repository methods
- Bloc/Cubit logic
- Riverpod providers
- Data models and serialization

#### Widget Tests
- Individual widget rendering
- Widget interaction (tap, scroll, input)
- State changes in response to events
- Theme and layout verification

#### Integration Tests
- Full screen workflows
- Navigation flows
- Complete feature testing with real widgets
- Platform channel interactions

## TDD Workflow Steps

### Step 1: Write Test First (RED)

```dart
// test/unit/auth/auth_bloc_test.dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

@GenerateMocks([AuthRepository])
import 'auth_bloc_test.mocks.dart';

void main() {
  late AuthBloc bloc;
  late MockAuthRepository mockRepo;

  setUp(() {
    mockRepo = MockAuthRepository();
    bloc = AuthBloc(mockRepo);
  });

  tearDown(() {
    bloc.close();
  });

  group('AuthBloc', () {
    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthAuthenticated] on successful login',
      build: () {
        when(mockRepo.login('test@test.com', 'password123'))
            .thenAnswer((_) async => const User(id: '1', name: 'Test'));
        return bloc;
      },
      act: (bloc) => bloc.add(
        const AuthLoginRequested(
          email: 'test@test.com',
          password: 'password123',
        ),
      ),
      expect: () => [
        const AuthLoading(),
        const AuthAuthenticated(User(id: '1', name: 'Test')),
      ],
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthError] on failed login',
      build: () {
        when(mockRepo.login(any, any))
            .thenThrow(Exception('Invalid credentials'));
        return bloc;
      },
      act: (bloc) => bloc.add(
        const AuthLoginRequested(
          email: 'wrong@test.com',
          password: 'wrong',
        ),
      ),
      expect: () => [
        const AuthLoading(),
        isA<AuthError>(),
      ],
    );
  });
}
```

### Step 2: Run Test (Verify it FAILS)
```bash
flutter test test/unit/auth/auth_bloc_test.dart
# Test should fail - we haven't implemented yet
```

### Step 3: Write Minimal Implementation (GREEN)
```dart
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepo;

  AuthBloc(this._authRepo) : super(const AuthInitial()) {
    on<AuthLoginRequested>(_onLogin);
  }

  Future<void> _onLogin(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    try {
      final user = await _authRepo.login(event.email, event.password);
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }
}
```

### Step 4: Run Test (Verify it PASSES)
```bash
flutter test test/unit/auth/auth_bloc_test.dart
# Test should now pass
```

### Step 5: Verify Coverage
```bash
flutter test --coverage
# View coverage report
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

## Testing Patterns

### Unit Test Pattern

```dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('User model', () {
    test('creates from JSON correctly', () {
      final json = {
        'id': '1',
        'name': 'Alice',
        'email': 'alice@test.com',
      };

      final user = User.fromJson(json);

      expect(user.id, '1');
      expect(user.name, 'Alice');
      expect(user.email, 'alice@test.com');
    });

    test('serializes to JSON correctly', () {
      const user = User(id: '1', name: 'Alice', email: 'alice@test.com');

      final json = user.toJson();

      expect(json['id'], '1');
      expect(json['name'], 'Alice');
    });

    test('copyWith creates new instance with updated fields', () {
      const user = User(id: '1', name: 'Alice', email: 'alice@test.com');

      final updated = user.copyWith(name: 'Bob');

      expect(updated.name, 'Bob');
      expect(updated.id, '1'); // unchanged
      expect(updated.email, 'alice@test.com'); // unchanged
      expect(identical(user, updated), isFalse); // new instance
    });

    test('throws on invalid email', () {
      expect(
        () => User.validated(name: 'Test', email: 'invalid'),
        throwsA(isA<ValidationException>()),
      );
    });
  });
}
```

### Widget Test Pattern

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('LoginScreen', () {
    testWidgets('renders email and password fields', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: LoginScreen()),
      );

      expect(find.byType(TextField), findsNWidgets(2));
      expect(find.text('Email'), findsOneWidget);
      expect(find.text('Password'), findsOneWidget);
      expect(find.text('Login'), findsOneWidget);
    });

    testWidgets('shows error on empty email submission', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: LoginScreen()),
      );

      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      expect(find.text('Email is required'), findsOneWidget);
    });

    testWidgets('calls onLogin with correct credentials', (tester) async {
      String? capturedEmail;
      String? capturedPassword;

      await tester.pumpWidget(
        MaterialApp(
          home: LoginScreen(
            onLogin: (email, password) {
              capturedEmail = email;
              capturedPassword = password;
            },
          ),
        ),
      );

      await tester.enterText(
        find.byKey(const Key('emailField')),
        'test@test.com',
      );
      await tester.enterText(
        find.byKey(const Key('passwordField')),
        'password123',
      );
      await tester.tap(find.text('Login'));
      await tester.pumpAndSettle();

      expect(capturedEmail, 'test@test.com');
      expect(capturedPassword, 'password123');
    });
  });
}
```

### Riverpod Testing

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

void main() {
  group('UserNotifier', () {
    late MockUserRepository mockRepo;
    late ProviderContainer container;

    setUp(() {
      mockRepo = MockUserRepository();
      container = ProviderContainer(
        overrides: [
          userRepositoryProvider.overrideWithValue(mockRepo),
        ],
      );
    });

    tearDown(() {
      container.dispose();
    });

    test('fetches user on initialization', () async {
      when(mockRepo.fetchUser('1'))
          .thenAnswer((_) async => const User(id: '1', name: 'Alice'));

      final notifier = container.read(userNotifierProvider('1').notifier);

      // Wait for async initialization
      await container.read(userNotifierProvider('1').future);

      final state = container.read(userNotifierProvider('1'));
      expect(state.value?.name, 'Alice');
    });

    test('handles fetch error', () async {
      when(mockRepo.fetchUser('999'))
          .thenThrow(Exception('User not found'));

      await expectLater(
        container.read(userNotifierProvider('999').future),
        throwsA(isA<Exception>()),
      );
    });
  });
}

// Widget test with Riverpod
testWidgets('displays user name from provider', (tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        userNotifierProvider('1').overrideWith(
          () => FakeUserNotifier(),
        ),
      ],
      child: const MaterialApp(home: UserProfile(userId: '1')),
    ),
  );

  await tester.pumpAndSettle();
  expect(find.text('Alice'), findsOneWidget);
});
```

### Integration Test Pattern

```dart
// integration_test/app_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:my_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('complete login flow', (tester) async {
    app.main();
    await tester.pumpAndSettle();

    // Verify login screen
    expect(find.text('Login'), findsOneWidget);

    // Enter credentials
    await tester.enterText(
      find.byKey(const Key('emailField')),
      'test@test.com',
    );
    await tester.enterText(
      find.byKey(const Key('passwordField')),
      'password123',
    );

    // Tap login button
    await tester.tap(find.text('Login'));
    await tester.pumpAndSettle(const Duration(seconds: 3));

    // Verify navigation to home
    expect(find.text('Welcome'), findsOneWidget);
    expect(find.text('Login'), findsNothing);
  });
}
```

## Mocking with Mockito

### Setup

```yaml
# pubspec.yaml dev_dependencies
dev_dependencies:
  flutter_test:
    sdk: flutter
  mockito: ^5.4.0
  build_runner: ^2.4.0
  bloc_test: ^9.1.0
```

### Generate Mocks

```dart
// Add @GenerateMocks annotation
@GenerateMocks([
  UserRepository,
  AuthRepository,
  ApiClient,
])
import 'test_file.mocks.dart';
```

```bash
# Generate mock classes
dart run build_runner build --delete-conflicting-outputs
```

### Mock Patterns

```dart
// Stubbing return values
when(mockRepo.findAll()).thenAnswer((_) async => [mockUser]);
when(mockRepo.findById('1')).thenAnswer((_) async => mockUser);
when(mockRepo.findById('999')).thenAnswer((_) async => null);

// Stubbing errors
when(mockRepo.delete('1')).thenThrow(Exception('Not authorized'));

// Verifying calls
verify(mockRepo.findById('1')).called(1);
verifyNever(mockRepo.delete(any));
verifyNoMoreInteractions(mockRepo);

// Argument capture
final captured = verify(mockRepo.create(captureAny)).captured;
expect((captured.first as CreateUserDto).name, 'Alice');
```

## Test File Organization

```
test/
├── unit/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── auth_bloc_test.dart
│   │   │   ├── auth_repository_test.dart
│   │   │   └── user_model_test.dart
│   │   └── home/
│   │       └── home_cubit_test.dart
│   └── core/
│       ├── network/
│       │   └── api_client_test.dart
│       └── utils/
│           └── validators_test.dart
├── widget/
│   ├── features/
│   │   ├── auth/
│   │   │   └── login_screen_test.dart
│   │   └── home/
│   │       └── home_screen_test.dart
│   └── shared/
│       └── widgets/
│           └── app_button_test.dart
└── helpers/
    ├── mocks.dart
    ├── test_helpers.dart
    └── pump_app.dart

integration_test/          # Flutter convention: at project root, not under test/
└── app_test.dart
```

## Test Helpers

```dart
// test/helpers/pump_app.dart
extension PumpApp on WidgetTester {
  Future<void> pumpApp(
    Widget widget, {
    List<Override> overrides = const [],
  }) async {
    await pumpWidget(
      ProviderScope(
        overrides: overrides,
        child: MaterialApp(
          home: widget,
        ),
      ),
    );
    await pumpAndSettle();
  }
}

// test/helpers/mocks.dart
class FakeUserNotifier extends UserNotifier {
  @override
  FutureOr<User> build(String userId) {
    return const User(id: '1', name: 'Alice', email: 'alice@test.com');
  }
}
```

## Common Testing Mistakes to Avoid

### WRONG: Not pumping after state changes
```dart
// BAD
await tester.tap(find.text('Submit'));
expect(find.text('Success'), findsOneWidget); // May not have rebuilt yet
```

### CORRECT: Pump after interactions
```dart
// GOOD
await tester.tap(find.text('Submit'));
await tester.pumpAndSettle(); // Wait for all animations and rebuilds
expect(find.text('Success'), findsOneWidget);
```

### WRONG: Testing widget internals
```dart
// BAD
final state = tester.state<LoginScreenState>(find.byType(LoginScreen));
expect(state.isLoading, true);
```

### CORRECT: Test visible behavior
```dart
// GOOD
expect(find.byType(CircularProgressIndicator), findsOneWidget);
```

## Coverage Commands

```bash
# Run all tests with coverage
flutter test --coverage

# Generate HTML report
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html

# Check coverage threshold in CI
flutter test --coverage
lcov --summary coverage/lcov.info | grep "lines" | awk '{print $2}' | sed 's/%//'
# Fail CI if below 80%
```

## Best Practices

1. **Write Tests First** - Always TDD
2. **One Assert Per Test** - Focus on single behavior
3. **Descriptive Test Names** - Explain what is tested
4. **Arrange-Act-Assert** - Clear test structure
5. **Mock External Dependencies** - Isolate unit tests
6. **Test Edge Cases** - Null, empty, invalid, boundaries
7. **Test Error Paths** - Not just happy paths
8. **Keep Tests Fast** - Unit tests < 50ms each
9. **Clean Up After Tests** - Use tearDown, dispose
10. **Review Coverage Reports** - Identify gaps

**Remember**: Tests are not optional. They are the safety net that enables confident refactoring, rapid development, and production reliability in Flutter applications.
