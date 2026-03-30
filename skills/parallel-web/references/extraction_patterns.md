# Extraction Patterns

Guide to using Parallel's Extract API for converting web pages into clean, LLM-optimized content.

---

## Overview

The Extract API converts any public URL into clean markdown. It handles JavaScript-heavy pages, PDFs, and complex layouts that simple HTTP fetching cannot parse. Results are optimized for LLM consumption.

**Key capabilities:**
- JavaScript rendering (SPAs, dynamic content)
- PDF extraction to clean text
- Focused excerpts aligned to your objective
- Full page content extraction
- Multiple URL batch processing

---

## When to Use Extract vs Search

| Scenario | Use Extract | Use Search |
|----------|-------------|------------|
| You have a specific URL | Yes | No |
| You need content from a known page | Yes | No |
| You want to find pages about a topic | No | Yes |
| You need to read a research paper URL | Yes | No |
| You need to verify information on a specific site | Yes | No |
| You're looking for information broadly | No | Yes |
| You found URLs from a search and want full content | Yes | No |

**Rule of thumb:** If you have a URL, use Extract. If you need to find URLs, use Search.

---

## Excerpt Mode vs Full Content Mode

### Excerpt Mode (Default)

Returns focused content aligned to your objective. Smaller token footprint, higher relevance.

```python
extractor = ParallelExtract()

result = extractor.extract(
    urls=["https://arxiv.org/abs/2301.12345"],
    objective="Key methodology and experimental results",
    excerpts=True,     # Default
    full_content=False  # Default
)
```

**Best for:**
- Extracting specific information from long pages
- Token-efficient processing
- When you know what you're looking for
- Reading papers for specific claims or data points

### Full Content Mode

Returns the complete page content as clean markdown.

```python
result = extractor.extract(
    urls=["https://docs.example.com/api-reference"],
    objective="Complete API documentation",
    excerpts=False,
    full_content=True,
)
```

**Best for:**
- Complete documentation pages
- Full article text needed for analysis
- When you need every detail, not just excerpts
- Archiving or converting web content

### Both Modes

You can request both excerpts and full content:

```python
result = extractor.extract(
    urls=["https://example.com/report"],
    objective="Executive summary and key recommendations",
    excerpts=True,
    full_content=True,
)

# Use excerpts for focused analysis
# Use full_content for complete reference
```

---

## Objective Writing for Extraction

The `objective` parameter focuses extraction on relevant content. It dramatically improves excerpt quality.

### Good Objectives

```python
# Specific and actionable
objective="Extract the methodology section, including sample size, statistical methods, and primary endpoints"

# Clear about what you need
objective="Find the pricing information, feature comparison table, and enterprise plan details"

# Targeted for your task
objective="Key findings, effect sizes, confidence intervals, and author conclusions from this clinical trial"
```

### Poor Objectives

```python
# Too vague
objective="Tell me about this page"

# No objective at all (still works but excerpts are less focused)
extractor.extract(urls=["https://..."])
```

### Objective Templates by Use Case

**Academic Paper:**
```python
objective="Abstract, key findings, methodology (sample size, design, statistical tests), results with effect sizes and p-values, and main conclusions"
```

**Product/Company Page:**
```python
objective="Company overview, key products/services, pricing, founding date, leadership team, and recent announcements"
```

**Technical Documentation:**
```python
objective="API endpoints, authentication methods, request/response formats, rate limits, and code examples"
```

**News Article:**
```python
objective="Main story, key quotes, data points, timeline of events, and named sources"
```

**Government/Policy Document:**
```python
objective="Key policy provisions, effective dates, affected parties, compliance requirements, and penalties"
```

---

## Batch Extraction

Extract from multiple URLs in a single call:

```python
result = extractor.extract(
    urls=[
        "https://nature.com/articles/s12345",
        "https://science.org/doi/full/10.1234/science.xyz",
        "https://thelancet.com/journals/lancet/article/PIIS0140-6736(24)12345/fulltext"
    ],
    objective="Key findings, sample sizes, and statistical results from each study",
)

# Results are returned in the same order as input URLs
for r in result["results"]:
    print(f"=== {r['title']} ===")
    print(f"URL: {r['url']}")
    for excerpt in r["excerpts"]:
        print(excerpt[:500])
```

**Batch limits:**
- No hard limit on number of URLs per request
- Each URL counts as one extraction unit for billing
- Large batches may take longer to process
- Failed URLs are reported in the `errors` field without blocking successful ones

---

## Handling Different Content Types

### Web Pages (HTML)

Standard extraction. JavaScript is rendered, so SPAs and dynamic content work.

```python
# Standard web page
result = extractor.extract(
    urls=["https://example.com/article"],
    objective="Main article content",
)
```

### PDFs

PDFs are automatically detected and converted to text.

```python
# PDF extraction
result = extractor.extract(
    urls=["https://example.com/whitepaper.pdf"],
    objective="Executive summary and key recommendations",
)
```

### Documentation Sites

Single-page apps and documentation frameworks (Docusaurus, GitBook, ReadTheDocs) are fully rendered.

```python
result = extractor.extract(
    urls=["https://docs.example.com/getting-started"],
    objective="Installation instructions and quickstart guide",
    full_content=True,
)
```

---

## Common Extraction Patterns

### Pattern 1: Search Then Extract

Find relevant pages with Search, then extract full content from the best results.

```python
from parallel_web import ParallelSearch, ParallelExtract

searcher = ParallelSearch()
extractor = ParallelExtract()

# Step 1: Find relevant pages
search_result = searcher.search(
    objective="Find the original transformer paper and its key follow-up papers",
    search_queries=["attention is all you need paper", "transformer architecture paper"],
)

# Step 2: Extract detailed content from top results
top_urls = [r["url"] for r in search_result["results"][:3]]
extract_result = extractor.extract(
    urls=top_urls,
    objective="Abstract, architecture description, key results, and ablation studies",
)
```

### Pattern 2: DOI Resolution and Paper Reading

```python
# Extract content from a DOI URL
result = extractor.extract(
    urls=["https://doi.org/10.1038/s41586-024-07487-w"],
    objective="Study design, patient population, primary endpoints, efficacy results, and safety data",
)
```

### Pattern 3: Competitive Intelligence from Company Pages

```python
companies = [
    "https://openai.com/about",
    "https://anthropic.com/company",
    "https://deepmind.google/about/",
]

result = extractor.extract(
    urls=companies,
    objective="Company mission, team size, key products, recent announcements, and funding information",
)
```

### Pattern 4: Documentation Extraction for Reference

```python
result = extractor.extract(
    urls=["https://docs.parallel.ai/search/search-quickstart"],
    objective="Complete API usage guide including request format, response format, and code examples",
    full_content=True,
)
```

### Pattern 5: Metadata Verification

```python
# Verify citation metadata for a specific paper
result = extractor.extract(
    urls=["https://doi.org/10.1234/example-doi"],
    objective="Complete citation metadata: authors, title, journal, volume, pages, year, DOI",
)
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| URL not accessible | Page requires authentication, is behind paywall, or is down | Try a different URL or use Search instead |
| Timeout | Page takes too long to render | Retry or use a simpler URL |
| Empty content | Page is dynamically loaded in a way that can't be rendered | Try full_content mode or use Search |
| Rate limited | Too many requests | Wait and retry, or reduce batch size |

### Checking for Errors

```python
result = extractor.extract(urls=["https://example.com/page"])

if not result["success"]:
    print(f"Extraction failed: {result['error']}")
elif result.get("errors"):
    print(f"Some URLs failed: {result['errors']}")
else:
    print(f"Successfully extracted {len(result['results'])} pages")
```

---

## Tips and Best Practices

1. **Always provide an objective**: Even a general one improves excerpt quality significantly
2. **Use excerpts by default**: Full content is only needed when you truly need everything
3. **Batch related URLs**: One call with 5 URLs is better than 5 separate calls
4. **Check for errors**: Not all URLs are extractable (paywalls, auth, etc.)
5. **Combine with Search**: Search finds URLs, Extract reads them in detail
6. **Use for DOI resolution**: Extract handles DOI redirects automatically
7. **Prefer Extract over manual fetching**: Handles JavaScript, PDFs, and complex layouts

---

## See Also

- [API Reference](api_reference.md) - Complete API parameter reference
- [Search Best Practices](search_best_practices.md) - For finding URLs to extract
- [Deep Research Guide](deep_research_guide.md) - For comprehensive research tasks
- [Workflow Recipes](workflow_recipes.md) - Common multi-step patterns
