# Modal API Reference

## Core Classes

### modal.App

The main unit of deployment. Groups related functions.

```python
app = modal.App("my-app")
```

| Method | Description |
|--------|-------------|
| `app.function(**kwargs)` | Decorator to register a function |
| `app.cls(**kwargs)` | Decorator to register a class |
| `app.local_entrypoint()` | Decorator for local entry point |

### modal.Function

A serverless function backed by an autoscaling container pool.

| Method | Description |
|--------|-------------|
| `.remote(*args)` | Execute in the cloud (sync) |
| `.local(*args)` | Execute locally |
| `.spawn(*args)` | Execute async, returns `FunctionCall` |
| `.map(inputs)` | Parallel execution over inputs |
| `.starmap(inputs)` | Parallel execution with multiple args |
| `.from_name(app, fn)` | Reference a deployed function |
| `.update_autoscaler(**kwargs)` | Dynamic scaling update |

### modal.Cls

A serverless class with lifecycle hooks.

```python
@app.cls(gpu="L40S")
class MyClass:
    @modal.enter()
    def setup(self): ...

    @modal.method()
    def run(self, data): ...

    @modal.exit()
    def cleanup(self): ...
```

| Decorator | Description |
|-----------|-------------|
| `@modal.enter()` | Container startup hook |
| `@modal.exit()` | Container shutdown hook |
| `@modal.method()` | Expose as callable method |
| `@modal.parameter()` | Class-level parameter |

## Image

### modal.Image

Defines the container environment.

| Method | Description |
|--------|-------------|
| `.debian_slim(python_version=)` | Debian base image |
| `.from_registry(tag)` | Docker Hub image |
| `.from_dockerfile(path)` | Build from Dockerfile |
| `.micromamba(python_version=)` | Conda/mamba base |
| `.uv_pip_install(*pkgs)` | Install with uv (recommended) |
| `.pip_install(*pkgs)` | Install with pip |
| `.pip_install_from_requirements(path)` | Install from file |
| `.apt_install(*pkgs)` | Install system packages |
| `.run_commands(*cmds)` | Run shell commands |
| `.run_function(fn)` | Run Python during build |
| `.add_local_dir(local, remote)` | Add directory |
| `.add_local_file(local, remote)` | Add single file |
| `.add_local_python_source(module)` | Add Python module |
| `.env(dict)` | Set environment variables |
| `.imports()` | Context manager for remote imports |

## Storage

### modal.Volume

Distributed persistent file storage.

```python
vol = modal.Volume.from_name("name", create_if_missing=True)
```

| Method | Description |
|--------|-------------|
| `.from_name(name)` | Reference or create a volume |
| `.commit()` | Force immediate commit |
| `.reload()` | Refresh to see other containers' writes |

Mount: `@app.function(volumes={"/path": vol})`

### modal.NetworkFileSystem

Legacy shared storage (superseded by Volume).

## Secrets

### modal.Secret

Secure credential injection.

| Method | Description |
|--------|-------------|
| `.from_name(name)` | Reference a named secret |
| `.from_dict(dict)` | Create inline (dev only) |
| `.from_dotenv()` | Load from .env file |

Usage: `@app.function(secrets=[modal.Secret.from_name("x")])`

Access in function: `os.environ["KEY"]`

## Scheduling

### modal.Cron

```python
schedule = modal.Cron("0 9 * * *")  # Cron syntax
```

### modal.Period

```python
schedule = modal.Period(hours=6)  # Fixed interval
```

Usage: `@app.function(schedule=modal.Cron("..."))`

## Web

### Decorators

| Decorator | Description |
|-----------|-------------|
| `@modal.fastapi_endpoint()` | Simple FastAPI endpoint |
| `@modal.asgi_app()` | Full ASGI app (FastAPI, Starlette) |
| `@modal.wsgi_app()` | Full WSGI app (Flask, Django) |
| `@modal.web_server(port=)` | Custom web server |

### Function Modifiers

| Decorator | Description |
|-----------|-------------|
| `@modal.concurrent(max_inputs=)` | Handle multiple inputs per container |
| `@modal.batched(max_batch_size=, wait_ms=)` | Dynamic input batching |

## GPU Strings

| String | GPU |
|--------|-----|
| `"T4"` | NVIDIA T4 16GB |
| `"L4"` | NVIDIA L4 24GB |
| `"A10"` | NVIDIA A10 24GB |
| `"L40S"` | NVIDIA L40S 48GB |
| `"A100-40GB"` | NVIDIA A100 40GB |
| `"A100-80GB"` | NVIDIA A100 80GB |
| `"H100"` | NVIDIA H100 80GB |
| `"H100!"` | H100 (no auto-upgrade) |
| `"H200"` | NVIDIA H200 141GB |
| `"B200"` | NVIDIA B200 192GB |
| `"B200+"` | B200 or B300, B200 price |
| `"H100:4"` | 4x H100 |

## CLI Commands

| Command | Description |
|---------|-------------|
| `modal setup` | Authenticate |
| `modal run <file>` | Run local entrypoint |
| `modal serve <file>` | Dev server with hot reload |
| `modal deploy <file>` | Production deployment |
| `modal app list` | List deployed apps |
| `modal app stop <name>` | Stop an app |
| `modal volume create <name>` | Create volume |
| `modal volume ls <name>` | List volume files |
| `modal volume put <name> <file>` | Upload to volume |
| `modal volume get <name> <file>` | Download from volume |
| `modal secret create <name> K=V` | Create secret |
| `modal secret list` | List secrets |
| `modal secret delete <name>` | Delete secret |
| `modal token set` | Set auth token |
