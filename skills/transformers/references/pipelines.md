# Pipeline API Reference

## Overview

Pipelines provide the simplest way to use pre-trained models for inference. They abstract away tokenization, model loading, and post-processing, offering a unified interface for dozens of tasks.

## Basic Usage

Create a pipeline by specifying a task:

```python
from transformers import pipeline

# Auto-select default model for task
pipe = pipeline("text-classification")
result = pipe("This is great!")
```

Or specify a model:

```python
pipe = pipeline("text-classification", model="distilbert-base-uncased-finetuned-sst-2-english")
```

## Supported Tasks

### Natural Language Processing

**text-generation**: Generate text continuations
```python
generator = pipeline("text-generation", model="gpt2")
output = generator("Once upon a time", max_length=50, num_return_sequences=2)
```

**text-classification**: Classify text into categories
```python
classifier = pipeline("text-classification")
result = classifier("I love this product!")  # Returns label and score
```

**token-classification**: Label individual tokens (NER, POS tagging)
```python
ner = pipeline("token-classification", model="dslim/bert-base-NER")
entities = ner("Hugging Face is based in New York City")
```

**question-answering**: Extract answers from context
```python
qa = pipeline("question-answering")
result = qa(question="What is the capital?", context="Paris is the capital of France.")
```

**fill-mask**: Predict masked tokens
```python
unmasker = pipeline("fill-mask", model="bert-base-uncased")
result = unmasker("Paris is the [MASK] of France")
```

**summarization**: Summarize long texts
```python
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
summary = summarizer("Long article text...", max_length=130, min_length=30)
```

**translation**: Translate between languages
```python
translator = pipeline("translation_en_to_fr", model="Helsinki-NLP/opus-mt-en-fr")
result = translator("Hello, how are you?")
```

**zero-shot-classification**: Classify without training data
```python
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
result = classifier(
    "This is a course about Python programming",
    candidate_labels=["education", "politics", "business"]
)
```

**sentiment-analysis**: Alias for text-classification focused on sentiment
```python
sentiment = pipeline("sentiment-analysis")
result = sentiment("This product exceeded my expectations!")
```

### Computer Vision

**image-classification**: Classify images
```python
classifier = pipeline("image-classification", model="google/vit-base-patch16-224")
result = classifier("path/to/image.jpg")
# Or use PIL Image or URL
from PIL import Image
result = classifier(Image.open("image.jpg"))
```

**object-detection**: Detect objects in images
```python
detector = pipeline("object-detection", model="facebook/detr-resnet-50")
results = detector("image.jpg")  # Returns bounding boxes and labels
```

**image-segmentation**: Segment images
```python
segmenter = pipeline("image-segmentation", model="facebook/detr-resnet-50-panoptic")
segments = segmenter("image.jpg")
```

**depth-estimation**: Estimate depth from images
```python
depth = pipeline("depth-estimation", model="Intel/dpt-large")
result = depth("image.jpg")
```

**zero-shot-image-classification**: Classify images without training
```python
classifier = pipeline("zero-shot-image-classification", model="openai/clip-vit-base-patch32")
result = classifier("image.jpg", candidate_labels=["cat", "dog", "bird"])
```

### Audio

**automatic-speech-recognition**: Transcribe speech
```python
asr = pipeline("automatic-speech-recognition", model="openai/whisper-base")
text = asr("audio.mp3")
```

**audio-classification**: Classify audio
```python
classifier = pipeline("audio-classification", model="MIT/ast-finetuned-audioset-10-10-0.4593")
result = classifier("audio.wav")
```

**text-to-speech**: Generate speech from text (with specific models)
```python
tts = pipeline("text-to-speech", model="microsoft/speecht5_tts")
audio = tts("Hello, this is a test")
```

### Multimodal

**visual-question-answering**: Answer questions about images
```python
vqa = pipeline("visual-question-answering", model="dandelin/vilt-b32-finetuned-vqa")
result = vqa(image="image.jpg", question="What color is the car?")
```

**document-question-answering**: Answer questions about documents
```python
doc_qa = pipeline("document-question-answering", model="impira/layoutlm-document-qa")
result = doc_qa(image="document.png", question="What is the invoice number?")
```

**image-to-text**: Generate captions for images
```python
captioner = pipeline("image-to-text", model="Salesforce/blip-image-captioning-base")
caption = captioner("image.jpg")
```

## Pipeline Parameters

### Common Parameters

**model**: Model identifier or path
```python
pipe = pipeline("task", model="model-id")
```

**device**: GPU device index (-1 for CPU, 0+ for GPU)
```python
pipe = pipeline("task", device=0)  # Use first GPU
```

**device_map**: Automatic device allocation for large models
```python
pipe = pipeline("task", model="large-model", device_map="auto")
```

**dtype**: Model precision (reduces memory)
```python
import torch
pipe = pipeline("task", torch_dtype=torch.float16)
```

**batch_size**: Process multiple inputs at once
```python
pipe = pipeline("task", batch_size=8)
results = pipe(["text1", "text2", "text3"])
```

**framework**: Choose PyTorch or TensorFlow
```python
pipe = pipeline("task", framework="pt")  # or "tf"
```

## Batch Processing

Process multiple inputs efficiently:

```python
classifier = pipeline("text-classification")
texts = ["Great product!", "Terrible experience", "Just okay"]
results = classifier(texts)
```

For large datasets, use generators or KeyDataset:

```python
from transformers.pipelines.pt_utils import KeyDataset
import datasets

dataset = datasets.load_dataset("dataset-name", split="test")
pipe = pipeline("task", device=0)

for output in pipe(KeyDataset(dataset, "text")):
    print(output)
```

## Performance Optimization

### GPU Acceleration

Always specify device for GPU usage:
```python
pipe = pipeline("task", device=0)
```

### Mixed Precision

Use float16 for 2x speedup on supported GPUs:
```python
import torch
pipe = pipeline("task", torch_dtype=torch.float16, device=0)
```

### Batching Guidelines

- **CPU**: Usually skip batching
- **GPU with variable lengths**: May reduce efficiency
- **GPU with similar lengths**: Significant speedup
- **Real-time applications**: Skip batching (increases latency)

```python
# Good for throughput
pipe = pipeline("task", batch_size=32, device=0)
results = pipe(list_of_texts)
```

### Streaming Output

For text generation, stream tokens as they're generated:

```python
from transformers import TextStreamer

generator = pipeline("text-generation", model="gpt2", streamer=TextStreamer())
generator("The future of AI", max_length=100)
```

## Custom Pipeline Configuration

Specify tokenizer and model separately:

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification

tokenizer = AutoTokenizer.from_pretrained("model-id")
model = AutoModelForSequenceClassification.from_pretrained("model-id")
pipe = pipeline("text-classification", model=model, tokenizer=tokenizer)
```

Use custom pipeline classes:

```python
from transformers import TextClassificationPipeline

class CustomPipeline(TextClassificationPipeline):
    def postprocess(self, model_outputs, **kwargs):
        # Custom post-processing
        return super().postprocess(model_outputs, **kwargs)

pipe = pipeline("text-classification", model="model-id", pipeline_class=CustomPipeline)
```

## Input Formats

Pipelines accept various input types:

**Text tasks**: Strings or lists of strings
```python
pipe("single text")
pipe(["text1", "text2"])
```

**Image tasks**: URLs, file paths, PIL Images, or numpy arrays
```python
pipe("https://example.com/image.jpg")
pipe("local/path/image.png")
pipe(PIL.Image.open("image.jpg"))
pipe(numpy_array)
```

**Audio tasks**: File paths, numpy arrays, or raw waveforms
```python
pipe("audio.mp3")
pipe(audio_array)
```

## Error Handling

Handle common issues:

```python
try:
    result = pipe(input_data)
except Exception as e:
    if "CUDA out of memory" in str(e):
        # Reduce batch size or use CPU
        pipe = pipeline("task", device=-1)
    elif "does not appear to have a file named" in str(e):
        # Model not found
        print("Check model identifier")
    else:
        raise
```

## Best Practices

1. **Use pipelines for prototyping**: Fast iteration without boilerplate
2. **Specify models explicitly**: Default models may change
3. **Enable GPU when available**: Significant speedup
4. **Use batching for throughput**: When processing many inputs
5. **Consider memory usage**: Use float16 or smaller models for large batches
6. **Cache models locally**: Avoid repeated downloads
