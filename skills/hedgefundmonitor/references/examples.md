# Code Examples

## Installation

```bash
uv add requests pandas matplotlib
```

## 1. Discover Available Data

```python
import requests
import pandas as pd

BASE = "https://data.financialresearch.gov/hf/v1"

# List all datasets
resp = requests.get(f"{BASE}/series/dataset")
for key, info in resp.json().items():
    print(f"{key}: {info['long_name']}")

# List all mnemonics for FPF with names
resp = requests.get(f"{BASE}/metadata/mnemonics", params={"dataset": "fpf"})
mnemonics = pd.DataFrame(resp.json())
print(mnemonics.head(20))

# Search for leverage-related series
resp = requests.get(f"{BASE}/metadata/search", params={"query": "*leverage*"})
results = pd.DataFrame(resp.json())
# Deduplicate to get unique mnemonics
leverage_series = results[results["mnemonic"] != "none"]["mnemonic"].unique()
print(leverage_series)
```

## 2. Fetch and Plot Hedge Fund Leverage Over Time

```python
import requests
import pandas as pd
import matplotlib.pyplot as plt

BASE = "https://data.financialresearch.gov/hf/v1"

# Fetch overall leverage ratio
resp = requests.get(f"{BASE}/series/timeseries", params={
    "mnemonic": "FPF-ALLQHF_LEVERAGERATIO_GAVWMEAN",
    "remove_nulls": "true"
})
df = pd.DataFrame(resp.json(), columns=["date", "leverage"])
df["date"] = pd.to_datetime(df["date"])

# Get metadata
meta_resp = requests.get(f"{BASE}/metadata/query", params={
    "mnemonic": "FPF-ALLQHF_LEVERAGERATIO_GAVWMEAN",
    "fields": "description/name,schedule/observation_frequency"
})
meta = meta_resp.json()
title = meta["description"]["name"]

plt.figure(figsize=(12, 5))
plt.plot(df["date"], df["leverage"], linewidth=2)
plt.title(title)
plt.ylabel("Leverage Ratio")
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("hedge_fund_leverage.png", dpi=150)
```

## 3. Compare Strategy-Level Leverage

```python
import requests
import pandas as pd
import matplotlib.pyplot as plt

BASE = "https://data.financialresearch.gov/hf/v1"

strategies = {
    "All Funds": "FPF-ALLQHF_LEVERAGERATIO_GAVWMEAN",
    "Equity": "FPF-STRATEGY_EQUITY_LEVERAGERATIO_GAVWMEAN",
    "Credit": "FPF-STRATEGY_CREDIT_LEVERAGERATIO_GAVWMEAN",
    "Macro": "FPF-STRATEGY_MACRO_LEVERAGERATIO_GAVWMEAN",
}

resp = requests.get(f"{BASE}/series/multifull", params={
    "mnemonics": ",".join(strategies.values()),
    "remove_nulls": "true"
})
results = resp.json()

fig, ax = plt.subplots(figsize=(14, 6))
for label, mne in strategies.items():
    ts = results[mne]["timeseries"]["aggregation"]
    df = pd.DataFrame(ts, columns=["date", "value"])
    df["date"] = pd.to_datetime(df["date"])
    ax.plot(df["date"], df["value"], label=label, linewidth=2)

ax.set_title("Hedge Fund Leverage by Strategy (GAV-Weighted)")
ax.set_ylabel("Leverage Ratio")
ax.legend()
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("leverage_by_strategy.png", dpi=150)
```

## 4. Download Full FPF Dataset into a Wide DataFrame

```python
import requests
import pandas as pd

BASE = "https://data.financialresearch.gov/hf/v1"

# Download entire FPF dataset, recent data only
resp = requests.get(f"{BASE}/series/dataset", params={
    "dataset": "fpf",
    "start_date": "2015-01-01",
    "remove_nulls": "false"
})
data = resp.json()

# Build a wide DataFrame with one column per series
frames = {}
for mne, series_data in data["timeseries"].items():
    ts = series_data["timeseries"]["aggregation"]
    if ts:
        s = pd.Series(
            {row[0]: row[1] for row in ts},
            name=mne
        )
        frames[mne] = s

df = pd.DataFrame(frames)
df.index = pd.to_datetime(df.index)
df = df.sort_index()
print(f"Shape: {df.shape}")  # (dates, series)
print(df.tail())
```

## 5. Stress Test Analysis

```python
import requests
import pandas as pd

BASE = "https://data.financialresearch.gov/hf/v1"

# CDS stress test scenarios (P5 = 5th percentile fund, P50 = median fund)
stress_mnemonics = [
    "FPF-ALLQHF_CDSDOWN250BPS_P5",
    "FPF-ALLQHF_CDSDOWN250BPS_P50",
    "FPF-ALLQHF_CDSUP250BPS_P5",
    "FPF-ALLQHF_CDSUP250BPS_P50",
]

resp = requests.get(f"{BASE}/series/multifull", params={
    "mnemonics": ",".join(stress_mnemonics),
    "remove_nulls": "true"
})
results = resp.json()

frames = []
for mne in stress_mnemonics:
    ts = results[mne]["timeseries"]["aggregation"]
    name = results[mne]["metadata"]["description"]["name"]
    df = pd.DataFrame(ts, columns=["date", mne])
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date")
    frames.append(df)

stress_df = pd.concat(frames, axis=1)
stress_df.columns = [r["metadata"]["description"]["name"]
                     for r in [results[m] for m in stress_mnemonics]]
print(stress_df.tail(8).to_string())
```

## 6. FICC Sponsored Repo Volume Trend

```python
import requests
import pandas as pd
import matplotlib.pyplot as plt

BASE = "https://data.financialresearch.gov/hf/v1"

resp = requests.get(f"{BASE}/series/multifull", params={
    "mnemonics": "FICC-SPONSORED_REPO_VOL,FICC-SPONSORED_REVREPO_VOL",
    "remove_nulls": "true"
})
results = resp.json()

fig, ax = plt.subplots(figsize=(12, 5))
for mne, label in [
    ("FICC-SPONSORED_REPO_VOL", "Repo Volume"),
    ("FICC-SPONSORED_REVREPO_VOL", "Reverse Repo Volume"),
]:
    ts = results[mne]["timeseries"]["aggregation"]
    df = pd.DataFrame(ts, columns=["date", "value"])
    df["date"] = pd.to_datetime(df["date"])
    # Convert to trillions
    df["value"] = df["value"] / 1e12
    ax.plot(df["date"], df["value"], label=label, linewidth=2)

ax.set_title("FICC Sponsored Repo Service Volumes")
ax.set_ylabel("Trillions USD")
ax.legend()
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("ficc_repo_volumes.png", dpi=150)
```

## 7. Download Category CSV

```python
import requests
import io
import pandas as pd

BASE = "https://data.financialresearch.gov/hf/v1"

# Download the leverage category as a DataFrame
resp = requests.get(f"{BASE}/categories", params={"category": "leverage"})
df = pd.read_csv(io.StringIO(resp.text))
print(df.head())

# All categories: complexity, counterparties, leverage, liquidity, risk_management, size
```

## 8. Counterparty Concentration Analysis

```python
import requests
import pandas as pd

BASE = "https://data.financialresearch.gov/hf/v1"

# Top 8 counterparties lending to all qualifying hedge funds
party_mnemonics = [f"FPF-ALLQHF_PARTY{i}_SUM" for i in range(1, 9)]

resp = requests.get(f"{BASE}/series/multifull", params={
    "mnemonics": ",".join(party_mnemonics),
    "remove_nulls": "false"
})
results = resp.json()

# Get the most recent quarter's values
frames = []
for mne in party_mnemonics:
    ts = results[mne]["timeseries"]["aggregation"]
    df = pd.DataFrame(ts, columns=["date", "value"])
    df["date"] = pd.to_datetime(df["date"])
    df["mnemonic"] = mne
    frames.append(df)

all_data = pd.concat(frames).pivot(index="date", columns="mnemonic", values="value")
print("Most recent quarter counterparty exposure (USD billions):")
print((all_data.iloc[-1] / 1e9).sort_values(ascending=False).to_string())
```

## 9. Periodic Refresh Pattern

```python
import requests
import pandas as pd
from datetime import datetime, timedelta

BASE = "https://data.financialresearch.gov/hf/v1"

def get_recent_fpf(days_back: int = 180) -> pd.DataFrame:
    """Fetch only the most recent FPF observations (for periodic refreshes)."""
    start = (datetime.today() - timedelta(days=days_back)).strftime("%Y-%m-%d")
    resp = requests.get(f"{BASE}/series/dataset", params={
        "dataset": "fpf",
        "start_date": start,
        "remove_nulls": "true"
    })
    data = resp.json()
    frames = {}
    for mne, series_data in data["timeseries"].items():
        ts = series_data["timeseries"]["aggregation"]
        if ts:
            frames[mne] = pd.Series({row[0]: row[1] for row in ts}, name=mne)
    return pd.DataFrame(frames)

recent = get_recent_fpf(days_back=365)
print(recent.shape)
```
