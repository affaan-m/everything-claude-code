"""
Template script for evaluating trained RL agents with Stable Baselines3.

This template demonstrates:
- Loading trained models
- Evaluating performance with statistics
- Recording videos of agent behavior
- Visualizing agent performance
"""

import gymnasium as gym
import numpy as np
from stable_baselines3 import PPO
from stable_baselines3.common.evaluation import evaluate_policy
from stable_baselines3.common.vec_env import DummyVecEnv, VecVideoRecorder, VecNormalize
import os


def evaluate_agent(
    model_path,
    env_id="CartPole-v1",
    n_eval_episodes=10,
    deterministic=True,
    render=False,
    record_video=False,
    video_folder="./videos/",
    vec_normalize_path=None,
):
    """
    Evaluate a trained RL agent.

    Args:
        model_path: Path to the saved model
        env_id: Gymnasium environment ID
        n_eval_episodes: Number of episodes to evaluate
        deterministic: Use deterministic actions
        render: Render the environment during evaluation
        record_video: Record videos of the agent
        video_folder: Folder to save videos
        vec_normalize_path: Path to VecNormalize statistics (if used during training)

    Returns:
        mean_reward: Mean episode reward
        std_reward: Standard deviation of episode rewards
    """
    # Load the trained model
    print(f"Loading model from {model_path}...")
    model = PPO.load(model_path)

    # Create evaluation environment
    if render:
        env = gym.make(env_id, render_mode="human")
    else:
        env = gym.make(env_id)

    # Wrap in DummyVecEnv for consistency
    env = DummyVecEnv([lambda: env])

    # Load VecNormalize statistics if they were used during training
    if vec_normalize_path and os.path.exists(vec_normalize_path):
        print(f"Loading VecNormalize statistics from {vec_normalize_path}...")
        env = VecNormalize.load(vec_normalize_path, env)
        env.training = False  # Don't update statistics during evaluation
        env.norm_reward = False  # Don't normalize rewards during evaluation

    # Set up video recording if requested
    if record_video:
        os.makedirs(video_folder, exist_ok=True)
        env = VecVideoRecorder(
            env,
            video_folder,
            record_video_trigger=lambda x: x == 0,  # Record all episodes
            video_length=1000,  # Max video length
            name_prefix=f"eval-{env_id}",
        )
        print(f"Recording videos to {video_folder}...")

    # Evaluate the agent
    print(f"Evaluating for {n_eval_episodes} episodes...")
    mean_reward, std_reward = evaluate_policy(
        model,
        env,
        n_eval_episodes=n_eval_episodes,
        deterministic=deterministic,
        render=False,  # VecEnv doesn't support render parameter
        return_episode_rewards=False,
    )

    print(f"Mean reward: {mean_reward:.2f} +/- {std_reward:.2f}")

    # Cleanup
    env.close()

    return mean_reward, std_reward


def watch_agent(
    model_path,
    env_id="CartPole-v1",
    n_episodes=5,
    deterministic=True,
    vec_normalize_path=None,
):
    """
    Watch a trained agent play (with rendering).

    Args:
        model_path: Path to the saved model
        env_id: Gymnasium environment ID
        n_episodes: Number of episodes to watch
        deterministic: Use deterministic actions
        vec_normalize_path: Path to VecNormalize statistics (if used during training)
    """
    # Load the trained model
    print(f"Loading model from {model_path}...")
    model = PPO.load(model_path)

    # Create environment with rendering
    env = gym.make(env_id, render_mode="human")

    # Load VecNormalize statistics if needed
    obs_normalization = None
    if vec_normalize_path and os.path.exists(vec_normalize_path):
        print(f"Loading VecNormalize statistics from {vec_normalize_path}...")
        # For rendering, we'll manually apply normalization
        dummy_env = DummyVecEnv([lambda: gym.make(env_id)])
        vec_env = VecNormalize.load(vec_normalize_path, dummy_env)
        obs_normalization = vec_env
        dummy_env.close()

    # Run episodes
    for episode in range(n_episodes):
        obs, info = env.reset()
        episode_reward = 0
        done = False
        step = 0

        print(f"\nEpisode {episode + 1}/{n_episodes}")

        while not done:
            # Apply observation normalization if needed
            if obs_normalization:
                obs_normalized = obs_normalization.normalize_obs(obs)
            else:
                obs_normalized = obs

            # Get action from model
            action, _states = model.predict(obs_normalized, deterministic=deterministic)

            # Take step in environment
            obs, reward, terminated, truncated, info = env.step(action)
            done = terminated or truncated

            episode_reward += reward
            step += 1

        print(f"Episode reward: {episode_reward:.2f} ({step} steps)")

    env.close()


def compare_models(
    model_paths,
    env_id="CartPole-v1",
    n_eval_episodes=10,
    deterministic=True,
):
    """
    Compare performance of multiple trained models.

    Args:
        model_paths: List of paths to saved models
        env_id: Gymnasium environment ID
        n_eval_episodes: Number of episodes to evaluate each model
        deterministic: Use deterministic actions
    """
    results = {}

    for model_path in model_paths:
        print(f"\nEvaluating {model_path}...")
        mean_reward, std_reward = evaluate_agent(
            model_path,
            env_id=env_id,
            n_eval_episodes=n_eval_episodes,
            deterministic=deterministic,
        )
        results[model_path] = {"mean": mean_reward, "std": std_reward}

    # Print comparison
    print("\n" + "=" * 60)
    print("Model Comparison Results")
    print("=" * 60)
    for model_path, stats in results.items():
        print(f"{model_path}: {stats['mean']:.2f} +/- {stats['std']:.2f}")
    print("=" * 60)

    return results


if __name__ == "__main__":
    # Example 1: Evaluate a trained model
    model_path = "./models/best_model/best_model.zip"
    evaluate_agent(
        model_path=model_path,
        env_id="CartPole-v1",
        n_eval_episodes=10,
        deterministic=True,
    )

    # Example 2: Record videos of agent behavior
    # evaluate_agent(
    #     model_path=model_path,
    #     env_id="CartPole-v1",
    #     n_eval_episodes=5,
    #     deterministic=True,
    #     record_video=True,
    #     video_folder="./videos/",
    # )

    # Example 3: Watch agent play with rendering
    # watch_agent(
    #     model_path=model_path,
    #     env_id="CartPole-v1",
    #     n_episodes=3,
    #     deterministic=True,
    # )

    # Example 4: Compare multiple models
    # compare_models(
    #     model_paths=[
    #         "./models/model_100k.zip",
    #         "./models/model_200k.zip",
    #         "./models/best_model/best_model.zip",
    #     ],
    #     env_id="CartPole-v1",
    #     n_eval_episodes=10,
    # )

    # Example 5: Evaluate with VecNormalize statistics
    # evaluate_agent(
    #     model_path="./models/best_model/best_model.zip",
    #     env_id="Pendulum-v1",
    #     n_eval_episodes=10,
    #     vec_normalize_path="./models/vec_normalize.pkl",
    # )
