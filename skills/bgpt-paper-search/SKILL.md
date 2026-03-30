---
name: bgpt-paper-search
description: Search scientific papers and retrieve structured experimental data extracted from full-text studies via the BGPT MCP server. Returns 25+ fields per paper including methods, results, sample sizes, quality scores, and conclusions. Use for literature reviews, evidence synthesis, and finding experimental details not available in abstracts alone.
allowed-tools: Bash
license: MIT
metadata:
    skill-author: BGPT
    website: https://bgpt.pro/mcp
    github: https://github.com/connerlambden/bgpt-mcp
---

# BGPT Paper Search

## Overview

BGPT is a remote MCP server that searches a curated database of scientific papers built from raw experimental data extracted from full-text studies. Unlike traditional literature databases that return titles and abstracts, BGPT returns structured data from the actual paper content — methods, quantitative results, sample sizes, quality assessments, and 25+ metadata fields per paper.

## When to Use This Skill

Use this skill when:
- Searching for scientific papers with specific experimental details
- Conducting systematic or scoping literature reviews
- Finding quantitative results, sample sizes, or effect sizes across studies
- Comparing methodologies used in different studies
- Looking for papers with quality scores or evidence grading
- Needing structured data from full-text papers (not just abstracts)
- Building evidence tables for meta-analyses or clinical guidelines

## Setup

BGPT is a remote MCP server — no local installation required.

### Claude Desktop / Claude Code

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "bgpt": {
      "command": "npx",
      "args": ["mcp-remote", "https://bgpt.pro/mcp/sse"]
    }
  }
}
```

### npm (alternative)

```bash
npx bgpt-mcp
```

## Usage

Once configured, use the `search_papers` tool provided by the BGPT MCP server:

```
Search for papers about: "CRISPR gene editing efficiency in human cells"
```

The server returns structured results including:
- **Title, authors, journal, year, DOI**
- **Methods**: Experimental techniques, models, protocols
- **Results**: Key findings with quantitative data
- **Sample sizes**: Number of subjects/samples
- **Quality scores**: Study quality assessments
- **Conclusions**: Author conclusions and implications

## Pricing

- **Free tier**: 50 searches per network, no API key required
- **Paid**: $0.01 per result with an API key from [bgpt.pro/mcp](https://bgpt.pro/mcp)

## Complementary Skills

Pairs well with:
- `literature-review` — Use BGPT to gather structured data, then synthesize with literature-review workflows
- `pubmed-database` — Use PubMed for broad searches, BGPT for deep experimental data
- `biorxiv-database` — Combine preprint discovery with full-text data extraction
- `citation-management` — Manage citations from BGPT search results
