# Tokenizers

## Overview

Tokenizers convert text into numerical representations (tokens) that models can process. They handle special tokens, padding, truncation, and attention masks.

## Loading Tokenizers

### AutoTokenizer

Automatically load the correct tokenizer for a model:

```python
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
```

Load from local path:
```python
tokenizer = AutoTokenizer.from_pretrained("./local/tokenizer/path")
```

## Basic Tokenization

### Encode Text

```python
# Simple encoding
text = "Hello, how are you?"
tokens = tokenizer.encode(text)
print(tokens)  # [101, 7592, 1010, 2129, 2024, 2017, 1029, 102]

# With text tokenization
tokens = tokenizer.tokenize(text)
print(tokens)  # ['hello', ',', 'how', 'are', 'you', '?']
```

### Decode Tokens

```python
token_ids = [101, 7592, 1010, 2129, 2024, 2017, 1029, 102]
text = tokenizer.decode(token_ids)
print(text)  # "hello, how are you?"

# Skip special tokens
text = tokenizer.decode(token_ids, skip_special_tokens=True)
print(text)  # "hello, how are you?"
```

## The `__call__` Method

Primary tokenization interface:

```python
# Single text
inputs = tokenizer("Hello, how are you?")

# Returns dictionary with input_ids, attention_mask
print(inputs)
# {
#   'input_ids': [101, 7592, 1010, 2129, 2024, 2017, 1029, 102],
#   'attention_mask': [1, 1, 1, 1, 1, 1, 1, 1]
# }
```

Multiple texts:
```python
texts = ["Hello", "How are you?"]
inputs = tokenizer(texts, padding=True, truncation=True)
```

## Key Parameters

### Return Tensors

**return_tensors**: Output format ("pt", "tf", "np")
```python
# PyTorch tensors
inputs = tokenizer("text", return_tensors="pt")

# TensorFlow tensors
inputs = tokenizer("text", return_tensors="tf")

# NumPy arrays
inputs = tokenizer("text", return_tensors="np")
```

### Padding

**padding**: Pad sequences to same length
```python
# Pad to longest sequence in batch
inputs = tokenizer(texts, padding=True)

# Pad to specific length
inputs = tokenizer(texts, padding="max_length", max_length=128)

# No padding
inputs = tokenizer(texts, padding=False)
```

**pad_to_multiple_of**: Pad to multiple of specified value
```python
inputs = tokenizer(texts, padding=True, pad_to_multiple_of=8)
```

### Truncation

**truncation**: Limit sequence length
```python
# Truncate to max_length
inputs = tokenizer(text, truncation=True, max_length=512)

# Truncate first sequence in pairs
inputs = tokenizer(text1, text2, truncation="only_first")

# Truncate second sequence
inputs = tokenizer(text1, text2, truncation="only_second")

# Truncate longest first (default for pairs)
inputs = tokenizer(text1, text2, truncation="longest_first", max_length=512)
```

### Max Length

**max_length**: Maximum sequence length
```python
inputs = tokenizer(text, max_length=512, truncation=True)
```

### Additional Outputs

**return_attention_mask**: Include attention mask (default True)
```python
inputs = tokenizer(text, return_attention_mask=True)
```

**return_token_type_ids**: Segment IDs for sentence pairs
```python
inputs = tokenizer(text1, text2, return_token_type_ids=True)
```

**return_offsets_mapping**: Character position mapping (Fast tokenizers only)
```python
inputs = tokenizer(text, return_offsets_mapping=True)
```

**return_length**: Include sequence lengths
```python
inputs = tokenizer(texts, padding=True, return_length=True)
```

## Special Tokens

### Predefined Special Tokens

Access special tokens:
```python
print(tokenizer.cls_token)      # [CLS] or <s>
print(tokenizer.sep_token)      # [SEP] or </s>
print(tokenizer.pad_token)      # [PAD]
print(tokenizer.unk_token)      # [UNK]
print(tokenizer.mask_token)     # [MASK]
print(tokenizer.eos_token)      # End of sequence
print(tokenizer.bos_token)      # Beginning of sequence

# Get IDs
print(tokenizer.cls_token_id)
print(tokenizer.sep_token_id)
```

### Add Special Tokens

Manual control:
```python
# Automatically add special tokens (default True)
inputs = tokenizer(text, add_special_tokens=True)

# Skip special tokens
inputs = tokenizer(text, add_special_tokens=False)
```

### Custom Special Tokens

```python
special_tokens_dict = {
    "additional_special_tokens": ["<CUSTOM>", "<SPECIAL>"]
}

num_added = tokenizer.add_special_tokens(special_tokens_dict)
print(f"Added {num_added} tokens")

# Resize model embeddings after adding tokens
model.resize_token_embeddings(len(tokenizer))
```

## Sentence Pairs

Tokenize text pairs:

```python
text1 = "What is the capital of France?"
text2 = "Paris is the capital of France."

# Automatically handles separation
inputs = tokenizer(text1, text2, padding=True, truncation=True)

# Results in: [CLS] text1 [SEP] text2 [SEP]
```

## Batch Encoding

Process multiple texts:

```python
texts = ["First text", "Second text", "Third text"]

# Basic batch encoding
batch = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")

# Access individual encodings
for i in range(len(texts)):
    input_ids = batch["input_ids"][i]
    attention_mask = batch["attention_mask"][i]
```

## Fast Tokenizers

Use Rust-based tokenizers for speed:

```python
from transformers import AutoTokenizer

# Automatically loads Fast version if available
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Check if Fast
print(tokenizer.is_fast)  # True

# Force Fast tokenizer
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased", use_fast=True)

# Force slow (Python) tokenizer
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased", use_fast=False)
```

### Fast Tokenizer Features

**Offset mapping** (character positions):
```python
inputs = tokenizer("Hello world", return_offsets_mapping=True)
print(inputs["offset_mapping"])
# [(0, 0), (0, 5), (6, 11), (0, 0)]  # [CLS], "Hello", "world", [SEP]
```

**Token to word mapping**:
```python
encoding = tokenizer("Hello world")
word_ids = encoding.word_ids()
print(word_ids)  # [None, 0, 1, None]  # [CLS]=None, "Hello"=0, "world"=1, [SEP]=None
```

## Saving Tokenizers

Save locally:
```python
tokenizer.save_pretrained("./my_tokenizer")
```

Push to Hub:
```python
tokenizer.push_to_hub("username/my-tokenizer")
```

## Advanced Usage

### Vocabulary

Access vocabulary:
```python
vocab = tokenizer.get_vocab()
vocab_size = len(vocab)

# Get token for ID
token = tokenizer.convert_ids_to_tokens(100)

# Get ID for token
token_id = tokenizer.convert_tokens_to_ids("hello")
```

### Encoding Details

Get detailed encoding information:

```python
encoding = tokenizer("Hello world", return_tensors="pt")

# Original methods still available
tokens = encoding.tokens()
word_ids = encoding.word_ids()
sequence_ids = encoding.sequence_ids()
```

### Custom Preprocessing

Subclass for custom behavior:

```python
class CustomTokenizer(AutoTokenizer):
    def __call__(self, text, **kwargs):
        # Custom preprocessing
        text = text.lower().strip()
        return super().__call__(text, **kwargs)
```

## Chat Templates

For conversational models:

```python
messages = [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "Hello!"},
    {"role": "assistant", "content": "Hi there!"},
    {"role": "user", "content": "How are you?"}
]

# Apply chat template
text = tokenizer.apply_chat_template(messages, tokenize=False)
print(text)

# Tokenize directly
inputs = tokenizer.apply_chat_template(messages, tokenize=True, return_tensors="pt")
```

## Common Patterns

### Pattern 1: Simple Text Classification

```python
texts = ["I love this!", "I hate this!"]
labels = [1, 0]

inputs = tokenizer(
    texts,
    padding=True,
    truncation=True,
    max_length=512,
    return_tensors="pt"
)

# Use with model
outputs = model(**inputs, labels=torch.tensor(labels))
```

### Pattern 2: Question Answering

```python
question = "What is the capital?"
context = "Paris is the capital of France."

inputs = tokenizer(
    question,
    context,
    padding=True,
    truncation=True,
    max_length=384,
    return_tensors="pt"
)
```

### Pattern 3: Text Generation

```python
prompt = "Once upon a time"

inputs = tokenizer(prompt, return_tensors="pt")

# Generate
outputs = model.generate(
    inputs["input_ids"],
    max_new_tokens=50,
    pad_token_id=tokenizer.eos_token_id
)

# Decode
text = tokenizer.decode(outputs[0], skip_special_tokens=True)
```

### Pattern 4: Dataset Tokenization

```python
def tokenize_function(examples):
    return tokenizer(
        examples["text"],
        padding="max_length",
        truncation=True,
        max_length=512
    )

# Apply to dataset
tokenized_dataset = dataset.map(tokenize_function, batched=True)
```

## Best Practices

1. **Always specify return_tensors**: For model input
2. **Use padding and truncation**: For batch processing
3. **Set max_length explicitly**: Prevent memory issues
4. **Use Fast tokenizers**: When available for speed
5. **Handle pad_token**: Set to eos_token if None for generation
6. **Add special tokens**: Leave enabled (default) unless specific reason
7. **Resize embeddings**: After adding custom tokens
8. **Decode with skip_special_tokens**: For cleaner output
9. **Use batched processing**: For efficiency with datasets
10. **Save tokenizer with model**: Ensure compatibility

## Common Issues

**Padding token not set:**
```python
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token
```

**Sequence too long:**
```python
# Enable truncation
inputs = tokenizer(text, truncation=True, max_length=512)
```

**Mismatched vocabulary:**
```python
# Always load tokenizer and model from same checkpoint
tokenizer = AutoTokenizer.from_pretrained("model-id")
model = AutoModel.from_pretrained("model-id")
```

**Attention mask issues:**
```python
# Ensure attention_mask is passed
outputs = model(
    input_ids=inputs["input_ids"],
    attention_mask=inputs["attention_mask"]
)
```
