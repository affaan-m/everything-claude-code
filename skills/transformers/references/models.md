# Model Loading and Management

## Overview

The transformers library provides flexible model loading with automatic architecture detection, device management, and configuration control.

## Loading Models

### AutoModel Classes

Use AutoModel classes for automatic architecture selection:

```python
from transformers import AutoModel, AutoModelForSequenceClassification, AutoModelForCausalLM

# Base model (no task head)
model = AutoModel.from_pretrained("bert-base-uncased")

# Sequence classification
model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased")

# Causal language modeling (GPT-style)
model = AutoModelForCausalLM.from_pretrained("gpt2")

# Masked language modeling (BERT-style)
from transformers import AutoModelForMaskedLM
model = AutoModelForMaskedLM.from_pretrained("bert-base-uncased")

# Sequence-to-sequence (T5-style)
from transformers import AutoModelForSeq2SeqLM
model = AutoModelForSeq2SeqLM.from_pretrained("t5-small")
```

### Common AutoModel Classes

**NLP Tasks:**
- `AutoModelForSequenceClassification`: Text classification, sentiment analysis
- `AutoModelForTokenClassification`: NER, POS tagging
- `AutoModelForQuestionAnswering`: Extractive QA
- `AutoModelForCausalLM`: Text generation (GPT, Llama)
- `AutoModelForMaskedLM`: Masked language modeling (BERT)
- `AutoModelForSeq2SeqLM`: Translation, summarization (T5, BART)

**Vision Tasks:**
- `AutoModelForImageClassification`: Image classification
- `AutoModelForObjectDetection`: Object detection
- `AutoModelForImageSegmentation`: Image segmentation

**Audio Tasks:**
- `AutoModelForAudioClassification`: Audio classification
- `AutoModelForSpeechSeq2Seq`: Speech recognition

**Multimodal:**
- `AutoModelForVision2Seq`: Image captioning, VQA

## Loading Parameters

### Basic Parameters

**pretrained_model_name_or_path**: Model identifier or local path
```python
model = AutoModel.from_pretrained("bert-base-uncased")  # From Hub
model = AutoModel.from_pretrained("./local/model/path")  # From disk
```

**num_labels**: Number of output labels for classification
```python
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased",
    num_labels=3
)
```

**cache_dir**: Custom cache location
```python
model = AutoModel.from_pretrained("model-id", cache_dir="./my_cache")
```

### Device Management

**device_map**: Automatic device allocation for large models
```python
# Automatically distribute across GPUs and CPU
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    device_map="auto"
)

# Sequential placement
model = AutoModelForCausalLM.from_pretrained(
    "model-id",
    device_map="sequential"
)

# Custom device map
device_map = {
    "transformer.layers.0": 0,      # GPU 0
    "transformer.layers.1": 1,      # GPU 1
    "transformer.layers.2": "cpu",  # CPU
}
model = AutoModel.from_pretrained("model-id", device_map=device_map)
```

Manual device placement:
```python
import torch
model = AutoModel.from_pretrained("model-id")
model.to("cuda:0")  # Move to GPU 0
model.to(torch.device("cuda" if torch.cuda.is_available() else "cpu"))
```

### Precision Control

**torch_dtype**: Set model precision
```python
import torch

# Float16 (half precision)
model = AutoModel.from_pretrained("model-id", torch_dtype=torch.float16)

# BFloat16 (better range than float16)
model = AutoModel.from_pretrained("model-id", torch_dtype=torch.bfloat16)

# Auto (use original dtype)
model = AutoModel.from_pretrained("model-id", torch_dtype="auto")
```

### Attention Implementation

**attn_implementation**: Choose attention mechanism
```python
# Scaled Dot Product Attention (PyTorch 2.0+, fastest)
model = AutoModel.from_pretrained("model-id", attn_implementation="sdpa")

# Flash Attention 2 (requires flash-attn package)
model = AutoModel.from_pretrained("model-id", attn_implementation="flash_attention_2")

# Eager (default, most compatible)
model = AutoModel.from_pretrained("model-id", attn_implementation="eager")
```

### Memory Optimization

**low_cpu_mem_usage**: Reduce CPU memory during loading
```python
model = AutoModelForCausalLM.from_pretrained(
    "large-model-id",
    low_cpu_mem_usage=True,
    device_map="auto"
)
```

**load_in_8bit**: 8-bit quantization (requires bitsandbytes)
```python
model = AutoModelForCausalLM.from_pretrained(
    "model-id",
    load_in_8bit=True,
    device_map="auto"
)
```

**load_in_4bit**: 4-bit quantization
```python
from transformers import BitsAndBytesConfig

quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16
)

model = AutoModelForCausalLM.from_pretrained(
    "model-id",
    quantization_config=quantization_config,
    device_map="auto"
)
```

## Model Configuration

### Loading with Custom Config

```python
from transformers import AutoConfig, AutoModel

# Load and modify config
config = AutoConfig.from_pretrained("bert-base-uncased")
config.hidden_dropout_prob = 0.2
config.attention_probs_dropout_prob = 0.2

# Initialize model with custom config
model = AutoModel.from_pretrained("bert-base-uncased", config=config)
```

### Initializing from Config Only

```python
config = AutoConfig.from_pretrained("gpt2")
model = AutoModelForCausalLM.from_config(config)  # Random weights
```

## Model Modes

### Training vs Evaluation Mode

Models load in evaluation mode by default:

```python
model = AutoModel.from_pretrained("model-id")
print(model.training)  # False

# Switch to training mode
model.train()

# Switch back to evaluation mode
model.eval()
```

Evaluation mode disables dropout and uses batch norm statistics.

## Saving Models

### Save Locally

```python
model.save_pretrained("./my_model")
```

This creates:
- `config.json`: Model configuration
- `pytorch_model.bin` or `model.safetensors`: Model weights

### Save to Hugging Face Hub

```python
model.push_to_hub("username/model-name")

# With custom commit message
model.push_to_hub("username/model-name", commit_message="Update model")

# Private repository
model.push_to_hub("username/model-name", private=True)
```

## Model Inspection

### Parameter Count

```python
# Total parameters
total_params = model.num_parameters()

# Trainable parameters only
trainable_params = model.num_parameters(only_trainable=True)

print(f"Total: {total_params:,}")
print(f"Trainable: {trainable_params:,}")
```

### Memory Footprint

```python
memory_bytes = model.get_memory_footprint()
memory_mb = memory_bytes / 1024**2
print(f"Memory: {memory_mb:.2f} MB")
```

### Model Architecture

```python
print(model)  # Print full architecture

# Access specific components
print(model.config)
print(model.base_model)
```

## Forward Pass

Basic inference:

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("model-id")
model = AutoModelForSequenceClassification.from_pretrained("model-id")

inputs = tokenizer("Sample text", return_tensors="pt")
outputs = model(**inputs)

logits = outputs.logits
predictions = logits.argmax(dim=-1)
```

## Model Formats

### SafeTensors vs PyTorch

SafeTensors is faster and safer:

```python
# Save as safetensors (recommended)
model.save_pretrained("./model", safe_serialization=True)

# Load either format automatically
model = AutoModel.from_pretrained("./model")
```

### ONNX Export

Export for optimized inference:

```python
from transformers.onnx import export

# Export to ONNX
export(
    tokenizer=tokenizer,
    model=model,
    config=config,
    output=Path("model.onnx")
)
```

## Best Practices

1. **Use AutoModel classes**: Automatic architecture detection
2. **Specify dtype explicitly**: Control precision and memory
3. **Use device_map="auto"**: For large models
4. **Enable low_cpu_mem_usage**: When loading large models
5. **Use safetensors format**: Faster and safer serialization
6. **Check model.training**: Ensure correct mode for task
7. **Consider quantization**: For deployment on resource-constrained devices
8. **Cache models locally**: Set TRANSFORMERS_CACHE environment variable

## Common Issues

**CUDA out of memory:**
```python
# Use smaller precision
model = AutoModel.from_pretrained("model-id", torch_dtype=torch.float16)

# Or use quantization
model = AutoModel.from_pretrained("model-id", load_in_8bit=True)

# Or use CPU
model = AutoModel.from_pretrained("model-id", device_map="cpu")
```

**Slow loading:**
```python
# Enable low CPU memory mode
model = AutoModel.from_pretrained("model-id", low_cpu_mem_usage=True)
```

**Model not found:**
```python
# Verify model ID on hub.co
# Check authentication for private models
from huggingface_hub import login
login()
```
