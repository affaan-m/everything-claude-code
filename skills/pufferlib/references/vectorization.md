# PufferLib Vectorization Guide

## Overview

PufferLib's vectorization system enables high-performance parallel environment simulation, achieving millions of steps per second through optimized implementation inspired by EnvPool. The system supports both synchronous and asynchronous vectorization with minimal overhead.

## Vectorization Architecture

### Key Optimizations

1. **Shared Memory Buffer**: Single unified buffer across all environments (unlike Gymnasium's per-environment buffers)
2. **Busy-Wait Flags**: Workers busy-wait on unlocked flags rather than using pipes/queues
3. **Zero-Copy Batching**: Contiguous worker subsets return observations without copying
4. **Surplus Environments**: Simulates more environments than batch size for async returns
5. **Multiple Envs per Worker**: Optimizes performance for lightweight environments

### Performance Characteristics

- **Pure Python environments**: 100k-500k SPS
- **C-based environments**: 100M+ SPS
- **With training**: 400k-4M total SPS
- **Vectorization overhead**: <5% with optimal configuration

## Creating Vectorized Environments

### Basic Vectorization

```python
import pufferlib

# Automatic vectorization
env = pufferlib.make('environment_name', num_envs=256)

# With explicit configuration
env = pufferlib.make(
    'environment_name',
    num_envs=256,
    num_workers=8,
    envs_per_worker=32
)
```

### Manual Vectorization

```python
from pufferlib import PufferEnv
from pufferlib.vectorization import Serial, Multiprocessing

# Serial vectorization (single process)
vec_env = Serial(
    env_creator=lambda: MyEnvironment(),
    num_envs=16
)

# Multiprocessing vectorization
vec_env = Multiprocessing(
    env_creator=lambda: MyEnvironment(),
    num_envs=256,
    num_workers=8
)
```

## Vectorization Modes

### Serial Vectorization

Best for debugging and lightweight environments:

```python
from pufferlib.vectorization import Serial

vec_env = Serial(
    env_creator=env_creator_fn,
    num_envs=16
)

# All environments run in main process
# No multiprocessing overhead
# Easier debugging with standard tools
```

**When to use:**
- Development and debugging
- Very fast environments (< 1μs per step)
- Small number of environments (< 32)
- Single-threaded profiling

### Multiprocessing Vectorization

Best for most production use cases:

```python
from pufferlib.vectorization import Multiprocessing

vec_env = Multiprocessing(
    env_creator=env_creator_fn,
    num_envs=256,
    num_workers=8,
    envs_per_worker=32
)

# Parallel execution across workers
# True parallelism for CPU-bound environments
# Scales to hundreds of environments
```

**When to use:**
- Production training
- CPU-intensive environments
- Large-scale parallel simulation
- Maximizing throughput

### Async Vectorization

For environments with variable step times:

```python
vec_env = Multiprocessing(
    env_creator=env_creator_fn,
    num_envs=256,
    num_workers=8,
    mode='async',
    surplus_envs=32  # Simulate extra environments
)

# Returns batches as soon as ready
# Better GPU utilization
# Handles variable environment speeds
```

**When to use:**
- Variable environment step times
- Maximizing GPU utilization
- Network-based environments
- External simulators

## Optimizing Vectorization Performance

### Worker Configuration

```python
import multiprocessing

# Calculate optimal workers
num_cpus = multiprocessing.cpu_count()

# Conservative (leave headroom for training)
num_workers = num_cpus - 2

# Aggressive (maximize environment throughput)
num_workers = num_cpus

# With hyperthreading
num_workers = num_cpus // 2  # Physical cores only
```

### Envs Per Worker

```python
# Fast environments (< 10μs per step)
envs_per_worker = 64  # More envs per worker

# Medium environments (10-100μs per step)
envs_per_worker = 32  # Balanced

# Slow environments (> 100μs per step)
envs_per_worker = 16  # Fewer envs per worker

# Calculate from target batch size
batch_size = 32768
num_workers = 8
envs_per_worker = batch_size // num_workers
```

### Batch Size Tuning

```python
# Small batch (< 8k): Good for fast iteration
batch_size = 4096
num_envs = 256
steps_per_env = batch_size // num_envs  # 16 steps

# Medium batch (8k-32k): Good balance
batch_size = 16384
num_envs = 512
steps_per_env = 32

# Large batch (> 32k): Maximum throughput
batch_size = 65536
num_envs = 1024
steps_per_env = 64
```

## Shared Memory Optimization

### Buffer Management

PufferLib uses shared memory for zero-copy observation passing:

```python
import numpy as np
from multiprocessing import shared_memory

class OptimizedEnv(PufferEnv):
    def __init__(self, buf=None):
        super().__init__(buf)

        # Environment will use provided shared buffer
        self.observation_space = self.make_space({'obs': (84, 84, 3)})

        # Observations written directly to shared memory
        self._obs_buffer = None

    def reset(self):
        # Write to shared memory in-place
        if self._obs_buffer is None:
            self._obs_buffer = np.zeros((84, 84, 3), dtype=np.uint8)

        self._render_to_buffer(self._obs_buffer)
        return {'obs': self._obs_buffer}

    def step(self, action):
        # In-place updates only
        self._update_state(action)
        self._render_to_buffer(self._obs_buffer)

        return {'obs': self._obs_buffer}, reward, done, info
```

### Zero-Copy Patterns

```python
# BAD: Creates copies
def get_observation(self):
    obs = np.zeros((84, 84, 3))
    # ... fill obs ...
    return obs.copy()  # Unnecessary copy!

# GOOD: Reuses buffer
def get_observation(self):
    # Use pre-allocated buffer
    self._render_to_buffer(self._obs_buffer)
    return self._obs_buffer  # No copy

# BAD: Allocates new arrays
def step(self, action):
    new_state = self.state + action  # Allocates
    self.state = new_state
    return obs, reward, done, info

# GOOD: In-place operations
def step(self, action):
    self.state += action  # In-place
    return obs, reward, done, info
```

## Advanced Vectorization

### Custom Vectorization

```python
from pufferlib.vectorization import VectorEnv

class CustomVectorEnv(VectorEnv):
    """Custom vectorization implementation."""

    def __init__(self, env_creator, num_envs, **kwargs):
        super().__init__()

        self.envs = [env_creator() for _ in range(num_envs)]
        self.num_envs = num_envs

    def reset(self):
        """Reset all environments."""
        observations = [env.reset() for env in self.envs]
        return self._stack_obs(observations)

    def step(self, actions):
        """Step all environments."""
        results = [env.step(action) for env, action in zip(self.envs, actions)]

        obs, rewards, dones, infos = zip(*results)

        return (
            self._stack_obs(obs),
            np.array(rewards),
            np.array(dones),
            list(infos)
        )

    def _stack_obs(self, observations):
        """Stack observations into batch."""
        return np.stack(observations, axis=0)
```

### Hierarchical Vectorization

For very large-scale parallelism:

```python
# Outer: Multiprocessing vectorization (8 workers)
# Inner: Each worker runs serial vectorization (32 envs)
# Total: 256 parallel environments

def create_serial_vec_env():
    return Serial(
        env_creator=lambda: MyEnvironment(),
        num_envs=32
    )

outer_vec_env = Multiprocessing(
    env_creator=create_serial_vec_env,
    num_envs=8,  # 8 serial vec envs
    num_workers=8
)

# Total environments: 8 * 32 = 256
```

## Multi-Agent Vectorization

### Native Multi-Agent Support

PufferLib treats multi-agent environments as first-class citizens:

```python
# Multi-agent environment automatically vectorized
env = pufferlib.make(
    'pettingzoo-knights-archers-zombies',
    num_envs=128,
    num_agents=4
)

# Observations: {agent_id: [batch_obs]} for each agent
# Actions: {agent_id: [batch_actions]} for each agent
# Rewards: {agent_id: [batch_rewards]} for each agent
```

### Custom Multi-Agent Vectorization

```python
class MultiAgentVectorEnv(VectorEnv):
    def step(self, actions):
        """
        Args:
            actions: Dict of {agent_id: [batch_actions]}

        Returns:
            observations: Dict of {agent_id: [batch_obs]}
            rewards: Dict of {agent_id: [batch_rewards]}
            dones: Dict of {agent_id: [batch_dones]}
            infos: List of dicts
        """
        # Distribute actions to environments
        env_actions = self._distribute_actions(actions)

        # Step each environment
        results = [env.step(act) for env, act in zip(self.envs, env_actions)]

        # Collect and batch results
        return self._batch_results(results)
```

## Performance Monitoring

### Profiling Vectorization

```python
import time

def profile_vectorization(vec_env, num_steps=10000):
    """Profile vectorization performance."""
    start = time.time()

    vec_env.reset()

    for _ in range(num_steps):
        actions = vec_env.action_space.sample()
        vec_env.step(actions)

    elapsed = time.time() - start
    sps = (num_steps * vec_env.num_envs) / elapsed

    print(f"Steps per second: {sps:,.0f}")
    print(f"Time per step: {elapsed/num_steps*1000:.2f}ms")

    return sps
```

### Bottleneck Analysis

```python
import cProfile
import pstats

def analyze_bottlenecks(vec_env):
    """Identify vectorization bottlenecks."""
    profiler = cProfile.Profile()

    profiler.enable()

    vec_env.reset()
    for _ in range(1000):
        actions = vec_env.action_space.sample()
        vec_env.step(actions)

    profiler.disable()

    stats = pstats.Stats(profiler)
    stats.sort_stats('cumulative')
    stats.print_stats(20)
```

### Real-Time Monitoring

```python
class MonitoredVectorEnv(VectorEnv):
    """Vector environment with performance monitoring."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.step_times = []
        self.step_count = 0

    def step(self, actions):
        start = time.perf_counter()

        result = super().step(actions)

        elapsed = time.perf_counter() - start
        self.step_times.append(elapsed)
        self.step_count += 1

        # Log every 1000 steps
        if self.step_count % 1000 == 0:
            mean_time = np.mean(self.step_times[-1000:])
            sps = self.num_envs / mean_time
            print(f"SPS: {sps:,.0f} | Step time: {mean_time*1000:.2f}ms")

        return result
```

## Troubleshooting

### Low Throughput

```python
# Check configuration
print(f"Num envs: {vec_env.num_envs}")
print(f"Num workers: {vec_env.num_workers}")
print(f"Envs per worker: {vec_env.num_envs // vec_env.num_workers}")

# Profile single environment
single_env = MyEnvironment()
single_sps = profile_single_env(single_env)
print(f"Single env SPS: {single_sps:,.0f}")

# Compare vectorized
vec_sps = profile_vectorization(vec_env)
print(f"Vectorized SPS: {vec_sps:,.0f}")
print(f"Speedup: {vec_sps / single_sps:.1f}x")
```

### Memory Issues

```python
# Reduce number of environments
num_envs = 128  # Instead of 256

# Reduce envs per worker
envs_per_worker = 16  # Instead of 32

# Use Serial mode for debugging
vec_env = Serial(env_creator, num_envs=16)
```

### Synchronization Problems

```python
# Ensure thread-safe operations
import threading

class ThreadSafeEnv(PufferEnv):
    def __init__(self, buf=None):
        super().__init__(buf)
        self.lock = threading.Lock()

    def step(self, action):
        with self.lock:
            return super().step(action)
```

## Best Practices

### Configuration Guidelines

```python
# Start conservative
config = {
    'num_envs': 64,
    'num_workers': 4,
    'envs_per_worker': 16
}

# Scale up iteratively
config = {
    'num_envs': 256,     # 4x increase
    'num_workers': 8,     # 2x increase
    'envs_per_worker': 32 # 2x increase
}

# Monitor and adjust
if sps < target_sps:
    # Try increasing num_envs or num_workers
    pass
if memory_usage > threshold:
    # Reduce num_envs or envs_per_worker
    pass
```

### Environment Design

```python
# Minimize per-step allocations
class EfficientEnv(PufferEnv):
    def __init__(self, buf=None):
        super().__init__(buf)

        # Pre-allocate all buffers
        self._obs = np.zeros((84, 84, 3), dtype=np.uint8)
        self._state = np.zeros(10, dtype=np.float32)

    def step(self, action):
        # Use pre-allocated buffers
        self._update_state_inplace(action)
        self._render_to_obs()

        return self._obs, reward, done, info
```

### Testing

```python
# Test vectorization matches serial
serial_env = Serial(env_creator, num_envs=4)
vec_env = Multiprocessing(env_creator, num_envs=4, num_workers=2)

# Run parallel and verify results match
serial_env.seed(42)
vec_env.seed(42)

serial_obs = serial_env.reset()
vec_obs = vec_env.reset()

assert np.allclose(serial_obs, vec_obs), "Vectorization mismatch!"
```
