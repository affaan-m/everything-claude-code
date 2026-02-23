---
name: load-testing
description: Load testing patterns with k6, Artillery, and Locust — script design, scenario modeling, threshold configuration, metrics analysis, and CI/CD integration.
---

# Load Testing Patterns

Design and execute load tests to validate performance, identify bottlenecks, and prevent regressions.

## When to Activate

- Performance testing before production releases
- Establishing baseline performance metrics
- Load testing new API endpoints or services
- Validating auto-scaling configurations
- Setting up performance gates in CI/CD pipelines

## Core Concepts

### Test Types

| Type | Purpose | Duration | Load |
|------|---------|----------|------|
| Smoke | Verify script works | 1-2 min | 1-5 VUs |
| Load | Normal traffic | 10-30 min | Expected VUs |
| Stress | Find breaking point | 10-20 min | Ramp beyond capacity |
| Soak | Find memory leaks | 1-4 hours | Normal VUs |
| Spike | Sudden traffic burst | 5-10 min | Sudden 10x spike |

### Key Metrics

| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| p95 latency | < 200ms | < 500ms | > 1s |
| p99 latency | < 500ms | < 1s | > 2s |
| Error rate | < 0.1% | < 1% | > 5% |
| Throughput | Stable | Declining | Collapsing |

## k6 (Primary Tool)

### Basic Test Script

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 20 },   // Ramp up
    { duration: "3m", target: 20 },   // Steady state
    { duration: "1m", target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<200", "p(99)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get("http://localhost:3000/api/users");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 200ms": (r) => r.timings.duration < 200,
  });
  sleep(1);
}
```

### Scenario-Based Test

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    browse: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 50 },
        { duration: "5m", target: 50 },
        { duration: "1m", target: 0 },
      ],
      exec: "browseProducts",
    },
    purchase: {
      executor: "constant-arrival-rate",
      rate: 10,
      timeUnit: "1s",
      duration: "5m",
      preAllocatedVUs: 50,
      exec: "purchaseFlow",
    },
  },
  thresholds: {
    "http_req_duration{scenario:browse}": ["p(95)<300"],
    "http_req_duration{scenario:purchase}": ["p(95)<500"],
  },
};

export function browseProducts() {
  http.get("http://localhost:3000/api/products");
  sleep(Math.random() * 3);
}

export function purchaseFlow() {
  const products = http.get("http://localhost:3000/api/products").json();
  const product = products[Math.floor(Math.random() * products.length)];

  http.post("http://localhost:3000/api/cart", JSON.stringify({
    productId: product.id,
    quantity: 1,
  }), { headers: { "Content-Type": "application/json" } });

  http.post("http://localhost:3000/api/checkout");
  sleep(1);
}
```

### Custom Metrics

```javascript
import { Trend, Counter, Rate } from "k6/metrics";

const loginDuration = new Trend("login_duration");
const failedLogins = new Counter("failed_logins");
const successRate = new Rate("success_rate");

export default function () {
  const start = Date.now();
  const res = http.post("http://localhost:3000/auth/login", JSON.stringify({
    email: "test@example.com",
    password: "password",
  }), { headers: { "Content-Type": "application/json" } });

  loginDuration.add(Date.now() - start);
  successRate.add(res.status === 200);
  if (res.status !== 200) failedLogins.add(1);
}
```

## Artillery

### YAML Configuration

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 300
      arrivalRate: 20
      name: "Sustained load"
  defaults:
    headers:
      Content-Type: "application/json"
  ensure:
    p95: 200
    maxErrorRate: 1

scenarios:
  - name: "Browse and purchase"
    flow:
      - get:
          url: "/api/products"
          capture:
            - json: "$[0].id"
              as: "productId"
      - post:
          url: "/api/cart"
          json:
            productId: "{{ productId }}"
            quantity: 1
      - post:
          url: "/api/checkout"
```

## Locust

### Python Script

```python
from locust import HttpUser, task, between

class APIUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def list_products(self):
        self.client.get("/api/products")

    @task(1)
    def create_order(self):
        self.client.post("/api/orders", json={
            "product_id": 1,
            "quantity": 1,
        })

    def on_start(self):
        response = self.client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "password",
        })
        self.client.headers["Authorization"] = f"Bearer {response.json()['token']}"
```

## CI/CD Integration

### GitHub Actions with k6

```yaml
name: Load Test
on:
  pull_request:
    branches: [main]
jobs:
  load-test:
    runs-on: ubuntu-latest
    services:
      app:
        image: myregistry/api:${{ github.sha }}
        ports:
          - 3000:3000
    steps:
      - uses: actions/checkout@v4

      - uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/load/smoke.js
        env:
          K6_TARGET: http://app:3000

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: k6-results
          path: results/
```

## Results Analysis

### k6 Output Interpretation

```
✓ status is 200............: 99.8%  ✓ 4990  ✗ 10
✓ response time < 200ms...: 95.2%  ✓ 4760  ✗ 240

http_req_duration..........: avg=120ms  min=15ms  med=95ms  max=1.2s  p(90)=180ms  p(95)=210ms
http_req_failed............: 0.20%  ✓ 10    ✗ 4990
http_reqs..................: 5000   166/s
vus........................: 20     min=0   max=20
```

Key signals:
- **p95 > threshold**: Optimize slow endpoints or scale infrastructure
- **Error rate climbing**: Check for resource exhaustion, connection limits, or crashes
- **Throughput plateau**: Server at capacity — scale horizontally or optimize

## Checklist

- [ ] Smoke test passes before running full load tests
- [ ] Thresholds defined for p95 latency and error rate
- [ ] Tests use realistic scenarios — not just single-endpoint hammering
- [ ] Test data is isolated (dedicated test database or mock services)
- [ ] CI pipeline runs smoke tests on every PR
- [ ] Full load tests run on staging before production deploy
- [ ] Results are archived for trend analysis
- [ ] Auto-scaling validated under stress test conditions
