# tinystruct Architecture and Configuration

## When to Use

Choose **tinystruct** when you need a lightweight, high-performance Java framework that treats CLI and HTTP as equal citizens. It is ideal for building microservices, command-line utilities, and data-driven applications where a small footprint and zero-dependency JSON handling are required. Use it when you want to write logic once and expose it via both a terminal and a web server without modification.

## How It Works

### Core Architecture

The framework operates on a singleton `ActionRegistry` that maps URL patterns (or command strings) to `Action` objects. When a request arrives, the system resolves the path and invokes the corresponding method handle.

#### Key Abstractions

| Class/Interface | Role |
|---|---|
| `AbstractApplication` | Base class for all tinystruct applications. Extend this. |
| `@Action` annotation | Maps a method to a URI path (web) or command name (CLI). The single routing primitive. |
| `ActionRegistry` | Singleton that maps URL patterns to `Action` objects via regex. Never instantiate directly. |
| `Action` | Wraps a `MethodHandle` + regex pattern + priority + `Mode` for dispatch. |
| `Context` | Per-request state store. Access via `getContext()`. Holds CLI args and HTTP request/response. |
| `Dispatcher` | CLI entry point (`bin/dispatcher`). Reads `--import` to load applications. |
| `HttpServer` | Built-in Netty-based HTTP server. Start with `bin/dispatcher start --import org.tinystruct.system.HttpServer`. |

### Package Map

```
org.tinystruct/
├── AbstractApplication.java      ← extend this
├── Application.java              ← interface
├── ApplicationException.java     ← checked exception
├── ApplicationRuntimeException.java ← unchecked exception
├── application/
│   ├── Action.java               ← runtime action wrapper
│   ├── ActionRegistry.java       ← singleton route registry
│   └── Context.java              ← request context
├── system/
│   ├── annotation/Action.java    ← @Action annotation + Mode enum
│   ├── Dispatcher.java           ← CLI dispatcher
│   ├── HttpServer.java           ← built-in HTTP server
│   ├── EventDispatcher.java      ← event bus
│   └── Settings.java             ← reads application.properties
├── data/component/Builder.java   ← JSON serialization (use instead of Gson/Jackson)
└── http/                         ← Request, Response, Constants
```

### Template Behavior and Dispatch Flow

By default, the framework assumes a view template is required. If `templateRequired` is `true`, `toString()` looks for a `.view` file in `src/main/resources/themes/<ClassName>.view`. Use `getContext()` to manage state and `setVariable("name", value)` to pass data to templates, which use `[%name%]` for interpolation.

## Examples

### Minimal Application Initialization
```java
@Override
public void init() {
    this.setTemplateRequired(false); // Skip .view template lookup for data-only apps
}
```

### Action Definition and CLI Invocation
```java
@Action("hello")
public String hello() {
    return "Hello, tinystruct!";
}
```
**Execution via Dispatcher:**
```bash
bin/dispatcher hello
```

### Configuration Access
Located at `src/main/resources/application.properties`:
```java
String port = this.getConfiguration("server.port");
```
