# PufferLib Integration Guide

## Overview

PufferLib provides an emulation layer that enables seamless integration with popular RL frameworks including Gymnasium, OpenAI Gym, PettingZoo, and many specialized environment libraries. The emulation layer flattens observation and action spaces for efficient vectorization while maintaining compatibility.

## Gymnasium Integration

### Basic Gymnasium Environments

```python
import gymnasium as gym
import pufferlib

# Method 1: Direct wrapping
gym_env = gym.make('CartPole-v1')
puffer_env = pufferlib.emulate(gym_env, num_envs=256)

# Method 2: Using make
env = pufferlib.make('gym-CartPole-v1', num_envs=256)

# Method 3: Custom Gymnasium environment
class MyGymEnv(gym.Env):
    def __init__(self):
        self.observation_space = gym.spaces.Box(low=-1, high=1, shape=(4,))
        self.action_space = gym.spaces.Discrete(2)

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        return self.observation_space.sample(), {}

    def step(self, action):
        obs = self.observation_space.sample()
        reward = 1.0
        terminated = False
        truncated = False
        info = {}
        return obs, reward, terminated, truncated, info

# Wrap custom environment
puffer_env = pufferlib.emulate(MyGymEnv, num_envs=128)
```

### Atari Environments

```python
import gymnasium as gym
from gymnasium.wrappers import AtariPreprocessing, FrameStack
import pufferlib

# Standard Atari setup
def make_atari_env(env_name='ALE/Pong-v5'):
    env = gym.make(env_name)
    env = AtariPreprocessing(env, frame_skip=4)
    env = FrameStack(env, num_stack=4)
    return env

# Vectorize with PufferLib
env = pufferlib.emulate(make_atari_env, num_envs=256)

# Or use built-in
env = pufferlib.make('atari-pong', num_envs=256, frameskip=4, framestack=4)
```

### Complex Observation Spaces

```python
import gymnasium as gym
from gymnasium.spaces import Dict, Box, Discrete
import pufferlib

class ComplexObsEnv(gym.Env):
    def __init__(self):
        # Dict observation space
        self.observation_space = Dict({
            'image': Box(low=0, high=255, shape=(84, 84, 3), dtype=np.uint8),
            'vector': Box(low=-np.inf, high=np.inf, shape=(10,), dtype=np.float32),
            'discrete': Discrete(5)
        })
        self.action_space = Discrete(4)

    def reset(self, seed=None, options=None):
        return {
            'image': np.zeros((84, 84, 3), dtype=np.uint8),
            'vector': np.zeros(10, dtype=np.float32),
            'discrete': 0
        }, {}

    def step(self, action):
        obs = {
            'image': np.random.randint(0, 256, (84, 84, 3), dtype=np.uint8),
            'vector': np.random.randn(10).astype(np.float32),
            'discrete': np.random.randint(0, 5)
        }
        return obs, 1.0, False, False, {}

# PufferLib automatically flattens and unflattens complex spaces
env = pufferlib.emulate(ComplexObsEnv, num_envs=128)
```

## PettingZoo Integration

### Parallel Environments

```python
from pettingzoo.butterfly import pistonball_v6
import pufferlib

# Wrap PettingZoo parallel environment
pz_env = pistonball_v6.parallel_env()
puffer_env = pufferlib.emulate(pz_env, num_envs=128)

# Or use make directly
env = pufferlib.make('pettingzoo-pistonball', num_envs=128)
```

### AEC (Agent Environment Cycle) Environments

```python
from pettingzoo.classic import chess_v5
import pufferlib

# Wrap AEC environment (PufferLib handles conversion to parallel)
aec_env = chess_v5.env()
puffer_env = pufferlib.emulate(aec_env, num_envs=64)

# Works with any PettingZoo AEC environment
env = pufferlib.make('pettingzoo-chess', num_envs=64)
```

### Multi-Agent Training

```python
import pufferlib
from pufferlib import PuffeRL

# Create multi-agent environment
env = pufferlib.make('pettingzoo-knights-archers-zombies', num_envs=128)

# Shared policy for all agents
policy = create_policy(env.observation_space, env.action_space)

# Train
trainer = PuffeRL(env=env, policy=policy)

for iteration in range(num_iterations):
    # Observations are dicts: {agent_id: batch_obs}
    rollout = trainer.evaluate()

    # Train on multi-agent data
    trainer.train()
    trainer.mean_and_log()
```

## Third-Party Environments

### Procgen

```python
import pufferlib

# Procgen environments
env = pufferlib.make('procgen-coinrun', num_envs=256, distribution_mode='easy')

# Custom configuration
env = pufferlib.make(
    'procgen-coinrun',
    num_envs=256,
    num_levels=200,  # Number of unique levels
    start_level=0,   # Starting level seed
    distribution_mode='hard'
)
```

### NetHack

```python
import pufferlib

# NetHack Learning Environment
env = pufferlib.make('nethack', num_envs=128)

# MiniHack variants
env = pufferlib.make('minihack-corridor', num_envs=128)
env = pufferlib.make('minihack-room', num_envs=128)
```

### Minigrid

```python
import pufferlib

# Minigrid environments
env = pufferlib.make('minigrid-empty-8x8', num_envs=256)
env = pufferlib.make('minigrid-doorkey-8x8', num_envs=256)
env = pufferlib.make('minigrid-multiroom', num_envs=256)
```

### Neural MMO

```python
import pufferlib

# Large-scale multi-agent environment
env = pufferlib.make(
    'neuralmmo',
    num_envs=64,
    num_agents=128,  # Agents per environment
    map_size=128
)
```

### Crafter

```python
import pufferlib

# Open-ended crafting environment
env = pufferlib.make('crafter', num_envs=128)
```

### GPUDrive

```python
import pufferlib

# GPU-accelerated driving simulator
env = pufferlib.make(
    'gpudrive',
    num_envs=1024,  # Can handle many environments on GPU
    num_vehicles=8
)
```

### MicroRTS

```python
import pufferlib

# Real-time strategy game
env = pufferlib.make(
    'microrts',
    num_envs=128,
    map_size=16,
    max_steps=2000
)
```

### Griddly

```python
import pufferlib

# Grid-based games
env = pufferlib.make('griddly-clusters', num_envs=256)
env = pufferlib.make('griddly-sokoban', num_envs=256)
```

## Custom Wrappers

### Observation Wrappers

```python
import numpy as np
import pufferlib
from pufferlib import PufferEnv

class NormalizeObservations(pufferlib.Wrapper):
    """Normalize observations to zero mean and unit variance."""

    def __init__(self, env):
        super().__init__(env)
        self.obs_mean = np.zeros(env.observation_space.shape)
        self.obs_std = np.ones(env.observation_space.shape)
        self.count = 0

    def reset(self):
        obs = self.env.reset()
        return self._normalize(obs)

    def step(self, action):
        obs, reward, done, info = self.env.step(action)
        return self._normalize(obs), reward, done, info

    def _normalize(self, obs):
        # Update running statistics
        self.count += 1
        delta = obs - self.obs_mean
        self.obs_mean += delta / self.count
        self.obs_std = np.sqrt(((self.count - 1) * self.obs_std ** 2 + delta * (obs - self.obs_mean)) / self.count)

        # Normalize
        return (obs - self.obs_mean) / (self.obs_std + 1e-8)
```

### Reward Wrappers

```python
class RewardShaping(pufferlib.Wrapper):
    """Add shaped rewards to environment."""

    def __init__(self, env, shaping_fn):
        super().__init__(env)
        self.shaping_fn = shaping_fn

    def step(self, action):
        obs, reward, done, info = self.env.step(action)

        # Add shaped reward
        shaped_reward = reward + self.shaping_fn(obs, action)

        return obs, shaped_reward, done, info

# Usage
def proximity_shaping(obs, action):
    """Reward agent for getting closer to goal."""
    goal_pos = np.array([10, 10])
    agent_pos = obs[:2]
    distance = np.linalg.norm(goal_pos - agent_pos)
    return -0.1 * distance

env = pufferlib.make('myenv', num_envs=128)
env = RewardShaping(env, proximity_shaping)
```

### Frame Stacking

```python
class FrameStack(pufferlib.Wrapper):
    """Stack frames for temporal context."""

    def __init__(self, env, num_stack=4):
        super().__init__(env)
        self.num_stack = num_stack
        self.frames = None

    def reset(self):
        obs = self.env.reset()

        # Initialize frame stack
        self.frames = np.repeat(obs[np.newaxis], self.num_stack, axis=0)

        return self._get_obs()

    def step(self, action):
        obs, reward, done, info = self.env.step(action)

        # Update frame stack
        self.frames = np.roll(self.frames, shift=-1, axis=0)
        self.frames[-1] = obs

        if done:
            self.frames = None

        return self._get_obs(), reward, done, info

    def _get_obs(self):
        return self.frames
```

### Action Repeat

```python
class ActionRepeat(pufferlib.Wrapper):
    """Repeat actions for multiple steps."""

    def __init__(self, env, repeat=4):
        super().__init__(env)
        self.repeat = repeat

    def step(self, action):
        total_reward = 0.0
        done = False

        for _ in range(self.repeat):
            obs, reward, done, info = self.env.step(action)
            total_reward += reward

            if done:
                break

        return obs, total_reward, done, info
```

## Space Conversion

### Flattening Spaces

PufferLib automatically flattens complex observation/action spaces:

```python
from gymnasium.spaces import Dict, Box, Discrete
import pufferlib

# Complex space
original_space = Dict({
    'image': Box(0, 255, (84, 84, 3), dtype=np.uint8),
    'vector': Box(-np.inf, np.inf, (10,), dtype=np.float32),
    'discrete': Discrete(5)
})

# Automatically flattened by PufferLib
# Observations are presented as flat arrays for efficient processing
# But can be unflattened when needed for policy processing
```

### Unflattening for Policies

```python
from pufferlib.pytorch import unflatten_observations

class PolicyWithUnflatten(nn.Module):
    def __init__(self, observation_space, action_space):
        super().__init__()
        self.observation_space = observation_space
        # ... policy architecture ...

    def forward(self, flat_observations):
        # Unflatten to original structure
        observations = unflatten_observations(
            flat_observations,
            self.observation_space
        )

        # Now observations is a dict with 'image', 'vector', 'discrete'
        image_features = self.image_encoder(observations['image'])
        vector_features = self.vector_encoder(observations['vector'])
        # ...
```

## Environment Registration

### Registering Custom Environments

```python
import pufferlib

# Register environment for easy access
pufferlib.register(
    id='my-custom-env',
    entry_point='my_package.envs:MyEnvironment',
    kwargs={'param1': 'value1'}
)

# Now can use with make
env = pufferlib.make('my-custom-env', num_envs=256)
```

### Registering in Ocean Suite

To add your environment to Ocean:

```python
# In ocean/environment.py
OCEAN_REGISTRY = {
    'my-env': {
        'entry_point': 'my_package.envs:MyEnvironment',
        'kwargs': {
            'default_param': 'default_value'
        }
    }
}
```

## Compatibility Patterns

### Gymnasium to PufferLib

```python
import gymnasium as gym
import pufferlib

# Standard Gymnasium environment
class GymEnv(gym.Env):
    def reset(self, seed=None, options=None):
        return observation, info

    def step(self, action):
        return observation, reward, terminated, truncated, info

# Convert to PufferEnv
puffer_env = pufferlib.emulate(GymEnv, num_envs=128)
```

### PettingZoo to PufferLib

```python
from pettingzoo import ParallelEnv
import pufferlib

# PettingZoo parallel environment
class PZEnv(ParallelEnv):
    def reset(self, seed=None, options=None):
        return {agent: obs for agent, obs in ...}, {agent: info for agent in ...}

    def step(self, actions):
        return observations, rewards, terminations, truncations, infos

# Convert to PufferEnv
puffer_env = pufferlib.emulate(PZEnv, num_envs=128)
```

### Legacy Gym (v0.21) to PufferLib

```python
import gym  # Old gym
import pufferlib

# Legacy gym environment (returns done instead of terminated/truncated)
class LegacyEnv(gym.Env):
    def reset(self):
        return observation

    def step(self, action):
        return observation, reward, done, info

# PufferLib handles legacy format automatically
puffer_env = pufferlib.emulate(LegacyEnv, num_envs=128)
```

## Performance Considerations

### Efficient Integration

```python
# Fast: Use built-in integrations when available
env = pufferlib.make('procgen-coinrun', num_envs=256)

# Slower: Generic wrapper (still fast, but overhead)
import gymnasium as gym
gym_env = gym.make('CartPole-v1')
env = pufferlib.emulate(gym_env, num_envs=256)

# Slowest: Nested wrappers add overhead
import gymnasium as gym
gym_env = gym.make('CartPole-v1')
gym_env = SomeWrapper(gym_env)
gym_env = AnotherWrapper(gym_env)
env = pufferlib.emulate(gym_env, num_envs=256)
```

### Minimize Wrapper Overhead

```python
# BAD: Too many wrappers
env = gym.make('CartPole-v1')
env = Wrapper1(env)
env = Wrapper2(env)
env = Wrapper3(env)
puffer_env = pufferlib.emulate(env, num_envs=256)

# GOOD: Combine wrapper logic
class CombinedWrapper(gym.Wrapper):
    def step(self, action):
        obs, reward, done, truncated, info = self.env.step(action)
        # Apply all transformations at once
        obs = self._transform_obs(obs)
        reward = self._transform_reward(reward)
        return obs, reward, done, truncated, info

env = gym.make('CartPole-v1')
env = CombinedWrapper(env)
puffer_env = pufferlib.emulate(env, num_envs=256)
```

## Debugging Integration

### Verify Environment Compatibility

```python
def test_environment(env, num_steps=100):
    """Test environment for common issues."""
    # Test reset
    obs = env.reset()
    assert env.observation_space.contains(obs), "Invalid initial observation"

    # Test steps
    for _ in range(num_steps):
        action = env.action_space.sample()
        obs, reward, done, info = env.step(action)

        assert env.observation_space.contains(obs), "Invalid observation"
        assert isinstance(reward, (int, float)), "Invalid reward type"
        assert isinstance(done, bool), "Invalid done type"
        assert isinstance(info, dict), "Invalid info type"

        if done:
            obs = env.reset()

    print("✓ Environment passed compatibility test")

# Test before vectorizing
test_environment(MyEnvironment())
```

### Compare Outputs

```python
# Verify PufferLib emulation matches original
import gymnasium as gym
import pufferlib
import numpy as np

gym_env = gym.make('CartPole-v1')
puffer_env = pufferlib.emulate(lambda: gym.make('CartPole-v1'), num_envs=1)

# Test with same seed
gym_env.reset(seed=42)
puffer_obs = puffer_env.reset()

for _ in range(100):
    action = gym_env.action_space.sample()

    gym_obs, gym_reward, gym_done, gym_truncated, gym_info = gym_env.step(action)
    puffer_obs, puffer_reward, puffer_done, puffer_info = puffer_env.step(np.array([action]))

    # Compare outputs (accounting for batch dimension)
    assert np.allclose(gym_obs, puffer_obs[0])
    assert gym_reward == puffer_reward[0]
    assert gym_done == puffer_done[0]
```
