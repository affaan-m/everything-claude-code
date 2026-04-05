---
name: dashboard-builder
description: Build monitoring dashboards for SigNoz, Grafana, and similar platforms. Creates JSON dashboard templates from metrics specifications.
origin: community
---

# Dashboard Builder

## When to Activate

- "Build a Kafka monitoring dashboard"
- "Create a Grafana dashboard for Elasticsearch"
- "Make a monitoring dashboard for this service"

## How It Works

1. Study 2-3 existing dashboards in the target platform to understand the JSON schema
2. Research the target service's key metrics
3. Create the dashboard JSON with organized sections:
   - Overview panel (key health indicators)
   - Performance panels (latency, throughput, error rate)
   - Resource panels (CPU, memory, disk, network)
   - Service-specific panels
4. Add template variables for common filters
5. Validate JSON structure
6. Submit with demo screenshot

## Examples

### Elasticsearch Dashboard Panels
- Cluster health, node count, shard status
- Index rate, search rate, search latency
- JVM heap, GC time, thread pool queue

### Kafka Dashboard Panels
- Broker count, partition count, under-replicated partitions
- Messages in/out per sec, bytes in/out
- Consumer lag, consumer group offset

### Kong Gateway Dashboard Panels
- Request rate, latency (p50/p95/p99)
- Status codes (2xx, 4xx, 5xx)
- Active connections, upstream health

## Quality Checklist

- [ ] Valid JSON (parse test)
- [ ] All panels have titles and descriptions
- [ ] Template variables defined
- [ ] Appropriate visualization types
- [ ] Reasonable time range defaults
- [ ] Color coding for thresholds
