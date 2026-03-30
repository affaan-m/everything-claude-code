---
name: arxiv-database
description: Search and retrieve preprints from arXiv via the Atom API. Use this skill when searching for papers in physics, mathematics, computer science, quantitative biology, quantitative finance, statistics, electrical engineering, or economics by keywords, authors, arXiv IDs, date ranges, or categories.
license: MIT
metadata:
    skill-author: Orchestra Research
---

# arXiv Database

## Overview

This skill provides Python tools for searching and retrieving preprints from arXiv.org via its public Atom API. It supports keyword search, author search, category filtering, arXiv ID lookup, and PDF download. Results are returned as structured JSON with titles, abstracts, authors, categories, and links.

## When to Use This Skill

Use this skill when:
- Searching for preprints in CS, ML, AI, physics, math, statistics, q-bio, q-fin, or economics
- Looking up specific papers by arXiv ID (e.g., `2309.10668`)
- Tracking an author's recent preprints
- Filtering papers by arXiv category (e.g., `cs.LG`, `cs.CL`, `stat.ML`)
- Downloading PDFs for full-text analysis
- Building literature review datasets for AI/ML research
- Monitoring new submissions in a subfield

Consider alternatives when:
- Searching for biomedical literature specifically -> Use **pubmed-database** or **biorxiv-database**
- You need citation counts or impact metrics -> Use **openalex-database**
- You need peer-reviewed journal articles only -> Use **pubmed-database**

## Core Search Capabilities

### 1. Keyword Search

Search for papers by keywords in titles, abstracts, or all fields.

```bash
python scripts/arxiv_search.py \
  --keywords "sparse autoencoders" "mechanistic interpretability" \
  --max-results 20 \
  --output results.json
```

With category filter:
```bash
python scripts/arxiv_search.py \
  --keywords "transformer" "attention mechanism" \
  --category cs.LG \
  --max-results 50 \
  --output transformer_papers.json
```

Search specific fields:
```bash
# Title only
python scripts/arxiv_search.py \
  --keywords "GRPO" \
  --search-field ti \
  --max-results 10

# Abstract only
python scripts/arxiv_search.py \
  --keywords "reward model" "RLHF" \
  --search-field abs \
  --max-results 30
```

### 2. Author Search

```bash
python scripts/arxiv_search.py \
  --author "Anthropic" \
  --max-results 50 \
  --output anthropic_papers.json
```

```bash
python scripts/arxiv_search.py \
  --author "Ilya Sutskever" \
  --category cs.LG \
  --max-results 20
```

### 3. arXiv ID Lookup

Retrieve metadata for specific papers:

```bash
python scripts/arxiv_search.py \
  --ids 2309.10668 2406.04093 2310.01405 \
  --output sae_papers.json
```

Full arXiv URLs also accepted:
```bash
python scripts/arxiv_search.py \
  --ids "https://arxiv.org/abs/2309.10668"
```

### 4. Category Browsing

List recent papers in a category:
```bash
python scripts/arxiv_search.py \
  --category cs.AI \
  --max-results 100 \
  --sort-by submittedDate \
  --output recent_cs_ai.json
```

### 5. PDF Download

```bash
python scripts/arxiv_search.py \
  --ids 2309.10668 \
  --download-pdf papers/
```

Batch download from search results:
```python
import json
from scripts.arxiv_search import ArxivSearcher

searcher = ArxivSearcher()

# Search first
results = searcher.search(query="ti:sparse autoencoder", max_results=5)

# Download all
for paper in results:
    arxiv_id = paper["arxiv_id"]
    searcher.download_pdf(arxiv_id, f"papers/{arxiv_id.replace('/', '_')}.pdf")
```

## arXiv Categories

### Computer Science (cs.*)
| Category | Description |
|----------|-------------|
| `cs.AI` | Artificial Intelligence |
| `cs.CL` | Computation and Language (NLP) |
| `cs.CV` | Computer Vision |
| `cs.LG` | Machine Learning |
| `cs.NE` | Neural and Evolutionary Computing |
| `cs.RO` | Robotics |
| `cs.CR` | Cryptography and Security |
| `cs.DS` | Data Structures and Algorithms |
| `cs.IR` | Information Retrieval |
| `cs.SE` | Software Engineering |

### Statistics & Math
| Category | Description |
|----------|-------------|
| `stat.ML` | Machine Learning (Statistics) |
| `stat.ME` | Methodology |
| `math.OC` | Optimization and Control |
| `math.ST` | Statistics Theory |

### Other Relevant Categories
| Category | Description |
|----------|-------------|
| `q-bio.BM` | Biomolecules |
| `q-bio.GN` | Genomics |
| `q-bio.QM` | Quantitative Methods |
| `q-fin.ST` | Statistical Finance |
| `eess.SP` | Signal Processing |
| `physics.comp-ph` | Computational Physics |

Full list: see [references/api_reference.md](references/api_reference.md).

## Query Syntax

The arXiv API uses prefix-based field searches combined with Boolean operators.

**Field prefixes:**
- `ti:` - Title
- `au:` - Author
- `abs:` - Abstract
- `cat:` - Category
- `all:` - All fields (default)
- `co:` - Comment
- `jr:` - Journal reference
- `id:` - arXiv ID

**Boolean operators** (must be UPPERCASE):
```
ti:transformer AND abs:attention
au:bengio OR au:lecun
cat:cs.LG ANDNOT cat:cs.CV
```

**Grouping with parentheses:**
```
(ti:sparse AND ti:autoencoder) AND cat:cs.LG
au:anthropic AND (abs:interpretability OR abs:alignment)
```

**Examples:**
```python
from scripts.arxiv_search import ArxivSearcher

searcher = ArxivSearcher()

# Papers about SAEs in ML
results = searcher.search(
    query="ti:sparse autoencoder AND cat:cs.LG",
    max_results=50,
    sort_by="submittedDate"
)

# Specific author in specific field
results = searcher.search(
    query="au:neel nanda AND cat:cs.LG",
    max_results=20
)

# Complex boolean query
results = searcher.search(
    query="(abs:RLHF OR abs:reinforcement learning from human feedback) AND cat:cs.CL",
    max_results=100
)
```

## Output Format

All searches return structured JSON:

```json
{
  "query": "ti:sparse autoencoder AND cat:cs.LG",
  "result_count": 15,
  "results": [
    {
      "arxiv_id": "2309.10668",
      "title": "Towards Monosemanticity: Decomposing Language Models With Dictionary Learning",
      "authors": ["Trenton Bricken", "Adly Templeton", "..."],
      "abstract": "Full abstract text...",
      "categories": ["cs.LG", "cs.AI"],
      "primary_category": "cs.LG",
      "published": "2023-09-19T17:58:00Z",
      "updated": "2023-10-04T14:22:00Z",
      "doi": "10.48550/arXiv.2309.10668",
      "pdf_url": "http://arxiv.org/pdf/2309.10668v1",
      "abs_url": "http://arxiv.org/abs/2309.10668v1",
      "comment": "42 pages, 30 figures",
      "journal_ref": ""
    }
  ]
}
```

## Common Usage Patterns

### Literature Review Workflow

```python
from scripts.arxiv_search import ArxivSearcher
import json

searcher = ArxivSearcher()

# 1. Broad search
results = searcher.search(
    query="abs:mechanistic interpretability AND cat:cs.LG",
    max_results=200,
    sort_by="submittedDate"
)

# 2. Save results
with open("interp_papers.json", "w") as f:
    json.dump({"result_count": len(results), "results": results}, f, indent=2)

# 3. Filter and analyze
import pandas as pd
df = pd.DataFrame(results)
print(f"Total papers: {len(df)}")
print(f"Date range: {df['published'].min()} to {df['published'].max()}")
print(f"\nTop categories:")
print(df["primary_category"].value_counts().head(10))
```

### Track a Research Group

```python
searcher = ArxivSearcher()

groups = {
    "anthropic": "au:anthropic AND (cat:cs.LG OR cat:cs.CL)",
    "openai": "au:openai AND cat:cs.CL",
    "deepmind": "au:deepmind AND cat:cs.LG",
}

for name, query in groups.items():
    results = searcher.search(query=query, max_results=50, sort_by="submittedDate")
    print(f"{name}: {len(results)} recent papers")
```

### Monitor New Submissions

```python
searcher = ArxivSearcher()

# Most recent ML papers
results = searcher.search(
    query="cat:cs.LG",
    max_results=50,
    sort_by="submittedDate",
    sort_order="descending"
)

for paper in results[:10]:
    print(f"[{paper['published'][:10]}] {paper['title']}")
    print(f"  {paper['abs_url']}\n")
```

## Python API

```python
from scripts.arxiv_search import ArxivSearcher

searcher = ArxivSearcher(verbose=True)

# Free-form query (uses arXiv query syntax)
results = searcher.search(query="...", max_results=50)

# Lookup by ID
papers = searcher.get_by_ids(["2309.10668", "2406.04093"])

# Download PDF
searcher.download_pdf("2309.10668", "paper.pdf")

# Build query from components
query = ArxivSearcher.build_query(
    title="sparse autoencoder",
    author="anthropic",
    category="cs.LG"
)
results = searcher.search(query=query, max_results=20)
```

## Best Practices

1. **Respect rate limits**: The API requests 3-second delays between calls. The script handles this automatically.
2. **Use category filters**: Dramatically reduces noise. `cs.LG` is where most ML papers live.
3. **Cache results**: Save to JSON to avoid re-fetching.
4. **Use `sort_by=submittedDate`** for recent papers, `relevance` for keyword searches.
5. **Max 300 results per query**: arXiv API caps at this. For larger sets, paginate with `start` parameter.
6. **arXiv IDs**: Use bare IDs (`2309.10668`), not full URLs, in programmatic code.
7. **Combine with openalex-database**: For citation counts and impact metrics arXiv doesn't provide.

## Limitations

- **No full-text search**: Only searches metadata (title, abstract, authors, comments)
- **No citation data**: Use openalex-database or Semantic Scholar for citations
- **Max 300 results**: Per query. Use pagination for larger sets.
- **Rate limited**: ~1 request per 3 seconds recommended
- **Atom XML responses**: The script parses these into JSON automatically
- **Search lag**: New papers may take hours to appear in API results

## Reference Documentation

- **API Reference**: See [references/api_reference.md](references/api_reference.md) for full endpoint specs, all categories, and response schemas
