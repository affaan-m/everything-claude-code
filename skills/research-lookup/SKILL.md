---
name: research-lookup
description: Look up current research information using the Parallel Chat API (primary) or Perplexity sonar-pro-search (academic paper searches). Automatically routes queries to the best backend. Use for finding papers, gathering research data, and verifying scientific information.
allowed-tools: Read Write Edit Bash
license: MIT license
compatibility: PARALLEL_API_KEY and OPENROUTER_API_KEY required
metadata:
    skill-author: K-Dense Inc.
---

# Research Information Lookup

## Overview

This skill provides real-time research information lookup with **intelligent backend routing**:

- **Parallel Chat API** (`core` model): Default backend for all general research queries. Provides comprehensive, multi-source research reports with inline citations via the OpenAI-compatible Chat API at `https://api.parallel.ai`.
- **Perplexity sonar-pro-search** (via OpenRouter): Used only for academic-specific paper searches where scholarly database access is critical.

The skill automatically detects query type and routes to the optimal backend.

## When to Use This Skill

Use this skill when you need:

- **Current Research Information**: Latest studies, papers, and findings
- **Literature Verification**: Check facts, statistics, or claims against current research
- **Background Research**: Gather context and supporting evidence for scientific writing
- **Citation Sources**: Find relevant papers and studies to cite
- **Technical Documentation**: Look up specifications, protocols, or methodologies
- **Market/Industry Data**: Current statistics, trends, competitive intelligence
- **Recent Developments**: Emerging trends, breakthroughs, announcements

## Visual Enhancement with Scientific Schematics

**When creating documents with this skill, always consider adding scientific diagrams and schematics to enhance visual communication.**

If your document does not already contain schematics or diagrams:
- Use the **scientific-schematics** skill to generate AI-powered publication-quality diagrams
- Simply describe your desired diagram in natural language

```bash
python scripts/generate_schematic.py "your diagram description" -o figures/output.png
```

---

## Automatic Backend Selection

The skill automatically routes queries to the best backend based on content:

### Routing Logic

```
Query arrives
    |
    +-- Contains academic keywords? (papers, DOI, journal, peer-reviewed, etc.)
    |       YES --> Perplexity sonar-pro-search (academic search mode)
    |
    +-- Everything else (general research, market data, technical info, analysis)
            --> Parallel Chat API (core model)
```

### Academic Keywords (Routes to Perplexity)

Queries containing these terms are routed to Perplexity for academic-focused search:

- Paper finding: `find papers`, `find articles`, `research papers on`, `published studies`
- Citations: `cite`, `citation`, `doi`, `pubmed`, `pmid`
- Academic sources: `peer-reviewed`, `journal article`, `scholarly`, `arxiv`, `preprint`
- Review types: `systematic review`, `meta-analysis`, `literature search`
- Paper quality: `foundational papers`, `seminal papers`, `landmark papers`, `highly cited`

### Everything Else (Routes to Parallel)

All other queries go to the Parallel Chat API (core model), including:

- General research questions
- Market and industry analysis
- Technical information and documentation
- Current events and recent developments
- Comparative analysis
- Statistical data retrieval
- Complex analytical queries

### Manual Override

You can force a specific backend:

```bash
# Force Parallel Deep Research
python research_lookup.py "your query" --force-backend parallel

# Force Perplexity academic search
python research_lookup.py "your query" --force-backend perplexity
```

---

## Core Capabilities

### 1. General Research Queries (Parallel Chat API)

**Default backend.** Provides comprehensive, multi-source research with citations via the Chat API (`core` model).

```
Query Examples:
- "Recent advances in CRISPR gene editing 2025"
- "Compare mRNA vaccines vs traditional vaccines for cancer treatment"
- "AI adoption in healthcare industry statistics"
- "Global renewable energy market trends and projections"
- "Explain the mechanism underlying gut microbiome and depression"
```

**Response includes:**
- Comprehensive research report in markdown
- Inline citations from authoritative web sources
- Structured sections with key findings
- Multiple perspectives and data points
- Source URLs for verification

### 2. Academic Paper Search (Perplexity sonar-pro-search)

**Used for academic-specific queries.** Prioritizes scholarly databases and peer-reviewed sources.

```
Query Examples:
- "Find papers on transformer attention mechanisms in NeurIPS 2024"
- "Foundational papers on quantum error correction"
- "Systematic review of immunotherapy in non-small cell lung cancer"
- "Cite the original BERT paper and its most influential follow-ups"
- "Published studies on CRISPR off-target effects in clinical trials"
```

**Response includes:**
- Summary of key findings from academic literature
- 5-8 high-quality citations with authors, titles, journals, years, DOIs
- Citation counts and venue tier indicators
- Key statistics and methodology highlights
- Research gaps and future directions

### 3. Technical and Methodological Information

```
Query Examples:
- "Western blot protocol for protein detection"
- "Statistical power analysis for clinical trials"
- "Machine learning model evaluation metrics comparison"
```

### 4. Statistical and Market Data

```
Query Examples:
- "Prevalence of diabetes in US population 2025"
- "Global AI market size and growth projections"
- "COVID-19 vaccination rates by country"
```

---

## Paper Quality and Popularity Prioritization

**CRITICAL**: When searching for papers, ALWAYS prioritize high-quality, influential papers.

### Citation-Based Ranking

| Paper Age | Citation Threshold | Classification |
|-----------|-------------------|----------------|
| 0-3 years | 20+ citations | Noteworthy |
| 0-3 years | 100+ citations | Highly Influential |
| 3-7 years | 100+ citations | Significant |
| 3-7 years | 500+ citations | Landmark Paper |
| 7+ years | 500+ citations | Seminal Work |
| 7+ years | 1000+ citations | Foundational |

### Venue Quality Tiers

**Tier 1 - Premier Venues** (Always prefer):
- **General Science**: Nature, Science, Cell, PNAS
- **Medicine**: NEJM, Lancet, JAMA, BMJ
- **Field-Specific**: Nature Medicine, Nature Biotechnology, Nature Methods
- **Top CS/AI**: NeurIPS, ICML, ICLR, ACL, CVPR

**Tier 2 - High-Impact Specialized** (Strong preference):
- Journals with Impact Factor > 10
- Top conferences in subfields (EMNLP, NAACL, ECCV, MICCAI)

**Tier 3 - Respected Specialized** (Include when relevant):
- Journals with Impact Factor 5-10

---

## Technical Integration

### Environment Variables

```bash
# Primary backend (Parallel Chat API) - REQUIRED
export PARALLEL_API_KEY="your_parallel_api_key"

# Academic search backend (Perplexity) - REQUIRED for academic queries
export OPENROUTER_API_KEY="your_openrouter_api_key"
```

### API Specifications

**Parallel Chat API:**
- Endpoint: `https://api.parallel.ai` (OpenAI SDK compatible)
- Model: `core` (60s-5min latency, complex multi-source synthesis)
- Output: Markdown text with inline citations
- Citations: Research basis with URLs, reasoning, and confidence levels
- Rate limits: 300 req/min
- Python package: `openai`

**Perplexity sonar-pro-search:**
- Model: `perplexity/sonar-pro-search` (via OpenRouter)
- Search mode: Academic (prioritizes peer-reviewed sources)
- Search context: High (comprehensive research)
- Response time: 5-15 seconds

### Command-Line Usage

```bash
# Auto-routed research (recommended) — ALWAYS save to sources/
python research_lookup.py "your query" -o sources/research_YYYYMMDD_HHMMSS_<topic>.md

# Force specific backend — ALWAYS save to sources/
python research_lookup.py "your query" --force-backend parallel -o sources/research_<topic>.md
python research_lookup.py "your query" --force-backend perplexity -o sources/papers_<topic>.md

# JSON output — ALWAYS save to sources/
python research_lookup.py "your query" --json -o sources/research_<topic>.json

# Batch queries — ALWAYS save to sources/
python research_lookup.py --batch "query 1" "query 2" "query 3" -o sources/batch_research_<topic>.md
```

---

## MANDATORY: Save All Results to Sources Folder

**Every research-lookup result MUST be saved to the project's `sources/` folder.**

This is non-negotiable. Research results are expensive to obtain and critical for reproducibility.

### Saving Rules

| Backend | `-o` Flag Target | Filename Pattern |
|---------|-----------------|------------------|
| Parallel Deep Research | `sources/research_<topic>.md` | `research_YYYYMMDD_HHMMSS_<brief_topic>.md` |
| Perplexity (academic) | `sources/papers_<topic>.md` | `papers_YYYYMMDD_HHMMSS_<brief_topic>.md` |
| Batch queries | `sources/batch_<topic>.md` | `batch_research_YYYYMMDD_HHMMSS_<brief_topic>.md` |

### How to Save

**CRITICAL: Every call to `research_lookup.py` MUST include the `-o` flag pointing to the `sources/` folder.**

**CRITICAL: Saved files MUST preserve all citations, source URLs, and DOIs.** The default text output automatically includes a `Sources` section (with title, date, URL for each source) and an `Additional References` section (with DOIs and academic URLs extracted from the response text). For maximum citation metadata, use `--json`.

```bash
# General research — save to sources/ (includes Sources + Additional References sections)
python research_lookup.py "Recent advances in CRISPR gene editing 2025" \
  -o sources/research_20250217_143000_crispr_advances.md

# Academic paper search — save to sources/ (includes paper citations with DOIs)
python research_lookup.py "Find papers on transformer attention mechanisms in NeurIPS 2024" \
  -o sources/papers_20250217_143500_transformer_attention.md

# JSON format for maximum citation metadata (full citation objects with URLs, DOIs, snippets)
python research_lookup.py "CRISPR clinical trials" --json \
  -o sources/research_20250217_143000_crispr_trials.json

# Forced backend — save to sources/
python research_lookup.py "AI regulation landscape" --force-backend parallel \
  -o sources/research_20250217_144000_ai_regulation.md

# Batch queries — save to sources/
python research_lookup.py --batch "mRNA vaccines efficacy" "mRNA vaccines safety" \
  -o sources/batch_research_20250217_144500_mrna_vaccines.md
```

### Citation Preservation in Saved Files

Each output format preserves citations differently:

| Format | Citations Included | When to Use |
|--------|-------------------|-------------|
| Text (default) | `Sources (N):` section with `[title] (date) + URL` + `Additional References (N):` with DOIs and academic URLs | Standard use — human-readable with all citations |
| JSON (`--json`) | Full citation objects: `url`, `title`, `date`, `snippet`, `doi`, `type` | When you need maximum citation metadata |

**For Parallel backend**, saved files include: research report + Sources list (title, URL) + Additional References (DOIs, academic URLs).
**For Perplexity backend**, saved files include: academic summary + Sources list (title, date, URL, snippet) + Additional References (DOIs, academic URLs).

**Use `--json` when you need to:**
- Parse citation metadata programmatically
- Preserve full DOI and URL data for BibTeX generation
- Maintain the structured citation objects for cross-referencing

### Why Save Everything

1. **Reproducibility**: Every citation and claim can be traced back to its raw research source
2. **Context Window Recovery**: If context is compacted, saved results can be re-read without re-querying
3. **Audit Trail**: The `sources/` folder documents exactly how all research information was gathered
4. **Reuse Across Sections**: Multiple sections can reference the same saved research without duplicate queries
5. **Cost Efficiency**: Check `sources/` for existing results before making new API calls
6. **Peer Review Support**: Reviewers can verify the research backing every citation

### Before Making a New Query, Check Sources First

Before calling `research_lookup.py`, check if a relevant result already exists:

```bash
ls sources/  # Check existing saved results
```

If a prior lookup covers the same topic, re-read the saved file instead of making a new API call.

### Logging

When saving research results, always log:

```
[HH:MM:SS] SAVED: Research lookup to sources/research_20250217_143000_crispr_advances.md (3,800 words, 8 citations)
[HH:MM:SS] SAVED: Paper search to sources/papers_20250217_143500_transformer_attention.md (6 papers found)
```

---

## Integration with Scientific Writing

This skill enhances scientific writing by providing:

1. **Literature Review Support**: Gather current research for introduction and discussion — **save to `sources/`**
2. **Methods Validation**: Verify protocols against current standards — **save to `sources/`**
3. **Results Contextualization**: Compare findings with recent similar studies — **save to `sources/`**
4. **Discussion Enhancement**: Support arguments with latest evidence — **save to `sources/`**
5. **Citation Management**: Provide properly formatted citations — **save to `sources/`**

## Complementary Tools

| Task | Tool |
|------|------|
| General web search | `parallel-web` skill (`parallel_web.py search`) |
| Citation verification | `parallel-web` skill (`parallel_web.py extract`) |
| Deep research (any topic) | `research-lookup` or `parallel-web` skill |
| Academic paper search | `research-lookup` (auto-routes to Perplexity) |
| Google Scholar search | `citation-management` skill |
| PubMed search | `citation-management` skill |
| DOI to BibTeX | `citation-management` skill |
| Metadata verification | `parallel-web` skill (`parallel_web.py search` or `extract`) |

---

## Error Handling and Limitations

**Known Limitations:**
- Parallel Chat API (core model): Complex queries may take up to 5 minutes
- Perplexity: Information cutoff, may not access full text behind paywalls
- Both: Cannot access proprietary or restricted databases

**Fallback Behavior:**
- If the selected backend's API key is missing, tries the other backend
- If both backends fail, returns structured error response
- Rephrase queries for better results if initial response is insufficient

---

## Usage Examples

### Example 1: General Research (Routes to Parallel)

**Query**: "Recent advances in transformer attention mechanisms 2025"

**Backend**: Parallel Chat API (core model)

**Response**: Comprehensive markdown report with citations from authoritative sources, covering recent papers, key innovations, and performance benchmarks.

### Example 2: Academic Paper Search (Routes to Perplexity)

**Query**: "Find papers on CRISPR off-target effects in clinical trials"

**Backend**: Perplexity sonar-pro-search (academic mode)

**Response**: Curated list of 5-8 high-impact papers with full citations, DOIs, citation counts, and venue tier indicators.

### Example 3: Comparative Analysis (Routes to Parallel)

**Query**: "Compare and contrast mRNA vaccines vs traditional vaccines for cancer treatment"

**Backend**: Parallel Chat API (core model)

**Response**: Detailed comparative report with data from multiple sources, structured analysis, and cited evidence.

### Example 4: Market Data (Routes to Parallel)

**Query**: "Global AI adoption in healthcare statistics 2025"

**Backend**: Parallel Chat API (core model)

**Response**: Current market data, adoption rates, growth projections, and regional analysis with source citations.

---

## Summary

This skill serves as the primary research interface with intelligent dual-backend routing:

- **Parallel Chat API** (default, `core` model): Comprehensive, multi-source research for any topic
- **Perplexity sonar-pro-search**: Academic-specific paper searches only
- **Automatic routing**: Detects academic queries and routes appropriately
- **Manual override**: Force any backend when needed
- **Complementary**: Works alongside `parallel-web` skill for web search and URL extraction
