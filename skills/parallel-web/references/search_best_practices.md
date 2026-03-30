# Search API Best Practices

Comprehensive guide to getting the best results from Parallel's Search API.

---

## Core Concepts

The Search API returns ranked, LLM-optimized excerpts from web sources based on natural language objectives. Results are designed to serve directly as model input, enabling faster reasoning and higher-quality completions.

### Key Advantages Over Traditional Search

- **Context engineering for token efficiency**: Results are ranked by reasoning utility, not engagement
- **Single-hop resolution**: Complex multi-topic queries resolved in one request
- **Multi-hop efficiency**: Deep research workflows complete in fewer tool calls

---

## Crafting Effective Search Queries

### Provide Both `objective` AND `search_queries`

The `objective` describes your broader goal; `search_queries` ensures specific keywords are prioritized. Using both together gives significantly better results.

**Good:**
```python
searcher.search(
    objective="I'm writing a literature review on Alzheimer's treatments. Find peer-reviewed research papers and clinical trial results from the past 2 years on amyloid-beta targeted therapies.",
    search_queries=[
        "amyloid beta clinical trials 2024-2025",
        "Alzheimer's monoclonal antibody treatment results",
        "lecanemab donanemab trial outcomes"
    ],
)
```

**Poor:**
```python
# Too vague - no context about intent
searcher.search(objective="Alzheimer's treatment")

# Missing objective - no context for ranking
searcher.search(search_queries=["Alzheimer's drugs"])
```

### Objective Writing Tips

1. **State your broader task**: "I'm writing a research paper on...", "I'm analyzing the market for...", "I'm preparing a presentation about..."
2. **Be specific about source preferences**: "Prefer official government websites", "Focus on peer-reviewed journals", "From major news outlets"
3. **Include freshness requirements**: "From the past 6 months", "Published in 2024-2025", "Most recent data available"
4. **Specify content type**: "Technical documentation", "Clinical trial results", "Market analysis reports", "Product announcements"

### Example Objectives by Use Case

**Academic Research:**
```
"I'm writing a literature review on CRISPR gene editing applications in cancer therapy.
Find peer-reviewed papers from Nature, Science, Cell, and other high-impact journals
published in 2023-2025. Prefer clinical trial results and systematic reviews."
```

**Market Intelligence:**
```
"I'm preparing Q1 2025 investor materials for a fintech startup.
Find recent announcements from the Federal Reserve and SEC about digital asset
regulations and banking partnerships with crypto firms. Past 3 months only."
```

**Technical Documentation:**
```
"I'm designing a machine learning course. Find technical documentation and API guides
that explain how transformer attention mechanisms work, preferably from official
framework documentation like PyTorch or Hugging Face."
```

**Current Events:**
```
"I'm tracking AI regulation developments. Find official policy announcements,
legislative actions, and regulatory guidance from the EU, US, and UK governments
from the past month."
```

---

## Search Modes

Use the `mode` parameter to optimize for your workflow:

| Mode | Best For | Excerpt Style | Latency |
|------|----------|---------------|---------|
| `one-shot` (default) | Direct queries, single-request workflows | Comprehensive, longer | Lower |
| `agentic` | Multi-step reasoning loops, agent workflows | Concise, token-efficient | Slightly higher |
| `fast` | Real-time applications, UI auto-complete | Minimal, speed-optimized | ~1 second |

### When to Use Each Mode

**`one-shot`** (default):
- Single research question that needs comprehensive answer
- Writing a section of a paper and need full context
- Background research before starting a document
- Any case where you'll make only one search call

**`agentic`**:
- Multi-step research workflows (search → analyze → search again)
- Agent loops where token efficiency matters
- Iterative refinement of research queries
- When integrating with other tools (search → extract → synthesize)

**`fast`**:
- Live autocomplete or suggestion systems
- Quick fact-checking during writing
- Real-time metadata lookups
- Any latency-sensitive application

---

## Source Policy

Control which domains are included or excluded from results:

```python
searcher.search(
    objective="Find clinical trial results for new cancer immunotherapy drugs",
    search_queries=["checkpoint inhibitor clinical trials 2025"],
    source_policy={
        "allow_domains": ["clinicaltrials.gov", "nejm.org", "thelancet.com", "nature.com"],
        "deny_domains": ["reddit.com", "quora.com"],
        "after_date": "2024-01-01"
    },
)
```

### Source Policy Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `allow_domains` | list[str] | Only include results from these domains |
| `deny_domains` | list[str] | Exclude results from these domains |
| `after_date` | str (YYYY-MM-DD) | Only include content published after this date |

### Domain Lists by Use Case

**Academic Research:**
```python
allow_domains = [
    "nature.com", "science.org", "cell.com", "thelancet.com",
    "nejm.org", "bmj.com", "pnas.org", "arxiv.org",
    "pubmed.ncbi.nlm.nih.gov", "scholar.google.com"
]
```

**Technology/AI:**
```python
allow_domains = [
    "arxiv.org", "openai.com", "anthropic.com", "deepmind.google",
    "huggingface.co", "pytorch.org", "tensorflow.org",
    "proceedings.neurips.cc", "proceedings.mlr.press"
]
```

**Market Intelligence:**
```python
deny_domains = [
    "reddit.com", "quora.com", "medium.com",
    "wikipedia.org"  # Good for facts, not for market data
]
```

**Government/Policy:**
```python
allow_domains = [
    "gov", "europa.eu", "who.int", "worldbank.org",
    "imf.org", "oecd.org", "un.org"
]
```

---

## Controlling Result Volume

### `max_results` Parameter

- Range: 1-20 (default: 10)
- More results = broader coverage but more tokens to process
- Fewer results = more focused but may miss relevant sources

**Recommendations:**
- Quick fact check: `max_results=3`
- Standard research: `max_results=10` (default)
- Comprehensive survey: `max_results=20`

### Excerpt Length Control

```python
searcher.search(
    objective="...",
    max_chars_per_result=10000,  # Default: 10000
)
```

- **Short excerpts (1000-3000)**: Quick summaries, metadata extraction
- **Medium excerpts (5000-10000)**: Standard research, balanced depth
- **Long excerpts (10000-50000)**: Full article content, deep analysis

---

## Common Patterns

### Pattern 1: Research Before Writing

```python
# Before writing each section, search for relevant information
result = searcher.search(
    objective="Find recent advances in transformer attention mechanisms for a NeurIPS paper introduction",
    search_queries=["attention mechanism innovations 2024", "efficient transformers"],
    max_results=10,
)

# Extract key findings for the section
for r in result["results"]:
    print(f"Source: {r['title']} ({r['url']})")
    # Use excerpts to inform writing
```

### Pattern 2: Fact Verification

```python
# Quick verification of a specific claim
result = searcher.search(
    objective="Verify: Did GPT-4 achieve 86.4% on MMLU benchmark?",
    search_queries=["GPT-4 MMLU benchmark score"],
    max_results=5,
)
```

### Pattern 3: Competitive Intelligence

```python
result = searcher.search(
    objective="Find recent product launches and funding announcements for AI coding assistants in 2025",
    search_queries=[
        "AI coding assistant funding 2025",
        "code generation tool launch",
        "AI developer tools new product"
    ],
    source_policy={"after_date": "2025-01-01"},
    max_results=15,
)
```

### Pattern 4: Multi-Language Research

```python
# Search includes multilingual results automatically
result = searcher.search(
    objective="Find global perspectives on AI regulation, including EU, China, and US approaches",
    search_queries=[
        "EU AI Act implementation 2025",
        "China AI regulation policy",
        "US AI executive order updates"
    ],
)
```

---

## Troubleshooting

### Few or No Results

- **Broaden your objective**: Remove overly specific constraints
- **Add more search queries**: Different phrasings of the same concept
- **Remove source policy**: Domain restrictions may be too narrow
- **Check date filters**: `after_date` may be too recent

### Irrelevant Results

- **Make objective more specific**: Add context about your task
- **Use source policy**: Allow only authoritative domains
- **Add negative context**: "Not about [unrelated topic]"
- **Refine search queries**: Use more precise keywords

### Too Many Tokens in Results

- **Reduce `max_results`**: From 10 to 5 or 3
- **Reduce excerpt length**: Lower `max_chars_per_result`
- **Use `agentic` mode**: More concise excerpts
- **Use `fast` mode**: Minimal excerpts

---

## See Also

- [API Reference](api_reference.md) - Complete API parameter reference
- [Deep Research Guide](deep_research_guide.md) - For comprehensive research tasks
- [Extraction Patterns](extraction_patterns.md) - For reading specific URLs
- [Workflow Recipes](workflow_recipes.md) - Common multi-step patterns
