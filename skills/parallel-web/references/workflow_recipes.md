# Workflow Recipes

Common multi-step patterns combining Parallel's Search, Extract, and Deep Research APIs for scientific writing tasks.

---

## Recipe Index

| Recipe | APIs Used | Time | Use Case |
|--------|-----------|------|----------|
| [Section Research Pipeline](#recipe-1-section-research-pipeline) | Research + Search | 2-5 min | Writing a paper section |
| [Citation Verification](#recipe-2-citation-verification) | Search + Extract | 1-2 min | Verifying paper metadata |
| [Literature Survey](#recipe-3-literature-survey) | Research + Search + Extract | 5-15 min | Comprehensive lit review |
| [Market Intelligence Report](#recipe-4-market-intelligence-report) | Research (multi-stage) | 10-30 min | Market/industry analysis |
| [Competitive Analysis](#recipe-5-competitive-analysis) | Search + Extract + Research | 5-10 min | Comparing companies/products |
| [Fact-Check Pipeline](#recipe-6-fact-check-pipeline) | Search + Extract | 1-3 min | Verifying claims |
| [Current Events Briefing](#recipe-7-current-events-briefing) | Search + Research | 3-5 min | News synthesis |
| [Technical Documentation Gathering](#recipe-8-technical-documentation-gathering) | Search + Extract | 2-5 min | API/framework docs |
| [Grant Background Research](#recipe-9-grant-background-research) | Research + Search | 5-10 min | Grant proposal background |

---

## Recipe 1: Section Research Pipeline

**Goal:** Gather research and citations for writing a single section of a scientific paper.

**APIs:** Deep Research (pro-fast) + Search

```bash
# Step 1: Deep research for comprehensive background
python scripts/parallel_web.py research \
  "Recent advances in federated learning for healthcare AI, focusing on privacy-preserving training methods, real-world deployments, and regulatory considerations (2023-2025)" \
  --processor pro-fast -o sources/section_background.md

# Step 2: Targeted search for specific citations
python scripts/parallel_web.py search \
  "Find peer-reviewed papers on federated learning in hospitals" \
  --queries "federated learning clinical deployment" "privacy preserving ML healthcare" \
  --max-results 10 -o sources/section_citations.txt
```

**Python version:**
```python
from parallel_web import ParallelDeepResearch, ParallelSearch

researcher = ParallelDeepResearch()
searcher = ParallelSearch()

# Step 1: Deep background research
background = researcher.research(
    query="Recent advances in federated learning for healthcare AI (2023-2025): "
          "privacy-preserving methods, real-world deployments, regulatory landscape",
    processor="pro-fast",
    description="Structure as: (1) Key approaches, (2) Clinical deployments, "
                "(3) Regulatory considerations, (4) Open challenges. Include statistics."
)

# Step 2: Find specific papers to cite
papers = searcher.search(
    objective="Find recent peer-reviewed papers on federated learning deployed in hospital settings",
    search_queries=[
        "federated learning hospital clinical study 2024",
        "privacy preserving machine learning healthcare deployment"
    ],
    source_policy={"allow_domains": ["nature.com", "thelancet.com", "arxiv.org", "pubmed.ncbi.nlm.nih.gov"]},
)

# Combine: use background for writing, papers for citations
```

**When to use:** Before writing each major section of a research paper, literature review, or grant proposal.

---

## Recipe 2: Citation Verification

**Goal:** Verify that a citation is real and get complete metadata (DOI, volume, pages, year).

**APIs:** Search + Extract

```bash
# Option A: Search for the paper
python scripts/parallel_web.py search \
  "Vaswani et al 2017 Attention is All You Need paper NeurIPS" \
  --queries "Attention is All You Need DOI" --max-results 5

# Option B: Extract metadata from a DOI
python scripts/parallel_web.py extract \
  "https://doi.org/10.48550/arXiv.1706.03762" \
  --objective "Complete citation: authors, title, venue, year, pages, DOI"
```

**Python version:**
```python
from parallel_web import ParallelSearch, ParallelExtract

searcher = ParallelSearch()
extractor = ParallelExtract()

# Step 1: Find the paper
result = searcher.search(
    objective="Find the exact citation details for the Attention Is All You Need paper by Vaswani et al.",
    search_queries=["Attention is All You Need Vaswani 2017 NeurIPS DOI"],
    max_results=5,
)

# Step 2: Extract full metadata from the paper's page
paper_url = result["results"][0]["url"]
metadata = extractor.extract(
    urls=[paper_url],
    objective="Complete BibTeX citation: all authors, title, conference/journal, year, pages, DOI, volume",
)
```

**When to use:** After writing a section, verify every citation in references.bib has correct and complete metadata.

---

## Recipe 3: Literature Survey

**Goal:** Comprehensive survey of a research field, identifying key papers, themes, and gaps.

**APIs:** Deep Research + Search + Extract

```python
from parallel_web import ParallelDeepResearch, ParallelSearch, ParallelExtract

researcher = ParallelDeepResearch()
searcher = ParallelSearch()
extractor = ParallelExtract()

topic = "CRISPR-based diagnostics for infectious diseases"

# Stage 1: Broad research overview
overview = researcher.research(
    query=f"Comprehensive review of {topic}: key developments, clinical applications, "
          f"regulatory status, commercial products, and future directions (2020-2025)",
    processor="ultra-fast",
    description="Structure as a literature review: (1) Historical development, "
                "(2) Current technologies, (3) Clinical applications, "
                "(4) Regulatory landscape, (5) Commercial products, "
                "(6) Limitations and future directions. Include key statistics and milestones."
)

# Stage 2: Find specific landmark papers
key_papers = searcher.search(
    objective=f"Find the most cited and influential papers on {topic} from Nature, Science, Cell, NEJM",
    search_queries=[
        "CRISPR diagnostics SHERLOCK DETECTR Nature",
        "CRISPR point-of-care testing clinical study",
        "nucleic acid detection CRISPR review"
    ],
    source_policy={
        "allow_domains": ["nature.com", "science.org", "cell.com", "nejm.org", "thelancet.com"],
    },
    max_results=15,
)

# Stage 3: Extract detailed content from top 5 papers
top_urls = [r["url"] for r in key_papers["results"][:5]]
detailed = extractor.extract(
    urls=top_urls,
    objective="Study design, key results, sensitivity/specificity data, and clinical implications",
)
```

**When to use:** Starting a literature review, systematic review, or comprehensive background section.

---

## Recipe 4: Market Intelligence Report

**Goal:** Generate a comprehensive market research report on an industry or product category.

**APIs:** Deep Research (multi-stage)

```python
researcher = ParallelDeepResearch()

industry = "AI-powered drug discovery"

# Stage 1: Market overview (ultra-fast for maximum depth)
market_overview = researcher.research(
    query=f"Comprehensive market analysis of {industry}: market size, growth rate, "
          f"key segments, geographic distribution, and forecast through 2030",
    processor="ultra-fast",
    description="Include specific dollar figures, CAGR percentages, and data sources. "
                "Break down by segment and geography."
)

# Stage 2: Competitive landscape
competitors = researcher.research_structured(
    query=f"Top 10 companies in {industry}: revenue, funding, key products, partnerships, and market position",
    processor="pro-fast",
)

# Stage 3: Technology and innovation trends
tech_trends = researcher.research(
    query=f"Technology trends and innovation landscape in {industry}: "
          f"emerging approaches, breakthrough technologies, patent landscape, and R&D investment",
    processor="pro-fast",
    description="Focus on specific technologies, quantify R&D spending, and identify emerging leaders."
)

# Stage 4: Regulatory and risk analysis
regulatory = researcher.research(
    query=f"Regulatory landscape and risk factors for {industry}: "
          f"FDA guidance, EMA requirements, compliance challenges, and market risks",
    processor="pro-fast",
)
```

**When to use:** Creating market research reports, investor presentations, or strategic analysis documents.

---

## Recipe 5: Competitive Analysis

**Goal:** Compare multiple companies, products, or technologies side-by-side.

**APIs:** Search + Extract + Research

```python
searcher = ParallelSearch()
extractor = ParallelExtract()
researcher = ParallelDeepResearch()

companies = ["OpenAI", "Anthropic", "Google DeepMind"]

# Step 1: Search for recent data on each company
for company in companies:
    result = searcher.search(
        objective=f"Latest product launches, funding, team size, and strategy for {company} in 2025",
        search_queries=[f"{company} product launch 2025", f"{company} funding valuation"],
        source_policy={"after_date": "2024-06-01"},
    )

# Step 2: Extract from company pages
company_pages = [
    "https://openai.com/about",
    "https://anthropic.com/company",
    "https://deepmind.google/about/",
]
company_data = extractor.extract(
    urls=company_pages,
    objective="Mission, key products, team size, founding date, and recent milestones",
)

# Step 3: Deep research for synthesis
comparison = researcher.research(
    query=f"Detailed comparison of {', '.join(companies)}: "
          f"products, pricing, technology approach, market position, strengths, weaknesses",
    processor="pro-fast",
    description="Create a structured comparison covering: "
                "(1) Product portfolio, (2) Technology approach, (3) Pricing, "
                "(4) Market position, (5) Strengths/weaknesses, (6) Future outlook. "
                "Include a summary comparison table."
)
```

---

## Recipe 6: Fact-Check Pipeline

**Goal:** Verify specific claims or statistics before including in a document.

**APIs:** Search + Extract

```python
searcher = ParallelSearch()
extractor = ParallelExtract()

claim = "The global AI market is expected to reach $1.8 trillion by 2030"

# Step 1: Search for corroborating sources
result = searcher.search(
    objective=f"Verify this claim: '{claim}'. Find authoritative sources that confirm or contradict this figure.",
    search_queries=["global AI market size 2030 forecast", "artificial intelligence market projection trillion"],
    max_results=8,
)

# Step 2: Extract specific figures from top sources
source_urls = [r["url"] for r in result["results"][:3]]
details = extractor.extract(
    urls=source_urls,
    objective="Specific market size figures, forecast years, CAGR, and methodology of the projection",
)

# Analyze: Do multiple authoritative sources agree?
```

**When to use:** Before including any specific statistic, market figure, or factual claim in a paper or report.

---

## Recipe 7: Current Events Briefing

**Goal:** Get up-to-date synthesis of recent developments on a topic.

**APIs:** Search + Research

```python
searcher = ParallelSearch()
researcher = ParallelDeepResearch()

topic = "EU AI Act implementation"

# Step 1: Find the latest news
latest = searcher.search(
    objective=f"Latest news and developments on {topic} from the past month",
    search_queries=[f"{topic} 2025", f"{topic} latest updates"],
    source_policy={"after_date": "2025-01-15"},
    max_results=15,
)

# Step 2: Synthesize into a briefing
briefing = researcher.research(
    query=f"Summarize the latest developments in {topic} as of February 2025: "
          f"key milestones, compliance deadlines, industry reactions, and implications",
    processor="pro-fast",
    description="Write a concise 500-word executive briefing with timeline of key events."
)
```

---

## Recipe 8: Technical Documentation Gathering

**Goal:** Collect and synthesize technical documentation for a framework or API.

**APIs:** Search + Extract

```python
searcher = ParallelSearch()
extractor = ParallelExtract()

# Step 1: Find documentation pages
docs = searcher.search(
    objective="Find official PyTorch documentation for implementing custom attention mechanisms",
    search_queries=["PyTorch attention mechanism tutorial", "PyTorch MultiheadAttention documentation"],
    source_policy={"allow_domains": ["pytorch.org", "github.com/pytorch"]},
)

# Step 2: Extract full content from documentation pages
doc_urls = [r["url"] for r in docs["results"][:3]]
full_docs = extractor.extract(
    urls=doc_urls,
    objective="Complete API reference, parameters, usage examples, and code snippets",
    full_content=True,
)
```

---

## Recipe 9: Grant Background Research

**Goal:** Build a comprehensive background section for a grant proposal with verified statistics.

**APIs:** Deep Research + Search

```python
researcher = ParallelDeepResearch()
searcher = ParallelSearch()

research_area = "AI-guided antibiotic discovery to combat antimicrobial resistance"

# Step 1: Significance and burden of disease
significance = researcher.research(
    query=f"Burden of antimicrobial resistance: mortality statistics, economic impact, "
          f"WHO priority pathogens, and projections. Include specific numbers.",
    processor="pro-fast",
    description="Focus on statistics suitable for NIH Significance section: "
                "deaths per year, economic cost, resistance trends, and urgency."
)

# Step 2: Innovation landscape
innovation = researcher.research(
    query=f"Current approaches to {research_area}: successes (halicin, etc.), "
          f"limitations of current methods, and what makes our approach novel",
    processor="pro-fast",
    description="Focus on Innovation section: what has been tried, what gaps remain, "
                "and what new approaches are emerging."
)

# Step 3: Find specific papers for preliminary data context
papers = searcher.search(
    objective="Find landmark papers on AI-discovered antibiotics and ML approaches to drug discovery",
    search_queries=[
        "halicin AI antibiotic discovery Nature",
        "machine learning antibiotic resistance prediction",
        "deep learning drug discovery antibiotics"
    ],
    source_policy={"allow_domains": ["nature.com", "science.org", "cell.com", "pnas.org"]},
)
```

**When to use:** Writing Significance, Innovation, or Background sections for NIH, NSF, or other grant proposals.

---

## Combining with Other Skills

### With `research-lookup` (Academic Papers)

```python
# Use parallel-web for general research
researcher.research("Current state of quantum computing applications")

# Use research-lookup for academic paper search (auto-routes to Perplexity)
# python research_lookup.py "find papers on quantum error correction in Nature and Science"
```

### With `citation-management` (BibTeX)

```python
# Step 1: Find paper with parallel search
result = searcher.search(objective="Vaswani et al Attention Is All You Need paper")

# Step 2: Get DOI from results
doi = "10.48550/arXiv.1706.03762"

# Step 3: Convert to BibTeX with citation-management skill
# python scripts/doi_to_bibtex.py 10.48550/arXiv.1706.03762
```

### With `scientific-schematics` (Diagrams)

```python
# Step 1: Research a process
result = researcher.research("How does the CRISPR-Cas9 gene editing mechanism work step by step")

# Step 2: Use the research to inform a schematic
# python scripts/generate_schematic.py "CRISPR-Cas9 gene editing workflow: guide RNA design -> Cas9 binding -> DNA cleavage -> repair pathway" -o figures/crispr_mechanism.png
```

---

## Performance Cheat Sheet

| Task | Processor | Expected Time | Approximate Cost |
|------|-----------|---------------|------------------|
| Quick fact lookup | `base-fast` | 15-50s | $0.01 |
| Section background | `pro-fast` | 30s-5min | $0.10 |
| Comprehensive report | `ultra-fast` | 1-10min | $0.30 |
| Web search (10 results) | Search API | 1-3s | $0.005 |
| URL extraction (1 URL) | Extract API | 1-20s | $0.001 |
| URL extraction (5 URLs) | Extract API | 5-30s | $0.005 |

---

## See Also

- [API Reference](api_reference.md) - Complete API parameter reference
- [Search Best Practices](search_best_practices.md) - Effective search queries
- [Deep Research Guide](deep_research_guide.md) - Processor selection and output formats
- [Extraction Patterns](extraction_patterns.md) - URL content extraction
