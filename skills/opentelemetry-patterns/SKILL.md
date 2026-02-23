---
name: opentelemetry-patterns
description: OpenTelemetry patterns — distributed tracing, metrics, log correlation, SDK setup, OTLP exporters, collector configuration, custom instrumentation, and backend integration.
---

# OpenTelemetry Patterns

Production-grade OpenTelemetry patterns for distributed tracing, metrics, and observability.

## When to Activate

- Setting up OpenTelemetry SDK in Node.js, Python, or Go
- Implementing distributed tracing across microservices
- Creating custom metrics (counters, histograms, gauges)
- Configuring OTLP exporters and collectors
- Correlating logs with trace context
- Instrumenting business logic with custom spans

## Core Principles

1. **Instrument at boundaries** — trace HTTP, DB, messaging, and external calls
2. **Semantic conventions** — use OTel semantic attributes for consistency
3. **Context propagation** — always propagate trace context across services
4. **Sampling strategy** — balance observability with cost
5. **Collector as gateway** — use OTel Collector to decouple backends

## SDK Setup

### Node.js Auto-Instrumentation

```typescript
// tracing.ts — import BEFORE all other modules
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { Resource } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
} from "@opentelemetry/semantic-conventions";

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: "order-service",
    [ATTR_SERVICE_VERSION]: "1.2.0",
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: process.env.NODE_ENV ?? "development",
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4317",
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
    exportIntervalMillis: 30_000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": { enabled: false },
    }),
  ],
});

sdk.start();
process.on("SIGTERM", () => sdk.shutdown());
```

### Python Manual Setup

```python
from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.resources import Resource, SERVICE_NAME

resource = Resource.create({SERVICE_NAME: "user-service"})

# Traces
trace_provider = TracerProvider(resource=resource)
trace_provider.add_span_processor(
    BatchSpanProcessor(OTLPSpanExporter())
)
trace.set_tracer_provider(trace_provider)

# Metrics
metric_reader = PeriodicExportingMetricReader(OTLPMetricExporter())
metric_provider = MeterProvider(resource=resource, metric_readers=[metric_reader])
metrics.set_meter_provider(metric_provider)

tracer = trace.get_tracer(__name__)
meter = metrics.get_meter(__name__)
```

## Traces

### Creating Spans with Attributes

```typescript
import { trace, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("order-service");

async function processOrder(orderId: string, userId: string) {
  return tracer.startActiveSpan("process-order", async (span) => {
    try {
      span.setAttributes({
        "order.id": orderId,
        "user.id": userId,
        "order.source": "web",
      });

      const inventory = await checkInventory(orderId);
      span.addEvent("inventory-checked", {
        "inventory.available": inventory.available,
      });

      const payment = await processPayment(orderId);
      span.addEvent("payment-processed", {
        "payment.method": payment.method,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return { success: true };
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

### Context Propagation

```typescript
import { context, propagation } from "@opentelemetry/api";

// Inject context into outgoing HTTP headers
function createOutgoingHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  propagation.inject(context.active(), headers);
  return headers;
}

// Extract context from incoming request
function extractContext(headers: Record<string, string>) {
  return propagation.extract(context.active(), headers);
}

// Use in HTTP client
async function callService(url: string, body: unknown) {
  const headers = createOutgoingHeaders();
  return fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
```

## Metrics

### Counter, Histogram, Gauge

```typescript
import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("order-service");

// Counter — monotonically increasing
const orderCounter = meter.createCounter("orders.created", {
  description: "Number of orders created",
  unit: "orders",
});

// Histogram — distribution of values
const orderDuration = meter.createHistogram("orders.processing_duration", {
  description: "Order processing duration",
  unit: "ms",
  advice: { explicitBucketBoundaries: [50, 100, 250, 500, 1000, 2500] },
});

// UpDownCounter — can go up or down
const activeOrders = meter.createUpDownCounter("orders.active", {
  description: "Number of currently active orders",
});

// Usage
orderCounter.add(1, { "order.type": "standard", "order.region": "us-east" });
orderDuration.record(245, { "order.type": "standard" });
activeOrders.add(1);   // new order
activeOrders.add(-1);  // order completed
```

### Observable Gauge

```typescript
const queueSize = meter.createObservableGauge("queue.size", {
  description: "Current queue size",
});

queueSize.addCallback((result) => {
  result.observe(getQueueSize(), { "queue.name": "orders" });
  result.observe(getQueueSize(), { "queue.name": "notifications" });
});
```

## Log Correlation

```typescript
import { trace } from "@opentelemetry/api";

function createLogger() {
  return {
    info(message: string, data?: Record<string, unknown>) {
      const span = trace.getActiveSpan();
      const traceContext = span
        ? {
            traceId: span.spanContext().traceId,
            spanId: span.spanContext().spanId,
            traceFlags: span.spanContext().traceFlags,
          }
        : {};

      console.log(JSON.stringify({
        level: "info",
        message,
        ...traceContext,
        ...data,
        timestamp: new Date().toISOString(),
      }));
    },
  };
}
```

## Collector Configuration

### Basic Pipeline

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: "0.0.0.0:4317"
      http:
        endpoint: "0.0.0.0:4318"

processors:
  batch:
    timeout: 5s
    send_batch_size: 1024
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
    spike_limit_mib: 128
  resource:
    attributes:
      - key: environment
        value: production
        action: upsert

exporters:
  otlphttp:
    endpoint: "https://tempo.example.com:4318"
  prometheus:
    endpoint: "0.0.0.0:8889"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch, resource]
      exporters: [otlphttp]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [prometheus]
```

### Tail Sampling

```yaml
processors:
  tail_sampling:
    decision_wait: 10s
    policies:
      - name: errors-policy
        type: status_code
        status_code: { status_codes: [ERROR] }
      - name: slow-traces
        type: latency
        latency: { threshold_ms: 1000 }
      - name: probabilistic
        type: probabilistic
        probabilistic: { sampling_percentage: 10 }
```

## Custom Instrumentation

### Business Logic Spans

```typescript
class PaymentService {
  private tracer = trace.getTracer("payment-service");

  async processPayment(orderId: string, amount: number) {
    return this.tracer.startActiveSpan(
      "payment.process",
      { attributes: { "payment.order_id": orderId, "payment.amount": amount } },
      async (span) => {
        try {
          const validation = await this.validateCard(orderId);
          span.addEvent("card-validated");

          const charge = await this.chargeCard(amount);
          span.setAttributes({
            "payment.transaction_id": charge.transactionId,
            "payment.status": charge.status,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          return charge;
        } catch (error) {
          span.recordException(error as Error);
          span.setStatus({ code: SpanStatusCode.ERROR });
          throw error;
        } finally {
          span.end();
        }
      }
    );
  }
}
```

### Baggage Propagation

```typescript
import { propagation, context } from "@opentelemetry/api";

// Set baggage at entry point
function setTenantBaggage(tenantId: string) {
  const baggage = propagation.createBaggage({
    "tenant.id": { value: tenantId },
    "request.priority": { value: "high" },
  });
  return propagation.setBaggage(context.active(), baggage);
}

// Read baggage in downstream service
function getTenantId(): string | undefined {
  const baggage = propagation.getBaggage(context.active());
  return baggage?.getEntry("tenant.id")?.value;
}
```

## Backend Integration

### Docker Compose Stack

```yaml
services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    ports:
      - "4317:4317"   # OTLP gRPC
      - "4318:4318"   # OTLP HTTP
      - "8889:8889"   # Prometheus metrics
    volumes:
      - ./otel-collector-config.yaml:/etc/otelcol/config.yaml

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"  # Jaeger UI
    environment:
      COLLECTOR_OTLP_ENABLED: "true"

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      GF_AUTH_ANONYMOUS_ENABLED: "true"
```

## Checklist

- [ ] SDK initialized before all other imports
- [ ] Service name and version set in Resource
- [ ] Context propagation configured for HTTP clients
- [ ] Custom spans added for business-critical operations
- [ ] Metrics defined with semantic attribute conventions
- [ ] Collector uses memory limiter and batch processor
- [ ] Sampling strategy configured for production
- [ ] Logs include trace ID for correlation
