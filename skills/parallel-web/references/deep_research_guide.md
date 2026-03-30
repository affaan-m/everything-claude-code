# Deep Research Guide

Comprehensive guide to using Parallel's Task API for deep research, including processor selection, output formats, structured schemas, and advanced patterns.

---

## Overview

Deep Research transforms natural language research queries into comprehensive intelligence reports. Unlike simple search, it performs multi-step web exploration across authoritative sources and synthesizes findings with inline citations and confidence levels.

**Key characteristics:**
- Multi-step, multi-source research
- Automatic citation and source attribution
- Structured or text output formats
- Asynchronous processing (30 seconds to 25+ minutes)
- Research basis with confidence levels per finding

---

## Processor Selection

Choosing the right processor is the most important decision. It determines research depth, speed, and cost.

### Decision Matrix

| Scenario | Recommended Processor | Why |
|----------|----------------------|-----|
| Quick background for a paper section | `pro-fast` | Fast, good depth, low cost |
| Comprehensive market research report | `ultra-fast` | Deep multi-source synthesis |
| Simple fact lookup or metadata | `base-fast` | Fast, low cost |
| Competitive landscape analysis | `pro-fast` | Good balance of depth and speed |
| Background for grant proposal | `pro-fast` | Thorough but timely |
| State-of-the-art review for a topic | `ultra-fast` | Maximum source coverage |
| Quick question during writing | `core-fast` | Sub-2-minute response |
| Breaking news or very recent events | `pro` (standard) | Freshest data prioritized |
| Large-scale data enrichment | `base-fast` | Cost-effective at scale |

### Processor Tiers Explained

**`pro-fast`** (default, recommended for most tasks):
- Latency: 30 seconds to 5 minutes
- Depth: Explores 10-20+ web sources
- Best for: Section-level research, background gathering, comparative analysis
- Cost: $0.10 per query

**`ultra-fast`** (for comprehensive research):
- Latency: 1 to 10 minutes
- Depth: Explores 20-50+ web sources, multiple reasoning steps
- Best for: Full reports, market analysis, complex multi-faceted questions
- Cost: $0.30 per query

**`core-fast`** (quick cross-referenced answers):
- Latency: 15 seconds to 100 seconds
- Depth: Cross-references 5-10 sources
- Best for: Moderate complexity questions, verification tasks
- Cost: $0.025 per query

**`base-fast`** (simple enrichment):
- Latency: 15 to 50 seconds
- Depth: Standard web lookup, 3-5 sources
- Best for: Simple factual queries, metadata enrichment
- Cost: $0.01 per query

### Standard vs Fast

- **Fast processors** (`-fast`): 2-5x faster, very fresh data, ideal for interactive use
- **Standard processors** (no suffix): Highest data freshness, better for background jobs

**Rule of thumb:** Always use `-fast` variants unless you specifically need the freshest possible data (breaking news, live financial data, real-time events).

---

## Output Formats

### Text Mode (Markdown Reports)

Returns a comprehensive markdown report with inline citations. Best for human consumption and document integration.

```python
researcher = ParallelDeepResearch()

result = researcher.research(
    query="Comprehensive analysis of mRNA vaccine technology platforms and their applications beyond COVID-19",
    processor="pro-fast",
    description="Focus on clinical trials, approved applications, pipeline developments, and key companies. Include market size data."
)

# result["output"] contains a full markdown report
# result["citations"] contains source URLs with excerpts
```

**When to use text mode:**
- Writing scientific documents (papers, reviews, reports)
- Background research for a topic
- Creating summaries for human readers
- When you need flowing prose, not structured data

**Guiding text output with `description`:**

The `description` parameter steers the report content:

```python
# Focus on specific aspects
result = researcher.research(
    query="Electric vehicle battery technology landscape",
    description="Focus on: (1) solid-state battery progress, (2) charging speed improvements, (3) cost per kWh trends, (4) key patents and IP. Format as a structured report with clear sections."
)

# Control length and depth
result = researcher.research(
    query="AI in drug discovery",
    description="Provide a concise 500-word executive summary covering key applications, notable successes, leading companies, and market projections."
)
```

### Auto-Schema Mode (Structured JSON)

Lets the processor determine the best output structure automatically. Returns structured JSON with per-field citations.

```python
result = researcher.research_structured(
    query="Top 5 cloud computing companies: revenue, market share, key products, and recent developments",
    processor="pro-fast",
)

# result["content"] contains structured data (dict)
# result["basis"] contains per-field citations with confidence
```

**When to use auto-schema:**
- Data extraction and enrichment
- Comparative analysis with specific fields
- When you need programmatic access to individual data points
- Integration with databases or spreadsheets

### Custom JSON Schema

Define exactly what fields you want returned:

```python
schema = {
    "type": "object",
    "properties": {
        "market_size_2024": {
            "type": "string",
            "description": "Global market size in USD billions for 2024. Include source."
        },
        "growth_rate": {
            "type": "string",
            "description": "CAGR percentage for 2024-2030 forecast period."
        },
        "top_companies": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Company name"},
                    "market_share": {"type": "string", "description": "Approximate market share percentage"},
                    "revenue": {"type": "string", "description": "Most recent annual revenue"}
                },
                "required": ["name", "market_share", "revenue"]
            },
            "description": "Top 5 companies by market share"
        },
        "key_trends": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Top 3-5 industry trends driving growth"
        }
    },
    "required": ["market_size_2024", "growth_rate", "top_companies", "key_trends"],
    "additionalProperties": False
}

result = researcher.research_structured(
    query="Global cybersecurity market analysis",
    output_schema=schema,
)
```

---

## Writing Effective Research Queries

### Query Construction Framework

Structure your query as: **[Topic] + [Specific Aspect] + [Scope/Time] + [Output Expectations]**

**Good queries:**
```
"Comprehensive analysis of the global lithium-ion battery recycling market,
including market size, key players, regulatory drivers, and technology
approaches. Focus on 2023-2025 developments."

"Compare the efficacy, safety profiles, and cost-effectiveness of GLP-1
receptor agonists (semaglutide, tirzepatide, liraglutide) for type 2
diabetes management based on recent clinical trial data."

"Survey of federated learning approaches for healthcare AI, covering
privacy-preserving techniques, real-world deployments, regulatory
compliance, and performance benchmarks from 2023-2025 publications."
```

**Poor queries:**
```
"Tell me about batteries"          # Too vague
"AI"                                # No specific aspect
"What's new?"                       # No topic at all
"Everything about quantum computing from all time"  # Too broad
```

### Tips for Better Results

1. **Be specific about what you need**: "market size" vs "tell me about the market"
2. **Include time bounds**: "2024-2025" narrows to relevant data
3. **Name entities**: "semaglutide vs tirzepatide" vs "diabetes drugs"
4. **Specify output expectations**: "Include statistics, key players, and growth projections"
5. **Keep under 15,000 characters**: Concise queries work better than massive prompts

---

## Working with Research Basis

Every deep research result includes a **basis** -- citations, reasoning, and confidence levels for each finding.

### Text Mode Basis

```python
result = researcher.research(query="...", processor="pro-fast")

# Citations are deduplicated and include URLs + excerpts
for citation in result["citations"]:
    print(f"Source: {citation['title']}")
    print(f"URL: {citation['url']}")
    if citation.get("excerpts"):
        print(f"Excerpt: {citation['excerpts'][0][:200]}")
```

### Structured Mode Basis

```python
result = researcher.research_structured(query="...", processor="pro-fast")

for basis_entry in result["basis"]:
    print(f"Field: {basis_entry['field']}")
    print(f"Confidence: {basis_entry['confidence']}")
    print(f"Reasoning: {basis_entry['reasoning']}")
    for cit in basis_entry["citations"]:
        print(f"  Source: {cit['url']}")
```

### Confidence Levels

| Level | Meaning | Action |
|-------|---------|--------|
| `high` | Multiple authoritative sources agree | Use directly |
| `medium` | Some supporting evidence, minor uncertainty | Use with caveat |
| `low` | Limited evidence, significant uncertainty | Verify independently |

---

## Advanced Patterns

### Multi-Stage Research

Use different processors in sequence for progressively deeper research:

```python
# Stage 1: Quick overview with base-fast
overview = researcher.research(
    query="What are the main approaches to quantum error correction?",
    processor="base-fast",
)

# Stage 2: Deep dive on the most promising approach
deep_dive = researcher.research(
    query=f"Detailed analysis of surface code quantum error correction: "
          f"recent breakthroughs, implementation challenges, and leading research groups. "
          f"Context: {overview['output'][:500]}",
    processor="pro-fast",
)
```

### Comparative Research

```python
result = researcher.research(
    query="Compare and contrast three leading large language model architectures: "
          "GPT-4, Claude, and Gemini. Cover architecture differences, benchmark performance, "
          "pricing, context window, and unique capabilities. Include specific benchmark scores.",
    processor="pro-fast",
    description="Create a structured comparison with a summary table. Include specific numbers and benchmarks."
)
```

### Research with Follow-Up Extraction

```python
# Step 1: Research to find relevant sources
research_result = researcher.research(
    query="Most influential papers on attention mechanisms in 2024",
    processor="pro-fast",
)

# Step 2: Extract full content from the most relevant sources
from parallel_web import ParallelExtract
extractor = ParallelExtract()

key_urls = [c["url"] for c in research_result["citations"][:5]]
for url in key_urls:
    extracted = extractor.extract(
        urls=[url],
        objective="Key methodology, results, and conclusions",
    )
```

---

## Performance Optimization

### Reducing Latency

1. **Use `-fast` processors**: 2-5x faster than standard
2. **Use `core-fast` for moderate queries**: Sub-2-minute for most questions
3. **Be specific in queries**: Vague queries require more exploration
4. **Set appropriate timeouts**: Don't over-wait

### Reducing Cost

1. **Start with `base-fast`**: Upgrade only if depth is insufficient
2. **Use `core-fast` for moderate complexity**: $0.025 vs $0.10 for pro
3. **Batch related queries**: One well-crafted query > multiple simple ones
4. **Cache results**: Store research output for reuse across sections

### Maximizing Quality

1. **Use `pro-fast` or `ultra-fast`**: More sources = better synthesis
2. **Provide context**: "I'm writing a paper for Nature Medicine about..."
3. **Use `description` parameter**: Guide the output structure and focus
4. **Verify critical findings**: Cross-check with Search API or Extract

---

## Common Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Query too vague | Scattered, unfocused results | Add specific aspects and time bounds |
| Query too long (>15K chars) | API rejection or degraded results | Summarize context, focus on key question |
| Wrong processor | Too slow or too shallow | Use decision matrix above |
| Not using `description` | Report structure not aligned with needs | Add description to guide output |
| Ignoring confidence levels | Using low-confidence data as fact | Check basis confidence before citing |
| Not verifying citations | Risk of outdated or misattributed data | Cross-check key citations with Extract |

---

## See Also

- [API Reference](api_reference.md) - Complete API parameter reference
- [Search Best Practices](search_best_practices.md) - For quick web searches
- [Extraction Patterns](extraction_patterns.md) - For reading specific URLs
- [Workflow Recipes](workflow_recipes.md) - Common multi-step patterns
