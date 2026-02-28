---
name: react-native-patterns
description: React Native development patterns for cross-platform mobile apps including navigation, state management, native modules, and performance optimization.
origin: ECC
---

# React Native Development Patterns

Modern patterns for building performant, cross-platform mobile applications with React Native and the New Architecture.

## When to Use

- Building React Native screens and components
- Configuring navigation (stack, tab, drawer, deep linking)
- Integrating native modules or Turbo Modules
- Managing mobile-specific state (offline, background, permissions)
- Optimizing FlatList, images, animations, and bundle size
- Writing platform-specific code (iOS/Android divergence)
- Configuring Hermes engine and Metro bundler
- Testing mobile UI with React Native Testing Library or Detox
- Handling mobile-specific concerns (push notifications, biometrics, secure storage)

## How It Works

### Platform-Aware Development

React Native runs on fundamentally different platforms. Respect each platform's conventions:

```typescript
// Platform-specific entry points
// LoginScreen.ios.tsx  - iOS-specific implementation
// LoginScreen.android.tsx  - Android-specific implementation
// LoginScreen.tsx  - Shared fallback

import { Platform, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.select({
      ios: 44,
      android: 0,
    }),
  },
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
})
```

### Bridge Optimization

Minimize bridge traffic between JavaScript and native threads:

```typescript
// BAD: Excessive bridge calls in animation
const animateManually = () => {
  requestAnimationFrame(() => {
    setPosition(prev => prev + 1) // JS -> Native every frame
  })
}

// GOOD: Use native driver for animations
const fadeAnim = useRef(new Animated.Value(0)).current

Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // Runs entirely on native thread
}).start()
```

### Hermes Engine

Hermes is the default JavaScript engine. Leverage its strengths:

```typescript
// Hermes supports modern JS but verify feature availability
// Use Intl polyfills if needed for older Hermes versions

// Verify Hermes is active
const isHermes = () => !!global.HermesInternal

// Hermes optimizes for:
// - Faster startup via bytecode precompilation
// - Lower memory usage
// - Improved garbage collection

// metro.config.js - Hermes is enabled by default in RN 0.70+
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true, // Improves startup by deferring requires
      },
    }),
  },
}
```

## Examples

### Navigation Patterns

#### React Navigation Stack

```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'

// Define type-safe navigation params
type RootStackParamList = {
  Home: undefined
  Profile: { userId: string }
  Settings: undefined
  MarketDetail: { marketId: string; title: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerBackTitleVisible: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={({ route }) => ({
            title: `Profile`,
          })}
        />
        <Stack.Screen
          name="MarketDetail"
          component={MarketDetailScreen}
          options={({ route }) => ({
            title: route.params.title,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

#### Type-Safe Navigation Hook

```typescript
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'

// Typed navigation hook
export function useAppNavigation() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>()
}

// Typed route hook
export function useAppRoute<T extends keyof RootStackParamList>() {
  return useRoute<RouteProp<RootStackParamList, T>>()
}

// Usage in screen component
function MarketDetailScreen() {
  const navigation = useAppNavigation()
  const route = useAppRoute<'MarketDetail'>()

  const { marketId, title } = route.params // fully typed

  const handleGoToProfile = (userId: string) => {
    navigation.navigate('Profile', { userId }) // type-checked
  }

  return <View>{/* screen content */}</View>
}
```

#### Tab Navigation

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

type TabParamList = {
  HomeTab: undefined
  SearchTab: undefined
  PortfolioTab: undefined
  ProfileTab: undefined
}

const Tab = createBottomTabNavigator<TabParamList>()

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = TAB_ICONS[route.name]
          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="SearchTab" component={SearchStack} />
      <Tab.Screen name="PortfolioTab" component={PortfolioStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  )
}

const TAB_ICONS: Record<keyof TabParamList, string> = {
  HomeTab: 'home',
  SearchTab: 'search',
  PortfolioTab: 'pie-chart',
  ProfileTab: 'person',
}
```

#### Drawer Navigation

```typescript
import { createDrawerNavigator } from '@react-navigation/drawer'

const Drawer = createDrawerNavigator()

export function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerType: 'slide',
        drawerStyle: { width: 280 },
        swipeEdgeWidth: 50,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Main" component={MainTabs} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Help" component={HelpScreen} />
    </Drawer.Navigator>
  )
}
```

### State Management

#### Zustand for Mobile

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist non-sensitive fields
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Do NOT persist token here - use secure storage instead
      }),
    }
  )
)
```

#### React Query for Mobile Data Fetching

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import NetInfo from '@react-native-community/netinfo'
import { onlineManager, focusManager } from '@tanstack/react-query'
import { AppState, Platform } from 'react-native'

// Configure online status for React Query
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected)
  })
})

// Refetch on app focus (mobile-specific)
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener('change', (state) => {
    if (Platform.OS !== 'web') {
      handleFocus(state === 'active')
    }
  })

  return () => subscription.remove()
})

// Usage in components
export function useMarkets() {
  return useQuery({
    queryKey: ['markets'],
    queryFn: fetchMarkets,
    staleTime: 5 * 60 * 1000,      // Consider fresh for 5 minutes
    gcTime: 30 * 60 * 1000,         // Keep in cache for 30 minutes
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  })
}

export function useCreateMarket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMarket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets'] })
    },
  })
}
```

#### Redux Toolkit for Complex State

```typescript
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit'

interface MarketState {
  items: Market[]
  selectedId: string | null
  filters: MarketFilters
}

const initialState: MarketState = {
  items: [],
  selectedId: null,
  filters: { category: 'all', sortBy: 'volume' },
}

const marketSlice = createSlice({
  name: 'markets',
  initialState,
  reducers: {
    setMarkets: (state, action: PayloadAction<Market[]>) => {
      // RTK uses Immer internally - this is safe
      state.items = action.payload
    },
    selectMarket: (state, action: PayloadAction<string>) => {
      state.selectedId = action.payload
    },
    updateFilters: (state, action: PayloadAction<Partial<MarketFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
  },
})

export const { setMarkets, selectMarket, updateFilters } = marketSlice.actions

export const store = configureStore({
  reducer: {
    markets: marketSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
```

### Native Module Integration

#### Turbo Modules (New Architecture)

```typescript
// NativeSecureStorage.ts - Turbo Module spec
import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'

export interface Spec extends TurboModule {
  setItem(key: string, value: string): Promise<void>
  getItem(key: string): Promise<string | null>
  removeItem(key: string): Promise<void>
  getAllKeys(): Promise<string[]>
}

export default TurboModuleRegistry.getEnforcing<Spec>('SecureStorage')
```

#### Fabric Components (New Architecture)

```typescript
// NativeMapView.ts - Fabric component spec
import type { ViewProps } from 'react-native'
import type { HostComponent } from 'react-native'
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent'

interface NativeMapViewProps extends ViewProps {
  latitude: number
  longitude: number
  zoomLevel: number
  onRegionChange?: (event: { nativeEvent: Region }) => void
}

export default codegenNativeComponent<NativeMapViewProps>('MapView') as HostComponent<NativeMapViewProps>
```

#### Safe Native Module Wrapper

```typescript
import { NativeModules, Platform } from 'react-native'

interface BiometricModule {
  isAvailable(): Promise<boolean>
  authenticate(reason: string): Promise<boolean>
}

function getBiometricModule(): BiometricModule {
  const module = NativeModules.BiometricAuth

  if (!module) {
    return {
      isAvailable: async () => false,
      authenticate: async () => {
        throw new Error('Biometric authentication not available on this device')
      },
    }
  }

  return module as BiometricModule
}

export const BiometricAuth = getBiometricModule()

// Usage
export async function authenticateUser(): Promise<boolean> {
  try {
    const available = await BiometricAuth.isAvailable()
    if (!available) return false

    const reason = Platform.select({
      ios: 'Authenticate to access your account',
      android: 'Verify your identity',
    }) ?? 'Authenticate'

    return await BiometricAuth.authenticate(reason)
  } catch (error) {
    throw new Error(`Biometric authentication failed: ${(error as Error).message}`)
  }
}
```

### Performance Patterns

#### FlatList Optimization

```typescript
import { FlatList, View, Text } from 'react-native'
import { memo, useCallback } from 'react'

// Memoize list items to prevent unnecessary re-renders
const MarketItem = memo<{ market: Market; onPress: (id: string) => void }>(
  ({ market, onPress }) => (
    <Pressable onPress={() => onPress(market.id)}>
      <View style={styles.item}>
        <Text style={styles.title}>{market.title}</Text>
        <Text style={styles.volume}>{market.volume}</Text>
      </View>
    </Pressable>
  )
)

export function MarketList({ markets }: { markets: Market[] }) {
  // Stable key extractor
  const keyExtractor = useCallback((item: Market) => item.id, [])

  // Stable renderItem to prevent re-renders
  const handlePress = useCallback((id: string) => {
    // navigation logic
  }, [])

  const renderItem = useCallback(
    ({ item }: { item: Market }) => (
      <MarketItem market={item} onPress={handlePress} />
    ),
    [handlePress]
  )

  // Stable item layout for fixed-height items
  const getItemLayout = useCallback(
    (_data: Market[] | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  )

  return (
    <FlatList
      data={markets}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      // Performance props
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={5}
      initialNumToRender={10}
      // Pull-to-refresh
      refreshing={false}
      onRefresh={() => {}}
      // Infinite scroll
      onEndReached={() => {}}
      onEndReachedThreshold={0.5}
      // Separator
      ItemSeparatorComponent={Separator}
      // Empty state
      ListEmptyComponent={<EmptyState />}
    />
  )
}

const ITEM_HEIGHT = 80
```

#### Image Caching and Optimization

```typescript
import FastImage from 'react-native-fast-image'

// Use FastImage for aggressive caching
export function CachedAvatar({ uri, size = 48 }: { uri: string; size?: number }) {
  return (
    <FastImage
      style={{ width: size, height: size, borderRadius: size / 2 }}
      source={{
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable, // Never re-download
      }}
      resizeMode={FastImage.resizeMode.cover}
      defaultSource={require('../assets/placeholder-avatar.png')}
    />
  )
}

// Preload critical images
export function preloadImages(uris: string[]) {
  FastImage.preload(
    uris.map((uri) => ({
      uri,
      priority: FastImage.priority.high,
    }))
  )
}
```

#### Bundle Splitting with Lazy Screens

```typescript
import { lazy, Suspense } from 'react'
import { ActivityIndicator, View } from 'react-native'

// Lazy load heavy screens
const AnalyticsScreen = lazy(() => import('../screens/AnalyticsScreen'))
const ChartScreen = lazy(() => import('../screens/ChartScreen'))

function ScreenFallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  )
}

// Wrap lazy screens in navigation
function LazyAnalyticsScreen(props: AnalyticsScreenProps) {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <AnalyticsScreen {...props} />
    </Suspense>
  )
}
```

#### Reanimated for 60fps Animations

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'

export function AnimatedCard({ isExpanded }: { isExpanded: boolean }) {
  const progress = useSharedValue(0)

  React.useEffect(() => {
    progress.value = withSpring(isExpanded ? 1 : 0, {
      damping: 15,
      stiffness: 120,
    })
  }, [isExpanded, progress])

  const animatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      progress.value,
      [0, 1],
      [80, 240],
      Extrapolation.CLAMP
    ),
    opacity: interpolate(
      progress.value,
      [0, 0.5, 1],
      [0.8, 0.9, 1]
    ),
    borderRadius: interpolate(
      progress.value,
      [0, 1],
      [8, 16]
    ),
  }))

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      {/* Card content */}
    </Animated.View>
  )
}
```

### Platform-Specific Code

#### Platform.select and Platform.OS

```typescript
import { Platform, StatusBar, SafeAreaView } from 'react-native'

// Style differences
const styles = StyleSheet.create({
  header: {
    height: Platform.select({ ios: 88, android: 56 }),
    paddingTop: Platform.select({ ios: 44, android: StatusBar.currentHeight ?? 0 }),
  },
  input: {
    // Android TextInput has default padding
    paddingVertical: Platform.select({ ios: 12, android: 8 }),
  },
})

// Behavioral differences
function requestPermission() {
  if (Platform.OS === 'ios') {
    return requestIOSPermission()
  }
  return requestAndroidPermission()
}

// Version-specific code
if (Platform.OS === 'android' && Platform.Version >= 33) {
  // Android 13+ notification permission required
  requestNotificationPermission()
}
```

#### Platform-Specific Files

```
// File structure for platform divergence
components/
  Camera/
    Camera.tsx           # Shared logic and types
    Camera.ios.tsx       # iOS-specific implementation (AVFoundation)
    Camera.android.tsx   # Android-specific implementation (CameraX)
    CameraPermissions.ts # Shared permission handling
    index.ts             # Re-exports the platform-resolved component
```

```typescript
// index.ts - React Native auto-resolves .ios.tsx / .android.tsx
export { Camera } from './Camera'
export type { CameraProps } from './Camera'
```

### Testing

#### React Native Testing Library

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'

describe('MarketCard', () => {
  const mockMarket: Market = {
    id: '1',
    title: 'Test Market',
    volume: 1000,
    endDate: '2026-12-31',
  }

  it('renders market information', () => {
    render(<MarketCard market={mockMarket} onPress={jest.fn()} />)

    expect(screen.getByText('Test Market')).toBeTruthy()
    expect(screen.getByText('1000')).toBeTruthy()
  })

  it('calls onPress with market id when tapped', () => {
    const onPress = jest.fn()
    render(<MarketCard market={mockMarket} onPress={onPress} />)

    fireEvent.press(screen.getByText('Test Market'))

    expect(onPress).toHaveBeenCalledWith('1')
  })

  it('displays loading skeleton when data is undefined', () => {
    render(<MarketCard market={undefined} onPress={jest.fn()} />)

    expect(screen.getByTestId('market-card-skeleton')).toBeTruthy()
  })
})

describe('LoginScreen', () => {
  it('validates email format before submission', async () => {
    render(<LoginScreen />)

    const emailInput = screen.getByPlaceholderText('Email')
    const submitButton = screen.getByText('Sign In')

    fireEvent.changeText(emailInput, 'invalid-email')
    fireEvent.press(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeTruthy()
    })
  })

  it('navigates to home on successful login', async () => {
    const mockNavigate = jest.fn()
    jest.spyOn(Navigation, 'useNavigation').mockReturnValue({
      navigate: mockNavigate,
    })

    render(<LoginScreen />)

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'user@test.com')
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123')
    fireEvent.press(screen.getByText('Sign In'))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Home')
    })
  })
})
```

#### Detox E2E Testing

```typescript
// e2e/login.test.ts
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true })
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('should login with valid credentials', async () => {
    await element(by.id('email-input')).typeText('user@example.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('login-button')).tap()

    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000)
  })

  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('wrong@example.com')
    await element(by.id('password-input')).typeText('wrong')
    await element(by.id('login-button')).tap()

    await waitFor(element(by.text('Invalid email or password')))
      .toBeVisible()
      .withTimeout(3000)
  })

  it('should navigate through bottom tabs', async () => {
    // Login first
    await loginHelper('user@example.com', 'password123')

    await element(by.id('tab-search')).tap()
    await expect(element(by.id('search-screen'))).toBeVisible()

    await element(by.id('tab-portfolio')).tap()
    await expect(element(by.id('portfolio-screen'))).toBeVisible()

    await element(by.id('tab-profile')).tap()
    await expect(element(by.id('profile-screen'))).toBeVisible()
  })
})
```

### Common Pitfalls

#### Memory Leaks

```typescript
// BAD: Event listener not cleaned up
useEffect(() => {
  const subscription = AppState.addEventListener('change', handleAppState)
  // Missing cleanup!
}, [])

// GOOD: Always clean up subscriptions
useEffect(() => {
  const subscription = AppState.addEventListener('change', handleAppState)
  return () => subscription.remove()
}, [])

// BAD: Async operation after unmount
useEffect(() => {
  fetchData().then(setData) // May set state after unmount
}, [])

// GOOD: Cancel or ignore stale async results
useEffect(() => {
  let cancelled = false

  fetchData().then((result) => {
    if (!cancelled) {
      setData(result)
    }
  })

  return () => {
    cancelled = true
  }
}, [])
```

#### Excessive Re-renders

```typescript
// BAD: Inline object/function causes child re-render every time
function Parent() {
  return (
    <Child
      style={{ padding: 10 }}           // New object every render
      onPress={() => doSomething()}      // New function every render
    />
  )
}

// GOOD: Stable references
const childStyle = { padding: 10 }  // Defined outside or in useMemo

function Parent() {
  const handlePress = useCallback(() => {
    doSomething()
  }, [])

  return <Child style={childStyle} onPress={handlePress} />
}
```

#### Large Bundle Size

```typescript
// BAD: Import entire library
import _ from 'lodash'
const sorted = _.sortBy(items, 'name')

// GOOD: Import only what you need
import sortBy from 'lodash/sortBy'
const sorted = sortBy(items, 'name')

// BAD: Bundling large assets
import heavyJson from './massive-dataset.json'

// GOOD: Load dynamically or fetch from API
const loadDataset = async () => {
  const response = await fetch('/api/dataset')
  return response.json()
}

// Monitor bundle size
// npx react-native-bundle-visualizer
// Check for unexpectedly large dependencies
```

#### Keyboard Handling

```typescript
import { KeyboardAvoidingView, Platform } from 'react-native'

// BAD: Content hidden behind keyboard
function LoginForm() {
  return (
    <View>
      <TextInput placeholder="Email" />
      <TextInput placeholder="Password" />
      <Button title="Submit" />
    </View>
  )
}

// GOOD: KeyboardAvoidingView with platform-specific behavior
function LoginForm() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.select({ ios: 88, android: 0 })}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <TextInput placeholder="Email" />
        <TextInput placeholder="Password" />
        <Button title="Submit" />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
```

#### Safe Area Handling

```typescript
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'

// Wrap app root
export function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

// Use insets for custom layouts
function CustomHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets()

  return (
    <View style={{ paddingTop: insets.top, paddingHorizontal: 16 }}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  )
}
```

**Remember**: React Native bridges two worlds. Respect platform conventions, minimize bridge traffic, optimize list rendering, and always clean up subscriptions. Test on real devices -- simulators hide real-world performance issues.
