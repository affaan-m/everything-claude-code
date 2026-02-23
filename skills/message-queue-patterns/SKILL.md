---
name: message-queue-patterns
description: Message queue patterns for event-driven architectures — producer/consumer, pub/sub, dead letter queues, idempotent consumers, with RabbitMQ, Redis Streams, BullMQ, and AWS SQS/SNS examples.
---

# Message Queue Patterns

Build reliable event-driven systems with message queues for decoupled, scalable communication.

## When to Activate

- Designing event-driven or message-based architectures
- Implementing producer/consumer or pub/sub patterns
- Setting up RabbitMQ, Redis Streams, BullMQ, or AWS SQS/SNS
- Building idempotent consumers and dead letter queues
- Handling async workflows (order processing, notifications, ETL)

## Core Concepts

### Queue Types

| Pattern | Use Case | Example |
|---------|----------|---------|
| Point-to-Point | Task distribution | Order processing |
| Pub/Sub | Event broadcasting | User signup notifications |
| Fanout | Multi-consumer broadcast | Audit logging + analytics |
| Request/Reply | Async RPC | Service-to-service calls |

### Delivery Guarantees

| Guarantee | Meaning | Trade-off |
|-----------|---------|-----------|
| At-most-once | Fire and forget | Fast, may lose messages |
| At-least-once | Retry until ack | May duplicate, needs idempotency |
| Exactly-once | Deduplicated delivery | Slow, complex infrastructure |

## Producer Patterns

### TypeScript Producer (BullMQ)

```typescript
import { Queue } from "bullmq";

const orderQueue = new Queue("orders", {
  connection: { host: "localhost", port: 6379 },
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 5000,
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
  },
});

async function placeOrder(order: Order) {
  await orderQueue.add("process-order", {
    orderId: order.id,
    userId: order.userId,
    items: order.items,
    timestamp: Date.now(),
  }, {
    priority: order.isPremium ? 1 : 5,
    delay: 0,
  });
}
```

### Python Producer (RabbitMQ)

```python
import json
import pika

class EventPublisher:
    """Reuse connections and channels for production use."""

    def __init__(self, host: str = "localhost"):
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host)
        )
        self.channel = self.connection.channel()

    def publish(self, exchange: str, routing_key: str, payload: dict):
        self.channel.exchange_declare(exchange=exchange, exchange_type="topic", durable=True)
        self.channel.basic_publish(
            exchange=exchange,
            routing_key=routing_key,
            body=json.dumps(payload),
            properties=pika.BasicProperties(
                delivery_mode=2,  # Persistent
                content_type="application/json",
            ),
        )

    def close(self):
        self.connection.close()

# Usage
publisher = EventPublisher()
publisher.publish("user-events", "user.created", {
    "user_id": "123",
    "email": "alice@example.com",
    "timestamp": "2025-01-01T00:00:00Z",
})
```

## Consumer Patterns

### Idempotent Consumer (TypeScript)

```typescript
import { Worker } from "bullmq";

const worker = new Worker("orders", async (job) => {
  const { orderId } = job.data;

  // Idempotency check — skip if already processed
  const existing = await db.processedEvents.findUnique({
    where: { eventId: job.id },
  });
  if (existing) {
    console.log(`Order ${orderId} already processed, skipping`);
    return;
  }

  // Process order
  await db.$transaction(async (tx) => {
    await tx.orders.update({
      where: { id: orderId },
      data: { status: "confirmed" },
    });
    // Record idempotency key
    await tx.processedEvents.create({
      data: { eventId: job.id!, processedAt: new Date() },
    });
  });
}, {
  connection: { host: "localhost", port: 6379 },
  concurrency: 5,
  limiter: { max: 10, duration: 1000 },
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});
```

### Python Consumer (RabbitMQ)

```python
import json
import pika

def process_message(ch, method, properties, body):
    try:
        payload = json.loads(body)
        handle_user_event(payload)
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print(f"Failed to process message: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

connection = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
channel = connection.channel()

channel.queue_declare(queue="user-events", durable=True)
channel.queue_bind(queue="user-events", exchange="user-events", routing_key="user.*")
channel.basic_qos(prefetch_count=10)
channel.basic_consume(queue="user-events", on_message_callback=process_message)
channel.start_consuming()
```

## Dead Letter Queue

### BullMQ Dead Letter Handling

```typescript
import { Queue, Worker } from "bullmq";

const dlq = new Queue("orders-dlq", {
  connection: { host: "localhost", port: 6379 },
});

const worker = new Worker("orders", async (job) => {
  try {
    await processOrder(job.data);
  } catch (error) {
    if (job.attemptsMade >= (job.opts.attempts ?? 3) - 1) {
      // Final retry — move to DLQ
      await dlq.add("failed-order", {
        originalJob: job.data,
        error: String(error),
        failedAt: new Date().toISOString(),
        attempts: job.attemptsMade + 1,
      });
    }
    throw error; // Let BullMQ handle retry
  }
}, { connection: { host: "localhost", port: 6379 } });
```

### RabbitMQ Dead Letter Exchange

```python
channel.exchange_declare(exchange="dlx", exchange_type="direct", durable=True)
channel.queue_declare(queue="orders-dlq", durable=True)
channel.queue_bind(queue="orders-dlq", exchange="dlx", routing_key="orders")

# Main queue with DLX
channel.queue_declare(
    queue="orders",
    durable=True,
    arguments={
        "x-dead-letter-exchange": "dlx",
        "x-dead-letter-routing-key": "orders",
        "x-message-ttl": 30000,  # 30 seconds
    },
)
```

## AWS SQS/SNS

### TypeScript with AWS SDK v3

```typescript
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: "us-east-1" });
const queueUrl = process.env.SQS_QUEUE_URL!;

// Producer
async function sendMessage(payload: Record<string, unknown>) {
  await sqs.send(new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(payload),
    MessageGroupId: "default",              // For FIFO queues
    MessageDeduplicationId: crypto.randomUUID(),
  }));
}

// Consumer
async function pollMessages() {
  const response = await sqs.send(new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 20,  // Long polling
    VisibilityTimeout: 30,
  }));

  for (const message of response.Messages ?? []) {
    try {
      await processMessage(JSON.parse(message.Body!));
      await sqs.send(new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle,
      }));
    } catch (error) {
      console.error(`Failed to process: ${error}`);
      // Message returns to queue after visibility timeout
    }
  }
}
```

### SNS + SQS Fan-Out

```typescript
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({ region: "us-east-1" });

async function publishEvent(topicArn: string, event: Record<string, unknown>) {
  await sns.send(new PublishCommand({
    TopicArn: topicArn,
    Message: JSON.stringify(event),
    MessageAttributes: {
      eventType: { DataType: "String", StringValue: event.type as string },
    },
  }));
}
```

## Error Handling and Retry

### Retry Strategy Matrix

| Error Type | Retry? | Strategy |
|-----------|--------|----------|
| Transient (network, timeout) | Yes | Exponential backoff |
| Rate limit (429) | Yes | Backoff with jitter |
| Validation (400) | No | Send to DLQ immediately |
| Auth (401/403) | No | Alert and DLQ |
| Server error (500) | Yes | Limited retries then DLQ |

### Exponential Backoff Config

```typescript
const jobOptions = {
  attempts: 5,
  backoff: {
    type: "exponential",
    delay: 1000,  // 1s, 2s, 4s, 8s, 16s
  },
};
```

## Checklist

- [ ] All consumers are idempotent — safe to process the same message twice
- [ ] Dead letter queues configured for unprocessable messages
- [ ] Consumer concurrency limited to prevent resource exhaustion
- [ ] Messages are persistent/durable — survive broker restarts
- [ ] Prefetch/visibility timeout tuned for processing time
- [ ] Monitoring on queue depth, consumer lag, and DLQ size
- [ ] Retry strategy distinguishes transient from permanent failures
- [ ] Message schemas are versioned for backward compatibility
