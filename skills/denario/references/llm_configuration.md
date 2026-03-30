# LLM API Configuration

## Overview

Denario requires API credentials from supported LLM providers to power its multiagent research system. The system is built on AG2 and LangGraph, which support multiple LLM backends.

## Supported LLM Providers

### Google Vertex AI
- Full integration with Google's Vertex AI platform
- Supports Gemini and PaLM models
- Requires Google Cloud project setup

### OpenAI
- GPT-4, GPT-3.5, and other OpenAI models
- Direct API integration

### Other Providers
- Any LLM compatible with AG2/LangGraph frameworks
- Anthropic Claude (via compatible interfaces)
- Azure OpenAI
- Custom model endpoints

## Obtaining API Keys

### Google Vertex AI

1. **Create Google Cloud Project**
   - Navigate to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing

2. **Enable Vertex AI API**
   - Go to "APIs & Services" → "Library"
   - Search for "Vertex AI API"
   - Click "Enable"

3. **Create Service Account**
   - Navigate to "IAM & Admin" → "Service Accounts"
   - Create service account with Vertex AI permissions
   - Download JSON key file

4. **Set up authentication**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   ```

### OpenAI

1. **Create OpenAI Account**
   - Visit [platform.openai.com](https://platform.openai.com/)
   - Sign up or log in

2. **Generate API Key**
   - Navigate to API Keys section
   - Click "Create new secret key"
   - Copy and store securely

3. **Set environment variable**
   ```bash
   export OPENAI_API_KEY="sk-..."
   ```

## Storing API Keys

### Method 1: Environment Variables (Recommended)

**Linux/macOS:**
```bash
export OPENAI_API_KEY="your-key-here"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
```

Add to `~/.bashrc`, `~/.zshrc`, or `~/.bash_profile` for persistence.

**Windows:**
```bash
set OPENAI_API_KEY=your-key-here
```

Or use System Properties → Environment Variables for persistence.

### Method 2: .env Files

Create a `.env` file in your project directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-4

# Google Vertex AI Configuration
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GOOGLE_CLOUD_PROJECT=your-project-id

# Optional: Model preferences
DEFAULT_MODEL=gpt-4
TEMPERATURE=0.7
```

Load the environment file in Python:

```python
from dotenv import load_dotenv
load_dotenv()

from denario import Denario
den = Denario(project_dir="./project")
```

### Method 3: Docker Environment Files

For Docker deployments, pass environment variables:

```bash
# Using --env-file flag
docker run -p 8501:8501 --env-file .env --rm pablovd/denario:latest

# Using -e flag for individual variables
docker run -p 8501:8501 \
  -e OPENAI_API_KEY=sk-... \
  -e GOOGLE_APPLICATION_CREDENTIALS=/credentials.json \
  -v /local/path/to/creds.json:/credentials.json \
  --rm pablovd/denario:latest
```

## Vertex AI Detailed Setup

### Prerequisites
- Google Cloud account with billing enabled
- gcloud CLI installed (optional but recommended)

### Step-by-Step Configuration

1. **Install Google Cloud SDK (if not using Docker)**
   ```bash
   # Linux/macOS
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   gcloud init
   ```

2. **Authenticate gcloud**
   ```bash
   gcloud auth application-default login
   ```

3. **Set project**
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

4. **Enable required APIs**
   ```bash
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable compute.googleapis.com
   ```

5. **Create service account (alternative to gcloud auth)**
   ```bash
   gcloud iam service-accounts create denario-service-account \
     --display-name="Denario AI Service Account"

   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:denario-service-account@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"

   gcloud iam service-accounts keys create credentials.json \
     --iam-account=denario-service-account@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

6. **Configure denario to use Vertex AI**
   ```python
   import os
   os.environ['GOOGLE_CLOUD_PROJECT'] = 'YOUR_PROJECT_ID'
   os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/path/to/credentials.json'

   from denario import Denario
   den = Denario(project_dir="./research")
   ```

## Model Selection

Configure which models denario uses for different tasks:

```python
# In your code
from denario import Denario

# Example configuration (if supported by denario API)
den = Denario(
    project_dir="./project",
    # Model configuration may vary based on denario version
)
```

Check denario's documentation for specific model selection APIs.

## Cost Management

### Monitoring Costs

- **OpenAI**: Track usage at [platform.openai.com/usage](https://platform.openai.com/usage)
- **Google Cloud**: Monitor in Cloud Console → Billing
- Set up billing alerts to avoid unexpected charges

### Cost Optimization Tips

1. **Use appropriate model tiers**
   - GPT-3.5 for simpler tasks
   - GPT-4 for complex reasoning

2. **Batch operations**
   - Process multiple research tasks in single sessions

3. **Cache results**
   - Reuse generated ideas, methods, and results when possible

4. **Set token limits**
   - Configure maximum token usage for cost control

## Security Best Practices

### Do NOT commit API keys to version control

Add to `.gitignore`:
```gitignore
.env
*.json  # If storing credentials
credentials.json
service-account-key.json
```

### Rotate keys regularly
- Generate new API keys periodically
- Revoke old keys after rotation

### Use least privilege access
- Grant only necessary permissions to service accounts
- Use separate keys for development and production

### Encrypt sensitive files
- Store credential files in encrypted volumes
- Use cloud secret management services for production

## Troubleshooting

### "API key not found" errors
- Verify environment variables are set: `echo $OPENAI_API_KEY`
- Check `.env` file is in correct directory
- Ensure `load_dotenv()` is called before importing denario

### Vertex AI authentication failures
- Verify `GOOGLE_APPLICATION_CREDENTIALS` points to valid JSON file
- Check service account has required permissions
- Ensure APIs are enabled in Google Cloud project

### Rate limiting issues
- Implement exponential backoff
- Reduce concurrent requests
- Upgrade API plan if needed

### Docker environment variable issues
- Use `docker run --env-file .env` to pass environment
- Mount credential files with `-v` flag
- Check environment inside container: `docker exec <container> env`
