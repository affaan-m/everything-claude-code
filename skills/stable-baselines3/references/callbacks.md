# Stable Baselines3 Callback System

This document provides comprehensive information about the callback system in Stable Baselines3 for monitoring and controlling training.

## Overview

Callbacks are functions called at specific points during training to:
- Monitor training metrics
- Save checkpoints
- Implement early stopping
- Log custom metrics
- Adjust hyperparameters dynamically
- Trigger evaluations

## Built-in Callbacks

### EvalCallback

Evaluates the agent periodically and saves the best model.

```python
from stable_baselines3.common.callbacks import EvalCallback

eval_callback = EvalCallback(
    eval_env,                                    # Separate evaluation environment
    best_model_save_path="./logs/best_model/",  # Where to save best model
    log_path="./logs/eval/",                    # Where to save evaluation logs
    eval_freq=10000,                            # Evaluate every N steps
    n_eval_episodes=5,                          # Number of episodes per evaluation
    deterministic=True,                         # Use deterministic actions
    render=False,                               # Render during evaluation
    verbose=1,
    warn=True,
)

model.learn(total_timesteps=100000, callback=eval_callback)
```

**Key Features:**
- Automatically saves best model based on mean reward
- Logs evaluation metrics to TensorBoard
- Can stop training if reward threshold reached

**Important:** When using vectorized training environments, adjust `eval_freq`:
```python
# With 4 parallel environments, divide eval_freq by n_envs
eval_freq = 10000 // 4  # Evaluate every 10000 total environment steps
```

### CheckpointCallback

Saves model checkpoints at regular intervals.

```python
from stable_baselines3.common.callbacks import CheckpointCallback

checkpoint_callback = CheckpointCallback(
    save_freq=10000,                     # Save every N steps
    save_path="./logs/checkpoints/",     # Directory for checkpoints
    name_prefix="rl_model",              # Prefix for checkpoint files
    save_replay_buffer=True,             # Save replay buffer (off-policy only)
    save_vecnormalize=True,              # Save VecNormalize stats
    verbose=2,
)

model.learn(total_timesteps=100000, callback=checkpoint_callback)
```

**Output Files:**
- `rl_model_10000_steps.zip` - Model at 10k steps
- `rl_model_20000_steps.zip` - Model at 20k steps
- etc.

**Important:** Adjust `save_freq` for vectorized environments (divide by n_envs).

### StopTrainingOnRewardThreshold

Stops training when mean reward exceeds a threshold.

```python
from stable_baselines3.common.callbacks import StopTrainingOnRewardThreshold

stop_callback = StopTrainingOnRewardThreshold(
    reward_threshold=200,  # Stop when mean reward >= 200
    verbose=1,
)

# Must be used with EvalCallback
eval_callback = EvalCallback(
    eval_env,
    callback_on_new_best=stop_callback,  # Trigger when new best found
    eval_freq=10000,
    n_eval_episodes=5,
)

model.learn(total_timesteps=1000000, callback=eval_callback)
```

### StopTrainingOnNoModelImprovement

Stops training if model doesn't improve for N evaluations.

```python
from stable_baselines3.common.callbacks import StopTrainingOnNoModelImprovement

stop_callback = StopTrainingOnNoModelImprovement(
    max_no_improvement_evals=10,  # Stop after 10 evals with no improvement
    min_evals=20,                 # Minimum evaluations before stopping
    verbose=1,
)

# Use with EvalCallback
eval_callback = EvalCallback(
    eval_env,
    callback_after_eval=stop_callback,
    eval_freq=10000,
)

model.learn(total_timesteps=1000000, callback=eval_callback)
```

### StopTrainingOnMaxEpisodes

Stops training after a maximum number of episodes.

```python
from stable_baselines3.common.callbacks import StopTrainingOnMaxEpisodes

stop_callback = StopTrainingOnMaxEpisodes(
    max_episodes=1000,  # Stop after 1000 episodes
    verbose=1,
)

model.learn(total_timesteps=1000000, callback=stop_callback)
```

### ProgressBarCallback

Displays a progress bar during training (requires tqdm).

```python
from stable_baselines3.common.callbacks import ProgressBarCallback

progress_callback = ProgressBarCallback()

model.learn(total_timesteps=100000, callback=progress_callback)
```

**Output:**
```
100%|██████████| 100000/100000 [05:23<00:00, 309.31it/s]
```

## Creating Custom Callbacks

### BaseCallback Structure

```python
from stable_baselines3.common.callbacks import BaseCallback

class CustomCallback(BaseCallback):
    """
    Custom callback template.
    """

    def __init__(self, verbose=0):
        super().__init__(verbose)
        # Custom initialization

    def _init_callback(self) -> None:
        """
        Called once when training starts.
        Useful for initialization that requires access to model/env.
        """
        pass

    def _on_training_start(self) -> None:
        """
        Called before the first rollout starts.
        """
        pass

    def _on_rollout_start(self) -> None:
        """
        Called before collecting new samples (on-policy algorithms).
        """
        pass

    def _on_step(self) -> bool:
        """
        Called after every step in the environment.

        Returns:
            bool: If False, training will be stopped.
        """
        return True  # Continue training

    def _on_rollout_end(self) -> None:
        """
        Called after rollout ends (on-policy algorithms).
        """
        pass

    def _on_training_end(self) -> None:
        """
        Called at the end of training.
        """
        pass
```

### Useful Attributes

Inside callbacks, you have access to:

- **`self.model`**: The RL algorithm instance
- **`self.training_env`**: The training environment
- **`self.n_calls`**: Number of times `_on_step()` was called
- **`self.num_timesteps`**: Total number of environment steps
- **`self.locals`**: Local variables from the algorithm (varies by algorithm)
- **`self.globals`**: Global variables from the algorithm
- **`self.logger`**: Logger for TensorBoard/CSV logging
- **`self.parent`**: Parent callback (if used in CallbackList)

## Custom Callback Examples

### Example 1: Log Custom Metrics

```python
class LogCustomMetricsCallback(BaseCallback):
    """
    Log custom metrics to TensorBoard.
    """

    def __init__(self, verbose=0):
        super().__init__(verbose)
        self.episode_rewards = []

    def _on_step(self) -> bool:
        # Check if episode ended
        if self.locals["dones"][0]:
            # Log episode reward
            episode_reward = self.locals["infos"][0].get("episode", {}).get("r", 0)
            self.episode_rewards.append(episode_reward)

            # Log to TensorBoard
            self.logger.record("custom/episode_reward", episode_reward)
            self.logger.record("custom/mean_reward_last_100",
                             np.mean(self.episode_rewards[-100:]))

        return True
```

### Example 2: Adjust Learning Rate

```python
class LinearScheduleCallback(BaseCallback):
    """
    Linearly decrease learning rate during training.
    """

    def __init__(self, initial_lr=3e-4, final_lr=3e-5, verbose=0):
        super().__init__(verbose)
        self.initial_lr = initial_lr
        self.final_lr = final_lr

    def _on_step(self) -> bool:
        # Calculate progress (0 to 1)
        progress = self.num_timesteps / self.locals["total_timesteps"]

        # Linear interpolation
        new_lr = self.initial_lr + (self.final_lr - self.initial_lr) * progress

        # Update learning rate
        for param_group in self.model.policy.optimizer.param_groups:
            param_group["lr"] = new_lr

        # Log learning rate
        self.logger.record("train/learning_rate", new_lr)

        return True
```

### Example 3: Early Stopping on Moving Average

```python
class EarlyStoppingCallback(BaseCallback):
    """
    Stop training if moving average of rewards doesn't improve.
    """

    def __init__(self, check_freq=10000, min_reward=200, window=100, verbose=0):
        super().__init__(verbose)
        self.check_freq = check_freq
        self.min_reward = min_reward
        self.window = window
        self.rewards = []

    def _on_step(self) -> bool:
        # Collect episode rewards
        if self.locals["dones"][0]:
            reward = self.locals["infos"][0].get("episode", {}).get("r", 0)
            self.rewards.append(reward)

        # Check every check_freq steps
        if self.n_calls % self.check_freq == 0 and len(self.rewards) >= self.window:
            mean_reward = np.mean(self.rewards[-self.window:])
            if self.verbose > 0:
                print(f"Mean reward: {mean_reward:.2f}")

            if mean_reward >= self.min_reward:
                if self.verbose > 0:
                    print(f"Stopping: reward threshold reached!")
                return False  # Stop training

        return True  # Continue training
```

### Example 4: Save Best Model by Custom Metric

```python
class SaveBestModelCallback(BaseCallback):
    """
    Save model when custom metric is best.
    """

    def __init__(self, check_freq=1000, save_path="./best_model/", verbose=0):
        super().__init__(verbose)
        self.check_freq = check_freq
        self.save_path = save_path
        self.best_score = -np.inf

    def _init_callback(self) -> None:
        if self.save_path is not None:
            os.makedirs(self.save_path, exist_ok=True)

    def _on_step(self) -> bool:
        if self.n_calls % self.check_freq == 0:
            # Calculate custom metric (example: policy entropy)
            custom_metric = self.locals.get("entropy_losses", [0])[-1]

            if custom_metric > self.best_score:
                self.best_score = custom_metric
                if self.verbose > 0:
                    print(f"New best! Saving model to {self.save_path}")
                self.model.save(os.path.join(self.save_path, "best_model"))

        return True
```

### Example 5: Log Environment-Specific Information

```python
class EnvironmentInfoCallback(BaseCallback):
    """
    Log custom info from environment.
    """

    def _on_step(self) -> bool:
        # Access info dict from environment
        info = self.locals["infos"][0]

        # Log custom metrics from environment
        if "distance_to_goal" in info:
            self.logger.record("env/distance_to_goal", info["distance_to_goal"])

        if "success" in info:
            self.logger.record("env/success_rate", info["success"])

        return True
```

## Chaining Multiple Callbacks

Use `CallbackList` to combine multiple callbacks:

```python
from stable_baselines3.common.callbacks import CallbackList

callback_list = CallbackList([
    eval_callback,
    checkpoint_callback,
    progress_callback,
    custom_callback,
])

model.learn(total_timesteps=100000, callback=callback_list)
```

Or pass a list directly:

```python
model.learn(
    total_timesteps=100000,
    callback=[eval_callback, checkpoint_callback, custom_callback]
)
```

## Event-Based Callbacks

Callbacks can trigger other callbacks on specific events:

```python
from stable_baselines3.common.callbacks import EventCallback

# Stop training when reward threshold reached
stop_callback = StopTrainingOnRewardThreshold(reward_threshold=200)

# Evaluate periodically and trigger stop_callback when new best found
eval_callback = EvalCallback(
    eval_env,
    callback_on_new_best=stop_callback,  # Triggered when new best model
    eval_freq=10000,
)
```

## Logging to TensorBoard

Use `self.logger.record()` to log metrics:

```python
class TensorBoardCallback(BaseCallback):
    def _on_step(self) -> bool:
        # Log scalar
        self.logger.record("custom/my_metric", value)

        # Log multiple metrics
        self.logger.record("custom/metric1", value1)
        self.logger.record("custom/metric2", value2)

        # Logger automatically writes to TensorBoard
        return True
```

**View in TensorBoard:**
```bash
tensorboard --logdir ./logs/
```

## Advanced Patterns

### Curriculum Learning

```python
class CurriculumCallback(BaseCallback):
    """
    Increase task difficulty over time.
    """

    def __init__(self, difficulty_schedule, verbose=0):
        super().__init__(verbose)
        self.difficulty_schedule = difficulty_schedule

    def _on_step(self) -> bool:
        # Update environment difficulty based on progress
        progress = self.num_timesteps / self.locals["total_timesteps"]

        for threshold, difficulty in self.difficulty_schedule:
            if progress >= threshold:
                self.training_env.env_method("set_difficulty", difficulty)

        return True
```

### Population-Based Training

```python
class PopulationBasedCallback(BaseCallback):
    """
    Adjust hyperparameters based on performance.
    """

    def __init__(self, check_freq=10000, verbose=0):
        super().__init__(verbose)
        self.check_freq = check_freq
        self.performance_history = []

    def _on_step(self) -> bool:
        if self.n_calls % self.check_freq == 0:
            # Evaluate performance
            perf = self._evaluate_performance()
            self.performance_history.append(perf)

            # Adjust hyperparameters if performance plateaus
            if len(self.performance_history) >= 3:
                recent = self.performance_history[-3:]
                if max(recent) - min(recent) < 0.01:  # Plateau detected
                    self._adjust_hyperparameters()

        return True

    def _adjust_hyperparameters(self):
        # Example: increase learning rate
        for param_group in self.model.policy.optimizer.param_groups:
            param_group["lr"] *= 1.2
```

## Debugging Tips

### Print Available Attributes

```python
class DebugCallback(BaseCallback):
    def _on_step(self) -> bool:
        if self.n_calls == 1:
            print("Available in self.locals:")
            for key in self.locals.keys():
                print(f"  {key}: {type(self.locals[key])}")
        return True
```

### Common Issues

1. **Callback not being called:**
   - Ensure callback is passed to `model.learn()`
   - Check that `_on_step()` returns `True`

2. **AttributeError in callback:**
   - Not all attributes available in all callbacks
   - Use `self.locals.get("key", default)` for safety

3. **Memory leaks:**
   - Don't store large arrays in callback state
   - Clear buffers periodically

4. **Performance impact:**
   - Minimize computation in `_on_step()` (called every step)
   - Use `check_freq` to limit expensive operations

## Best Practices

1. **Use appropriate callback timing:**
   - `_on_step()`: For metrics that change every step
   - `_on_rollout_end()`: For metrics computed over rollouts
   - `_init_callback()`: For one-time initialization

2. **Log efficiently:**
   - Don't log every step (hurts performance)
   - Aggregate metrics and log periodically

3. **Handle vectorized environments:**
   - Remember that `dones`, `infos`, etc. are arrays
   - Check `dones[i]` for each environment

4. **Test callbacks independently:**
   - Create simple test cases
   - Verify callback behavior before long training runs

5. **Document custom callbacks:**
   - Clear docstrings
   - Example usage in comments

## Additional Resources

- Official SB3 Callbacks Guide: https://stable-baselines3.readthedocs.io/en/master/guide/callbacks.html
- Callback API Reference: https://stable-baselines3.readthedocs.io/en/master/common/callbacks.html
- TensorBoard Documentation: https://www.tensorflow.org/tensorboard
