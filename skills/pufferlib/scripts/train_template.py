#!/usr/bin/env python3
"""
PufferLib Training Template

This template provides a complete training script for reinforcement learning
with PufferLib. Customize the environment, policy, and training configuration
as needed for your use case.
"""

import argparse
import torch
import torch.nn as nn
import pufferlib
from pufferlib import PuffeRL
from pufferlib.pytorch import layer_init


class Policy(nn.Module):
    """Example policy network."""

    def __init__(self, observation_space, action_space, hidden_size=256):
        super().__init__()

        self.observation_space = observation_space
        self.action_space = action_space

        # Encoder network
        self.encoder = nn.Sequential(
            layer_init(nn.Linear(observation_space.shape[0], hidden_size)),
            nn.ReLU(),
            layer_init(nn.Linear(hidden_size, hidden_size)),
            nn.ReLU()
        )

        # Policy head (actor)
        self.actor = layer_init(nn.Linear(hidden_size, action_space.n), std=0.01)

        # Value head (critic)
        self.critic = layer_init(nn.Linear(hidden_size, 1), std=1.0)

    def forward(self, observations):
        """Forward pass through policy."""
        features = self.encoder(observations)
        logits = self.actor(features)
        value = self.critic(features)
        return logits, value


def make_env():
    """Create environment. Customize this for your task."""
    # Option 1: Use Ocean environment
    return pufferlib.make('procgen-coinrun', num_envs=256)

    # Option 2: Use Gymnasium environment
    # return pufferlib.make('gym-CartPole-v1', num_envs=256)

    # Option 3: Use custom environment
    # from my_envs import MyEnvironment
    # return pufferlib.emulate(MyEnvironment, num_envs=256)


def create_policy(env):
    """Create policy network."""
    return Policy(
        observation_space=env.observation_space,
        action_space=env.action_space,
        hidden_size=256
    )


def train(args):
    """Main training function."""
    # Set random seeds
    torch.manual_seed(args.seed)

    # Create environment
    print(f"Creating environment with {args.num_envs} parallel environments...")
    env = pufferlib.make(
        args.env_name,
        num_envs=args.num_envs,
        num_workers=args.num_workers
    )

    # Create policy
    print("Initializing policy...")
    policy = create_policy(env)

    if args.device == 'cuda' and torch.cuda.is_available():
        policy = policy.cuda()
        print(f"Using GPU: {torch.cuda.get_device_name(0)}")
    else:
        print("Using CPU")

    # Create logger
    if args.logger == 'wandb':
        from pufferlib import WandbLogger
        logger = WandbLogger(
            project=args.project,
            name=args.exp_name,
            config=vars(args)
        )
    elif args.logger == 'neptune':
        from pufferlib import NeptuneLogger
        logger = NeptuneLogger(
            project=args.project,
            name=args.exp_name,
            api_token=args.neptune_token
        )
    else:
        from pufferlib import NoLogger
        logger = NoLogger()

    # Create trainer
    print("Creating trainer...")
    trainer = PuffeRL(
        env=env,
        policy=policy,
        device=args.device,
        learning_rate=args.learning_rate,
        batch_size=args.batch_size,
        n_epochs=args.n_epochs,
        gamma=args.gamma,
        gae_lambda=args.gae_lambda,
        clip_coef=args.clip_coef,
        ent_coef=args.ent_coef,
        vf_coef=args.vf_coef,
        max_grad_norm=args.max_grad_norm,
        logger=logger,
        compile=args.compile
    )

    # Training loop
    print(f"Starting training for {args.num_iterations} iterations...")
    for iteration in range(1, args.num_iterations + 1):
        # Collect rollouts
        rollout_data = trainer.evaluate()

        # Train on batch
        train_metrics = trainer.train()

        # Log results
        trainer.mean_and_log()

        # Save checkpoint
        if iteration % args.save_freq == 0:
            checkpoint_path = f"{args.checkpoint_dir}/checkpoint_{iteration}.pt"
            trainer.save_checkpoint(checkpoint_path)
            print(f"Saved checkpoint to {checkpoint_path}")

        # Print progress
        if iteration % args.log_freq == 0:
            mean_reward = rollout_data.get('mean_reward', 0)
            sps = rollout_data.get('sps', 0)
            print(f"Iteration {iteration}/{args.num_iterations} | "
                  f"Mean Reward: {mean_reward:.2f} | "
                  f"SPS: {sps:,.0f}")

    print("Training complete!")

    # Save final model
    final_path = f"{args.checkpoint_dir}/final_model.pt"
    trainer.save_checkpoint(final_path)
    print(f"Saved final model to {final_path}")


def main():
    parser = argparse.ArgumentParser(description='PufferLib Training')

    # Environment
    parser.add_argument('--env-name', type=str, default='procgen-coinrun',
                        help='Environment name')
    parser.add_argument('--num-envs', type=int, default=256,
                        help='Number of parallel environments')
    parser.add_argument('--num-workers', type=int, default=8,
                        help='Number of vectorization workers')

    # Training
    parser.add_argument('--num-iterations', type=int, default=10000,
                        help='Number of training iterations')
    parser.add_argument('--learning-rate', type=float, default=3e-4,
                        help='Learning rate')
    parser.add_argument('--batch-size', type=int, default=32768,
                        help='Batch size for training')
    parser.add_argument('--n-epochs', type=int, default=4,
                        help='Number of training epochs per batch')
    parser.add_argument('--device', type=str, default='cuda',
                        choices=['cuda', 'cpu'], help='Device to use')

    # PPO Parameters
    parser.add_argument('--gamma', type=float, default=0.99,
                        help='Discount factor')
    parser.add_argument('--gae-lambda', type=float, default=0.95,
                        help='GAE lambda')
    parser.add_argument('--clip-coef', type=float, default=0.2,
                        help='PPO clipping coefficient')
    parser.add_argument('--ent-coef', type=float, default=0.01,
                        help='Entropy coefficient')
    parser.add_argument('--vf-coef', type=float, default=0.5,
                        help='Value function coefficient')
    parser.add_argument('--max-grad-norm', type=float, default=0.5,
                        help='Maximum gradient norm')

    # Logging
    parser.add_argument('--logger', type=str, default='none',
                        choices=['wandb', 'neptune', 'none'],
                        help='Logger to use')
    parser.add_argument('--project', type=str, default='pufferlib-training',
                        help='Project name for logging')
    parser.add_argument('--exp-name', type=str, default='experiment',
                        help='Experiment name')
    parser.add_argument('--neptune-token', type=str, default=None,
                        help='Neptune API token')
    parser.add_argument('--log-freq', type=int, default=10,
                        help='Logging frequency (iterations)')

    # Checkpointing
    parser.add_argument('--checkpoint-dir', type=str, default='checkpoints',
                        help='Directory to save checkpoints')
    parser.add_argument('--save-freq', type=int, default=100,
                        help='Checkpoint save frequency (iterations)')

    # Misc
    parser.add_argument('--seed', type=int, default=42,
                        help='Random seed')
    parser.add_argument('--compile', action='store_true',
                        help='Use torch.compile for faster training')

    args = parser.parse_args()

    # Create checkpoint directory
    import os
    os.makedirs(args.checkpoint_dir, exist_ok=True)

    # Run training
    train(args)


if __name__ == '__main__':
    main()
