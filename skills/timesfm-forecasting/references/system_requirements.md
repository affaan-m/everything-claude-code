# System Requirements for TimesFM

## Hardware Tiers

TimesFM can run on a variety of hardware configurations. This guide helps you
choose the right setup and tune performance for your machine.

### Tier 1: Minimal (CPU-Only, 4–8 GB RAM)

- **Use case**: Light exploration, single-series forecasting, prototyping
- **Model**: TimesFM 2.5 (200M) only
- **Batch size**: `per_core_batch_size=4`
- **Context**: Limit `max_context=512`
- **Expected speed**: ~2–5 seconds per 100-point series

```python
model.compile(timesfm.ForecastConfig(
    max_context=512,
    max_horizon=128,
    per_core_batch_size=4,
    normalize_inputs=True,
    use_continuous_quantile_head=True,
    fix_quantile_crossing=True,
))
```

### Tier 2: Standard (CPU 16 GB or GPU 4–8 GB VRAM)

- **Use case**: Batch forecasting (dozens of series), evaluation, production prototypes
- **Model**: TimesFM 2.5 (200M)
- **Batch size**: `per_core_batch_size=32` (CPU) or `64` (GPU)
- **Context**: `max_context=1024`
- **Expected speed**: ~0.5–1 second per 100-point series (GPU)

```python
model.compile(timesfm.ForecastConfig(
    max_context=1024,
    max_horizon=256,
    per_core_batch_size=64,
    normalize_inputs=True,
    use_continuous_quantile_head=True,
    fix_quantile_crossing=True,
))
```

### Tier 3: Production (GPU 16+ GB VRAM or Apple Silicon 32+ GB)

- **Use case**: Large-scale batch forecasting (thousands of series), long context
- **Model**: TimesFM 2.5 (200M)
- **Batch size**: `per_core_batch_size=128–256`
- **Context**: `max_context=4096` or higher
- **Expected speed**: ~0.1–0.3 seconds per 100-point series

```python
model.compile(timesfm.ForecastConfig(
    max_context=4096,
    max_horizon=256,
    per_core_batch_size=128,
    normalize_inputs=True,
    use_continuous_quantile_head=True,
    fix_quantile_crossing=True,
))
```

### Tier 4: Legacy Models (v1.0/v2.0 — 500M parameters)

- **⚠️ WARNING**: TimesFM v2.0 (500M) requires **≥ 16 GB RAM** (CPU) or **≥ 8 GB VRAM** (GPU)
- **⚠️ WARNING**: TimesFM v1.0 legacy JAX version may require **≥ 32 GB RAM**
- **Recommendation**: Unless you specifically need a legacy checkpoint, use TimesFM 2.5

## Memory Estimation

### CPU Memory (RAM)

Approximate RAM usage during inference:

| Component | TimesFM 2.5 (200M) | TimesFM 2.0 (500M) |
| --------- | ------------------- | ------------------- |
| Model weights | ~800 MB | ~2 GB |
| Runtime overhead | ~500 MB | ~1 GB |
| Input/output buffers | ~200 MB per 1000 series | ~500 MB per 1000 series |
| **Total (small batch)** | **~1.5 GB** | **~3.5 GB** |
| **Total (large batch)** | **~3 GB** | **~6 GB** |

**Formula**: `RAM ≈ model_weights + 0.5 GB + (0.2 MB × num_series × context_length / 1000)`

### GPU Memory (VRAM)

| Component | TimesFM 2.5 (200M) |
| --------- | ------------------- |
| Model weights | ~800 MB |
| KV cache + activations | ~200–500 MB (scales with context) |
| Batch buffers | ~100 MB per 100 series at context=1024 |
| **Total (batch=32)** | **~1.2 GB** |
| **Total (batch=128)** | **~1.8 GB** |
| **Total (batch=256)** | **~2.5 GB** |

### Disk Space

| Item | Size |
| ---- | ---- |
| TimesFM 2.5 safetensors | ~800 MB |
| Hugging Face cache overhead | ~200 MB |
| **Total download** | **~1 GB** |

Model weights are downloaded once from Hugging Face Hub and cached in
`~/.cache/huggingface/` (or `$HF_HOME`).

## GPU Selection Guide

### NVIDIA GPUs (CUDA)

| GPU | VRAM | Recommended batch | Notes |
| --- | ---- | ----------------- | ----- |
| RTX 3060 | 12 GB | 64 | Good entry-level |
| RTX 3090 / 4090 | 24 GB | 256 | Excellent for production |
| A100 (40 GB) | 40 GB | 512 | Cloud/HPC |
| A100 (80 GB) | 80 GB | 1024 | Cloud/HPC |
| T4 | 16 GB | 128 | Cloud (Colab, AWS) |
| V100 | 16–32 GB | 128–256 | Cloud |

### Apple Silicon (MPS)

| Chip | Unified Memory | Recommended batch | Notes |
| ---- | -------------- | ----------------- | ----- |
| M1 | 8–16 GB | 16–32 | Works, slower than CUDA |
| M1 Pro/Max | 16–64 GB | 32–128 | Good performance |
| M2/M3/M4 Pro/Max | 18–128 GB | 64–256 | Excellent |

### CPU Only

Works on any CPU with sufficient RAM. Expect 5–20× slower than GPU.

## Python and Package Requirements

| Requirement | Minimum | Recommended |
| ----------- | ------- | ----------- |
| Python | 3.10 | 3.12+ |
| numpy | 1.26.4 | latest |
| torch | 2.0.0 | latest |
| huggingface_hub | 0.23.0 | latest |
| safetensors | 0.5.3 | latest |

### Optional Dependencies

| Package | Purpose | Install |
| ------- | ------- | ------- |
| jax | Flax backend | `pip install jax[cuda]` |
| flax | Flax backend | `pip install flax` |
| scikit-learn | XReg covariates | `pip install scikit-learn` |

## Operating System Compatibility

| OS | Status | Notes |
| -- | ------ | ----- |
| Linux (Ubuntu 20.04+) | ✅ Fully supported | Best performance with CUDA |
| macOS 13+ (Ventura) | ✅ Fully supported | MPS acceleration on Apple Silicon |
| Windows 11 + WSL2 | ✅ Supported | Use WSL2 for best experience |
| Windows (native) | ⚠️ Partial | PyTorch works, some edge cases |

## Troubleshooting

### Out of Memory (OOM)

```python
# Reduce batch size
model.compile(timesfm.ForecastConfig(
    per_core_batch_size=4,  # Start very small
    max_context=512,        # Reduce context
    ...
))

# Process in chunks
for i in range(0, len(inputs), 50):
    chunk = inputs[i:i+50]
    p, q = model.forecast(horizon=H, inputs=chunk)
```

### Slow Inference on CPU

```python
# Ensure matmul precision is set
import torch
torch.set_float32_matmul_precision("high")

# Use smaller context
model.compile(timesfm.ForecastConfig(
    max_context=256,  # Shorter context = faster
    ...
))
```

### Model Download Fails

```bash
# Set a different cache directory
export HF_HOME=/path/with/more/space

# Or download manually
huggingface-cli download google/timesfm-2.5-200m-pytorch
```
