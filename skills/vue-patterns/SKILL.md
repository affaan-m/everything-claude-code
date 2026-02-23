---
name: vue-patterns
description: Vue 3 development patterns — Composition API, component design, composables, Pinia state management, Vue Router, TypeScript integration, performance, and testing with Vitest.
---

# Vue 3 Development Patterns

Production-grade Vue 3 patterns with Composition API, TypeScript, and modern tooling.

## When to Activate

- Building Vue 3 components with Composition API
- Designing composables for reusable logic
- Managing state with Pinia
- Setting up Vue Router with navigation guards
- Integrating TypeScript with Vue components
- Optimizing Vue app performance
- Writing tests with Vitest and Vue Test Utils

## Core Principles

1. **Composition API first** — use `<script setup>` for all new components
2. **Composables over mixins** — extract reusable logic into `use*` functions
3. **Type safety** — leverage TypeScript with `defineProps`, `defineEmits`, generics
4. **Reactive by default** — use `ref` for primitives, `reactive` for objects
5. **Single responsibility** — one component, one purpose

## Component Patterns

### Script Setup (Recommended)

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

interface Props {
  title: string;
  count?: number;
  variant?: "primary" | "secondary";
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  variant: "primary",
});

const emit = defineEmits<{
  update: [value: number];
  close: [];
}>();

const localCount = ref(props.count);

const doubled = computed(() => localCount.value * 2);

function increment() {
  localCount.value++;
  emit("update", localCount.value);
}

onMounted(() => {
  console.log("Component mounted:", props.title);
});
</script>

<template>
  <div :class="['card', `card--${variant}`]">
    <h2>{{ title }}</h2>
    <p>Count: {{ localCount }} (doubled: {{ doubled }})</p>
    <button @click="increment">Increment</button>
    <button @click="emit('close')">Close</button>
  </div>
</template>
```

### v-model on Components

```vue
<!-- Parent -->
<template>
  <SearchInput v-model="query" v-model:filter="activeFilter" />
</template>

<!-- SearchInput.vue -->
<script setup lang="ts">
const model = defineModel<string>({ required: true });
const filter = defineModel<string>("filter", { default: "all" });
</script>

<template>
  <div class="search">
    <input :value="model" @input="model = ($event.target as HTMLInputElement).value" placeholder="Search..." />
    <select :value="filter" @change="filter = ($event.target as HTMLSelectElement).value">
      <option value="all">All</option>
      <option value="active">Active</option>
    </select>
  </div>
</template>
```

### Slots and Provide/Inject

```vue
<!-- DataTable.vue -->
<script setup lang="ts" generic="T">
import { provide } from "vue";

interface Props {
  items: T[];
  loading?: boolean;
}

const props = defineProps<Props>();

provide("tableItems", props.items);
</script>

<template>
  <div class="data-table">
    <div v-if="loading" class="skeleton">
      <slot name="loading">Loading...</slot>
    </div>
    <div v-else-if="items.length === 0">
      <slot name="empty">No data available</slot>
    </div>
    <div v-else>
      <slot :items="items" :count="items.length" />
    </div>
  </div>
</template>

<!-- Usage -->
<template>
  <DataTable :items="users" :loading="isLoading">
    <template #default="{ items, count }">
      <p>{{ count }} users found</p>
      <UserRow v-for="user in items" :key="user.id" :user="user" />
    </template>
    <template #empty>
      <EmptyState message="No users found" />
    </template>
  </DataTable>
</template>
```

## Composables

### Data Fetching

```typescript
// composables/useFetch.ts
import { ref, watchEffect, type Ref } from "vue";

interface UseFetchReturn<T> {
  data: Ref<T | null>;
  error: Ref<Error | null>;
  loading: Ref<boolean>;
  refresh: () => Promise<void>;
}

export function useFetch<T>(url: string | Ref<string>): UseFetchReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>;
  const error = ref<Error | null>(null);
  const loading = ref(false);

  async function fetchData() {
    loading.value = true;
    error.value = null;
    try {
      const resolvedUrl = typeof url === "string" ? url : url.value;
      const resp = await fetch(resolvedUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      data.value = await resp.json();
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }

  watchEffect(() => { fetchData(); });

  return { data, error, loading, refresh: fetchData };
}

// Usage in component
const { data: users, loading, error } = useFetch<User[]>("/api/users");
```

### Local Storage

```typescript
// composables/useLocalStorage.ts
import { ref, watch, type Ref } from "vue";

export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const stored = localStorage.getItem(key);
  const data = ref<T>(stored ? JSON.parse(stored) : defaultValue) as Ref<T>;

  watch(data, (value) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { deep: true });

  return data;
}

// Usage
const theme = useLocalStorage<"light" | "dark">("theme", "light");
```

### Debounced Ref

```typescript
// composables/useDebouncedRef.ts
import { ref, watch, type Ref } from "vue";

export function useDebouncedRef<T>(value: T, delay: number = 300): { source: Ref<T>; debounced: Ref<T> } {
  const source = ref(value) as Ref<T>;
  const debounced = ref(value) as Ref<T>;
  let timeout: ReturnType<typeof setTimeout>;

  watch(source, (val) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => { debounced.value = val; }, delay);
  });

  return { source, debounced };
}

// Usage
const { source: searchQuery, debounced: debouncedQuery } = useDebouncedRef("", 500);
```

## Pinia State Management

### Setup Store (Recommended)

```typescript
// stores/auth.ts
import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === "admin");

  async function login(email: string, password: string) {
    const resp = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!resp.ok) throw new Error("Login failed");

    const data = await resp.json();
    user.value = data.user;
    token.value = data.token;
  }

  function logout() {
    user.value = null;
    token.value = null;
  }

  return { user, token, isAuthenticated, isAdmin, login, logout };
});

// Usage in component
const auth = useAuthStore();
await auth.login("alice@example.com", "password");
```

### Store with API Integration

```typescript
// stores/products.ts
import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useProductStore = defineStore("products", () => {
  const items = ref<Product[]>([]);
  const loading = ref(false);
  const filter = ref<string>("");

  const filtered = computed(() => {
    if (!filter.value) return items.value;
    const q = filter.value.toLowerCase();
    return items.value.filter((p) =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    );
  });

  async function fetchProducts() {
    loading.value = true;
    try {
      const resp = await fetch("/api/products");
      items.value = await resp.json();
    } finally {
      loading.value = false;
    }
  }

  return { items, loading, filter, filtered, fetchProducts };
});
```

## Vue Router

### Route Configuration

```typescript
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: () => import("@/views/Home.vue") },
    { path: "/login", component: () => import("@/views/Login.vue"), meta: { guest: true } },
    {
      path: "/dashboard",
      component: () => import("@/views/Dashboard.vue"),
      meta: { requiresAuth: true },
      children: [
        { path: "", component: () => import("@/views/DashboardHome.vue") },
        { path: "settings", component: () => import("@/views/Settings.vue") },
        { path: "admin", component: () => import("@/views/Admin.vue"), meta: { requiresRole: "admin" } },
      ],
    },
    { path: "/:pathMatch(.*)*", component: () => import("@/views/NotFound.vue") },
  ],
});

// Navigation guards
router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  if (to.meta.requiresRole && auth.user?.role !== to.meta.requiresRole) {
    return { path: "/dashboard" };
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return { path: "/dashboard" };
  }
});

export default router;
```

## TypeScript Integration

### Generic Components

```vue
<script setup lang="ts" generic="T extends { id: string | number }">
interface Props {
  items: T[];
  selected?: T;
}

const props = defineProps<Props>();
const emit = defineEmits<{ select: [item: T] }>();
</script>

<template>
  <ul>
    <li
      v-for="item in items"
      :key="item.id"
      :class="{ active: selected?.id === item.id }"
      @click="emit('select', item)"
    >
      <slot :item="item" />
    </li>
  </ul>
</template>
```

## Performance

### Lazy Components

```typescript
import { defineAsyncComponent } from "vue";

const HeavyChart = defineAsyncComponent({
  loader: () => import("./HeavyChart.vue"),
  loadingComponent: LoadingSpinner,
  delay: 200,
  timeout: 10000,
});
```

### v-memo and KeepAlive

```vue
<template>
  <!-- v-memo: skip re-render when deps haven't changed -->
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.updated]">
    <ExpensiveComponent :data="item" />
  </div>

  <!-- KeepAlive: cache component state across route changes -->
  <RouterView v-slot="{ Component }">
    <KeepAlive :max="5">
      <component :is="Component" />
    </KeepAlive>
  </RouterView>
</template>
```

### Virtual Scrolling

```vue
<script setup lang="ts">
import { useVirtualList } from "@vueuse/core";

const { list, containerProps, wrapperProps } = useVirtualList(items, {
  itemHeight: 60,
  overscan: 10,
});
</script>

<template>
  <div v-bind="containerProps" style="height: 400px; overflow: auto">
    <div v-bind="wrapperProps">
      <div v-for="{ data, index } in list" :key="index" style="height: 60px">
        {{ data.name }}
      </div>
    </div>
  </div>
</template>
```

## Testing

### Component Testing (Vitest + Vue Test Utils)

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Counter from "./Counter.vue";

describe("Counter", () => {
  it("renders with default count", () => {
    const wrapper = mount(Counter, { props: { title: "Test" } });
    expect(wrapper.text()).toContain("Count: 0");
  });

  it("increments on click", async () => {
    const wrapper = mount(Counter, { props: { title: "Test" } });
    await wrapper.find("button").trigger("click");
    expect(wrapper.text()).toContain("Count: 1");
  });

  it("emits update event", async () => {
    const wrapper = mount(Counter, { props: { title: "Test" } });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("update")).toEqual([[1]]);
  });
});
```

## Vue Checklist

Before shipping a Vue application:

- [ ] All components use `<script setup>` with TypeScript
- [ ] Props defined with `defineProps<T>()` and proper defaults
- [ ] Events defined with `defineEmits<T>()` for type safety
- [ ] Composables extracted for shared logic (`use*` pattern)
- [ ] Pinia stores use setup syntax (not options)
- [ ] Router guards protect authenticated and role-based routes
- [ ] Lazy loading for route components and heavy dependencies
- [ ] `v-memo` or `KeepAlive` used for expensive renders
- [ ] Virtual scrolling for lists with 100+ items
- [ ] Component tests cover props, events, and user interactions
- [ ] Store tests verify state mutations and computed properties
- [ ] Key attribute set on all `v-for` items
