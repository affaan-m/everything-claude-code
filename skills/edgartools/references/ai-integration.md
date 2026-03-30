# edgartools — AI Integration Reference

## Table of Contents
- [Installation](#installation)
- [MCP Server Setup](#mcp-server-setup)
- [MCP Tools Reference](#mcp-tools-reference)
- [Built-in AI Features](#built-in-ai-features)
- [Skills for Claude](#skills-for-claude)
- [Troubleshooting](#troubleshooting)

---

## Installation

```bash
# Core library
uv pip install edgartools

# For MCP server and Skills
uv pip install "edgartools[ai]"
```

---

## MCP Server Setup

The MCP server gives any MCP-compatible client (Claude Desktop, Cursor, Cline, Continue.dev) direct access to SEC data.

### Option 1: uvx (Recommended — zero install)

Add to your MCP config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "edgartools": {
      "command": "uvx",
      "args": ["--from", "edgartools[ai]", "edgartools-mcp"],
      "env": {
        "EDGAR_IDENTITY": "Your Name your.email@example.com"
      }
    }
  }
}
```

If you get "spawn uvx ENOENT" on macOS, use the full path: `which uvx`.

### Option 2: Python (when edgartools already installed)

```json
{
  "mcpServers": {
    "edgartools": {
      "command": "python3",
      "args": ["-m", "edgar.ai"],
      "env": {
        "EDGAR_IDENTITY": "Your Name your.email@example.com"
      }
    }
  }
}
```

On Windows, use `python` instead of `python3`.

### Option 3: Docker

```dockerfile
FROM python:3.12-slim
RUN pip install "edgartools[ai]"
ENV EDGAR_IDENTITY="Your Name your.email@example.com"
ENTRYPOINT ["python", "-m", "edgar.ai"]
```

```bash
docker build -t edgartools-mcp .
docker run -i edgartools-mcp
```

### Verify Setup

```bash
python -m edgar.ai --test
```

---

## MCP Tools Reference

### edgar_company
Get company profile, financials, recent filings, and ownership in one call.

| Parameter | Description |
|-----------|-------------|
| `identifier` | Ticker, CIK, or company name (required) |
| `include` | Sections: `profile`, `financials`, `filings`, `ownership` |
| `periods` | Number of financial periods (default: 4) |
| `annual` | Annual vs quarterly (default: true) |

Example prompts:
- "Show me Apple's profile and latest financials"
- "Get Microsoft's recent filings and ownership data"

### edgar_search
Search for companies or filings.

| Parameter | Description |
|-----------|-------------|
| `query` | Search keywords (required) |
| `search_type` | `companies`, `filings`, or `all` |
| `identifier` | Limit to specific company |
| `form` | Filter by form type (e.g., `10-K`, `8-K`) |
| `limit` | Max results (default: 10) |

### edgar_filing
Read filing content or specific sections.

| Parameter | Description |
|-----------|-------------|
| `accession_number` | SEC accession number |
| `identifier` + `form` | Alternative: company + form type |
| `sections` | `summary`, `business`, `risk_factors`, `mda`, `financials`, or `all` |

Example prompts:
- "Show me the risk factors from Apple's latest 10-K"
- "Get the MD&A section from Tesla's most recent annual report"

### edgar_compare
Compare companies side-by-side or by industry.

| Parameter | Description |
|-----------|-------------|
| `identifiers` | List of tickers/CIKs |
| `industry` | Industry name (alternative to identifiers) |
| `metrics` | Metrics to compare (e.g., `revenue`, `net_income`) |
| `periods` | Number of periods (default: 4) |

### edgar_ownership
Insider transactions, institutional holders, or fund portfolios.

| Parameter | Description |
|-----------|-------------|
| `identifier` | Ticker, CIK, or fund CIK (required) |
| `analysis_type` | `insiders`, `institutions`, or `fund_portfolio` |
| `days` | Lookback for insider trades (default: 90) |
| `limit` | Max results (default: 20) |

---

## Built-in AI Features

These work without the `[ai]` extra.

### .docs Property

Every major object has searchable API docs:

```python
from edgar import Company

company = Company("AAPL")
company.docs                       # Full API reference
company.docs.search("financials")  # Search specific topic

# Also available on:
filing.docs
filings.docs
xbrl.docs
statement.docs
```

### .to_context() Method

Token-efficient output for LLM context windows:

```python
company = Company("AAPL")

# Control detail level
company.to_context(detail='minimal')    # ~100 tokens
company.to_context(detail='standard')   # ~300 tokens (default)
company.to_context(detail='full')       # ~500 tokens

# Hard token limit
company.to_context(max_tokens=200)

# Also available on:
filing.to_context(detail='standard')
filings.to_context(detail='minimal')
xbrl.to_context(detail='standard')
statement.to_context(detail='full')
```

---

## Skills for Claude

Skills teach Claude to write better edgartools code by providing patterns and best practices.

### Install for Claude Code (auto-discovered)

```python
from edgar.ai import install_skill
install_skill()  # installs to ~/.claude/skills/edgartools/
```

### Install for Claude Desktop (upload as project knowledge)

```python
from edgar.ai import package_skill
package_skill()  # creates edgartools.zip
# Upload the ZIP to a Claude Desktop Project
```

### Skill Domains

| Domain | What It Covers |
|--------|----------------|
| **core** | Company lookup, filing search, API routing, quick reference |
| **financials** | Financial statements, metrics, multi-company comparison |
| **holdings** | 13F filings, institutional portfolios |
| **ownership** | Insider transactions (Form 4), ownership summaries |
| **reports** | 10-K, 10-Q, 8-K document sections |
| **xbrl** | XBRL fact extraction, statement rendering |

### When to Use Which

| Goal | Use |
|------|-----|
| Ask Claude questions about companies/filings | MCP Server |
| Have Claude write edgartools code | Skills |
| Both | Install both — they complement each other |

---

## Filing to Markdown for LLM Processing

```python
company = Company("NVDA")
filing = company.get_filings(form="10-K").latest()

# Export to markdown for LLM analysis
md = filing.markdown(include_page_breaks=True)

with open("nvidia_10k_for_analysis.md", "w") as f:
    f.write(md)

print(f"Saved {len(md)} characters")
```

---

## Troubleshooting

**"EDGAR_IDENTITY environment variable is required"**
Add your name and email to the `env` section of your MCP config. The SEC requires identification.

**"Module edgar.ai not found"**
Install with AI extras: `uv pip install "edgartools[ai]"`

**"python3: command not found" (Windows)**
Use `python` instead of `python3` in MCP config.

**MCP server not appearing in Claude Desktop**
1. Check config file location for your OS
2. Validate JSON syntax
3. Restart Claude Desktop completely
4. Run `python -m edgar.ai --test` to verify

**Skills not being picked up**
1. Verify: `ls ~/.claude/skills/edgartools/`
2. For Claude Desktop, upload as ZIP to a Project
3. Skills affect code generation, not conversational responses
