---
name: pufferlib
description: High-performance reinforcement learning framework optimized for speed and scale. Use when you need fast parallel training, vectorized environments, multi-agent systems, or integration with game environments (Atari, Procgen, NetHack). Achieves 2-10x speedups over standard implementations. For quick prototyping or standard algorithm implementations with extensive documentation, use stable-baselines3 instead.
license: MIT license
metadata:
    skill-author: K-Dense Inc.
---

# PufferLib - High-Performance Reinforcement Learning

## Overview

PufferLib is a high-performance reinforcement learning library designed for fast parallel environment simulation and training. It achieves training at millions of steps per second through optimized vectorization, native multi-agent support, and efficient PPO implementation (PuffeRL). The library provides the Ocean suite of 20+ environments and seamless integration with Gymnasium, PettingZoo, and specialized RL frameworks.

## When to Use This Skill

Use this skill when:
- **Training RL agents** with PPO on any environment (single or multi-agent)
- **Creating custom environments** using the PufferEnv API
- **Optimizing performance** for parallel environment simulation (vectorization)
- **Integrating existing environments** from Gymnasium, PettingZoo, Atari, Procgen, etc.
- **Developing policies** with CNN, LSTM, or custom architectures
- **Scaling RL** to millions of steps per second for faster experimentation
- **Multi-agent RL** with native multi-agent environment support

## Core Capabilities

### 1. High-Performance Training (PuffeRL)

PuffeRL is PufferLib's optimized PPO+LSTM training algorithm achieving 1M-4M steps/second.

**Quick start training:**
```bash
# CLI training
puffer train procgen-coinrun --train.device cuda --train.learning-rate 3e-4

# Distributed training
torchrun --nproc_per_node=4 train.py
```

**Python training loop:**
```python
import pufferlib
from pufferlib import PuffeRL

# Create vectorized environment
env = pufferlib.make('procgen-coinrun', num_envs=256)

# Create trainer
trainer = PuffeRL(
    env=env,
    policy=my_policy,
    device='cuda',
    learning_rate=3e-4,
    batch_size=32768
)

# Training loop
for iteration in range(num_iterations):
    trainer.evaluate()  # Collect rollouts
    trainer.train()     # Train on batch
    trainer.mean_and_log()  # Log results
```

**For comprehensive training guidance**, read `references/training.md` for:
- Complete training workflow and CLI options
- Hyperparameter tuning with Protein
- Distributed multi-GPU/multi-node training
- Logger integration (Weights & Biases, Neptune)
- Checkpointing and resume training
- Performance optimization tips
- Curriculum learning patterns

### 2. Environment Development (PufferEnv)

Create custom high-performance environments with the PufferEnv API.

**Basic environment structure:**
```python
import numpy as np
from pufferlib import PufferEnv

class MyEnvironment(PufferEnv):
    def __init__(self, buf=None):
        super().__init__(buf)

        # Define spaces
        self.observation_space = self.make_space((4,))
        self.action_space = self.make_discrete(4)

        self.reset()

    def reset(self):
        # Reset state and return initial observation
        return np.zeros(4, dtype=np.float32)

    def step(self, action):
        # Execute action, compute reward, check done
        obs = self._get_observation()
        reward = self._compute_reward()
        done = self._is_done()
        info = {}

        return obs, reward, done, info
```

**Use the template script:** `scripts/env_template.py` provides complete single-agent and multi-agent environment templates with examples of:
- Different observation space types (vector, image, dict)
- Action space variations (discrete, continuous, multi-discrete)
- Multi-agent environment structure
- Testing utilities

**For complete environment development**, read `references/environments.md` for:
- PufferEnv API details and in-place operation patterns
- Observation and action space definitions
- Multi-agent environment creation
- Ocean suite (20+ pre-built environments)
- Performance optimization (Python to C workflow)
- Environment wrappers and best practices
- Debugging and validation techniques

### 3. Vectorization and Performance

Achieve maximum throughput with optimized parallel simulation.

**Vectorization setup:**
```python
import pufferlib

# Automatic vectorization
env = pufferlib.make('environment_name', num_envs=256, num_workers=8)

# Performance benchmarks:
# - Pure Python envs: 100k-500k SPS
# - C-based envs: 100M+ SPS
# - With training: 400k-4M total SPS
```

**Key optimizations:**
- Shared memory buffers for zero-copy observation passing
- Busy-wait flags instead of pipes/queues
- Surplus environments for async returns
- Multiple environments per worker

**For vectorization optimization**, read `references/vectorization.md` for:
- Architecture and performance characteristics
- Worker and batch size configuration
- Serial vs multiprocessing vs async modes
- Shared memory and zero-copy patterns
- Hierarchical vectorization for large scale
- Multi-agent vectorization strategies
- Performance profiling and troubleshooting

### 4. Policy Development

Build policies as standard PyTorch modules with optional utilities.

**Basic policy structure:**
```python
import torch.nn as nn
from pufferlib.pytorch import layer_init

class Policy(nn.Module):
    def __init__(self, observation_space, action_space):
        super().__init__()

        # Encoder
        self.encoder = nn.Sequential(
            layer_init(nn.Linear(obs_dim, 256)),
            nn.ReLU(),
            layer_init(nn.Linear(256, 256)),
            nn.ReLU()
        )

        # Actor and critic heads
        self.actor = layer_init(nn.Linear(256, num_actions), std=0.01)
        self.critic = layer_init(nn.Linear(256, 1), std=1.0)

    def forward(self, observations):
        features = self.encoder(observations)
        return self.actor(features), self.critic(features)
```

**For complete policy development**, read `references/policies.md` for:
- CNN policies for image observations
- Recurrent policies with optimized LSTM (3x faster inference)
- Multi-input policies for complex observations
- Continuous action policies
- Multi-agent policies (shared vs independent parameters)
- Advanced architectures (attention, residual)
- Observation normalization and gradient clipping
- Policy debugging and testing

### 5. Environment Integration

Seamlessly integrate environments from popular RL frameworks.

**Gymnasium integration:**
```python
import gymnasium as gym
import pufferlib

# Wrap Gymnasium environment
gym_env = gym.make('CartPole-v1')
env = pufferlib.emulate(gym_env, num_envs=256)

# Or use make directly
env = pufferlib.make('gym-CartPole-v1', num_envs=256)
```

**PettingZoo multi-agent:**
```python
# Multi-agent environment
env = pufferlib.make('pettingzoo-knights-archers-zombies', num_envs=128)
```

**Supported frameworks:**
- Gymnasium / OpenAI Gym
- PettingZoo (parallel and AEC)
- Atari (ALE)
- Procgen
- NetHack / MiniHack
- Minigrid
- Neural MMO
- Crafter
- GPUDrive
- MicroRTS
- Griddly
- And more...

**For integration details**, read `references/integration.md` for:
- Complete integration examples for each framework
- Custom wrappers (observation, reward, frame stacking, action repeat)
- Space flattening and unflattening
- Environment registration
- Compatibility patterns
- Performance considerations
- Integration debugging

## Quick Start Workflow

### For Training Existing Environments

1. Choose environment from Ocean suite or compatible framework
2. Use `scripts/train_template.py` as starting point
3. Configure hyperparameters for your task
4. Run training with CLI or Python script
5. Monitor with Weights & Biases or Neptune
6. Refer to `references/training.md` for optimization

### For Creating Custom Environments

1. Start with `scripts/env_template.py`
2. Define observation and action spaces
3. Implement `reset()` and `step()` methods
4. Test environment locally
5. Vectorize with `pufferlib.emulate()` or `make()`
6. Refer to `references/environments.md` for advanced patterns
7. Optimize with `references/vectorization.md` if needed

### For Policy Development

1. Choose architecture based on observations:
   - Vector observations → MLP policy
   - Image observations → CNN policy
   - Sequential tasks → LSTM policy
   - Complex observations → Multi-input policy
2. Use `layer_init` for proper weight initialization
3. Follow patterns in `references/policies.md`
4. Test with environment before full training

### For Performance Optimization

1. Profile current throughput (steps per second)
2. Check vectorization configuration (num_envs, num_workers)
3. Optimize environment code (in-place ops, numpy vectorization)
4. Consider C implementation for critical paths
5. Use `references/vectorization.md` for systematic optimization

## Resources

### scripts/

**train_template.py** - Complete training script template with:
- Environment creation and configuration
- Policy initialization
- Logger integration (WandB, Neptune)
- Training loop with checkpointing
- Command-line argument parsing
- Multi-GPU distributed training setup

**env_template.py** - Environment implementation templates:
- Single-agent PufferEnv example (grid world)
- Multi-agent PufferEnv example (cooperative navigation)
- Multiple observation/action space patterns
- Testing utilities

### references/

**training.md** - Comprehensive training guide:
- Training workflow and CLI options
- Hyperparameter configuration
- Distributed training (multi-GPU, multi-node)
- Monitoring and logging
- Checkpointing
- Protein hyperparameter tuning
- Performance optimization
- Common training patterns
- Troubleshooting

**environments.md** - Environment development guide:
- PufferEnv API and characteristics
- Observation and action spaces
- Multi-agent environments
- Ocean suite environments
- Custom environment development workflow
- Python to C optimization path
- Third-party environment integration
- Wrappers and best practices
- Debugging

**vectorization.md** - Vectorization optimization:
- Architecture and key optimizations
- Vectorization modes (serial, multiprocessing, async)
- Worker and batch configuration
- Shared memory and zero-copy patterns
- Advanced vectorization (hierarchical, custom)
- Multi-agent vectorization
- Performance monitoring and profiling
- Troubleshooting and best practices

**policies.md** - Policy architecture guide:
- Basic policy structure
- CNN policies for images
- LSTM policies with optimization
- Multi-input policies
- Continuous action policies
- Multi-agent policies
- Advanced architectures (attention, residual)
- Observation processing and unflattening
- Initialization and normalization
- Debugging and testing

**integration.md** - Framework integration guide:
- Gymnasium integration
- PettingZoo integration (parallel and AEC)
- Third-party environments (Procgen, NetHack, Minigrid, etc.)
- Custom wrappers (observation, reward, frame stacking, etc.)
- Space conversion and unflattening
- Environment registration
- Compatibility patterns
- Performance considerations
- Debugging integration

## Tips for Success

1. **Start simple**: Begin with Ocean environments or Gymnasium integration before creating custom environments

2. **Profile early**: Measure steps per second from the start to identify bottlenecks

3. **Use templates**: `scripts/train_template.py` and `scripts/env_template.py` provide solid starting points

4. **Read references as needed**: Each reference file is self-contained and focused on a specific capability

5. **Optimize progressively**: Start with Python, profile, then optimize critical paths with C if needed

6. **Leverage vectorization**: PufferLib's vectorization is key to achieving high throughput

7. **Monitor training**: Use WandB or Neptune to track experiments and identify issues early

8. **Test environments**: Validate environment logic before scaling up training

9. **Check existing environments**: Ocean suite provides 20+ pre-built environments

10. **Use proper initialization**: Always use `layer_init` from `pufferlib.pytorch` for policies

## Common Use Cases

### Training on Standard Benchmarks
```python
# Atari
env = pufferlib.make('atari-pong', num_envs=256)

# Procgen
env = pufferlib.make('procgen-coinrun', num_envs=256)

# Minigrid
env = pufferlib.make('minigrid-empty-8x8', num_envs=256)
```

### Multi-Agent Learning
```python
# PettingZoo
env = pufferlib.make('pettingzoo-pistonball', num_envs=128)

# Shared policy for all agents
policy = create_policy(env.observation_space, env.action_space)
trainer = PuffeRL(env=env, policy=policy)
```

### Custom Task Development
```python
# Create custom environment
class MyTask(PufferEnv):
    # ... implement environment ...

# Vectorize and train
env = pufferlib.emulate(MyTask, num_envs=256)
trainer = PuffeRL(env=env, policy=my_policy)
```

### High-Performance Optimization
```python
# Maximize throughput
env = pufferlib.make(
    'my-env',
    num_envs=1024,      # Large batch
    num_workers=16,     # Many workers
    envs_per_worker=64  # Optimize per worker
)
```

## Installation

```bash
uv pip install pufferlib
```

## Documentation

- Official docs: https://puffer.ai/docs.html
- GitHub: https://github.com/PufferAI/PufferLib
- Discord: Community support available

