# Time Series Stock Data APIs

Base URL: `https://www.alphavantage.co/query`

## GLOBAL_QUOTE — Latest Price

Returns the latest price and volume for a ticker.

**Required:** `symbol`

```python
data = av_get("GLOBAL_QUOTE", symbol="IBM")
q = data["Global Quote"]
# q keys: "01. symbol", "02. open", "03. high", "04. low", "05. price",
#          "06. volume", "07. latest trading day", "08. previous close",
#          "09. change", "10. change percent"
print(q["05. price"])  # "217.51"
```

## TIME_SERIES_INTRADAY — Intraday OHLCV (Premium)

Returns intraday candles with 20+ years of history.

**Required:** `symbol`, `interval` (`1min`, `5min`, `15min`, `30min`, `60min`)

**Optional:**
- `adjusted` — default `true` (split/dividend adjusted)
- `extended_hours` — default `true` (pre/post market included)
- `month` — format `YYYY-MM` (query specific historical month)
- `outputsize` — `compact` (100 points) or `full` (30 days / full month)
- `entitlement` — `realtime` or `delayed` (15-min delayed)
- `datatype` — `json` or `csv`

```python
data = av_get("TIME_SERIES_INTRADAY", symbol="IBM", interval="5min", outputsize="compact")
ts = data["Time Series (5min)"]
# Key: "2024-01-15 16:00:00" → {"1. open": "...", "2. high": ..., "3. low": ..., "4. close": ..., "5. volume": ...}

# Get specific historical month
data = av_get("TIME_SERIES_INTRADAY", symbol="IBM", interval="5min", month="2023-06", outputsize="full")
```

## TIME_SERIES_DAILY — Daily OHLCV

**Required:** `symbol`

**Optional:** `outputsize` (`compact`=100 points, `full`=20+ years), `datatype`

```python
data = av_get("TIME_SERIES_DAILY", symbol="IBM", outputsize="full")
ts = data["Time Series (Daily)"]
# Key: "2024-01-15" → {"1. open", "2. high", "3. low", "4. close", "5. volume"}
```

## TIME_SERIES_DAILY_ADJUSTED — Daily OHLCV with Adjustments (Premium)

Includes split coefficient and dividend amount.

**Required:** `symbol`

**Optional:** `outputsize`, `datatype`

```python
data = av_get("TIME_SERIES_DAILY_ADJUSTED", symbol="IBM")
ts = data["Time Series (Daily)"]
# Extra keys: "6. adjusted close", "7. dividend amount", "8. split coefficient"
```

## TIME_SERIES_WEEKLY — Weekly OHLCV

**Required:** `symbol`

**Optional:** `datatype`

```python
data = av_get("TIME_SERIES_WEEKLY", symbol="IBM")
ts = data["Weekly Time Series"]
```

## TIME_SERIES_WEEKLY_ADJUSTED — Weekly OHLCV with Adjustments

```python
data = av_get("TIME_SERIES_WEEKLY_ADJUSTED", symbol="IBM")
ts = data["Weekly Adjusted Time Series"]
```

## TIME_SERIES_MONTHLY — Monthly OHLCV

```python
data = av_get("TIME_SERIES_MONTHLY", symbol="IBM")
ts = data["Monthly Time Series"]
```

## TIME_SERIES_MONTHLY_ADJUSTED — Monthly with Adjustments

```python
data = av_get("TIME_SERIES_MONTHLY_ADJUSTED", symbol="IBM")
ts = data["Monthly Adjusted Time Series"]
```

## REALTIME_BULK_QUOTES — Multiple Tickers (Premium)

Get quotes for up to 100 symbols in one request.

**Required:** `symbol` — comma-separated list (e.g., `IBM,AAPL,MSFT`)

```python
data = av_get("REALTIME_BULK_QUOTES", symbol="IBM,AAPL,MSFT,GOOGL")
quotes = data["data"]  # list of quote objects
for q in quotes:
    print(q["symbol"], q["price"])
```

## SYMBOL_SEARCH — Ticker Search

Search for ticker symbols by keyword.

**Required:** `keywords`

**Optional:** `datatype`

```python
data = av_get("SYMBOL_SEARCH", keywords="Microsoft")
matches = data["bestMatches"]
for m in matches:
    print(m["1. symbol"], m["2. name"], m["4. region"])
# Fields: "1. symbol", "2. name", "3. type", "4. region",
#         "5. marketOpen", "6. marketClose", "7. timezone",
#         "8. currency", "9. matchScore"
```

## MARKET_STATUS — Global Market Hours

Returns open/closed status for major global exchanges.

```python
data = av_get("MARKET_STATUS")
markets = data["markets"]
for m in markets:
    print(m["market_type"], m["region"], m["current_status"])
# Fields: "market_type", "region", "primary_exchanges",
#         "local_open", "local_close", "current_status", "notes"
```

## Convert to DataFrame

```python
import pandas as pd

data = av_get("TIME_SERIES_DAILY", symbol="AAPL", outputsize="full")
ts = data["Time Series (Daily)"]
df = pd.DataFrame.from_dict(ts, orient="index")
df.columns = ["open", "high", "low", "close", "volume"]
df.index = pd.to_datetime(df.index)
df = df.astype(float).sort_index()
print(df.tail())
```
