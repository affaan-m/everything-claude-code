---
name: flutter-patterns
description: Flutter development patterns for cross-platform apps including widget composition, state management, platform channels, and performance tuning.
origin: ECC
---

# Flutter Development Patterns

Cross-platform patterns for building performant Flutter applications.

## When to Activate

- Building Flutter widgets and screens
- Managing state (Riverpod, BLoC, Provider)
- Integrating native platform code
- Optimizing Flutter performance
- Testing Flutter applications

## Core Principles

### Widget Composition

Build complex UIs from small, focused widgets:

```dart
class UserCard extends StatelessWidget {
  final User user;
  const UserCard({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            UserAvatar(url: user.avatarUrl),
            const SizedBox(height: 8),
            Text(user.name, style: Theme.of(context).textTheme.titleMedium),
            Text(user.email, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}
```

### Immutable State with copyWith

```dart
@immutable
class AppState {
  final List<Todo> todos;
  final FilterType filter;
  final bool isLoading;

  const AppState({
    this.todos = const [],
    this.filter = FilterType.all,
    this.isLoading = false,
  });

  AppState copyWith({
    List<Todo>? todos,
    FilterType? filter,
    bool? isLoading,
  }) {
    return AppState(
      todos: todos ?? this.todos,
      filter: filter ?? this.filter,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}
```

## State Management

### Riverpod

```dart
// Provider definition
final userProvider = StateNotifierProvider<UserNotifier, AsyncValue<User>>((ref) {
  return UserNotifier(ref.read(apiClientProvider));
});

class UserNotifier extends StateNotifier<AsyncValue<User>> {
  final ApiClient _api;

  UserNotifier(this._api) : super(const AsyncValue.loading()) {
    _loadUser();
  }

  Future<void> _loadUser() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _api.getCurrentUser());
  }

  Future<void> updateName(String name) async {
    final current = state.valueOrNull;
    if (current == null) return;
    state = AsyncValue.data(current.copyWith(name: name));
    await _api.updateUser(current.id, name: name);
  }
}

// Widget consumption
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(userProvider);

    return userAsync.when(
      data: (user) => ProfileView(user: user),
      loading: () => const CircularProgressIndicator(),
      error: (error, stack) => ErrorView(message: error.toString()),
    );
  }
}
```

### BLoC Pattern

```dart
// Events
sealed class AuthEvent {}
class LoginRequested extends AuthEvent {
  final String email;
  final String password;
  LoginRequested({required this.email, required this.password});
}
class LogoutRequested extends AuthEvent {}

// States
sealed class AuthState {}
class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthAuthenticated extends AuthState {
  final User user;
  AuthAuthenticated(this.user);
}
class AuthError extends AuthState {
  final String message;
  AuthError(this.message);
}

// BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepo;

  AuthBloc(this._authRepo) : super(AuthInitial()) {
    on<LoginRequested>(_onLogin);
    on<LogoutRequested>(_onLogout);
  }

  Future<void> _onLogin(LoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final user = await _authRepo.login(event.email, event.password);
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }

  Future<void> _onLogout(LogoutRequested event, Emitter<AuthState> emit) async {
    await _authRepo.logout();
    emit(AuthInitial());
  }
}
```

## Navigation with GoRouter

```dart
final router = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final isLoggedIn = authNotifier.isLoggedIn;
    final isLoginRoute = state.matchedLocation == '/login';

    if (!isLoggedIn && !isLoginRoute) return '/login';
    if (isLoggedIn && isLoginRoute) return '/';
    return null;
  },
  routes: [
    ShellRoute(
      builder: (context, state, child) => ScaffoldWithNav(child: child),
      routes: [
        GoRoute(path: '/', builder: (_, __) => const HomeScreen()),
        GoRoute(
          path: '/orders',
          builder: (_, __) => const OrdersScreen(),
          routes: [
            GoRoute(
              path: ':id',
              builder: (_, state) => OrderDetailScreen(
                id: state.pathParameters['id']!,
              ),
            ),
          ],
        ),
      ],
    ),
    GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
  ],
);
```

## Platform Channels

```dart
class BatteryService {
  static const _channel = MethodChannel('com.example/battery');

  Future<int> getBatteryLevel() async {
    try {
      final level = await _channel.invokeMethod<int>('getBatteryLevel');
      return level ?? -1;
    } on PlatformException catch (e) {
      throw BatteryException('Failed to get battery level: ${e.message}');
    }
  }
}
```

## Performance Patterns

### Const Constructors

```dart
// Good: const prevents rebuild
const SizedBox(height: 16)
const Divider()
const Text('Static text')

// Widget with const constructor
class AppLogo extends StatelessWidget {
  const AppLogo({super.key});

  @override
  Widget build(BuildContext context) {
    return const FlutterLogo(size: 48);
  }
}
```

### RepaintBoundary

```dart
// Isolate expensive painting
RepaintBoundary(
  child: CustomPaint(
    painter: ChartPainter(data: chartData),
    size: const Size(300, 200),
  ),
)
```

### Lazy Loading with Pagination

```dart
class PaginatedListView extends StatefulWidget {
  const PaginatedListView({super.key});

  @override
  State<PaginatedListView> createState() => _PaginatedListViewState();
}

class _PaginatedListViewState extends State<PaginatedListView> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      context.read<ListBloc>().add(LoadNextPage());
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: _scrollController,
      itemCount: items.length,
      itemBuilder: (context, index) => ItemTile(item: items[index]),
    );
  }
}
```

## Testing

### Widget Tests

```dart
testWidgets('shows login form', (tester) async {
  await tester.pumpWidget(const MaterialApp(home: LoginScreen()));

  expect(find.byType(TextFormField), findsNWidgets(2));
  expect(find.text('Sign In'), findsOneWidget);

  await tester.enterText(find.byKey(const Key('email')), 'test@example.com');
  await tester.enterText(find.byKey(const Key('password')), 'password');
  await tester.tap(find.text('Sign In'));
  await tester.pumpAndSettle();
});
```

### Golden Tests

```dart
testWidgets('matches golden', (tester) async {
  await tester.pumpWidget(const MaterialApp(home: UserCard(user: testUser)));
  await expectLater(
    find.byType(UserCard),
    matchesGoldenFile('goldens/user_card.png'),
  );
});
```

### BLoC Testing

```dart
blocTest<AuthBloc, AuthState>(
  'emits [loading, authenticated] on successful login',
  build: () {
    when(() => authRepo.login(any(), any())).thenAnswer((_) async => testUser);
    return AuthBloc(authRepo);
  },
  act: (bloc) => bloc.add(LoginRequested(email: 'test@example.com', password: 'pass')),
  expect: () => [isA<AuthLoading>(), isA<AuthAuthenticated>()],
);
```

## Architecture: Feature-First Structure

```
lib/
  features/
    auth/
      data/
        auth_repository.dart
        auth_api.dart
      domain/
        user.dart
      presentation/
        login_screen.dart
        auth_bloc.dart
    orders/
      data/
      domain/
      presentation/
  core/
    theme/
    widgets/
    utils/
```

**Remember**: Flutter's declarative UI model works best with immutable state and composition. Keep widgets small, state predictable, and use `const` constructors everywhere possible.
