---
name: backend-log
description: Query backend service logs from Google Cloud Platform. Supports K8s (GKE), Cloud Run, and Cloud Functions. Handles dev tag suffixes for staging deployments.
---

# Backend Service Log Query

Query logs from Qashier backend services running on Google Cloud Platform.

## Environment Configuration

| Environment | GCP Project   |
|-------------|---------------|
| staging     | qashiertest   |
| production  | qashier       |

## Service Types & Log Filters

### Kubernetes (GKE)

Services deployed to GKE use container-based logging:

```bash
resource.labels.container_name="<service-name>"
```

### Cloud Run

Services deployed to Cloud Run:

```bash
resource.labels.service_name="<service-name>"
```

### Cloud Functions

Legacy functions:

```bash
resource.labels.function_name="<function-name>"
```

## Dev Tag Convention

For development deployments in staging, append the dev tag as suffix:

```
<service-name>-<dev-tag>
```

**Example:** Service `core-transaction` with dev tag `pos` becomes `core-transaction-pos`

## Common Query Commands

### Basic Log Query (K8s)

```bash
gcloud logging read 'resource.labels.container_name="<service-name>"' \
  --project=<project> \
  --limit=100 \
  --format="table(timestamp,severity,textPayload)"
```

### Query with Time Range

```bash
gcloud logging read 'resource.labels.container_name="<service-name>" AND timestamp>="<start-time>" AND timestamp<="<end-time>"' \
  --project=<project> \
  --limit=100
```

### Filter by Severity

```bash
gcloud logging read 'resource.labels.container_name="<service-name>" AND severity>=ERROR' \
  --project=<project> \
  --limit=50
```

### Search for Specific Text

```bash
gcloud logging read 'resource.labels.container_name="<service-name>" AND textPayload=~"<search-term>"' \
  --project=<project> \
  --limit=100
```

### JSON Payload Search

```bash
gcloud logging read 'resource.labels.container_name="<service-name>" AND jsonPayload.message=~"<search-term>"' \
  --project=<project> \
  --limit=100
```

## Usage Examples

### Query staging logs for core-transaction

```bash
gcloud logging read 'resource.labels.container_name="core-transaction"' \
  --project=qashiertest \
  --limit=100 \
  --format="table(timestamp,severity,textPayload)"
```

### Query dev deployment with tag "pos"

```bash
gcloud logging read 'resource.labels.container_name="core-transaction-pos"' \
  --project=qashiertest \
  --limit=100
```

### Query production errors

```bash
gcloud logging read 'resource.labels.container_name="core-transaction" AND severity>=ERROR' \
  --project=qashier \
  --limit=50
```

### Query Cloud Run service

```bash
gcloud logging read 'resource.labels.service_name="payment-gateway"' \
  --project=qashiertest \
  --limit=100
```

### Query last 30 minutes

```bash
gcloud logging read 'resource.labels.container_name="core-transaction" AND timestamp>="2024-01-15T10:00:00Z"' \
  --project=qashiertest \
  --limit=200
```

## Output Formats

### Table format (readable)

```bash
--format="table(timestamp,severity,textPayload)"
```

### JSON format (for parsing)

```bash
--format=json
```

### Custom format

```bash
--format="value(timestamp,jsonPayload.message)"
```

## Tips

1. **Always specify `--project`** to ensure you're querying the correct environment
2. **Use `--limit`** to avoid downloading too many logs
3. **Combine filters** with `AND` for precise queries
4. **Use `=~`** for regex matching in text searches
5. **Check dev tag** in `.local-env.md` for your current dev deployment suffix

## Common Services

| Service | Type | Description |
|---------|------|-------------|
| core-transaction | K8s | Transaction processing |
| core-store | K8s | Store management |
| core-product | K8s | Product catalog |
| core-inventory | K8s | Inventory management |
| core-auth | K8s | Authentication |
| payment-qpay | K8s | QPay payment processing |

## Troubleshooting

### No logs found

1. Verify the service name is correct
2. Check if using dev tag suffix for staging dev deployments
3. Ensure the correct project (qashiertest vs qashier)
4. Expand time range if filtering by timestamp

### Permission denied

```bash
gcloud auth login
gcloud config set project <project-name>
```
