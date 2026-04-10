# tinystruct @Action Routing Reference

## When to Use

Use the `@Action` annotation in your applications to define routes for both CLI commands and HTTP endpoints. It is appropriate whenever you need to map logic to a specific path, handle parameterized requests (e.g., retrieving a resource by ID), or restrict execution to specific HTTP methods (GET, POST, etc.) while maintaining a consistent command structure across environments.

## How It Works

The `ActionRegistry` parses `@Action` annotations to build a routing table. For parameterized methods, the framework automatically maps Java parameter types (int, String, etc.) to corresponding regex segments to generate an internal matching pattern. For instance, `getUser(int id)` generates a regex targeting digits, while `search(String query)` targets generic path segments.

When a request is dispatched, the `ActionRegistry` automatically injects dependencies like `Request` and `Response` into the action method if they are specified as parameters, drawing them directly from the current request's `Context`. Execution is further filtered by the `Mode` value, allowing a single path to invoke different logic depending on whether the trigger was a terminal command or a specific type of HTTP request.

### Mode Values

| Mode | When it triggers |
|---|---|
| `DEFAULT` | Both CLI and HTTP (GET, POST, etc.) |
| `CLI` | CLI dispatcher only |
| `HTTP_GET` | HTTP GET only |
| `HTTP_POST` | HTTP POST only |
| `HTTP_PUT` | HTTP PUT only |
| `HTTP_DELETE` | HTTP DELETE only |
| `HTTP_PATCH` | HTTP PATCH only |

## Examples

### Basic Action Declaration
```java
@Action(
    value = "path/subpath",          // required: URI segment or CLI command
    description = "What it does",    // shown in --help output
    mode = Mode.HTTP_POST,           // default: Mode.DEFAULT (both CLI + HTTP)
    options = {},                    // CLI option flags
    example = "curl -X POST http://localhost:8080/path/subpath/42"
)
public String myAction(int id) { ... }
```

### Parameterized Paths (Regex Generation)
```java
@Action("user/{id}")
public String getUser(int id) { ... }
// → pattern: ^/?user/(-?\d+)$

@Action("search")
public String search(String query) { ... }
// → pattern: ^/?search/([^/]+)$
```

### Request and Response Injection
```java
@Action(value = "upload", mode = Mode.HTTP_POST)
public String upload(Request<?, ?> req, Response<?, ?> res) throws ApplicationException {
    // req.getParameter("file"), res.setHeader(...), etc.
    return "ok";
}
```
