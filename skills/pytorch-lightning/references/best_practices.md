# Best Practices - PyTorch Lightning

## Code Organization

### 1. Separate Research from Engineering

**Good:**
```python
class MyModel(L.LightningModule):
    # Research code (what the model does)
    def training_step(self, batch, batch_idx):
        loss = self.compute_loss(batch)
        return loss

# Engineering code (how to train) - in Trainer
trainer = L.Trainer(
    max_epochs=100,
    accelerator="gpu",
    devices=4,
    strategy="ddp"
)
```

**Bad:**
```python
# Mixing research and engineering logic
class MyModel(L.LightningModule):
    def training_step(self, batch, batch_idx):
        loss = self.compute_loss(batch)

        # Don't do device management manually
        loss = loss.cuda()

        # Don't do optimizer steps manually (unless manual optimization)
        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        return loss
```

### 2. Use LightningDataModule

**Good:**
```python
class MyDataModule(L.LightningDataModule):
    def __init__(self, data_dir, batch_size):
        super().__init__()
        self.data_dir = data_dir
        self.batch_size = batch_size

    def prepare_data(self):
        # Download data once
        download_data(self.data_dir)

    def setup(self, stage):
        # Load data per-process
        self.train_dataset = MyDataset(self.data_dir, split='train')
        self.val_dataset = MyDataset(self.data_dir, split='val')

    def train_dataloader(self):
        return DataLoader(self.train_dataset, batch_size=self.batch_size, shuffle=True)

# Reusable and shareable
dm = MyDataModule("./data", batch_size=32)
trainer.fit(model, datamodule=dm)
```

**Bad:**
```python
# Scattered data logic
train_dataset = load_data()
val_dataset = load_data()
train_loader = DataLoader(train_dataset, ...)
val_loader = DataLoader(val_dataset, ...)
trainer.fit(model, train_loader, val_loader)
```

### 3. Keep Models Modular

```python
class Encoder(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(...)

    def forward(self, x):
        return self.layers(x)

class Decoder(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(...)

    def forward(self, x):
        return self.layers(x)

class MyModel(L.LightningModule):
    def __init__(self):
        super().__init__()
        self.encoder = Encoder()
        self.decoder = Decoder()

    def forward(self, x):
        z = self.encoder(x)
        return self.decoder(z)
```

## Device Agnosticism

### 1. Never Use Explicit CUDA Calls

**Bad:**
```python
x = x.cuda()
model = model.cuda()
torch.cuda.set_device(0)
```

**Good:**
```python
# Inside LightningModule
x = x.to(self.device)

# Or let Lightning handle it automatically
def training_step(self, batch, batch_idx):
    x, y = batch  # Already on correct device
    return loss
```

### 2. Use `self.device` Property

```python
class MyModel(L.LightningModule):
    def training_step(self, batch, batch_idx):
        # Create tensors on correct device
        noise = torch.randn(batch.size(0), 100).to(self.device)

        # Or use type_as
        noise = torch.randn(batch.size(0), 100).type_as(batch)
```

### 3. Register Buffers for Non-Parameters

```python
class MyModel(L.LightningModule):
    def __init__(self):
        super().__init__()
        # Register buffers (automatically moved to correct device)
        self.register_buffer("running_mean", torch.zeros(100))

    def forward(self, x):
        # self.running_mean is automatically on correct device
        return x - self.running_mean
```

## Hyperparameter Management

### 1. Always Use `save_hyperparameters()`

**Good:**
```python
class MyModel(L.LightningModule):
    def __init__(self, learning_rate, hidden_dim, dropout):
        super().__init__()
        self.save_hyperparameters()  # Saves all arguments

        # Access via self.hparams
        self.model = nn.Linear(self.hparams.hidden_dim, 10)

# Load from checkpoint with saved hparams
model = MyModel.load_from_checkpoint("checkpoint.ckpt")
print(model.hparams.learning_rate)  # Original value preserved
```

**Bad:**
```python
class MyModel(L.LightningModule):
    def __init__(self, learning_rate, hidden_dim, dropout):
        super().__init__()
        self.learning_rate = learning_rate  # Manual tracking
        self.hidden_dim = hidden_dim
```

### 2. Ignore Specific Arguments

```python
class MyModel(L.LightningModule):
    def __init__(self, lr, model, dataset):
        super().__init__()
        # Don't save 'model' and 'dataset' (not serializable)
        self.save_hyperparameters(ignore=['model', 'dataset'])

        self.model = model
        self.dataset = dataset
```

### 3. Use Hyperparameters in `configure_optimizers()`

```python
def configure_optimizers(self):
    # Use saved hyperparameters
    optimizer = torch.optim.Adam(
        self.parameters(),
        lr=self.hparams.learning_rate,
        weight_decay=self.hparams.weight_decay
    )
    return optimizer
```

## Logging Best Practices

### 1. Log Both Step and Epoch Metrics

```python
def training_step(self, batch, batch_idx):
    loss = self.compute_loss(batch)

    # Log per-step for detailed monitoring
    # Log per-epoch for aggregated view
    self.log("train_loss", loss, on_step=True, on_epoch=True, prog_bar=True)

    return loss
```

### 2. Use Structured Logging

```python
def training_step(self, batch, batch_idx):
    # Organize with prefixes
    self.log("train/loss", loss)
    self.log("train/acc", acc)
    self.log("train/f1", f1)

def validation_step(self, batch, batch_idx):
    self.log("val/loss", loss)
    self.log("val/acc", acc)
    self.log("val/f1", f1)
```

### 3. Sync Metrics in Distributed Training

```python
def validation_step(self, batch, batch_idx):
    loss = self.compute_loss(batch)

    # IMPORTANT: sync_dist=True for proper aggregation across GPUs
    self.log("val_loss", loss, sync_dist=True)
```

### 4. Monitor Learning Rate

```python
from lightning.pytorch.callbacks import LearningRateMonitor

trainer = L.Trainer(
    callbacks=[LearningRateMonitor(logging_interval="step")]
)
```

## Reproducibility

### 1. Seed Everything

```python
import lightning as L

# Set seed for reproducibility
L.seed_everything(42, workers=True)

trainer = L.Trainer(
    deterministic=True,  # Use deterministic algorithms
    benchmark=False      # Disable cudnn benchmarking
)
```

### 2. Avoid Non-Deterministic Operations

```python
# Bad: Non-deterministic
torch.use_deterministic_algorithms(False)

# Good: Deterministic
torch.use_deterministic_algorithms(True)
```

### 3. Log Random State

```python
def on_save_checkpoint(self, checkpoint):
    # Save random states
    checkpoint['rng_state'] = {
        'torch': torch.get_rng_state(),
        'numpy': np.random.get_state(),
        'python': random.getstate()
    }

def on_load_checkpoint(self, checkpoint):
    # Restore random states
    if 'rng_state' in checkpoint:
        torch.set_rng_state(checkpoint['rng_state']['torch'])
        np.random.set_state(checkpoint['rng_state']['numpy'])
        random.setstate(checkpoint['rng_state']['python'])
```

## Debugging

### 1. Use `fast_dev_run`

```python
# Test with 1 batch before full training
trainer = L.Trainer(fast_dev_run=True)
trainer.fit(model, datamodule=dm)
```

### 2. Limit Training Data

```python
# Use only 10% of data for quick iteration
trainer = L.Trainer(
    limit_train_batches=0.1,
    limit_val_batches=0.1
)
```

### 3. Enable Anomaly Detection

```python
# Detect NaN/Inf in gradients
trainer = L.Trainer(detect_anomaly=True)
```

### 4. Overfit on Small Batch

```python
# Overfit on 10 batches to verify model capacity
trainer = L.Trainer(overfit_batches=10)
```

### 5. Profile Code

```python
# Find performance bottlenecks
trainer = L.Trainer(profiler="simple")  # or "advanced"
```

## Memory Optimization

### 1. Use Mixed Precision

```python
# FP16/BF16 mixed precision for memory savings and speed
trainer = L.Trainer(
    precision="16-mixed",   # V100, T4
    # or
    precision="bf16-mixed"  # A100, H100
)
```

### 2. Gradient Accumulation

```python
# Simulate larger batch size without memory increase
trainer = L.Trainer(
    accumulate_grad_batches=4  # Accumulate over 4 batches
)
```

### 3. Gradient Checkpointing

```python
class MyModel(L.LightningModule):
    def __init__(self):
        super().__init__()
        self.model = transformers.AutoModel.from_pretrained("bert-base")

        # Enable gradient checkpointing
        self.model.gradient_checkpointing_enable()
```

### 4. Clear Cache

```python
def on_train_epoch_end(self):
    # Clear collected outputs to free memory
    self.training_step_outputs.clear()

    # Clear CUDA cache if needed
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
```

### 5. Use Efficient Data Types

```python
# Use appropriate precision
# FP32 for stability, FP16/BF16 for speed/memory

class MyModel(L.LightningModule):
    def __init__(self):
        super().__init__()
        # Use bfloat16 for better numerical stability than fp16
        self.model = MyTransformer().to(torch.bfloat16)
```

## Training Stability

### 1. Gradient Clipping

```python
# Prevent gradient explosion
trainer = L.Trainer(
    gradient_clip_val=1.0,
    gradient_clip_algorithm="norm"  # or "value"
)
```

### 2. Learning Rate Warmup

```python
def configure_optimizers(self):
    optimizer = torch.optim.Adam(self.parameters(), lr=1e-3)

    scheduler = torch.optim.lr_scheduler.OneCycleLR(
        optimizer,
        max_lr=1e-2,
        total_steps=self.trainer.estimated_stepping_batches,
        pct_start=0.1  # 10% warmup
    )

    return {
        "optimizer": optimizer,
        "lr_scheduler": {
            "scheduler": scheduler,
            "interval": "step"
        }
    }
```

### 3. Monitor Gradients

```python
class MyModel(L.LightningModule):
    def on_after_backward(self):
        # Log gradient norms
        for name, param in self.named_parameters():
            if param.grad is not None:
                self.log(f"grad_norm/{name}", param.grad.norm())
```

### 4. Use EarlyStopping

```python
from lightning.pytorch.callbacks import EarlyStopping

early_stop = EarlyStopping(
    monitor="val_loss",
    patience=10,
    mode="min",
    verbose=True
)

trainer = L.Trainer(callbacks=[early_stop])
```

## Checkpointing

### 1. Save Top-K and Last

```python
from lightning.pytorch.callbacks import ModelCheckpoint

checkpoint_callback = ModelCheckpoint(
    dirpath="checkpoints/",
    filename="{epoch}-{val_loss:.2f}",
    monitor="val_loss",
    mode="min",
    save_top_k=3,    # Keep best 3
    save_last=True   # Always save last for resuming
)

trainer = L.Trainer(callbacks=[checkpoint_callback])
```

### 2. Resume Training

```python
# Resume from last checkpoint
trainer.fit(model, datamodule=dm, ckpt_path="last.ckpt")

# Resume from specific checkpoint
trainer.fit(model, datamodule=dm, ckpt_path="epoch=10-val_loss=0.23.ckpt")
```

### 3. Custom Checkpoint State

```python
def on_save_checkpoint(self, checkpoint):
    # Add custom state
    checkpoint['custom_data'] = self.custom_data
    checkpoint['epoch_metrics'] = self.metrics

def on_load_checkpoint(self, checkpoint):
    # Restore custom state
    self.custom_data = checkpoint.get('custom_data', {})
    self.metrics = checkpoint.get('epoch_metrics', [])
```

## Testing

### 1. Separate Train and Test

```python
# Train
trainer = L.Trainer(max_epochs=100)
trainer.fit(model, datamodule=dm)

# Test ONLY ONCE before publishing
trainer.test(model, datamodule=dm)
```

### 2. Use Validation for Model Selection

```python
# Use validation for hyperparameter tuning
checkpoint_callback = ModelCheckpoint(monitor="val_loss", mode="min")
trainer = L.Trainer(callbacks=[checkpoint_callback])
trainer.fit(model, datamodule=dm)

# Load best model
best_model = MyModel.load_from_checkpoint(checkpoint_callback.best_model_path)

# Test only once with best model
trainer.test(best_model, datamodule=dm)
```

## Code Quality

### 1. Type Hints

```python
from typing import Any, Dict, Tuple
import torch
from torch import Tensor

class MyModel(L.LightningModule):
    def training_step(self, batch: Tuple[Tensor, Tensor], batch_idx: int) -> Tensor:
        x, y = batch
        loss = self.compute_loss(x, y)
        return loss

    def configure_optimizers(self) -> Dict[str, Any]:
        optimizer = torch.optim.Adam(self.parameters())
        return {"optimizer": optimizer}
```

### 2. Docstrings

```python
class MyModel(L.LightningModule):
    """
    My awesome model for image classification.

    Args:
        num_classes: Number of output classes
        learning_rate: Learning rate for optimizer
        hidden_dim: Hidden dimension size
    """

    def __init__(self, num_classes: int, learning_rate: float, hidden_dim: int):
        super().__init__()
        self.save_hyperparameters()
```

### 3. Property Methods

```python
class MyModel(L.LightningModule):
    @property
    def learning_rate(self) -> float:
        """Current learning rate."""
        return self.hparams.learning_rate

    @property
    def num_parameters(self) -> int:
        """Total number of parameters."""
        return sum(p.numel() for p in self.parameters())
```

## Common Pitfalls

### 1. Forgetting to Return Loss

**Bad:**
```python
def training_step(self, batch, batch_idx):
    loss = self.compute_loss(batch)
    self.log("train_loss", loss)
    # FORGOT TO RETURN LOSS!
```

**Good:**
```python
def training_step(self, batch, batch_idx):
    loss = self.compute_loss(batch)
    self.log("train_loss", loss)
    return loss  # MUST return loss
```

### 2. Not Syncing Metrics in DDP

**Bad:**
```python
def validation_step(self, batch, batch_idx):
    self.log("val_acc", acc)  # Wrong value with multi-GPU!
```

**Good:**
```python
def validation_step(self, batch, batch_idx):
    self.log("val_acc", acc, sync_dist=True)  # Correct aggregation
```

### 3. Manual Device Management

**Bad:**
```python
def training_step(self, batch, batch_idx):
    x = x.cuda()  # Don't do this
    y = y.cuda()
```

**Good:**
```python
def training_step(self, batch, batch_idx):
    # Lightning handles device placement
    x, y = batch  # Already on correct device
```

### 4. Not Using `self.log()`

**Bad:**
```python
def training_step(self, batch, batch_idx):
    loss = self.compute_loss(batch)
    self.training_losses.append(loss)  # Manual tracking
    return loss
```

**Good:**
```python
def training_step(self, batch, batch_idx):
    loss = self.compute_loss(batch)
    self.log("train_loss", loss)  # Automatic logging
    return loss
```

### 5. Modifying Batch In-Place

**Bad:**
```python
def training_step(self, batch, batch_idx):
    x, y = batch
    x[:] = self.augment(x)  # In-place modification can cause issues
```

**Good:**
```python
def training_step(self, batch, batch_idx):
    x, y = batch
    x = self.augment(x)  # Create new tensor
```

## Performance Tips

### 1. Use DataLoader Workers

```python
def train_dataloader(self):
    return DataLoader(
        self.train_dataset,
        batch_size=32,
        num_workers=4,           # Use multiple workers
        pin_memory=True,         # Faster GPU transfer
        persistent_workers=True  # Keep workers alive
    )
```

### 2. Enable Benchmark Mode (if fixed input size)

```python
trainer = L.Trainer(benchmark=True)
```

### 3. Use Automatic Batch Size Finding

```python
from lightning.pytorch.tuner import Tuner

trainer = L.Trainer()
tuner = Tuner(trainer)

# Find optimal batch size
tuner.scale_batch_size(model, datamodule=dm, mode="power")

# Then train
trainer.fit(model, datamodule=dm)
```

### 4. Optimize Data Loading

```python
# Use faster image decoding
import torch
import torchvision.transforms as T

transforms = T.Compose([
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Use PIL-SIMD for faster image loading
# pip install pillow-simd
```
