# Modal Secrets

## Overview

Modal Secrets securely deliver credentials and sensitive data to functions as environment variables. Secrets are stored encrypted and only available to your workspace.

## Creating Secrets

### Via CLI

```bash
# Create with key-value pairs
modal secret create my-api-keys API_KEY=sk-xxx DB_PASSWORD=hunter2

# Create from existing environment variables
modal secret create my-env-keys API_KEY=$API_KEY

# List all secrets
modal secret list

# Delete a secret
modal secret delete my-api-keys
```

### Via Dashboard

Navigate to https://modal.com/secrets to create and manage secrets. Templates are available for common services (Postgres, MongoDB, Hugging Face, Weights & Biases, etc.).

### Programmatic (Inline)

```python
# From a dictionary (useful for development)
secret = modal.Secret.from_dict({"API_KEY": "sk-xxx"})

# From a .env file
secret = modal.Secret.from_dotenv()

# From a named secret (created via CLI or dashboard)
secret = modal.Secret.from_name("my-api-keys")
```

## Using Secrets in Functions

### Basic Usage

```python
@app.function(secrets=[modal.Secret.from_name("my-api-keys")])
def call_api():
    import os
    api_key = os.environ["API_KEY"]
    # Use the key
    response = requests.get(url, headers={"Authorization": f"Bearer {api_key}"})
    return response.json()
```

### Multiple Secrets

```python
@app.function(secrets=[
    modal.Secret.from_name("openai-keys"),
    modal.Secret.from_name("database-creds"),
])
def process():
    import os
    openai_key = os.environ["OPENAI_API_KEY"]
    db_url = os.environ["DATABASE_URL"]
    ...
```

Secrets are applied in order — if two secrets define the same key, the later one wins.

### With Classes

```python
@app.cls(secrets=[modal.Secret.from_name("huggingface")])
class ModelService:
    @modal.enter()
    def load(self):
        import os
        token = os.environ["HF_TOKEN"]
        self.model = AutoModel.from_pretrained("model-name", token=token)
```

### From .env File

```python
# Reads .env file from current directory
@app.function(secrets=[modal.Secret.from_dotenv()])
def local_dev():
    import os
    api_key = os.environ["API_KEY"]
```

The `.env` file format:

```
API_KEY=sk-xxx
DATABASE_URL=postgres://user:pass@host/db
DEBUG=false
```

## Common Secret Templates

| Service | Typical Keys |
|---------|-------------|
| OpenAI | `OPENAI_API_KEY` |
| Hugging Face | `HF_TOKEN` |
| AWS | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| Postgres | `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` |
| Weights & Biases | `WANDB_API_KEY` |
| GitHub | `GITHUB_TOKEN` |

## Security Notes

- Secrets are encrypted at rest and in transit
- Only accessible to functions in your workspace
- Never log or print secret values
- Use `.from_name()` in production (not `.from_dict()`)
- Rotate secrets regularly via the dashboard or CLI
