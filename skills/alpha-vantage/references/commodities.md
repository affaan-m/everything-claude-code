# Commodities APIs

Historical data for major commodities. All functions return `{"name": "...", "interval": "...", "unit": "...", "data": [{"date": "...", "value": "..."}, ...]}`.

## Metals

### GOLD_SILVER_SPOT — Real-time Gold & Silver Spot Price

**Required:** `symbol` — `GOLD` / `XAU` for gold; `SILVER` / `XAG` for silver

```python
data = av_get("GOLD_SILVER_SPOT", symbol="GOLD")
# Returns current spot price
print(data["price"], data["unit"], data["timestamp"])

data = av_get("GOLD_SILVER_SPOT", symbol="SILVER")
```

### GOLD_SILVER_HISTORY — Historical Gold & Silver Prices

**Required:** `symbol` (`GOLD`, `XAU`, `SILVER`, `XAG`), `interval` (`daily`, `weekly`, `monthly`)

```python
data = av_get("GOLD_SILVER_HISTORY", symbol="GOLD", interval="daily")
for obs in data["data"][:10]:
    print(obs["date"], obs["value"])
# unit: USD per troy ounce
```

## Oil & Gas

### WTI — Crude Oil (West Texas Intermediate)

**Optional:** `interval` (`daily`, `weekly`, `monthly`) — default: `monthly`

```python
data = av_get("WTI", interval="daily")
for obs in data["data"][:10]:
    print(obs["date"], obs["value"])
# unit: dollars per barrel
```

### BRENT — Crude Oil (Brent)

**Optional:** `interval` (`daily`, `weekly`, `monthly`) — default: `monthly`

```python
data = av_get("BRENT", interval="daily")
```

### NATURAL_GAS — Henry Hub Natural Gas Spot Price

**Optional:** `interval` (`daily`, `weekly`, `monthly`) — default: `monthly`

```python
data = av_get("NATURAL_GAS", interval="monthly")
# unit: dollars per million BTU
```

## Industrial Metals

### COPPER — Global Price of Copper

**Optional:** `interval` (`monthly`, `quarterly`, `annual`) — default: `monthly`

```python
data = av_get("COPPER", interval="monthly")
# unit: USD per metric ton
```

### ALUMINUM — Global Price of Aluminum

**Optional:** `interval` (`monthly`, `quarterly`, `annual`) — default: `monthly`

```python
data = av_get("ALUMINUM", interval="monthly")
```

## Agricultural Commodities

### WHEAT — Global Price of Wheat

**Optional:** `interval` (`monthly`, `quarterly`, `annual`) — default: `monthly`

```python
data = av_get("WHEAT", interval="monthly")
# unit: USD per metric ton
```

### CORN — Global Price of Corn (Maize)

**Optional:** `interval` (`monthly`, `quarterly`, `annual`) — default: `monthly`

```python
data = av_get("CORN", interval="monthly")
```

### COTTON — Global Price of Cotton

**Optional:** `interval` (`monthly`, `quarterly`, `annual`) — default: `monthly`

```python
data = av_get("COTTON", interval="monthly")
# unit: USD per pound
```

### SUGAR — Global Price of Sugar

**Optional:** `interval` (`monthly`, `quarterly`, `annual`) — default: `monthly`

```python
data = av_get("SUGAR", interval="monthly")
# unit: cents per pound
```

### COFFEE — Global Price of Coffee

**Optional:** `interval` (`monthly`, `quarterly`, `annual`) — default: `monthly`

```python
data = av_get("COFFEE", interval="monthly")
# unit: USD per pound
```

## ALL_COMMODITIES — Global Price Index of All Commodities

IMF Primary Commodity Price Index.

**Optional:** `interval` (`monthly`, `quarterly`, `annual`) — default: `monthly`

```python
data = av_get("ALL_COMMODITIES", interval="monthly")
# Composite index of all commodities
```

## Convert to DataFrame

```python
import pandas as pd

def commodity_to_df(function, **kwargs):
    data = av_get(function, **kwargs)
    df = pd.DataFrame(data["data"])
    df["date"] = pd.to_datetime(df["date"])
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    return df.set_index("date").sort_index()

# Compare oil prices
wti_df = commodity_to_df("WTI", interval="monthly")
brent_df = commodity_to_df("BRENT", interval="monthly")
spread = brent_df["value"] - wti_df["value"]
print(spread.tail())
```
