---
name: angular-patterns
description: Angular 17+ development patterns — standalone components, signals, dependency injection, routing, reactive forms, RxJS, state management, performance, and testing.
---

# Angular Development Patterns

Production-grade Angular 17+ patterns with standalone components, signals, and modern tooling.

## When to Activate

- Building Angular 17+ apps with standalone components
- Working with Angular signals and reactive state
- Configuring dependency injection with `inject()` and `InjectionToken`
- Setting up lazy-loaded routing with functional guards
- Building reactive forms with typed `FormGroup`
- Using RxJS operators with Angular HTTP client
- Managing state with signal-based stores or NgRx SignalStore
- Optimizing performance with OnPush, `@defer`, NgOptimizedImage
- Writing tests with TestBed or Angular Testing Library

## Core Principles

1. **Standalone first** — no NgModules for new components, use `imports` array directly
2. **Signals over observables** — prefer signals for synchronous state, RxJS for async streams
3. **inject() over constructor DI** — use functional `inject()` in standalone components
4. **Typed forms** — use `FormGroup<T>` with typed controls for compile-time safety
5. **OnPush everything** — all components should use `ChangeDetectionStrategy.OnPush`

## Component Patterns

### Standalone Component (Recommended)

```typescript
import { Component, input, output, computed, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "app-user-card",
  standalone: true,
  imports: [DatePipe, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card" [class.active]="isActive()">
      <img [ngSrc]="user().avatar" width="48" height="48" />
      <h3>{{ user().name }}</h3>
      <p>Joined {{ user().createdAt | date:'mediumDate' }}</p>
      <button (click)="selected.emit(user().id)">Select</button>
    </div>
  `,
})
export class UserCardComponent {
  // Signal-based inputs (Angular 17+)
  user = input.required<User>();
  highlight = input(false);

  // Output
  selected = output<string>();

  // Computed signal
  isActive = computed(() => this.highlight() && this.user().role === "admin");
}
```

### Smart / Dumb Component Pattern

```typescript
// Smart (container) — handles data and side effects
@Component({
  selector: "app-user-list-page",
  standalone: true,
  imports: [UserListComponent, AsyncPipe],
  template: `
    <app-user-list
      [users]="users()"
      [loading]="loading()"
      (userSelected)="onSelect($event)"
    />
  `,
})
export class UserListPageComponent {
  private userService = inject(UserService);
  users = this.userService.users;
  loading = this.userService.loading;

  onSelect(id: string) {
    this.userService.selectUser(id);
  }
}

// Dumb (presentational) — pure inputs/outputs, no inject()
@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [UserCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <app-skeleton />
    } @else {
      @for (user of users(); track user.id) {
        <app-user-card [user]="user" (selected)="userSelected.emit($event)" />
      }
      @empty { <p>No users found.</p> }
    }
  `,
})
export class UserListComponent {
  users = input.required<User[]>();
  loading = input(false);
  userSelected = output<string>();
}
```

## Dependency Injection

### inject() + InjectionToken

```typescript
import { Injectable, InjectionToken, inject } from "@angular/core";

// Typed token for configuration
export const API_CONFIG = new InjectionToken<ApiConfig>("API_CONFIG");

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

// Provide in app config
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_CONFIG, useValue: { baseUrl: "/api", timeout: 10000 } },
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
  ],
};

// Consume with inject()
@Injectable({ providedIn: "root" })
export class ApiService {
  private http = inject(HttpClient);
  private config = inject(API_CONFIG);

  get<T>(path: string) {
    return this.http.get<T>(`${this.config.baseUrl}${path}`);
  }
}
```

### Functional HTTP Interceptor

```typescript
import { HttpInterceptorFn } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({ count: 2, delay: (err, retryCount) =>
      err.status >= 500 ? timer(retryCount * 1000) : EMPTY
    })
  );
};
```

## Routing

### Lazy-Loaded Routes with Functional Guards

```typescript
import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: "", loadComponent: () => import("./home/home.component").then(c => c.HomeComponent) },
  {
    path: "dashboard",
    canActivate: [() => inject(AuthService).isAuthenticated()],
    loadChildren: () => import("./dashboard/dashboard.routes").then(r => r.DASHBOARD_ROUTES),
  },
  {
    path: "admin",
    canActivate: [roleGuard("admin")],
    loadComponent: () => import("./admin/admin.component").then(c => c.AdminComponent),
    resolve: { stats: () => inject(StatsService).load() },
  },
  { path: "**", loadComponent: () => import("./not-found/not-found.component").then(c => c.NotFoundComponent) },
];

// Reusable functional guard factory
function roleGuard(requiredRole: string) {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    return auth.hasRole(requiredRole) || router.createUrlTree(["/unauthorized"]);
  };
}
```

## Reactive Forms

### Typed FormGroup

```typescript
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";

interface ProfileForm {
  name: FormControl<string>;
  email: FormControl<string>;
  age: FormControl<number | null>;
  address: FormGroup<{
    street: FormControl<string>;
    city: FormControl<string>;
  }>;
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="name" />
      @if (form.controls.name.hasError('required')) {
        <span class="error">Name is required</span>
      }
      <div formGroupName="address">
        <input formControlName="street" />
        <input formControlName="city" />
      </div>
      <button [disabled]="form.invalid">Save</button>
    </form>
  `,
})
export class ProfileFormComponent {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ["", [Validators.required, Validators.minLength(2)]],
    email: ["", [Validators.required, Validators.email]],
    age: [null as number | null, [Validators.min(0), Validators.max(150)]],
    address: this.fb.nonNullable.group({
      street: ["", Validators.required],
      city: ["", Validators.required],
    }),
  });

  onSubmit() {
    if (this.form.valid) {
      const value = this.form.getRawValue(); // fully typed
      this.saveProfile(value); // value is fully typed
    }
  }
}
```

### Custom Validator

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function matchFields(field1: string, field2: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value1 = control.get(field1)?.value;
    const value2 = control.get(field2)?.value;
    return value1 === value2 ? null : { fieldsMismatch: true };
  };
}

// Usage: this.fb.group({ password: [''], confirm: [''] }, { validators: matchFields('password', 'confirm') })
```

## RxJS Patterns

### takeUntilDestroyed + HTTP

```typescript
import { DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { switchMap, debounceTime, distinctUntilChanged } from "rxjs";

@Component({ /* ... */ })
export class SearchComponent {
  private destroyRef = inject(DestroyRef);
  private searchService = inject(SearchService);
  searchControl = new FormControl("");

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => this.searchService.search(query ?? "")),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(results => this.results.set(results));
  }
}
```

### HTTP Retry with Exponential Backoff

```typescript
getUsers(): Observable<User[]> {
  return this.http.get<User[]>("/api/users").pipe(
    retry({
      count: 3,
      delay: (error, retryCount) => {
        if (error.status === 404) return EMPTY; // don't retry 404
        return timer(Math.pow(2, retryCount) * 1000);
      },
    }),
    catchError(err => {
      console.error("Failed after retries", err);
      return of([]);
    }),
  );
}
```

## State Management

### Signal-Based Store

```typescript
import { Injectable, signal, computed } from "@angular/core";

interface TodoState {
  todos: Todo[];
  filter: "all" | "active" | "completed";
  loading: boolean;
}

@Injectable({ providedIn: "root" })
export class TodoStore {
  private state = signal<TodoState>({ todos: [], filter: "all", loading: false });

  // Selectors
  todos = computed(() => this.state().todos);
  filter = computed(() => this.state().filter);
  loading = computed(() => this.state().loading);
  filteredTodos = computed(() => {
    const f = this.filter();
    return this.todos().filter(t =>
      f === "all" ? true : f === "active" ? !t.done : t.done
    );
  });

  // Actions
  addTodo(title: string) {
    this.state.update(s => ({
      ...s,
      todos: [...s.todos, { id: crypto.randomUUID(), title, done: false }],
    }));
  }

  toggleTodo(id: string) {
    this.state.update(s => ({
      ...s,
      todos: s.todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  }

  setFilter(filter: TodoState["filter"]) {
    this.state.update(s => ({ ...s, filter }));
  }
}
```

### NgRx SignalStore

```typescript
import { signalStore, withState, withComputed, withMethods, patchState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";

export const UserStore = signalStore(
  { providedIn: "root" },
  withState({ users: [] as User[], loading: false, error: "" }),
  withComputed(({ users }) => ({
    activeUsers: computed(() => users().filter(u => u.active)),
    count: computed(() => users().length),
  })),
  withMethods((store, userApi = inject(UserApiService)) => ({
    loadUsers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() => userApi.getAll()),
        tap(users => patchState(store, { users, loading: false })),
      )
    ),
    removeUser(id: string) {
      patchState(store, { users: store.users().filter(u => u.id !== id) });
    },
  })),
);
```

## Performance

### @defer Blocks

```html
<!-- Load heavy component only when visible -->
@defer (on viewport) {
  <app-heavy-chart [data]="chartData()" />
} @placeholder {
  <div class="skeleton" style="height: 300px"></div>
} @loading (minimum 500ms) {
  <app-spinner />
}

<!-- Prefetch on hover, load on interaction -->
@defer (on interaction; prefetch on hover) {
  <app-comment-section [postId]="postId()" />
} @placeholder {
  <button>Show comments</button>
}
```

### Performance Checklist

```
✅ All components use ChangeDetectionStrategy.OnPush
✅ Heavy components wrapped in @defer (on viewport)
✅ Images use NgOptimizedImage with width/height
✅ Lists use @for with track expression (not trackBy function)
✅ Lazy-load all routes (loadComponent / loadChildren)
✅ Use pure pipes instead of method calls in templates
✅ Large datasets use virtual scrolling (cdk-virtual-scroll-viewport)
```

## Testing

### Component Test with TestBed

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClientTesting } from "@angular/common/http/testing";

describe("UserCardComponent", () => {
  let fixture: ComponentFixture<UserCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCardComponent],
      providers: [provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCardComponent);
    fixture.componentRef.setInput("user", { id: "1", name: "Alice", avatar: "/img/a.png", createdAt: new Date(), role: "admin" });
    fixture.detectChanges();
  });

  it("should display user name", () => {
    expect(fixture.nativeElement.querySelector("h3").textContent).toContain("Alice");
  });

  it("should emit selected on button click", () => {
    const spy = jest.spyOn(fixture.componentInstance.selected, "emit");
    fixture.nativeElement.querySelector("button").click();
    expect(spy).toHaveBeenCalledWith("1");
  });
});
```

## Checklist

```
Before submitting Angular code:
- [ ] All components are standalone (no NgModules for new components)
- [ ] Signal-based inputs/outputs used (not @Input/@Output decorators)
- [ ] ChangeDetectionStrategy.OnPush on all components
- [ ] inject() used instead of constructor injection
- [ ] Forms use typed FormGroup with nonNullable builder
- [ ] Routes are lazy-loaded with functional guards
- [ ] Subscriptions use takeUntilDestroyed
- [ ] Heavy components deferred with @defer blocks
- [ ] Images use NgOptimizedImage
- [ ] Tests cover component rendering and user interactions
```
