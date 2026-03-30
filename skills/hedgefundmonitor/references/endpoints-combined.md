# Combined Data & Metadata Endpoints

## 1. Full Single Series — `/series/full`

**URL:** `GET https://data.financialresearch.gov/hf/v1/series/full`

Returns both timeseries data and all metadata for one series in a single call.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mnemonic` | string | **Yes** | Series identifier |
| `start_date` | string | No | Start date `YYYY-MM-DD` |
| `end_date` | string | No | End date `YYYY-MM-DD` |
| `periodicity` | string | No | Resample frequency |
| `how` | string | No | Aggregation: `last`, `first`, `mean`, `median`, `sum` |
| `remove_nulls` | string | No | `true` to remove nulls |
| `time_format` | string | No | `date` or `ms` |

### Response

```json
{
  "FPF-ALLQHF_NAV_SUM": {
    "timeseries": {
      "aggregation": [["2013-03-31", 1143832916], ...],
      "disclosure_edits": [...]
    },
    "metadata": { ... }
  }
}
```

### Examples

```python
import requests
import pandas as pd

BASE = "https://data.financialresearch.gov/hf/v1"

resp = requests.get(f"{BASE}/series/full", params={
    "mnemonic": "FPF-ALLQHF_NAV_SUM",
    "start_date": "2018-01-01"
})
result = resp.json()
mnemonic = "FPF-ALLQHF_NAV_SUM"

# Extract timeseries
ts = result[mnemonic]["timeseries"]["aggregation"]
df = pd.DataFrame(ts, columns=["date", "nav_sum"])

# Extract metadata
meta = result[mnemonic]["metadata"]
print(meta["description"]["name"])
print(meta["schedule"]["observation_frequency"])
```

---

## 2. Multiple Series Full — `/series/multifull`

**URL:** `GET https://data.financialresearch.gov/hf/v1/series/multifull`

Returns data + metadata for multiple series in one request. Response is keyed by mnemonic, same structure as `/series/full`.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mnemonics` | string | **Yes** | Comma-separated mnemonics, no spaces |
| `start_date` | string | No | Start date `YYYY-MM-DD` |
| `end_date` | string | No | End date `YYYY-MM-DD` |
| `periodicity` | string | No | Resample frequency |
| `how` | string | No | Aggregation method |
| `remove_nulls` | string | No | `true` to remove nulls |
| `time_format` | string | No | `date` or `ms` |

### Examples

```python
# Fetch multiple leverage series at once
resp = requests.get(f"{BASE}/series/multifull", params={
    "mnemonics": "FPF-ALLQHF_LEVERAGERATIO_GAVWMEAN,FPF-STRATEGY_EQUITY_LEVERAGERATIO_GAVWMEAN,FPF-STRATEGY_CREDIT_LEVERAGERATIO_GAVWMEAN",
    "start_date": "2015-01-01",
    "remove_nulls": "true"
})
results = resp.json()

# Build a combined DataFrame
frames = []
for mne, data in results.items():
    ts = data["timeseries"]["aggregation"]
    df = pd.DataFrame(ts, columns=["date", mne])
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date")
    frames.append(df)

combined = pd.concat(frames, axis=1)
```

---

## 3. Full Dataset — `/series/dataset`

**URL:** `GET https://data.financialresearch.gov/hf/v1/series/dataset`

Without parameters: returns basic info about all datasets.
With `dataset=`: returns all series in that dataset with full data.

> **Warning:** Dataset responses can be very large. Use `start_date` to limit the data range for performance.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dataset` | string | No | Dataset key: `fpf`, `tff`, `scoos`, `ficc` |
| `vintage` | string | No | `p` (preliminary), `f` (final), `a` (as of). Default: all |
| `start_date` | string | No | Start date `YYYY-MM-DD` |
| `end_date` | string | No | End date `YYYY-MM-DD` |
| `periodicity` | string | No | Resample frequency |
| `how` | string | No | Aggregation method |
| `remove_nulls` | string | No | `true` to remove nulls |
| `time_format` | string | No | `date` or `ms` |

### Examples

```python
# List all available datasets
resp = requests.get(f"{BASE}/series/dataset")
datasets = resp.json()
# {"ficc": {"long_name": "...", "short_name": "..."}, "fpf": {...}, ...}

# Download full FPF dataset (recent data only)
resp = requests.get(f"{BASE}/series/dataset", params={
    "dataset": "fpf",
    "start_date": "2020-01-01"
})
fpf_data = resp.json()
# fpf_data["short_name"], fpf_data["long_name"]
# fpf_data["timeseries"]["FPF-ALLQHF_NAV_SUM"]["timeseries"]["aggregation"]

# Annual data with custom periodicity
resp = requests.get(f"{BASE}/series/dataset", params={
    "dataset": "fpf",
    "start_date": "2015-01-01",
    "end_date": "2024-12-31",
    "periodicity": "A",
    "how": "last"
})

# Only final vintage
resp = requests.get(f"{BASE}/series/dataset", params={
    "dataset": "ficc",
    "vintage": "f"
})
```

---

## 4. Category Data — `/categories`

**URL:** `GET https://data.financialresearch.gov/hf/v1/categories`

Returns a **CSV file** with all series data for a given category.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | **Yes** | Category key |

### Available Categories

| Key | Description |
|-----|-------------|
| `complexity` | Open positions, strategy distribution, asset class exposure |
| `counterparties` | Counterparty concentration and prime broker lending |
| `leverage` | Leverage ratios, borrowing, gross notional exposure |
| `liquidity` | Financing maturity, investor redemption terms, portfolio liquidity |
| `risk_management` | Stress test results |
| `size` | Industry size (AUM, fund count, net/gross assets) |

### Examples

```python
# Download leverage category as CSV
resp = requests.get(f"{BASE}/categories", params={"category": "leverage"})
# Response is CSV text
import io
df = pd.read_csv(io.StringIO(resp.text))

# Also accessible via direct URL:
# https://data.financialresearch.gov/hf/v1/categories?category=leverage
```
