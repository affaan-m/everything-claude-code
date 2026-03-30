# Distributed Training - Comprehensive Guide

## Overview

PyTorch Lightning provides several strategies for training large models efficiently across multiple GPUs, nodes, and machines. Choose the right strategy based on model size and hardware configuration.

## Strategy Selection Guide

### When to Use Each Strategy

**Regular Training (Single Device)**
- Model size: Any size that fits in single GPU memory
- Use case: Prototyping, small models, debugging

**DDP (Distributed Data Parallel)**
- Model size: <500M parameters (e.g., ResNet50 ~80M parameters)
- When: Weights, activations, optimizer states, and gradients all fit in GPU memory
- Goal: Scale batch size and speed across multiple GPUs
- Best for: Most standard deep learning models

**FSDP (Fully Sharded Data Parallel)**
- Model size: 500M+ parameters (e.g., large transformers like BERT-Large, GPT)
- When: Model doesn't fit in single GPU memory
- Recommended for: Users new to model parallelism or migrating from DDP
- Features: Activation checkpointing, CPU parameter offloading

**DeepSpeed**
- Model size: 500M+ parameters
- When: Need cutting-edge features or already familiar with DeepSpeed
- Features: CPU/disk parameter offloading, distributed checkpoints, fine-grained control
- Trade-off: More complex configuration

## DDP (Distributed Data Parallel)

### Basic Usage

```python
# Single GPU
trainer = L.Trainer(accelerator="gpu", devices=1)

# Multi-GPU on single node (automatic DDP)
trainer = L.Trainer(accelerator="gpu", devices=4)

# Explicit DDP strategy
trainer = L.Trainer(strategy="ddp", accelerator="gpu", devices=4)
```

### Multi-Node DDP

```python
# On each node, run:
trainer = L.Trainer(
    strategy="ddp",
    accelerator="gpu",
    devices=4,  # GPUs per node
    num_nodes=4  # Total nodes
)
```

### DDP Configuration

```python
from lightning.pytorch.strategies import DDPStrategy

trainer = L.Trainer(
    strategy=DDPStrategy(
        process_group_backend="nccl",  # "nccl" for GPU, "gloo" for CPU
        find_unused_parameters=False,   # Set True if model has unused parameters
        gradient_as_bucket_view=True    # More memory efficient
    ),
    accelerator="gpu",
    devices=4
)
```

### DDP Spawn

Use when `ddp` causes issues (slower but more compatible):

```python
trainer = L.Trainer(strategy="ddp_spawn", accelerator="gpu", devices=4)
```

### Best Practices for DDP

1. **Batch size:** Multiply by number of GPUs
   ```python
   # If using 4 GPUs, effective batch size = batch_size * 4
   dm = MyDataModule(batch_size=32)  # 32 * 4 = 128 effective batch size
   ```

2. **Learning rate:** Often scaled with batch size
   ```python
   # Linear scaling rule
   base_lr = 0.001
   num_gpus = 4
   lr = base_lr * num_gpus
   ```

3. **Synchronization:** Use `sync_dist=True` for metrics
   ```python
   self.log("val_loss", loss, sync_dist=True)
   ```

4. **Rank-specific operations:** Use decorators for main process only
   ```python
   from lightning.pytorch.utilities import rank_zero_only

   @rank_zero_only
   def save_results(self):
       # Only runs on main process (rank 0)
       torch.save(self.results, "results.pt")
   ```

## FSDP (Fully Sharded Data Parallel)

### Basic Usage

```python
trainer = L.Trainer(
    strategy="fsdp",
    accelerator="gpu",
    devices=4
)
```

### FSDP Configuration

```python
from lightning.pytorch.strategies import FSDPStrategy
import torch.nn as nn

trainer = L.Trainer(
    strategy=FSDPStrategy(
        # Sharding strategy
        sharding_strategy="FULL_SHARD",  # or "SHARD_GRAD_OP", "NO_SHARD", "HYBRID_SHARD"

        # Activation checkpointing (save memory)
        activation_checkpointing_policy={nn.TransformerEncoderLayer},

        # CPU offloading (save GPU memory, slower)
        cpu_offload=False,

        # Mixed precision
        mixed_precision=True,

        # Wrap policy (auto-wrap layers)
        auto_wrap_policy=None
    ),
    accelerator="gpu",
    devices=8,
    precision="bf16-mixed"
)
```

### Sharding Strategies

**FULL_SHARD (default)**
- Shards optimizer states, gradients, and parameters
- Maximum memory savings
- More communication overhead

**SHARD_GRAD_OP**
- Shards optimizer states and gradients only
- Parameters kept on all devices
- Less memory savings but faster

**NO_SHARD**
- No sharding (equivalent to DDP)
- For comparison or when sharding not needed

**HYBRID_SHARD**
- Combines FULL_SHARD within nodes and NO_SHARD across nodes
- Good for multi-node setups

### Activation Checkpointing

Trade computation for memory:

```python
from lightning.pytorch.strategies import FSDPStrategy
import torch.nn as nn

# Checkpoint specific layer types
trainer = L.Trainer(
    strategy=FSDPStrategy(
        activation_checkpointing_policy={
            nn.TransformerEncoderLayer,
            nn.TransformerDecoderLayer
        }
    )
)
```

### CPU Offloading

Offload parameters to CPU when not in use:

```python
trainer = L.Trainer(
    strategy=FSDPStrategy(
        cpu_offload=True  # Slower but saves GPU memory
    ),
    accelerator="gpu",
    devices=4
)
```

### FSDP with Large Models

```python
from lightning.pytorch.strategies import FSDPStrategy
import torch.nn as nn

class LargeTransformer(L.LightningModule):
    def __init__(self):
        super().__init__()
        self.transformer = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(d_model=4096, nhead=32),
            num_layers=48
        )

    def configure_sharded_model(self):
        # Called by FSDP to wrap model
        pass

# Train
trainer = L.Trainer(
    strategy=FSDPStrategy(
        activation_checkpointing_policy={nn.TransformerEncoderLayer},
        cpu_offload=False,
        sharding_strategy="FULL_SHARD"
    ),
    accelerator="gpu",
    devices=8,
    precision="bf16-mixed",
    max_epochs=10
)

model = LargeTransformer()
trainer.fit(model, datamodule=dm)
```

## DeepSpeed

### Installation

```bash
pip install deepspeed
```

### Basic Usage

```python
trainer = L.Trainer(
    strategy="deepspeed_stage_2",  # or "deepspeed_stage_3"
    accelerator="gpu",
    devices=4,
    precision="16-mixed"
)
```

### DeepSpeed Stages

**Stage 1: Optimizer State Sharding**
- Shards optimizer states
- Moderate memory savings

```python
trainer = L.Trainer(strategy="deepspeed_stage_1")
```

**Stage 2: Optimizer + Gradient Sharding**
- Shards optimizer states and gradients
- Good memory savings

```python
trainer = L.Trainer(strategy="deepspeed_stage_2")
```

**Stage 3: Full Model Sharding (ZeRO-3)**
- Shards optimizer states, gradients, and model parameters
- Maximum memory savings
- Can train very large models

```python
trainer = L.Trainer(strategy="deepspeed_stage_3")
```

**Stage 2 with Offloading**
- Offload to CPU or NVMe

```python
trainer = L.Trainer(strategy="deepspeed_stage_2_offload")
trainer = L.Trainer(strategy="deepspeed_stage_3_offload")
```

### DeepSpeed Configuration File

For fine-grained control:

```python
from lightning.pytorch.strategies import DeepSpeedStrategy

# Create config file: ds_config.json
config = {
    "zero_optimization": {
        "stage": 3,
        "offload_optimizer": {
            "device": "cpu",
            "pin_memory": True
        },
        "offload_param": {
            "device": "cpu",
            "pin_memory": True
        },
        "overlap_comm": True,
        "contiguous_gradients": True,
        "sub_group_size": 1e9,
        "reduce_bucket_size": "auto",
        "stage3_prefetch_bucket_size": "auto",
        "stage3_param_persistence_threshold": "auto",
        "stage3_max_live_parameters": 1e9,
        "stage3_max_reuse_distance": 1e9
    },
    "fp16": {
        "enabled": True,
        "loss_scale": 0,
        "initial_scale_power": 16,
        "loss_scale_window": 1000,
        "hysteresis": 2,
        "min_loss_scale": 1
    },
    "gradient_clipping": 1.0,
    "train_batch_size": "auto",
    "train_micro_batch_size_per_gpu": "auto"
}

trainer = L.Trainer(
    strategy=DeepSpeedStrategy(config=config),
    accelerator="gpu",
    devices=8,
    precision="16-mixed"
)
```

### DeepSpeed Best Practices

1. **Use Stage 2 for models <10B parameters**
2. **Use Stage 3 for models >10B parameters**
3. **Enable offloading if GPU memory is insufficient**
4. **Tune `reduce_bucket_size` for communication efficiency**

## Comparison Table

| Feature | DDP | FSDP | DeepSpeed |
|---------|-----|------|-----------|
| Model Size | <500M params | 500M+ params | 500M+ params |
| Memory Efficiency | Low | High | Very High |
| Speed | Fastest | Fast | Fast |
| Setup Complexity | Simple | Medium | Complex |
| Offloading | No | CPU | CPU + Disk |
| Best For | Standard models | Large models | Very large models |
| Configuration | Minimal | Moderate | Extensive |

## Mixed Precision Training

Use mixed precision to speed up training and save memory:

```python
# FP16 mixed precision
trainer = L.Trainer(precision="16-mixed")

# BFloat16 mixed precision (A100, H100)
trainer = L.Trainer(precision="bf16-mixed")

# Full precision (default)
trainer = L.Trainer(precision="32-true")

# Double precision
trainer = L.Trainer(precision="64-true")
```

### Mixed Precision with Different Strategies

```python
# DDP + FP16
trainer = L.Trainer(
    strategy="ddp",
    accelerator="gpu",
    devices=4,
    precision="16-mixed"
)

# FSDP + BFloat16
trainer = L.Trainer(
    strategy="fsdp",
    accelerator="gpu",
    devices=8,
    precision="bf16-mixed"
)

# DeepSpeed + FP16
trainer = L.Trainer(
    strategy="deepspeed_stage_2",
    accelerator="gpu",
    devices=4,
    precision="16-mixed"
)
```

## Multi-Node Training

### SLURM

```bash
#!/bin/bash
#SBATCH --nodes=4
#SBATCH --gpus-per-node=4
#SBATCH --time=24:00:00

srun python train.py
```

```python
# train.py
trainer = L.Trainer(
    strategy="ddp",
    accelerator="gpu",
    devices=4,
    num_nodes=4
)
```

### Manual Multi-Node Setup

Node 0 (master):
```bash
python train.py --num_nodes=2 --node_rank=0 --master_addr=192.168.1.1 --master_port=12345
```

Node 1:
```bash
python train.py --num_nodes=2 --node_rank=1 --master_addr=192.168.1.1 --master_port=12345
```

```python
# train.py
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--num_nodes", type=int, default=1)
parser.add_argument("--node_rank", type=int, default=0)
parser.add_argument("--master_addr", type=str, default="localhost")
parser.add_argument("--master_port", type=int, default=12345)
args = parser.parse_args()

trainer = L.Trainer(
    strategy="ddp",
    accelerator="gpu",
    devices=4,
    num_nodes=args.num_nodes
)
```

## Common Patterns

### Gradient Accumulation with DDP

```python
# Simulate larger batch size
trainer = L.Trainer(
    strategy="ddp",
    accelerator="gpu",
    devices=4,
    accumulate_grad_batches=4  # Effective batch size = batch_size * devices * 4
)
```

### Model Checkpoint with Distributed Training

```python
from lightning.pytorch.callbacks import ModelCheckpoint

checkpoint_callback = ModelCheckpoint(
    monitor="val_loss",
    save_top_k=3,
    mode="min"
)

trainer = L.Trainer(
    strategy="ddp",
    accelerator="gpu",
    devices=4,
    callbacks=[checkpoint_callback]
)
```

### Reproducibility in Distributed Training

```python
import lightning as L

L.seed_everything(42, workers=True)

trainer = L.Trainer(
    strategy="ddp",
    accelerator="gpu",
    devices=4,
    deterministic=True
)
```

## Troubleshooting

### NCCL Timeout

Increase timeout for slow networks:

```python
import os
os.environ["NCCL_TIMEOUT"] = "3600"  # 1 hour

trainer = L.Trainer(strategy="ddp", accelerator="gpu", devices=4)
```

### CUDA Out of Memory

Solutions:
1. Enable gradient checkpointing
2. Reduce batch size
3. Use FSDP or DeepSpeed
4. Enable CPU offloading
5. Use mixed precision

```python
# Option 1: Gradient checkpointing
class MyModel(L.LightningModule):
    def __init__(self):
        super().__init__()
        self.model = MyTransformer()
        self.model.gradient_checkpointing_enable()

# Option 2: Smaller batch size
dm = MyDataModule(batch_size=16)  # Reduce from 32

# Option 3: FSDP with offloading
trainer = L.Trainer(
    strategy=FSDPStrategy(cpu_offload=True),
    precision="bf16-mixed"
)

# Option 4: Gradient accumulation
trainer = L.Trainer(accumulate_grad_batches=4)
```

### Distributed Sampler Issues

Lightning handles DistributedSampler automatically:

```python
# Don't do this
from torch.utils.data import DistributedSampler
sampler = DistributedSampler(dataset)  # Lightning does this automatically

# Just use shuffle
train_loader = DataLoader(dataset, batch_size=32, shuffle=True)
```

### Communication Overhead

Reduce communication with larger `find_unused_parameters`:

```python
trainer = L.Trainer(
    strategy=DDPStrategy(find_unused_parameters=False),
    accelerator="gpu",
    devices=4
)
```

## Best Practices

### 1. Start with Single GPU
Test your code on single GPU before scaling:

```python
# Debug on single GPU
trainer = L.Trainer(accelerator="gpu", devices=1, fast_dev_run=True)

# Then scale to multiple GPUs
trainer = L.Trainer(accelerator="gpu", devices=4, strategy="ddp")
```

### 2. Use Appropriate Strategy
- <500M params: Use DDP
- 500M-10B params: Use FSDP
- >10B params: Use DeepSpeed Stage 3

### 3. Enable Mixed Precision
Always use mixed precision for modern GPUs:

```python
trainer = L.Trainer(precision="bf16-mixed")  # A100, H100
trainer = L.Trainer(precision="16-mixed")    # V100, T4
```

### 4. Scale Hyperparameters
Adjust learning rate and batch size when scaling:

```python
# Linear scaling rule
lr = base_lr * num_gpus
```

### 5. Sync Metrics
Always sync metrics in distributed training:

```python
self.log("val_loss", loss, sync_dist=True)
```

### 6. Use Rank-Zero Operations
File I/O and expensive operations on main process only:

```python
from lightning.pytorch.utilities import rank_zero_only

@rank_zero_only
def save_predictions(self):
    torch.save(self.predictions, "predictions.pt")
```

### 7. Checkpoint Regularly
Save checkpoints to resume from failures:

```python
checkpoint_callback = ModelCheckpoint(
    save_top_k=3,
    save_last=True,  # Always save last for resuming
    every_n_epochs=5
)
```
