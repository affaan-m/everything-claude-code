# Creating Custom Environments for Stable Baselines3

This guide provides comprehensive information for creating custom Gymnasium environments compatible with Stable Baselines3.

## Environment Structure

### Required Methods

Every custom environment must inherit from `gymnasium.Env` and implement:

```python
import gymnasium as gym
from gymnasium import spaces
import numpy as np

class CustomEnv(gym.Env):
    def __init__(self):
        """Initialize environment, define action_space and observation_space"""
        super().__init__()
        self.action_space = spaces.Discrete(4)
        self.observation_space = spaces.Box(low=0, high=1, shape=(4,), dtype=np.float32)

    def reset(self, seed=None, options=None):
        """Reset environment to initial state"""
        super().reset(seed=seed)
        observation = self.observation_space.sample()
        info = {}
        return observation, info

    def step(self, action):
        """Execute one timestep"""
        observation = self.observation_space.sample()
        reward = 0.0
        terminated = False  # Episode ended naturally
        truncated = False   # Episode ended due to time limit
        info = {}
        return observation, reward, terminated, truncated, info

    def render(self):
        """Visualize environment (optional)"""
        pass

    def close(self):
        """Cleanup resources (optional)"""
        pass
```

### Method Details

#### `__init__(self, ...)`

**Purpose:** Initialize the environment and define spaces.

**Requirements:**
- Must call `super().__init__()`
- Must define `self.action_space`
- Must define `self.observation_space`

**Example:**
```python
def __init__(self, grid_size=10, max_steps=100):
    super().__init__()
    self.grid_size = grid_size
    self.max_steps = max_steps
    self.current_step = 0

    # Define spaces
    self.action_space = spaces.Discrete(4)
    self.observation_space = spaces.Box(
        low=0, high=grid_size-1, shape=(2,), dtype=np.float32
    )
```

#### `reset(self, seed=None, options=None)`

**Purpose:** Reset the environment to an initial state.

**Requirements:**
- Must call `super().reset(seed=seed)`
- Must return `(observation, info)` tuple
- Observation must match `observation_space`
- Info must be a dictionary (can be empty)

**Example:**
```python
def reset(self, seed=None, options=None):
    super().reset(seed=seed)

    # Initialize state
    self.agent_pos = self.np_random.integers(0, self.grid_size, size=2)
    self.goal_pos = self.np_random.integers(0, self.grid_size, size=2)
    self.current_step = 0

    observation = self._get_observation()
    info = {"episode": "started"}

    return observation, info
```

#### `step(self, action)`

**Purpose:** Execute one timestep in the environment.

**Requirements:**
- Must return 5-tuple: `(observation, reward, terminated, truncated, info)`
- Action must be valid according to `action_space`
- Observation must match `observation_space`
- Reward should be a float
- Terminated: True if episode ended naturally (goal reached, failure, etc.)
- Truncated: True if episode ended due to time limit
- Info must be a dictionary

**Example:**
```python
def step(self, action):
    # Apply action
    self.agent_pos += self._action_to_direction(action)
    self.agent_pos = np.clip(self.agent_pos, 0, self.grid_size - 1)
    self.current_step += 1

    # Calculate reward
    distance = np.linalg.norm(self.agent_pos - self.goal_pos)
    goal_reached = distance < 1.0

    if goal_reached:
        reward = 100.0
    else:
        reward = -distance * 0.1

    # Check termination conditions
    terminated = goal_reached
    truncated = self.current_step >= self.max_steps

    observation = self._get_observation()
    info = {"distance": distance, "steps": self.current_step}

    return observation, reward, terminated, truncated, info
```

## Space Types

### Discrete

For discrete actions (e.g., {0, 1, 2, 3}).

```python
self.action_space = spaces.Discrete(4)  # 4 actions: 0, 1, 2, 3
```

**Important:** SB3 does NOT support `Discrete` spaces with `start != 0`. Always start from 0.

### Box (Continuous)

For continuous values within a range.

```python
# 1D continuous action in [-1, 1]
self.action_space = spaces.Box(low=-1, high=1, shape=(1,), dtype=np.float32)

# 2D position observation
self.observation_space = spaces.Box(
    low=0, high=10, shape=(2,), dtype=np.float32
)

# 3D RGB image (channel-first format)
self.observation_space = spaces.Box(
    low=0, high=255, shape=(3, 84, 84), dtype=np.uint8
)
```

**Important for Images:**
- Must be `dtype=np.uint8` in range [0, 255]
- Use **channel-first** format: (channels, height, width)
- SB3 automatically normalizes by dividing by 255
- Set `normalize_images=False` in policy_kwargs if pre-normalized

### MultiDiscrete

For multiple discrete variables.

```python
# Two discrete variables: first with 3 options, second with 4 options
self.action_space = spaces.MultiDiscrete([3, 4])
```

### MultiBinary

For binary vectors.

```python
# 5 binary flags
self.action_space = spaces.MultiBinary(5)  # e.g., [0, 1, 1, 0, 1]
```

### Dict

For dictionary observations (e.g., combining image with sensors).

```python
self.observation_space = spaces.Dict({
    "image": spaces.Box(low=0, high=255, shape=(3, 64, 64), dtype=np.uint8),
    "vector": spaces.Box(low=-10, high=10, shape=(4,), dtype=np.float32),
    "discrete": spaces.Discrete(3),
})
```

**Important:** When using Dict observations, use `"MultiInputPolicy"` instead of `"MlpPolicy"`.

```python
model = PPO("MultiInputPolicy", env, verbose=1)
```

### Tuple

For tuple observations (less common).

```python
self.observation_space = spaces.Tuple((
    spaces.Box(low=0, high=1, shape=(4,), dtype=np.float32),
    spaces.Discrete(3),
))
```

## Important Constraints and Best Practices

### Data Types

- **Observations:** Use `np.float32` for continuous values
- **Images:** Use `np.uint8` in range [0, 255]
- **Rewards:** Return Python float or `np.float32`
- **Terminated/Truncated:** Return Python bool

### Random Number Generation

Always use `self.np_random` for reproducibility:

```python
def reset(self, seed=None, options=None):
    super().reset(seed=seed)
    # Use self.np_random instead of np.random
    random_pos = self.np_random.integers(0, 10, size=2)
    random_float = self.np_random.random()
```

### Episode Termination

- **Terminated:** Natural ending (goal reached, agent died, etc.)
- **Truncated:** Artificial ending (time limit, external interrupt)

```python
def step(self, action):
    # ... environment logic ...

    goal_reached = self._check_goal()
    time_limit_exceeded = self.current_step >= self.max_steps

    terminated = goal_reached  # Natural ending
    truncated = time_limit_exceeded  # Time limit

    return observation, reward, terminated, truncated, info
```

### Info Dictionary

Use the info dict for debugging and logging:

```python
info = {
    "episode_length": self.current_step,
    "distance_to_goal": distance,
    "success": goal_reached,
    "total_reward": self.cumulative_reward,
}
```

**Special Keys:**
- `"terminal_observation"`: Automatically added by VecEnv when episode ends

## Advanced Features

### Metadata

Provide rendering information:

```python
class CustomEnv(gym.Env):
    metadata = {
        "render_modes": ["human", "rgb_array"],
        "render_fps": 30,
    }

    def __init__(self, render_mode=None):
        super().__init__()
        self.render_mode = render_mode
        # ...
```

### Render Modes

```python
def render(self):
    if self.render_mode == "human":
        # Print or display for human viewing
        print(f"Agent at {self.agent_pos}")

    elif self.render_mode == "rgb_array":
        # Return numpy array (height, width, 3) for video recording
        canvas = np.zeros((500, 500, 3), dtype=np.uint8)
        # Draw environment on canvas
        return canvas
```

### Goal-Conditioned Environments (for HER)

For Hindsight Experience Replay, use specific observation structure:

```python
self.observation_space = spaces.Dict({
    "observation": spaces.Box(low=-10, high=10, shape=(3,), dtype=np.float32),
    "achieved_goal": spaces.Box(low=-10, high=10, shape=(3,), dtype=np.float32),
    "desired_goal": spaces.Box(low=-10, high=10, shape=(3,), dtype=np.float32),
})

def compute_reward(self, achieved_goal, desired_goal, info):
    """Required for HER environments"""
    distance = np.linalg.norm(achieved_goal - desired_goal)
    return -distance
```

## Environment Validation

Always validate your environment before training:

```python
from stable_baselines3.common.env_checker import check_env

env = CustomEnv()
check_env(env, warn=True)
```

**Common Validation Errors:**

1. **"Observation is not within bounds"**
   - Check that observations stay within defined space
   - Ensure correct dtype (np.float32 for Box spaces)

2. **"Reset should return tuple"**
   - Return `(observation, info)`, not just observation

3. **"Step should return 5-tuple"**
   - Return `(obs, reward, terminated, truncated, info)`

4. **"Action is out of bounds"**
   - Verify action_space definition matches expected actions

5. **"Observation/Action dtype mismatch"**
   - Ensure observations match space dtype (usually np.float32)

## Environment Registration

Register your environment with Gymnasium:

```python
import gymnasium as gym
from gymnasium.envs.registration import register

register(
    id="MyCustomEnv-v0",
    entry_point="my_module:CustomEnv",
    max_episode_steps=200,
    kwargs={"grid_size": 10},  # Default kwargs
)

# Now can use with gym.make
env = gym.make("MyCustomEnv-v0")
```

## Testing Custom Environments

### Basic Testing

```python
def test_environment(env, n_episodes=5):
    """Test environment with random actions"""
    for episode in range(n_episodes):
        obs, info = env.reset()
        episode_reward = 0
        done = False
        steps = 0

        while not done:
            action = env.action_space.sample()
            obs, reward, terminated, truncated, info = env.step(action)
            episode_reward += reward
            steps += 1
            done = terminated or truncated

        print(f"Episode {episode+1}: Reward={episode_reward:.2f}, Steps={steps}")
```

### Training Test

```python
from stable_baselines3 import PPO

def train_test(env, timesteps=10000):
    """Quick training test"""
    model = PPO("MlpPolicy", env, verbose=1)
    model.learn(total_timesteps=timesteps)

    # Evaluate
    obs, info = env.reset()
    for _ in range(100):
        action, _states = model.predict(obs, deterministic=True)
        obs, reward, terminated, truncated, info = env.step(action)
        if terminated or truncated:
            break
```

## Common Patterns

### Grid World

```python
class GridWorldEnv(gym.Env):
    def __init__(self, size=10):
        super().__init__()
        self.size = size
        self.action_space = spaces.Discrete(4)  # up, down, left, right
        self.observation_space = spaces.Box(0, size-1, shape=(2,), dtype=np.float32)
```

### Continuous Control

```python
class ContinuousEnv(gym.Env):
    def __init__(self):
        super().__init__()
        self.action_space = spaces.Box(low=-1, high=1, shape=(2,), dtype=np.float32)
        self.observation_space = spaces.Box(low=-np.inf, high=np.inf, shape=(8,), dtype=np.float32)
```

### Image-Based Environment

```python
class VisionEnv(gym.Env):
    def __init__(self):
        super().__init__()
        self.action_space = spaces.Discrete(4)
        # Channel-first: (channels, height, width)
        self.observation_space = spaces.Box(
            low=0, high=255, shape=(3, 84, 84), dtype=np.uint8
        )
```

### Multi-Modal Environment

```python
class MultiModalEnv(gym.Env):
    def __init__(self):
        super().__init__()
        self.action_space = spaces.Discrete(4)
        self.observation_space = spaces.Dict({
            "image": spaces.Box(0, 255, shape=(3, 64, 64), dtype=np.uint8),
            "sensors": spaces.Box(-10, 10, shape=(4,), dtype=np.float32),
        })
```

## Performance Considerations

### Efficient Observation Generation

```python
# Pre-allocate arrays
def __init__(self):
    # ...
    self._obs_buffer = np.zeros(self.observation_space.shape, dtype=np.float32)

def _get_observation(self):
    # Reuse buffer instead of allocating new array
    self._obs_buffer[0] = self.agent_x
    self._obs_buffer[1] = self.agent_y
    return self._obs_buffer
```

### Vectorization

Make environment operations vectorizable:

```python
# Good: Uses numpy operations
def step(self, action):
    direction = np.array([[0,1], [0,-1], [1,0], [-1,0]])[action]
    self.pos = np.clip(self.pos + direction, 0, self.size-1)

# Avoid: Python loops when possible
# for i in range(len(self.agents)):
#     self.agents[i].update()
```

## Troubleshooting

### "Observation out of bounds"
- Check that all observations are within defined space
- Verify correct dtype (np.float32 vs np.float64)

### "NaN or Inf in observation/reward"
- Add checks: `assert np.isfinite(reward)`
- Use `VecCheckNan` wrapper to catch issues

### "Policy doesn't learn"
- Check reward scaling (normalize rewards)
- Verify observation normalization
- Ensure reward signal is meaningful
- Check if exploration is sufficient

### "Training crashes"
- Validate environment with `check_env()`
- Check for race conditions in custom env
- Verify action/observation spaces are consistent

## Additional Resources

- Template: See `scripts/custom_env_template.py`
- Gymnasium Documentation: https://gymnasium.farama.org/
- SB3 Custom Env Guide: https://stable-baselines3.readthedocs.io/en/master/guide/custom_env.html
