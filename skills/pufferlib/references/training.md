# PufferLib Training Guide

## Overview

PuffeRL is PufferLib's high-performance training algorithm based on CleanRL's PPO with LSTMs, enhanced with proprietary research improvements. It achieves training at millions of steps per second through optimized vectorization and efficient implementation.

## Training Workflow

### Basic Training Loop

The PuffeRL trainer provides three core methods:

```python
# Collect environment interactions
rollout_data = trainer.evaluate()

# Train on collected batch
train_metrics = trainer.train()

# Aggregate and log results
trainer.mean_and_log()
```

### CLI Training

Quick start training via command line:

```bash
# Basic training
puffer train environment_name --train.device cuda --train.learning-rate 0.001

# Custom configuration
puffer train environment_name \
    --train.device cuda \
    --train.batch-size 32768 \
    --train.learning-rate 0.0003 \
    --train.num-iterations 10000
```

### Python Training Script

```python
import pufferlib
from pufferlib import PuffeRL

# Initialize environment
env = pufferlib.make('environment_name', num_envs=256)

# Create trainer
trainer = PuffeRL(
    env=env,
    policy=my_policy,
    device='cuda',
    learning_rate=3e-4,
    batch_size=32768,
    n_epochs=4,
    gamma=0.99,
    gae_lambda=0.95,
    clip_coef=0.2,
    ent_coef=0.01,
    vf_coef=0.5,
    max_grad_norm=0.5
)

# Training loop
for iteration in range(num_iterations):
    # Collect rollouts
    rollout_data = trainer.evaluate()

    # Train on batch
    train_metrics = trainer.train()

    # Log results
    trainer.mean_and_log()
```

## Key Training Parameters

### Core Hyperparameters

- **learning_rate**: Learning rate for optimizer (default: 3e-4)
- **batch_size**: Number of timesteps per training batch (default: 32768)
- **n_epochs**: Number of training epochs per batch (default: 4)
- **num_envs**: Number of parallel environments (default: 256)
- **num_steps**: Steps per environment per rollout (default: 128)

### PPO Parameters

- **gamma**: Discount factor (default: 0.99)
- **gae_lambda**: Lambda for GAE calculation (default: 0.95)
- **clip_coef**: PPO clipping coefficient (default: 0.2)
- **ent_coef**: Entropy coefficient for exploration (default: 0.01)
- **vf_coef**: Value function loss coefficient (default: 0.5)
- **max_grad_norm**: Maximum gradient norm for clipping (default: 0.5)

### Performance Parameters

- **device**: Computing device ('cuda' or 'cpu')
- **compile**: Use torch.compile for faster training (default: True)
- **num_workers**: Number of vectorization workers (default: auto)

## Distributed Training

### Multi-GPU Training

Use torchrun for distributed training across multiple GPUs:

```bash
torchrun --nproc_per_node=4 train.py \
    --train.device cuda \
    --train.batch-size 131072
```

### Multi-Node Training

For distributed training across multiple nodes:

```bash
# On main node (rank 0)
torchrun --nproc_per_node=8 \
    --nnodes=4 \
    --node_rank=0 \
    --master_addr=MASTER_IP \
    --master_port=29500 \
    train.py

# On worker nodes (rank 1, 2, 3)
torchrun --nproc_per_node=8 \
    --nnodes=4 \
    --node_rank=NODE_RANK \
    --master_addr=MASTER_IP \
    --master_port=29500 \
    train.py
```

## Monitoring and Logging

### Logger Integration

PufferLib supports multiple logging backends:

#### Weights & Biases

```python
from pufferlib import WandbLogger

logger = WandbLogger(
    project='my_project',
    entity='my_team',
    name='experiment_name',
    config=trainer_config
)

trainer = PuffeRL(env, policy, logger=logger)
```

#### Neptune

```python
from pufferlib import NeptuneLogger

logger = NeptuneLogger(
    project='my_team/my_project',
    name='experiment_name',
    api_token='YOUR_TOKEN'
)

trainer = PuffeRL(env, policy, logger=logger)
```

#### No Logger

```python
from pufferlib import NoLogger

trainer = PuffeRL(env, policy, logger=NoLogger())
```

### Key Metrics

Training logs include:

- **Performance Metrics**:
  - Steps per second (SPS)
  - Training throughput
  - Wall-clock time per iteration

- **Learning Metrics**:
  - Episode rewards (mean, min, max)
  - Episode lengths
  - Value function loss
  - Policy loss
  - Entropy
  - Explained variance
  - Clipfrac

- **Environment Metrics**:
  - Environment-specific rewards
  - Success rates
  - Custom metrics

### Terminal Dashboard

PufferLib provides a real-time terminal dashboard showing:
- Training progress
- Current SPS
- Episode statistics
- Loss values
- GPU utilization

## Checkpointing

### Saving Checkpoints

```python
# Save checkpoint
trainer.save_checkpoint('checkpoint.pt')

# Save with additional metadata
trainer.save_checkpoint(
    'checkpoint.pt',
    metadata={'iteration': iteration, 'best_reward': best_reward}
)
```

### Loading Checkpoints

```python
# Load checkpoint
trainer.load_checkpoint('checkpoint.pt')

# Resume training
for iteration in range(resume_iteration, num_iterations):
    trainer.evaluate()
    trainer.train()
    trainer.mean_and_log()
```

## Hyperparameter Tuning with Protein

The Protein system enables automatic hyperparameter and reward tuning:

```python
from pufferlib import Protein

# Define search space
search_space = {
    'learning_rate': [1e-4, 3e-4, 1e-3],
    'batch_size': [16384, 32768, 65536],
    'ent_coef': [0.001, 0.01, 0.1],
    'clip_coef': [0.1, 0.2, 0.3]
}

# Run hyperparameter search
protein = Protein(
    env_name='environment_name',
    search_space=search_space,
    num_trials=100,
    metric='mean_reward'
)

best_config = protein.optimize()
```

## Performance Optimization Tips

### Maximizing Throughput

1. **Batch Size**: Increase batch_size to fully utilize GPU
2. **Num Envs**: Balance between CPU and GPU utilization
3. **Compile**: Enable torch.compile for 10-20% speedup
4. **Workers**: Adjust num_workers based on environment complexity
5. **Device**: Always use 'cuda' for neural network training

### Environment Speed

- Pure Python environments: ~100k-500k SPS
- C-based environments: ~4M SPS
- With training overhead: ~1M-4M total SPS

### Memory Management

- Reduce batch_size if running out of GPU memory
- Decrease num_envs if running out of CPU memory
- Use gradient accumulation for large effective batch sizes

## Common Training Patterns

### Curriculum Learning

```python
# Start with easy tasks, gradually increase difficulty
difficulty_levels = [0.1, 0.3, 0.5, 0.7, 1.0]

for difficulty in difficulty_levels:
    env = pufferlib.make('environment_name', difficulty=difficulty)
    trainer = PuffeRL(env, policy)

    for iteration in range(iterations_per_level):
        trainer.evaluate()
        trainer.train()
        trainer.mean_and_log()
```

### Reward Shaping

```python
# Wrap environment with custom reward shaping
class RewardShapedEnv(pufferlib.PufferEnv):
    def step(self, actions):
        obs, rewards, dones, infos = super().step(actions)

        # Add shaped rewards
        shaped_rewards = rewards + 0.1 * proximity_bonus

        return obs, shaped_rewards, dones, infos
```

### Multi-Stage Training

```python
# Train in multiple stages with different configurations
stages = [
    {'learning_rate': 1e-3, 'iterations': 1000},   # Exploration
    {'learning_rate': 3e-4, 'iterations': 5000},   # Main training
    {'learning_rate': 1e-4, 'iterations': 2000}    # Fine-tuning
]

for stage in stages:
    trainer.learning_rate = stage['learning_rate']
    for iteration in range(stage['iterations']):
        trainer.evaluate()
        trainer.train()
        trainer.mean_and_log()
```

## Troubleshooting

### Low Performance

- Check environment is vectorized correctly
- Verify GPU utilization with `nvidia-smi`
- Increase batch_size to saturate GPU
- Enable compile mode
- Profile with `torch.profiler`

### Training Instability

- Reduce learning_rate
- Decrease batch_size
- Increase num_envs for more diverse samples
- Add entropy coefficient for more exploration
- Check reward scaling

### Memory Issues

- Reduce batch_size or num_envs
- Use gradient accumulation
- Disable compile mode if causing OOM
- Check for memory leaks in custom environments
