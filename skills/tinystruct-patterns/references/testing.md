# tinystruct Testing Patterns

## When to Use

Use the testing patterns described here when writing units tests for your tinystruct applications with **JUnit 5**. These patterns are essential for verifying that your `@Action` methods return the correct results and that your routing logic is properly registered within the singleton `ActionRegistry`.

## How It Works

Testing tinystruct applications requires a specific setup to ensure framework-level features like annotation processing and configuration management are active. By creating a new instance of your application and passing it a `Settings` object in the `setUp()` method, you trigger the `init()` lifecycle. This ensures all `@Action` methods are discovered and registered. 

Because the `ActionRegistry` is a singleton, it is critical to maintain isolation between tests by properly initializing your application state before each test execution, preventing side effects from leaking across the test suite.

## Examples

### Unit Testing an Application
```java
import org.junit.jupiter.api.*;
import org.tinystruct.application.ActionRegistry;
import org.tinystruct.system.Settings;

class MyAppTest {

    private MyApp app;

    @BeforeEach
    void setUp() {
        app = new MyApp();
        Settings config = new Settings();
        app.setConfiguration(config);
        app.init(); // triggers @Action annotation processing
    }
    void testHello() throws Exception {
        // Direct invocation via the application object
        Object result = app.invoke("hello");
        Assertions.assertEquals("Hello, tinystruct!", result);
    }

    @Test
    void testGreet() throws Exception {
        // Invocation with arguments
        Object result = app.invoke("greet", new Object[]{"James"});
        Assertions.assertEquals("Hello, James!", result);
    }
}
```

### Testing via ActionRegistry
If you need to test the routing logic itself, use the `ActionRegistry` singleton to verify path matching:

```java
@Test
void testRouting() {
    ActionRegistry registry = ActionRegistry.getInstance();
    // Verify a path matches an action
    Action action = registry.getAction("greet/James");
    Assertions.assertNotNull(action);
}
```
Reference: `src/test/java/org/tinystruct/application/ActionRegistryTest.java`
