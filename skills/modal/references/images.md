# Modal Container Images

## Table of Contents

- [Overview](#overview)
- [Base Images](#base-images)
- [Installing Packages](#installing-packages)
- [System Packages](#system-packages)
- [Shell Commands](#shell-commands)
- [Running Python During Build](#running-python-during-build)
- [Adding Local Files](#adding-local-files)
- [Environment Variables](#environment-variables)
- [Dockerfiles](#dockerfiles)
- [Alternative Package Managers](#alternative-package-managers)
- [Image Caching](#image-caching)
- [Handling Remote-Only Imports](#handling-remote-only-imports)

## Overview

Every Modal function runs inside a container built from an `Image`. By default, Modal uses a Debian Linux image with the same Python minor version as your local interpreter.

Images are built lazily — Modal only builds/pulls the image when a function using it is first invoked. Layers are cached for fast rebuilds.

## Base Images

```python
# Default: Debian slim with your local Python version
image = modal.Image.debian_slim()

# Specific Python version
image = modal.Image.debian_slim(python_version="3.11")

# From Docker Hub
image = modal.Image.from_registry("nvidia/cuda:12.4.0-devel-ubuntu22.04")

# From a Dockerfile
image = modal.Image.from_dockerfile("./Dockerfile")
```

## Installing Packages

### uv (Recommended)

`uv_pip_install` uses the uv package manager for fast, reliable installs:

```python
image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install(
        "torch==2.8.0",
        "transformers>=4.40",
        "accelerate",
        "scipy",
    )
)
```

Pin versions for reproducibility. uv resolves dependencies faster than pip.

### pip (Fallback)

```python
image = modal.Image.debian_slim().pip_install(
    "numpy==1.26.0",
    "pandas==2.1.0",
)
```

### From requirements.txt

```python
image = modal.Image.debian_slim().pip_install_from_requirements("requirements.txt")
```

### Private Packages

```python
image = (
    modal.Image.debian_slim()
    .pip_install_private_repos(
        "github.com/org/private-repo",
        git_user="username",
        secrets=[modal.Secret.from_name("github-token")],
    )
)
```

## System Packages

Install Linux packages via apt:

```python
image = (
    modal.Image.debian_slim()
    .apt_install("ffmpeg", "libsndfile1", "git", "curl")
    .uv_pip_install("librosa", "soundfile")
)
```

## Shell Commands

Run arbitrary commands during image build:

```python
image = (
    modal.Image.debian_slim()
    .run_commands(
        "wget https://example.com/data.tar.gz",
        "tar -xzf data.tar.gz -C /opt/data",
        "rm data.tar.gz",
    )
)
```

### With GPU

Some build steps require GPU access (e.g., compiling CUDA kernels):

```python
image = (
    modal.Image.debian_slim()
    .uv_pip_install("torch")
    .run_commands("python -c 'import torch; torch.cuda.is_available()'", gpu="A100")
)
```

## Running Python During Build

Execute Python functions as build steps — useful for downloading model weights:

```python
def download_model():
    from huggingface_hub import snapshot_download
    snapshot_download("meta-llama/Llama-3-8B", local_dir="/models/llama3")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .uv_pip_install("huggingface_hub", "torch", "transformers")
    .run_function(download_model, secrets=[modal.Secret.from_name("huggingface")])
)
```

The resulting filesystem (including downloaded files) is snapshotted into the image.

## Adding Local Files

### Local Directories

```python
image = modal.Image.debian_slim().add_local_dir(
    local_path="./config",
    remote_path="/root/config",
)
```

By default, files are added at container startup (not baked into the image layer). Use `copy=True` to bake them in.

### Local Python Modules

```python
image = modal.Image.debian_slim().add_local_python_source("my_module")
```

This uses Python's import system to find and include the module.

### Individual Files

```python
image = modal.Image.debian_slim().add_local_file(
    local_path="./model_config.json",
    remote_path="/root/config.json",
)
```

## Environment Variables

```python
image = (
    modal.Image.debian_slim()
    .env({
        "TRANSFORMERS_CACHE": "/cache",
        "TOKENIZERS_PARALLELISM": "false",
        "HF_HOME": "/cache/huggingface",
    })
)
```

Names and values must be strings.

## Dockerfiles

Build from existing Dockerfiles:

```python
image = modal.Image.from_dockerfile("./Dockerfile")

# With build context
image = modal.Image.from_dockerfile("./Dockerfile", context_mount=modal.Mount.from_local_dir("."))
```

## Alternative Package Managers

### Micromamba / Conda

For packages requiring coordinated system and Python package installs:

```python
image = (
    modal.Image.micromamba(python_version="3.11")
    .micromamba_install("cudatoolkit=11.8", "cudnn=8.6", channels=["conda-forge"])
    .uv_pip_install("torch")
)
```

## Image Caching

Modal caches images per layer (per method call). Breaking the cache on one layer cascades to all subsequent layers.

### Optimization Tips

1. **Order layers by change frequency**: Put stable dependencies first, frequently changing code last
2. **Pin versions**: Unpinned versions may resolve differently and break cache
3. **Separate large installs**: Put heavy packages (torch, tensorflow) in early layers

### Force Rebuild

```python
# Single layer
image = modal.Image.debian_slim().apt_install("git", force_build=True)
```

```bash
# All images in a run
MODAL_FORCE_BUILD=1 modal run script.py

# Rebuild without updating cache
MODAL_IGNORE_CACHE=1 modal run script.py
```

## Handling Remote-Only Imports

When packages are only available in the container (not locally), use conditional imports:

```python
@app.function(image=image)
def process():
    import torch  # Only available in the container
    return torch.cuda.device_count()
```

For module-level imports shared across functions, use the `Image.imports()` context manager:

```python
with image.imports():
    import torch
    import transformers
```

This prevents `ImportError` locally while making the imports available in the container.
