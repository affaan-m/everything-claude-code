---
name: react-native-patterns
description: React Native patterns — Expo, navigation, state management, list optimization, animations, native modules, testing, and build/release with TypeScript.
---

# React Native Development Patterns

Production-grade React Native patterns with TypeScript for cross-platform mobile apps.

## When to Activate

- Building React Native apps (Expo or bare CLI)
- Setting up navigation (stack, tab, drawer, deep linking)
- Managing state with Zustand, TanStack Query, or MMKV
- Optimizing list performance (FlatList, FlashList)
- Implementing animations (Reanimated, Gesture Handler)
- Integrating native modules or Turbo Modules
- Writing tests with React Native Testing Library or Detox
- Configuring builds with EAS Build or Fastlane

## Core Principles

1. **Expo first** — start with Expo unless you need unsupported native modules
2. **Platform-aware** — use `Platform.select` for platform-specific behavior
3. **Off the main thread** — heavy computation in worklets (Reanimated) or native modules
4. **Flat lists only** — never use `ScrollView` for dynamic lists, always `FlatList`/`FlashList`
5. **Type everything** — TypeScript for navigation params, API responses, and stores

## Project Structure (Expo Router)

```
app/
├── _layout.tsx              # Root layout (providers, fonts)
├── (tabs)/
│   ├── _layout.tsx          # Tab navigator
│   ├── index.tsx            # Home tab
│   ├── search.tsx           # Search tab
│   └── profile.tsx          # Profile tab
├── (auth)/
│   ├── _layout.tsx          # Auth stack
│   ├── login.tsx
│   └── register.tsx
├── [id].tsx                 # Dynamic route
└── +not-found.tsx           # 404 screen
src/
├── components/              # Shared components
├── hooks/                   # Custom hooks
├── stores/                  # Zustand stores
├── services/                # API clients
└── types/                   # TypeScript types
```

## Component Patterns

### Platform-Specific Components

```typescript
import { Platform, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ScreenContainer({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={Platform.select({ ios: "dark-content", android: "light-content" })} />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: { paddingTop: 0 },
      android: { paddingTop: StatusBar.currentHeight },
    }),
  },
});
```

### Pressable with Feedback

```typescript
import { Pressable, StyleSheet, Text } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  disabled?: boolean;
}

export function Button({ title, onPress, variant = "primary", disabled }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === "outline" && styles.outline,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      android_ripple={{ color: "rgba(0,0,0,0.1)" }}
    >
      <Text style={[styles.text, variant === "outline" && styles.outlineText]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: "#007AFF", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: "center" },
  outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#007AFF" },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
  text: { color: "#fff", fontSize: 16, fontWeight: "600" },
  outlineText: { color: "#007AFF" },
});
```

## Navigation (React Navigation)

### Typed Navigation

```typescript
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  ProductDetail: { productId: string };
  Settings: undefined;
};

type TabParamList = {
  Home: undefined;
  Search: { query?: string };
  Profile: undefined;
};

type ProductDetailProps = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

function ProductDetailScreen({ route }: ProductDetailProps) {
  const { productId } = route.params;
  // ...
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}
```

### Deep Linking

```typescript
const linking = {
  prefixes: ["myapp://", "https://myapp.com"],
  config: {
    screens: {
      Main: { screens: { Home: "", Search: "search", Profile: "profile" } },
      ProductDetail: "product/:productId",
      Settings: "settings",
    },
  },
};

<NavigationContainer linking={linking} fallback={<LoadingScreen />}>
  <AppNavigator />
</NavigationContainer>
```

## State Management

### Zustand Store with Persistence

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  total: () => number;
  clear: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return { items: state.items.map((i) =>
              i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i,
            )};
          }
          return { items: [...state.items, { productId: product.id, name: product.name, price: product.price, quantity }] };
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      clear: () => set({ items: [] }),
    }),
    { name: "cart-storage", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
```

### TanStack Query for API Data

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const resp = await fetch(`${API_URL}/products`);
      if (!resp.ok) throw new Error("Failed to fetch");
      return resp.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: CreateOrderInput) => {
      const resp = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (!resp.ok) throw new Error("Failed to create order");
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
```

## List Optimization

### FlashList (Recommended)

```typescript
import { FlashList } from "@shopify/flash-list";
import { useCallback } from "react";

export function ProductList({ products }: { products: Product[] }) {
  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductCard product={item} />,
    [],
  );

  const keyExtractor = useCallback((item: Product) => item.id, []);

  return (
    <FlashList
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={120}
      ListEmptyComponent={<EmptyState message="No products found" />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
    />
  );
}
```

### FlatList Optimization

```typescript
import { FlatList } from "react-native";
import { memo, useCallback } from "react";

const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  return (
    <View style={styles.card}>
      <Text>{product.name}</Text>
      <Text>${product.price}</Text>
    </View>
  );
});

export function OptimizedList({ products }: { products: Product[] }) {
  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductCard product={item} />,
    [],
  );

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={5}
      getItemLayout={(_, index) => ({ length: 120, offset: 120 * index, index })}
    />
  );
}
```

## Animations (Reanimated)

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export function SwipeableCard({ onDismiss }: { onDismiss: () => void }) {
  const translateX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > 150) {
        translateX.value = withTiming(Math.sign(event.translationX) * 500, {}, () => {
          onDismiss();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: interpolate(
      Math.abs(translateX.value), [0, 150], [1, 0.5], Extrapolation.CLAMP,
    ),
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* Card content */}
      </Animated.View>
    </GestureDetector>
  );
}
```

## Testing

### React Native Testing Library

```typescript
import { render, screen, fireEvent } from "@testing-library/react-native";
import { Button } from "./Button";

describe("Button", () => {
  it("calls onPress", () => {
    const onPress = jest.fn();
    render(<Button title="Submit" onPress={onPress} />);
    fireEvent.press(screen.getByText("Submit"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("disables interaction when disabled", () => {
    const onPress = jest.fn();
    render(<Button title="Submit" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText("Submit"));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

## Build & Release (EAS)

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "distribution": "internal",
      "ios": { "simulator": true },
      "env": { "API_URL": "http://localhost:3000" }
    },
    "preview": {
      "distribution": "internal",
      "env": { "API_URL": "https://staging.api.com" }
    },
    "production": {
      "env": { "API_URL": "https://api.com" }
    }
  }
}
```

### OTA Updates

```typescript
import * as Updates from "expo-updates";

async function checkForUpdates() {
  if (__DEV__) return;
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {
    console.error("Update check failed:", error);
  }
}
```

## React Native Checklist

Before shipping to stores:

- [ ] Navigation fully typed with param lists
- [ ] Deep linking configured and tested
- [ ] Lists use FlashList or optimized FlatList (never ScrollView for dynamic data)
- [ ] Images optimized and cached (expo-image or FastImage)
- [ ] Animations run on UI thread (Reanimated worklets)
- [ ] State persisted where needed (MMKV or AsyncStorage)
- [ ] API data managed with TanStack Query (caching, refetching)
- [ ] Error boundaries wrap navigation screens
- [ ] Loading and empty states for all data screens
- [ ] Platform-specific adjustments (SafeAreaView, StatusBar)
- [ ] Tests cover component rendering and user interactions
- [ ] EAS Build configured for dev, preview, and production
- [ ] OTA updates configured for fast patches
- [ ] App permissions requested just-in-time with explanations
