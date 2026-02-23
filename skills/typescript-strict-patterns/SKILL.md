---
name: typescript-strict-patterns
description: TypeScript type system specialist covering generics, conditional types, mapped types, branded types, and declaration files. Use when working with advanced TypeScript type patterns, not for general coding style.
---

# TypeScript Strict Patterns

## When to Activate

- Writing or reviewing complex generic functions or classes
- Creating conditional types, mapped types, or template literal types
- Implementing branded/opaque types for domain safety
- Authoring `.d.ts` declaration files or module augmentation
- Enabling stricter `tsconfig.json` options on a project
- Encountering type errors related to index signatures, optional properties, or type narrowing

## Core Principles

1. Encode domain invariants in the type system, not in runtime checks alone
2. Prefer compile-time safety over runtime validation wherever possible
3. Make impossible states unrepresentable using discriminated unions
4. Use `satisfies` to validate shapes without widening types
5. Avoid `any`; use `unknown` and narrow explicitly

---

## Strict Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true
  }
}
```

| Flag | Effect |
|------|--------|
| `noUncheckedIndexedAccess` | Array/record access returns `T \| undefined` |
| `exactOptionalPropertyTypes` | Disallows setting optional props to `undefined` explicitly |
| `noPropertyAccessFromIndexSignature` | Forces bracket notation for index-signature keys |
| `verbatimModuleSyntax` | Requires `import type` for type-only imports |

```typescript
// noUncheckedIndexedAccess: array[i] is number | undefined
const arr = [1, 2, 3];
const first = arr[0];
if (first !== undefined) console.log(first.toFixed(2));

// exactOptionalPropertyTypes
interface Config { timeout?: number }
const bad: Config = { timeout: undefined }; // Error
const good: Config = {};                    // OK
```

---

## Generics

### Constrained Generics with `extends`

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}
```

### Default Type Parameters and Factory Pattern

```typescript
interface Repository<T, Id = string> {
  findById(id: Id): Promise<T | null>;
  save(entity: T): Promise<void>;
}

interface Constructor<T> {
  new (...args: unknown[]): T;
}

function createInstance<T>(ctor: Constructor<T>, ...args: unknown[]): T {
  return new ctor(...args);
}
```

### Builder Pattern with Generics

```typescript
class QueryBuilder<T extends Record<string, unknown>> {
  private filters: Partial<T> = {};

  where<K extends keyof T>(key: K, value: T[K]): this {
    this.filters[key] = value;
    return this;
  }

  build(): Partial<T> {
    return { ...this.filters };
  }
}

const query = new QueryBuilder<{ name: string; age: number }>()
  .where("name", "Alice") // value must be string
  .where("age", 30)       // value must be number
  .build();
```

---

## Conditional Types

### `infer` Keyword

```typescript
type Awaited<T> = T extends Promise<infer R> ? Awaited<R> : T;
type ElementOf<T> = T extends ReadonlyArray<infer E> ? E : never;
type ReturnType<T extends (...args: never[]) => unknown> =
  T extends (...args: never[]) => infer R ? R : never;
type FirstParam<T extends (...args: never[]) => unknown> =
  T extends (first: infer F, ...rest: never[]) => unknown ? F : never;
```

### Distributive Conditional Types

```typescript
// Distributes over union members automatically
type ToArray<T> = T extends unknown ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[]

// Prevent distribution by wrapping in a tuple
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;
type Result2 = ToArrayNonDist<string | number>; // (string | number)[]
```

### NonNullable, Extract, Exclude

```typescript
type MyNonNullable<T> = T extends null | undefined ? never : T;
type MyExtract<T, U> = T extends U ? T : never;
type MyExclude<T, U> = T extends U ? never : T;

type StringOrNumber = string | number | null | undefined;
type Defined    = NonNullable<StringOrNumber>;          // string | number
type OnlyString = Extract<StringOrNumber, string>;      // string
type NoNull     = Exclude<StringOrNumber, null | undefined>; // string | number
```

---

## Mapped Types

### Key Remapping with `as`

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person { name: string; age: number }
type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number }

type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};
type StringFields = PickByValue<Person, string>; // { name: string }
```

### DeepPartial and DeepReadonly

```typescript
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

type DeepReadonly<T> = T extends (infer E)[]
  ? ReadonlyArray<DeepReadonly<E>>
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;
```

### Template Literal Key Transformation

```typescript
type EventMap = { click: MouseEvent; keydown: KeyboardEvent; submit: SubmitEvent };

type OnHandlers = {
  [K in keyof EventMap as `on${Capitalize<string & K>}`]: (event: EventMap[K]) => void;
};
// { onClick: (e: MouseEvent) => void; onKeydown: ...; onSubmit: ... }
```

---

## Template Literal Types

### Event Name Types

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickHandler = EventName<"click">; // "onClick"

type WithHandlers<Events extends string> = {
  [E in Events as `on${Capitalize<E>}`]?: () => void;
};
```

### Route Parameter Extraction

```typescript
type ExtractRouteParams<Route extends string> =
  Route extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractRouteParams<`/${Rest}`>
    : Route extends `${string}:${infer Param}`
    ? Param
    : never;

type Params = ExtractRouteParams<"/users/:userId/posts/:postId">;
// "userId" | "postId"

function navigate<R extends string>(
  route: R,
  params: Record<ExtractRouteParams<R>, string>
): string {
  return route.replace(/:(\w+)/g, (_, key) => params[key as ExtractRouteParams<R>]);
}
```

### CSS Unit Types

```typescript
type CSSUnit = "px" | "rem" | "em" | "vh" | "vw" | "%";
type CSSValue = `${number}${CSSUnit}`;

function setWidth(value: CSSValue): void {
  document.body.style.width = value;
}
setWidth("100px"); // OK
// setWidth("100"); // Error: missing unit
```

---

## Type Guards and Narrowing

### Custom `is` and `asserts` Guards

```typescript
function isCat(animal: { kind: "cat" } | { kind: "dog" }): animal is { kind: "cat" } {
  return animal.kind === "cat";
}

function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
const numbers = [1, null, 2, undefined, 3].filter(isNotNull); // number[]

function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") throw new TypeError(`Expected string, got ${typeof value}`);
}

function assertDefined<T>(value: T | null | undefined, label = "value"): asserts value is T {
  if (value == null) throw new Error(`${label} must be defined`);
}
```

### Discriminated Unions with Exhaustive Check

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":    return Math.PI * shape.radius ** 2;
    case "rectangle": return shape.width * shape.height;
    case "triangle":  return (shape.base * shape.height) / 2;
    default: {
      const _exhaustive: never = shape; // compile error if a variant is missing
      throw new Error(`Unhandled shape: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
```

### `satisfies` Operator

```typescript
const palette = {
  red: [255, 0, 0],
  green: "#00ff00",
} satisfies Record<string, string | number[]>;

const red   = palette.red;   // number[]  (not widened)
const green = palette.green; // string    (not widened)
```

---

## Branded / Opaque Types

### Brand Helper and Validation at Construction

```typescript
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

type UserId  = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;
type Email   = Brand<string, "Email">;

function createUserId(raw: string): UserId {
  if (!raw.startsWith("usr_")) throw new Error(`Invalid UserId: ${raw}`);
  return raw as UserId;
}

function createEmail(raw: string): Email {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) throw new Error(`Invalid email: ${raw}`);
  return raw as Email;
}

function sendNotification(userId: UserId, email: Email): void { /* ... */ }

const uid   = createUserId("usr_abc123");
const email = createEmail("user@example.com");
sendNotification(uid, email); // OK
// sendNotification("usr_abc123", email); // Error: string is not UserId
// sendNotification(uid, uid);             // Error: UserId is not Email
```

---

## Utility Type Recipes

### StrictOmit

```typescript
// Unlike Omit, K must actually exist in T
type StrictOmit<T, K extends keyof T> = Omit<T, K>;

interface User { id: string; name: string; email: string }
type PublicUser = StrictOmit<User, "email">; // OK
// type Bad = StrictOmit<User, "missing">;   // Error
```

### RequireAtLeastOne

```typescript
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys];

interface SearchParams { name?: string; email?: string; phone?: string }
type ValidSearch = RequireAtLeastOne<SearchParams>;
// At least one of name, email, phone must be provided
```

### Prettify and DeepRequired

```typescript
// Flatten intersections for readable hover types
type Prettify<T> = { [K in keyof T]: T[K] } & {};

type A = { id: string };
type B = { name: string };
type PrettyAB = Prettify<A & B>; // { id: string; name: string }

// Remove all optional modifiers recursively
type DeepRequired<T> = T extends object
  ? { [K in keyof T]-?: DeepRequired<T[K]> }
  : T;

interface Options { timeout?: number; retry?: { count?: number; delay?: number } }
type FullOptions = DeepRequired<Options>;
// { timeout: number; retry: { count: number; delay: number } }
```

---

## Declaration Files and Module Augmentation

### Typing Untyped npm Packages

```typescript
// types/untyped-lib.d.ts
declare module "untyped-lib" {
  export interface Options { verbose?: boolean; timeout?: number }
  export function initialize(options?: Options): void;
  export function process(input: string): Promise<string>;
  export default class Client {
    constructor(options?: Options);
    send(data: unknown): Promise<void>;
  }
}
```

### Extending Global Interfaces

```typescript
// types/global.d.ts
interface Window {
  analytics: {
    track(event: string, properties?: Record<string, unknown>): void;
    identify(userId: string): void;
  };
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly DATABASE_URL: string;
    readonly API_KEY: string;
    readonly PORT?: string;
  }
}
```

### Module Augmentation for Express and Ambient Assets

```typescript
// types/express.d.ts
import "express";
declare module "express-serve-static-core" {
  interface Request {
    user?: { id: UserId; email: Email; roles: string[] };
    requestId: string;
  }
}

// types/assets.d.ts
declare module "*.svg" { const content: string; export default content; }
declare module "*.png" { const src: string; export default src; }
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
```

---

## Checklist

- [ ] `tsconfig.json` includes `strict: true` plus the four additional strict flags
- [ ] No `any` types; `unknown` used with explicit narrowing instead
- [ ] Generic functions constrained with `extends` where the type must satisfy a shape
- [ ] Array/record index access checked for `undefined` (noUncheckedIndexedAccess)
- [ ] Domain identifiers use branded types to prevent accidental argument swapping
- [ ] Branded type constructors validate input at construction time
- [ ] Discriminated unions have an exhaustive `never` check in every switch
- [ ] `satisfies` used instead of type assertions when the goal is shape validation
- [ ] Type-only imports use `import type` syntax (verbatimModuleSyntax)
- [ ] Untyped third-party packages have `.d.ts` files in a `types/` directory
- [ ] Module augmentation for express/global is inside a proper `declare module` block
- [ ] No `@ts-ignore`; use `@ts-expect-error` with an explanatory comment
- [ ] Conditional types with `infer` have been tested against edge cases (`never`, `unknown`)
- [ ] Recursive mapped types (DeepPartial, DeepReadonly) have a non-object base case
- [ ] Template literal types validated against all expected string inputs
