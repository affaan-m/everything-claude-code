# Command-Line Interface

The pyzotero CLI connects to your **local Zotero installation** (not the remote API). It requires a running local Zotero desktop app.

## Installation

```bash
uv add "pyzotero[cli]"
# or run without installing:
uvx --from "pyzotero[cli]" pyzotero search -q "your query"
```

## Searching

```bash
# Search titles and metadata
pyzotero search -q "machine learning"

# Full-text search (includes PDF content)
pyzotero search -q "climate change" --fulltext

# Filter by item type
pyzotero search -q "methodology" --itemtype journalArticle --itemtype book

# Filter by tags (AND logic)
pyzotero search -q "evolution" --tag "reviewed" --tag "high-priority"

# Search within a collection
pyzotero search --collection ABC123 -q "test"

# Paginate results
pyzotero search -q "deep learning" --limit 20 --offset 40

# Output as JSON (for machine processing)
pyzotero search -q "protein" --json
```

## Getting Individual Items

```bash
# Get a single item by key
pyzotero item ABC123

# Get as JSON
pyzotero item ABC123 --json

# Get child items (attachments, notes)
pyzotero children ABC123 --json

# Get multiple items at once (up to 50)
pyzotero subset ABC123 DEF456 GHI789 --json
```

## Collections & Tags

```bash
# List all collections
pyzotero listcollections

# List all tags
pyzotero tags

# Tags in a specific collection
pyzotero tags --collection ABC123
```

## Full-Text Content

```bash
# Get full-text content of an attachment
pyzotero fulltext ABC123
```

## Item Types

```bash
# List all available item types
pyzotero itemtypes
```

## DOI Index

```bash
# Get complete DOI-to-key mapping (useful for caching)
pyzotero doiindex > doi_cache.json
# Returns JSON: {"10.1038/s41592-024-02233-6": {"key": "ABC123", "doi": "..."}}
```

## Output Format

By default the CLI outputs human-readable text including title, authors, date, publication, volume, issue, DOI, URL, and PDF attachment paths.

Use `--json` for structured JSON output suitable for piping to other tools.

## Search Behaviour Notes

- Default search covers top-level item titles and metadata fields only
- `--fulltext` expands search to PDF content; results show parent bibliographic items (not raw attachments)
- Multiple `--tag` flags use AND logic
- Multiple `--itemtype` flags use OR logic
