---
name: dart-flutter-patterns
description: Dart and Flutter development patterns, state management (Riverpod, Bloc, Provider), code generation (Freezed, build_runner), testing (unit, widget, integration), and best practices for production Flutter applications.
---

# Dart & Flutter Development Patterns

Comprehensive patterns and best practices for Dart language and Flutter framework development.

## Dart Language Fundamentals

### Null Safety

```dart
// ALWAYS use sound null safety
// Dart 3+ enforces this by default

// Non-nullable by default
String name = 'Alice';

// Nullable with ?
String? middleName;

// Null-aware operators
final displayName = middleName ?? 'N/A';
final length = middleName?.length ?? 0;

// Late initialization (use sparingly)
late final String config;

// Never use ! unless you have absolute proof of non-null
// BAD: value!.doSomething()
// GOOD: if (value != null) value.doSomething()
```

### Immutability (CRITICAL)

```dart
// ALWAYS prefer immutable data classes

// BAD: Mutable class
class User {
  String name;
  int age;
  User(this.name, this.age);
}

// GOOD: Immutable with copyWith
class User {
  final String name;
  final int age;

  const User({required this.name, required this.age});

  User copyWith({String? name, int? age}) {
    return User(
      name: name ?? this.name,
      age: age ?? this.age,
    );
  }
}

// BEST: Use Freezed for generated immutable classes
@freezed
class User with _$User {
  const factory User({
    required String name,
    required int age,
    String? email,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

// Usage - immutable update
final updatedUser = user.copyWith(name: 'Bob');
```

### Collections - Immutable Patterns

```dart
// GOOD: Unmodifiable collections
final items = List<String>.unmodifiable(['a', 'b', 'c']);

// GOOD: Spread operator for immutable updates
final updatedList = [...items, 'newItem'];
final updatedMap = {...existingMap, 'key': 'value'};

// BAD: Direct mutation
items.add('d'); // Throws at runtime with unmodifiable
```

### Error Handling

```dart
// ALWAYS handle errors explicitly

// Custom exception hierarchy
class AppException implements Exception {
  final String message;
  final String? code;
  final StackTrace? stackTrace;

  const AppException(this.message, {this.code, this.stackTrace});

  @override
  String toString() => 'AppException($code): $message';
}

class NetworkException extends AppException {
  final int? statusCode;

  const NetworkException(super.message, {this.statusCode, super.code});
}

class ValidationException extends AppException {
  final Map<String, String> fieldErrors;

  const ValidationException(super.message, {required this.fieldErrors});
}

// Sealed class for Result type (Dart 3+)
sealed class Result<T> {
  const Result();
}

class Success<T> extends Result<T> {
  final T data;
  const Success(this.data);
}

class Failure<T> extends Result<T> {
  final AppException error;
  const Failure(this.error);
}

// Usage with pattern matching
Future<Result<User>> fetchUser(String id) async {
  try {
    final response = await dio.get('/users/$id');
    final user = User.fromJson(response.data);
    return Success(user);
  } on DioException catch (e) {
    return Failure(NetworkException(
      'Failed to fetch user',
      statusCode: e.response?.statusCode,
    ));
  }
}

// Pattern matching on result
final result = await fetchUser('123');
switch (result) {
  case Success(:final data):
    print('User: ${data.name}');
  case Failure(:final error):
    print('Error: ${error.message}');
}
```

### Async Patterns

```dart
// GOOD: Parallel execution when possible
final (users, markets, stats) = await (
  fetchUsers(),
  fetchMarkets(),
  fetchStats(),
).wait;

// GOOD: Stream handling
Stream<List<Message>> watchMessages(String chatId) {
  return firestore
      .collection('chats/$chatId/messages')
      .orderBy('createdAt', descending: true)
      .limit(50)
      .snapshots()
      .map((snapshot) =>
          snapshot.docs.map((doc) => Message.fromJson(doc.data())).toList());
}

// GOOD: StreamController with proper cleanup
class MessageService {
  final _controller = StreamController<Message>.broadcast();

  Stream<Message> get messages => _controller.stream;

  void addMessage(Message message) {
    _controller.add(message);
  }

  void dispose() {
    _controller.close();
  }
}
```

### Extension Methods

```dart
// GOOD: Domain-specific extensions
extension StringValidation on String {
  bool get isValidEmail => RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(this);
  bool get isValidPhone => RegExp(r'^\+?[\d\s-]{10,}$').hasMatch(this);
}

extension DateFormatting on DateTime {
  String get yMd => '$year-${month.toString().padLeft(2, '0')}-${day.toString().padLeft(2, '0')}';
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }
}

extension ListSafe<T> on List<T> {
  T? get firstOrNull => isEmpty ? null : first;
  T? get lastOrNull => isEmpty ? null : last;
  T? elementAtOrNull(int index) => index >= 0 && index < length ? this[index] : null;
}
```

## Flutter Widget Patterns

### Widget Structure

```dart
// GOOD: Stateless widget with const constructor
class UserCard extends StatelessWidget {
  final User user;
  final VoidCallback? onTap;

  const UserCard({
    super.key,
    required this.user,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(user.name, style: theme.textTheme.titleMedium),
              const SizedBox(height: 4),
              Text(user.email, style: theme.textTheme.bodySmall),
            ],
          ),
        ),
      ),
    );
  }
}
```

### Composition Over Inheritance

```dart
// GOOD: Compose widgets from smaller pieces
class ProfilePage extends StatelessWidget {
  final User user;

  const ProfilePage({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(user.name)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _ProfileHeader(user: user),
            const SizedBox(height: 16),
            _ProfileStats(user: user),
            const SizedBox(height: 16),
            _ProfileActions(user: user),
          ],
        ),
      ),
    );
  }
}

// Private composed widgets
class _ProfileHeader extends StatelessWidget {
  final User user;
  const _ProfileHeader({required this.user});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(
          radius: 40,
          backgroundImage: NetworkImage(user.avatarUrl),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(user.name, style: Theme.of(context).textTheme.headlineSmall),
              Text(user.bio ?? ''),
            ],
          ),
        ),
      ],
    );
  }
}
```

### const Constructors

```dart
// ALWAYS use const where possible for performance

// GOOD: const widget tree
const SizedBox(height: 16)
const EdgeInsets.all(16)
const Icon(Icons.home)
const Text('Static text')

// GOOD: const constructor in custom widgets
class AppLogo extends StatelessWidget {
  const AppLogo({super.key});

  @override
  Widget build(BuildContext context) {
    return const FlutterLogo(size: 48);
  }
}

// BAD: Missing const
SizedBox(height: 16)  // Should be const
EdgeInsets.all(16)    // Should be const
```

## State Management

### Riverpod (Recommended)

```dart
// Provider definition
@riverpod
class UserNotifier extends _$UserNotifier {
  @override
  FutureOr<User> build(String userId) async {
    return ref.watch(userRepositoryProvider).fetchUser(userId);
  }

  Future<void> updateName(String name) async {
    final user = await future;
    state = const AsyncLoading();
    state = await AsyncValue.guard(() =>
        ref.read(userRepositoryProvider).updateUser(
              user.copyWith(name: name),
            ));
  }
}

// Repository provider
@riverpod
UserRepository userRepository(Ref ref) {
  return UserRepository(
    dio: ref.watch(dioProvider),
  );
}

// Usage in widget
class UserProfile extends ConsumerWidget {
  final String userId;

  const UserProfile({super.key, required this.userId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(userNotifierProvider(userId));

    return userAsync.when(
      data: (user) => UserCard(user: user),
      loading: () => const CircularProgressIndicator(),
      error: (error, stack) => ErrorWidget(error),
    );
  }
}
```

### Bloc Pattern

```dart
// Events
sealed class AuthEvent {
  const AuthEvent();
}

class AuthLoginRequested extends AuthEvent {
  final String email;
  final String password;
  const AuthLoginRequested({required this.email, required this.password});
}

class AuthLogoutRequested extends AuthEvent {
  const AuthLogoutRequested();
}

// States
sealed class AuthState {
  const AuthState();
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class AuthAuthenticated extends AuthState {
  final User user;
  const AuthAuthenticated(this.user);
}

class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
}

// Bloc
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepo;

  AuthBloc(this._authRepo) : super(const AuthInitial()) {
    on<AuthLoginRequested>(_onLogin);
    on<AuthLogoutRequested>(_onLogout);
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

  Future<void> _onLogout(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await _authRepo.logout();
    emit(const AuthInitial());
  }
}

// Usage
BlocBuilder<AuthBloc, AuthState>(
  builder: (context, state) {
    return switch (state) {
      AuthInitial() => const LoginForm(),
      AuthLoading() => const CircularProgressIndicator(),
      AuthAuthenticated(:final user) => HomeScreen(user: user),
      AuthError(:final message) => ErrorView(message: message),
    };
  },
)
```

### Provider (Legacy but Common)

```dart
// ChangeNotifier pattern
class CartNotifier extends ChangeNotifier {
  final List<CartItem> _items = [];

  List<CartItem> get items => List.unmodifiable(_items);

  double get totalPrice =>
      _items.fold(0, (sum, item) => sum + item.price * item.quantity);

  void addItem(Product product) {
    final existingIndex = _items.indexWhere((i) => i.productId == product.id);
    if (existingIndex >= 0) {
      _items[existingIndex] = _items[existingIndex].copyWith(
        quantity: _items[existingIndex].quantity + 1,
      );
    } else {
      _items.add(CartItem.fromProduct(product));
    }
    notifyListeners();
  }

  void removeItem(String productId) {
    _items.removeWhere((i) => i.productId == productId);
    notifyListeners();
  }
}

// Usage
ChangeNotifierProvider(
  create: (_) => CartNotifier(),
  child: const ShoppingApp(),
)
```

## Code Generation

### Freezed (Data Classes)

```dart
// Define in user.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String name,
    required String email,
    @Default(UserRole.user) UserRole role,
    DateTime? lastLoginAt,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

enum UserRole {
  @JsonValue('admin') admin,
  @JsonValue('user') user,
  @JsonValue('moderator') moderator,
}

// Union types with Freezed
@freezed
sealed class PaymentMethod with _$PaymentMethod {
  const factory PaymentMethod.creditCard({
    required String number,
    required String expiry,
  }) = CreditCard;

  const factory PaymentMethod.bankTransfer({
    required String accountNumber,
    required String routingNumber,
  }) = BankTransfer;

  const factory PaymentMethod.digitalWallet({
    required String walletId,
    required WalletProvider provider,
  }) = DigitalWallet;
}

// Pattern matching
String describePayment(PaymentMethod method) {
  return switch (method) {
    CreditCard(:final number) => 'Card ending in ${number.substring(number.length - min(4, number.length))}',
    BankTransfer(:final accountNumber) => 'Bank account $accountNumber',
    DigitalWallet(:final provider) => '${provider.name} wallet',
  };
}
```

### build_runner Commands

```bash
# Generate code once
dart run build_runner build --delete-conflicting-outputs

# Watch mode during development
dart run build_runner watch --delete-conflicting-outputs

# Clean generated files
dart run build_runner clean
```

### JSON Serialization

```dart
import 'package:json_annotation/json_annotation.dart';

part 'api_response.g.dart';

@JsonSerializable(genericArgumentFactories: true)
class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? error;
  final PaginationMeta? meta;

  const ApiResponse({
    required this.success,
    this.data,
    this.error,
    this.meta,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) => _$ApiResponseFromJson(json, fromJsonT);

  Map<String, dynamic> toJson(Object? Function(T value) toJsonT) =>
      _$ApiResponseToJson(this, toJsonT);
}

@JsonSerializable()
class PaginationMeta {
  final int total;
  final int page;
  final int limit;

  const PaginationMeta({
    required this.total,
    required this.page,
    required this.limit,
  });

  factory PaginationMeta.fromJson(Map<String, dynamic> json) =>
      _$PaginationMetaFromJson(json);

  Map<String, dynamic> toJson() => _$PaginationMetaToJson(this);
}
```

## Repository Pattern

```dart
// Abstract repository interface
abstract class UserRepository {
  Future<List<User>> findAll({UserFilter? filter});
  Future<User?> findById(String id);
  Future<User> create(CreateUserDto dto);
  Future<User> update(String id, UpdateUserDto dto);
  Future<void> delete(String id);
  Stream<List<User>> watchAll();
}

// Concrete implementation
class FirebaseUserRepository implements UserRepository {
  final FirebaseFirestore _firestore;

  FirebaseUserRepository(this._firestore);

  CollectionReference<Map<String, dynamic>> get _collection =>
      _firestore.collection('users');

  @override
  Future<List<User>> findAll({UserFilter? filter}) async {
    Query<Map<String, dynamic>> query = _collection;

    if (filter?.role != null) {
      query = query.where('role', isEqualTo: filter!.role!.name);
    }

    if (filter?.limit != null) {
      query = query.limit(filter!.limit!);
    }

    final snapshot = await query.get();
    return snapshot.docs.map((doc) => User.fromJson({...doc.data(), 'id': doc.id})).toList();
  }

  @override
  Future<User?> findById(String id) async {
    final doc = await _collection.doc(id).get();
    if (!doc.exists) return null;
    return User.fromJson({...doc.data()!, 'id': doc.id});
  }

  @override
  Stream<List<User>> watchAll() {
    return _collection.snapshots().map((snapshot) =>
        snapshot.docs.map((doc) => User.fromJson({...doc.data(), 'id': doc.id})).toList());
  }

  // create, update, delete implementations...
}
```

## Navigation (GoRouter)

```dart
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    refreshListenable: authState,
    redirect: (context, state) {
      final isLoggedIn = authState.isAuthenticated;
      final isLoginRoute = state.matchedLocation == '/login';

      if (!isLoggedIn && !isLoginRoute) return '/login';
      if (isLoggedIn && isLoginRoute) return '/';
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomeScreen(),
        routes: [
          GoRoute(
            path: 'users/:userId',
            builder: (context, state) {
              final userId = state.pathParameters['userId']!;
              return UserDetailScreen(userId: userId);
            },
          ),
        ],
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
    ],
  );
});
```

## Networking (Dio)

```dart
// Dio client setup with interceptors
class ApiClient {
  late final Dio _dio;

  ApiClient({required String baseUrl, required TokenStorage tokenStorage}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Content-Type': 'application/json'},
    ));

    _dio.interceptors.addAll([
      _AuthInterceptor(tokenStorage),
      _LoggingInterceptor(),
      _RetryInterceptor(maxRetries: 3),
    ]);
  }

  Future<ApiResponse<T>> get<T>(
    String path, {
    required T Function(Object? json) fromJson,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return ApiResponse.fromJson(response.data, fromJson);
    } on DioException catch (e) {
      throw NetworkException(
        e.message ?? 'Network error',
        statusCode: e.response?.statusCode,
      );
    }
  }
}

// Auth interceptor
class _AuthInterceptor extends Interceptor {
  final TokenStorage _tokenStorage;

  _AuthInterceptor(this._tokenStorage);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _tokenStorage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      try {
        await _tokenStorage.refreshToken();
        final retryResponse = await _retry(err.requestOptions);
        handler.resolve(retryResponse);
        return;
      } catch (_) {
        await _tokenStorage.clearTokens();
      }
    }
    handler.next(err);
  }
}
```

## File Organization

### Project Structure

```
lib/
├── app/                        # App-level configuration
│   ├── app.dart               # MaterialApp/CupertinoApp
│   ├── router.dart            # GoRouter configuration
│   └── theme.dart             # ThemeData
├── core/                      # Shared utilities
│   ├── constants/             # App-wide constants
│   ├── exceptions/            # Custom exceptions
│   ├── extensions/            # Extension methods
│   ├── network/               # Dio client, interceptors
│   └── utils/                 # Helper functions
├── features/                  # Feature-based modules
│   ├── auth/
│   │   ├── data/
│   │   │   ├── models/       # Data transfer objects
│   │   │   ├── repositories/ # Repository implementations
│   │   │   └── datasources/  # Remote/local data sources
│   │   ├── domain/
│   │   │   ├── entities/     # Business entities
│   │   │   ├── repositories/ # Abstract repository interfaces
│   │   │   └── usecases/     # Business logic
│   │   └── presentation/
│   │       ├── providers/    # Riverpod providers / Blocs
│   │       ├── screens/      # Full-page widgets
│   │       └── widgets/      # Feature-specific widgets
│   └── home/
│       ├── data/
│       ├── domain/
│       └── presentation/
├── shared/                    # Shared widgets and services
│   ├── widgets/              # Reusable UI components
│   └── services/             # Platform services
└── main.dart                 # Entry point

test/
├── unit/                     # Unit tests
├── widget/                   # Widget tests
├── integration/              # Integration tests
└── helpers/                  # Test utilities and mocks
```

### File Naming

```
lib/features/auth/data/models/user_model.dart       # snake_case for files
lib/features/auth/presentation/screens/login_screen.dart
lib/features/auth/presentation/providers/auth_provider.dart
test/unit/auth/auth_bloc_test.dart                   # _test.dart suffix
```

## Dart Tooling

### Key Commands

```bash
# Package management
dart pub get                    # Install dependencies
dart pub upgrade                # Upgrade dependencies
dart pub outdated               # Check for outdated packages
flutter pub add <package>       # Add a dependency
flutter pub add -d <package>    # Add a dev dependency

# Code quality
dart analyze                    # Static analysis (linting)
dart fix --apply                # Auto-fix lint issues
dart format .                   # Format all Dart files
dart format --set-exit-if-changed .  # CI: check formatting

# Code generation
dart run build_runner build --delete-conflicting-outputs
dart run build_runner watch --delete-conflicting-outputs

# Testing
flutter test                    # Run all tests
flutter test --coverage         # Run with coverage
flutter test test/unit/         # Run specific directory
flutter test --name "login"     # Run tests matching name

# Flutter-specific
flutter build apk --release     # Build Android APK
flutter build ios --release     # Build iOS
flutter build web               # Build web
flutter clean                   # Clean build artifacts
flutter doctor                  # Check environment
```

### analysis_options.yaml

```yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  errors:
    invalid_annotation_target: ignore
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"

linter:
  rules:
    - always_declare_return_types
    - avoid_dynamic_calls
    - avoid_print
    - avoid_relative_lib_imports
    - cancel_subscriptions
    - close_sinks
    - prefer_const_constructors
    - prefer_const_declarations
    - prefer_final_fields
    - prefer_final_locals
    - prefer_single_quotes
    - require_trailing_commas
    - sort_child_properties_last
    - unawaited_futures
    - unnecessary_lambdas
    - use_key_in_widget_constructors
```

## Performance Best Practices

### Widget Optimization

```dart
// GOOD: Extract frequently rebuilding widgets
class CounterDisplay extends StatelessWidget {
  final int count;
  const CounterDisplay({super.key, required this.count});

  @override
  Widget build(BuildContext context) {
    return Text('Count: $count');
  }
}

// GOOD: Use RepaintBoundary for complex subtrees
RepaintBoundary(
  child: ComplexAnimatedWidget(),
)

// GOOD: Use const constructors to avoid rebuilds
const SizedBox(height: 16)
const Divider()

// GOOD: ListView.builder for long lists (lazy rendering)
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemCard(item: items[index]),
)

// BAD: ListView with all children materialized
ListView(
  children: items.map((item) => ItemCard(item: item)).toList(),
)
```

### Image Optimization

```dart
// GOOD: Cached network images
CachedNetworkImage(
  imageUrl: user.avatarUrl,
  placeholder: (context, url) => const CircularProgressIndicator(),
  errorWidget: (context, url, error) => const Icon(Icons.error),
  memCacheWidth: 200,
)

// GOOD: Precache images
@override
void didChangeDependencies() {
  super.didChangeDependencies();
  precacheImage(AssetImage('assets/hero.png'), context);
}
```

## Security Best Practices

### Secret Management

```dart
// NEVER hardcode secrets
// BAD
const apiKey = 'sk-abc123xyz';

// GOOD: Use environment variables with --dart-define
// flutter run --dart-define=API_KEY=sk-abc123xyz
const apiKey = String.fromEnvironment('API_KEY');

// GOOD: Use flutter_dotenv for development
await dotenv.load(fileName: '.env');
final apiKey = dotenv.env['API_KEY'];
if (apiKey == null) throw Exception('API_KEY not configured');

// GOOD: Use flutter_secure_storage for sensitive data
final storage = FlutterSecureStorage();
await storage.write(key: 'token', value: accessToken);
final token = await storage.read(key: 'token');
```

### Input Validation

```dart
// GOOD: Validate at boundaries
class LoginDto {
  final String email;
  final String password;

  LoginDto._({required this.email, required this.password});

  factory LoginDto.validated({
    required String email,
    required String password,
  }) {
    if (!email.isValidEmail) {
      throw ValidationException('Invalid email format', fieldErrors: {'email': 'Invalid format'});
    }
    if (password.length < 8) {
      throw ValidationException('Password too short', fieldErrors: {'password': 'Min 8 characters'});
    }
    return LoginDto._(email: email.trim(), password: password);
  }
}
```

## Related Skills

- `coding-standards.md` - General coding best practices
- `tdd-workflow/` - Test-driven development methodology
- `security-review/` - Security checklist

**Remember**: Dart and Flutter reward immutability, strong typing, and composition. Use code generation to eliminate boilerplate and keep widget trees shallow and readable.
