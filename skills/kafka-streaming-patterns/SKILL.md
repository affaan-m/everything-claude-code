---
name: kafka-streaming-patterns
description: Apache Kafka streaming patterns — producers, consumers, consumer groups, Schema Registry, Kafka Streams, ksqlDB, partitioning strategies, and error handling with TypeScript and Java examples.
---

# Kafka Streaming Patterns

Build scalable, fault-tolerant event streaming systems with Apache Kafka. Kafka is a distributed commit log — fundamentally different from message queues (see `message-queue-patterns` for RabbitMQ/BullMQ/SQS).

## When to Activate

- Setting up Kafka producers and consumers
- Designing consumer groups and partition strategies
- Implementing Schema Registry with Avro/Protobuf
- Building stream processing with Kafka Streams
- Writing real-time queries with ksqlDB
- Handling consumer rebalancing and offset management
- Implementing error handling with dead letter topics

## Core Principles

1. **Immutable log** — messages are appended, never modified or deleted (until retention)
2. **Partitioned parallelism** — partitions are the unit of parallelism and ordering
3. **Consumer groups** — each partition consumed by exactly one consumer in a group
4. **At-least-once by default** — design consumers to be idempotent
5. **Schema evolution** — use Schema Registry to manage backward/forward compatibility
6. **Backpressure-friendly** — consumers pull at their own pace

---

## 1. Core Concepts

### Kafka vs Message Queues

| Feature | Kafka | Traditional MQ |
|---------|-------|---------------|
| Storage | Distributed commit log | Message broker |
| Consumption | Pull-based, replayable | Push-based, consumed once |
| Ordering | Per-partition guaranteed | Per-queue (limited) |
| Retention | Time/size-based (days/weeks) | Until consumed |
| Scaling | Add partitions | Add queues |
| Consumer model | Consumer groups | Competing consumers |

---

## 2. Producer Patterns

### TypeScript (kafkajs)

```typescript
import { Kafka, Partitioners, CompressionTypes } from "kafkajs";

const kafka = new Kafka({ clientId: "order-service", brokers: ["kafka:9092"] });
const producer = kafka.producer({
  idempotent: true,
  maxInFlightRequests: 5,
  createPartitioner: Partitioners.DefaultPartitioner,
});

await producer.connect();

async function publishOrderEvent(order: Order): Promise<void> {
  await producer.send({
    topic: "orders.placed",
    compression: CompressionTypes.Snappy,
    messages: [{
      key: order.customerId,
      value: JSON.stringify({
        eventType: "OrderPlaced",
        orderId: order.id,
        customerId: order.customerId,
        total: order.total,
        timestamp: new Date().toISOString(),
      }),
      headers: {
        "correlation-id": order.correlationId,
        "schema-version": "2",
      },
    }],
  });
}
```

### Java

```java
Properties props = new Properties();
props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka:9092");
props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, KafkaAvroSerializer.class);
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
props.put(ProducerConfig.ACKS_CONFIG, "all");

try (var producer = new KafkaProducer<String, OrderPlaced>(props)) {
    var record = new ProducerRecord<>("orders.placed", order.customerId(),
        new OrderPlaced(order.id(), order.customerId(), order.total()));
    producer.send(record, (metadata, ex) -> {
        if (ex != null) log.error("Publish failed for order {}", order.id(), ex);
        else log.info("Published to {}:{} offset {}",
            metadata.topic(), metadata.partition(), metadata.offset());
    });
}
```

---

## 3. Consumer Patterns

### Consumer Group with Manual Offset Commit

```typescript
const consumer = kafka.consumer({ groupId: "order-processor" });
await consumer.connect();
await consumer.subscribe({ topics: ["orders.placed"], fromBeginning: false });

await consumer.run({
  autoCommit: false,
  eachMessage: async ({ topic, partition, message, heartbeat }) => {
    try {
      const event = JSON.parse(message.value!.toString());
      await processOrder(event);
      await consumer.commitOffsets([{
        topic, partition, offset: (Number(message.offset) + 1).toString(),
      }]);
    } catch (error) {
      await publishToDeadLetter(topic, message, error);
      await consumer.commitOffsets([{
        topic, partition, offset: (Number(message.offset) + 1).toString(),
      }]);
    }
    await heartbeat();
  },
});
```

### Batch Consumer (Java)

```java
try (var consumer = new KafkaConsumer<String, OrderPlaced>(props)) {
    consumer.subscribe(List.of("orders.placed"));
    while (running) {
        var records = consumer.poll(Duration.ofMillis(500));
        for (var record : records) {
            try {
                processOrder(record.value());
            } catch (Exception e) {
                publishToDeadLetter(record, e);
            }
        }
        consumer.commitSync();
    }
}
```

---

## 4. Schema Registry

### Avro Schema Definition

```json
{
  "type": "record",
  "name": "OrderPlaced",
  "namespace": "com.example.orders",
  "fields": [
    { "name": "orderId", "type": "string" },
    { "name": "customerId", "type": "string" },
    { "name": "total", "type": "double" },
    { "name": "currency", "type": "string", "default": "USD" },
    { "name": "timestamp", "type": { "type": "long", "logicalType": "timestamp-millis" } }
  ]
}
```

### Compatibility Modes

| Mode | Allowed Changes | Use Case |
|------|----------------|----------|
| BACKWARD | Add fields with defaults, remove fields | Consumer-first evolution |
| FORWARD | Remove fields, add fields with defaults | Producer-first evolution |
| FULL | Add/remove fields with defaults only | Strict evolution |
| NONE | Any change | Development only |

```bash
# Set compatibility mode
curl -X PUT http://schema-registry:8081/config/orders.placed-value \
  -H "Content-Type: application/json" \
  -d '{"compatibility": "BACKWARD"}'
```

---

## 5. Kafka Streams

### Filter, Map, Aggregate

```java
StreamsBuilder builder = new StreamsBuilder();
KStream<String, OrderPlaced> orders = builder.stream("orders.placed");

KStream<String, RevenueEvent> revenue = orders
    .filter((key, order) -> order.getTotal() > 0)
    .mapValues(order -> new RevenueEvent(order.getCustomerId(), order.getTotal()));

KTable<Windowed<String>, Double> hourlyRevenue = revenue
    .groupByKey()
    .windowedBy(TimeWindows.ofSizeWithNoGrace(Duration.ofHours(1)))
    .aggregate(
        () -> 0.0,
        (key, event, total) -> total + event.getTotal(),
        Materialized.with(Serdes.String(), Serdes.Double())
    );

hourlyRevenue.toStream().to("analytics.hourly-revenue");
```

### KTable Join

```java
KTable<String, Customer> customers = builder.table("customers");
KStream<String, EnrichedOrder> enriched = orders.join(
    customers,
    (order, customer) -> new EnrichedOrder(order, customer.getName(), customer.getTier())
);
enriched.to("orders.enriched");
```

---

## 6. ksqlDB

```sql
-- Create stream from topic
CREATE STREAM orders_stream (
    orderId VARCHAR KEY, customerId VARCHAR, total DOUBLE, timestamp BIGINT
) WITH (KAFKA_TOPIC='orders.placed', VALUE_FORMAT='AVRO', TIMESTAMP='timestamp');

-- Real-time aggregation (push query)
CREATE TABLE hourly_revenue AS
SELECT customerId, WINDOWSTART AS window_start,
    SUM(total) AS revenue, COUNT(*) AS order_count
FROM orders_stream
WINDOW TUMBLING (SIZE 1 HOUR)
GROUP BY customerId EMIT CHANGES;

-- Point lookup (pull query)
SELECT * FROM hourly_revenue WHERE customerId = 'cust-123';
```

---

## 7. Partitioning Strategies

| Strategy | Key | Guarantees | Risk |
|----------|-----|-----------|------|
| Customer ID | `customerId` | All orders for a customer in same partition | Hot customers |
| Order ID | `orderId` | Even distribution | No customer ordering |
| Region + Customer | `region-customerId` | Regional ordering | Uneven if regions differ |

### Hot Partition Mitigation

```typescript
function partitionKey(event: OrderEvent): string {
  if (HIGH_VOLUME_CUSTOMERS.has(event.customerId)) {
    const shard = Math.floor(Math.random() * 4);
    return `${event.customerId}-${shard}`;
  }
  return event.customerId;
}
```

---

## 8. Operational Patterns

### Topic Naming Convention

```
<domain>.<entity>.<event>     → orders.payment.completed
<domain>.<entity>.<version>   → orders.placed.v2
<env>.<domain>.<entity>       → prod.orders.placed
```

### Docker Compose (Development)

```yaml
services:
  kafka:
    image: confluentinc/cp-kafka:7.6.0
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
      CLUSTER_ID: "MkU3OEVBNTcwNTJENDM2Qk"  # dev-only, generate via kafka-storage random-uuid
    ports: ["9092:9092"]

  schema-registry:
    image: confluentinc/cp-schema-registry:7.6.0
    environment:
      SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: kafka:9092
    ports: ["8081:8081"]
```

---

## 9. Error Handling

### Dead Letter Topic

```typescript
async function publishToDeadLetter(
  sourceTopic: string, message: KafkaMessage, error: Error
): Promise<void> {
  await producer.send({
    topic: `${sourceTopic}.dead-letter`,
    messages: [{
      key: message.key,
      value: message.value,
      headers: {
        ...message.headers,
        "dead-letter-reason": error.message,
        "original-topic": sourceTopic,
        "failed-at": new Date().toISOString(),
      },
    }],
  });
}
```

### Retry Topic Pattern

```
orders.placed           → main processing
orders.placed.retry-1   → 1st retry (30s delay)
orders.placed.retry-2   → 2nd retry (5min delay)
orders.placed.dead-letter → manual intervention
```

---

## 10. Checklist

- [ ] Producers use idempotent mode (`enable.idempotence=true`) and `acks=all`
- [ ] Messages keyed by business entity for partition ordering
- [ ] Consumer group IDs are meaningful and stable
- [ ] Manual offset commit after successful processing (not auto-commit)
- [ ] Schema Registry enforces compatibility mode per topic
- [ ] Dead letter topic configured for unprocessable messages
- [ ] Consumer heartbeat and session timeout tuned for workload
- [ ] Topic retention and compaction configured per use case
- [ ] Monitoring: consumer lag, under-replicated partitions, throughput
- [ ] Hot partition mitigation for high-cardinality keys
- [ ] Idempotent consumers (safe to reprocess on rebalance)
