---
name: contract-testing
description: Contract testing patterns for microservice APIs — Pact consumer-driven contracts, provider verification, Pact Broker CI/CD, async message contracts, schema-based contracts, and GraphQL contract testing with TypeScript, Python, and Java examples.
---

# Contract Testing Patterns

Verify that services communicate correctly by testing API contracts independently, without requiring full integration environments.

## When to Activate

- Implementing consumer-driven contracts with Pact
- Setting up provider verification in CI/CD
- Configuring Pact Broker for contract management
- Testing async message contracts (Kafka, RabbitMQ)
- Validating API schemas (OpenAPI, AsyncAPI)
- Ensuring GraphQL schema backward compatibility
- Preventing breaking API changes across teams

## Core Principles

1. **Consumer-driven** — consumers define what they need, providers verify they meet it
2. **Independent testing** — each service tested in isolation, no shared test env
3. **Contract as artifact** — contracts are versioned and stored in a broker
4. **CI/CD gating** — `can-i-deploy` blocks incompatible releases
5. **Schema evolution** — backward compatibility checked automatically

---

## 1. Consumer-Driven Contracts with Pact

### TypeScript Consumer Test

```typescript
import { PactV4, MatchersV3 } from "@pact-foundation/pact";
const { like, eachLike, string, integer } = MatchersV3;

const provider = new PactV4({ consumer: "OrderService", provider: "UserService" });

describe("UserService contract", () => {
  it("returns user by ID", async () => {
    await provider
      .addInteraction()
      .given("user 123 exists")
      .uponReceiving("a request for user 123")
      .withRequest("GET", "/users/123", (builder) => {
        builder.headers({ Accept: "application/json" });
      })
      .willRespondWith(200, (builder) => {
        builder
          .headers({ "Content-Type": "application/json" })
          .jsonBody({
            id: integer(123),
            name: string("Alice"),
            email: string("alice@example.com"),
          });
      })
      .executeTest(async (mockServer) => {
        const client = new UserClient(mockServer.url);
        const user = await client.getUser(123);
        expect(user.name).toBeDefined();
        expect(user.email).toContain("@");
      });
  });
});
```

### Python Consumer Test

```python
import pytest
from pact import Consumer, Provider

@pytest.fixture
def pact():
    pact = Consumer("OrderService").has_pact_with(
        Provider("UserService"), pact_dir="./pacts"
    )
    pact.start_service()
    yield pact
    pact.stop_service()

def test_get_user(pact):
    expected = {"id": 123, "name": "Alice", "email": "alice@example.com"}
    (pact
        .given("user 123 exists")
        .upon_receiving("a request for user 123")
        .with_request("GET", "/users/123")
        .will_respond_with(200, body=expected))

    with pact:
        result = UserClient(pact.uri).get_user(123)
        assert result["name"] == "Alice"
```

---

## 2. Provider Verification

### TypeScript Provider

```typescript
import { Verifier } from "@pact-foundation/pact";

describe("UserService provider verification", () => {
  it("validates contracts", async () => {
    await new Verifier({
      providerBaseUrl: "http://localhost:3000",
      pactBrokerUrl: process.env.PACT_BROKER_URL,
      provider: "UserService",
      providerVersion: process.env.GIT_SHA,
      providerVersionBranch: process.env.GIT_BRANCH,
      publishVerificationResult: !!process.env.CI,
      stateHandlers: {
        "user 123 exists": async () => {
          await testDb.users.create({ id: 123, name: "Alice", email: "alice@example.com" });
        },
        "no users exist": async () => {
          await testDb.users.deleteAll();
        },
      },
    }).verifyProvider();
  });
});
```

### Java/Spring Provider

```java
@Provider("UserService")
@PactBroker(url = "${PACT_BROKER_URL}")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserProviderPactTest {
    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider.class)
    void verifyPact(PactVerificationContext ctx) { ctx.verifyInteraction(); }

    @State("user 123 exists")
    void userExists() { userRepo.save(new User(123L, "Alice", "alice@example.com")); }

    @State("no users exist")
    void noUsers() { userRepo.deleteAll(); }
}
```

---

## 3. Pact Broker & CI/CD

### Publishing Contracts

```bash
# Publish consumer pacts after tests pass
npx pact-broker publish ./pacts \
  --consumer-app-version=$GIT_SHA \
  --branch=$GIT_BRANCH \
  --broker-base-url=$PACT_BROKER_URL

# Check deployment compatibility
npx pact-broker can-i-deploy \
  --pacticipant=OrderService \
  --version=$GIT_SHA \
  --to-environment=production
```

### CI Pipeline Integration

```yaml
# .github/workflows/contract-test.yml
jobs:
  consumer-test:
    steps:
      - run: npm test -- --grep "contract"
      - run: npx pact-broker publish ./pacts
          --consumer-app-version=${{ github.sha }}
          --branch=${{ github.ref_name }}

  can-i-deploy:
    needs: consumer-test
    steps:
      - run: npx pact-broker can-i-deploy
          --pacticipant=OrderService
          --version=${{ github.sha }}
          --to-environment=production
```

---

## 4. Async Message Contracts

### Kafka Message Consumer Contract

```typescript
describe("OrderEvent consumer contract", () => {
  it("handles OrderPlaced message", async () => {
    await provider
      .addInteraction()
      .expectsToReceive("an OrderPlaced event")
      .withContent(MatchersV3.like({
        eventType: "OrderPlaced",
        orderId: MatchersV3.uuid(),
        customerId: MatchersV3.string("cust-123"),
        total: MatchersV3.decimal(99.99),
        items: MatchersV3.eachLike({ productId: MatchersV3.string(), quantity: MatchersV3.integer() }),
      }))
      .executeTest(async (message) => {
        const handler = new OrderEventHandler();
        await handler.handle(JSON.parse(message.contents.toString()));
      });
  });
});
```

### Async Provider Verification

```typescript
await new MessageProviderPact({
  provider: "OrderService",
  messageProviders: {
    "an OrderPlaced event": async () => ({
      eventType: "OrderPlaced",
      orderId: "order-1",
      customerId: "cust-123",
      total: 99.99,
      items: [{ productId: "prod-1", quantity: 2 }],
    }),
  },
}).verify();
```

---

## 5. Schema-Based Contracts

### OpenAPI Validation

```typescript
import SwaggerParser from "@apidevtools/swagger-parser";

describe("API schema compatibility", () => {
  it("validates response matches OpenAPI spec", async () => {
    const spec = await SwaggerParser.validate("./openapi.yaml");
    const response = await fetch(`${baseUrl}/users/123`);
    const body = await response.json();
    const schema = spec.paths["/users/{id}"].get.responses["200"].content["application/json"].schema;
    expect(ajv.validate(schema, body)).toBe(true);
  });
});
```

### AsyncAPI for Message Schemas

```yaml
asyncapi: 2.6.0
info:
  title: Order Events
  version: 1.0.0
channels:
  orders.placed:
    publish:
      message:
        payload:
          type: object
          required: [eventType, orderId, customerId, total]
          properties:
            eventType: { type: string, const: "OrderPlaced" }
            orderId: { type: string, format: uuid }
            customerId: { type: string }
            total: { type: number, minimum: 0 }
```

---

## 6. GraphQL Contract Testing

### Schema Compatibility Check

```typescript
import { findBreakingChanges } from "graphql";

describe("GraphQL schema compatibility", () => {
  it("has no breaking changes from previous version", () => {
    const oldSchema = buildSchema(readFileSync("./schema-v1.graphql", "utf-8"));
    const newSchema = buildSchema(readFileSync("./schema-v2.graphql", "utf-8"));
    const breaking = findBreakingChanges(oldSchema, newSchema);
    expect(breaking).toEqual([]);
  });

  it("reports dangerous changes", () => {
    const dangerous = findDangerousChanges(oldSchema, newSchema);
    if (dangerous.length > 0) {
      console.warn("Dangerous changes:", dangerous.map(c => c.description));
    }
  });
});
```

---

## 7. Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| **Shared test env** | Flaky, slow, contention | Contract tests in isolation |
| **Over-specified contracts** | Brittle, breaks on cosmetic changes | Use matchers, test only what consumer needs |
| **Testing provider internals** | Coupling to implementation | Test only public API surface |
| **Skipping can-i-deploy** | Breaking changes reach production | Gate deployments on compatibility |
| **Snapshot-only contracts** | No semantic verification | Combine with behavioral assertions |

---

## 8. Checklist

- [ ] Consumer tests define expected interactions with matchers (not exact values)
- [ ] Provider verification runs against consumer pacts from broker
- [ ] State handlers set up test data for each provider state
- [ ] Pacts published to broker with Git SHA version and branch
- [ ] `can-i-deploy` gates deployment pipeline
- [ ] Async message contracts tested for event-driven services
- [ ] Schema compatibility checked for GraphQL and OpenAPI changes
- [ ] Breaking vs non-breaking changes classified and reviewed
- [ ] Provider verification runs on PR builds (not just main)
- [ ] Contract tests are fast (<30s) and run in CI on every push
