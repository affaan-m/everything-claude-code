# tinystruct System and Usage Reference

## When to Use

Use the system and usage patterns described here when you need to handle stateful interactions across CLI and HTTP modes, manage user sessions in web applications, or implement loosely coupled communication between application modules using an event-driven architecture.

## How It Works

The framework's `Context` serves as the primary data store for request-specific state. In CLI mode, flags passed as `--key value` are automatically parsed and stored in the `Context` with the `--` prefix, allowing action methods to retrieve command parameters easily. For web applications, the system provides standard session management via the `Request` object, enabling the storage of user data across multiple HTTP requests.

The internal `EventDispatcher` facilitates an asynchronous event bus. By defining custom `Event` classes and registering handlers (typically within an application's `init()` method), you can trigger background tasks—such as sending emails or logging audit trails—without blocking the main execution path.

## Examples

### Context and CLI Arguments
```java
@Action("echo")
public String echo() {
    // CLI: bin/dispatcher echo --words "Hello World"
    Object words = getContext().getAttribute("--words");
    if (words != null) return words.toString();
    return "No words provided";
}
```

### Session Management (Web Mode)
```java
@Action(value = "login", mode = Mode.HTTP_POST)
public String login(Request request) {
    request.getSession().setAttribute("userId", "42");
    return "Logged in";
}

@Action("profile")
public String profile(Request request) {
    Object userId = request.getSession().getAttribute("userId");
    if (userId == null) return "Not logged in";
    return "User: " + userId;
}
```

### Event System
```java
// 1. Define an event
public class OrderCreatedEvent implements org.tinystruct.system.Event<Order> {
    private final Order order;
    public OrderCreatedEvent(Order order) { this.order = order; }

    @Override public String getName() { return "order_created"; }
    @Override public Order getPayload() { return order; }
}

// 2. Register a handler
EventDispatcher.getInstance().registerHandler(OrderCreatedEvent.class, event -> {
    CompletableFuture.runAsync(() -> sendConfirmationEmail(event.getPayload()));
});

// 3. Dispatch
EventDispatcher.getInstance().dispatch(new OrderCreatedEvent(newOrder));
```

### Running the Application
```bash
# CLI mode
bin/dispatcher hello
bin/dispatcher echo --words "Hello" --import com.example.HelloApp

# HTTP server (listens on :8080 by default)
bin/dispatcher start --import org.tinystruct.system.HttpServer

# Database utilities
bin/dispatcher generate --table users
bin/dispatcher sql-query "SELECT * FROM users"
```
