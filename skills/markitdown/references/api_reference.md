# MarkItDown API Reference

## Core Classes

### MarkItDown

The main class for converting files to Markdown.

```python
from markitdown import MarkItDown

md = MarkItDown(
    llm_client=None,
    llm_model=None,
    llm_prompt=None,
    docintel_endpoint=None,
    enable_plugins=False
)
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `llm_client` | OpenAI client | `None` | OpenAI-compatible client for AI image descriptions |
| `llm_model` | str | `None` | Model name (e.g., "anthropic/claude-opus-4.5") for image descriptions |
| `llm_prompt` | str | `None` | Custom prompt for image description |
| `docintel_endpoint` | str | `None` | Azure Document Intelligence endpoint |
| `enable_plugins` | bool | `False` | Enable 3rd-party plugins |

#### Methods

##### convert()

Convert a file to Markdown.

```python
result = md.convert(
    source,
    file_extension=None
)
```

**Parameters**:
- `source` (str): Path to the file to convert
- `file_extension` (str, optional): Override file extension detection

**Returns**: `DocumentConverterResult` object

**Example**:
```python
result = md.convert("document.pdf")
print(result.text_content)
```

##### convert_stream()

Convert from a file-like binary stream.

```python
result = md.convert_stream(
    stream,
    file_extension
)
```

**Parameters**:
- `stream` (BinaryIO): Binary file-like object (e.g., file opened in `"rb"` mode)
- `file_extension` (str): File extension to determine conversion method (e.g., ".pdf")

**Returns**: `DocumentConverterResult` object

**Example**:
```python
with open("document.pdf", "rb") as f:
    result = md.convert_stream(f, file_extension=".pdf")
    print(result.text_content)
```

**Important**: The stream must be opened in binary mode (`"rb"`), not text mode.

## Result Object

### DocumentConverterResult

The result of a conversion operation.

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `text_content` | str | The converted Markdown text |
| `title` | str | Document title (if available) |

#### Example

```python
result = md.convert("paper.pdf")

# Access content
content = result.text_content

# Access title (if available)
title = result.title
```

## Custom Converters

You can create custom document converters by implementing the `DocumentConverter` interface.

### DocumentConverter Interface

```python
from markitdown import DocumentConverter

class CustomConverter(DocumentConverter):
    def convert(self, stream, file_extension):
        """
        Convert a document from a binary stream.
        
        Parameters:
            stream (BinaryIO): Binary file-like object
            file_extension (str): File extension (e.g., ".custom")
            
        Returns:
            DocumentConverterResult: Conversion result
        """
        # Your conversion logic here
        pass
```

### Registering Custom Converters

```python
from markitdown import MarkItDown, DocumentConverter, DocumentConverterResult

class MyCustomConverter(DocumentConverter):
    def convert(self, stream, file_extension):
        content = stream.read().decode('utf-8')
        markdown_text = f"# Custom Format\n\n{content}"
        return DocumentConverterResult(
            text_content=markdown_text,
            title="Custom Document"
        )

# Create MarkItDown instance
md = MarkItDown()

# Register custom converter for .custom files
md.register_converter(".custom", MyCustomConverter())

# Use it
result = md.convert("myfile.custom")
```

## Plugin System

### Finding Plugins

Search GitHub for `#markitdown-plugin` tag.

### Using Plugins

```python
from markitdown import MarkItDown

# Enable plugins
md = MarkItDown(enable_plugins=True)
result = md.convert("document.pdf")
```

### Creating Plugins

Plugins are Python packages that register converters with MarkItDown.

**Plugin Structure**:
```
my-markitdown-plugin/
├── setup.py
├── my_plugin/
│   ├── __init__.py
│   └── converter.py
└── README.md
```

**setup.py**:
```python
from setuptools import setup

setup(
    name="markitdown-my-plugin",
    version="0.1.0",
    packages=["my_plugin"],
    entry_points={
        "markitdown.plugins": [
            "my_plugin = my_plugin.converter:MyConverter",
        ],
    },
)
```

**converter.py**:
```python
from markitdown import DocumentConverter, DocumentConverterResult

class MyConverter(DocumentConverter):
    def convert(self, stream, file_extension):
        # Your conversion logic
        content = stream.read()
        markdown = self.process(content)
        return DocumentConverterResult(
            text_content=markdown,
            title="My Document"
        )
    
    def process(self, content):
        # Process content
        return "# Converted Content\n\n..."
```

## AI-Enhanced Conversions

### Using OpenRouter for Image Descriptions

```python
from markitdown import MarkItDown
from openai import OpenAI

# Initialize OpenRouter client (OpenAI-compatible API)
client = OpenAI(
    api_key="your-openrouter-api-key",
    base_url="https://openrouter.ai/api/v1"
)

# Create MarkItDown with AI support
md = MarkItDown(
    llm_client=client,
    llm_model="anthropic/claude-opus-4.5",  # recommended for scientific vision
    llm_prompt="Describe this image in detail for scientific documentation"
)

# Convert files with images
result = md.convert("presentation.pptx")
```

### Available Models via OpenRouter

Popular models with vision support:
- `anthropic/claude-opus-4.5` - **Recommended for scientific vision**
- `google/gemini-3-pro-preview` - Gemini Pro Vision

See https://openrouter.ai/models for the complete list.

### Custom Prompts

```python
# For scientific diagrams
scientific_prompt = """
Analyze this scientific diagram or chart. Describe:
1. The type of visualization (graph, chart, diagram, etc.)
2. Key data points or trends
3. Labels and axes
4. Scientific significance
Be precise and technical.
"""

md = MarkItDown(
    llm_client=client,
    llm_model="anthropic/claude-opus-4.5",
    llm_prompt=scientific_prompt
)
```

## Azure Document Intelligence

### Setup

1. Create Azure Document Intelligence resource
2. Get endpoint URL
3. Set authentication

### Usage

```python
from markitdown import MarkItDown

md = MarkItDown(
    docintel_endpoint="https://YOUR-RESOURCE.cognitiveservices.azure.com/"
)

result = md.convert("complex_document.pdf")
```

### Authentication

Set environment variables:
```bash
export AZURE_DOCUMENT_INTELLIGENCE_KEY="your-key"
```

Or pass credentials programmatically.

## Error Handling

```python
from markitdown import MarkItDown

md = MarkItDown()

try:
    result = md.convert("document.pdf")
    print(result.text_content)
except FileNotFoundError:
    print("File not found")
except ValueError as e:
    print(f"Invalid file format: {e}")
except Exception as e:
    print(f"Conversion error: {e}")
```

## Performance Tips

### 1. Reuse MarkItDown Instance

```python
# Good: Create once, use many times
md = MarkItDown()

for file in files:
    result = md.convert(file)
    process(result)
```

### 2. Use Streaming for Large Files

```python
# For large files
with open("large_file.pdf", "rb") as f:
    result = md.convert_stream(f, file_extension=".pdf")
```

### 3. Batch Processing

```python
from concurrent.futures import ThreadPoolExecutor

md = MarkItDown()

def convert_file(filepath):
    return md.convert(filepath)

with ThreadPoolExecutor(max_workers=4) as executor:
    results = executor.map(convert_file, file_list)
```

## Breaking Changes (v0.0.1 to v0.1.0)

1. **Dependencies**: Now organized into optional feature groups
   ```bash
   # Old
   pip install markitdown
   
   # New
   pip install 'markitdown[all]'
   ```

2. **convert_stream()**: Now requires binary file-like object
   ```python
   # Old (also accepted text)
   with open("file.pdf", "r") as f:  # text mode
       result = md.convert_stream(f)
   
   # New (binary only)
   with open("file.pdf", "rb") as f:  # binary mode
       result = md.convert_stream(f, file_extension=".pdf")
   ```

3. **DocumentConverter Interface**: Changed to read from streams instead of file paths
   - No temporary files created
   - More memory efficient
   - Plugins need updating

## Version Compatibility

- **Python**: 3.10 or higher required
- **Dependencies**: Check `setup.py` for version constraints
- **OpenAI**: Compatible with OpenAI Python SDK v1.0+

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key for image descriptions | `sk-or-v1-...` |
| `AZURE_DOCUMENT_INTELLIGENCE_KEY` | Azure DI authentication | `key123...` |
| `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` | Azure DI endpoint | `https://...` |

