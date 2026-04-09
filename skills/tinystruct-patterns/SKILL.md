---
name: tinystruct-patterns
description: Use when developing application modules or microservices with the tinystruct Java framework. Covers routing, context management, JSON handling with Builder, and CLI/HTTP dual-mode patterns.
origin: ECC
---

# tinystruct Development Patterns

Architecture and implementation patterns for building modules with the **tinystruct** Java framework – a lightweight system where CLI and HTTP are equal citizens.

## When to Activate

- Creating new `Application` modules by extending `AbstractApplication`.
- Defining routes and command-line actions using `@Action`.
- Handling per-request state via `Context`.
- Performing JSON serialization using the native `Builder` component.
- Configuring database connections or system settings in `application.properties`.
- Debugging routing conflicts (Actions) or CLI argument parsing.

## Bootstrapping & CLI Generation

The framework can automatically generate its own CLI entry point (`bin/dispatcher`). This is typically done during the initial setup or when installing the first application.

### Generating `bin/dispatcher`
Call `ApplicationManager.init()` to generate the execution script in your project root.

```java
import org.tinystruct.system.ApplicationManager;
import org.tinystruct.ApplicationException;

public class Bootstrap {
    public static void main(String[] args) throws ApplicationException {
        // This generates bin/dispatcher (or bin/dispatcher.cmd on Windows)
        // if it doesn't already exist.
        ApplicationManager.init();
        System.out.println("CLI dispatcher generated in bin/");
    }
}
```

> [!TIP]
> If you need to re-generate the dispatcher script (e.g., after a framework version update), you can use `ApplicationManager.generateDispatcherCommand(ApplicationManager.VERSION, true)` to overwrite the existing script.

This utility ensures you have the standard entry point for running `@Action` methods from the terminal without manual script writing.

## Basic Application Structure

Every module starts by extending `AbstractApplication`.

```java
package com.example;

import org.tinystruct.AbstractApplication;
import org.tinystruct.system.annotation.Action;
import org.tinystruct.ApplicationException;

public class MyService extends AbstractApplication {

    @Override
    public void init() {
        // Run once during application registration
        this.setTemplateRequired(false); // Disable .view lookup for data/API apps
    }

    @Override 
    public String version() { return "1.0.0"; }

    @Action("greet")
    public String greet() {
        return "Hello from tinystruct!";
    }
}
```

## Routing Patterns (@Action)

The `@Action` annotation is the primary way to expose logic to both the web and CLI.

### Path Parameters
The framework automatically maps path segments to method arguments.

```java
// Handles /api/user/123 (Web) or "bin/dispatcher api/user/123" (CLI)
@Action("api/user/(\\d+)")
public String getUser(int userId) {
    return "User ID: " + userId;
}
```

### HTTP Mode Specification
Distinguish between GET and POST logic for the same path.

```java
import org.tinystruct.system.annotation.Mode;

@Action(value = "login", mode = Mode.HTTP_POST)
public boolean doLogin() {
    // Process login
    return true;
}
```

## Context Management

The `Context` object holds request-specific data for both CLI and HTTP modes.

```java
@Action("process")
public String process() {
    // Get CLI arguments (--key value)
    Object cliArg = getContext().getAttribute("--key");
    
    // Get HTTP Request (if in HTTP mode)
    // Object request = getContext().getAttribute("HTTP_REQUEST");
    
    return "Processed with " + cliArg;
}
```

## Data Handling (JSON)

**Never use Gson or Jackson.** Use the native `org.tinystruct.data.component.Builder` for JSON serialization to maintain framework compatibility.

```java
import org.tinystruct.data.component.Builder;

@Action("api/data")
public Builder getData() throws ApplicationException {
    Builder builder = new Builder();
    builder.put("status", "success");
    builder.put("code", 200);
    
    Builder user = new Builder();
    user.put("id", 1);
    user.put("name", "James");
    
    builder.put("data", user);
    return builder;
}
```

## Configuration

Settings are managed in `src/main/resources/application.properties`.

```properties
# Database
driver=org.h2.Driver
database.url=jdbc:h2:~/mydb
database.user=sa
database.password=

# App specific
my.service.endpoint=https://api.example.com
```

Accessing config in code:
```java
String endpoint = this.getConfiguration("my.service.endpoint");
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
