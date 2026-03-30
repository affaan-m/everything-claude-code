# Open Notebook Configuration Guide

## Docker Deployment

Open Notebook is deployed as a Docker Compose stack with two main services: the application server and SurrealDB.

### Minimal docker-compose.yml

```yaml
version: "3.8"

services:
  surrealdb:
    image: surrealdb/surrealdb:latest
    command: start --user root --pass root rocksdb://data/database.db
    volumes:
      - surrealdb_data:/data
    ports:
      - "8000:8000"

  open-notebook:
    image: ghcr.io/lfnovo/open-notebook:latest
    depends_on:
      - surrealdb
    environment:
      - OPEN_NOTEBOOK_ENCRYPTION_KEY=${OPEN_NOTEBOOK_ENCRYPTION_KEY}
      - SURREAL_URL=ws://surrealdb:8000/rpc
      - SURREAL_NAMESPACE=open_notebook
      - SURREAL_DATABASE=open_notebook
    ports:
      - "8502:8502"   # Frontend UI
      - "5055:5055"   # REST API
    volumes:
      - on_uploads:/app/uploads

volumes:
  surrealdb_data:
  on_uploads:
```

### Starting the Stack

```bash
# Set the encryption key (required)
export OPEN_NOTEBOOK_ENCRYPTION_KEY="your-secure-random-key"

# Start services
docker-compose up -d

# View logs
docker-compose logs -f open-notebook

# Stop services
docker-compose down

# Stop and remove data
docker-compose down -v
```

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `OPEN_NOTEBOOK_ENCRYPTION_KEY` | Secret key for encrypting stored API credentials. Must be set before first launch and kept consistent. |

### Database

| Variable | Default | Description |
|----------|---------|-------------|
| `SURREAL_URL` | `ws://surrealdb:8000/rpc` | SurrealDB WebSocket connection URL |
| `SURREAL_NAMESPACE` | `open_notebook` | SurrealDB namespace |
| `SURREAL_DATABASE` | `open_notebook` | SurrealDB database name |
| `SURREAL_USER` | `root` | SurrealDB username |
| `SURREAL_PASS` | `root` | SurrealDB password |

### Application

| Variable | Default | Description |
|----------|---------|-------------|
| `OPEN_NOTEBOOK_PASSWORD` | None | Optional password protection for the web UI |
| `UPLOAD_DIR` | `/app/uploads` | Directory for uploaded file storage |

### AI Provider Keys (Legacy)

API keys can also be set via environment variables for legacy compatibility. The preferred method is using the credentials API or UI.

| Variable | Provider |
|----------|----------|
| `OPENAI_API_KEY` | OpenAI |
| `ANTHROPIC_API_KEY` | Anthropic |
| `GOOGLE_API_KEY` | Google GenAI |
| `GROQ_API_KEY` | Groq |
| `MISTRAL_API_KEY` | Mistral |
| `ELEVENLABS_API_KEY` | ElevenLabs |

## AI Provider Configuration

### Via UI

1. Go to **Settings > API Keys**
2. Click **Add Credential**
3. Select provider, enter API key and optional base URL
4. Click **Test Connection** to verify
5. Click **Discover Models** to find available models
6. Select models to register

### Via API

```python
import requests

BASE_URL = "http://localhost:5055/api"

# 1. Create credential
cred = requests.post(f"{BASE_URL}/credentials", json={
    "provider": "anthropic",
    "name": "Anthropic Production",
    "api_key": "sk-ant-..."
}).json()

# 2. Test connection
test = requests.post(f"{BASE_URL}/credentials/{cred['id']}/test").json()
assert test["success"]

# 3. Discover and register models
discovered = requests.post(
    f"{BASE_URL}/credentials/{cred['id']}/discover"
).json()

requests.post(
    f"{BASE_URL}/credentials/{cred['id']}/register-models",
    json={"model_ids": [m["id"] for m in discovered["models"]]}
)

# 4. Auto-assign defaults
requests.post(f"{BASE_URL}/models/auto-assign")
```

### Using Ollama (Free Local Inference)

For free AI inference without API costs, use Ollama:

```yaml
# docker-compose-ollama.yml addition
services:
  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"
```

Then configure Ollama as a provider with base URL `http://ollama:11434`.

## Security Configuration

### Password Protection

Set `OPEN_NOTEBOOK_PASSWORD` to require authentication:

```bash
export OPEN_NOTEBOOK_PASSWORD="your-ui-password"
```

### Reverse Proxy (Nginx Example)

```nginx
server {
    listen 443 ssl;
    server_name notebook.example.com;

    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;

    location / {
        proxy_pass http://localhost:8502;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /api/ {
        proxy_pass http://localhost:5055/api/;
        proxy_set_header Host $host;
    }
}
```

## Backup and Restore

### Backup SurrealDB Data

```bash
# Export database
docker exec surrealdb surreal export \
  --conn ws://localhost:8000 \
  --user root --pass root \
  --ns open_notebook --db open_notebook \
  /tmp/backup.surql

# Copy backup from container
docker cp surrealdb:/tmp/backup.surql ./backup.surql
```

### Backup Uploaded Files

```bash
# Copy upload volume contents
docker cp open-notebook:/app/uploads ./uploads_backup/
```

### Restore

```bash
# Import database backup
docker cp ./backup.surql surrealdb:/tmp/backup.surql
docker exec surrealdb surreal import \
  --conn ws://localhost:8000 \
  --user root --pass root \
  --ns open_notebook --db open_notebook \
  /tmp/backup.surql
```
