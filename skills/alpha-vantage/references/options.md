# Options Data APIs (Premium)

Both options endpoints require a premium Alpha Vantage subscription.

## REALTIME_OPTIONS — Real-time Options Chain

Returns real-time options contracts for a given symbol.

**Required:** `symbol`

**Optional:**
- `contract` — specific contract ID (e.g., `AAPL240119C00150000`) to get a single contract
- `datatype` — `json` or `csv`

```python
data = av_get("REALTIME_OPTIONS", symbol="AAPL")
options = data["data"]

for contract in options[:5]:
    print(
        contract["contractID"],    # e.g., "AAPL240119C00150000"
        contract["strike"],        # "150.00"
        contract["expiration"],    # "2024-01-19"
        contract["type"],          # "call" or "put"
        contract["last"],          # last price
        contract["bid"],
        contract["ask"],
        contract["volume"],
        contract["open_interest"],
        contract["implied_volatility"],
        contract["delta"],
        contract["gamma"],
        contract["theta"],
        contract["vega"],
        contract["rho"]
    )

# Get a specific contract
data = av_get("REALTIME_OPTIONS", symbol="AAPL", contract="AAPL240119C00150000")
```

## HISTORICAL_OPTIONS — Historical Options Chain

Returns historical end-of-day options data for a specific date.

**Required:** `symbol`

**Optional:**
- `date` — format `YYYY-MM-DD` (up to 2 years of history)
- `datatype` — `json` or `csv`

```python
# Get options chain for a specific historical date
data = av_get("HISTORICAL_OPTIONS", symbol="AAPL", date="2023-12-15")
options = data["data"]

for contract in options[:5]:
    print(
        contract["contractID"],
        contract["strike"],
        contract["expiration"],
        contract["type"],           # "call" or "put"
        contract["last"],
        contract["mark"],           # mark price
        contract["bid"],
        contract["ask"],
        contract["volume"],
        contract["open_interest"],
        contract["date"],           # the date of this snapshot
        contract["implied_volatility"],
        contract["delta"],
        contract["gamma"],
        contract["theta"],
        contract["vega"],
        contract["rho"]
    )
```

## Filter Options by Expiration/Type

```python
import pandas as pd

data = av_get("HISTORICAL_OPTIONS", symbol="AAPL", date="2023-12-15")
df = pd.DataFrame(data["data"])
df["strike"] = pd.to_numeric(df["strike"])
df["expiration"] = pd.to_datetime(df["expiration"])

# Filter calls expiring in January 2024
calls_jan = df[(df["type"] == "call") & (df["expiration"].dt.month == 1) & (df["expiration"].dt.year == 2024)]
calls_jan = calls_jan.sort_values("strike")
print(calls_jan[["contractID", "strike", "bid", "ask", "implied_volatility", "delta"]].head(10))
```
