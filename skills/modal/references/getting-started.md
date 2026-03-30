# Modal Getting Started Guide

## Installation

Install Modal using uv (recommended) or pip:

```bash
# Recommended
uv pip install modal

# Alternative
pip install modal
```

## Authentication

### Interactive Setup

```bash
modal setup
```

This opens a browser for authentication and stores credentials locally.

### Headless / CI/CD Setup

For environments without a browser, use token-based authentication:

1. Generate tokens at https://modal.com/settings
2. Set environment variables:

```bash
export MODAL_TOKEN_ID=<your-token-id>
export MODAL_TOKEN_SECRET=<your-token-secret>
```

Or use the CLI:

```bash
modal token set --token-id <id> --token-secret <secret>
```

### Free Tier

Modal provides $30/month in free credits. No credit card required for the free tier.

## Your First App

### Hello World

Create a file `hello.py`:

```python
import modal

app = modal.App("hello-world")

@app.function()
def greet(name: str) -> str:
    return f"Hello, {name}! This ran in the cloud."

@app.local_entrypoint()
def main():
    result = greet.remote("World")
    print(result)
```

Run it:

```bash
modal run hello.py
```

What happens:
1. Modal packages your code
2. Creates a container in the cloud
3. Executes `greet()` remotely
4. Returns the result to your local machine

### Understanding the Flow

- `modal.App("name")` — Creates a named application
- `@app.function()` — Marks a function for remote execution
- `@app.local_entrypoint()` — Defines the local entry point (runs on your machine)
- `.remote()` — Calls the function in the cloud
- `.local()` — Calls the function locally (for testing)

### Running Modes

| Command | Description |
|---------|-------------|
| `modal run script.py` | Run the `@app.local_entrypoint()` function |
| `modal serve script.py` | Start a dev server with hot reload (for web endpoints) |
| `modal deploy script.py` | Deploy to production (persistent) |

### A Simple Web Scraper

```python
import modal

app = modal.App("web-scraper")

image = modal.Image.debian_slim().uv_pip_install("httpx", "beautifulsoup4")

@app.function(image=image)
def scrape(url: str) -> str:
    import httpx
    from bs4 import BeautifulSoup

    response = httpx.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    return soup.get_text()[:1000]

@app.local_entrypoint()
def main():
    result = scrape.remote("https://example.com")
    print(result)
```

### GPU-Accelerated Inference

```python
import modal

app = modal.App("gpu-inference")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install("torch", "transformers", "accelerate")
)

@app.function(gpu="L40S", image=image)
def generate(prompt: str) -> str:
    from transformers import pipeline
    pipe = pipeline("text-generation", model="gpt2", device="cuda")
    result = pipe(prompt, max_length=100)
    return result[0]["generated_text"]

@app.local_entrypoint()
def main():
    print(generate.remote("The future of AI is"))
```

## Project Structure

Modal apps are typically single Python files, but can be organized into modules:

```
my-project/
├── app.py           # Main app with @app.local_entrypoint()
├── inference.py     # Inference functions
├── training.py      # Training functions
└── common.py        # Shared utilities
```

Use `modal.Image.add_local_python_source()` to include local modules in the container image.

## Key Concepts Summary

| Concept | What It Does |
|---------|-------------|
| `App` | Groups related functions into a deployable unit |
| `Function` | A serverless function backed by autoscaling containers |
| `Image` | Defines the container environment (packages, files) |
| `Volume` | Persistent distributed file storage |
| `Secret` | Secure credential injection |
| `Schedule` | Cron or periodic job scheduling |
| `gpu` | GPU type/count for the function |

## Next Steps

- See `functions.md` for advanced function patterns
- See `images.md` for custom container environments
- See `gpu.md` for GPU selection and configuration
- See `web-endpoints.md` for serving APIs
