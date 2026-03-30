---
name: adaptyv
description: Cloud laboratory platform for automated protein testing and validation. Use when designing proteins and needing experimental validation including binding assays, expression testing, thermostability measurements, enzyme activity assays, or protein sequence optimization. Also use for submitting experiments via API, tracking experiment status, downloading results, optimizing protein sequences for better expression using computational tools (NetSolP, SoluProt, SolubleMPNN, ESM), or managing protein design workflows with wet-lab validation.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# Adaptyv

Adaptyv is a cloud laboratory platform that provides automated protein testing and validation services. Submit protein sequences via API or web interface and receive experimental results in approximately 21 days.

## Quick Start

### Authentication Setup

Adaptyv requires API authentication. Set up your credentials:

1. Contact support@adaptyvbio.com to request API access (platform is in alpha/beta)
2. Receive your API access token
3. Set environment variable:

```bash
export ADAPTYV_API_KEY="your_api_key_here"
```

Or create a `.env` file:

```
ADAPTYV_API_KEY=your_api_key_here
```

### Installation

Install the required package using uv:

```bash
uv pip install requests python-dotenv
```

### Basic Usage

Submit protein sequences for testing:

```python
import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ADAPTYV_API_KEY")
base_url = "https://kq5jp7qj7wdqklhsxmovkzn4l40obksv.lambda-url.eu-central-1.on.aws"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

# Submit experiment
response = requests.post(
    f"{base_url}/experiments",
    headers=headers,
    json={
        "sequences": ">protein1\nMKVLWALLGLLGAA...",
        "experiment_type": "binding",
        "webhook_url": "https://your-webhook.com/callback"
    }
)

experiment_id = response.json()["experiment_id"]
```

## Available Experiment Types
Adaptyv supports multiple assay types:
- **Binding assays** - Test protein-target interactions using biolayer interferometry
- **Expression testing** - Measure protein expression levels
- **Thermostability** - Characterize protein thermal stability
- **Enzyme activity** - Assess enzymatic function

See `reference/experiments.md` for detailed information on each experiment type and workflows.

## Protein Sequence Optimization
Before submitting sequences, optimize them for better expression and stability:

**Common issues to address:**
- Unpaired cysteines that create unwanted disulfides
- Excessive hydrophobic regions causing aggregation
- Poor solubility predictions

**Recommended tools:**
- NetSolP / SoluProt - Initial solubility filtering
- SolubleMPNN - Sequence redesign for improved solubility
- ESM - Sequence likelihood scoring
- ipTM - Interface stability assessment
- pSAE - Hydrophobic exposure quantification

See `reference/protein_optimization.md` for detailed optimization workflows and tool usage.

## API Reference
For complete API documentation including all endpoints, request/response formats, and authentication details, see `reference/api_reference.md`.

## Examples
For concrete code examples covering common use cases (experiment submission, status tracking, result retrieval, batch processing), see `reference/examples.md`.

## Important Notes
- Platform is currently in alpha/beta phase with features subject to change
- Not all platform features are available via API yet
- Results typically delivered in ~21 days
- Contact support@adaptyvbio.com for access requests or questions
- Suitable for high-throughput AI-driven protein design workflows

