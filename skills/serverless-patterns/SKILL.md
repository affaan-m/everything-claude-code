---
name: serverless-patterns
description: Serverless architecture patterns — function design, event-driven architecture, API patterns, state management, framework comparison (SST, Serverless Framework), error handling, performance, and cost optimization.
---

# Serverless Architecture Patterns

Provider-agnostic serverless patterns for scalable, event-driven applications.

## When to Activate

- Designing serverless function architectures
- Implementing event-driven processing (fan-out, choreography)
- Building APIs with API Gateway + functions
- Managing state with Step Functions or Durable Functions
- Using SST or Serverless Framework
- Optimizing cold starts and execution costs

## Core Principles

1. **Single responsibility** — one function, one purpose
2. **Stateless by design** — external state stores, no local persistence
3. **Event-driven** — react to events, not poll for changes
4. **Idempotent** — safe to retry any invocation
5. **Pay-per-use mindset** — optimize for execution time and memory

## Function Design

### Cold Start Optimization

```typescript
// Initialize outside handler (reused across invocations)
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDB({});
const docClient = DynamoDBDocument.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

// Minimal handler
export async function handler(event: APIGatewayProxyEvent) {
  const { id } = JSON.parse(event.body ?? "{}");

  const result = await docClient.get({
    TableName: TABLE_NAME,
    Key: { id },
  });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(result.Item),
  };
}
```

### Connection Pooling

```typescript
// Reuse connections across invocations
import { Pool } from "pg";

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1, // Single connection per Lambda instance
      idleTimeoutMillis: 120_000,
    });
  }
  return pool;
}

export async function handler(event: { id: string }) {
  const client = await getPool().connect();
  try {
    const result = await client.query("SELECT * FROM orders WHERE id = $1", [event.id]);
    return { statusCode: 200, body: JSON.stringify(result.rows[0]) };
  } finally {
    client.release();
  }
}
```

## Event-Driven Architecture

### Fan-Out / Fan-In

```typescript
// Fan-out: One event triggers multiple processors
// SNS topic -> multiple SQS queues -> individual Lambda functions

// Order placed event triggers:
// 1. Inventory update (SQS -> Lambda)
// 2. Payment processing (SQS -> Lambda)
// 3. Email notification (SQS -> Lambda)
// 4. Analytics event (Kinesis -> Lambda)

// Fan-in: Aggregate results from parallel processing
export async function aggregator(event: SQSEvent) {
  const results = event.Records.map((record) => JSON.parse(record.body));

  const allComplete = results.every((r) => r.status === "complete");
  if (allComplete) {
    await publishEvent("order.fulfilled", {
      orderId: results[0].orderId,
      completedSteps: results.map((r) => r.step),
    });
  }
}
```

### Choreography Pattern

```typescript
// Each service reacts to events independently — no central orchestrator

// inventory-service/handler.ts
export async function onOrderPlaced(event: SNSEvent) {
  const order = JSON.parse(event.Records[0].Sns.Message);
  const reserved = await reserveInventory(order.items);

  await publishEvent(reserved
    ? "inventory.reserved"
    : "inventory.failed",
    { orderId: order.id }
  );
}

// payment-service/handler.ts
export async function onInventoryReserved(event: SNSEvent) {
  const data = JSON.parse(event.Records[0].Sns.Message);
  const charged = await chargePayment(data.orderId);

  await publishEvent(charged
    ? "payment.completed"
    : "payment.failed",
    { orderId: data.orderId }
  );
}
```

## API Patterns

### Middleware Pattern

```typescript
type Handler = (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
type Middleware = (handler: Handler) => Handler;

const withCors: Middleware = (handler) => async (event) => {
  const response = await handler(event);
  return {
    ...response,
    headers: {
      ...response.headers,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE",
    },
  };
};

const withAuth: Middleware = (handler) => async (event) => {
  const token = event.headers.Authorization?.replace("Bearer ", "");
  if (!token) return { statusCode: 401, body: "Unauthorized" };
  return handler(event);
};

const withErrorHandling: Middleware = (handler) => async (event) => {
  try {
    return await handler(event);
  } catch (error) {
    console.error("Handler error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

// Compose
const compose = (...middlewares: Middleware[]) =>
  (handler: Handler) => middlewares.reduceRight((h, m) => m(h), handler);

const protect = compose(withErrorHandling, withCors, withAuth);

export const handler = protect(async (event) => {
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
});
```

## State Management

### Step Functions / Orchestration

```json
{
  "Comment": "Order processing workflow",
  "StartAt": "ValidateOrder",
  "States": {
    "ValidateOrder": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:validate-order",
      "Next": "ProcessPayment",
      "Catch": [{
        "ErrorEquals": ["ValidationError"],
        "Next": "OrderFailed"
      }]
    },
    "ProcessPayment": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123:function:process-payment",
      "Retry": [{
        "ErrorEquals": ["PaymentRetryable"],
        "MaxAttempts": 3,
        "BackoffRate": 2
      }],
      "Next": "FulfillOrder"
    },
    "FulfillOrder": {
      "Type": "Parallel",
      "Branches": [
        {
          "StartAt": "UpdateInventory",
          "States": {
            "UpdateInventory": {
              "Type": "Task",
              "Resource": "arn:aws:lambda:us-east-1:123:function:update-inventory",
              "End": true
            }
          }
        },
        {
          "StartAt": "SendConfirmation",
          "States": {
            "SendConfirmation": {
              "Type": "Task",
              "Resource": "arn:aws:lambda:us-east-1:123:function:send-confirmation",
              "End": true
            }
          }
        }
      ],
      "Next": "OrderComplete"
    },
    "OrderComplete": { "Type": "Succeed" },
    "OrderFailed": { "Type": "Fail", "Error": "OrderProcessingFailed" }
  }
}
```

### Idempotency

```typescript
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const docClient = DynamoDBDocument.from(new DynamoDB({}));

async function withIdempotency<T>(
  idempotencyKey: string,
  ttlSeconds: number,
  fn: () => Promise<T>
): Promise<T> {
  const existing = await docClient.get({
    TableName: "idempotency",
    Key: { pk: idempotencyKey },
  });

  if (existing.Item) return existing.Item.result as T;

  const result = await fn();

  await docClient.put({
    TableName: "idempotency",
    Item: {
      pk: idempotencyKey,
      result,
      ttl: Math.floor(Date.now() / 1000) + ttlSeconds,
    },
    ConditionExpression: "attribute_not_exists(pk)",
  });

  return result;
}
```

## SST v3 Patterns

### Resource Binding

```typescript
// sst.config.ts
export default $config({
  app(input) {
    return { name: "my-app", removal: input.stage === "production" ? "retain" : "remove" };
  },
  async run() {
    const table = new sst.aws.Dynamo("Orders", {
      fields: { id: "string", userId: "string" },
      primaryIndex: { hashKey: "id" },
      globalIndexes: { byUser: { hashKey: "userId" } },
    });

    const api = new sst.aws.ApiGatewayV2("Api");
    api.route("GET /orders", {
      handler: "packages/functions/src/orders.list",
      link: [table],
    });
    api.route("POST /orders", {
      handler: "packages/functions/src/orders.create",
      link: [table],
    });

    return { apiUrl: api.url };
  },
});
```

### Function with Resource Access

```typescript
// packages/functions/src/orders.ts
import { Resource } from "sst";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

const docClient = DynamoDBDocument.from(new DynamoDB({}));

export async function list() {
  const result = await docClient.scan({ TableName: Resource.Orders.name });
  return { statusCode: 200, body: JSON.stringify(result.Items) };
}

export async function create(event: { body: string }) {
  const data = JSON.parse(event.body);
  await docClient.put({
    TableName: Resource.Orders.name,
    Item: { id: crypto.randomUUID(), ...data, createdAt: Date.now() },
  });
  return { statusCode: 201, body: JSON.stringify({ success: true }) };
}
```

## Error Handling

### DLQ and Partial Batch Failure

```typescript
import type { SQSBatchResponse, SQSEvent } from "aws-lambda";

export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
  const failures: string[] = [];

  for (const record of event.Records) {
    try {
      const data = JSON.parse(record.body);
      await processMessage(data);
    } catch (error) {
      console.error(`Failed to process ${record.messageId}:`, error);
      failures.push(record.messageId);
    }
  }

  return {
    batchItemFailures: failures.map((id) => ({
      itemIdentifier: id,
    })),
  };
}
```

## Performance

### Memory Tuning

```
Higher memory = more CPU = faster execution
Find the sweet spot: cost vs duration

128 MB:  Simple transforms, quick lookups
512 MB:  API handlers, moderate processing
1024 MB: Image processing, data aggregation
2048+ MB: ML inference, heavy computation

Measure with AWS Lambda Power Tuning tool.
```

### Bundling

```typescript
// esbuild config for minimal bundle
import { build } from "esbuild";

await build({
  entryPoints: ["src/handler.ts"],
  bundle: true,
  minify: true,
  sourcemap: true,
  platform: "node",
  target: "node20",
  outfile: "dist/handler.js",
  external: ["@aws-sdk/*"], // AWS SDK v3 is in Lambda runtime
  treeShaking: true,
});
```

## Checklist

- [ ] Connections initialized outside handler (reused across invocations)
- [ ] Functions are single-purpose and idempotent
- [ ] DLQ configured for async invocations
- [ ] Partial batch failure reporting for SQS triggers
- [ ] Memory tuned with power tuning tool
- [ ] Bundle size minimized (tree-shaking, external AWS SDK)
- [ ] Idempotency keys used for critical operations
- [ ] Timeouts set appropriately per function
