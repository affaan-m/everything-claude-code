---
name: perplexity-search
description: Perform AI-powered web searches with real-time information using Perplexity models via LiteLLM and OpenRouter. This skill should be used when conducting web searches for current information, finding recent scientific literature, getting grounded answers with source citations, or accessing information beyond the model knowledge cutoff. Provides access to multiple Perplexity models including Sonar Pro, Sonar Pro Search (advanced agentic search), and Sonar Reasoning Pro through a single OpenRouter API key.
license: MIT license
compatibility: An OpenRouter API key is required to use Perplexity search
metadata:
    skill-author: K-Dense Inc.
---

# Perplexity Search

## Overview

Perform AI-powered web searches using Perplexity models through LiteLLM and OpenRouter. Perplexity provides real-time, web-grounded answers with source citations, making it ideal for finding current information, recent scientific literature, and facts beyond the model's training data cutoff.

This skill provides access to all Perplexity models through OpenRouter, requiring only a single API key (no separate Perplexity account needed).

## When to Use This Skill

Use this skill when:
- Searching for current information or recent developments (2024 and beyond)
- Finding latest scientific publications and research
- Getting real-time answers grounded in web sources
- Verifying facts with source citations
- Conducting literature searches across multiple domains
- Accessing information beyond the model's knowledge cutoff
- Performing domain-specific research (biomedical, technical, clinical)
- Comparing current approaches or technologies

**Do not use** for:
- Simple calculations or logic problems (use directly)
- Tasks requiring code execution (use standard tools)
- Questions well within the model's training data (unless verification needed)

## Quick Start

### Setup (One-time)

1. **Get OpenRouter API key**:
   - Visit https://openrouter.ai/keys
   - Create account and generate API key
   - Add credits to account (minimum $5 recommended)

2. **Configure environment**:
   ```bash
   # Set API key
   export OPENROUTER_API_KEY='sk-or-v1-your-key-here'

   # Or use setup script
   python scripts/setup_env.py --api-key sk-or-v1-your-key-here
   ```

3. **Install dependencies**:
   ```bash
   uv pip install litellm
   ```

4. **Verify setup**:
   ```bash
   python scripts/perplexity_search.py --check-setup
   ```

See `references/openrouter_setup.md` for detailed setup instructions, troubleshooting, and security best practices.

### Basic Usage

**Simple search:**
```bash
python scripts/perplexity_search.py "What are the latest developments in CRISPR gene editing?"
```

**Save results:**
```bash
python scripts/perplexity_search.py "Recent CAR-T therapy clinical trials" --output results.json
```

**Use specific model:**
```bash
python scripts/perplexity_search.py "Compare mRNA and viral vector vaccines" --model sonar-pro-search
```

**Verbose output:**
```bash
python scripts/perplexity_search.py "Quantum computing for drug discovery" --verbose
```

## Available Models

Access models via `--model` parameter:

- **sonar-pro** (default): General-purpose search, best balance of cost and quality
- **sonar-pro-search**: Most advanced agentic search with multi-step reasoning
- **sonar**: Basic model, most cost-effective for simple queries
- **sonar-reasoning-pro**: Advanced reasoning with step-by-step analysis
- **sonar-reasoning**: Basic reasoning capabilities

**Model selection guide:**
- Default queries → `sonar-pro`
- Complex multi-step analysis → `sonar-pro-search`
- Explicit reasoning needed → `sonar-reasoning-pro`
- Simple fact lookups → `sonar`
- Cost-sensitive bulk queries → `sonar`

See `references/model_comparison.md` for detailed comparison, use cases, pricing, and performance characteristics.

## Crafting Effective Queries

### Be Specific and Detailed

**Good examples:**
- "What are the latest clinical trial results for CAR-T cell therapy in treating B-cell lymphoma published in 2024?"
- "Compare the efficacy and safety profiles of mRNA vaccines versus viral vector vaccines for COVID-19"
- "Explain AlphaFold3 improvements over AlphaFold2 with specific accuracy metrics from 2023-2024 research"

**Bad examples:**
- "Tell me about cancer treatment" (too broad)
- "CRISPR" (too vague)
- "vaccines" (lacks specificity)

### Include Time Constraints

Perplexity searches real-time web data:
- "What papers were published in Nature Medicine in 2024 about long COVID?"
- "What are the latest developments (past 6 months) in large language model efficiency?"
- "What was announced at NeurIPS 2023 regarding AI safety?"

### Specify Domain and Sources

For high-quality results, mention source preferences:
- "According to peer-reviewed publications in high-impact journals..."
- "Based on FDA-approved treatments..."
- "From clinical trial registries like clinicaltrials.gov..."

### Structure Complex Queries

Break complex questions into clear components:
1. **Topic**: Main subject
2. **Scope**: Specific aspect of interest
3. **Context**: Time frame, domain, constraints
4. **Output**: Desired format or type of answer

**Example:**
"What improvements does AlphaFold3 offer over AlphaFold2 for protein structure prediction, according to research published between 2023 and 2024? Include specific accuracy metrics and benchmarks."

See `references/search_strategies.md` for comprehensive guidance on query design, domain-specific patterns, and advanced techniques.

## Common Use Cases

### Scientific Literature Search

```bash
python scripts/perplexity_search.py \
  "What does recent research (2023-2024) say about the role of gut microbiome in Parkinson's disease? Focus on peer-reviewed studies and include specific bacterial species identified." \
  --model sonar-pro
```

### Technical Documentation

```bash
python scripts/perplexity_search.py \
  "How to implement real-time data streaming from Kafka to PostgreSQL using Python? Include considerations for handling backpressure and ensuring exactly-once semantics." \
  --model sonar-reasoning-pro
```

### Comparative Analysis

```bash
python scripts/perplexity_search.py \
  "Compare PyTorch versus TensorFlow for implementing transformer models in terms of ease of use, performance, and ecosystem support. Include benchmarks from recent studies." \
  --model sonar-pro-search
```

### Clinical Research

```bash
python scripts/perplexity_search.py \
  "What is the evidence for intermittent fasting in managing type 2 diabetes in adults? Focus on randomized controlled trials and report HbA1c changes and weight loss outcomes." \
  --model sonar-pro
```

### Trend Analysis

```bash
python scripts/perplexity_search.py \
  "What are the key trends in single-cell RNA sequencing technology over the past 5 years? Highlight improvements in throughput, cost, and resolution, with specific examples." \
  --model sonar-pro
```

## Working with Results

### Programmatic Access

Use `perplexity_search.py` as a module:

```python
from scripts.perplexity_search import search_with_perplexity

result = search_with_perplexity(
    query="What are the latest CRISPR developments?",
    model="openrouter/perplexity/sonar-pro",
    max_tokens=4000,
    temperature=0.2,
    verbose=False
)

if result["success"]:
    print(result["answer"])
    print(f"Tokens used: {result['usage']['total_tokens']}")
else:
    print(f"Error: {result['error']}")
```

### Save and Process Results

```bash
# Save to JSON
python scripts/perplexity_search.py "query" --output results.json

# Process with jq
cat results.json | jq '.answer'
cat results.json | jq '.usage'
```

### Batch Processing

Create a script for multiple queries:

```bash
#!/bin/bash
queries=(
  "CRISPR developments 2024"
  "mRNA vaccine technology advances"
  "AlphaFold3 accuracy improvements"
)

for query in "${queries[@]}"; do
  echo "Searching: $query"
  python scripts/perplexity_search.py "$query" --output "results_$(echo $query | tr ' ' '_').json"
  sleep 2  # Rate limiting
done
```

## Cost Management

Perplexity models have different pricing tiers:

**Approximate costs per query:**
- Sonar: $0.001-0.002 (most cost-effective)
- Sonar Pro: $0.002-0.005 (recommended default)
- Sonar Reasoning Pro: $0.005-0.010
- Sonar Pro Search: $0.020-0.050+ (most comprehensive)

**Cost optimization strategies:**
1. Use `sonar` for simple fact lookups
2. Default to `sonar-pro` for most queries
3. Reserve `sonar-pro-search` for complex analysis
4. Set `--max-tokens` to limit response length
5. Monitor usage at https://openrouter.ai/activity
6. Set spending limits in OpenRouter dashboard

## Troubleshooting

### API Key Not Set

**Error**: "OpenRouter API key not configured"

**Solution**:
```bash
export OPENROUTER_API_KEY='sk-or-v1-your-key-here'
# Or run setup script
python scripts/setup_env.py --api-key sk-or-v1-your-key-here
```

### LiteLLM Not Installed

**Error**: "LiteLLM not installed"

**Solution**:
```bash
uv pip install litellm
```

### Rate Limiting

**Error**: "Rate limit exceeded"

**Solutions**:
- Wait a few seconds before retrying
- Increase rate limit at https://openrouter.ai/keys
- Add delays between requests in batch processing

### Insufficient Credits

**Error**: "Insufficient credits"

**Solution**:
- Add credits at https://openrouter.ai/account
- Enable auto-recharge to prevent interruptions

See `references/openrouter_setup.md` for comprehensive troubleshooting guide.

## Integration with Other Skills

This skill complements other scientific skills:

### Literature Review

Use with `literature-review` skill:
1. Use Perplexity to find recent papers and preprints
2. Supplement PubMed searches with real-time web results
3. Verify citations and find related work
4. Discover latest developments post-database indexing

### Scientific Writing

Use with `scientific-writing` skill:
1. Find recent references for introduction/discussion
2. Verify current state of the art
3. Check latest terminology and conventions
4. Identify recent competing approaches

### Hypothesis Generation

Use with `hypothesis-generation` skill:
1. Search for latest research findings
2. Identify current gaps in knowledge
3. Find recent methodological advances
4. Discover emerging research directions

### Critical Thinking

Use with `scientific-critical-thinking` skill:
1. Find evidence for and against hypotheses
2. Locate methodological critiques
3. Identify controversies in the field
4. Verify claims with current evidence

## Best Practices

### Query Design

1. **Be specific**: Include domain, time frame, and constraints
2. **Use terminology**: Domain-appropriate keywords and phrases
3. **Specify sources**: Mention preferred publication types or journals
4. **Structure questions**: Clear components with explicit context
5. **Iterate**: Refine based on initial results

### Model Selection

1. **Start with sonar-pro**: Good default for most queries
2. **Upgrade for complexity**: Use sonar-pro-search for multi-step analysis
3. **Downgrade for simplicity**: Use sonar for basic facts
4. **Use reasoning models**: When step-by-step analysis needed

### Cost Optimization

1. **Choose appropriate models**: Match model to query complexity
2. **Set token limits**: Use `--max-tokens` to control costs
3. **Monitor usage**: Check OpenRouter dashboard regularly
4. **Batch efficiently**: Combine related simple queries when possible
5. **Cache results**: Save and reuse results for repeated queries

### Security

1. **Protect API keys**: Never commit to version control
2. **Use environment variables**: Keep keys separate from code
3. **Set spending limits**: Configure in OpenRouter dashboard
4. **Monitor usage**: Watch for unexpected activity
5. **Rotate keys**: Change keys periodically

## Resources

### Bundled Resources

**Scripts:**
- `scripts/perplexity_search.py`: Main search script with CLI interface
- `scripts/setup_env.py`: Environment setup and validation helper

**References:**
- `references/search_strategies.md`: Comprehensive query design guide
- `references/model_comparison.md`: Detailed model comparison and selection guide
- `references/openrouter_setup.md`: Complete setup, troubleshooting, and security guide

**Assets:**
- `assets/.env.example`: Example environment file template

### External Resources

**OpenRouter:**
- Dashboard: https://openrouter.ai/account
- API Keys: https://openrouter.ai/keys
- Perplexity Models: https://openrouter.ai/perplexity
- Usage Monitoring: https://openrouter.ai/activity
- Documentation: https://openrouter.ai/docs

**LiteLLM:**
- Documentation: https://docs.litellm.ai/
- OpenRouter Provider: https://docs.litellm.ai/docs/providers/openrouter
- GitHub: https://github.com/BerriAI/litellm

**Perplexity:**
- Official Docs: https://docs.perplexity.ai/

## Dependencies

### Required

```bash
# LiteLLM for API access
uv pip install litellm
```

### Optional

```bash
# For .env file support
uv pip install python-dotenv

# For JSON processing (usually pre-installed)
uv pip install jq
```

### Environment Variables

Required:
- `OPENROUTER_API_KEY`: Your OpenRouter API key

Optional:
- `DEFAULT_MODEL`: Default model to use (default: sonar-pro)
- `DEFAULT_MAX_TOKENS`: Default max tokens (default: 4000)
- `DEFAULT_TEMPERATURE`: Default temperature (default: 0.2)

## Summary

This skill provides:

1. **Real-time web search**: Access current information beyond training data cutoff
2. **Multiple models**: From cost-effective Sonar to advanced Sonar Pro Search
3. **Simple setup**: Single OpenRouter API key, no separate Perplexity account
4. **Comprehensive guidance**: Detailed references for query design and model selection
5. **Cost-effective**: Pay-as-you-go pricing with usage monitoring
6. **Scientific focus**: Optimized for research, literature search, and technical queries
7. **Easy integration**: Works seamlessly with other scientific skills

Conduct AI-powered web searches to find current information, recent research, and grounded answers with source citations.

