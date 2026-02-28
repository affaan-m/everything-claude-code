---
name: flutter-patterns
description: Flutter development patterns for cross-platform apps including widget composition, state management, platform channels, and performance tuning.
origin: ECC
---

# Flutter Development Patterns

Modern patterns for building performant, cross-platform applications with Flutter and Dart.

## When to Use

- Building Flutter widgets and screens
- Composing widget trees (stateless, stateful, inherited)
- Managing state (Riverpod, BLoC, Provider)
- Configuring navigation (GoRouter, Navigator 2.0, deep linking)
- Communicating with native code (MethodChannel, EventChannel)
- Optimizing widget rebuilds, painting, and image loading
- Writing widget tests, golden tests, and integration tests
- Structuring Flutter projects (feature-first, clean architecture)
- Working with platform-specific UI (Cupertino, Material, adaptive)

## How It Works

### Widget Composition

Widgets are the fundamental building blocks. Compose small, focused widgets rather than building monoliths:

```dart
// BAD: One massive widget with deeply nested build method
class ProfileScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // 200 lines of nested widgets...
        ],
      ),
    );
  }
}

// GOOD: Compose from small, focused widgets
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const ProfileAppBar(),
      body: const SingleChildScrollView(
        child: Column(
          children: [
            ProfileHeader(),
            ProfileStats(),
            ProfileActions(),
            ProfileRecentActivity(),
          ],
        ),
      ),
    );
  }
}
```

### Immutable State

All state should be immutable. Use `copyWith` patterns instead of mutation:

```dart
// Define immutable state classes with copyWith
@immutable
class UserState {
  final String name;
  final String email;
  final bool isVerified;

  const UserState({
    required this.name,
    required this.email,
    this.isVerified = false,
  });

  UserState copyWith({
    String? name,
    String? email,
    bool? isVerified,
  }) {
    return UserState(
      name: name ?? this.name,
      email: email ?? this.email,
      isVerified: isVerified ?? this.isVerified,
    );
  }
}

// BAD: Mutating state
void updateUser(UserState user) {
  user.name = 'New Name'; // Compile error with final fields
}

// GOOD: Creating new state
UserState updateUser(UserState user, String newName) {
  return user.copyWith(name: newName);
}
```

### Declarative UI

Flutter is declarative. Describe what the UI should look like for a given state, not how to transform it:

```dart
// BAD: Imperative style - manually updating UI elements
void _updateLoginButton() {
  if (_isLoading) {
    _button.setEnabled(false);
    _button.setText('Loading...');
  } else {
    _button.setEnabled(true);
    _button.setText('Sign In');
  }
}

// GOOD: Declarative style - describe UI for each state
Widget build(BuildContext context) {
  return ElevatedButton(
    onPressed: isLoading ? null : _handleSignIn,
    child: isLoading
        ? const SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2),
          )
        : const Text('Sign In'),
  );
}
```

## Examples

### Widget Patterns

#### Stateless vs Stateful

```dart
// Use StatelessWidget when the widget has no mutable state
class MarketCard extends StatelessWidget {
  final Market market;
  final VoidCallback onTap;

  const MarketCard({
    super.key,
    required this.market,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(market.title, style: theme.textTheme.titleMedium),
              const SizedBox(height: 8),
              Text(
                'Volume: ${market.formattedVolume}',
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Use StatefulWidget only when local mutable state is required
class ExpandableSection extends StatefulWidget {
  final String title;
  final Widget child;

  const ExpandableSection({
    super.key,
    required this.title,
    required this.child,
  });

  @override
  State<ExpandableSection> createState() => _ExpandableSectionState();
}

class _ExpandableSectionState extends State<ExpandableSection>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  bool _isExpanded = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _toggle() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        GestureDetector(
          onTap: _toggle,
          child: Text(widget.title),
        ),
        SizeTransition(
          sizeFactor: _controller,
          child: widget.child,
        ),
      ],
    );
  }
}
```

#### InheritedWidget and Extensions

```dart
// InheritedWidget for efficient data propagation down the tree
class AppConfig extends InheritedWidget {
  final String apiBaseUrl;
  final String environment;
  final bool isDebug;

  const AppConfig({
    super.key,
    required this.apiBaseUrl,
    required this.environment,
    required this.isDebug,
    required super.child,
  });

  static AppConfig of(BuildContext context) {
    final result = context.dependOnInheritedWidgetOfExactType<AppConfig>();
    assert(result != null, 'No AppConfig found in context');
    return result!;
  }

  @override
  bool updateShouldNotify(AppConfig oldWidget) {
    return apiBaseUrl != oldWidget.apiBaseUrl ||
        environment != oldWidget.environment ||
        isDebug != oldWidget.isDebug;
  }
}

// Usage
final config = AppConfig.of(context);
final url = '${config.apiBaseUrl}/markets';
```

#### Composition Over Inheritance

```dart
// BAD: Widget inheritance hierarchy
class BaseCard extends StatelessWidget { ... }
class MarketCard extends BaseCard { ... }  // Tight coupling
class UserCard extends BaseCard { ... }     // Hard to diverge

// GOOD: Composition with slots
class AppCard extends StatelessWidget {
  final Widget? header;
  final Widget body;
  final Widget? footer;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry padding;

  const AppCard({
    super.key,
    this.header,
    required this.body,
    this.footer,
    this.onTap,
    this.padding = const EdgeInsets.all(16),
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: padding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (header != null) header!,
              body,
              if (footer != null) ...[
                const SizedBox(height: 12),
                footer!,
              ],
            ],
          ),
        ),
      ),
    );
  }
}

// Usage - flexible composition
AppCard(
  header: const Text('Market'),
  body: MarketDetails(market: market),
  footer: MarketActions(market: market),
  onTap: () => navigateToDetail(market),
)
```

### State Management

#### Riverpod

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Immutable state
@immutable
class MarketsState {
  final List<Market> markets;
  final bool isLoading;
  final String? error;

  const MarketsState({
    this.markets = const [],
    this.isLoading = false,
    this.error,
  });

  MarketsState copyWith({
    List<Market>? markets,
    bool? isLoading,
    String? error,
  }) {
    return MarketsState(
      markets: markets ?? this.markets,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Notifier manages state transitions
class MarketsNotifier extends StateNotifier<MarketsState> {
  final MarketRepository _repository;

  MarketsNotifier(this._repository) : super(const MarketsState());

  Future<void> loadMarkets() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final markets = await _repository.fetchAll();
      state = state.copyWith(markets: markets, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load markets: ${e.toString()}',
      );
    }
  }

  void filterByCategory(String category) {
    final filtered = state.markets
        .where((m) => m.category == category)
        .toList();
    state = state.copyWith(markets: filtered);
  }
}

// Provider definition
final marketRepositoryProvider = Provider<MarketRepository>((ref) {
  return MarketRepository(ref.watch(httpClientProvider));
});

final marketsProvider =
    StateNotifierProvider<MarketsNotifier, MarketsState>((ref) {
  return MarketsNotifier(ref.watch(marketRepositoryProvider));
});

// Usage in widget
class MarketsScreen extends ConsumerWidget {
  const MarketsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(marketsProvider);

    if (state.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.error != null) {
      return ErrorDisplay(
        message: state.error!,
        onRetry: () => ref.read(marketsProvider.notifier).loadMarkets(),
      );
    }

    return MarketList(markets: state.markets);
  }
}
```

#### BLoC Pattern

```dart
import 'package:flutter_bloc/flutter_bloc.dart';

// Events
sealed class AuthEvent {}
class LoginRequested extends AuthEvent {
  final String email;
  final String password;

  LoginRequested({required this.email, required this.password});
}
class LogoutRequested extends AuthEvent {}
class TokenRefreshRequested extends AuthEvent {}

// States
sealed class AuthState {}
class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthAuthenticated extends AuthState {
  final User user;
  AuthAuthenticated({required this.user});
}
class AuthError extends AuthState {
  final String message;
  AuthError({required this.message});
}

// BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepository;

  AuthBloc(this._authRepository) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
    on<TokenRefreshRequested>(_onTokenRefresh);
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    try {
      final user = await _authRepository.login(
        email: event.email,
        password: event.password,
      );
      emit(AuthAuthenticated(user: user));
    } catch (e) {
      emit(AuthError(message: 'Login failed: ${e.toString()}'));
    }
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await _authRepository.logout();
    emit(AuthInitial());
  }

  Future<void> _onTokenRefresh(
    TokenRefreshRequested event,
    Emitter<AuthState> emit,
  ) async {
    try {
      await _authRepository.refreshToken();
    } catch (e) {
      emit(AuthError(message: 'Session expired. Please login again.'));
    }
  }
}

// Usage in widget
class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthAuthenticated) {
          context.go('/home');
        }
        if (state is AuthError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.message)),
          );
        }
      },
      builder: (context, state) {
        return LoginForm(
          isLoading: state is AuthLoading,
          onSubmit: (email, password) {
            context.read<AuthBloc>().add(
              LoginRequested(email: email, password: password),
            );
          },
        );
      },
    );
  }
}
```

#### Provider Pattern

```dart
import 'package:provider/provider.dart';

class ThemeNotifier extends ChangeNotifier {
  ThemeMode _mode = ThemeMode.system;

  ThemeMode get mode => _mode;

  void setThemeMode(ThemeMode mode) {
    if (_mode != mode) {
      _mode = mode;
      notifyListeners();
    }
  }

  void toggleDarkMode() {
    _mode = _mode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    notifyListeners();
  }
}

// Setup
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => ThemeNotifier()),
    ChangeNotifierProvider(create: (_) => AuthNotifier()),
    ProxyProvider<AuthNotifier, MarketService>(
      update: (_, auth, __) => MarketService(auth.token),
    ),
  ],
  child: const MyApp(),
)

// Consume
final theme = context.watch<ThemeNotifier>();
final auth = context.read<AuthNotifier>();  // No rebuild on change
```

### Navigation

#### GoRouter

```dart
import 'package:go_router/go_router.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isLoggedIn = authState is AuthAuthenticated;
      final isLoginRoute = state.matchedLocation == '/login';

      if (!isLoggedIn && !isLoginRoute) return '/login';
      if (isLoggedIn && isLoginRoute) return '/';
      return null;
    },
    routes: [
      ShellRoute(
        builder: (context, state, child) => ScaffoldWithNavBar(child: child),
        routes: [
          GoRoute(
            path: '/',
            name: 'home',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/markets/:id',
            name: 'market-detail',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return MarketDetailScreen(marketId: id);
            },
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (context, state) => const ProfileScreen(),
            routes: [
              GoRoute(
                path: 'settings',
                name: 'settings',
                builder: (context, state) => const SettingsScreen(),
              ),
            ],
          ),
        ],
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
    ],
    errorBuilder: (context, state) => ErrorScreen(error: state.error),
  );
});

// Navigation usage
context.go('/markets/abc123');
context.goNamed('market-detail', pathParameters: {'id': 'abc123'});
context.push('/markets/abc123');  // Pushes onto stack
context.pop();
```

#### Deep Linking Configuration

```dart
// android/app/src/main/AndroidManifest.xml
// <intent-filter android:autoVerify="true">
//   <action android:name="android.intent.action.VIEW" />
//   <category android:name="android.intent.category.DEFAULT" />
//   <category android:name="android.intent.category.BROWSABLE" />
//   <data android:scheme="https" android:host="example.com" />
// </intent-filter>

// Handle deep links in GoRouter
GoRouter(
  routes: [
    GoRoute(
      path: '/markets/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        // Validate the deep link parameter
        if (!_isValidMarketId(id)) {
          return const NotFoundScreen();
        }
        return MarketDetailScreen(marketId: id);
      },
    ),
  ],
)
```

### Platform Channels

#### MethodChannel

```dart
import 'package:flutter/services.dart';

class NativeStorage {
  static const _channel = MethodChannel('com.example.app/secure_storage');

  static Future<void> setItem(String key, String value) async {
    try {
      await _channel.invokeMethod('setItem', {
        'key': key,
        'value': value,
      });
    } on PlatformException catch (e) {
      throw StorageException('Failed to store item: ${e.message}');
    }
  }

  static Future<String?> getItem(String key) async {
    try {
      final result = await _channel.invokeMethod<String>('getItem', {
        'key': key,
      });
      return result;
    } on PlatformException catch (e) {
      throw StorageException('Failed to retrieve item: ${e.message}');
    }
  }

  static Future<void> removeItem(String key) async {
    try {
      await _channel.invokeMethod('removeItem', {'key': key});
    } on PlatformException catch (e) {
      throw StorageException('Failed to remove item: ${e.message}');
    }
  }
}

class StorageException implements Exception {
  final String message;
  const StorageException(this.message);

  @override
  String toString() => 'StorageException: $message';
}
```

#### EventChannel for Streams

```dart
class LocationService {
  static const _eventChannel = EventChannel('com.example.app/location');
  static const _methodChannel = MethodChannel('com.example.app/location_control');

  Stream<LocationData> get locationStream {
    return _eventChannel.receiveBroadcastStream().map((event) {
      final data = Map<String, dynamic>.from(event as Map);
      return LocationData(
        latitude: data['latitude'] as double,
        longitude: data['longitude'] as double,
        accuracy: data['accuracy'] as double,
        timestamp: DateTime.fromMillisecondsSinceEpoch(data['timestamp'] as int),
      );
    }).handleError((error) {
      throw LocationException('Location stream error: $error');
    });
  }

  Future<void> startTracking() async {
    try {
      await _methodChannel.invokeMethod('startTracking');
    } on PlatformException catch (e) {
      throw LocationException('Failed to start tracking: ${e.message}');
    }
  }

  Future<void> stopTracking() async {
    try {
      await _methodChannel.invokeMethod('stopTracking');
    } on PlatformException catch (e) {
      throw LocationException('Failed to stop tracking: ${e.message}');
    }
  }
}

@immutable
class LocationData {
  final double latitude;
  final double longitude;
  final double accuracy;
  final DateTime timestamp;

  const LocationData({
    required this.latitude,
    required this.longitude,
    required this.accuracy,
    required this.timestamp,
  });
}
```

### Performance

#### Const Widgets

```dart
// BAD: Rebuilt every time parent rebuilds
class MyScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Static Title'),          // Rebuilt unnecessarily
        SizedBox(height: 16),          // Rebuilt unnecessarily
        Icon(Icons.star),              // Rebuilt unnecessarily
        DynamicContent(data: data),
      ],
    );
  }
}

// GOOD: Const widgets are cached and never rebuilt
class MyScreen extends StatelessWidget {
  const MyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Text('Static Title'),    // Cached, never rebuilt
        const SizedBox(height: 16),    // Cached, never rebuilt
        const Icon(Icons.star),        // Cached, never rebuilt
        DynamicContent(data: data),    // Only this rebuilds
      ],
    );
  }
}
```

#### RepaintBoundary

```dart
// Isolate expensive painting operations
class MarketChart extends StatelessWidget {
  final List<DataPoint> dataPoints;

  const MarketChart({super.key, required this.dataPoints});

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: CustomPaint(
        painter: ChartPainter(dataPoints: dataPoints),
        size: const Size(double.infinity, 200),
      ),
    );
  }
}

// Use RepaintBoundary for:
// - Complex CustomPaint widgets
// - Animated widgets that change frequently
// - Scrollable list items with heavy content
// - Any subtree that repaints independently
```

#### Lazy Loading and Pagination

```dart
class PaginatedMarketList extends StatefulWidget {
  const PaginatedMarketList({super.key});

  @override
  State<PaginatedMarketList> createState() => _PaginatedMarketListState();
}

class _PaginatedMarketListState extends State<PaginatedMarketList> {
  final ScrollController _scrollController = ScrollController();
  final List<Market> _markets = [];
  bool _isLoadingMore = false;
  bool _hasMore = true;
  int _page = 1;

  @override
  void initState() {
    super.initState();
    _loadMarkets();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      _loadMore();
    }
  }

  Future<void> _loadMarkets() async {
    final markets = await fetchMarkets(page: 1);
    setState(() {
      _markets.addAll(markets);
      _hasMore = markets.length == 20;
    });
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore || !_hasMore) return;

    setState(() => _isLoadingMore = true);
    _page++;

    try {
      final markets = await fetchMarkets(page: _page);
      setState(() {
        _markets.addAll(markets);
        _hasMore = markets.length == 20;
        _isLoadingMore = false;
      });
    } catch (e) {
      setState(() => _isLoadingMore = false);
      _page--;
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: _scrollController,
      itemCount: _markets.length + (_hasMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index >= _markets.length) {
          return const Center(child: CircularProgressIndicator());
        }
        return MarketCard(market: _markets[index], onTap: () {});
      },
    );
  }
}
```

#### Image Caching

```dart
import 'package:cached_network_image/cached_network_image.dart';

class UserAvatar extends StatelessWidget {
  final String imageUrl;
  final double size;

  const UserAvatar({
    super.key,
    required this.imageUrl,
    this.size = 48,
  });

  @override
  Widget build(BuildContext context) {
    return ClipOval(
      child: CachedNetworkImage(
        imageUrl: imageUrl,
        width: size,
        height: size,
        fit: BoxFit.cover,
        memCacheWidth: (size * MediaQuery.devicePixelRatioOf(context)).toInt(),
        placeholder: (context, url) => Container(
          width: size,
          height: size,
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          child: const Icon(Icons.person),
        ),
        errorWidget: (context, url, error) => Container(
          width: size,
          height: size,
          color: Theme.of(context).colorScheme.errorContainer,
          child: const Icon(Icons.error),
        ),
      ),
    );
  }
}
```

### Testing

#### Widget Tests

```dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('MarketCard', () {
    final market = Market(
      id: '1',
      title: 'Test Market',
      volume: 1000,
      category: 'crypto',
    );

    testWidgets('renders market title and volume', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: MarketCard(market: market, onTap: () {}),
          ),
        ),
      );

      expect(find.text('Test Market'), findsOneWidget);
      expect(find.text('Volume: 1,000'), findsOneWidget);
    });

    testWidgets('calls onTap when pressed', (tester) async {
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: MarketCard(
              market: market,
              onTap: () => tapped = true,
            ),
          ),
        ),
      );

      await tester.tap(find.byType(MarketCard));
      expect(tapped, isTrue);
    });

    testWidgets('shows loading skeleton when market is null', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: MarketCardSkeleton(),
          ),
        ),
      );

      expect(find.byType(MarketCardSkeleton), findsOneWidget);
    });
  });
}
```

#### Golden Tests

```dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('MarketCard Golden Tests', () {
    testWidgets('matches light theme snapshot', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.light(),
          home: Scaffold(
            body: Center(
              child: SizedBox(
                width: 300,
                child: MarketCard(
                  market: Market(
                    id: '1',
                    title: 'Bitcoin Price > 100k',
                    volume: 50000,
                    category: 'crypto',
                  ),
                  onTap: () {},
                ),
              ),
            ),
          ),
        ),
      );

      await expectLater(
        find.byType(MarketCard),
        matchesGoldenFile('goldens/market_card_light.png'),
      );
    });

    testWidgets('matches dark theme snapshot', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.dark(),
          home: Scaffold(
            body: Center(
              child: SizedBox(
                width: 300,
                child: MarketCard(
                  market: Market(
                    id: '1',
                    title: 'Bitcoin Price > 100k',
                    volume: 50000,
                    category: 'crypto',
                  ),
                  onTap: () {},
                ),
              ),
            ),
          ),
        ),
      );

      await expectLater(
        find.byType(MarketCard),
        matchesGoldenFile('goldens/market_card_dark.png'),
      );
    });
  });
}
```

#### Integration Tests

```dart
// integration_test/login_flow_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Login Flow', () {
    testWidgets('login with valid credentials navigates to home',
        (tester) async {
      await tester.pumpWidget(const MyApp());
      await tester.pumpAndSettle();

      // Enter credentials
      await tester.enterText(
        find.byKey(const Key('email-input')),
        'user@example.com',
      );
      await tester.enterText(
        find.byKey(const Key('password-input')),
        'password123',
      );

      // Submit form
      await tester.tap(find.byKey(const Key('login-button')));
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Verify navigation to home
      expect(find.byType(HomeScreen), findsOneWidget);
    });

    testWidgets('shows error for invalid credentials', (tester) async {
      await tester.pumpWidget(const MyApp());
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byKey(const Key('email-input')),
        'wrong@example.com',
      );
      await tester.enterText(
        find.byKey(const Key('password-input')),
        'wrong',
      );
      await tester.tap(find.byKey(const Key('login-button')));
      await tester.pumpAndSettle();

      expect(find.text('Invalid email or password'), findsOneWidget);
    });
  });
}
```

#### BLoC Testing

```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

class MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late MockAuthRepository repository;

  setUp(() {
    repository = MockAuthRepository();
  });

  group('AuthBloc', () {
    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthAuthenticated] on successful login',
      build: () {
        when(() => repository.login(
          email: any(named: 'email'),
          password: any(named: 'password'),
        )).thenAnswer((_) async => User(id: '1', name: 'Test'));

        return AuthBloc(repository);
      },
      act: (bloc) => bloc.add(
        LoginRequested(email: 'test@test.com', password: 'pass'),
      ),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthAuthenticated>(),
      ],
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthError] on failed login',
      build: () {
        when(() => repository.login(
          email: any(named: 'email'),
          password: any(named: 'password'),
        )).thenThrow(Exception('Invalid credentials'));

        return AuthBloc(repository);
      },
      act: (bloc) => bloc.add(
        LoginRequested(email: 'bad@test.com', password: 'wrong'),
      ),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthError>(),
      ],
    );
  });
}
```

### Architecture Patterns

#### Clean Architecture / Feature-First Structure

```
lib/
  core/
    error/
      exceptions.dart
      failures.dart
    network/
      api_client.dart
      interceptors.dart
    theme/
      app_theme.dart
      colors.dart
    utils/
      validators.dart
      formatters.dart
  features/
    auth/
      data/
        datasources/
          auth_remote_datasource.dart
          auth_local_datasource.dart
        models/
          user_model.dart
        repositories/
          auth_repository_impl.dart
      domain/
        entities/
          user.dart
        repositories/
          auth_repository.dart
        usecases/
          login_usecase.dart
          logout_usecase.dart
      presentation/
        bloc/
          auth_bloc.dart
          auth_event.dart
          auth_state.dart
        screens/
          login_screen.dart
        widgets/
          login_form.dart
    markets/
      data/
        datasources/
          markets_remote_datasource.dart
        models/
          market_model.dart
        repositories/
          market_repository_impl.dart
      domain/
        entities/
          market.dart
        repositories/
          market_repository.dart
        usecases/
          get_markets_usecase.dart
          search_markets_usecase.dart
      presentation/
        bloc/
          markets_bloc.dart
        screens/
          markets_screen.dart
          market_detail_screen.dart
        widgets/
          market_card.dart
          market_list.dart
  app.dart
  main.dart
```

#### Repository Pattern

```dart
// Domain layer - abstract contract
abstract class MarketRepository {
  Future<List<Market>> fetchAll({MarketFilters? filters});
  Future<Market> fetchById(String id);
  Future<void> create(CreateMarketDto dto);
  Future<void> update(String id, UpdateMarketDto dto);
  Future<void> delete(String id);
}

// Data layer - concrete implementation
class MarketRepositoryImpl implements MarketRepository {
  final ApiClient _apiClient;
  final MarketLocalDataSource _localDataSource;

  MarketRepositoryImpl(this._apiClient, this._localDataSource);

  @override
  Future<List<Market>> fetchAll({MarketFilters? filters}) async {
    try {
      final response = await _apiClient.get(
        '/markets',
        queryParameters: filters?.toQueryParams(),
      );

      final markets = (response.data as List)
          .map((json) => MarketModel.fromJson(json).toEntity())
          .toList();

      // Cache locally for offline access
      await _localDataSource.cacheMarkets(markets);

      return markets;
    } catch (e) {
      // Fall back to cached data if network fails
      final cached = await _localDataSource.getCachedMarkets();
      if (cached.isNotEmpty) return cached;
      throw NetworkException('Failed to fetch markets: $e');
    }
  }

  @override
  Future<Market> fetchById(String id) async {
    try {
      final response = await _apiClient.get('/markets/$id');
      return MarketModel.fromJson(response.data).toEntity();
    } catch (e) {
      throw NetworkException('Failed to fetch market $id: $e');
    }
  }

  @override
  Future<void> create(CreateMarketDto dto) async {
    try {
      await _apiClient.post('/markets', data: dto.toJson());
    } catch (e) {
      throw NetworkException('Failed to create market: $e');
    }
  }

  @override
  Future<void> update(String id, UpdateMarketDto dto) async {
    try {
      await _apiClient.put('/markets/$id', data: dto.toJson());
    } catch (e) {
      throw NetworkException('Failed to update market $id: $e');
    }
  }

  @override
  Future<void> delete(String id) async {
    try {
      await _apiClient.delete('/markets/$id');
    } catch (e) {
      throw NetworkException('Failed to delete market $id: $e');
    }
  }
}
```

**Remember**: Flutter's power lies in widget composition, immutable state, and declarative UI. Keep widgets small and focused, use `const` constructors aggressively, isolate rebuilds with `RepaintBoundary`, and test at every level -- unit, widget, golden, and integration.
