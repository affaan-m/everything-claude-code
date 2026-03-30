# Series Data Endpoints

## 1. Single Timeseries — `/series/timeseries`

**URL:** `GET https://data.financialresearch.gov/hf/v1/series/timeseries`

Returns date/value pairs for a single series.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mnemonic` | string | **Yes** | Series identifier |
| `label` | string | No | Subseries: `aggregation` (default) or `disclosure_edits` |
| `start_date` | string | No | First date `YYYY-MM-DD` (default: `1901-01-01`) |
| `end_date` | string | No | Last date `YYYY-MM-DD` (default: today) |
| `periodicity` | string | No | Resample to frequency (see parameters.md) |
| `how` | string | No | Aggregation method: `last` (default), `first`, `mean`, `median`, `sum` |
| `remove_nulls` | string | No | `true` to remove null values |
| `time_format` | string | No | `date` (YYYY-MM-DD, default) or `ms` (epoch milliseconds) |

### Response

Array of `[date_string, value]` pairs. Values are floats or `null`.

```json
[
  ["2013-03-31", -3.0],
  ["2013-06-30", -2.0],
  ["2013-09-30", null],
  ["2013-12-31", -3.0]
]
```

### Examples

```python
import requests
import pandas as pd

BASE = "https://data.financialresearch.gov/hf/v1"

# Full history for a series
resp = requests.get(f"{BASE}/series/timeseries", params={
    "mnemonic": "FPF-ALLQHF_LEVERAGERATIO_GAVWMEAN"
})
data = resp.json()
df = pd.DataFrame(data, columns=["date", "leverage"])
df["date"] = pd.to_datetime(df["date"])

# Filtered date range with null removal
resp = requests.get(f"{BASE}/series/timeseries", params={
    "mnemonic": "FPF-ALLQHF_NAV_SUM",
    "start_date": "2018-01-01",
    "end_date": "2024-12-31",
    "remove_nulls": "true"
})

# Annual frequency (calendar year end)
resp = requests.get(f"{BASE}/series/timeseries", params={
    "mnemonic": "FPF-ALLQHF_GAV_SUM",
    "periodicity": "A",
    "how": "last"
})

# Epoch milliseconds for charting libraries
resp = requests.get(f"{BASE}/series/timeseries", params={
    "mnemonic": "FICC-SPONSORED_REPO_VOL",
    "time_format": "ms"
})
```

---

## 2. Series Spread — `/calc/spread`

**URL:** `GET https://data.financialresearch.gov/hf/v1/calc/spread`

Returns the difference (spread) between two series: `x - y`. Useful for comparing rates or examining basis relationships.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `x` | string | **Yes** | Base series mnemonic |
| `y` | string | **Yes** | Subtracted series mnemonic |
| `start_date` | string | No | Start date `YYYY-MM-DD` |
| `end_date` | string | No | End date `YYYY-MM-DD` |
| `periodicity` | string | No | Resample frequency |
| `how` | string | No | Aggregation: `last`, `first`, `mean`, `median`, `sum` |
| `remove_nulls` | string | No | `true` to remove nulls |
| `time_format` | string | No | `date` or `ms` |

### Response

Array of `[date, value]` pairs where value = x - y at each date.

```json
[
  ["2020-01-02", 0.15],
  ["2020-03-03", -0.37],
  ["2020-04-01", 0.60]
]
```

### Examples

```python
# Spread between two repo rates
resp = requests.get(f"{BASE}/calc/spread", params={
    "x": "REPO-GCF_AR_G30-P",
    "y": "REPO-TRI_AR_AG-P",
    "start_date": "2019-01-01",
    "remove_nulls": "true"
})
spread = pd.DataFrame(resp.json(), columns=["date", "spread_bps"])
spread["date"] = pd.to_datetime(spread["date"])

# Annual spread with mean aggregation
resp = requests.get(f"{BASE}/calc/spread", params={
    "x": "FPF-STRATEGY_EQUITY_LEVERAGERATIO_GAVWMEAN",
    "y": "FPF-STRATEGY_CREDIT_LEVERAGERATIO_GAVWMEAN",
    "periodicity": "A",
    "how": "mean"
})
```
