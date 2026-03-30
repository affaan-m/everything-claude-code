# Logging - Comprehensive Guide

## Overview

PyTorch Lightning supports multiple logging integrations for experiment tracking and visualization. By default, Lightning uses TensorBoard, but you can easily switch to or combine multiple loggers.

## Supported Loggers

### TensorBoardLogger (Default)

Logs to local or remote file system in TensorBoard format.

**Installation:**
```bash
pip install tensorboard
```

**Usage:**
```python
from lightning.pytorch import loggers as pl_loggers

tb_logger = pl_loggers.TensorBoardLogger(
    save_dir="logs/",
    name="my_model",
    version="version_1",
    default_hp_metric=False
)

trainer = L.Trainer(logger=tb_logger)
```

**View logs:**
```bash
tensorboard --logdir logs/
```

### WandbLogger

Weights & Biases integration for cloud-based experiment tracking.

**Installation:**
```bash
pip install wandb
```

**Usage:**
```python
from lightning.pytorch import loggers as pl_loggers

wandb_logger = pl_loggers.WandbLogger(
    project="my-project",
    name="experiment-1",
    save_dir="logs/",
    log_model=True  # Log model checkpoints to W&B
)

trainer = L.Trainer(logger=wandb_logger)
```

**Features:**
- Cloud-based experiment tracking
- Model versioning
- Artifact management
- Collaborative features
- Hyperparameter sweeps

### MLFlowLogger

MLflow tracking integration.

**Installation:**
```bash
pip install mlflow
```

**Usage:**
```python
from lightning.pytorch import loggers as pl_loggers

mlflow_logger = pl_loggers.MLFlowLogger(
    experiment_name="my_experiment",
    tracking_uri="http://localhost:5000",
    run_name="run_1"
)

trainer = L.Trainer(logger=mlflow_logger)
```

### CometLogger

Comet.ml experiment tracking.

**Installation:**
```bash
pip install comet-ml
```

**Usage:**
```python
from lightning.pytorch import loggers as pl_loggers

comet_logger = pl_loggers.CometLogger(
    api_key="YOUR_API_KEY",
    project_name="my-project",
    experiment_name="experiment-1"
)

trainer = L.Trainer(logger=comet_logger)
```

### NeptuneLogger

Neptune.ai integration.

**Installation:**
```bash
pip install neptune
```

**Usage:**
```python
from lightning.pytorch import loggers as pl_loggers

neptune_logger = pl_loggers.NeptuneLogger(
    api_key="YOUR_API_KEY",
    project="username/project-name",
    name="experiment-1"
)

trainer = L.Trainer(logger=neptune_logger)
```

### CSVLogger

Log to local file system in YAML and CSV format.

**Usage:**
```python
from lightning.pytorch import loggers as pl_loggers

csv_logger = pl_loggers.CSVLogger(
    save_dir="logs/",
    name="my_model",
    version="1"
)

trainer = L.Trainer(logger=csv_logger)
```

**Output files:**
- `metrics.csv` - All logged metrics
- `hparams.yaml` - Hyperparameters

## Logging Metrics

### Basic Logging

Use `self.log()` within your LightningModule:

```python
class MyModel(L.LightningModule):
    def training_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self.model(x)
        loss = F.cross_entropy(y_hat, y)

        # Log metric
        self.log("train_loss", loss)

        return loss

    def validation_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self.model(x)
        loss = F.cross_entropy(y_hat, y)
        acc = (y_hat.argmax(dim=1) == y).float().mean()

        # Log multiple metrics
        self.log("val_loss", loss)
        self.log("val_acc", acc)
```

### Logging Parameters

#### `on_step` (bool)
Log at current step. Default: True in training_step, False otherwise.

```python
self.log("loss", loss, on_step=True)
```

#### `on_epoch` (bool)
Accumulate and log at epoch end. Default: False in training_step, True otherwise.

```python
self.log("loss", loss, on_epoch=True)
```

#### `prog_bar` (bool)
Display in progress bar. Default: False.

```python
self.log("train_loss", loss, prog_bar=True)
```

#### `logger` (bool)
Send to logger backends. Default: True.

```python
self.log("internal_metric", value, logger=False)  # Don't log to external logger
```

#### `reduce_fx` (str or callable)
Reduction function: "mean", "sum", "max", "min". Default: "mean".

```python
self.log("batch_size", batch.size(0), reduce_fx="sum")
```

#### `sync_dist` (bool)
Synchronize metric across devices in distributed training. Default: False.

```python
self.log("loss", loss, sync_dist=True)
```

#### `rank_zero_only` (bool)
Only log from rank 0 process. Default: False.

```python
self.log("debug_metric", value, rank_zero_only=True)
```

### Complete Example

```python
def training_step(self, batch, batch_idx):
    loss = self.compute_loss(batch)

    # Log per-step and per-epoch, display in progress bar
    self.log("train_loss", loss, on_step=True, on_epoch=True, prog_bar=True)

    return loss

def validation_step(self, batch, batch_idx):
    loss = self.compute_loss(batch)
    acc = self.compute_accuracy(batch)

    # Log epoch-level metrics
    self.log("val_loss", loss, on_epoch=True)
    self.log("val_acc", acc, on_epoch=True, prog_bar=True)
```

### Logging Multiple Metrics

Use `log_dict()` to log multiple metrics at once:

```python
def training_step(self, batch, batch_idx):
    loss, acc, f1 = self.compute_metrics(batch)

    metrics = {
        "train_loss": loss,
        "train_acc": acc,
        "train_f1": f1
    }

    self.log_dict(metrics, on_step=True, on_epoch=True)

    return loss
```

## Logging Hyperparameters

### Automatic Hyperparameter Logging

Use `save_hyperparameters()` in your model:

```python
class MyModel(L.LightningModule):
    def __init__(self, learning_rate, hidden_dim, dropout):
        super().__init__()
        # Automatically save and log hyperparameters
        self.save_hyperparameters()
```

### Manual Hyperparameter Logging

```python
# In LightningModule
class MyModel(L.LightningModule):
    def __init__(self, learning_rate):
        super().__init__()
        self.save_hyperparameters()

# Or manually with logger
trainer.logger.log_hyperparams({
    "learning_rate": 0.001,
    "batch_size": 32
})
```

## Logging Frequency

By default, Lightning logs every 50 training steps. Adjust with `log_every_n_steps`:

```python
trainer = L.Trainer(log_every_n_steps=10)
```

## Multiple Loggers

Use multiple loggers simultaneously:

```python
from lightning.pytorch import loggers as pl_loggers

tb_logger = pl_loggers.TensorBoardLogger("logs/")
wandb_logger = pl_loggers.WandbLogger(project="my-project")
csv_logger = pl_loggers.CSVLogger("logs/")

trainer = L.Trainer(logger=[tb_logger, wandb_logger, csv_logger])
```

## Advanced Logging

### Logging Images

```python
import torchvision

def validation_step(self, batch, batch_idx):
    x, y = batch
    y_hat = self.model(x)

    # Log first batch of images once per epoch
    if batch_idx == 0:
        # Create image grid
        grid = torchvision.utils.make_grid(x[:8])

        # Log to TensorBoard
        self.logger.experiment.add_image("val_images", grid, self.current_epoch)

        # Log to Wandb
        if isinstance(self.logger, pl_loggers.WandbLogger):
            import wandb
            self.logger.experiment.log({
                "val_images": [wandb.Image(img) for img in x[:8]]
            })
```

### Logging Histograms

```python
def on_train_epoch_end(self):
    # Log parameter histograms
    for name, param in self.named_parameters():
        self.logger.experiment.add_histogram(name, param, self.current_epoch)

        if param.grad is not None:
            self.logger.experiment.add_histogram(
                f"{name}_grad", param.grad, self.current_epoch
            )
```

### Logging Model Graph

```python
def on_train_start(self):
    # Log model architecture
    sample_input = torch.randn(1, 3, 224, 224).to(self.device)
    self.logger.experiment.add_graph(self.model, sample_input)
```

### Logging Custom Plots

```python
import matplotlib.pyplot as plt

def on_validation_epoch_end(self):
    # Create custom plot
    fig, ax = plt.subplots()
    ax.plot(self.validation_losses)
    ax.set_xlabel("Epoch")
    ax.set_ylabel("Loss")

    # Log to TensorBoard
    self.logger.experiment.add_figure("loss_curve", fig, self.current_epoch)

    plt.close(fig)
```

### Logging Text

```python
def validation_step(self, batch, batch_idx):
    # Generate predictions
    predictions = self.generate_text(batch)

    # Log to TensorBoard
    self.logger.experiment.add_text(
        "predictions",
        f"Batch {batch_idx}: {predictions}",
        self.current_epoch
    )
```

### Logging Audio

```python
def validation_step(self, batch, batch_idx):
    audio = self.generate_audio(batch)

    # Log to TensorBoard (audio is tensor of shape [1, samples])
    self.logger.experiment.add_audio(
        "generated_audio",
        audio,
        self.current_epoch,
        sample_rate=22050
    )
```

## Accessing Logger in LightningModule

```python
class MyModel(L.LightningModule):
    def training_step(self, batch, batch_idx):
        # Access logger experiment object
        logger = self.logger.experiment

        # For TensorBoard
        if isinstance(self.logger, pl_loggers.TensorBoardLogger):
            logger.add_scalar("custom_metric", value, self.global_step)

        # For Wandb
        if isinstance(self.logger, pl_loggers.WandbLogger):
            logger.log({"custom_metric": value})

        # For MLflow
        if isinstance(self.logger, pl_loggers.MLFlowLogger):
            logger.log_metric("custom_metric", value)
```

## Custom Logger

Create a custom logger by inheriting from `Logger`:

```python
from lightning.pytorch.loggers import Logger
from lightning.pytorch.utilities import rank_zero_only

class MyCustomLogger(Logger):
    def __init__(self, save_dir):
        super().__init__()
        self.save_dir = save_dir
        self._name = "my_logger"
        self._version = "0.1"

    @property
    def name(self):
        return self._name

    @property
    def version(self):
        return self._version

    @rank_zero_only
    def log_metrics(self, metrics, step):
        # Log metrics to your backend
        print(f"Step {step}: {metrics}")

    @rank_zero_only
    def log_hyperparams(self, params):
        # Log hyperparameters
        print(f"Hyperparameters: {params}")

    @rank_zero_only
    def save(self):
        # Save logger state
        pass

    @rank_zero_only
    def finalize(self, status):
        # Cleanup when training ends
        pass

# Usage
custom_logger = MyCustomLogger(save_dir="logs/")
trainer = L.Trainer(logger=custom_logger)
```

## Best Practices

### 1. Log Both Step and Epoch Metrics

```python
# Good: Track both granular and aggregate metrics
self.log("train_loss", loss, on_step=True, on_epoch=True)
```

### 2. Use Progress Bar for Key Metrics

```python
# Show important metrics in progress bar
self.log("val_acc", acc, prog_bar=True)
```

### 3. Synchronize Metrics in Distributed Training

```python
# Ensure correct aggregation across GPUs
self.log("val_loss", loss, sync_dist=True)
```

### 4. Log Learning Rate

```python
from lightning.pytorch.callbacks import LearningRateMonitor

trainer = L.Trainer(callbacks=[LearningRateMonitor(logging_interval="step")])
```

### 5. Log Gradient Norms

```python
def on_after_backward(self):
    # Monitor gradient flow
    grad_norm = torch.nn.utils.clip_grad_norm_(self.parameters(), max_norm=float('inf'))
    self.log("grad_norm", grad_norm)
```

### 6. Use Descriptive Metric Names

```python
# Good: Clear naming convention
self.log("train/loss", loss)
self.log("train/accuracy", acc)
self.log("val/loss", val_loss)
self.log("val/accuracy", val_acc)
```

### 7. Log Hyperparameters

```python
# Always save hyperparameters for reproducibility
class MyModel(L.LightningModule):
    def __init__(self, **kwargs):
        super().__init__()
        self.save_hyperparameters()
```

### 8. Don't Log Too Frequently

```python
# Avoid logging every step for expensive operations
if batch_idx % 100 == 0:
    self.log_images(batch)
```

## Common Patterns

### Structured Logging

```python
def training_step(self, batch, batch_idx):
    loss, metrics = self.compute_loss_and_metrics(batch)

    # Organize logs with prefixes
    self.log("train/loss", loss)
    self.log_dict({f"train/{k}": v for k, v in metrics.items()})

    return loss

def validation_step(self, batch, batch_idx):
    loss, metrics = self.compute_loss_and_metrics(batch)

    self.log("val/loss", loss)
    self.log_dict({f"val/{k}": v for k, v in metrics.items()})
```

### Conditional Logging

```python
def training_step(self, batch, batch_idx):
    loss = self.compute_loss(batch)

    # Log expensive metrics less frequently
    if self.global_step % 100 == 0:
        expensive_metric = self.compute_expensive_metric(batch)
        self.log("expensive_metric", expensive_metric)

    self.log("train_loss", loss)
    return loss
```

### Multi-Task Logging

```python
def training_step(self, batch, batch_idx):
    x, y_task1, y_task2 = batch

    loss_task1 = self.compute_task1_loss(x, y_task1)
    loss_task2 = self.compute_task2_loss(x, y_task2)
    total_loss = loss_task1 + loss_task2

    # Log per-task metrics
    self.log_dict({
        "train/loss_task1": loss_task1,
        "train/loss_task2": loss_task2,
        "train/loss_total": total_loss
    })

    return total_loss
```

## Troubleshooting

### Metric Not Found Error

If you get "metric not found" errors with schedulers:

```python
# Make sure metric is logged with logger=True
self.log("val_loss", loss, logger=True)

# And configure scheduler to monitor it
def configure_optimizers(self):
    optimizer = torch.optim.Adam(self.parameters())
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer)
    return {
        "optimizer": optimizer,
        "lr_scheduler": {
            "scheduler": scheduler,
            "monitor": "val_loss"  # Must match logged metric name
        }
    }
```

### Metrics Not Syncing in Distributed Training

```python
# Enable sync_dist for proper aggregation
self.log("val_acc", acc, sync_dist=True)
```

### Logger Not Saving

```python
# Ensure logger has write permissions
trainer = L.Trainer(
    logger=pl_loggers.TensorBoardLogger("logs/"),
    default_root_dir="outputs/"  # Ensure directory exists and is writable
)
```
