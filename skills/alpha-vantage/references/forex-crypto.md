# Forex (FX) & Cryptocurrency APIs

## Foreign Exchange Rates

### CURRENCY_EXCHANGE_RATE — Realtime Exchange Rate

Returns the realtime exchange rate for any currency pair (fiat or crypto).

**Required:** `from_currency`, `to_currency`

```python
# Fiat to fiat
data = av_get("CURRENCY_EXCHANGE_RATE", from_currency="USD", to_currency="EUR")
rate_info = data["Realtime Currency Exchange Rate"]
print(rate_info["5. Exchange Rate"])   # e.g., "0.92"
print(rate_info["6. Last Refreshed"])
print(rate_info["8. Bid Price"])
print(rate_info["9. Ask Price"])
# Full fields: "1. From_Currency Code", "2. From_Currency Name",
#              "3. To_Currency Code", "4. To_Currency Name",
#              "5. Exchange Rate", "6. Last Refreshed",
#              "7. Time Zone", "8. Bid Price", "9. Ask Price"

# Crypto to fiat
data = av_get("CURRENCY_EXCHANGE_RATE", from_currency="BTC", to_currency="USD")
print(data["Realtime Currency Exchange Rate"]["5. Exchange Rate"])
```

### FX_INTRADAY — Intraday Forex OHLCV (Premium)

**Required:** `from_symbol`, `to_symbol`, `interval` (`1min`, `5min`, `15min`, `30min`, `60min`)

**Optional:** `outputsize` (`compact`/`full`), `datatype`

```python
data = av_get("FX_INTRADAY", from_symbol="EUR", to_symbol="USD", interval="5min")
ts = data["Time Series FX (5min)"]
# Key: "2024-01-15 16:00:00" → {"1. open", "2. high", "3. low", "4. close"}
```

### FX_DAILY — Daily Forex OHLCV

**Required:** `from_symbol`, `to_symbol`

**Optional:** `outputsize` (`compact`/`full`), `datatype`

```python
data = av_get("FX_DAILY", from_symbol="EUR", to_symbol="USD", outputsize="full")
ts = data["Time Series FX (Daily)"]
# Key: "2024-01-15" → {"1. open", "2. high", "3. low", "4. close"}
```

### FX_WEEKLY — Weekly Forex OHLCV

```python
data = av_get("FX_WEEKLY", from_symbol="EUR", to_symbol="USD")
ts = data["Time Series FX (Weekly)"]
```

### FX_MONTHLY — Monthly Forex OHLCV

```python
data = av_get("FX_MONTHLY", from_symbol="EUR", to_symbol="USD")
ts = data["Time Series FX (Monthly)"]
```

## Common Currency Codes

| Code | Currency |
|------|---------|
| USD | US Dollar |
| EUR | Euro |
| GBP | British Pound |
| JPY | Japanese Yen |
| CHF | Swiss Franc |
| CAD | Canadian Dollar |
| AUD | Australian Dollar |
| CNY | Chinese Yuan |
| HKD | Hong Kong Dollar |
| BTC | Bitcoin |
| ETH | Ethereum |

---

## Cryptocurrency

### CRYPTO_INTRADAY — Crypto Intraday OHLCV (Premium)

**Required:** `symbol`, `market`, `interval` (`1min`, `5min`, `15min`, `30min`, `60min`)

**Optional:** `outputsize` (`compact`/`full`), `datatype`

```python
data = av_get("CRYPTO_INTRADAY", symbol="ETH", market="USD", interval="5min")
ts = data["Time Series Crypto (5min)"]
# Key: "2024-01-15 16:00:00" → {"1. open", "2. high", "3. low", "4. close", "5. volume"}
```

### DIGITAL_CURRENCY_DAILY — Daily Crypto OHLCV

**Required:** `symbol`, `market`

```python
data = av_get("DIGITAL_CURRENCY_DAILY", symbol="BTC", market="USD")
ts = data["Time Series (Digital Currency Daily)"]
# Key: "2024-01-15" → {
#   "1a. open (USD)", "1b. open (USD)",
#   "2a. high (USD)", "2b. high (USD)",
#   "3a. low (USD)",  "3b. low (USD)",
#   "4a. close (USD)", "4b. close (USD)",
#   "5. volume", "6. market cap (USD)"
# }

# Convert to DataFrame
import pandas as pd
df = pd.DataFrame.from_dict(ts, orient="index")
df.index = pd.to_datetime(df.index)
df = df.sort_index()
# Extract close price
df["close"] = pd.to_numeric(df["4a. close (USD)"])
```

### DIGITAL_CURRENCY_WEEKLY — Weekly Crypto OHLCV

**Required:** `symbol`, `market`

```python
data = av_get("DIGITAL_CURRENCY_WEEKLY", symbol="BTC", market="USD")
ts = data["Time Series (Digital Currency Weekly)"]
```

### DIGITAL_CURRENCY_MONTHLY — Monthly Crypto OHLCV

**Required:** `symbol`, `market`

```python
data = av_get("DIGITAL_CURRENCY_MONTHLY", symbol="ETH", market="USD")
ts = data["Time Series (Digital Currency Monthly)"]
```

## Common Crypto Symbols

| Symbol | Name |
|--------|------|
| BTC | Bitcoin |
| ETH | Ethereum |
| BNB | Binance Coin |
| XRP | Ripple |
| ADA | Cardano |
| SOL | Solana |
| DOGE | Dogecoin |
| AVAX | Avalanche |
| DOT | Polkadot |
| MATIC | Polygon |
