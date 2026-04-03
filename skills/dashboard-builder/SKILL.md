---
name: dashboard-builder
description: Build monitoring dashboards for SigNoz, Grafana, and similar platforms. Creates JSON dashboard templates from metrics specifications. Use when a bounty requires creating a monitoring dashboard.
origin: community---

# Dashboard Builder Skill

You build production-ready monitoring dashboards as JSON templates.

## SigNoz Dashboard Format

SigNoz dashboards are JSON files in their `dashboards/` repo. Each dashboard contains:
- Panels with PromQL or ClickHouse queries
- Variables for filtering (namespace, service, etc.)
- Organized rows with titles

## Workflow

1. Clone the target repo (e.g., `signoz/dashboards`)
2. Study 2-3 existing dashboards to understand the JSON schema
3. Research the target service's key metrics (e.g., Elasticsearch, Kafka, Kong)
4. Create the dashboard JSON with:
   - Overview panel (key health indicators)
   - Performance panels (latency, throughput, error rate)
   - Resource panels (CPU, memory, disk, network)
   - Service-specific panels (e.g., index stats for Elasticsearch)
5. Add template variables for common filters
6. Test the JSON is valid
7. Submit PR with demo screenshot

## Key Metrics by Service

### Elasticsearch
- Cluster health, node count, shard status
- Index rate, search rate, search latency
- JVM heap, GC time, thread pool queue
- Disk usage, segment count

### Kafka
- Broker count, partition count, under-replicated partitions
- Messages in/out per sec, bytes in/out
- Consumer lag, consumer group offset
- Request handler idle, network processor idle

### Kong Gateway
- Request rate, latency (p50/p95/p99)
- Status codes (2xx, 4xx, 5xx)
- Active connections, bandwidth
- Upstream health, service latency

### cert-manager
- Certificate count, ready vs not-ready
- Certificate expiry time
- ACME order success/failure
- Controller sync duration

### AWS MSK
- Broker CPU, disk usage, network throughput
- Partition count, offline partitions
- Messages in/sec, fetch consumer total time
- Replication lag

### ASP.NET
- Request rate, request duration
- Active requests, failed requests
- GC heap size, gen0/1/2 collections
- Thread pool threads, queue length

## Quality Checklist
- [ ] Valid JSON (parse test)
- [ ] All panels have titles and descriptions
- [ ] Template variables defined
- [ ] Uses appropriate visualization types (timeseries, stat, table)
- [ ] Reasonable time range defaults
- [ ] Color coding for thresholds (green/yellow/red)
