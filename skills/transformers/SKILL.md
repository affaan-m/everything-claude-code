---
name: transformers
description: This skill should be used when working with pre-trained transformer models for natural language processing, computer vision, audio, or multimodal tasks. Use for text generation, classification, question answering, translation, summarization, image classification, object detection, speech recognition, and fine-tuning models on custom datasets.
license: Apache-2.0 license
compatibility: Some features require an Huggingface token
metadata:
    skill-author: K-Dense Inc.
---

# Transformers

## Overview

The Hugging Face Transformers library provides access to thousands of pre-trained models for tasks across NLP, computer vision, audio, and multimodal domains. Use this skill to load models, perform inference, and fine-tune on custom data.

## Installation

Install transformers and core dependencies:

```bash
uv pip install torch transformers datasets evaluate accelerate
```

For vision tasks, add:
```bash
uv pip install timm pillow
```

For audio tasks, add:
```bash
uv pip install librosa soundfile
```

## Authentication

Many models on the Hugging Face Hub require authentication. Set up access:

```python
from huggingface_hub import login
login()  # Follow prompts to enter token
```

Or set environment variable:
```bash
export HUGGINGFACE_TOKEN="your_token_here"
```

Get tokens at: https://huggingface.co/settings/tokens

## Quick Start

Use the Pipeline API for fast inference without manual configuration:

```python
from transformers import pipeline

# Text generation
generator = pipeline("text-generation", model="gpt2")
result = generator("The future of AI is", max_length=50)

# Text classification
classifier = pipeline("text-classification")
result = classifier("This movie was excellent!")

# Question answering
qa = pipeline("question-answering")
result = qa(question="What is AI?", context="AI is artificial intelligence...")
```

## Core Capabilities

### 1. Pipelines for Quick Inference

Use for simple, optimized inference across many tasks. Supports text generation, classification, NER, question answering, summarization, translation, image classification, object detection, audio classification, and more.

**When to use**: Quick prototyping, simple inference tasks, no custom preprocessing needed.

See `references/pipelines.md` for comprehensive task coverage and optimization.

### 2. Model Loading and Management

Load pre-trained models with fine-grained control over configuration, device placement, and precision.

**When to use**: Custom model initialization, advanced device management, model inspection.

See `references/models.md` for loading patterns and best practices.

### 3. Text Generation

Generate text with LLMs using various decoding strategies (greedy, beam search, sampling) and control parameters (temperature, top-k, top-p).

**When to use**: Creative text generation, code generation, conversational AI, text completion.

See `references/generation.md` for generation strategies and parameters.

### 4. Training and Fine-Tuning

Fine-tune pre-trained models on custom datasets using the Trainer API with automatic mixed precision, distributed training, and logging.

**When to use**: Task-specific model adaptation, domain adaptation, improving model performance.

See `references/training.md` for training workflows and best practices.

### 5. Tokenization

Convert text to tokens and token IDs for model input, with padding, truncation, and special token handling.

**When to use**: Custom preprocessing pipelines, understanding model inputs, batch processing.

See `references/tokenizers.md` for tokenization details.

## Common Patterns

### Pattern 1: Simple Inference
For straightforward tasks, use pipelines:
```python
pipe = pipeline("task-name", model="model-id")
output = pipe(input_data)
```

### Pattern 2: Custom Model Usage
For advanced control, load model and tokenizer separately:
```python
from transformers import AutoModelForCausalLM, AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("model-id")
model = AutoModelForCausalLM.from_pretrained("model-id", device_map="auto")

inputs = tokenizer("text", return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=100)
result = tokenizer.decode(outputs[0])
```

### Pattern 3: Fine-Tuning
For task adaptation, use Trainer:
```python
from transformers import Trainer, TrainingArguments

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=8,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
)

trainer.train()
```

## Reference Documentation

For detailed information on specific components:
- **Pipelines**: `references/pipelines.md` - All supported tasks and optimization
- **Models**: `references/models.md` - Loading, saving, and configuration
- **Generation**: `references/generation.md` - Text generation strategies and parameters
- **Training**: `references/training.md` - Fine-tuning with Trainer API
- **Tokenizers**: `references/tokenizers.md` - Tokenization and preprocessing

