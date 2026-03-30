# OpenRouter Setup Guide

Complete guide to setting up and using OpenRouter for Perplexity model access.

## What is OpenRouter?

OpenRouter is a unified API gateway that provides access to 100+ AI models from various providers through a single API interface. It offers:

- **Single API key**: Access multiple models with one key
- **Unified format**: OpenAI-compatible API format
- **Cost tracking**: Built-in usage monitoring and billing
- **Model routing**: Intelligent fallback and load balancing
- **Pay-as-you-go**: No subscriptions, pay only for what you use

For Perplexity models specifically, OpenRouter provides exclusive access to certain models like Sonar Pro Search.

## Getting Started

### Step 1: Create OpenRouter Account

1. Visit https://openrouter.ai/
2. Click "Sign Up" in the top right
3. Sign up with Google, GitHub, or email
4. Verify your email if using email signup

### Step 2: Add Payment Method

OpenRouter uses pay-as-you-go billing:

1. Navigate to https://openrouter.ai/account
2. Click "Credits" tab
3. Add a payment method (credit card)
4. Add initial credits (minimum $5 recommended)
5. Optionally set up auto-recharge

**Pricing notes:**
- Models have different per-token costs
- See https://openrouter.ai/perplexity for Perplexity pricing
- Monitor usage at https://openrouter.ai/activity

### Step 3: Generate API Key

1. Go to https://openrouter.ai/keys
2. Click "Create Key"
3. Give your key a descriptive name (e.g., "perplexity-search-skill")
4. Optionally set usage limits for safety
5. Copy the key (starts with `sk-or-v1-...`)
6. **Important**: Save this key securely - you can't view it again!

**Security tips:**
- Never share your API key publicly
- Don't commit keys to version control
- Use separate keys for different projects
- Set usage limits to prevent unexpected charges
- Rotate keys periodically

### Step 4: Configure Environment

You have two options for setting up your API key:

#### Option A: Environment Variable (Recommended)

**Linux/macOS:**
```bash
export OPENROUTER_API_KEY='sk-or-v1-your-key-here'
```

To make it permanent, add to your shell profile:
```bash
# For bash: Add to ~/.bashrc or ~/.bash_profile
echo 'export OPENROUTER_API_KEY="sk-or-v1-your-key-here"' >> ~/.bashrc
source ~/.bashrc

# For zsh: Add to ~/.zshrc
echo 'export OPENROUTER_API_KEY="sk-or-v1-your-key-here"' >> ~/.zshrc
source ~/.zshrc
```

**Windows (PowerShell):**
```powershell
$env:OPENROUTER_API_KEY = "sk-or-v1-your-key-here"
```

To make it permanent:
```powershell
[System.Environment]::SetEnvironmentVariable('OPENROUTER_API_KEY', 'sk-or-v1-your-key-here', 'User')
```

#### Option B: .env File

Create a `.env` file in your project directory:

```bash
# Create .env file
cat > .env << EOF
OPENROUTER_API_KEY=sk-or-v1-your-key-here
EOF
```

Or use the setup script:
```bash
python scripts/setup_env.py --api-key sk-or-v1-your-key-here
```

Then load it before running scripts:
```bash
# Load environment variables from .env
source .env

# Or use python-dotenv
pip install python-dotenv
```

**Using python-dotenv in scripts:**
```python
from dotenv import load_dotenv
load_dotenv()  # Loads .env file automatically

import os
api_key = os.environ.get("OPENROUTER_API_KEY")
```

### Step 5: Install Dependencies

Install LiteLLM using uv:

```bash
uv pip install litellm
```

Or with regular pip:
```bash
pip install litellm
```

**Optional dependencies:**
```bash
# For .env file support
uv pip install python-dotenv

# For additional features
uv pip install litellm[proxy]  # If using LiteLLM proxy server
```

### Step 6: Verify Setup

Test your configuration:

```bash
# Using the setup script
python scripts/setup_env.py --validate

# Or using the search script
python scripts/perplexity_search.py --check-setup
```

You should see:
```
✓ OPENROUTER_API_KEY is set (sk-or-v1-...xxxx)
✓ LiteLLM is installed (version X.X.X)
✓ Setup is complete! You're ready to use Perplexity Search.
```

### Step 7: Test Your First Search

Run a simple test query:

```bash
python scripts/perplexity_search.py "What is CRISPR gene editing?"
```

Expected output:
```
================================================================================
ANSWER
================================================================================
CRISPR (Clustered Regularly Interspaced Short Palindromic Repeats) is a
revolutionary gene editing technology that allows precise modifications to DNA...
[detailed answer continues]
================================================================================
```

## Usage Monitoring

### Check Your Usage

Monitor your OpenRouter usage and costs:

1. Visit https://openrouter.ai/activity
2. View requests, tokens, and costs
3. Filter by date range, model, or key
4. Export usage data for analysis

### Set Usage Limits

Protect against unexpected charges:

1. Go to https://openrouter.ai/keys
2. Click on your key
3. Set "Rate limit" (requests per minute)
4. Set "Spending limit" (maximum total spend)
5. Enable "Auto-recharge" with limit if desired

**Recommended limits for development:**
- Rate limit: 10-20 requests per minute
- Spending limit: $10-50 depending on usage

### Cost Optimization

Tips for reducing costs:

1. **Choose appropriate models**: Use Sonar for simple queries, not Sonar Pro Search
2. **Set max_tokens**: Limit response length with `--max-tokens` parameter
3. **Batch queries**: Combine multiple simple questions when possible
4. **Monitor usage**: Check costs daily during heavy development
5. **Use caching**: Store results for repeated queries

## Troubleshooting

### Error: "OpenRouter API key not configured"

**Cause**: Environment variable not set

**Solution**:
```bash
# Check if variable is set
echo $OPENROUTER_API_KEY

# If empty, set it
export OPENROUTER_API_KEY='sk-or-v1-your-key-here'

# Or use setup script
python scripts/setup_env.py --api-key sk-or-v1-your-key-here
```

### Error: "Invalid API key"

**Causes**:
- Key was deleted or revoked
- Key has expired
- Typo in the key
- Wrong key format

**Solutions**:
1. Verify key at https://openrouter.ai/keys
2. Check for extra spaces or quotes
3. Generate a new key if needed
4. Ensure key starts with `sk-or-v1-`

### Error: "Insufficient credits"

**Cause**: OpenRouter account has run out of credits

**Solution**:
1. Go to https://openrouter.ai/account
2. Click "Credits" tab
3. Add more credits
4. Consider enabling auto-recharge

### Error: "Rate limit exceeded"

**Cause**: Too many requests in a short time

**Solutions**:
1. Wait a few seconds before retrying
2. Increase rate limit at https://openrouter.ai/keys
3. Implement exponential backoff in code
4. Batch requests or reduce frequency

### Error: "Model not found"

**Cause**: Incorrect model name or model no longer available

**Solution**:
1. Check available models at https://openrouter.ai/models
2. Use correct format: `openrouter/perplexity/sonar-pro`
3. Verify model is still supported

### Error: "LiteLLM not installed"

**Cause**: LiteLLM package is not installed

**Solution**:
```bash
uv pip install litellm
```

### Import Error with LiteLLM

**Cause**: Python path issues or version conflicts

**Solutions**:
1. Verify installation: `pip list | grep litellm`
2. Reinstall: `uv pip install --force-reinstall litellm`
3. Check Python version: `python --version` (requires 3.8+)
4. Use virtual environment to avoid conflicts

## Advanced Configuration

### Using Multiple Keys

For different projects or team members:

```bash
# Project 1
export OPENROUTER_API_KEY='sk-or-v1-project1-key'

# Project 2
export OPENROUTER_API_KEY='sk-or-v1-project2-key'
```

Or use .env files in different directories.

### Custom Base URL

If using OpenRouter proxy or custom endpoint:

```python
from litellm import completion

response = completion(
    model="openrouter/perplexity/sonar-pro",
    messages=[{"role": "user", "content": "query"}],
    api_base="https://custom-endpoint.com/v1"  # Custom URL
)
```

### Request Headers

Add custom headers for tracking:

```python
from litellm import completion

response = completion(
    model="openrouter/perplexity/sonar-pro",
    messages=[{"role": "user", "content": "query"}],
    extra_headers={
        "HTTP-Referer": "https://your-app.com",
        "X-Title": "Your App Name"
    }
)
```

### Timeout Configuration

Set custom timeouts for long-running queries:

```python
from litellm import completion

response = completion(
    model="openrouter/perplexity/sonar-pro-search",
    messages=[{"role": "user", "content": "complex query"}],
    timeout=120  # 120 seconds timeout
)
```

## Security Best Practices

### API Key Management

1. **Never commit keys**: Add `.env` to `.gitignore`
2. **Use key rotation**: Rotate keys every 3-6 months
3. **Separate keys**: Different keys for dev/staging/production
4. **Monitor usage**: Check for unauthorized access
5. **Set limits**: Configure spending and rate limits

### .gitignore Template

Add to your `.gitignore`:
```
# Environment variables
.env
.env.local
.env.*.local

# API keys
*api_key*
*apikey*
*.key

# Sensitive configs
config/secrets.yaml
```

### Key Revocation

If a key is compromised:

1. Go to https://openrouter.ai/keys immediately
2. Click "Delete" on the compromised key
3. Generate a new key
4. Update all applications using the old key
5. Review usage logs for unauthorized access
6. Contact OpenRouter support if needed

## FAQs

**Q: How much does it cost to use Perplexity via OpenRouter?**

A: Pricing varies by model. Sonar is cheapest (~$0.001-0.002 per query), Sonar Pro is moderate (~$0.002-0.005), and Sonar Pro Search is most expensive (~$0.02-0.05+ per query). See https://openrouter.ai/perplexity for exact pricing.

**Q: Do I need a separate Perplexity API key?**

A: No! OpenRouter provides access to Perplexity models using only your OpenRouter key.

**Q: Can I use OpenRouter for other models besides Perplexity?**

A: Yes! OpenRouter provides access to 100+ models from OpenAI, Anthropic, Google, Meta, and more through the same API key.

**Q: Is there a free tier?**

A: OpenRouter requires payment, but offers very competitive pricing. Initial $5 credit should last for extensive testing.

**Q: How do I cancel my OpenRouter account?**

A: Contact OpenRouter support. Note that unused credits may not be refundable.

**Q: Can I use OpenRouter in production applications?**

A: Yes, OpenRouter is designed for production use with robust infrastructure, SLAs, and enterprise support available.

## Resources

**Official Documentation:**
- OpenRouter: https://openrouter.ai/docs
- Perplexity Models: https://openrouter.ai/perplexity
- LiteLLM: https://docs.litellm.ai/

**Account Management:**
- Dashboard: https://openrouter.ai/account
- API Keys: https://openrouter.ai/keys
- Usage: https://openrouter.ai/activity
- Billing: https://openrouter.ai/credits

**Community:**
- OpenRouter Discord: https://discord.gg/openrouter
- GitHub Issues: https://github.com/OpenRouter
- LiteLLM GitHub: https://github.com/BerriAI/litellm

## Summary

Setting up OpenRouter for Perplexity access involves:

1. Create account at https://openrouter.ai
2. Add payment method and credits
3. Generate API key at https://openrouter.ai/keys
4. Set `OPENROUTER_API_KEY` environment variable
5. Install LiteLLM: `uv pip install litellm`
6. Verify setup: `python scripts/setup_env.py --validate`
7. Start searching: `python scripts/perplexity_search.py "your query"`

Monitor usage and costs regularly to optimize your spending and ensure security.
