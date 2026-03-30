---
name: modal
description: Cloud computing platform for running Python on GPUs and serverless infrastructure. Use when deploying AI/ML models, running GPU-accelerated workloads, serving web endpoints, scheduling batch jobs, or scaling Python code to the cloud. Use this skill whenever the user mentions Modal, serverless GPU compute, deploying ML models to the cloud, serving inference endpoints, running batch processing in the cloud, or needs to scale Python workloads beyond their local machine. Also use when the user wants to run code on H100s, A100s, or other cloud GPUs, or needs to create a web API for a model.
license: Apache-2.0
metadata:
  skill-author: K-Dense Inc.
---

# Modal

## Overview

Modal is a cloud platform for running Python code serverlessly, with a focus on AI/ML workloads. Key capabilities:
- **GPU compute** on demand (T4, L4, A10, L40S, A100, H100, H200, B200)
- **Serverless functions** with autoscaling from zero to thousands of containers
- **Custom container images** built entirely in Python code
- **Persistent storage** via Volumes for model weights and datasets
- **Web endpoints** for serving models and APIs
- **Scheduled jobs** via cron or fixed intervals
- **Sub-second cold starts** for low-latency inference

Everything in Modal is defined as code — no YAML, no Dockerfiles required (though both are supported).

## When to Use This Skill

Use this skill when:
- Deploy or serve AI/ML models in the cloud
- Run GPU-accelerated computations (training, inference, fine-tuning)
- Create serverless web APIs or endpoints
- Scale batch processing jobs in parallel
- Schedule recurring tasks (data pipelines, retraining, scraping)
- Need persistent cloud storage for model weights or datasets
- Want to run code in custom container environments
- Build job queues or async task processing systems

## Installation and Authentication

### Install

```bash
uv pip install modal
```

### Authenticate

Prefer existing credentials before creating new ones:

1. Check whether `MODAL_TOKEN_ID` and `MODAL_TOKEN_SECRET` are already present in the current environment.
2. If not, check for those values in a local `.env` file and load them if appropriate for the workflow.
3. Only fall back to interactive `modal setup` or generating fresh tokens if neither source already provides credentials.

```bash
modal setup
```

This opens a browser for authentication. For CI/CD or headless environments, use environment variables:

```bash
export MODAL_TOKEN_ID=<your-token-id>
export MODAL_TOKEN_SECRET=<your-token-secret>
```

If tokens are not already available in the environment or `.env`, generate them at https://modal.com/settings

Modal offers a free tier with $30/month in credits.

**Reference**: See `references/getting-started.md` for detailed setup and first app walkthrough.

## Core Concepts

### App and Functions

A Modal `App` groups related functions. Functions decorated with `@app.function()` run remotely in the cloud:

```python
import modal

app = modal.App("my-app")

@app.function()
def square(x):
    return x ** 2

@app.local_entrypoint()
def main():
    # .remote() runs in the cloud
    print(square.remote(42))
```

Run with `modal run script.py`. Deploy with `modal deploy script.py`.

**Reference**: See `references/functions.md` for lifecycle hooks, classes, `.map()`, `.spawn()`, and more.

### Container Images

Modal builds container images from Python code. The recommended package installer is `uv`:

```python
image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install("torch==2.8.0", "transformers", "accelerate")
    .apt_install("git")
)

@app.function(image=image)
def inference(prompt):
    from transformers import pipeline
    pipe = pipeline("text-generation", model="meta-llama/Llama-3-8B")
    return pipe(prompt)
```

Key image methods:
- `.uv_pip_install()` — Install Python packages with uv (recommended)
- `.pip_install()` — Install with pip (fallback)
- `.apt_install()` — Install system packages
- `.run_commands()` — Run shell commands during build
- `.run_function()` — Run Python during build (e.g., download model weights)
- `.add_local_python_source()` — Add local modules
- `.env()` — Set environment variables

**Reference**: See `references/images.md` for Dockerfiles, micromamba, caching, GPU build steps.

### GPU Compute

Request GPUs via the `gpu` parameter:

```python
@app.function(gpu="H100")
def train_model():
    import torch
    device = torch.device("cuda")
    # GPU training code here

# Multiple GPUs
@app.function(gpu="H100:4")
def distributed_training():
    ...

# GPU fallback chain
@app.function(gpu=["H100", "A100-80GB", "A100-40GB"])
def flexible_inference():
    ...
```

Available GPUs: T4, L4, A10, L40S, A100-40GB, A100-80GB, H100, H200, B200, B200+

- Up to 8 GPUs per container (except A10: up to 4)
- L40S is recommended for inference (cost/performance balance, 48 GB VRAM)
- H100/A100 can be auto-upgraded to H200/A100-80GB at no extra cost
- Use `gpu="H100!"` to prevent auto-upgrade

**Reference**: See `references/gpu.md` for GPU selection guidance and multi-GPU training.

### Volumes (Persistent Storage)

Volumes provide distributed, persistent file storage:

```python
vol = modal.Volume.from_name("model-weights", create_if_missing=True)

@app.function(volumes={"/data": vol})
def save_model():
    # Write to the mounted path
    with open("/data/model.pt", "wb") as f:
        torch.save(model.state_dict(), f)

@app.function(volumes={"/data": vol})
def load_model():
    model.load_state_dict(torch.load("/data/model.pt"))
```

- Optimized for write-once, read-many workloads (model weights, datasets)
- CLI access: `modal volume ls`, `modal volume put`, `modal volume get`
- Background auto-commits every few seconds

**Reference**: See `references/volumes.md` for v2 volumes, concurrent writes, and best practices.

### Secrets

Securely pass credentials to functions:

```python
@app.function(secrets=[modal.Secret.from_name("my-api-keys")])
def call_api():
    import os
    api_key = os.environ["API_KEY"]
    # Use the key
```

Create secrets via CLI: `modal secret create my-api-keys API_KEY=sk-xxx`

Or from a `.env` file: `modal.Secret.from_dotenv()`

**Reference**: See `references/secrets.md` for dashboard setup, multiple secrets, and templates.

### Web Endpoints

Serve models and APIs as web endpoints:

```python
@app.function()
@modal.fastapi_endpoint()
def predict(text: str):
    return {"result": model.predict(text)}
```

- `modal serve script.py` — Development with hot reload and temporary URL
- `modal deploy script.py` — Production deployment with permanent URL
- Supports FastAPI, ASGI (Starlette, FastHTML), WSGI (Flask, Django), WebSockets
- Request bodies up to 4 GiB, unlimited response size

**Reference**: See `references/web-endpoints.md` for ASGI/WSGI apps, streaming, auth, and WebSockets.

### Scheduled Jobs

Run functions on a schedule:

```python
@app.function(schedule=modal.Cron("0 9 * * *"))  # Daily at 9 AM UTC
def daily_pipeline():
    # ETL, retraining, scraping, etc.
    ...

@app.function(schedule=modal.Period(hours=6))
def periodic_check():
    ...
```

Deploy with `modal deploy script.py` to activate the schedule.

- `modal.Cron("...")` — Standard cron syntax, stable across deploys
- `modal.Period(hours=N)` — Fixed interval, resets on redeploy
- Monitor runs in the Modal dashboard

**Reference**: See `references/scheduled-jobs.md` for cron syntax and management.

### Scaling and Concurrency

Modal autoscales containers automatically. Configure limits:

```python
@app.function(
    max_containers=100,    # Upper limit
    min_containers=2,      # Keep warm for low latency
    buffer_containers=5,   # Reserve capacity
    scaledown_window=300,  # Idle seconds before shutdown
)
def process(data):
    ...
```

Process inputs in parallel with `.map()`:

```python
results = list(process.map([item1, item2, item3, ...]))
```

Enable concurrent request handling per container:

```python
@app.function()
@modal.concurrent(max_inputs=10)
async def handle_request(req):
    ...
```

**Reference**: See `references/scaling.md` for `.map()`, `.starmap()`, `.spawn()`, and limits.

### Resource Configuration

```python
@app.function(
    cpu=4.0,              # Physical cores (not vCPUs)
    memory=16384,         # MiB
    ephemeral_disk=51200, # MiB (up to 3 TiB)
    timeout=3600,         # Seconds
)
def heavy_computation():
    ...
```

Defaults: 0.125 CPU cores, 128 MiB memory. Billed on max(request, usage).

**Reference**: See `references/resources.md` for limits and billing details.

## Classes with Lifecycle Hooks

For stateful workloads (e.g., loading a model once and serving many requests):

```python
@app.cls(gpu="L40S", image=image)
class Predictor:
    @modal.enter()
    def load_model(self):
        self.model = load_heavy_model()  # Runs once on container start

    @modal.method()
    def predict(self, text: str):
        return self.model(text)

    @modal.exit()
    def cleanup(self):
        ...  # Runs on container shutdown
```

Call with: `Predictor().predict.remote("hello")`

## Common Workflow Patterns

### GPU Model Inference Service

```python
import modal

app = modal.App("llm-service")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install("vllm")
)

@app.cls(gpu="H100", image=image, min_containers=1)
class LLMService:
    @modal.enter()
    def load(self):
        from vllm import LLM
        self.llm = LLM(model="meta-llama/Llama-3-70B")

    @modal.method()
    @modal.fastapi_endpoint(method="POST")
    def generate(self, prompt: str, max_tokens: int = 256):
        outputs = self.llm.generate([prompt], max_tokens=max_tokens)
        return {"text": outputs[0].outputs[0].text}
```

### Batch Processing Pipeline

```python
app = modal.App("batch-pipeline")
vol = modal.Volume.from_name("pipeline-data", create_if_missing=True)

@app.function(volumes={"/data": vol}, cpu=4.0, memory=8192)
def process_chunk(chunk_id: int):
    import pandas as pd
    df = pd.read_parquet(f"/data/input/chunk_{chunk_id}.parquet")
    result = heavy_transform(df)
    result.to_parquet(f"/data/output/chunk_{chunk_id}.parquet")
    return len(result)

@app.local_entrypoint()
def main():
    chunk_ids = list(range(100))
    results = list(process_chunk.map(chunk_ids))
    print(f"Processed {sum(results)} total rows")
```

### Scheduled Data Pipeline

```python
app = modal.App("etl-pipeline")

@app.function(
    schedule=modal.Cron("0 */6 * * *"),  # Every 6 hours
    secrets=[modal.Secret.from_name("db-credentials")],
)
def etl_job():
    import os
    db_url = os.environ["DATABASE_URL"]
    # Extract, transform, load
    ...
```

## CLI Reference

| Command | Description |
|---------|-------------|
| `modal setup` | Authenticate with Modal |
| `modal run script.py` | Run a script's local entrypoint |
| `modal serve script.py` | Dev server with hot reload |
| `modal deploy script.py` | Deploy to production |
| `modal volume ls <name>` | List files in a volume |
| `modal volume put <name> <file>` | Upload file to volume |
| `modal volume get <name> <file>` | Download file from volume |
| `modal secret create <name> K=V` | Create a secret |
| `modal secret list` | List secrets |
| `modal app list` | List deployed apps |
| `modal app stop <name>` | Stop a deployed app |

## Reference Files

Detailed documentation for each topic:

- `references/getting-started.md` — Installation, authentication, first app
- `references/functions.md` — Functions, classes, lifecycle hooks, remote execution
- `references/images.md` — Container images, package installation, caching
- `references/gpu.md` — GPU types, selection, multi-GPU, training
- `references/volumes.md` — Persistent storage, file management, v2 volumes
- `references/secrets.md` — Credentials, environment variables, dotenv
- `references/web-endpoints.md` — FastAPI, ASGI/WSGI, streaming, auth, WebSockets
- `references/scheduled-jobs.md` — Cron, periodic schedules, management
- `references/scaling.md` — Autoscaling, concurrency, .map(), limits
- `references/resources.md` — CPU, memory, disk, timeout configuration
- `references/examples.md` — Common use cases and patterns
- `references/api_reference.md` — Key API classes and methods

Read these files when detailed information is needed beyond this overview.
