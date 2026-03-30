"""
Template for creating custom Gymnasium environments compatible with Stable Baselines3.

This template demonstrates:
- Proper Gymnasium environment structure
- Observation and action space definition
- Step and reset implementation
- Validation with SB3's env_checker
- Registration with Gymnasium
"""

import gymnasium as gym
from gymnasium import spaces
import numpy as np


class CustomEnv(gym.Env):
    """
    Custom Gymnasium Environment Template.

    This is a template for creating custom environments that work with
    Stable Baselines3. Modify the observation space, action space, reward
    function, and state transitions to match your specific problem.

    Example:
        A simple grid world where the agent tries to reach a goal position.
    """

    # Optional: Provide metadata for rendering modes
    metadata = {"render_modes": ["human", "rgb_array"], "render_fps": 30}

    def __init__(self, grid_size=5, render_mode=None):
        """
        Initialize the environment.

        Args:
            grid_size: Size of the grid world (grid_size x grid_size)
            render_mode: How to render ('human', 'rgb_array', or None)
        """
        super().__init__()

        self.grid_size = grid_size
        self.render_mode = render_mode

        # Define action space
        # Example: 4 discrete actions (up, down, left, right)
        self.action_space = spaces.Discrete(4)

        # Define observation space
        # Example: 2D position [x, y] in continuous space
        # Note: Use np.float32 for observations (SB3 recommendation)
        self.observation_space = spaces.Box(
            low=0,
            high=grid_size - 1,
            shape=(2,),
            dtype=np.float32,
        )

        # Alternative observation spaces:
        # 1. Discrete: spaces.Discrete(n)
        # 2. Multi-discrete: spaces.MultiDiscrete([n1, n2, ...])
        # 3. Multi-binary: spaces.MultiBinary(n)
        # 4. Box (continuous): spaces.Box(low=, high=, shape=, dtype=np.float32)
        # 5. Dict: spaces.Dict({"key1": space1, "key2": space2})

        # For image observations (e.g., 84x84 RGB image):
        # self.observation_space = spaces.Box(
        #     low=0,
        #     high=255,
        #     shape=(3, 84, 84),  # (channels, height, width) - channel-first
        #     dtype=np.uint8,
        # )

        # Initialize state
        self._agent_position = None
        self._goal_position = None

    def reset(self, seed=None, options=None):
        """
        Reset the environment to initial state.

        Args:
            seed: Random seed for reproducibility
            options: Additional options (optional)

        Returns:
            observation: Initial observation
            info: Additional information dictionary
        """
        # Set seed for reproducibility
        super().reset(seed=seed)

        # Initialize agent position randomly
        self._agent_position = self.np_random.integers(0, self.grid_size, size=2)

        # Initialize goal position (different from agent)
        self._goal_position = self.np_random.integers(0, self.grid_size, size=2)
        while np.array_equal(self._agent_position, self._goal_position):
            self._goal_position = self.np_random.integers(0, self.grid_size, size=2)

        observation = self._get_obs()
        info = self._get_info()

        return observation, info

    def step(self, action):
        """
        Execute one step in the environment.

        Args:
            action: Action to take

        Returns:
            observation: New observation
            reward: Reward for this step
            terminated: Whether episode has ended (goal reached)
            truncated: Whether episode was truncated (time limit, etc.)
            info: Additional information dictionary
        """
        # Map action to direction (0: up, 1: down, 2: left, 3: right)
        direction = np.array([
            [-1, 0],  # up
            [1, 0],   # down
            [0, -1],  # left
            [0, 1],   # right
        ])[action]

        # Update agent position (clip to stay within grid)
        self._agent_position = np.clip(
            self._agent_position + direction,
            0,
            self.grid_size - 1,
        )

        # Check if goal is reached
        terminated = np.array_equal(self._agent_position, self._goal_position)

        # Calculate reward
        if terminated:
            reward = 1.0  # Goal reached
        else:
            # Negative reward based on distance to goal (encourages efficiency)
            distance = np.linalg.norm(self._agent_position - self._goal_position)
            reward = -0.1 * distance

        # Episode not truncated in this example (no time limit)
        truncated = False

        observation = self._get_obs()
        info = self._get_info()

        return observation, reward, terminated, truncated, info

    def _get_obs(self):
        """
        Get current observation.

        Returns:
            observation: Current state as defined by observation_space
        """
        # Return agent position as observation
        return self._agent_position.astype(np.float32)

        # For dict observations:
        # return {
        #     "agent": self._agent_position.astype(np.float32),
        #     "goal": self._goal_position.astype(np.float32),
        # }

    def _get_info(self):
        """
        Get additional information (for debugging/logging).

        Returns:
            info: Dictionary with additional information
        """
        return {
            "agent_position": self._agent_position,
            "goal_position": self._goal_position,
            "distance_to_goal": np.linalg.norm(
                self._agent_position - self._goal_position
            ),
        }

    def render(self):
        """
        Render the environment.

        Returns:
            Rendered frame (if render_mode is 'rgb_array')
        """
        if self.render_mode == "human":
            # Print simple text-based rendering
            grid = np.zeros((self.grid_size, self.grid_size), dtype=str)
            grid[:, :] = "."
            grid[tuple(self._agent_position)] = "A"
            grid[tuple(self._goal_position)] = "G"

            print("\n" + "=" * (self.grid_size * 2 + 1))
            for row in grid:
                print(" ".join(row))
            print("=" * (self.grid_size * 2 + 1) + "\n")

        elif self.render_mode == "rgb_array":
            # Return RGB array for video recording
            # This is a placeholder - implement proper rendering as needed
            canvas = np.zeros((
                self.grid_size * 50,
                self.grid_size * 50,
                3
            ), dtype=np.uint8)
            # Draw agent and goal on canvas
            # ... (implement visual rendering)
            return canvas

    def close(self):
        """
        Clean up environment resources.
        """
        pass


# Optional: Register the environment with Gymnasium
# This allows creating the environment with gym.make("CustomEnv-v0")
gym.register(
    id="CustomEnv-v0",
    entry_point=__name__ + ":CustomEnv",
    max_episode_steps=100,
)


def validate_environment():
    """
    Validate the custom environment with SB3's env_checker.
    """
    from stable_baselines3.common.env_checker import check_env

    print("Validating custom environment...")
    env = CustomEnv()
    check_env(env, warn=True)
    print("Environment validation passed!")


def test_environment():
    """
    Test the custom environment with random actions.
    """
    print("Testing environment with random actions...")
    env = CustomEnv(render_mode="human")

    obs, info = env.reset()
    print(f"Initial observation: {obs}")
    print(f"Initial info: {info}")

    for step in range(10):
        action = env.action_space.sample()  # Random action
        obs, reward, terminated, truncated, info = env.step(action)

        print(f"\nStep {step + 1}:")
        print(f"  Action: {action}")
        print(f"  Observation: {obs}")
        print(f"  Reward: {reward:.3f}")
        print(f"  Terminated: {terminated}")
        print(f"  Info: {info}")

        env.render()

        if terminated or truncated:
            print("Episode finished!")
            break

    env.close()


def train_on_custom_env():
    """
    Train a PPO agent on the custom environment.
    """
    from stable_baselines3 import PPO

    print("Training PPO agent on custom environment...")

    # Create environment
    env = CustomEnv()

    # Validate first
    from stable_baselines3.common.env_checker import check_env
    check_env(env, warn=True)

    # Train agent
    model = PPO("MlpPolicy", env, verbose=1)
    model.learn(total_timesteps=10000)

    # Test trained agent
    obs, info = env.reset()
    for _ in range(20):
        action, _states = model.predict(obs, deterministic=True)
        obs, reward, terminated, truncated, info = env.step(action)
        if terminated or truncated:
            print(f"Goal reached! Final reward: {reward}")
            break

    env.close()


if __name__ == "__main__":
    # Validate the environment
    validate_environment()

    # Test with random actions
    # test_environment()

    # Train an agent
    # train_on_custom_env()
