# Technical Indicators APIs

All technical indicators work with equities, forex pairs, and crypto. Calculated from adjusted time series data.

## Common Parameters

| Parameter | Required | Values |
|-----------|----------|--------|
| `symbol` | Yes | Ticker (e.g., `IBM`), forex pair (`USDEUR`), or crypto pair (`BTCUSD`) |
| `interval` | Yes | `1min`, `5min`, `15min`, `30min`, `60min`, `daily`, `weekly`, `monthly` |
| `time_period` | Most | Number of periods (e.g., `14`, `20`, `50`, `200`) |
| `series_type` | Most | `close`, `open`, `high`, `low` |
| `month` | No | `YYYY-MM` for specific historical month |
| `datatype` | No | `json` or `csv` |

## Response Format

All indicators return a metadata object and a time series dictionary:

```python
data = av_get("SMA", symbol="IBM", interval="daily", time_period=20, series_type="close")
ts = data["Technical Analysis: SMA"]
# Key: "2024-01-15" → {"SMA": "185.4200"}
```

## Moving Averages

### SMA — Simple Moving Average

```python
data = av_get("SMA", symbol="AAPL", interval="daily", time_period=20, series_type="close")
ts = data["Technical Analysis: SMA"]
print(sorted(ts.keys())[-1], ts[sorted(ts.keys())[-1]]["SMA"])
```

### EMA — Exponential Moving Average

```python
data = av_get("EMA", symbol="AAPL", interval="daily", time_period=20, series_type="close")
ts = data["Technical Analysis: EMA"]  # → {"EMA": "..."}
```

### WMA — Weighted Moving Average

```python
data = av_get("WMA", symbol="IBM", interval="daily", time_period=20, series_type="close")
ts = data["Technical Analysis: WMA"]  # → {"WMA": "..."}
```

### DEMA — Double Exponential Moving Average

```python
data = av_get("DEMA", symbol="IBM", interval="daily", time_period=20, series_type="close")
ts = data["Technical Analysis: DEMA"]
```

### TEMA — Triple Exponential Moving Average

```python
data = av_get("TEMA", symbol="IBM", interval="daily", time_period=20, series_type="close")
ts = data["Technical Analysis: TEMA"]
```

### KAMA — Kaufman Adaptive Moving Average

```python
data = av_get("KAMA", symbol="IBM", interval="daily", time_period=20, series_type="close")
ts = data["Technical Analysis: KAMA"]
```

### T3 — Triple Smooth Exponential Moving Average

```python
data = av_get("T3", symbol="IBM", interval="daily", time_period=5, series_type="close")
ts = data["Technical Analysis: T3"]
```

### VWAP — Volume Weighted Average Price (Premium, intraday only)

**Required:** `symbol`, `interval` (intraday only: `1min`–`60min`)

```python
data = av_get("VWAP", symbol="AAPL", interval="5min")
ts = data["Technical Analysis: VWAP"]  # → {"VWAP": "..."}
```

---

## Momentum Indicators

### MACD — Moving Average Convergence/Divergence (Premium)

**Optional:** `fastperiod` (default 12), `slowperiod` (default 26), `signalperiod` (default 9), `series_type`

```python
data = av_get("MACD", symbol="AAPL", interval="daily", series_type="close",
              fastperiod=12, slowperiod=26, signalperiod=9)
ts = data["Technical Analysis: MACD"]
latest_date = sorted(ts.keys())[-1]
print(ts[latest_date])  # {"MACD": "...", "MACD_Signal": "...", "MACD_Hist": "..."}
```

### RSI — Relative Strength Index

```python
data = av_get("RSI", symbol="AAPL", interval="daily", time_period=14, series_type="close")
ts = data["Technical Analysis: RSI"]  # → {"RSI": "..."}
# Overbought >70, Oversold <30
latest_date = sorted(ts.keys())[-1]
print(f"RSI: {ts[latest_date]['RSI']}")
```

### STOCH — Stochastic Oscillator

**Optional:** `fastkperiod` (default 5), `slowkperiod` (default 3), `slowdperiod` (default 3), `slowkmatype`, `slowdmatype`

```python
data = av_get("STOCH", symbol="IBM", interval="daily")
ts = data["Technical Analysis: STOCH"]  # → {"SlowK": "...", "SlowD": "..."}
```

### STOCHF — Stochastic Fast

```python
data = av_get("STOCHF", symbol="IBM", interval="daily")
ts = data["Technical Analysis: STOCHF"]  # → {"FastK": "...", "FastD": "..."}
```

### STOCHRSI — Stochastic Relative Strength Index

```python
data = av_get("STOCHRSI", symbol="IBM", interval="daily", time_period=14, series_type="close")
ts = data["Technical Analysis: STOCHRSI"]  # → {"FastK": "...", "FastD": "..."}
```

### WILLR — Williams %R

```python
data = av_get("WILLR", symbol="IBM", interval="daily", time_period=14)
ts = data["Technical Analysis: WILLR"]  # → {"WILLR": "..."}
```

### MOM — Momentum

```python
data = av_get("MOM", symbol="IBM", interval="daily", time_period=10, series_type="close")
ts = data["Technical Analysis: MOM"]
```

### ROC — Rate of Change

```python
data = av_get("ROC", symbol="IBM", interval="daily", time_period=10, series_type="close")
ts = data["Technical Analysis: ROC"]
```

### CCI — Commodity Channel Index

**Required:** `symbol`, `interval`, `time_period` (no `series_type`)

```python
data = av_get("CCI", symbol="IBM", interval="daily", time_period=20)
ts = data["Technical Analysis: CCI"]
```

### CMO — Chande Momentum Oscillator

```python
data = av_get("CMO", symbol="IBM", interval="daily", time_period=14, series_type="close")
ts = data["Technical Analysis: CMO"]
```

### PPO — Percentage Price Oscillator

**Optional:** `fastperiod`, `slowperiod`, `matype`

```python
data = av_get("PPO", symbol="IBM", interval="daily", series_type="close")
ts = data["Technical Analysis: PPO"]
```

### BOP — Balance of Power

**Required:** `symbol`, `interval` (no `time_period` or `series_type`)

```python
data = av_get("BOP", symbol="IBM", interval="daily")
ts = data["Technical Analysis: BOP"]
```

---

## Trend Indicators

### ADX — Average Directional Movement Index

**Required:** `symbol`, `interval`, `time_period` (no `series_type`)

```python
data = av_get("ADX", symbol="IBM", interval="daily", time_period=14)
ts = data["Technical Analysis: ADX"]  # → {"ADX": "..."}
# ADX > 25 = strong trend
```

### AROON — Aroon

**Required:** `symbol`, `interval`, `time_period` (no `series_type`)

```python
data = av_get("AROON", symbol="IBM", interval="daily", time_period=25)
ts = data["Technical Analysis: AROON"]  # → {"Aroon Down": "...", "Aroon Up": "..."}
```

### BBANDS — Bollinger Bands

**Optional:** `nbdevup` (default 2), `nbdevdn` (default 2), `matype` (default 0=SMA)

```python
data = av_get("BBANDS", symbol="AAPL", interval="daily", time_period=20,
              series_type="close", nbdevup=2, nbdevdn=2)
ts = data["Technical Analysis: BBANDS"]
latest = ts[sorted(ts.keys())[-1]]
print(latest["Real Upper Band"], latest["Real Middle Band"], latest["Real Lower Band"])
```

### SAR — Parabolic SAR

**Optional:** `acceleration` (default 0.01), `maximum` (default 0.20)

```python
data = av_get("SAR", symbol="IBM", interval="daily")
ts = data["Technical Analysis: SAR"]
```

---

## Volume Indicators

### OBV — On Balance Volume

**Required:** `symbol`, `interval` (no `time_period` or `series_type`)

```python
data = av_get("OBV", symbol="IBM", interval="daily")
ts = data["Technical Analysis: OBV"]
```

### VWAP — See Moving Averages section above

### MFI — Money Flow Index

**Required:** `symbol`, `interval`, `time_period` (no `series_type`)

```python
data = av_get("MFI", symbol="IBM", interval="daily", time_period=14)
ts = data["Technical Analysis: MFI"]
```

---

## Volatility Indicators

### ATR — Average True Range

**Required:** `symbol`, `interval`, `time_period` (no `series_type`)

```python
data = av_get("ATR", symbol="IBM", interval="daily", time_period=14)
ts = data["Technical Analysis: ATR"]
```

### NATR — Normalized Average True Range

```python
data = av_get("NATR", symbol="IBM", interval="daily", time_period=14)
ts = data["Technical Analysis: NATR"]
```

### TRANGE — True Range

**Required:** `symbol`, `interval` (no `time_period` or `series_type`)

```python
data = av_get("TRANGE", symbol="IBM", interval="daily")
ts = data["Technical Analysis: TRANGE"]
```

---

## Full Indicator Reference

| Function | Description | Required Params |
|----------|-------------|-----------------|
| SMA | Simple Moving Average | symbol, interval, time_period, series_type |
| EMA | Exponential Moving Average | symbol, interval, time_period, series_type |
| WMA | Weighted Moving Average | symbol, interval, time_period, series_type |
| DEMA | Double EMA | symbol, interval, time_period, series_type |
| TEMA | Triple EMA | symbol, interval, time_period, series_type |
| TRIMA | Triangular MA | symbol, interval, time_period, series_type |
| KAMA | Kaufman Adaptive MA | symbol, interval, time_period, series_type |
| MAMA | MESA Adaptive MA | symbol, interval, series_type |
| VWAP | Vol Weighted Avg Price | symbol, interval (intraday only) |
| T3 | Triple Smooth EMA | symbol, interval, time_period, series_type |
| MACD | MACD | symbol, interval, series_type |
| MACDEXT | MACD with Controllable MA | symbol, interval, series_type |
| STOCH | Stochastic | symbol, interval |
| STOCHF | Stochastic Fast | symbol, interval |
| RSI | Relative Strength Index | symbol, interval, time_period, series_type |
| STOCHRSI | Stochastic RSI | symbol, interval, time_period, series_type |
| WILLR | Williams %R | symbol, interval, time_period |
| ADX | Avg Directional Index | symbol, interval, time_period |
| ADXR | ADX Rating | symbol, interval, time_period |
| APO | Absolute Price Oscillator | symbol, interval, series_type |
| PPO | Percentage Price Oscillator | symbol, interval, series_type |
| MOM | Momentum | symbol, interval, time_period, series_type |
| BOP | Balance of Power | symbol, interval |
| CCI | Commodity Channel Index | symbol, interval, time_period |
| CMO | Chande Momentum Oscillator | symbol, interval, time_period, series_type |
| ROC | Rate of Change | symbol, interval, time_period, series_type |
| ROCR | Rate of Change Ratio | symbol, interval, time_period, series_type |
| AROON | Aroon | symbol, interval, time_period |
| AROONOSC | Aroon Oscillator | symbol, interval, time_period |
| MFI | Money Flow Index | symbol, interval, time_period |
| TRIX | 1-day Rate of Change of Triple EMA | symbol, interval, time_period, series_type |
| ULTOSC | Ultimate Oscillator | symbol, interval |
| DX | Directional Movement Index | symbol, interval, time_period |
| MINUS_DI | Minus Directional Indicator | symbol, interval, time_period |
| PLUS_DI | Plus Directional Indicator | symbol, interval, time_period |
| MINUS_DM | Minus Directional Movement | symbol, interval, time_period |
| PLUS_DM | Plus Directional Movement | symbol, interval, time_period |
| BBANDS | Bollinger Bands | symbol, interval, time_period, series_type |
| MIDPOINT | MidPoint | symbol, interval, time_period, series_type |
| MIDPRICE | MidPoint Price | symbol, interval, time_period |
| SAR | Parabolic SAR | symbol, interval |
| TRANGE | True Range | symbol, interval |
| ATR | Average True Range | symbol, interval, time_period |
| NATR | Normalized ATR | symbol, interval, time_period |
| AD | Chaikin A/D Line | symbol, interval |
| ADOSC | Chaikin A/D Oscillator | symbol, interval |
| OBV | On Balance Volume | symbol, interval |
| HT_TRENDLINE | Hilbert Transform - Trendline | symbol, interval, series_type |
| HT_SINE | Hilbert Transform - SineWave | symbol, interval, series_type |
| HT_TRENDMODE | Hilbert Transform - Trend vs Cycle | symbol, interval, series_type |
| HT_DCPERIOD | Hilbert Transform - DC Period | symbol, interval, series_type |
| HT_DCPHASE | Hilbert Transform - DC Phase | symbol, interval, series_type |
| HT_PHASOR | Hilbert Transform - Phasor Components | symbol, interval, series_type |

## Multi-Indicator Analysis Example

```python
import pandas as pd

def get_indicator_series(function, symbol, interval="daily", **kwargs):
    data = av_get(function, symbol=symbol, interval=interval, **kwargs)
    key = f"Technical Analysis: {function}"
    ts = data[key]
    rows = []
    for date, values in ts.items():
        row = {"date": date}
        row.update(values)
        rows.append(row)
    df = pd.DataFrame(rows)
    df["date"] = pd.to_datetime(df["date"])
    df = df.set_index("date").sort_index()
    return df.astype(float)

# Get RSI and BBANDS for signal generation
rsi = get_indicator_series("RSI", "AAPL", time_period=14, series_type="close")
bbands = get_indicator_series("BBANDS", "AAPL", time_period=20, series_type="close")

# Oversold condition: RSI < 30 AND price near lower band
print("Recent RSI values:")
print(rsi["RSI"].tail(5))
```
