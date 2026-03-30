# Forge API Reference

## Overview

Forge is EvolutionaryScale's cloud platform for scalable protein design and inference. It provides API access to the full ESM3 model family, including large models not available for local execution.

**Key Benefits:**
- Access to all ESM3 models including 98B parameter version
- No local GPU requirements
- Scalable batch processing
- Automatic updates to latest models
- Production-ready infrastructure
- Async/concurrent request support

## Getting Started

### 1. Obtain API Token

Sign up and get your API token at: https://forge.evolutionaryscale.ai

### 2. Install ESM SDK

```bash
pip install esm
```

The Forge client is included in the standard ESM package.

### 3. Basic Connection

```python
from esm.sdk.forge import ESM3ForgeInferenceClient
from esm.sdk.api import ESMProtein, GenerationConfig

# Initialize client
client = ESM3ForgeInferenceClient(
    model="esm3-medium-2024-08",
    url="https://forge.evolutionaryscale.ai",
    token="<your-token-here>"
)

# Test connection
protein = ESMProtein(sequence="MPRT___KEND")
result = client.generate(protein, GenerationConfig(track="sequence", num_steps=8))
print(result.sequence)
```

## Available Models

| Model ID | Parameters | Speed | Quality | Use Case |
|----------|-----------|-------|---------|----------|
| `esm3-small-2024-08` | 1.4B | Fastest | Good | Rapid prototyping, testing |
| `esm3-medium-2024-08` | 7B | Fast | Excellent | Production, most applications |
| `esm3-large-2024-03` | 98B | Slower | Best | Research, critical designs |
| `esm3-medium-multimer-2024-09` | 7B | Fast | Experimental | Protein complexes |

**Model Selection Guidelines:**

- **Development/Testing**: Use `esm3-small-2024-08` for quick iteration
- **Production**: Use `esm3-medium-2024-08` for best balance
- **Research/Critical**: Use `esm3-large-2024-03` for highest quality
- **Complexes**: Use `esm3-medium-multimer-2024-09` (experimental)

## ESM3ForgeInferenceClient API

### Initialization

```python
from esm.sdk.forge import ESM3ForgeInferenceClient

# Basic initialization
client = ESM3ForgeInferenceClient(
    model="esm3-medium-2024-08",
    token="<your-token>"
)

# With custom URL (for enterprise deployments)
client = ESM3ForgeInferenceClient(
    model="esm3-medium-2024-08",
    url="https://custom.forge.instance.com",
    token="<your-token>"
)

# With timeout configuration
client = ESM3ForgeInferenceClient(
    model="esm3-medium-2024-08",
    token="<your-token>",
    timeout=300  # 5 minutes
)
```

### Synchronous Generation

Standard blocking generation calls:

```python
from esm.sdk.api import ESMProtein, GenerationConfig

# Basic generation
protein = ESMProtein(sequence="MPRT___KEND")
config = GenerationConfig(track="sequence", num_steps=8)

result = client.generate(protein, config)
print(f"Generated: {result.sequence}")
```

### Asynchronous Generation

For concurrent processing of multiple proteins:

```python
import asyncio
from esm.sdk.api import ESMProtein, GenerationConfig

async def generate_many(client, proteins):
    """Generate multiple proteins concurrently."""
    tasks = []

    for protein in proteins:
        task = client.async_generate(
            protein,
            GenerationConfig(track="sequence", num_steps=8)
        )
        tasks.append(task)

    results = await asyncio.gather(*tasks)
    return results

# Usage
proteins = [
    ESMProtein(sequence=f"MPRT{'_' * 10}KEND"),
    ESMProtein(sequence=f"AGLV{'_' * 10}HSPQ"),
    ESMProtein(sequence=f"KEIT{'_' * 10}NDFL")
]

results = asyncio.run(generate_many(client, proteins))
print(f"Generated {len(results)} proteins")
```

### Batch Processing with BatchExecutor

For large-scale processing with automatic concurrency management:

```python
from esm.sdk.forge import BatchExecutor
from esm.sdk.api import ESMProtein, GenerationConfig

# Create batch executor
executor = BatchExecutor(
    client=client,
    max_concurrent=10  # Process 10 requests concurrently
)

# Prepare batch of proteins
proteins = [ESMProtein(sequence=f"MPRT{'_' * 50}KEND") for _ in range(100)]
config = GenerationConfig(track="sequence", num_steps=25)

# Submit batch
batch_results = executor.submit_batch(
    proteins=proteins,
    config=config,
    progress_callback=lambda i, total: print(f"Processed {i}/{total}")
)

print(f"Completed {len(batch_results)} generations")
```

## Rate Limiting and Quotas

### Understanding Limits

Forge implements rate limiting based on:
- Requests per minute (RPM)
- Tokens per minute (TPM)
- Concurrent requests

**Typical Limits (subject to change):**
- Free tier: 60 RPM, 5 concurrent
- Pro tier: 300 RPM, 20 concurrent
- Enterprise: Custom limits

### Handling Rate Limits

```python
import time
from requests.exceptions import HTTPError

def generate_with_retry(client, protein, config, max_retries=3):
    """Generate with automatic retry on rate limit."""
    for attempt in range(max_retries):
        try:
            return client.generate(protein, config)
        except HTTPError as e:
            if e.response.status_code == 429:  # Rate limit
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"Rate limited, waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise
    raise Exception("Max retries exceeded")

# Usage
result = generate_with_retry(client, protein, config)
```

### Implementing Custom Rate Limiter

```python
import time
from collections import deque

class RateLimiter:
    """Simple rate limiter for API calls."""

    def __init__(self, max_per_minute=60):
        self.max_per_minute = max_per_minute
        self.calls = deque()

    def wait_if_needed(self):
        """Wait if rate limit would be exceeded."""
        now = time.time()

        # Remove old calls
        while self.calls and self.calls[0] < now - 60:
            self.calls.popleft()

        # Wait if at limit
        if len(self.calls) >= self.max_per_minute:
            sleep_time = 60 - (now - self.calls[0])
            if sleep_time > 0:
                time.sleep(sleep_time)
            self.calls.popleft()

        self.calls.append(now)

# Usage
limiter = RateLimiter(max_per_minute=60)

for protein in proteins:
    limiter.wait_if_needed()
    result = client.generate(protein, config)
```

## Advanced Patterns

### Streaming Results

Process results as they complete:

```python
import asyncio
from concurrent.futures import ThreadPoolExecutor

async def stream_generate(client, proteins, config):
    """Stream results as they complete."""
    pending = {
        asyncio.create_task(client.async_generate(p, config)): i
        for i, p in enumerate(proteins)
    }

    results = [None] * len(proteins)

    while pending:
        done, pending = await asyncio.wait(
            pending.keys(),
            return_when=asyncio.FIRST_COMPLETED
        )

        for task in done:
            idx = pending.pop(task)
            result = await task
            results[idx] = result
            yield idx, result

# Usage
async def process_stream():
    async for idx, result in stream_generate(client, proteins, config):
        print(f"Completed protein {idx}: {result.sequence[:20]}...")

asyncio.run(process_stream())
```

### Batch with Progress Tracking

```python
from tqdm import tqdm
import asyncio

async def batch_with_progress(client, proteins, config):
    """Process batch with progress bar."""
    results = []

    with tqdm(total=len(proteins)) as pbar:
        for protein in proteins:
            result = await client.async_generate(protein, config)
            results.append(result)
            pbar.update(1)

    return results

# Usage
results = asyncio.run(batch_with_progress(client, proteins, config))
```

### Checkpoint and Resume

For long-running batch jobs:

```python
import pickle
import os

class CheckpointedBatchProcessor:
    """Batch processor with checkpoint/resume capability."""

    def __init__(self, client, checkpoint_file="checkpoint.pkl"):
        self.client = client
        self.checkpoint_file = checkpoint_file
        self.completed = self.load_checkpoint()

    def load_checkpoint(self):
        if os.path.exists(self.checkpoint_file):
            with open(self.checkpoint_file, 'rb') as f:
                return pickle.load(f)
        return {}

    def save_checkpoint(self):
        with open(self.checkpoint_file, 'wb') as f:
            pickle.dump(self.completed, f)

    def process_batch(self, proteins, config):
        """Process batch with checkpointing."""
        results = {}

        for i, protein in enumerate(proteins):
            # Skip if already completed
            if i in self.completed:
                results[i] = self.completed[i]
                continue

            try:
                result = self.client.generate(protein, config)
                results[i] = result
                self.completed[i] = result

                # Save checkpoint every 10 items
                if i % 10 == 0:
                    self.save_checkpoint()

            except Exception as e:
                print(f"Error processing {i}: {e}")
                self.save_checkpoint()
                raise

        self.save_checkpoint()
        return results

# Usage
processor = CheckpointedBatchProcessor(client)
results = processor.process_batch(proteins, config)
```

## Error Handling

### Common Errors and Solutions

```python
from requests.exceptions import HTTPError, ConnectionError, Timeout

def robust_generate(client, protein, config):
    """Generate with comprehensive error handling."""
    try:
        return client.generate(protein, config)

    except HTTPError as e:
        if e.response.status_code == 401:
            raise ValueError("Invalid API token")
        elif e.response.status_code == 429:
            raise ValueError("Rate limit exceeded - slow down requests")
        elif e.response.status_code == 500:
            raise ValueError("Server error - try again later")
        else:
            raise

    except ConnectionError:
        raise ValueError("Network error - check internet connection")

    except Timeout:
        raise ValueError("Request timeout - try smaller protein or increase timeout")

    except Exception as e:
        raise ValueError(f"Unexpected error: {str(e)}")

# Usage with retry logic
def generate_with_full_retry(client, protein, config, max_retries=3):
    """Combine error handling with retry logic."""
    for attempt in range(max_retries):
        try:
            return robust_generate(client, protein, config)
        except ValueError as e:
            if "rate limit" in str(e).lower() and attempt < max_retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise
```

## Cost Optimization

### Strategies to Reduce Costs

**1. Use Appropriate Model Size:**

```python
# Use smaller model for testing
dev_client = ESM3ForgeInferenceClient(
    model="esm3-small-2024-08",
    token=token
)

# Use larger model only for final generation
prod_client = ESM3ForgeInferenceClient(
    model="esm3-large-2024-03",
    token=token
)
```

**2. Cache Results:**

```python
import hashlib
import json

class ForgeCache:
    """Cache Forge API results locally."""

    def __init__(self, cache_dir="forge_cache"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)

    def get_cache_key(self, protein, config):
        """Generate cache key from inputs."""
        data = {
            'sequence': protein.sequence,
            'config': str(config)
        }
        return hashlib.md5(json.dumps(data, sort_keys=True).encode()).hexdigest()

    def get(self, protein, config):
        """Get cached result."""
        key = self.get_cache_key(protein, config)
        path = os.path.join(self.cache_dir, f"{key}.pkl")

        if os.path.exists(path):
            with open(path, 'rb') as f:
                return pickle.load(f)
        return None

    def set(self, protein, config, result):
        """Cache result."""
        key = self.get_cache_key(protein, config)
        path = os.path.join(self.cache_dir, f"{key}.pkl")

        with open(path, 'wb') as f:
            pickle.dump(result, f)

# Usage
cache = ForgeCache()

def cached_generate(client, protein, config):
    """Generate with caching."""
    cached = cache.get(protein, config)
    if cached:
        return cached

    result = client.generate(protein, config)
    cache.set(protein, config, result)
    return result
```

**3. Batch Similar Requests:**

Group similar generation tasks to reduce overhead:

```python
def batch_similar_tasks(proteins, max_batch_size=50):
    """Group proteins by similar properties."""
    # Sort by length for efficient processing
    sorted_proteins = sorted(proteins, key=lambda p: len(p.sequence))

    batches = []
    current_batch = []

    for protein in sorted_proteins:
        current_batch.append(protein)

        if len(current_batch) >= max_batch_size:
            batches.append(current_batch)
            current_batch = []

    if current_batch:
        batches.append(current_batch)

    return batches
```

## Monitoring and Logging

### Track API Usage

```python
import logging
from datetime import datetime

class ForgeMonitor:
    """Monitor Forge API usage."""

    def __init__(self):
        self.calls = []
        self.errors = []

    def log_call(self, model, protein_length, duration, success=True, error=None):
        """Log API call."""
        entry = {
            'timestamp': datetime.now(),
            'model': model,
            'protein_length': protein_length,
            'duration': duration,
            'success': success,
            'error': str(error) if error else None
        }

        if success:
            self.calls.append(entry)
        else:
            self.errors.append(entry)

    def get_stats(self):
        """Get usage statistics."""
        total_calls = len(self.calls) + len(self.errors)
        success_rate = len(self.calls) / total_calls if total_calls > 0 else 0
        avg_duration = sum(c['duration'] for c in self.calls) / len(self.calls) if self.calls else 0

        return {
            'total_calls': total_calls,
            'successful': len(self.calls),
            'failed': len(self.errors),
            'success_rate': success_rate,
            'avg_duration': avg_duration
        }

# Usage
monitor = ForgeMonitor()

def monitored_generate(client, protein, config):
    """Generate with monitoring."""
    start = time.time()

    try:
        result = client.generate(protein, config)
        duration = time.time() - start
        monitor.log_call(
            model=client.model,
            protein_length=len(protein.sequence),
            duration=duration,
            success=True
        )
        return result

    except Exception as e:
        duration = time.time() - start
        monitor.log_call(
            model=client.model,
            protein_length=len(protein.sequence),
            duration=duration,
            success=False,
            error=e
        )
        raise

# Check stats
print(monitor.get_stats())
```

## AWS SageMaker Deployment

For dedicated infrastructure and enterprise use:

### Deployment Options

1. **AWS Marketplace Listing**: Deploy ESM3 via AWS SageMaker Marketplace
2. **Custom Endpoint**: Configure dedicated inference endpoint
3. **Batch Transform**: Use SageMaker Batch Transform for large-scale processing

### Benefits

- Dedicated compute resources
- No rate limiting beyond your infrastructure
- Data stays in your AWS environment
- Integration with AWS services
- Custom instance types and scaling

**More Information:**
- AWS Marketplace: https://aws.amazon.com/marketplace/seller-profile?id=seller-iw2nbscescndm
- Contact EvolutionaryScale for enterprise licensing

## Best Practices Summary

1. **Authentication**: Store tokens securely (environment variables, secrets manager)
2. **Rate Limiting**: Implement exponential backoff and respect limits
3. **Error Handling**: Always handle network errors and retries
4. **Caching**: Cache results for repeated queries
5. **Model Selection**: Use appropriate model size for task
6. **Batch Processing**: Use async/batch processing for multiple proteins
7. **Monitoring**: Track usage and costs
8. **Checkpointing**: Save progress for long-running jobs

## Troubleshooting

### Connection Issues

```python
# Test connection
try:
    client = ESM3ForgeInferenceClient(model="esm3-medium-2024-08", token=token)
    test_protein = ESMProtein(sequence="MPRTK")
    result = client.generate(test_protein, GenerationConfig(track="sequence", num_steps=1))
    print("Connection successful!")
except Exception as e:
    print(f"Connection failed: {e}")
```

### Token Validation

```python
def validate_token(token):
    """Validate API token."""
    try:
        client = ESM3ForgeInferenceClient(
            model="esm3-small-2024-08",
            token=token
        )
        # Make minimal test call
        test = ESMProtein(sequence="MPR")
        client.generate(test, GenerationConfig(track="sequence", num_steps=1))
        return True
    except HTTPError as e:
        if e.response.status_code == 401:
            return False
        raise
```

## Additional Resources

- **Forge Platform**: https://forge.evolutionaryscale.ai
- **API Documentation**: Check Forge dashboard for latest API specs
- **Community Support**: Slack community at https://bit.ly/3FKwcWd
- **Enterprise Contact**: Contact EvolutionaryScale for custom deployments
