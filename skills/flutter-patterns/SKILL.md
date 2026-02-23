---
name: flutter-patterns
description: Flutter patterns — widget design, Riverpod state management, GoRouter navigation, Dio networking, platform channels, theming, and testing with Dart.
---

# Flutter Development Patterns

Production-grade Flutter patterns with Dart for cross-platform mobile, web, and desktop apps.

## When to Activate

- Building Flutter apps with widget composition
- Managing state with Riverpod or Bloc/Cubit
- Setting up navigation with GoRouter (deep linking, guards)
- Implementing networking with Dio and repository pattern
- Working with platform channels (MethodChannel, Pigeon)
- Configuring Material 3 theming (light/dark, color schemes)
- Writing widget tests, golden tests, and integration tests

## Core Principles

1. **Composition over inheritance** — build complex UIs by composing small widgets
2. **Immutable state** — use `@freezed` / `@immutable` for state classes
3. **Riverpod for state** — prefer Riverpod over Provider or setState for anything beyond local UI state
4. **Repository pattern** — abstract data sources behind repository interfaces
5. **Const constructors** — use `const` everywhere possible for widget reuse optimization

## Project Structure

```
lib/
├── main.dart                    # Entry point, ProviderScope
├── app.dart                     # MaterialApp.router
├── core/
│   ├── theme/                   # ThemeData, color schemes
│   ├── router/                  # GoRouter configuration
│   ├── network/                 # Dio client, interceptors
│   └── utils/                   # Extensions, helpers
├── features/
│   ├── auth/
│   │   ├── data/                # AuthRepository, AuthApi
│   │   ├── domain/              # User model, AuthState
│   │   └── presentation/        # LoginScreen, widgets
│   └── home/
│       ├── data/
│       ├── domain/
│       └── presentation/
└── shared/
    ├── widgets/                 # Reusable widgets
    └── providers/               # App-wide providers
```

## Widget Patterns

### Stateless Widget

```dart
class UserCard extends StatelessWidget {
  const UserCard({super.key, required this.user, this.onTap});

  final User user;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundImage: NetworkImage(user.avatarUrl),
        ),
        title: Text(user.name, style: theme.textTheme.titleMedium),
        subtitle: Text(user.email),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
```

### Responsive Layout

```dart
class ResponsiveLayout extends StatelessWidget {
  const ResponsiveLayout({
    super.key,
    required this.mobile,
    required this.tablet,
    this.desktop,
  });

  final Widget mobile;
  final Widget tablet;
  final Widget? desktop;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= 1200) return desktop ?? tablet;
        if (constraints.maxWidth >= 600) return tablet;
        return mobile;
      },
    );
  }
}
```

### Sliver-Based Scrolling

```dart
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, required this.coverUrl, required this.posts});
  final String coverUrl;
  final List<Post> posts;

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 200,
          pinned: true,
          flexibleSpace: FlexibleSpaceBar(
            title: const Text('Profile'),
            background: Image.network(coverUrl, fit: BoxFit.cover),
          ),
        ),
        SliverToBoxAdapter(child: ProfileHeader()),
        SliverList.builder(
          itemCount: posts.length,
          itemBuilder: (context, index) => PostCard(post: posts[index]),
        ),
      ],
    );
  }
}
```

## State Management (Riverpod)

### Providers

```dart
import 'package:riverpod_annotation/riverpod_annotation.dart';
part 'user_provider.g.dart';

// Simple provider — computed value
@riverpod
String greeting(Ref ref) {
  final user = ref.watch(currentUserProvider);
  return 'Hello, ${user?.name ?? 'Guest'}!';
}

// Future provider — async data fetching
@riverpod
Future<List<Post>> userPosts(Ref ref) async {
  final repo = ref.watch(postRepositoryProvider);
  final user = ref.watch(currentUserProvider);
  if (user == null) return [];
  return repo.getPostsByUser(user.id);
}

// Notifier — mutable state with methods
@riverpod
class CartNotifier extends _$CartNotifier {
  @override
  List<CartItem> build() => [];

  void addItem(Product product) {
    final existing = state.indexWhere((item) => item.productId == product.id);
    if (existing >= 0) {
      state = [
        for (int i = 0; i < state.length; i++)
          if (i == existing)
            state[i].copyWith(quantity: state[i].quantity + 1)
          else
            state[i],
      ];
    } else {
      state = [...state, CartItem(productId: product.id, name: product.name, price: product.price, quantity: 1)];
    }
  }

  void removeItem(String productId) {
    state = state.where((item) => item.productId != productId).toList();
  }

  double get total => state.fold(0, (sum, item) => sum + item.price * item.quantity);
}
```

### AsyncValue Handling

```dart
class PostsScreen extends ConsumerWidget {
  const PostsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postsAsync = ref.watch(userPostsProvider);

    return postsAsync.when(
      data: (posts) => ListView.builder(
        itemCount: posts.length,
        itemBuilder: (context, index) => PostCard(post: posts[index]),
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Error: $error'),
            ElevatedButton(
              onPressed: () => ref.invalidate(userPostsProvider),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
```

## Navigation (GoRouter)

### Router Configuration

```dart
import 'package:go_router/go_router.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isLoggedIn = authState.valueOrNull != null;
      final isLoginRoute = state.matchedLocation == '/login';

      if (!isLoggedIn && !isLoginRoute) return '/login';
      if (isLoggedIn && isLoginRoute) return '/';
      return null;
    },
    routes: [
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
          GoRoute(
            path: '/users/:id',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return UserDetailScreen(userId: id);
            },
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
        ],
      ),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    ],
  );
});
```

### Deep Linking

```dart
// android/app/src/main/AndroidManifest.xml
// <intent-filter autoVerify="true">
//   <action android:name="android.intent.action.VIEW" />
//   <category android:name="android.intent.category.DEFAULT" />
//   <category android:name="android.intent.category.BROWSABLE" />
//   <data android:scheme="https" android:host="myapp.com" />
// </intent-filter>

// Navigate programmatically
context.go('/users/123');       // Replace current route
context.push('/users/123');     // Push onto stack
context.pop();                  // Go back
```

## Networking (Dio)

### Dio Client with Interceptors

```dart
import 'package:dio/dio.dart';

class ApiClient {
  late final Dio _dio;

  ApiClient({required String baseUrl, required TokenStorage tokenStorage}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json'},
    ))
      ..interceptors.addAll([
        InterceptorsWrapper(
          onRequest: (options, handler) async {
            final token = await tokenStorage.getAccessToken();
            if (token != null) {
              options.headers['Authorization'] = 'Bearer $token';
            }
            handler.next(options);
          },
          onError: (error, handler) async {
            if (error.response?.statusCode == 401) {
              final refreshed = await tokenStorage.refreshToken();
              if (refreshed) {
                final retryResponse = await _dio.fetch(error.requestOptions);
                return handler.resolve(retryResponse);
              }
            }
            handler.next(error);
          },
        ),
        LogInterceptor(requestBody: true, responseBody: true),
      ]);
  }

  Future<T> get<T>(String path, {Map<String, dynamic>? queryParams, required T Function(dynamic) fromJson}) async {
    final response = await _dio.get(path, queryParameters: queryParams);
    return fromJson(response.data);
  }

  Future<T> post<T>(String path, {dynamic data, required T Function(dynamic) fromJson}) async {
    final response = await _dio.post(path, data: data);
    return fromJson(response.data);
  }
}
```

### Freezed Models + Sealed Result

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:json_annotation/json_annotation.dart';
part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String name,
    required String email,
    @Default('') String avatarUrl,
    @Default(false) bool isVerified,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

// Sealed result type for error handling
sealed class Result<T> {
  const Result();
}
class Success<T> extends Result<T> {
  const Success(this.data);
  final T data;
}
class Failure<T> extends Result<T> {
  const Failure(this.message, [this.exception]);
  final String message;
  final Object? exception;
}

// Repository usage
class UserRepository {
  UserRepository(this._api);
  final ApiClient _api;

  Future<Result<User>> getUser(String id) async {
    try {
      final user = await _api.get('/users/$id', fromJson: User.fromJson);
      return Success(user);
    } on DioException catch (e) {
      return Failure(e.message ?? 'Network error', e);
    }
  }
}
```

## Theming (Material 3)

```dart
import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData light() => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6750A4), brightness: Brightness.light),
    appBarTheme: const AppBarTheme(centerTitle: true, elevation: 0),
    cardTheme: CardTheme(elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
  );

  static ThemeData dark() => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6750A4), brightness: Brightness.dark),
  );
}
```

## Testing

### Widget Test

```dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('UserCard displays name and email', (tester) async {
    final user = User(id: '1', name: 'Alice', email: 'alice@test.com');

    await tester.pumpWidget(
      MaterialApp(home: Scaffold(body: UserCard(user: user))),
    );

    expect(find.text('Alice'), findsOneWidget);
    expect(find.text('alice@test.com'), findsOneWidget);
  });

  testWidgets('UserCard calls onTap when pressed', (tester) async {
    var tapped = false;
    final user = User(id: '1', name: 'Alice', email: 'alice@test.com');

    await tester.pumpWidget(
      MaterialApp(home: Scaffold(body: UserCard(user: user, onTap: () => tapped = true))),
    );

    await tester.tap(find.byType(UserCard));
    expect(tapped, isTrue);
  });
}
```

### Riverpod Provider Test

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockPostRepository extends Mock implements PostRepository {}

void main() {
  late MockPostRepository mockRepo;

  setUp(() {
    mockRepo = MockPostRepository();
  });

  test('userPosts returns posts from repository', () async {
    when(() => mockRepo.getPostsByUser('1')).thenAnswer(
      (_) async => [Post(id: '1', title: 'Test Post', userId: '1')],
    );

    final container = ProviderContainer(overrides: [
      postRepositoryProvider.overrideWithValue(mockRepo),
      currentUserProvider.overrideWith((_) => User(id: '1', name: 'Alice', email: 'a@b.com')),
    ]);

    final posts = await container.read(userPostsProvider.future);
    expect(posts, hasLength(1));
    expect(posts.first.title, equals('Test Post'));
  });
}
```

## Checklist

```
Before releasing a Flutter app:
- [ ] Widgets use const constructors where possible
- [ ] State management uses Riverpod with code generation
- [ ] AsyncValue.when() handles data, loading, and error states
- [ ] GoRouter configured with redirect guards for auth
- [ ] Dio client has auth interceptor and retry logic
- [ ] Models use freezed for immutability and JSON serialization
- [ ] Error handling uses sealed Result type (not bare exceptions)
- [ ] Material 3 theme with light/dark mode support
- [ ] Widget tests cover key interactions
- [ ] Integration tests cover critical user flows
- [ ] No hardcoded strings (use l10n / intl for localization)
```
