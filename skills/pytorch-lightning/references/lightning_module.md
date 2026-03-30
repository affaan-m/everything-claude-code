# LightningModule - Comprehensive Guide

## Overview

A `LightningModule` organizes PyTorch code into six logical sections without abstraction. The code remains pure PyTorch, just better organized. The Trainer handles device management, distributed sampling, and infrastructure while preserving full model control.

## Core Structure

```python
import lightning as L
import torch
import torch.nn.functional as F

class MyModel(L.LightningModule):
    def __init__(self, learning_rate=0.001):
        super().__init__()
        self.save_hyperparameters()  # Save init arguments
        self.model = YourNeuralNetwork()

    def training_step(self, batch, batch_idx):
        x, y = batch
        logits = self.model(x)
        loss = F.cross_entropy(logits, y)
        self.log("train_loss", loss)
        return loss

    def validation_step(self, batch, batch_idx):
        x, y = batch
        logits = self.model(x)
        loss = F.cross_entropy(logits, y)
        acc = (logits.argmax(dim=1) == y).float().mean()
        self.log("val_loss", loss)
        self.log("val_acc", acc)

    def test_step(self, batch, batch_idx):
        x, y = batch
        logits = self.model(x)
        loss = F.cross_entropy(logits, y)
        acc = (logits.argmax(dim=1) == y).float().mean()
        self.log("test_loss", loss)
        self.log("test_acc", acc)

    def configure_optimizers(self):
        optimizer = torch.optim.Adam(self.parameters(), lr=self.hparams.learning_rate)
        scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min')
        return {
            "optimizer": optimizer,
            "lr_scheduler": {
                "scheduler": scheduler,
                "monitor": "val_loss"
            }
        }
```

## Essential Methods

### Training Pipeline Methods

#### `training_step(batch, batch_idx)`
Computes the forward pass and returns the loss. Lightning automatically handles backward propagation and optimizer updates in automatic optimization mode.

**Parameters:**
- `batch` - Current training batch from the DataLoader
- `batch_idx` - Index of the current batch

**Returns:** Loss tensor (scalar) or dictionary with 'loss' key

**Example:**
```python
def training_step(self, batch, batch_idx):
    x, y = batch
    y_hat = self.model(x)
    loss = F.mse_loss(y_hat, y)

    # Log training metrics
    self.log("train_loss", loss, on_step=True, on_epoch=True, prog_bar=True)
    self.log("learning_rate", self.optimizers().param_groups[0]['lr'])

    return loss
```

#### `validation_step(batch, batch_idx)`
Evaluates the model on validation data. Runs with gradients disabled and model in eval mode automatically.

**Parameters:**
- `batch` - Current validation batch
- `batch_idx` - Index of the current batch

**Returns:** Optional - Loss or dictionary of metrics

**Example:**
```python
def validation_step(self, batch, batch_idx):
    x, y = batch
    y_hat = self.model(x)
    loss = F.mse_loss(y_hat, y)

    # Lightning aggregates across validation batches automatically
    self.log("val_loss", loss, prog_bar=True)
    return loss
```

#### `test_step(batch, batch_idx)`
Evaluates the model on test data. Only run when explicitly called with `trainer.test()`. Use after training is complete, typically before publication.

**Parameters:**
- `batch` - Current test batch
- `batch_idx` - Index of the current batch

**Returns:** Optional - Loss or dictionary of metrics

#### `predict_step(batch, batch_idx, dataloader_idx=0)`
Runs inference on data. Called when using `trainer.predict()`.

**Parameters:**
- `batch` - Current batch
- `batch_idx` - Index of the current batch
- `dataloader_idx` - Index of dataloader (if multiple)

**Returns:** Predictions (any format you need)

**Example:**
```python
def predict_step(self, batch, batch_idx):
    x, y = batch
    return self.model(x)  # Return raw predictions
```

### Configuration Methods

#### `configure_optimizers()`
Returns optimizer(s) and optional learning rate scheduler(s).

**Return formats:**

1. **Single optimizer:**
```python
def configure_optimizers(self):
    return torch.optim.Adam(self.parameters(), lr=0.001)
```

2. **Optimizer + scheduler:**
```python
def configure_optimizers(self):
    optimizer = torch.optim.Adam(self.parameters(), lr=0.001)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=10)
    return [optimizer], [scheduler]
```

3. **Advanced configuration with scheduler monitoring:**
```python
def configure_optimizers(self):
    optimizer = torch.optim.Adam(self.parameters(), lr=0.001)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer)
    return {
        "optimizer": optimizer,
        "lr_scheduler": {
            "scheduler": scheduler,
            "monitor": "val_loss",  # Metric to monitor
            "interval": "epoch",     # When to update (epoch/step)
            "frequency": 1,          # How often to update
            "strict": True           # Crash if monitored metric not found
        }
    }
```

4. **Multiple optimizers (for GANs, etc.):**
```python
def configure_optimizers(self):
    opt_g = torch.optim.Adam(self.generator.parameters(), lr=0.0002)
    opt_d = torch.optim.Adam(self.discriminator.parameters(), lr=0.0002)
    return [opt_g, opt_d]
```

#### `forward(*args, **kwargs)`
Standard PyTorch forward method. Use for inference or as part of training_step.

**Example:**
```python
def forward(self, x):
    return self.model(x)

def training_step(self, batch, batch_idx):
    x, y = batch
    y_hat = self(x)  # Uses forward()
    return F.mse_loss(y_hat, y)
```

### Logging and Metrics

#### `log(name, value, **kwargs)`
Records metrics with automatic epoch-level reduction across devices.

**Key parameters:**
- `name` - Metric name (string)
- `value` - Metric value (tensor or number)
- `on_step` - Log at current step (default: True in training_step, False otherwise)
- `on_epoch` - Log at epoch end (default: False in training_step, True otherwise)
- `prog_bar` - Display in progress bar (default: False)
- `logger` - Send to logger backends (default: True)
- `reduce_fx` - Reduction function: "mean", "sum", "max", "min" (default: "mean")
- `sync_dist` - Synchronize across devices in distributed training (default: False)

**Examples:**
```python
# Simple logging
self.log("train_loss", loss)

# Display in progress bar
self.log("accuracy", acc, prog_bar=True)

# Log per-step and per-epoch
self.log("loss", loss, on_step=True, on_epoch=True)

# Custom reduction for distributed training
self.log("batch_size", batch.size(0), reduce_fx="sum", sync_dist=True)
```

#### `log_dict(dictionary, **kwargs)`
Log multiple metrics simultaneously.

**Example:**
```python
metrics = {"train_loss": loss, "train_acc": acc, "learning_rate": lr}
self.log_dict(metrics, on_step=True, on_epoch=True)
```

#### `save_hyperparameters(*args, **kwargs)`
Stores initialization arguments for reproducibility and checkpoint restoration. Call in `__init__()`.

**Example:**
```python
def __init__(self, learning_rate, hidden_dim, dropout):
    super().__init__()
    self.save_hyperparameters()  # Saves all init args
    # Access via self.hparams.learning_rate, self.hparams.hidden_dim, etc.
```

## Key Properties

| Property | Description |
|----------|-------------|
| `self.current_epoch` | Current epoch number (0-indexed) |
| `self.global_step` | Total optimizer steps across all epochs |
| `self.device` | Current device (cuda:0, cpu, etc.) |
| `self.global_rank` | Process rank in distributed training (0 for main) |
| `self.local_rank` | GPU rank on current node |
| `self.hparams` | Saved hyperparameters (via save_hyperparameters) |
| `self.trainer` | Reference to parent Trainer instance |
| `self.automatic_optimization` | Whether to use automatic optimization (default: True) |

## Manual Optimization

For advanced use cases (GANs, reinforcement learning, multiple optimizers), disable automatic optimization:

```python
class GANModel(L.LightningModule):
    def __init__(self):
        super().__init__()
        self.automatic_optimization = False
        self.generator = Generator()
        self.discriminator = Discriminator()

    def training_step(self, batch, batch_idx):
        opt_g, opt_d = self.optimizers()

        # Train generator
        opt_g.zero_grad()
        g_loss = self.compute_generator_loss(batch)
        self.manual_backward(g_loss)
        opt_g.step()

        # Train discriminator
        opt_d.zero_grad()
        d_loss = self.compute_discriminator_loss(batch)
        self.manual_backward(d_loss)
        opt_d.step()

        self.log_dict({"g_loss": g_loss, "d_loss": d_loss})

    def configure_optimizers(self):
        opt_g = torch.optim.Adam(self.generator.parameters(), lr=0.0002)
        opt_d = torch.optim.Adam(self.discriminator.parameters(), lr=0.0002)
        return [opt_g, opt_d]
```

## Important Lifecycle Hooks

### Setup and Teardown

#### `setup(stage)`
Called at the beginning of fit, validate, test, or predict. Useful for stage-specific setup.

**Parameters:**
- `stage` - 'fit', 'validate', 'test', or 'predict'

**Example:**
```python
def setup(self, stage):
    if stage == 'fit':
        # Setup training-specific components
        self.train_dataset = load_train_data()
    elif stage == 'test':
        # Setup test-specific components
        self.test_dataset = load_test_data()
```

#### `teardown(stage)`
Called at the end of fit, validate, test, or predict. Cleanup resources.

### Epoch Boundaries

#### `on_train_epoch_start()` / `on_train_epoch_end()`
Called at the beginning/end of each training epoch.

**Example:**
```python
def on_train_epoch_end(self):
    # Compute epoch-level metrics
    all_preds = torch.cat(self.training_step_outputs)
    epoch_metric = compute_custom_metric(all_preds)
    self.log("epoch_metric", epoch_metric)
    self.training_step_outputs.clear()  # Free memory
```

#### `on_validation_epoch_start()` / `on_validation_epoch_end()`
Called at the beginning/end of validation epoch.

#### `on_test_epoch_start()` / `on_test_epoch_end()`
Called at the beginning/end of test epoch.

### Gradient Hooks

#### `on_before_backward(loss)`
Called before loss.backward().

#### `on_after_backward()`
Called after loss.backward() but before optimizer step.

**Example - Gradient inspection:**
```python
def on_after_backward(self):
    # Log gradient norms
    grad_norm = torch.nn.utils.clip_grad_norm_(self.parameters(), max_norm=1.0)
    self.log("grad_norm", grad_norm)
```

### Checkpoint Hooks

#### `on_save_checkpoint(checkpoint)`
Customize checkpoint saving. Add extra state to save.

**Example:**
```python
def on_save_checkpoint(self, checkpoint):
    checkpoint['custom_state'] = self.custom_data
```

#### `on_load_checkpoint(checkpoint)`
Customize checkpoint loading. Restore extra state.

**Example:**
```python
def on_load_checkpoint(self, checkpoint):
    self.custom_data = checkpoint.get('custom_state', default_value)
```

## Best Practices

### 1. Device Agnosticism
Never use explicit `.cuda()` or `.cpu()` calls. Lightning handles device placement automatically.

**Bad:**
```python
x = x.cuda()
model = model.cuda()
```

**Good:**
```python
x = x.to(self.device)  # Inside LightningModule
# Or let Lightning handle it automatically
```

### 2. Distributed Training Safety
Don't manually create `DistributedSampler`. Lightning handles this automatically.

**Bad:**
```python
sampler = DistributedSampler(dataset)
DataLoader(dataset, sampler=sampler)
```

**Good:**
```python
DataLoader(dataset, shuffle=True)  # Lightning converts to DistributedSampler
```

### 3. Metric Aggregation
Use `self.log()` for automatic cross-device reduction rather than manual collection.

**Bad:**
```python
self.validation_outputs.append(loss)

def on_validation_epoch_end(self):
    avg_loss = torch.stack(self.validation_outputs).mean()
```

**Good:**
```python
self.log("val_loss", loss)  # Automatic aggregation
```

### 4. Hyperparameter Tracking
Always use `self.save_hyperparameters()` for easy model reloading.

**Example:**
```python
def __init__(self, learning_rate, hidden_dim):
    super().__init__()
    self.save_hyperparameters()

# Later: Load from checkpoint
model = MyModel.load_from_checkpoint("checkpoint.ckpt")
print(model.hparams.learning_rate)
```

### 5. Validation Placement
Run validation on a single device to ensure each sample is evaluated exactly once. Lightning handles this automatically with proper strategy configuration.

## Loading from Checkpoint

```python
# Load model with saved hyperparameters
model = MyModel.load_from_checkpoint("path/to/checkpoint.ckpt")

# Override hyperparameters if needed
model = MyModel.load_from_checkpoint(
    "path/to/checkpoint.ckpt",
    learning_rate=0.0001  # Override saved value
)

# Use for inference
model.eval()
predictions = model(data)
```

## Common Patterns

### Gradient Accumulation
Let Lightning handle gradient accumulation:

```python
trainer = L.Trainer(accumulate_grad_batches=4)
```

### Gradient Clipping
Configure in Trainer:

```python
trainer = L.Trainer(gradient_clip_val=0.5, gradient_clip_algorithm="norm")
```

### Mixed Precision Training
Configure precision in Trainer:

```python
trainer = L.Trainer(precision="16-mixed")  # or "bf16-mixed", "32-true"
```

### Learning Rate Warmup
Implement in configure_optimizers:

```python
def configure_optimizers(self):
    optimizer = torch.optim.Adam(self.parameters(), lr=0.001)
    scheduler = {
        "scheduler": torch.optim.lr_scheduler.OneCycleLR(
            optimizer,
            max_lr=0.01,
            total_steps=self.trainer.estimated_stepping_batches
        ),
        "interval": "step"
    }
    return [optimizer], [scheduler]
```
