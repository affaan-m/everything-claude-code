# Metadata Endpoints

## 1. List Mnemonics — `/metadata/mnemonics`

**URL:** `GET https://data.financialresearch.gov/hf/v1/metadata/mnemonics`

Returns all series identifiers available through the API.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dataset` | string | No | Filter by dataset key: `fpf`, `tff`, `scoos`, `ficc` |
| `output` | string | No | `by_dataset` — returns a hash grouped by dataset |

### Examples

```python
import requests
BASE = "https://data.financialresearch.gov/hf/v1"

# All mnemonics (flat list)
resp = requests.get(f"{BASE}/metadata/mnemonics")
mnemonics = resp.json()
# Returns: ["FPF-ALLQHF_CDSDOWN250BPS_P5", "FPF-ALLQHF_CDSDOWN250BPS_P50", ...]

# Mnemonics for a single dataset with names
resp = requests.get(f"{BASE}/metadata/mnemonics", params={"dataset": "fpf"})
# Returns: [{"mnemonic": "FPF-ALLQHF_CDSDOWN250BPS_P5", "series_name": "Stress test: CDS spreads decrease 250 basis points net impact on NAV (5th percentile fund)"}, ...]

# All mnemonics grouped by dataset
resp = requests.get(f"{BASE}/metadata/mnemonics", params={"output": "by_dataset"})
grouped = resp.json()
# Returns: {"ficc": [{mnemonic, series_name}, ...], "fpf": [...], ...}
```

---

## 2. Single Series Query — `/metadata/query`

**URL:** `GET https://data.financialresearch.gov/hf/v1/metadata/query`

Returns full metadata for a single mnemonic.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mnemonic` | string | **Yes** | The series mnemonic |
| `fields` | string | No | Comma-separated list of fields to retrieve. Use `/` to access subfields (e.g., `release/long_name`) |

### Metadata Fields

The metadata object includes these top-level fields (with subfields):

| Field | Subfields |
|-------|-----------|
| `mnemonic` | — |
| `description` | `name`, `description`, `notes`, `vintage_approach`, `vintage`, `subsetting`, `subtype` |
| `schedule` | `observation_period`, `observation_frequency`, `seasonal_adjustment`, `start_date`, `last_update` |
| `release` | `long_name`, `short_name`, and other release-level metadata |

### Examples

```python
# Full metadata
resp = requests.get(f"{BASE}/metadata/query", params={
    "mnemonic": "fpf-allqhf_cdsup250bps_p5"
})
meta = resp.json()
print(meta["description"]["name"])
print(meta["schedule"]["start_date"])
print(meta["schedule"]["observation_frequency"])

# Specific subfield only
resp = requests.get(f"{BASE}/metadata/query", params={
    "mnemonic": "fpf-allqhf_cdsup250bps_p5",
    "fields": "release/long_name"
})
# Returns: {"release": {"long_name": "Hedge Fund Aggregated Statistics from SEC Form PF Filings"}}

# Multiple fields
resp = requests.get(f"{BASE}/metadata/query", params={
    "mnemonic": "fpf-allqhf_cdsup250bps_p5",
    "fields": "description/name,schedule/start_date,schedule/observation_frequency"
})
```

---

## 3. Series Search — `/metadata/search`

**URL:** `GET https://data.financialresearch.gov/hf/v1/metadata/search`

Full-text search across all metadata fields. Supports wildcards.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | **Yes** | Search string. Supports `*` (multi-char wildcard) and `?` (single-char wildcard) |

### Response Fields

Each result object contains:

| Field | Description |
|-------|-------------|
| `mnemonic` | Series identifier (or `"none"` for dataset-level metadata) |
| `dataset` | Dataset key (`fpf`, `tff`, `scoos`, `ficc`) |
| `field` | Which metadata field matched (e.g., `description/name`) |
| `value` | The matched field value |
| `type` | Data type (`str`, etc.) |

### Examples

```python
# Find series containing "leverage" anywhere
resp = requests.get(f"{BASE}/metadata/search", params={"query": "*leverage*"})
results = resp.json()
for r in results:
    print(r["mnemonic"], r["field"], r["value"])

# Find series starting with "Fund"
resp = requests.get(f"{BASE}/metadata/search", params={"query": "Fund*"})

# Find by exact dataset name
resp = requests.get(f"{BASE}/metadata/search", params={"query": "FICC*"})

# Search for stress test series
resp = requests.get(f"{BASE}/metadata/search", params={"query": "*stress*"})

# Get unique mnemonics from search results
results = resp.json()
mnemonics = list({r["mnemonic"] for r in results if r["mnemonic"] != "none"})
```
