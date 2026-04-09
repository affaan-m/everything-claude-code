# tinystruct Data Handling (JSON)

## When to Use

Prefer `org.tinystruct.data.component.Builder` in scenarios where you need a lightweight, high-performance JSON solution with **zero external dependencies**. It is specifically designed to keep your tinystruct applications lean and fast, making it the ideal choice for microservices and CLI tools where including heavy libraries like Jackson or Gson would be overkill.

## How It Works

The `Builder` class provides a simple key-value interface for both creating and reading JSON structures. It integrates directly with `AbstractApplication` result handling; when an action method returns a `Builder` object, the framework automatically serializes it to the response stream. This prevents the need for manual string conversion and ensures consistent data formatting across your application modules.

## Examples

### Serialization
```java
import org.tinystruct.data.component.Builder;

// Create and populate
Builder response = new Builder();
response.put("status", "success");
response.put("count", 42);
response.put("data", someList);

return response; // {"status":"success","count":42,...}
```

### Parsing
```java
import org.tinystruct.data.component.Builder;

// Parse a JSON string
Builder parsed = new Builder();
parsed.parse(jsonString);

String status = parsed.get("status").toString();
```
