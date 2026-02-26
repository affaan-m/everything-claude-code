---
name: react-native-patterns
description: React Native development patterns for cross-platform mobile apps including navigation, state management, native modules, and performance optimization.
origin: ECC
---

# React Native Development Patterns

Cross-platform mobile patterns for building performant React Native applications.

## When to Activate

- Building React Native screens and components
- Setting up navigation (React Navigation)
- Integrating native modules (Turbo Modules, Fabric)
- Optimizing mobile performance
- Testing mobile applications

## Core Principles

### Platform-Specific Code

```typescript
import { Platform, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
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

### File-Based Platform Splitting

```
Button.tsx           // shared logic
Button.ios.tsx       // iOS-specific rendering
Button.android.tsx   // Android-specific rendering
```

## Navigation Patterns

### Type-Safe Stack Navigation

```typescript
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

type RootStackParamList = {
  Home: undefined
  Profile: { userId: string }
  Settings: undefined
}

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>

const Stack = createNativeStackNavigator<RootStackParamList>()

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  )
}

function ProfileScreen({ route, navigation }: ProfileScreenProps) {
  const { userId } = route.params
  // Type-safe navigation
  navigation.navigate('Home')
}
```

### Tab Navigation

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

const Tab = createBottomTabNavigator<TabParamList>()

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Home: 'home',
            Search: 'search',
            Profile: 'person',
          }
          return <Icon name={icons[route.name]} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}
```

## State Management

### Zustand with Persistence

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clear: () => void
}

const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({ items: [...state.items, item] })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
```

### React Query for Mobile

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import NetInfo from '@react-native-community/netinfo'
import { onlineManager } from '@tanstack/react-query'
import { AppState } from 'react-native'
import { focusManager } from '@tanstack/react-query'

// Sync online status
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected)
  })
})

// Refetch on app focus
focusManager.setEventListener((setFocused) => {
  const subscription = AppState.addEventListener('change', (status) => {
    setFocused(status === 'active')
  })
  return () => subscription.remove()
})
```

## Performance Patterns

### FlatList Optimization

```typescript
import { memo, useCallback } from 'react'
import { FlatList } from 'react-native'

const ListItem = memo(function ListItem({ item }: { item: Item }) {
  return (
    <View style={styles.item}>
      <Text>{item.title}</Text>
    </View>
  )
})

function OptimizedList({ data }: { data: Item[] }) {
  const renderItem = useCallback(
    ({ item }: { item: Item }) => <ListItem item={item} />,
    [],
  )

  const keyExtractor = useCallback((item: Item) => item.id, [])

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  )

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={10}
    />
  )
}
```

### Native Driver Animations

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'

function AnimatedCard() {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const onPressIn = () => {
    scale.value = withSpring(0.95)
  }

  const onPressOut = () => {
    scale.value = withSpring(1)
  }

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Text>Tap me</Text>
      </Animated.View>
    </Pressable>
  )
}
```

### Image Caching

```typescript
import FastImage from 'react-native-fast-image'

function Avatar({ uri }: { uri: string }) {
  return (
    <FastImage
      style={styles.avatar}
      source={{
        uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      resizeMode={FastImage.resizeMode.cover}
    />
  )
}
```

## Testing

### React Native Testing Library

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native'

test('submits login form', async () => {
  const onLogin = jest.fn()
  const { getByPlaceholderText, getByText } = render(
    <LoginScreen onLogin={onLogin} />,
  )

  fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com')
  fireEvent.changeText(getByPlaceholderText('Password'), 'password123')
  fireEvent.press(getByText('Sign In'))

  await waitFor(() => {
    expect(onLogin).toHaveBeenCalledWith('user@example.com', 'password123')
  })
})
```

### Detox E2E

```typescript
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  it('logs in with valid credentials', async () => {
    await element(by.id('email-input')).typeText('user@example.com')
    await element(by.id('password-input')).typeText('password123')
    await element(by.id('login-button')).tap()
    await expect(element(by.id('home-screen'))).toBeVisible()
  })
})
```

## Common Pitfalls

| Pitfall | Fix |
|---------|-----|
| Memory leaks from subscriptions | Clean up in `useEffect` return |
| Inline functions in FlatList | Memoize with `useCallback` |
| Large bundle from full imports | Import specific modules |
| Keyboard covers input | Use `KeyboardAvoidingView` |
| Content behind notch | Use `SafeAreaView` |

**Remember**: Mobile apps have strict performance budgets. Profile with Flipper, keep the JS thread free, and use native driver for animations.
