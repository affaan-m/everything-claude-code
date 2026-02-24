---
name: prometheus-grafana-monitoring
description: Prometheus metric types, PromQL queries, Grafana dashboards, alerting rules, and SLO/SLI patterns.
---

# Prometheus & Grafana Monitoring

## When to Activate
- Instrumenting applications with Prometheus metrics
- Writing PromQL queries or recording rules
- Building Grafana dashboards or alert rules
- Defining SLOs, SLIs, and error budgets

## Core Principles
- **USE method**: Utilization, Saturation, Errors for resources
- **RED method**: Rate, Errors, Duration for services
- **Four Golden Signals**: Latency, Traffic, Errors, Saturation
- **Alert on symptoms, not causes**: Page on user-facing impact

---

## 1. Metric Types

| Type | Use When | Example |
|------|----------|---------|
| Counter | Value only goes up | `http_requests_total` |
| Gauge | Value goes up and down | `temperature_celsius` |
| Histogram | Measure distributions | `http_request_duration_seconds` |
| Summary | Pre-calculated quantiles | `rpc_duration_seconds` |

**Prefer histograms over summaries** — histograms are aggregatable across instances.

### Naming Convention

```
<namespace>_<subsystem>_<name>_<unit>

# Examples
http_server_requests_total          # counter (suffix: _total)
http_server_request_duration_seconds # histogram (suffix: unit)
node_memory_available_bytes         # gauge (suffix: unit)
```

---

## 2. Instrumentation

### TypeScript (prom-client)

```typescript
import { Registry, Counter, Histogram } from "prom-client";

const register = new Registry();

const httpRequests = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "path", "status"] as const,
  registers: [register],
});

const httpDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "path"] as const,
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

// Middleware
app.use((req, res, next) => {
  const end = httpDuration.startTimer({ method: req.method, path: req.route?.path ?? req.path });
  res.on("finish", () => {
    httpRequests.inc({ method: req.method, path: req.route?.path ?? req.path, status: String(res.statusCode) });
    end();
  });
  next();
});

// Metrics endpoint
app.get("/metrics", async (_, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});
```

### Python (prometheus_client)

```python
from prometheus_client import Counter, Histogram, generate_latest

REQUEST_COUNT = Counter(
    "http_requests_total", "Total HTTP requests",
    ["method", "path", "status"]
)
REQUEST_DURATION = Histogram(
    "http_request_duration_seconds", "Request duration",
    ["method", "path"],
    buckets=[0.01, 0.05, 0.1, 0.5, 1, 5]
)
```

---

## 3. PromQL Essentials

### Rate (per-second for counters)

```promql
# Request rate over 5 minutes
rate(http_requests_total[5m])

# Error rate
sum(rate(http_requests_total{status=~"5.."}[5m]))
/ sum(rate(http_requests_total[5m]))
```

### Histogram Quantiles

```promql
# p99 latency
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# p50 latency per path
histogram_quantile(0.50,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, path)
)
```

### Aggregation

```promql
# Total requests by status code
sum by (status) (rate(http_requests_total[5m]))

# Top 5 paths by request count
topk(5, sum by (path) (rate(http_requests_total[5m])))
```

### Common Pitfalls
- **Never `rate()` a gauge** — use `deriv()` or `delta()` instead
- **Always wrap counters with `rate()` or `increase()`** before aggregating
- **Match `[range]` to scrape interval** — use at least `4 × scrape_interval`

---

## 4. Alert Rules

```yaml
# prometheus/alerts.yaml
groups:
  - name: http
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High 5xx error rate ({{ $value | humanizePercentage }})"
          runbook_url: https://wiki.example.com/runbooks/high-error-rate

      - alert: HighLatency
        expr: |
          histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
          > 1.0
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "p99 latency above 1s ({{ $value | humanize }}s)"
```

### Recording Rules (pre-compute expensive queries)

```yaml
groups:
  - name: http_recording
    interval: 30s
    rules:
      - record: http:requests:rate5m
        expr: sum(rate(http_requests_total[5m]))
      - record: http:errors:ratio5m
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
          / sum(rate(http_requests_total[5m]))
```

---

## 5. Grafana Dashboards

### Dashboard as Code (Provisioning)

```yaml
# grafana/provisioning/dashboards/default.yaml
apiVersion: 1
providers:
  - name: Default
    folder: ""
    type: file
    options:
      path: /var/lib/grafana/dashboards
```

### Panel Types

| Panel | Use Case |
|-------|----------|
| Time series | Metrics over time |
| Stat | Single big number (current value) |
| Gauge | Value against min/max |
| Table | Multi-dimensional data |
| Heatmap | Histogram distributions over time |
| Logs | Log correlation with metrics |

### Variables

```
# Query variable for service selection
label_values(http_requests_total, service)

# Use in panels
rate(http_requests_total{service="$service"}[5m])
```

---

## 6. SLO / SLI

### Definitions

- **SLI** (Service Level Indicator): Measured metric (e.g., availability, latency)
- **SLO** (Service Level Objective): Target for the SLI (e.g., 99.9% availability)
- **Error Budget**: Allowed failure = `1 - SLO` (e.g., 0.1% over 30 days = ~43 min)

### Availability SLI

```promql
# Availability = successful requests / total requests
1 - (
  sum(rate(http_requests_total{status=~"5.."}[30d]))
  / sum(rate(http_requests_total[30d]))
)
```

### Burn Rate Alerts (Multi-Window)

```yaml
# Fast burn: 14.4x budget consumption in 1h (pages immediately)
- alert: SLOBurnRateCritical
  expr: |
    http:errors:ratio5m > (14.4 * 0.001)
    and
    http:errors:ratio1h > (14.4 * 0.001)
  labels:
    severity: critical

# Slow burn: 1x budget consumption in 3d (ticket)
- alert: SLOBurnRateWarning
  expr: |
    http:errors:ratio1h > (1 * 0.001)
    and
    http:errors:ratio6h > (1 * 0.001)
  labels:
    severity: warning
```

---

## 7. Service Discovery

### Kubernetes

```yaml
# prometheus.yaml
scrape_configs:
  - job_name: kubernetes-pods
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: "true"
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        target_label: __address__
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: "$1:$2"
```

### Pod Annotations

```yaml
metadata:
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "8080"
    prometheus.io/path: "/metrics"
```

---

## 8. Operational Patterns

### Retention & Storage

```yaml
# prometheus.yaml command flags
--storage.tsdb.retention.time=30d
--storage.tsdb.retention.size=50GB
```

### Federation (multi-cluster)

```yaml
scrape_configs:
  - job_name: federate
    honor_labels: true
    metrics_path: /federate
    params:
      match[]:
        - '{job=~".+"}'
    static_configs:
      - targets: ["prometheus-cluster-b:9090"]
```

### Remote Write (long-term storage)

```yaml
remote_write:
  - url: https://thanos-receive.example.com/api/v1/receive
    queue_config:
      max_samples_per_send: 1000
      batch_send_deadline: 5s
```

---

## Checklist

- [ ] Metrics follow naming convention (`_total`, `_seconds`, `_bytes`)
- [ ] Histograms use appropriate bucket boundaries for your SLAs
- [ ] Label cardinality is bounded (no user IDs or request IDs as labels)
- [ ] Recording rules pre-compute dashboard queries
- [ ] Alerts have `for` duration, severity labels, and runbook URLs
- [ ] SLO targets defined with multi-window burn rate alerts
- [ ] Dashboards are provisioned as code (not manually created)
- [ ] Grafana variables enable filtering by service/environment
