"""
Template script for training RL agents with Stable Baselines3.

This template demonstrates best practices for:
- Setting up training with proper monitoring
- Using callbacks for evaluation and checkpointing
- Vectorized environments for efficiency
- TensorBoard integration
- Model saving and loading
"""

import gymnasium as gym
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env
from stable_baselines3.common.callbacks import (
    EvalCallback,
    CheckpointCallback,
    CallbackList,
)
from stable_baselines3.common.vec_env import SubprocVecEnv, VecNormalize
import os


def train_agent(
    env_id="CartPole-v1",
    algorithm=PPO,
    policy="MlpPolicy",
    n_envs=4,
    total_timesteps=100000,
    eval_freq=10000,
    save_freq=10000,
    log_dir="./logs/",
    save_path="./models/",
):
    """
    Train an RL agent with best practices.

    Args:
        env_id: Gymnasium environment ID
        algorithm: SB3 algorithm class (PPO, SAC, DQN, etc.)
        policy: Policy type ("MlpPolicy", "CnnPolicy", "MultiInputPolicy")
        n_envs: Number of parallel environments
        total_timesteps: Total training timesteps
        eval_freq: Frequency of evaluation (in timesteps)
        save_freq: Frequency of model checkpoints (in timesteps)
        log_dir: Directory for logs and TensorBoard
        save_path: Directory for model checkpoints
    """
    # Create directories
    os.makedirs(log_dir, exist_ok=True)
    os.makedirs(save_path, exist_ok=True)
    eval_log_dir = os.path.join(log_dir, "eval")
    os.makedirs(eval_log_dir, exist_ok=True)

    # Create training environment (vectorized for efficiency)
    print(f"Creating {n_envs} parallel training environments...")
    env = make_vec_env(
        env_id,
        n_envs=n_envs,
        vec_env_cls=SubprocVecEnv,  # Use SubprocVecEnv for parallel execution
        # vec_env_cls=DummyVecEnv,  # Use DummyVecEnv for lightweight environments
    )

    # Optional: Add normalization wrapper for better performance
    # Uncomment for continuous control tasks
    # env = VecNormalize(env, norm_obs=True, norm_reward=True, clip_obs=10.0)

    # Create separate evaluation environment
    print("Creating evaluation environment...")
    eval_env = make_vec_env(env_id, n_envs=1)
    # If using VecNormalize, wrap eval env but set training=False
    # eval_env = VecNormalize(eval_env, training=False, norm_reward=False)

    # Set up callbacks
    eval_callback = EvalCallback(
        eval_env,
        best_model_save_path=os.path.join(save_path, "best_model"),
        log_path=eval_log_dir,
        eval_freq=eval_freq // n_envs,  # Adjust for number of environments
        n_eval_episodes=10,
        deterministic=True,
        render=False,
    )

    checkpoint_callback = CheckpointCallback(
        save_freq=save_freq // n_envs,  # Adjust for number of environments
        save_path=save_path,
        name_prefix="rl_model",
        save_replay_buffer=False,  # Set True for off-policy algorithms if needed
    )

    callback = CallbackList([eval_callback, checkpoint_callback])

    # Initialize the agent
    print(f"Initializing {algorithm.__name__} agent...")
    model = algorithm(
        policy,
        env,
        verbose=1,
        tensorboard_log=log_dir,
        # Algorithm-specific hyperparameters can be added here
        # learning_rate=3e-4,
        # n_steps=2048,  # For PPO/A2C
        # batch_size=64,
        # gamma=0.99,
    )

    # Train the agent
    print(f"Training for {total_timesteps} timesteps...")
    model.learn(
        total_timesteps=total_timesteps,
        callback=callback,
        tb_log_name=f"{algorithm.__name__}_{env_id}",
    )

    # Save final model
    final_model_path = os.path.join(save_path, "final_model")
    print(f"Saving final model to {final_model_path}...")
    model.save(final_model_path)

    # Save VecNormalize statistics if used
    # env.save(os.path.join(save_path, "vec_normalize.pkl"))

    print("Training complete!")
    print(f"Best model saved at: {os.path.join(save_path, 'best_model')}")
    print(f"Final model saved at: {final_model_path}")
    print(f"TensorBoard logs: {log_dir}")
    print(f"Run 'tensorboard --logdir {log_dir}' to view training progress")

    # Cleanup
    env.close()
    eval_env.close()

    return model


if __name__ == "__main__":
    # Example: Train PPO on CartPole
    train_agent(
        env_id="CartPole-v1",
        algorithm=PPO,
        policy="MlpPolicy",
        n_envs=4,
        total_timesteps=100000,
    )

    # Example: Train SAC on continuous control task
    # from stable_baselines3 import SAC
    # train_agent(
    #     env_id="Pendulum-v1",
    #     algorithm=SAC,
    #     policy="MlpPolicy",
    #     n_envs=4,
    #     total_timesteps=50000,
    # )

    # Example: Train DQN on discrete task
    # from stable_baselines3 import DQN
    # train_agent(
    #     env_id="LunarLander-v2",
    #     algorithm=DQN,
    #     policy="MlpPolicy",
    #     n_envs=1,  # DQN typically uses single env
    #     total_timesteps=100000,
    # )
