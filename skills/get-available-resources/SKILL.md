---
name: get-available-resources
description: This skill should be used at the start of any computationally intensive scientific task to detect and report available system resources (CPU cores, GPUs, memory, disk space). It creates a JSON file with resource information and strategic recommendations that inform computational approach decisions such as whether to use parallel processing (joblib, multiprocessing), out-of-core computing (Dask, Zarr), GPU acceleration (PyTorch, JAX), or memory-efficient strategies. Use this skill before running analyses, training models, processing large datasets, or any task where resource constraints matter.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# Get Available Resources

## Overview

Detect available computational resources and generate strategic recommendations for scientific computing tasks. This skill automatically identifies CPU capabilities, GPU availability (NVIDIA CUDA, AMD ROCm, Apple Silicon Metal), memory constraints, and disk space to help make informed decisions about computational approaches.

## When to Use This Skill

Use this skill proactively before any computationally intensive task:

- **Before data analysis**: Determine if datasets can be loaded into memory or require out-of-core processing
- **Before model training**: Check if GPU acceleration is available and which backend to use
- **Before parallel processing**: Identify optimal number of workers for joblib, multiprocessing, or Dask
- **Before large file operations**: Verify sufficient disk space and appropriate storage strategies
- **At project initialization**: Understand baseline capabilities for making architectural decisions

**Example scenarios:**
- "Help me analyze this 50GB genomics dataset" → Use this skill first to determine if Dask/Zarr are needed
- "Train a neural network on this data" → Use this skill to detect available GPUs and backends
- "Process 10,000 files in parallel" → Use this skill to determine optimal worker count
- "Run a computationally intensive simulation" → Use this skill to understand resource constraints

## How This Skill Works

### Resource Detection

The skill runs `scripts/detect_resources.py` to automatically detect:

1. **CPU Information**
   - Physical and logical core counts
   - Processor architecture and model
   - CPU frequency information

2. **GPU Information**
   - NVIDIA GPUs: Detects via nvidia-smi, reports VRAM, driver version, compute capability
   - AMD GPUs: Detects via rocm-smi
   - Apple Silicon: Detects M1/M2/M3/M4 chips with Metal support and unified memory

3. **Memory Information**
   - Total and available RAM
   - Current memory usage percentage
   - Swap space availability

4. **Disk Space Information**
   - Total and available disk space for working directory
   - Current usage percentage

5. **Operating System Information**
   - OS type (macOS, Linux, Windows)
   - OS version and release
   - Python version

### Output Format

The skill generates a `.claude_resources.json` file in the current working directory containing:

```json
{
  "timestamp": "2025-10-23T10:30:00",
  "os": {
    "system": "Darwin",
    "release": "25.0.0",
    "machine": "arm64"
  },
  "cpu": {
    "physical_cores": 8,
    "logical_cores": 8,
    "architecture": "arm64"
  },
  "memory": {
    "total_gb": 16.0,
    "available_gb": 8.5,
    "percent_used": 46.9
  },
  "disk": {
    "total_gb": 500.0,
    "available_gb": 200.0,
    "percent_used": 60.0
  },
  "gpu": {
    "nvidia_gpus": [],
    "amd_gpus": [],
    "apple_silicon": {
      "name": "Apple M2",
      "type": "Apple Silicon",
      "backend": "Metal",
      "unified_memory": true
    },
    "total_gpus": 1,
    "available_backends": ["Metal"]
  },
  "recommendations": {
    "parallel_processing": {
      "strategy": "high_parallelism",
      "suggested_workers": 6,
      "libraries": ["joblib", "multiprocessing", "dask"]
    },
    "memory_strategy": {
      "strategy": "moderate_memory",
      "libraries": ["dask", "zarr"],
      "note": "Consider chunking for datasets > 2GB"
    },
    "gpu_acceleration": {
      "available": true,
      "backends": ["Metal"],
      "suggested_libraries": ["pytorch-mps", "tensorflow-metal", "jax-metal"]
    },
    "large_data_handling": {
      "strategy": "disk_abundant",
      "note": "Sufficient space for large intermediate files"
    }
  }
}
```

### Strategic Recommendations

The skill generates context-aware recommendations:

**Parallel Processing Recommendations:**
- **High parallelism (8+ cores)**: Use Dask, joblib, or multiprocessing with workers = cores - 2
- **Moderate parallelism (4-7 cores)**: Use joblib or multiprocessing with workers = cores - 1
- **Sequential (< 4 cores)**: Prefer sequential processing to avoid overhead

**Memory Strategy Recommendations:**
- **Memory constrained (< 4GB available)**: Use Zarr, Dask, or H5py for out-of-core processing
- **Moderate memory (4-16GB available)**: Use Dask/Zarr for datasets > 2GB
- **Memory abundant (> 16GB available)**: Can load most datasets into memory directly

**GPU Acceleration Recommendations:**
- **NVIDIA GPUs detected**: Use PyTorch, TensorFlow, JAX, CuPy, or RAPIDS
- **AMD GPUs detected**: Use PyTorch-ROCm or TensorFlow-ROCm
- **Apple Silicon detected**: Use PyTorch with MPS backend, TensorFlow-Metal, or JAX-Metal
- **No GPU detected**: Use CPU-optimized libraries

**Large Data Handling Recommendations:**
- **Disk constrained (< 10GB)**: Use streaming or compression strategies
- **Moderate disk (10-100GB)**: Use Zarr, H5py, or Parquet formats
- **Disk abundant (> 100GB)**: Can create large intermediate files freely

## Usage Instructions

### Step 1: Run Resource Detection

Execute the detection script at the start of any computationally intensive task:

```bash
python scripts/detect_resources.py
```

Optional arguments:
- `-o, --output <path>`: Specify custom output path (default: `.claude_resources.json`)
- `-v, --verbose`: Print full resource information to stdout

### Step 2: Read and Apply Recommendations

After running detection, read the generated `.claude_resources.json` file to inform computational decisions:

```python
# Example: Use recommendations in code
import json

with open('.claude_resources.json', 'r') as f:
    resources = json.load(f)

# Check parallel processing strategy
if resources['recommendations']['parallel_processing']['strategy'] == 'high_parallelism':
    n_jobs = resources['recommendations']['parallel_processing']['suggested_workers']
    # Use joblib, Dask, or multiprocessing with n_jobs workers

# Check memory strategy
if resources['recommendations']['memory_strategy']['strategy'] == 'memory_constrained':
    # Use Dask, Zarr, or H5py for out-of-core processing
    import dask.array as da
    # Load data in chunks

# Check GPU availability
if resources['recommendations']['gpu_acceleration']['available']:
    backends = resources['recommendations']['gpu_acceleration']['backends']
    # Use appropriate GPU library based on available backend
```

### Step 3: Make Informed Decisions

Use the resource information and recommendations to make strategic choices:

**For data loading:**
```python
memory_available_gb = resources['memory']['available_gb']
dataset_size_gb = 10

if dataset_size_gb > memory_available_gb * 0.5:
    # Dataset is large relative to memory, use Dask
    import dask.dataframe as dd
    df = dd.read_csv('large_file.csv')
else:
    # Dataset fits in memory, use pandas
    import pandas as pd
    df = pd.read_csv('large_file.csv')
```

**For parallel processing:**
```python
from joblib import Parallel, delayed

n_jobs = resources['recommendations']['parallel_processing'].get('suggested_workers', 1)

results = Parallel(n_jobs=n_jobs)(
    delayed(process_function)(item) for item in data
)
```

**For GPU acceleration:**
```python
import torch

if 'CUDA' in resources['gpu']['available_backends']:
    device = torch.device('cuda')
elif 'Metal' in resources['gpu']['available_backends']:
    device = torch.device('mps')
else:
    device = torch.device('cpu')

model = model.to(device)
```

## Dependencies

The detection script requires the following Python packages:

```bash
uv pip install psutil
```

All other functionality uses Python standard library modules (json, os, platform, subprocess, sys, pathlib).

## Platform Support

- **macOS**: Full support including Apple Silicon (M1/M2/M3/M4) GPU detection
- **Linux**: Full support including NVIDIA (nvidia-smi) and AMD (rocm-smi) GPU detection
- **Windows**: Full support including NVIDIA GPU detection

## Best Practices

1. **Run early**: Execute resource detection at the start of projects or before major computational tasks
2. **Re-run periodically**: System resources change over time (memory usage, disk space)
3. **Check before scaling**: Verify resources before scaling up parallel workers or data sizes
4. **Document decisions**: Keep the `.claude_resources.json` file in project directories to document resource-aware decisions
5. **Use with versioning**: Different machines have different capabilities; resource files help maintain portability

## Troubleshooting

**GPU not detected:**
- Ensure GPU drivers are installed (nvidia-smi, rocm-smi, or system_profiler for Apple Silicon)
- Check that GPU utilities are in system PATH
- Verify GPU is not in use by other processes

**Script execution fails:**
- Ensure psutil is installed: `uv pip install psutil`
- Check Python version compatibility (Python 3.6+)
- Verify script has execute permissions: `chmod +x scripts/detect_resources.py`

**Inaccurate memory readings:**
- Memory readings are snapshots; actual available memory changes constantly
- Close other applications before detection for accurate "available" memory
- Consider running detection multiple times and averaging results

