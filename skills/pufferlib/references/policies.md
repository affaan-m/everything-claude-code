# PufferLib Policies Guide

## Overview

PufferLib policies are standard PyTorch modules with optional utilities for observation processing and LSTM integration. The framework provides default architectures and tools while allowing full flexibility in policy design.

## Policy Architecture

### Basic Policy Structure

```python
import torch
import torch.nn as nn
from pufferlib.pytorch import layer_init

class BasicPolicy(nn.Module):
    def __init__(self, observation_space, action_space):
        super().__init__()

        self.observation_space = observation_space
        self.action_space = action_space

        # Encoder network
        self.encoder = nn.Sequential(
            layer_init(nn.Linear(observation_space.shape[0], 256)),
            nn.ReLU(),
            layer_init(nn.Linear(256, 256)),
            nn.ReLU()
        )

        # Policy head (actor)
        self.actor = layer_init(nn.Linear(256, action_space.n), std=0.01)

        # Value head (critic)
        self.critic = layer_init(nn.Linear(256, 1), std=1.0)

    def forward(self, observations):
        """Forward pass through policy."""
        # Encode observations
        features = self.encoder(observations)

        # Get action logits and value
        logits = self.actor(features)
        value = self.critic(features)

        return logits, value

    def get_action(self, observations, deterministic=False):
        """Sample action from policy."""
        logits, value = self.forward(observations)

        if deterministic:
            action = logits.argmax(dim=-1)
        else:
            dist = torch.distributions.Categorical(logits=logits)
            action = dist.sample()

        return action, value
```

### Layer Initialization

PufferLib provides `layer_init` for proper weight initialization:

```python
from pufferlib.pytorch import layer_init

# Default orthogonal initialization
layer = layer_init(nn.Linear(256, 256))

# Custom standard deviation
actor_head = layer_init(nn.Linear(256, num_actions), std=0.01)
critic_head = layer_init(nn.Linear(256, 1), std=1.0)

# Works with any layer type
conv = layer_init(nn.Conv2d(3, 32, kernel_size=8, stride=4))
```

## CNN Policies

For image-based observations:

```python
class CNNPolicy(nn.Module):
    def __init__(self, observation_space, action_space):
        super().__init__()

        # CNN encoder for images
        self.encoder = nn.Sequential(
            layer_init(nn.Conv2d(3, 32, kernel_size=8, stride=4)),
            nn.ReLU(),
            layer_init(nn.Conv2d(32, 64, kernel_size=4, stride=2)),
            nn.ReLU(),
            layer_init(nn.Conv2d(64, 64, kernel_size=3, stride=1)),
            nn.ReLU(),
            nn.Flatten(),
            layer_init(nn.Linear(64 * 7 * 7, 512)),
            nn.ReLU()
        )

        self.actor = layer_init(nn.Linear(512, action_space.n), std=0.01)
        self.critic = layer_init(nn.Linear(512, 1), std=1.0)

    def forward(self, observations):
        # Normalize pixel values
        x = observations.float() / 255.0

        features = self.encoder(x)
        logits = self.actor(features)
        value = self.critic(features)

        return logits, value
```

### Efficient CNN Architecture

```python
class EfficientCNN(nn.Module):
    """Optimized CNN for Atari-style games."""

    def __init__(self, observation_space, action_space):
        super().__init__()

        in_channels = observation_space.shape[0]  # Typically 4 for framestack

        self.network = nn.Sequential(
            layer_init(nn.Conv2d(in_channels, 32, 8, stride=4)),
            nn.ReLU(),
            layer_init(nn.Conv2d(32, 64, 4, stride=2)),
            nn.ReLU(),
            layer_init(nn.Conv2d(64, 64, 3, stride=1)),
            nn.ReLU(),
            nn.Flatten()
        )

        # Calculate feature size
        with torch.no_grad():
            sample = torch.zeros(1, *observation_space.shape)
            n_features = self.network(sample).shape[1]

        self.fc = layer_init(nn.Linear(n_features, 512))
        self.actor = layer_init(nn.Linear(512, action_space.n), std=0.01)
        self.critic = layer_init(nn.Linear(512, 1), std=1.0)

    def forward(self, x):
        x = x.float() / 255.0
        x = self.network(x)
        x = torch.relu(self.fc(x))

        return self.actor(x), self.critic(x)
```

## Recurrent Policies (LSTM)

PufferLib provides optimized LSTM integration with automatic recurrence handling:

```python
from pufferlib.pytorch import LSTMWrapper

class RecurrentPolicy(nn.Module):
    def __init__(self, observation_space, action_space, hidden_size=256):
        super().__init__()

        # Observation encoder
        self.encoder = nn.Sequential(
            layer_init(nn.Linear(observation_space.shape[0], 128)),
            nn.ReLU()
        )

        # LSTM layer
        self.lstm = nn.LSTM(128, hidden_size, num_layers=1)

        # Policy and value heads
        self.actor = layer_init(nn.Linear(hidden_size, action_space.n), std=0.01)
        self.critic = layer_init(nn.Linear(hidden_size, 1), std=1.0)

        # Hidden state
        self.hidden_size = hidden_size

    def forward(self, observations, state=None):
        """
        Args:
            observations: (batch, obs_dim)
            state: Optional (h, c) tuple for LSTM

        Returns:
            logits, value, new_state
        """
        batch_size = observations.shape[0]

        # Encode observations
        features = self.encoder(observations)

        # Initialize hidden state if needed
        if state is None:
            h = torch.zeros(1, batch_size, self.hidden_size, device=features.device)
            c = torch.zeros(1, batch_size, self.hidden_size, device=features.device)
            state = (h, c)

        # LSTM forward
        features = features.unsqueeze(0)  # Add sequence dimension
        lstm_out, new_state = self.lstm(features, state)
        lstm_out = lstm_out.squeeze(0)

        # Get outputs
        logits = self.actor(lstm_out)
        value = self.critic(lstm_out)

        return logits, value, new_state
```

### LSTM Optimization

PufferLib's LSTM optimization uses LSTMCell during rollouts and LSTM during training for up to 3x faster inference:

```python
class OptimizedLSTMPolicy(nn.Module):
    def __init__(self, observation_space, action_space, hidden_size=256):
        super().__init__()

        self.encoder = nn.Sequential(
            layer_init(nn.Linear(observation_space.shape[0], 128)),
            nn.ReLU()
        )

        # Use LSTMCell for step-by-step inference
        self.lstm_cell = nn.LSTMCell(128, hidden_size)

        # Use LSTM for batch training
        self.lstm = nn.LSTM(128, hidden_size, num_layers=1)

        self.actor = layer_init(nn.Linear(hidden_size, action_space.n), std=0.01)
        self.critic = layer_init(nn.Linear(hidden_size, 1), std=1.0)

        self.hidden_size = hidden_size

    def encode_observations(self, observations, state):
        """Fast inference using LSTMCell."""
        features = self.encoder(observations)

        if state is None:
            h = torch.zeros(observations.shape[0], self.hidden_size, device=features.device)
            c = torch.zeros(observations.shape[0], self.hidden_size, device=features.device)
        else:
            h, c = state

        # Step-by-step with LSTMCell (faster for inference)
        h, c = self.lstm_cell(features, (h, c))

        logits = self.actor(h)
        value = self.critic(h)

        return logits, value, (h, c)

    def decode_actions(self, observations, actions, state):
        """Batch training using LSTM."""
        seq_len, batch_size = observations.shape[:2]

        # Reshape for LSTM
        obs_flat = observations.reshape(seq_len * batch_size, -1)
        features = self.encoder(obs_flat)
        features = features.reshape(seq_len, batch_size, -1)

        if state is None:
            h = torch.zeros(1, batch_size, self.hidden_size, device=features.device)
            c = torch.zeros(1, batch_size, self.hidden_size, device=features.device)
            state = (h, c)

        # Batch processing with LSTM (faster for training)
        lstm_out, new_state = self.lstm(features, state)

        # Flatten back
        lstm_out = lstm_out.reshape(seq_len * batch_size, -1)

        logits = self.actor(lstm_out)
        value = self.critic(lstm_out)

        return logits, value, new_state
```

## Multi-Input Policies

For environments with multiple observation types:

```python
class MultiInputPolicy(nn.Module):
    def __init__(self, observation_space, action_space):
        super().__init__()

        # Separate encoders for different observation types
        self.image_encoder = nn.Sequential(
            layer_init(nn.Conv2d(3, 32, 8, stride=4)),
            nn.ReLU(),
            layer_init(nn.Conv2d(32, 64, 4, stride=2)),
            nn.ReLU(),
            nn.Flatten()
        )

        self.vector_encoder = nn.Sequential(
            layer_init(nn.Linear(observation_space['vector'].shape[0], 128)),
            nn.ReLU()
        )

        # Combine features
        combined_size = 64 * 9 * 9 + 128  # Image features + vector features
        self.combiner = nn.Sequential(
            layer_init(nn.Linear(combined_size, 512)),
            nn.ReLU()
        )

        self.actor = layer_init(nn.Linear(512, action_space.n), std=0.01)
        self.critic = layer_init(nn.Linear(512, 1), std=1.0)

    def forward(self, observations):
        # Process each observation type
        image_features = self.image_encoder(observations['image'].float() / 255.0)
        vector_features = self.vector_encoder(observations['vector'])

        # Combine
        combined = torch.cat([image_features, vector_features], dim=-1)
        features = self.combiner(combined)

        return self.actor(features), self.critic(features)
```

## Continuous Action Policies

For continuous control tasks:

```python
class ContinuousPolicy(nn.Module):
    def __init__(self, observation_space, action_space):
        super().__init__()

        self.encoder = nn.Sequential(
            layer_init(nn.Linear(observation_space.shape[0], 256)),
            nn.ReLU(),
            layer_init(nn.Linear(256, 256)),
            nn.ReLU()
        )

        # Mean of action distribution
        self.actor_mean = layer_init(nn.Linear(256, action_space.shape[0]), std=0.01)

        # Log std of action distribution
        self.actor_logstd = nn.Parameter(torch.zeros(1, action_space.shape[0]))

        # Value head
        self.critic = layer_init(nn.Linear(256, 1), std=1.0)

    def forward(self, observations):
        features = self.encoder(observations)

        action_mean = self.actor_mean(features)
        action_std = torch.exp(self.actor_logstd)

        value = self.critic(features)

        return action_mean, action_std, value

    def get_action(self, observations, deterministic=False):
        action_mean, action_std, value = self.forward(observations)

        if deterministic:
            return action_mean, value
        else:
            dist = torch.distributions.Normal(action_mean, action_std)
            action = dist.sample()
            return torch.tanh(action), value  # Bound actions to [-1, 1]
```

## Observation Processing

PufferLib provides utilities for unflattening observations:

```python
from pufferlib.pytorch import unflatten_observations

class PolicyWithUnflatten(nn.Module):
    def __init__(self, observation_space, action_space):
        super().__init__()

        self.observation_space = observation_space

        # Define encoders for each observation component
        self.encoders = nn.ModuleDict({
            'image': self._make_image_encoder(),
            'vector': self._make_vector_encoder()
        })

        # ... rest of policy ...

    def forward(self, flat_observations):
        # Unflatten observations into structured format
        observations = unflatten_observations(
            flat_observations,
            self.observation_space
        )

        # Process each component
        image_features = self.encoders['image'](observations['image'])
        vector_features = self.encoders['vector'](observations['vector'])

        # Combine and continue...
```

## Multi-Agent Policies

### Shared Parameters

All agents use the same policy:

```python
class SharedMultiAgentPolicy(nn.Module):
    def __init__(self, observation_space, action_space, num_agents):
        super().__init__()

        self.num_agents = num_agents

        # Single policy shared across all agents
        self.encoder = nn.Sequential(
            layer_init(nn.Linear(observation_space.shape[0], 256)),
            nn.ReLU()
        )

        self.actor = layer_init(nn.Linear(256, action_space.n), std=0.01)
        self.critic = layer_init(nn.Linear(256, 1), std=1.0)

    def forward(self, observations):
        """
        Args:
            observations: (batch * num_agents, obs_dim)
        Returns:
            logits: (batch * num_agents, num_actions)
            values: (batch * num_agents, 1)
        """
        features = self.encoder(observations)
        return self.actor(features), self.critic(features)
```

### Independent Parameters

Each agent has its own policy:

```python
class IndependentMultiAgentPolicy(nn.Module):
    def __init__(self, observation_space, action_space, num_agents):
        super().__init__()

        self.num_agents = num_agents

        # Separate policy for each agent
        self.policies = nn.ModuleList([
            self._make_policy(observation_space, action_space)
            for _ in range(num_agents)
        ])

    def _make_policy(self, observation_space, action_space):
        return nn.Sequential(
            layer_init(nn.Linear(observation_space.shape[0], 256)),
            nn.ReLU(),
            layer_init(nn.Linear(256, 256)),
            nn.ReLU()
        )

    def forward(self, observations, agent_ids):
        """
        Args:
            observations: (batch, obs_dim)
            agent_ids: (batch,) which agent each obs belongs to
        """
        outputs = []
        for agent_id in range(self.num_agents):
            mask = agent_ids == agent_id
            if mask.any():
                agent_obs = observations[mask]
                agent_out = self.policies[agent_id](agent_obs)
                outputs.append(agent_out)

        return torch.cat(outputs, dim=0)
```

## Advanced Architectures

### Attention-Based Policy

```python
class AttentionPolicy(nn.Module):
    def __init__(self, observation_space, action_space, d_model=256, nhead=8):
        super().__init__()

        self.encoder = layer_init(nn.Linear(observation_space.shape[0], d_model))

        self.attention = nn.MultiheadAttention(d_model, nhead, batch_first=True)

        self.actor = layer_init(nn.Linear(d_model, action_space.n), std=0.01)
        self.critic = layer_init(nn.Linear(d_model, 1), std=1.0)

    def forward(self, observations):
        # Encode
        features = self.encoder(observations)

        # Self-attention
        features = features.unsqueeze(1)  # Add sequence dimension
        attn_out, _ = self.attention(features, features, features)
        attn_out = attn_out.squeeze(1)

        return self.actor(attn_out), self.critic(attn_out)
```

### Residual Policy

```python
class ResidualBlock(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.block = nn.Sequential(
            layer_init(nn.Linear(dim, dim)),
            nn.ReLU(),
            layer_init(nn.Linear(dim, dim))
        )

    def forward(self, x):
        return x + self.block(x)

class ResidualPolicy(nn.Module):
    def __init__(self, observation_space, action_space, num_blocks=4):
        super().__init__()

        dim = 256

        self.encoder = layer_init(nn.Linear(observation_space.shape[0], dim))

        self.blocks = nn.Sequential(
            *[ResidualBlock(dim) for _ in range(num_blocks)]
        )

        self.actor = layer_init(nn.Linear(dim, action_space.n), std=0.01)
        self.critic = layer_init(nn.Linear(dim, 1), std=1.0)

    def forward(self, observations):
        x = torch.relu(self.encoder(observations))
        x = self.blocks(x)
        return self.actor(x), self.critic(x)
```

## Policy Best Practices

### Initialization

```python
# Always use layer_init for proper initialization
good_layer = layer_init(nn.Linear(256, 256))

# Use small std for actor head (more stable early training)
actor = layer_init(nn.Linear(256, num_actions), std=0.01)

# Use std=1.0 for critic head
critic = layer_init(nn.Linear(256, 1), std=1.0)
```

### Observation Normalization

```python
class NormalizedPolicy(nn.Module):
    def __init__(self, observation_space, action_space):
        super().__init__()

        # Running statistics for normalization
        self.obs_mean = nn.Parameter(torch.zeros(observation_space.shape[0]), requires_grad=False)
        self.obs_std = nn.Parameter(torch.ones(observation_space.shape[0]), requires_grad=False)

        # ... rest of policy ...

    def forward(self, observations):
        # Normalize observations
        normalized_obs = (observations - self.obs_mean) / (self.obs_std + 1e-8)

        # Continue with normalized observations
        return self.policy(normalized_obs)

    def update_normalization(self, observations):
        """Update running statistics."""
        self.obs_mean.data = observations.mean(dim=0)
        self.obs_std.data = observations.std(dim=0)
```

### Gradient Clipping

```python
# PufferLib trainer handles gradient clipping automatically
trainer = PuffeRL(
    env=env,
    policy=policy,
    max_grad_norm=0.5  # Clip gradients to this norm
)
```

### Model Compilation

```python
# Enable torch.compile for faster training (PyTorch 2.0+)
policy = MyPolicy(observation_space, action_space)

# Compile the model
policy = torch.compile(policy, mode='reduce-overhead')

# Use with trainer
trainer = PuffeRL(env=env, policy=policy, compile=True)
```

## Debugging Policies

### Check Output Shapes

```python
def test_policy_shapes(policy, observation_space, batch_size=32):
    """Verify policy output shapes."""
    # Create dummy observations
    obs = torch.randn(batch_size, *observation_space.shape)

    # Forward pass
    logits, value = policy(obs)

    # Check shapes
    assert logits.shape == (batch_size, policy.action_space.n)
    assert value.shape == (batch_size, 1)

    print("✓ Policy shapes correct")
```

### Verify Gradients

```python
def check_gradients(policy, observation_space):
    """Check that gradients flow properly."""
    obs = torch.randn(1, *observation_space.shape, requires_grad=True)

    logits, value = policy(obs)

    # Backward pass
    loss = logits.sum() + value.sum()
    loss.backward()

    # Check gradients exist
    for name, param in policy.named_parameters():
        if param.grad is None:
            print(f"⚠ No gradient for {name}")
        elif torch.isnan(param.grad).any():
            print(f"⚠ NaN gradient for {name}")
        else:
            print(f"✓ Gradient OK for {name}")
```
