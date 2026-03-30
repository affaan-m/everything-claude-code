#!/usr/bin/env python3
"""
PufferLib Environment Template

This template provides a starting point for creating custom PufferEnv environments.
Customize the observation space, action space, and environment logic for your task.
"""

import numpy as np
import pufferlib
from pufferlib import PufferEnv


class MyEnvironment(PufferEnv):
    """
    Custom PufferLib environment template.

    This is a simple grid world example. Customize it for your specific task.
    """

    def __init__(self, buf=None, grid_size=10, max_steps=1000):
        """
        Initialize environment.

        Args:
            buf: Shared memory buffer (managed by PufferLib)
            grid_size: Size of the grid world
            max_steps: Maximum steps per episode
        """
        super().__init__(buf)

        self.grid_size = grid_size
        self.max_steps = max_steps

        # Define observation space
        # Option 1: Flat vector observation
        self.observation_space = self.make_space((4,))  # [x, y, goal_x, goal_y]

        # Option 2: Dict observation with multiple components
        # self.observation_space = self.make_space({
        #     'position': (2,),
        #     'goal': (2,),
        #     'grid': (grid_size, grid_size)
        # })

        # Option 3: Image observation
        # self.observation_space = self.make_space((grid_size, grid_size, 3))

        # Define action space
        # Option 1: Discrete actions
        self.action_space = self.make_discrete(4)  # 0: up, 1: right, 2: down, 3: left

        # Option 2: Continuous actions
        # self.action_space = self.make_space((2,))  # [dx, dy]

        # Option 3: Multi-discrete actions
        # self.action_space = self.make_multi_discrete([3, 3])  # Two 3-way choices

        # Initialize state
        self.agent_pos = None
        self.goal_pos = None
        self.step_count = 0

        self.reset()

    def reset(self):
        """
        Reset environment to initial state.

        Returns:
            observation: Initial observation
        """
        # Reset state
        self.agent_pos = np.array([0, 0], dtype=np.float32)
        self.goal_pos = np.array([self.grid_size - 1, self.grid_size - 1], dtype=np.float32)
        self.step_count = 0

        # Return initial observation
        return self._get_observation()

    def step(self, action):
        """
        Execute one environment step.

        Args:
            action: Action to take

        Returns:
            observation: New observation
            reward: Reward for this step
            done: Whether episode is complete
            info: Additional information
        """
        self.step_count += 1

        # Execute action
        self._apply_action(action)

        # Compute reward
        reward = self._compute_reward()

        # Check if episode is done
        done = self._is_done()

        # Get new observation
        observation = self._get_observation()

        # Additional info
        info = {}
        if done:
            # Include episode statistics when episode ends
            info['episode'] = {
                'r': reward,
                'l': self.step_count
            }

        return observation, reward, done, info

    def _apply_action(self, action):
        """Apply action to update environment state."""
        # Discrete actions: 0=up, 1=right, 2=down, 3=left
        if action == 0:  # Up
            self.agent_pos[1] = min(self.agent_pos[1] + 1, self.grid_size - 1)
        elif action == 1:  # Right
            self.agent_pos[0] = min(self.agent_pos[0] + 1, self.grid_size - 1)
        elif action == 2:  # Down
            self.agent_pos[1] = max(self.agent_pos[1] - 1, 0)
        elif action == 3:  # Left
            self.agent_pos[0] = max(self.agent_pos[0] - 1, 0)

    def _compute_reward(self):
        """Compute reward for current state."""
        # Distance to goal
        distance = np.linalg.norm(self.agent_pos - self.goal_pos)

        # Reward shaping: negative distance + bonus for reaching goal
        reward = -distance / self.grid_size

        # Goal reached
        if distance < 0.5:
            reward += 10.0

        return reward

    def _is_done(self):
        """Check if episode is complete."""
        # Episode ends if goal reached or max steps exceeded
        distance = np.linalg.norm(self.agent_pos - self.goal_pos)
        goal_reached = distance < 0.5
        timeout = self.step_count >= self.max_steps

        return goal_reached or timeout

    def _get_observation(self):
        """Generate observation from current state."""
        # Return flat vector observation
        observation = np.concatenate([
            self.agent_pos,
            self.goal_pos
        ]).astype(np.float32)

        return observation


class MultiAgentEnvironment(PufferEnv):
    """
    Multi-agent environment template.

    Example: Cooperative navigation task where agents must reach individual goals.
    """

    def __init__(self, buf=None, num_agents=4, grid_size=10, max_steps=1000):
        super().__init__(buf)

        self.num_agents = num_agents
        self.grid_size = grid_size
        self.max_steps = max_steps

        # Per-agent observation space
        self.single_observation_space = self.make_space({
            'position': (2,),
            'goal': (2,),
            'others': (2 * (num_agents - 1),)  # Positions of other agents
        })

        # Per-agent action space
        self.single_action_space = self.make_discrete(5)  # 4 directions + stay

        # Initialize state
        self.agent_positions = None
        self.goal_positions = None
        self.step_count = 0

        self.reset()

    def reset(self):
        """Reset all agents."""
        # Random initial positions
        self.agent_positions = np.random.rand(self.num_agents, 2) * self.grid_size

        # Random goal positions
        self.goal_positions = np.random.rand(self.num_agents, 2) * self.grid_size

        self.step_count = 0

        # Return observations for all agents
        return {
            f'agent_{i}': self._get_obs(i)
            for i in range(self.num_agents)
        }

    def step(self, actions):
        """
        Step all agents.

        Args:
            actions: Dict of {agent_id: action}

        Returns:
            observations: Dict of {agent_id: observation}
            rewards: Dict of {agent_id: reward}
            dones: Dict of {agent_id: done}
            infos: Dict of {agent_id: info}
        """
        self.step_count += 1

        observations = {}
        rewards = {}
        dones = {}
        infos = {}

        # Update all agents
        for agent_id, action in actions.items():
            agent_idx = int(agent_id.split('_')[1])

            # Apply action
            self._apply_action(agent_idx, action)

            # Generate outputs
            observations[agent_id] = self._get_obs(agent_idx)
            rewards[agent_id] = self._compute_reward(agent_idx)
            dones[agent_id] = self._is_done(agent_idx)
            infos[agent_id] = {}

        # Global done condition
        dones['__all__'] = all(dones.values()) or self.step_count >= self.max_steps

        return observations, rewards, dones, infos

    def _apply_action(self, agent_idx, action):
        """Apply action for specific agent."""
        if action == 0:  # Up
            self.agent_positions[agent_idx, 1] += 1
        elif action == 1:  # Right
            self.agent_positions[agent_idx, 0] += 1
        elif action == 2:  # Down
            self.agent_positions[agent_idx, 1] -= 1
        elif action == 3:  # Left
            self.agent_positions[agent_idx, 0] -= 1
        # action == 4: Stay

        # Clip to grid bounds
        self.agent_positions[agent_idx] = np.clip(
            self.agent_positions[agent_idx],
            0,
            self.grid_size - 1
        )

    def _compute_reward(self, agent_idx):
        """Compute reward for specific agent."""
        distance = np.linalg.norm(
            self.agent_positions[agent_idx] - self.goal_positions[agent_idx]
        )
        return -distance / self.grid_size

    def _is_done(self, agent_idx):
        """Check if specific agent is done."""
        distance = np.linalg.norm(
            self.agent_positions[agent_idx] - self.goal_positions[agent_idx]
        )
        return distance < 0.5

    def _get_obs(self, agent_idx):
        """Get observation for specific agent."""
        # Get positions of other agents
        other_positions = np.concatenate([
            self.agent_positions[i]
            for i in range(self.num_agents)
            if i != agent_idx
        ])

        return {
            'position': self.agent_positions[agent_idx].astype(np.float32),
            'goal': self.goal_positions[agent_idx].astype(np.float32),
            'others': other_positions.astype(np.float32)
        }


def test_environment():
    """Test environment to verify it works correctly."""
    print("Testing single-agent environment...")
    env = MyEnvironment()

    obs = env.reset()
    print(f"Initial observation shape: {obs.shape}")

    for step in range(10):
        action = env.action_space.sample()
        obs, reward, done, info = env.step(action)

        print(f"Step {step}: reward={reward:.3f}, done={done}")

        if done:
            obs = env.reset()
            print("Episode finished, resetting...")

    print("\nTesting multi-agent environment...")
    multi_env = MultiAgentEnvironment(num_agents=4)

    obs = multi_env.reset()
    print(f"Number of agents: {len(obs)}")

    for step in range(10):
        actions = {
            agent_id: multi_env.single_action_space.sample()
            for agent_id in obs.keys()
        }
        obs, rewards, dones, infos = multi_env.step(actions)

        print(f"Step {step}: mean_reward={np.mean(list(rewards.values())):.3f}")

        if dones.get('__all__', False):
            obs = multi_env.reset()
            print("Episode finished, resetting...")

    print("\n✓ Environment tests passed!")


if __name__ == '__main__':
    test_environment()
