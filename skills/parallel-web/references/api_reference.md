# Parallel Web Systems API Quick Reference

**Full Documentation:** https://docs.parallel.ai
**API Key:** https://platform.parallel.ai
**Python SDK:** `pip install parallel-web`
**Environment Variable:** `PARALLEL_API_KEY`

---

## Search API (Beta)

**Endpoint:** `POST https://api.parallel.ai/v1beta/search`
**Header:** `parallel-beta: search-extract-2025-10-10`

### Request

```json
{
  "objective": "Natural language search goal (max 5000 chars)",
  "search_queries": ["keyword query 1", "keyword query 2"],
  "max_results": 10,
  "excerpts": {
    "max_chars_per_result": 10000,
    "max_chars_total": 50000
  },
  "source_policy": {
    "allow_domains": ["example.com"],
    "deny_domains": ["spam.com"],
    "after_date": "2024-01-01"
  }
}
```

### Response

```json
{
  "search_id": "search_...",
  "results": [
    {
      "url": "https://...",
      "title": "Page Title",
      "publish_date": "2025-01-15",
      "excerpts": ["Relevant content..."]
    }
  ]
}
```

### Python SDK

```python
from parallel import Parallel
client = Parallel(api_key="...")
result = client.beta.search(
    objective="...",
    search_queries=["..."],
    max_results=10,
    excerpts={"max_chars_per_result": 10000},
)
```

**Cost:** $5 per 1,000 requests (default 10 results each)
**Rate Limit:** 600 requests/minute

---

## Extract API (Beta)

**Endpoint:** `POST https://api.parallel.ai/v1beta/extract`
**Header:** `parallel-beta: search-extract-2025-10-10`

### Request

```json
{
  "urls": ["https://example.com/page"],
  "objective": "What to focus on",
  "excerpts": true,
  "full_content": false
}
```

### Response

```json
{
  "extract_id": "extract_...",
  "results": [
    {
      "url": "https://...",
      "title": "Page Title",
      "excerpts": ["Focused content..."],
      "full_content": null
    }
  ],
  "errors": []
}
```

### Python SDK

```python
result = client.beta.extract(
    urls=["https://..."],
    objective="...",
    excerpts=True,
    full_content=False,
)
```

**Cost:** $1 per 1,000 URLs
**Rate Limit:** 600 requests/minute

---

## Task API (Deep Research)

**Endpoint:** `POST https://api.parallel.ai/v1/tasks/runs`

### Create Task Run

```json
{
  "input": "Research question (max 15,000 chars)",
  "processor": "pro-fast",
  "task_spec": {
    "output_schema": {
      "type": "text"
    }
  }
}
```

### Response (immediate)

```json
{
  "run_id": "trun_...",
  "status": "queued"
}
```

### Get Result (blocking)

**Endpoint:** `GET https://api.parallel.ai/v1/tasks/runs/{run_id}/result`

### Python SDK

```python
# Text output (markdown report with citations)
from parallel.types import TaskSpecParam
task_run = client.task_run.create(
    input="Research question",
    processor="pro-fast",
    task_spec=TaskSpecParam(output_schema={"type": "text"}),
)
result = client.task_run.result(task_run.run_id, api_timeout=3600)
print(result.output.content)

# Auto-schema output (structured JSON)
task_run = client.task_run.create(
    input="Research question",
    processor="pro-fast",
)
result = client.task_run.result(task_run.run_id, api_timeout=3600)
print(result.output.content)  # structured dict
print(result.output.basis)    # citations per field
```

### Processors

| Processor | Latency | Cost/1000 | Best For |
|-----------|---------|-----------|----------|
| `lite-fast` | 10-20s | $5 | Basic metadata |
| `base-fast` | 15-50s | $10 | Standard enrichments |
| `core-fast` | 15s-100s | $25 | Cross-referenced |
| `core2x-fast` | 15s-3min | $50 | High complexity |
| **`pro-fast`** | **30s-5min** | **$100** | **Default: exploratory research** |
| `ultra-fast` | 1-10min | $300 | Deep multi-source |
| `ultra2x-fast` | 1-20min | $600 | Difficult research |
| `ultra4x-fast` | 1-40min | $1200 | Very difficult |
| `ultra8x-fast` | 1hr | $2400 | Most difficult |

Standard (non-fast) processors have the same cost but higher latency and freshest data.

---

## Chat API (Beta)

**Endpoint:** `POST https://api.parallel.ai/chat/completions`
**Compatible with OpenAI SDK.**

### Models

| Model | Latency (TTFT) | Cost/1000 | Use Case |
|-------|----------------|-----------|----------|
| `speed` | ~3s | $5 | Low-latency chat |
| `lite` | 10-60s | $5 | Simple lookups with basis |
| `base` | 15-100s | $10 | Standard research with basis |
| `core` | 1-5min | $25 | Complex research with basis |

### Python SDK (OpenAI-compatible)

```python
from openai import OpenAI
client = OpenAI(
    api_key="PARALLEL_API_KEY",
    base_url="https://api.parallel.ai",
)
response = client.chat.completions.create(
    model="speed",
    messages=[{"role": "user", "content": "What is Parallel Web Systems?"}],
)
```

---

## Rate Limits

| API | Default Limit |
|-----|---------------|
| Search | 600 req/min |
| Extract | 600 req/min |
| Chat | 300 req/min |
| Task | Varies by processor |

---

## Source Policy

Control which sources are used in searches:

```json
{
  "source_policy": {
    "allow_domains": ["nature.com", "science.org"],
    "deny_domains": ["unreliable-source.com"],
    "after_date": "2024-01-01"
  }
}
```

Works with Search API and can be used to focus results on specific authoritative domains.
