# Text Generation

## Overview

Generate text with language models using the `generate()` method. Control output quality and style through generation strategies and parameters.

## Basic Generation

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("gpt2")
tokenizer = AutoTokenizer.from_pretrained("gpt2")

# Tokenize input
inputs = tokenizer("Once upon a time", return_tensors="pt")

# Generate
outputs = model.generate(**inputs, max_new_tokens=50)

# Decode
text = tokenizer.decode(outputs[0], skip_special_tokens=True)
print(text)
```

## Generation Strategies

### Greedy Decoding

Select highest probability token at each step (deterministic):

```python
outputs = model.generate(
    **inputs,
    max_new_tokens=50,
    do_sample=False  # Greedy decoding (default)
)
```

**Use for**: Factual text, translations, where determinism is needed.

### Sampling

Randomly sample from probability distribution:

```python
outputs = model.generate(
    **inputs,
    max_new_tokens=50,
    do_sample=True,
    temperature=0.7,
    top_k=50,
    top_p=0.95
)
```

**Use for**: Creative writing, diverse outputs, open-ended generation.

### Beam Search

Explore multiple hypotheses in parallel:

```python
outputs = model.generate(
    **inputs,
    max_new_tokens=50,
    num_beams=5,
    early_stopping=True
)
```

**Use for**: Translations, summarization, where quality is critical.

### Contrastive Search

Balance quality and diversity:

```python
outputs = model.generate(
    **inputs,
    max_new_tokens=50,
    penalty_alpha=0.6,
    top_k=4
)
```

**Use for**: Long-form generation, reducing repetition.

## Key Parameters

### Length Control

**max_new_tokens**: Maximum tokens to generate
```python
max_new_tokens=100  # Generate up to 100 new tokens
```

**max_length**: Maximum total length (input + output)
```python
max_length=512  # Total sequence length
```

**min_new_tokens**: Minimum tokens to generate
```python
min_new_tokens=50  # Force at least 50 tokens
```

**min_length**: Minimum total length
```python
min_length=100
```

### Temperature

Controls randomness (only with sampling):

```python
temperature=1.0   # Default, balanced
temperature=0.7   # More focused, less random
temperature=1.5   # More creative, more random
```

Lower temperature → more deterministic
Higher temperature → more random

### Top-K Sampling

Consider only top K most likely tokens:

```python
do_sample=True
top_k=50  # Sample from top 50 tokens
```

**Common values**: 40-100 for balanced output, 10-20 for focused output.

### Top-P (Nucleus) Sampling

Consider tokens with cumulative probability ≥ P:

```python
do_sample=True
top_p=0.95  # Sample from smallest set with 95% cumulative probability
```

**Common values**: 0.9-0.95 for balanced, 0.7-0.85 for focused.

### Repetition Penalty

Discourage repetition:

```python
repetition_penalty=1.2  # Penalize repeated tokens
```

**Values**: 1.0 = no penalty, 1.2-1.5 = moderate, 2.0+ = strong penalty.

### Beam Search Parameters

**num_beams**: Number of beams
```python
num_beams=5  # Keep 5 hypotheses
```

**early_stopping**: Stop when num_beams sentences are finished
```python
early_stopping=True
```

**no_repeat_ngram_size**: Prevent n-gram repetition
```python
no_repeat_ngram_size=3  # Don't repeat any 3-gram
```

### Output Control

**num_return_sequences**: Generate multiple outputs
```python
outputs = model.generate(
    **inputs,
    max_new_tokens=50,
    num_beams=5,
    num_return_sequences=3  # Return 3 different sequences
)
```

**pad_token_id**: Specify padding token
```python
pad_token_id=tokenizer.eos_token_id
```

**eos_token_id**: Stop generation at specific token
```python
eos_token_id=tokenizer.eos_token_id
```

## Advanced Features

### Batch Generation

Generate for multiple prompts:

```python
prompts = ["Hello, my name is", "Once upon a time"]
inputs = tokenizer(prompts, return_tensors="pt", padding=True)

outputs = model.generate(**inputs, max_new_tokens=50)

for i, output in enumerate(outputs):
    text = tokenizer.decode(output, skip_special_tokens=True)
    print(f"Prompt {i}: {text}\n")
```

### Streaming Generation

Stream tokens as generated:

```python
from transformers import TextIteratorStreamer
from threading import Thread

streamer = TextIteratorStreamer(tokenizer, skip_special_tokens=True)

generation_kwargs = dict(
    inputs,
    streamer=streamer,
    max_new_tokens=100
)

thread = Thread(target=model.generate, kwargs=generation_kwargs)
thread.start()

for text in streamer:
    print(text, end="", flush=True)

thread.join()
```

### Constrained Generation

Force specific token sequences:

```python
# Force generation to start with specific tokens
force_words = ["Paris", "France"]
force_words_ids = [tokenizer.encode(word, add_special_tokens=False) for word in force_words]

outputs = model.generate(
    **inputs,
    force_words_ids=force_words_ids,
    num_beams=5
)
```

### Guidance and Control

**Prevent bad words:**
```python
bad_words = ["offensive", "inappropriate"]
bad_words_ids = [tokenizer.encode(word, add_special_tokens=False) for word in bad_words]

outputs = model.generate(
    **inputs,
    bad_words_ids=bad_words_ids
)
```

### Generation Config

Save and reuse generation parameters:

```python
from transformers import GenerationConfig

# Create config
generation_config = GenerationConfig(
    max_new_tokens=100,
    temperature=0.7,
    top_k=50,
    top_p=0.95,
    do_sample=True
)

# Save
generation_config.save_pretrained("./my_generation_config")

# Load and use
generation_config = GenerationConfig.from_pretrained("./my_generation_config")
outputs = model.generate(**inputs, generation_config=generation_config)
```

## Model-Specific Generation

### Chat Models

Use chat templates:

```python
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is the capital of France?"}
]

input_text = tokenizer.apply_chat_template(messages, tokenize=False)
inputs = tokenizer(input_text, return_tensors="pt")

outputs = model.generate(**inputs, max_new_tokens=100)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
```

### Encoder-Decoder Models

For T5, BART, etc.:

```python
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

model = AutoModelForSeq2SeqLM.from_pretrained("t5-small")
tokenizer = AutoTokenizer.from_pretrained("t5-small")

# T5 uses task prefixes
input_text = "translate English to French: Hello, how are you?"
inputs = tokenizer(input_text, return_tensors="pt")

outputs = model.generate(**inputs, max_new_tokens=50)
translation = tokenizer.decode(outputs[0], skip_special_tokens=True)
```

## Optimization

### Caching

Enable KV cache for faster generation:

```python
outputs = model.generate(
    **inputs,
    max_new_tokens=100,
    use_cache=True  # Default, faster generation
)
```

### Static Cache

For fixed sequence lengths:

```python
from transformers import StaticCache

cache = StaticCache(model.config, max_batch_size=1, max_cache_len=1024, device="cuda")

outputs = model.generate(
    **inputs,
    max_new_tokens=100,
    past_key_values=cache
)
```

### Attention Implementation

Use Flash Attention for speed:

```python
model = AutoModelForCausalLM.from_pretrained(
    "model-id",
    attn_implementation="flash_attention_2"
)
```

## Generation Recipes

### Creative Writing

```python
outputs = model.generate(
    **inputs,
    max_new_tokens=200,
    do_sample=True,
    temperature=0.8,
    top_k=50,
    top_p=0.95,
    repetition_penalty=1.2
)
```

### Factual Generation

```python
outputs = model.generate(
    **inputs,
    max_new_tokens=100,
    do_sample=False,  # Greedy
    repetition_penalty=1.1
)
```

### Diverse Outputs

```python
outputs = model.generate(
    **inputs,
    max_new_tokens=100,
    num_beams=5,
    num_return_sequences=5,
    temperature=1.5,
    do_sample=True
)
```

### Long-Form Generation

```python
outputs = model.generate(
    **inputs,
    max_new_tokens=1000,
    penalty_alpha=0.6,  # Contrastive search
    top_k=4,
    repetition_penalty=1.2
)
```

### Translation/Summarization

```python
outputs = model.generate(
    **inputs,
    max_new_tokens=100,
    num_beams=5,
    early_stopping=True,
    no_repeat_ngram_size=3
)
```

## Common Issues

**Repetitive output:**
- Increase repetition_penalty (1.2-1.5)
- Use no_repeat_ngram_size (2-3)
- Try contrastive search
- Lower temperature

**Poor quality:**
- Use beam search (num_beams=5)
- Lower temperature
- Adjust top_k/top_p

**Too deterministic:**
- Enable sampling (do_sample=True)
- Increase temperature (0.7-1.0)
- Adjust top_k/top_p

**Slow generation:**
- Reduce batch size
- Enable use_cache=True
- Use Flash Attention
- Reduce max_new_tokens

## Best Practices

1. **Start with defaults**: Then tune based on output
2. **Use appropriate strategy**: Greedy for factual, sampling for creative
3. **Set max_new_tokens**: Avoid unnecessarily long generation
4. **Enable caching**: For faster sequential generation
5. **Tune temperature**: Most impactful parameter for sampling
6. **Use beam search carefully**: Slower but higher quality
7. **Test different seeds**: For reproducibility with sampling
8. **Monitor memory**: Large beams use significant memory
