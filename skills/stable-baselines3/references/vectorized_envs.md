# Vectorized Environments in Stable Baselines3

This document provides comprehensive information about vectorized environments in Stable Baselines3 for efficient parallel training.

## Overview

Vectorized environments stack multiple independent environment instances into a single environment that processes actions and observations in batches. Instead of interacting with one environment at a time, you interact with `n` environments simultaneously.

**Benefits:**
- **Speed:** Parallel execution significantly accelerates training
- **Sample efficiency:** Collect more diverse experiences faster
- **Required for:** Frame stacking and normalization wrappers
- **Better for:** On-policy algorithms (PPO, A2C)

## VecEnv Types

### DummyVecEnv

Executes environments sequentially on the current Python process.

```python
from stable_baselines3.common.vec_env import DummyVecEnv

# Method 1: Using make_vec_env
from stable_baselines3.common.env_util import make_vec_env

env = make_vec_env("CartPole-v1", n_envs=4, vec_env_cls=DummyVecEnv)

# Method 2: Manual creation
def make_env():
    def _init():
        return gym.make("CartPole-v1")
    return _init

env = DummyVecEnv([make_env() for _ in range(4)])
```

**When to use:**
- Lightweight environments (CartPole, simple grids)
- When multiprocessing overhead > computation time
- Debugging (easier to trace errors)
- Single-threaded environments

**Performance:** No actual parallelism (sequential execution).

### SubprocVecEnv

Executes each environment in a separate process, enabling true parallelism.

```python
from stable_baselines3.common.vec_env import SubprocVecEnv
from stable_baselines3.common.env_util import make_vec_env

env = make_vec_env("CartPole-v1", n_envs=8, vec_env_cls=SubprocVecEnv)
```

**When to use:**
- Computationally expensive environments (physics simulations, 3D games)
- When environment computation time justifies multiprocessing overhead
- When you need true parallel execution

**Important:** Requires wrapping code in `if __name__ == "__main__":` when using forkserver or spawn:

```python
if __name__ == "__main__":
    env = make_vec_env("CartPole-v1", n_envs=8, vec_env_cls=SubprocVecEnv)
    model = PPO("MlpPolicy", env)
    model.learn(total_timesteps=100000)
```

**Performance:** True parallelism across CPU cores.

## Quick Setup with make_vec_env

The easiest way to create vectorized environments:

```python
from stable_baselines3.common.env_util import make_vec_env
from stable_baselines3.common.vec_env import SubprocVecEnv

# Basic usage
env = make_vec_env("CartPole-v1", n_envs=4)

# With SubprocVecEnv
env = make_vec_env("CartPole-v1", n_envs=8, vec_env_cls=SubprocVecEnv)

# With custom environment kwargs
env = make_vec_env(
    "MyEnv-v0",
    n_envs=4,
    env_kwargs={"difficulty": "hard", "max_steps": 500}
)

# With custom seed
env = make_vec_env("CartPole-v1", n_envs=4, seed=42)
```

## API Differences from Standard Gym

Vectorized environments have a different API than standard Gym environments:

### reset()

**Standard Gym:**
```python
obs, info = env.reset()
```

**VecEnv:**
```python
obs = env.reset()  # Returns only observations (numpy array)
# Access info via env.reset_infos (list of dicts)
infos = env.reset_infos
```

### step()

**Standard Gym:**
```python
obs, reward, terminated, truncated, info = env.step(action)
```

**VecEnv:**
```python
obs, rewards, dones, infos = env.step(actions)
# Returns 4-tuple instead of 5-tuple
# dones = terminated | truncated
# actions is an array of shape (n_envs,) or (n_envs, action_dim)
```

### Auto-reset

**VecEnv automatically resets environments when episodes end:**

```python
obs = env.reset()  # Shape: (n_envs, obs_dim)
for _ in range(1000):
    actions = env.action_space.sample()  # Shape: (n_envs,)
    obs, rewards, dones, infos = env.step(actions)
    # If dones[i] is True, env i was automatically reset
    # Final observation before reset available in infos[i]["terminal_observation"]
```

### Terminal Observations

When an episode ends, access the true final observation:

```python
obs, rewards, dones, infos = env.step(actions)

for i, done in enumerate(dones):
    if done:
        # The obs[i] is already the reset observation
        # True terminal observation is in info
        terminal_obs = infos[i]["terminal_observation"]
        print(f"Episode ended with terminal observation: {terminal_obs}")
```

## Training with Vectorized Environments

### On-Policy Algorithms (PPO, A2C)

On-policy algorithms benefit greatly from vectorization:

```python
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from stable_baselines3.common.vec_env import SubprocVecEnv

# Create vectorized environment
env = make_vec_env("CartPole-v1", n_envs=8, vec_env_cls=SubprocVecEnv)

# Train
model = PPO("MlpPolicy", env, verbose=1, n_steps=128)
model.learn(total_timesteps=100000)

# With n_envs=8 and n_steps=128:
# - Collects 8*128=1024 steps per rollout
# - Updates after every 1024 steps
```

**Rule of thumb:** Use 4-16 parallel environments for on-policy methods.

### Off-Policy Algorithms (SAC, TD3, DQN)

Off-policy algorithms can use vectorization but benefit less:

```python
from stable_baselines3 import SAC
from stable_baselines3.common.env_util import make_vec_env

# Use fewer environments (1-4)
env = make_vec_env("Pendulum-v1", n_envs=4)

# Set gradient_steps=-1 for efficiency
model = SAC(
    "MlpPolicy",
    env,
    verbose=1,
    train_freq=1,
    gradient_steps=-1,  # Do 1 gradient step per env step (4 total with 4 envs)
)
model.learn(total_timesteps=50000)
```

**Rule of thumb:** Use 1-4 parallel environments for off-policy methods.

## Wrappers for Vectorized Environments

### VecNormalize

Normalizes observations and rewards using running statistics.

```python
from stable_baselines3.common.vec_env import VecNormalize

env = make_vec_env("Pendulum-v1", n_envs=4)

# Wrap with normalization
env = VecNormalize(
    env,
    norm_obs=True,        # Normalize observations
    norm_reward=True,     # Normalize rewards
    clip_obs=10.0,        # Clip normalized observations
    clip_reward=10.0,     # Clip normalized rewards
    gamma=0.99,           # Discount factor for reward normalization
)

# Train
model = PPO("MlpPolicy", env)
model.learn(total_timesteps=50000)

# Save model AND normalization statistics
model.save("ppo_pendulum")
env.save("vec_normalize.pkl")

# Load for evaluation
env = make_vec_env("Pendulum-v1", n_envs=1)
env = VecNormalize.load("vec_normalize.pkl", env)
env.training = False  # Don't update stats during evaluation
env.norm_reward = False  # Don't normalize rewards during evaluation

model = PPO.load("ppo_pendulum", env=env)
```

**When to use:**
- Continuous control tasks (especially MuJoCo)
- When observation scales vary widely
- When rewards have high variance

**Important:**
- Statistics are NOT saved with model - save separately
- Disable training and reward normalization during evaluation

### VecFrameStack

Stacks observations from multiple consecutive frames.

```python
from stable_baselines3.common.vec_env import VecFrameStack

env = make_vec_env("PongNoFrameskip-v4", n_envs=8)

# Stack 4 frames
env = VecFrameStack(env, n_stack=4)

# Now observations have shape: (n_envs, n_stack, height, width)
model = PPO("CnnPolicy", env)
model.learn(total_timesteps=1000000)
```

**When to use:**
- Atari games (stack 4 frames)
- Environments where velocity information is needed
- Partial observability problems

### VecVideoRecorder

Records videos of agent behavior.

```python
from stable_baselines3.common.vec_env import VecVideoRecorder

env = make_vec_env("CartPole-v1", n_envs=1)

# Record videos
env = VecVideoRecorder(
    env,
    video_folder="./videos/",
    record_video_trigger=lambda x: x % 2000 == 0,  # Record every 2000 steps
    video_length=200,  # Max video length
    name_prefix="training"
)

model = PPO("MlpPolicy", env)
model.learn(total_timesteps=10000)
```

**Output:** MP4 videos in `./videos/` directory.

### VecCheckNan

Checks for NaN or infinite values in observations and rewards.

```python
from stable_baselines3.common.vec_env import VecCheckNan

env = make_vec_env("CustomEnv-v0", n_envs=4)

# Add NaN checking (useful for debugging)
env = VecCheckNan(env, raise_exception=True, warn_once=True)

model = PPO("MlpPolicy", env)
model.learn(total_timesteps=10000)
```

**When to use:**
- Debugging custom environments
- Catching numerical instabilities
- Validating environment implementation

### VecTransposeImage

Transposes image observations from (height, width, channels) to (channels, height, width).

```python
from stable_baselines3.common.vec_env import VecTransposeImage

env = make_vec_env("PongNoFrameskip-v4", n_envs=4)

# Convert HWC to CHW format
env = VecTransposeImage(env)

model = PPO("CnnPolicy", env)
```

**When to use:**
- When environment returns images in HWC format
- SB3 expects CHW format for CNN policies

## Advanced Usage

### Custom VecEnv

Create custom vectorized environment:

```python
from stable_baselines3.common.vec_env import DummyVecEnv
import gymnasium as gym

class CustomVecEnv(DummyVecEnv):
    def step_wait(self):
        # Custom logic before/after stepping
        obs, rewards, dones, infos = super().step_wait()
        # Modify observations/rewards/etc
        return obs, rewards, dones, infos
```

### Environment Method Calls

Call methods on wrapped environments:

```python
env = make_vec_env("MyEnv-v0", n_envs=4)

# Call method on all environments
env.env_method("set_difficulty", "hard")

# Call method on specific environment
env.env_method("reset_level", indices=[0, 2])

# Get attribute from all environments
levels = env.get_attr("current_level")
```

### Setting Attributes

```python
# Set attribute on all environments
env.set_attr("difficulty", "hard")

# Set attribute on specific environments
env.set_attr("max_steps", 1000, indices=[1, 3])
```

## Performance Optimization

### Choosing Number of Environments

**On-Policy (PPO, A2C):**
```python
# General rule: 4-16 environments
# More environments = faster data collection
n_envs = 8
env = make_vec_env("CartPole-v1", n_envs=n_envs)

# Adjust n_steps to maintain same rollout length
# Total steps per rollout = n_envs * n_steps
model = PPO("MlpPolicy", env, n_steps=128)  # 8*128 = 1024 steps/rollout
```

**Off-Policy (SAC, TD3, DQN):**
```python
# General rule: 1-4 environments
# More doesn't help as much (replay buffer provides diversity)
n_envs = 4
env = make_vec_env("Pendulum-v1", n_envs=n_envs)

model = SAC("MlpPolicy", env, gradient_steps=-1)  # 1 grad step per env step
```

### CPU Core Utilization

```python
import multiprocessing

# Use one less than total cores (leave one for Python main process)
n_cpus = multiprocessing.cpu_count() - 1
env = make_vec_env("MyEnv-v0", n_envs=n_cpus, vec_env_cls=SubprocVecEnv)
```

### Memory Considerations

```python
# Large replay buffer + many environments = high memory usage
# Reduce buffer size if memory constrained
model = SAC(
    "MlpPolicy",
    env,
    buffer_size=100_000,  # Reduced from 1M
)
```

## Common Issues

### Issue: "Can't pickle local object"

**Cause:** SubprocVecEnv requires picklable environments.

**Solution:** Define environment creation outside class/function:

```python
# Bad
def train():
    def make_env():
        return gym.make("CartPole-v1")
    env = SubprocVecEnv([make_env for _ in range(4)])

# Good
def make_env():
    return gym.make("CartPole-v1")

if __name__ == "__main__":
    env = SubprocVecEnv([make_env for _ in range(4)])
```

### Issue: Different behavior between single and vectorized env

**Cause:** Auto-reset in vectorized environments.

**Solution:** Handle terminal observations correctly:

```python
obs, rewards, dones, infos = env.step(actions)
for i, done in enumerate(dones):
    if done:
        terminal_obs = infos[i]["terminal_observation"]
        # Process terminal_obs if needed
```

### Issue: Slower with SubprocVecEnv than DummyVecEnv

**Cause:** Environment too lightweight (multiprocessing overhead > computation).

**Solution:** Use DummyVecEnv for simple environments:

```python
# For CartPole, use DummyVecEnv
env = make_vec_env("CartPole-v1", n_envs=8, vec_env_cls=DummyVecEnv)
```

### Issue: Training crashes with SubprocVecEnv

**Cause:** Environment not properly isolated or has shared state.

**Solution:**
- Ensure environment has no shared global state
- Wrap code in `if __name__ == "__main__":`
- Use DummyVecEnv for debugging

## Best Practices

1. **Use appropriate VecEnv type:**
   - DummyVecEnv: Simple environments (CartPole, basic grids)
   - SubprocVecEnv: Complex environments (MuJoCo, Unity, 3D games)

2. **Adjust hyperparameters for vectorization:**
   - Divide `eval_freq`, `save_freq` by `n_envs` in callbacks
   - Maintain same `n_steps * n_envs` for on-policy algorithms

3. **Save normalization statistics:**
   - Always save VecNormalize stats with model
   - Disable training during evaluation

4. **Monitor memory usage:**
   - More environments = more memory
   - Reduce buffer size if needed

5. **Test with DummyVecEnv first:**
   - Easier debugging
   - Ensure environment works before parallelizing

## Examples

### Basic Training Loop

```python
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from stable_baselines3.common.vec_env import SubprocVecEnv

# Create vectorized environment
env = make_vec_env("CartPole-v1", n_envs=8, vec_env_cls=SubprocVecEnv)

# Train
model = PPO("MlpPolicy", env, verbose=1)
model.learn(total_timesteps=100000)

# Evaluate
obs = env.reset()
for _ in range(1000):
    action, _states = model.predict(obs, deterministic=True)
    obs, rewards, dones, infos = env.step(action)
```

### With Normalization

```python
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from stable_baselines3.common.vec_env import VecNormalize

# Create and normalize
env = make_vec_env("Pendulum-v1", n_envs=4)
env = VecNormalize(env, norm_obs=True, norm_reward=True)

# Train
model = PPO("MlpPolicy", env)
model.learn(total_timesteps=50000)

# Save both
model.save("model")
env.save("vec_normalize.pkl")

# Load for evaluation
eval_env = make_vec_env("Pendulum-v1", n_envs=1)
eval_env = VecNormalize.load("vec_normalize.pkl", eval_env)
eval_env.training = False
eval_env.norm_reward = False

model = PPO.load("model", env=eval_env)
```

## Additional Resources

- Official SB3 VecEnv Guide: https://stable-baselines3.readthedocs.io/en/master/guide/vec_envs.html
- VecEnv API Reference: https://stable-baselines3.readthedocs.io/en/master/common/vec_env.html
- Multiprocessing Best Practices: https://docs.python.org/3/library/multiprocessing.html
