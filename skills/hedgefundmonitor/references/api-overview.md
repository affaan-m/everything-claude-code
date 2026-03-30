# API Overview

## Base URL & Versioning

```
https://data.financialresearch.gov/hf/v1
```

The API version (`v1`) is required in the URL path. Currently only v1 is available.

## Protocol & Format

- All requests use **HTTPS**
- All responses are **JSON** (except `/categories` which returns CSV)
- No authentication, API keys, or registration required
- No documented rate limits — data updates at most once per day; avoid hammering the API

## Response Patterns

Most endpoints return one of:
- An **array of `[date, value]` pairs** for time series data
- A **JSON object keyed by mnemonic** for full series (timeseries + metadata)
- A **JSON array of objects** for search/metadata listings

### Timeseries array

```json
[
  ["2013-03-31", -3.0],
  ["2013-06-30", -2.0],
  ["2013-09-30", -2.05]
]
```

Null values appear as `null` in the value position.

### Full series object

```json
{
  "FPF-ALLQHF_NAV_SUM": {
    "timeseries": {
      "aggregation": [["2013-03-31", 1143832916], ...]
    },
    "metadata": {
      "mnemonic": "FPF-ALLQHF_NAV_SUM",
      "description": {
        "name": "All funds: net assets (sum dollar value)",
        "description": "...",
        "notes": "...",
        "vintage_approach": "Current vintage, as of last update",
        "vintage": "",
        "subsetting": "None",
        "subtype": "None"
      },
      "schedule": {
        "observation_period": "Quarterly",
        "observation_frequency": "Quarterly",
        "seasonal_adjustment": "None",
        "start_date": "2013-03-31",
        "last_update": ""
      }
    }
  }
}
```

## Mnemonic Format

Mnemonics are unique identifiers for each time series. Format varies by dataset:

| Dataset | Pattern | Example |
|---------|---------|---------|
| fpf | `FPF-{SCOPE}_{METRIC}_{STAT}` | `FPF-ALLQHF_NAV_SUM` |
| ficc | `FICC-{SERIES}` | `FICC-SPONSORED_REPO_VOL` |
| tff | `TFF-{SERIES}` | `TFF-DLRINDEX_NET_SPEC` |
| scoos | `SCOOS-{SERIES}` | varies |

Mnemonics are **case-insensitive** in query parameters (the API normalizes to uppercase in responses).

## Subseries (label)

Each mnemonic can have multiple subseries labeled:
- `aggregation` — the main data series (always present, default returned)
- `disclosure_edits` — version of the data with certain values masked for disclosure protection

## Installation

```bash
uv add requests pandas
```

No dedicated Python client exists — use `requests` directly.
