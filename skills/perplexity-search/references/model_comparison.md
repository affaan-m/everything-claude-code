# Perplexity Model Comparison

Guide to different Perplexity models available through OpenRouter and when to use each.

## Available Models

All Perplexity models are accessed through OpenRouter using the format:
`openrouter/perplexity/[model-name]`

### Sonar Pro Search

**Model ID**: `openrouter/perplexity/sonar-pro-search`

**Best for:**
- Complex multi-step research questions
- Queries requiring deep analysis and synthesis
- Situations needing comprehensive source exploration
- Comparative analyses across multiple domains
- Research requiring agentic reasoning workflow

**Characteristics:**
- Most advanced agentic search system
- Executes multi-step reasoning workflows
- Uses tools and intermediate queries
- Provides most comprehensive answers
- Higher cost due to extensive processing

**Use cases:**
- "Conduct a comprehensive analysis of competing CAR-T cell therapy approaches, including mechanism differences, clinical outcomes, and cost-effectiveness"
- "Compare quantum computing approaches for drug discovery with traditional computational methods across multiple metrics"
- Research questions requiring synthesis from many sources

**Pricing** (approximate):
- Input: $3/million tokens
- Output: $15/million tokens
- Request fee: $18 per 1000 requests

**Context window**: 200K tokens

### Sonar Pro

**Model ID**: `openrouter/perplexity/sonar-pro`

**Best for:**
- General-purpose research and search
- Balanced performance and cost
- Standard scientific queries
- Quick information gathering
- Most use cases

**Characteristics:**
- Enhanced capabilities over base Sonar
- Good balance of quality and cost
- Reliable for most queries
- Faster than Pro Search
- Recommended default choice

**Use cases:**
- "What are the latest developments in CRISPR base editing?"
- "Summarize recent clinical trials for Alzheimer's treatment"
- "Explain how transformer architectures work in modern LLMs"
- Standard literature searches
- Technical documentation queries

**Pricing** (approximate):
- Lower cost than Pro Search
- Good cost-performance ratio

**Context window**: 200K tokens

### Sonar

**Model ID**: `openrouter/perplexity/sonar`

**Best for:**
- Basic searches and queries
- Cost-sensitive applications
- Simple fact-finding
- High-volume queries
- Quick lookups

**Characteristics:**
- Base model with solid performance
- Most cost-effective option
- Faster response times
- Good for straightforward queries
- Lower accuracy than Pro variants

**Use cases:**
- "What is the molecular weight of aspirin?"
- "When was CRISPR-Cas9 first used in humans?"
- "List the main symptoms of diabetes"
- Simple fact verification
- Basic information retrieval

**Pricing** (approximate):
- Lowest cost option
- Best for high-volume simple queries

**Context window**: 200K tokens

### Sonar Reasoning Pro

**Model ID**: `openrouter/perplexity/sonar-reasoning-pro`

**Best for:**
- Complex logical reasoning tasks
- Multi-step problem solving
- Technical analysis requiring step-by-step thinking
- Mathematical or computational problems
- Queries needing explicit reasoning chains

**Characteristics:**
- Advanced reasoning capabilities
- Shows step-by-step thinking
- Better for analytical tasks
- Excels at technical problem-solving
- More structured outputs

**Use cases:**
- "Walk through the steps to design a clinical trial for testing a novel cancer therapy"
- "Analyze the computational complexity of different protein folding algorithms"
- "Reason through the molecular mechanisms linking multiple genes to a disease phenotype"
- Technical troubleshooting with multiple steps
- Logical analysis of complex systems

**Pricing** (approximate):
- Higher cost due to reasoning capabilities
- Worth it for complex analytical tasks

**Context window**: 200K tokens

### Sonar Reasoning

**Model ID**: `openrouter/perplexity/sonar-reasoning`

**Best for:**
- Basic reasoning tasks
- Cost-effective analytical queries
- Simpler logical problems
- Step-by-step explanations

**Characteristics:**
- Basic reasoning capabilities
- More affordable than Reasoning Pro
- Good for moderate complexity tasks
- Shows logical thinking process

**Use cases:**
- "Explain the logic behind vaccine efficacy calculations"
- "Walk through basic statistical analysis steps"
- Simple analytical questions
- Educational explanations

**Pricing** (approximate):
- Lower cost than Reasoning Pro
- Good balance for basic reasoning

**Context window**: 200K tokens

## Model Selection Guide

### Decision Tree

```
Is your query complex and requiring deep multi-step analysis?
├─ YES → Use Sonar Pro Search
└─ NO → Continue

Does your query require explicit step-by-step reasoning?
├─ YES → Use Sonar Reasoning Pro (complex) or Sonar Reasoning (simple)
└─ NO → Continue

Is this a standard research or information query?
├─ YES → Use Sonar Pro (recommended default)
└─ NO → Continue

Is this a simple fact-finding or basic lookup?
├─ YES → Use Sonar (cost-effective)
└─ NO → Use Sonar Pro (safe default)
```

### By Use Case

| Use Case | Recommended Model | Alternative |
|----------|------------------|-------------|
| Literature review | Sonar Pro | Sonar Pro Search |
| Quick fact check | Sonar | Sonar Pro |
| Complex analysis | Sonar Pro Search | Sonar Reasoning Pro |
| Step-by-step tutorial | Sonar Reasoning Pro | Sonar Pro |
| Cost-sensitive bulk queries | Sonar | Sonar Pro |
| General research | Sonar Pro | Sonar |
| Technical debugging | Sonar Reasoning Pro | Sonar Pro |
| Comparative analysis | Sonar Pro Search | Sonar Pro |

### By Domain

**Biomedical Research:**
- Default: Sonar Pro
- Complex mechanisms: Sonar Reasoning Pro
- Literature synthesis: Sonar Pro Search
- Quick lookups: Sonar

**Computational Science:**
- Default: Sonar Pro
- Algorithm analysis: Sonar Reasoning Pro
- Technical docs: Sonar Pro
- Basic syntax: Sonar

**Drug Discovery:**
- Default: Sonar Pro
- Multi-target analysis: Sonar Pro Search
- Mechanism reasoning: Sonar Reasoning Pro
- Compound properties: Sonar

**Clinical Research:**
- Default: Sonar Pro
- Trial design: Sonar Reasoning Pro
- Evidence synthesis: Sonar Pro Search
- Basic guidelines: Sonar

## Performance Characteristics

### Response Time

**Fastest to Slowest:**
1. Sonar (fastest)
2. Sonar Pro
3. Sonar Reasoning
4. Sonar Reasoning Pro
5. Sonar Pro Search (slowest, due to multi-step processing)

**Considerations:**
- For time-sensitive queries, use Sonar or Sonar Pro
- For comprehensive analysis, accept the slower Sonar Pro Search
- Reasoning models are slower due to explicit thinking steps

### Quality vs Cost Trade-offs

**Quality Hierarchy** (highest to lowest):
1. Sonar Pro Search
2. Sonar Reasoning Pro
3. Sonar Pro
4. Sonar Reasoning
5. Sonar

**Cost Hierarchy** (most to least expensive):
1. Sonar Pro Search
2. Sonar Reasoning Pro
3. Sonar Pro
4. Sonar Reasoning
5. Sonar

**Recommendation**: Start with Sonar Pro as the default. Upgrade to Pro Search for complex queries, downgrade to Sonar for simple lookups.

### Accuracy and Comprehensiveness

**Most Comprehensive:**
- Sonar Pro Search: Explores multiple sources, synthesizes deeply
- Sonar Reasoning Pro: Thorough step-by-step analysis

**Most Accurate:**
- Sonar Pro Search: Best source verification and cross-checking
- Sonar Pro: Reliable for most queries

**Good Enough:**
- Sonar: Adequate for simple facts and basic queries

## Special Considerations

### Context Window

All models support 200K token context windows:
- Sufficient for most queries
- Can handle long documents or multiple sources
- Consider chunking very large analyses

### Temperature Settings

Different models benefit from different temperature settings:

**Sonar Pro Search:**
- Default: 0.2 (more focused, analytical)
- Use lower (0.0-0.1) for factual queries
- Use higher (0.3-0.5) for creative synthesis

**Sonar Reasoning Pro:**
- Default: 0.2
- Keep low (0.0-0.2) for logical consistency
- Reasoning quality degrades at high temperatures

**Sonar Pro / Sonar:**
- Default: 0.2
- Adjust based on query type (factual vs exploratory)

### Rate Limits and Quotas

OpenRouter enforces rate limits:
- Check your OpenRouter dashboard for current limits
- Consider request batching for high-volume use
- Monitor costs with OpenRouter's tracking tools

### API Key Security

**Best practices:**
- Never commit API keys to version control
- Use environment variables or .env files
- Rotate keys periodically
- Monitor usage for unexpected activity
- Use separate keys for different projects

## Example Comparisons

### Query: "Explain CRISPR-Cas9 gene editing"

**Sonar:**
- Quick overview
- Basic mechanism explanation
- ~200-300 tokens
- 1-2 sources cited
- Cost: $0.001

**Sonar Pro:**
- Detailed explanation
- Multiple mechanisms covered
- ~500-800 tokens
- 3-5 sources cited
- Cost: $0.003

**Sonar Reasoning Pro:**
- Step-by-step mechanism breakdown
- Logical flow of editing process
- ~800-1200 tokens
- Shows reasoning steps
- Cost: $0.005

**Sonar Pro Search:**
- Comprehensive analysis
- Multiple sources synthesized
- Historical context included
- Recent developments covered
- ~1500-2000 tokens
- 10+ sources explored
- Cost: $0.020+

### Query: "What is 2+2?"

All models return accurate answer. Use Sonar for simple queries to minimize cost.

### Query: "Design a clinical trial for novel immunotherapy"

**Sonar:**
- Basic template provided
- May miss important details
- Cost-effective but incomplete

**Sonar Pro:**
- Solid trial design framework
- Covers main components
- Good starting point

**Sonar Reasoning Pro:**
- Detailed step-by-step design
- Considers multiple factors
- Shows reasoning for each choice
- **Recommended for this query type**

**Sonar Pro Search:**
- Most comprehensive design
- Incorporates best practices from multiple sources
- Compares different approaches
- May be overkill for initial design

## Summary

**Default recommendation**: Start with **Sonar Pro** for most scientific queries.

**When to upgrade:**
- Complex multi-step analysis → Sonar Pro Search
- Explicit reasoning needed → Sonar Reasoning Pro

**When to downgrade:**
- Simple facts or lookups → Sonar
- Cost-sensitive bulk queries → Sonar

**Remember**: The best model depends on your specific use case, budget, and quality requirements. Monitor your usage and adjust model selection based on results.
