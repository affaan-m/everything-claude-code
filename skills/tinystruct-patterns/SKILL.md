---
name: tinystruct-patterns
description: Use when developing application modules or microservices with the tinystruct Java framework. Covers routing, context management, JSON handling with Builder, and CLI/HTTP dual-mode patterns.
origin: ECC
---

# tinystruct Development Patterns

Architecture and implementation patterns for building modules with the **tinystruct** Java framework – a lightweight system where CLI and HTTP are equal citizens.

## When to Use

- Creating new `Application` modules by extending `AbstractApplication`.
- Defining routes and command-line actions using `@Action`.
- Handling per-request state via `Context`.
- Performing JSON serialization using the native `Builder` component.
- Configuring database connections or system settings in `application.properties`.
- Generating or re-generating the standard `bin/dispatcher` entry point via `ApplicationManager.init()`.
- Debugging routing conflicts (Actions) or CLI argument parsing.

## How It Works

The tinystruct framework treats any method annotated with `@Action` as a routable endpoint for both terminal and web environments. Applications are created by extending `AbstractApplication`, which provides core lifecycle hooks like `init()` and access to the request `Context`. 

Routing is handled by the `ActionRegistry`, which automatically maps path segments to method arguments and injects dependencies. For data-only services, the native `Builder` component should be used for JSON serialization to maintain a zero-dependency footprint. The framework also includes a utility in `ApplicationManager` to bootstrap the project's execution environment by generating the `bin/dispatcher` script.

## Examples

### Basic Application (MyService)
```java
public class MyService extends AbstractApplication {
    @Override
    public void init() {
        this.setTemplateRequired(false); // Disable .view lookup for data/API apps
    }

    @Override public String version() { return "1.0.0"; }

    @Action("greet")
    public String greet() {
        return "Hello from tinystruct!";
    }
}
```

### Parameterized Routing (getUser)
```java
// Handles /api/user/123 (Web) or "bin/dispatcher api/user/123" (CLI)
@Action("api/user/(\\d+)")
public String getUser(int userId) {
    return "User ID: " + userId;
}
```

### HTTP Mode Disambiguation (login)
```java
@Action(value = "login", mode = Mode.HTTP_POST)
public boolean doLogin() {
    // Process login logic
    return true;
}
```

### Native JSON Data Handling (getData)
```java
@Action("api/data")
public Builder getData() throws ApplicationException {
    Builder builder = new Builder();
    builder.put("status", "success");
    Builder nested = new Builder();
    nested.put("id", 1);
    nested.put("name", "James");
    builder.put("data", nested);
    return builder;
}
```

## Configuration

Settings are managed in `src/main/resources/application.properties`.

```properties
# Database
driver=org.h2.Driver
database.url=jdbc:h2:~/mydb

# App specific
my.service.endpoint=https://api.example.com
```

## Testing Patterns

Use JUnit 5 to test actions by verifying they are registered in the `ActionRegistry`.

```java
@Test
void testActionRegistration() {
    Application app = new MyService();
    app.init();
    
    ActionRegistry registry = ActionRegistry.getInstance();
    assertNotNull(registry.get("greet"));
}
```

## Red Flags & Anti-patterns

| Symptom | Correct Pattern |
|---|---|
| Importing `com.google.gson` or `com.fasterxml.jackson` | Use `org.tinystruct.data.component.Builder`. |
| `FileNotFoundException` for `.view` files | Call `setTemplateRequired(false)` in `init()` for API-only apps. |
| Annotating `private` methods with `@Action` | Actions must be `public` to be registered by the framework. |
| Hardcoding `main(String[] args)` in apps | Use `bin/dispatcher` as the entry point for all modules. |
| Manual `ActionRegistry` registration | Prefer the `@Action` annotation for automatic discovery. |

## Technical Reference

Detailed guides are available in the `references/` directory:

- [Architecture & Config](references/architecture.md) — Abstractions, Package Map, Properties
- [Routing & @Action](references/routing.md) — Annotation details, Modes, Parameters
- [Data Handling](references/data-handling.md) — Using the native `Builder` for JSON
- [System & Usage](references/system-usage.md) — Context, Sessions, Events, CLI usage
- [Testing Patterns](references/testing.md) — JUnit 5 integration and ActionRegistry testing

## Reference Source Files (Internal)

- `src/main/java/org/tinystruct/AbstractApplication.java` — Core base class
- `src/main/java/org/tinystruct/system/annotation/Action.java` — Annotation & Modes
- `src/main/java/org/tinystruct/application/ActionRegistry.java` — Routing Engine
- `src/main/java/org/tinystruct/data/component/Builder.java` — JSON/Data Serializer
