# Modal GPU Compute

## Table of Contents

- [Available GPUs](#available-gpus)
- [Requesting GPUs](#requesting-gpus)
- [GPU Selection Guide](#gpu-selection-guide)
- [Multi-GPU](#multi-gpu)
- [GPU Fallback Chains](#gpu-fallback-chains)
- [Auto-Upgrades](#auto-upgrades)
- [Multi-GPU Training](#multi-gpu-training)

## Available GPUs

| GPU | VRAM | Max per Container | Best For |
|-----|------|-------------------|----------|
| T4 | 16 GB | 8 | Budget inference, small models |
| L4 | 24 GB | 8 | Inference, video processing |
| A10 | 24 GB | 4 | Inference, fine-tuning small models |
| L40S | 48 GB | 8 | Inference (best cost/perf), medium models |
| A100-40GB | 40 GB | 8 | Training, large model inference |
| A100-80GB | 80 GB | 8 | Training, large models |
| RTX-PRO-6000 | 48 GB | 8 | Rendering, inference |
| H100 | 80 GB | 8 | Large-scale training, fast inference |
| H200 | 141 GB | 8 | Very large models, training |
| B200 | 192 GB | 8 | Largest models, maximum throughput |
| B200+ | 192 GB | 8 | B200 or B300, B200 pricing |

## Requesting GPUs

### Basic Request

```python
@app.function(gpu="H100")
def train():
    import torch
    assert torch.cuda.is_available()
    print(f"Using: {torch.cuda.get_device_name(0)}")
```

### String Shorthand

```python
gpu="T4"           # Single T4
gpu="A100-80GB"    # Single A100 80GB
gpu="H100:4"       # Four H100s
```

### GPU Object (Advanced)

```python
@app.function(gpu=modal.gpu.H100(count=2))
def multi_gpu():
    ...
```

## GPU Selection Guide

### For Inference

| Model Size | Recommended GPU | Why |
|-----------|----------------|-----|
| < 7B params | T4, L4 | Cost-effective, sufficient VRAM |
| 7B-13B params | L40S | Best cost/performance, 48 GB VRAM |
| 13B-70B params | A100-80GB, H100 | Large VRAM, fast memory bandwidth |
| 70B+ params | H100:2+, H200, B200 | Multi-GPU or very large VRAM |

### For Training

| Task | Recommended GPU |
|------|----------------|
| Fine-tuning (LoRA) | L40S, A100-40GB |
| Full fine-tuning small models | A100-80GB |
| Full fine-tuning large models | H100:4+, H200 |
| Pre-training | H100:8, B200:8 |

### General Recommendation

L40S is the best default for inference workloads — it offers an excellent trade-off of cost and performance with 48 GB of GPU RAM.

## Multi-GPU

Request multiple GPUs by appending `:count`:

```python
@app.function(gpu="H100:4")
def distributed():
    import torch
    print(f"GPUs available: {torch.cuda.device_count()}")
    # All 4 GPUs are on the same physical machine
```

- Up to 8 GPUs for most types (up to 4 for A10)
- All GPUs attach to the same physical machine
- Requesting more than 2 GPUs may result in longer wait times
- Maximum VRAM: 8 x B200 = 1,536 GB

## GPU Fallback Chains

Specify a prioritized list of GPU types:

```python
@app.function(gpu=["H100", "A100-80GB", "L40S"])
def flexible():
    # Modal tries H100 first, then A100-80GB, then L40S
    ...
```

Useful for reducing queue times when a specific GPU isn't available.

## Auto-Upgrades

### H100 → H200

Modal may automatically upgrade H100 requests to H200 at no extra cost. To prevent this:

```python
@app.function(gpu="H100!")  # Exclamation mark prevents auto-upgrade
def must_use_h100():
    ...
```

### A100 → A100-80GB

A100-40GB requests may be upgraded to 80GB at no extra cost.

### B200+

`gpu="B200+"` allows Modal to run on B200 or B300 GPUs at B200 pricing. Requires CUDA 13.0+.

## Multi-GPU Training

Modal supports multi-GPU training on a single node. Multi-node training is in private beta.

### PyTorch DDP Example

```python
@app.function(gpu="H100:4", image=image, timeout=86400)
def train_distributed():
    import torch
    import torch.distributed as dist

    dist.init_process_group(backend="nccl")
    local_rank = int(os.environ.get("LOCAL_RANK", 0))
    device = torch.device(f"cuda:{local_rank}")
    # ... training loop with DDP ...
```

### PyTorch Lightning

When using frameworks that re-execute Python entrypoints (like PyTorch Lightning), either:

1. Set strategy to `ddp_spawn` or `ddp_notebook`
2. Or run training as a subprocess

```python
@app.function(gpu="H100:4", image=image)
def train():
    import subprocess
    subprocess.run(["python", "train_script.py"], check=True)
```

### Hugging Face Accelerate

```python
@app.function(gpu="A100-80GB:4", image=image)
def finetune():
    import subprocess
    subprocess.run([
        "accelerate", "launch",
        "--num_processes", "4",
        "train.py"
    ], check=True)
```
