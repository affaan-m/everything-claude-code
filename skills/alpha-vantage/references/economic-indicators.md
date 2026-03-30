# Economic Indicators APIs

All economic indicators return US data and follow the same response structure:

```json
{
  "name": "Real Gross Domestic Product",
  "interval": "annual",
  "unit": "billions of chained 2012 dollars",
  "data": [{"date": "2023-01-01", "value": "22067.1"}, ...]
}
```

## GDP

### REAL_GDP — Real Gross Domestic Product

Source: US Bureau of Economic Analysis via FRED.

**Optional:** `interval` (`annual`, `quarterly`) — default: `annual`

```python
data = av_get("REAL_GDP", interval="quarterly")
latest = data["data"][0]
print(latest["date"], latest["value"])
# unit: billions of chained 2012 dollars
```

### REAL_GDP_PER_CAPITA — Real GDP Per Capita

**No interval parameter** — quarterly data only.

```python
data = av_get("REAL_GDP_PER_CAPITA")
# unit: chained 2012 dollars
```

## Interest Rates

### TREASURY_YIELD — US Treasury Yield

**Optional:**
- `interval` (`daily`, `weekly`, `monthly`) — default: `monthly`
- `maturity` (`3month`, `2year`, `5year`, `7year`, `10year`, `30year`) — default: `10year`

```python
# 10-year treasury yield (daily)
data = av_get("TREASURY_YIELD", interval="daily", maturity="10year")
for obs in data["data"][:5]:
    print(obs["date"], obs["value"])
# unit: percent

# 2-year vs 10-year spread (yield curve)
two_yr = av_get("TREASURY_YIELD", interval="monthly", maturity="2year")
ten_yr = av_get("TREASURY_YIELD", interval="monthly", maturity="10year")
```

### FEDERAL_FUNDS_RATE — Federal Funds Rate

**Optional:** `interval` (`daily`, `weekly`, `monthly`) — default: `monthly`

```python
data = av_get("FEDERAL_FUNDS_RATE", interval="monthly")
# unit: percent
```

## Inflation

### CPI — Consumer Price Index

**Optional:** `interval` (`monthly`, `semiannual`) — default: `monthly`

```python
data = av_get("CPI", interval="monthly")
# unit: index 1982-1984 = 100
```

### INFLATION — Annual Inflation Rate

**No parameters** — annual data only.

```python
data = av_get("INFLATION")
# unit: percent (YoY change in CPI)
```

## Labor Market

### UNEMPLOYMENT — Unemployment Rate

**No parameters** — monthly data only.

```python
data = av_get("UNEMPLOYMENT")
latest = data["data"][0]
print(latest["date"], latest["value"])
# unit: percent
```

### NONFARM_PAYROLL — Nonfarm Payroll

**No parameters** — monthly data only.

```python
data = av_get("NONFARM_PAYROLL")
# unit: thousands of persons
```

## Consumer Spending

### RETAIL_SALES — Monthly Retail Sales

**No parameters** — monthly data only.

```python
data = av_get("RETAIL_SALES")
# unit: millions of dollars
```

### DURABLES — Durable Goods Orders

**No parameters** — monthly data only.

```python
data = av_get("DURABLES")
# unit: millions of dollars
```

## Macro Dashboard Example

```python
import pandas as pd

def econ_to_series(function, **kwargs):
    data = av_get(function, **kwargs)
    df = pd.DataFrame(data["data"])
    df["date"] = pd.to_datetime(df["date"])
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    return df.set_index("date")["value"].sort_index()

# Build economic snapshot
gdp = econ_to_series("REAL_GDP", interval="quarterly")
fed_funds = econ_to_series("FEDERAL_FUNDS_RATE", interval="monthly")
unemployment = econ_to_series("UNEMPLOYMENT")
cpi = econ_to_series("CPI", interval="monthly")
ten_yr = econ_to_series("TREASURY_YIELD", interval="monthly", maturity="10year")

print(f"Latest GDP: {gdp.iloc[-1]:.1f} billion (chained 2012$)")
print(f"Fed Funds Rate: {fed_funds.iloc[-1]:.2f}%")
print(f"Unemployment: {unemployment.iloc[-1]:.1f}%")
print(f"CPI: {cpi.iloc[-1]:.1f}")
print(f"10-Year Treasury: {ten_yr.iloc[-1]:.2f}%")

# Yield curve inversion check
two_yr = econ_to_series("TREASURY_YIELD", interval="monthly", maturity="2year")
spread = ten_yr - two_yr
print(f"Yield curve spread (10yr - 2yr): {spread.iloc[-1]:.2f}% ({'inverted' if spread.iloc[-1] < 0 else 'normal'})")
```
