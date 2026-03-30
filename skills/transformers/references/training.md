# Training and Fine-Tuning

## Overview

Fine-tune pre-trained models on custom datasets using the Trainer API. The Trainer handles training loops, gradient accumulation, mixed precision, logging, and checkpointing.

## Basic Fine-Tuning Workflow

### Step 1: Load and Preprocess Data

```python
from datasets import load_dataset

# Load dataset
dataset = load_dataset("yelp_review_full")
train_dataset = dataset["train"]
eval_dataset = dataset["test"]

# Tokenize
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

def tokenize_function(examples):
    return tokenizer(
        examples["text"],
        padding="max_length",
        truncation=True,
        max_length=512
    )

train_dataset = train_dataset.map(tokenize_function, batched=True)
eval_dataset = eval_dataset.map(tokenize_function, batched=True)
```

### Step 2: Load Model

```python
from transformers import AutoModelForSequenceClassification

model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased",
    num_labels=5  # Number of classes
)
```

### Step 3: Define Metrics

```python
import evaluate
import numpy as np

metric = evaluate.load("accuracy")

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return metric.compute(predictions=predictions, references=labels)
```

### Step 4: Configure Training

```python
from transformers import TrainingArguments

training_args = TrainingArguments(
    output_dir="./results",
    eval_strategy="epoch",
    save_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=3,
    weight_decay=0.01,
    logging_dir="./logs",
    logging_steps=10,
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
)
```

### Step 5: Create Trainer and Train

```python
from transformers import Trainer

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    compute_metrics=compute_metrics,
)

# Start training
trainer.train()

# Evaluate
results = trainer.evaluate()
print(results)
```

### Step 6: Save Model

```python
trainer.save_model("./fine_tuned_model")
tokenizer.save_pretrained("./fine_tuned_model")

# Or push to Hub
trainer.push_to_hub("username/my-finetuned-model")
```

## TrainingArguments Parameters

### Essential Parameters

**output_dir**: Directory for checkpoints and logs
```python
output_dir="./results"
```

**num_train_epochs**: Number of training epochs
```python
num_train_epochs=3
```

**per_device_train_batch_size**: Batch size per GPU/CPU
```python
per_device_train_batch_size=8
```

**learning_rate**: Optimizer learning rate
```python
learning_rate=2e-5  # Common for BERT-style models
learning_rate=5e-5  # Common for smaller models
```

**weight_decay**: L2 regularization
```python
weight_decay=0.01
```

### Evaluation and Saving

**eval_strategy**: When to evaluate ("no", "steps", "epoch")
```python
eval_strategy="epoch"  # Evaluate after each epoch
eval_strategy="steps"  # Evaluate every eval_steps
```

**save_strategy**: When to save checkpoints
```python
save_strategy="epoch"
save_strategy="steps"
save_steps=500
```

**load_best_model_at_end**: Load best checkpoint after training
```python
load_best_model_at_end=True
metric_for_best_model="accuracy"  # Metric to compare
```

### Optimization

**gradient_accumulation_steps**: Accumulate gradients over multiple steps
```python
gradient_accumulation_steps=4  # Effective batch size = batch_size * 4
```

**fp16**: Enable mixed precision (NVIDIA GPUs)
```python
fp16=True
```

**bf16**: Enable bfloat16 (newer GPUs)
```python
bf16=True
```

**gradient_checkpointing**: Trade compute for memory
```python
gradient_checkpointing=True  # Slower but uses less memory
```

**optim**: Optimizer choice
```python
optim="adamw_torch"  # Default
optim="adamw_8bit"    # 8-bit Adam (requires bitsandbytes)
optim="adafactor"     # Memory-efficient alternative
```

### Learning Rate Scheduling

**lr_scheduler_type**: Learning rate schedule
```python
lr_scheduler_type="linear"       # Linear decay
lr_scheduler_type="cosine"       # Cosine annealing
lr_scheduler_type="constant"     # No decay
lr_scheduler_type="constant_with_warmup"
```

**warmup_steps** or **warmup_ratio**: Warmup period
```python
warmup_steps=500
# Or
warmup_ratio=0.1  # 10% of total steps
```

### Logging

**logging_dir**: TensorBoard logs directory
```python
logging_dir="./logs"
```

**logging_steps**: Log every N steps
```python
logging_steps=10
```

**report_to**: Logging integrations
```python
report_to=["tensorboard"]
report_to=["wandb"]
report_to=["tensorboard", "wandb"]
```

### Distributed Training

**ddp_backend**: Distributed backend
```python
ddp_backend="nccl"  # For multi-GPU
```

**deepspeed**: DeepSpeed config file
```python
deepspeed="ds_config.json"
```

## Data Collators

Handle dynamic padding and special preprocessing:

### DataCollatorWithPadding

Pad sequences to longest in batch:
```python
from transformers import DataCollatorWithPadding

data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    data_collator=data_collator,
)
```

### DataCollatorForLanguageModeling

For masked language modeling:
```python
from transformers import DataCollatorForLanguageModeling

data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer,
    mlm=True,
    mlm_probability=0.15
)
```

### DataCollatorForSeq2Seq

For sequence-to-sequence tasks:
```python
from transformers import DataCollatorForSeq2Seq

data_collator = DataCollatorForSeq2Seq(
    tokenizer=tokenizer,
    model=model,
    padding=True
)
```

## Custom Training

### Custom Trainer

Override methods for custom behavior:

```python
from transformers import Trainer

class CustomTrainer(Trainer):
    def compute_loss(self, model, inputs, return_outputs=False):
        labels = inputs.pop("labels")
        outputs = model(**inputs)
        logits = outputs.logits

        # Custom loss computation
        loss_fct = torch.nn.CrossEntropyLoss(weight=class_weights)
        loss = loss_fct(logits.view(-1, self.model.config.num_labels), labels.view(-1))

        return (loss, outputs) if return_outputs else loss
```

### Custom Callbacks

Monitor and control training:

```python
from transformers import TrainerCallback

class CustomCallback(TrainerCallback):
    def on_epoch_end(self, args, state, control, **kwargs):
        print(f"Epoch {state.epoch} completed")
        # Custom logic here
        return control

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    callbacks=[CustomCallback],
)
```

## Advanced Training Techniques

### Parameter-Efficient Fine-Tuning (PEFT)

Use LoRA for efficient fine-tuning:

```python
from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["query", "value"],
    lora_dropout=0.05,
    bias="none",
    task_type="SEQ_CLS"
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()  # Shows reduced parameter count

# Train normally with Trainer
trainer = Trainer(model=model, args=training_args, ...)
trainer.train()
```

### Gradient Checkpointing

Reduce memory at cost of speed:

```python
model.gradient_checkpointing_enable()

training_args = TrainingArguments(
    gradient_checkpointing=True,
    ...
)
```

### Mixed Precision Training

```python
training_args = TrainingArguments(
    fp16=True,  # For NVIDIA GPUs with Tensor Cores
    # or
    bf16=True,  # For newer GPUs (A100, H100)
    ...
)
```

### DeepSpeed Integration

For very large models:

```python
# ds_config.json
{
  "train_batch_size": 16,
  "gradient_accumulation_steps": 1,
  "optimizer": {
    "type": "AdamW",
    "params": {
      "lr": 2e-5
    }
  },
  "fp16": {
    "enabled": true
  },
  "zero_optimization": {
    "stage": 2
  }
}
```

```python
training_args = TrainingArguments(
    deepspeed="ds_config.json",
    ...
)
```

## Training Tips

### Hyperparameter Tuning

Common starting points:
- **Learning rate**: 2e-5 to 5e-5 for BERT-like models, 1e-4 to 1e-3 for smaller models
- **Batch size**: 8-32 depending on GPU memory
- **Epochs**: 2-4 for fine-tuning, more for domain adaptation
- **Warmup**: 10% of total steps

Use Optuna for hyperparameter search:

```python
def model_init():
    return AutoModelForSequenceClassification.from_pretrained(
        "bert-base-uncased",
        num_labels=5
    )

def optuna_hp_space(trial):
    return {
        "learning_rate": trial.suggest_float("learning_rate", 1e-5, 5e-5, log=True),
        "per_device_train_batch_size": trial.suggest_categorical("per_device_train_batch_size", [8, 16, 32]),
        "num_train_epochs": trial.suggest_int("num_train_epochs", 2, 5),
    }

trainer = Trainer(model_init=model_init, args=training_args, ...)
best_trial = trainer.hyperparameter_search(
    direction="maximize",
    backend="optuna",
    hp_space=optuna_hp_space,
    n_trials=10,
)
```

### Monitoring Training

Use TensorBoard:
```bash
tensorboard --logdir ./logs
```

Or Weights & Biases:
```python
import wandb
wandb.init(project="my-project")

training_args = TrainingArguments(
    report_to=["wandb"],
    ...
)
```

### Resume Training

Resume from checkpoint:
```python
trainer.train(resume_from_checkpoint="./results/checkpoint-1000")
```

## Common Issues

**CUDA out of memory:**
- Reduce batch size
- Enable gradient checkpointing
- Use gradient accumulation
- Use 8-bit optimizers

**Overfitting:**
- Increase weight_decay
- Add dropout
- Use early stopping
- Reduce model size or training epochs

**Slow training:**
- Increase batch size
- Enable mixed precision (fp16/bf16)
- Use multiple GPUs
- Optimize data loading

## Best Practices

1. **Start small**: Test on small dataset subset first
2. **Use evaluation**: Monitor validation metrics
3. **Save checkpoints**: Enable save_strategy
4. **Log extensively**: Use TensorBoard or W&B
5. **Try different learning rates**: Start with 2e-5
6. **Use warmup**: Helps training stability
7. **Enable mixed precision**: Faster training
8. **Consider PEFT**: For large models with limited resources
