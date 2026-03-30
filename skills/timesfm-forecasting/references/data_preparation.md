# Data Preparation for TimesFM

## Input Format

TimesFM accepts a **list of 1-D numpy arrays**. Each array represents one
univariate time series.

```python
inputs = [
    np.array([1.0, 2.0, 3.0, 4.0, 5.0]),       # Series 1
    np.array([10.0, 20.0, 15.0, 25.0]),          # Series 2 (different length)
    np.array([100.0, 110.0, 105.0, 115.0, 120.0, 130.0]),  # Series 3
]
```

### Key Properties

- **Variable lengths**: Series in the same batch can have different lengths
- **Float values**: Use `np.float32` or `np.float64`
- **1-D only**: Each array must be 1-dimensional (not 2-D matrix rows)
- **NaN handling**: Leading NaNs are stripped; internal NaNs are linearly interpolated

## Loading from Common Formats

### CSV — Single Series (Long Format)

```python
import pandas as pd
import numpy as np

df = pd.read_csv("data.csv", parse_dates=["date"])
values = df["value"].values.astype(np.float32)
inputs = [values]
```

### CSV — Multiple Series (Wide Format)

```python
df = pd.read_csv("data.csv", parse_dates=["date"], index_col="date")
inputs = [df[col].dropna().values.astype(np.float32) for col in df.columns]
```

### CSV — Long Format with ID Column

```python
df = pd.read_csv("data.csv", parse_dates=["date"])
inputs = []
for series_id, group in df.groupby("series_id"):
    values = group.sort_values("date")["value"].values.astype(np.float32)
    inputs.append(values)
```

### Pandas DataFrame

```python
# Single column
inputs = [df["temperature"].values.astype(np.float32)]

# Multiple columns
inputs = [df[col].dropna().values.astype(np.float32) for col in numeric_cols]
```

### Numpy Arrays

```python
# 2-D array (rows = series, cols = time steps)
data = np.load("timeseries.npy")  # shape (N, T)
inputs = [data[i] for i in range(data.shape[0])]

# Or from 1-D
inputs = [np.sin(np.linspace(0, 10, 200))]
```

### Excel

```python
df = pd.read_excel("data.xlsx", sheet_name="Sheet1")
inputs = [df[col].dropna().values.astype(np.float32) for col in df.select_dtypes(include=[np.number]).columns]
```

### Parquet

```python
df = pd.read_parquet("data.parquet")
inputs = [df[col].dropna().values.astype(np.float32) for col in df.select_dtypes(include=[np.number]).columns]
```

### JSON

```python
import json

with open("data.json") as f:
    data = json.load(f)

# Assumes {"series_name": [values...], ...}
inputs = [np.array(values, dtype=np.float32) for values in data.values()]
```

## NaN Handling

TimesFM handles NaN values automatically:

### Leading NaNs

Stripped before feeding to the model:

```python
# Input:  [NaN, NaN, 1.0, 2.0, 3.0]
# Actual: [1.0, 2.0, 3.0]
```

### Internal NaNs

Linearly interpolated:

```python
# Input:  [1.0, NaN, 3.0, NaN, NaN, 6.0]
# Actual: [1.0, 2.0, 3.0, 4.0, 5.0, 6.0]
```

### Trailing NaNs

**Not handled** — drop them before passing to the model:

```python
values = df["value"].values.astype(np.float32)
# Remove trailing NaNs
while len(values) > 0 and np.isnan(values[-1]):
    values = values[:-1]
inputs = [values]
```

### Best Practice

```python
def clean_series(arr: np.ndarray) -> np.ndarray:
    """Clean a time series for TimesFM input."""
    arr = np.asarray(arr, dtype=np.float32)
    # Remove trailing NaNs
    while len(arr) > 0 and np.isnan(arr[-1]):
        arr = arr[:-1]
    # Replace inf with NaN (will be interpolated)
    arr[np.isinf(arr)] = np.nan
    return arr

inputs = [clean_series(df[col].values) for col in cols]
```

## Context Length Considerations

| Context Length | Use Case | Notes |
| -------------- | -------- | ----- |
| 64–256 | Quick prototyping | Minimal context, fast |
| 256–512 | Daily data, ~1 year | Good balance |
| 512–1024 | Daily data, ~2-3 years | Standard production |
| 1024–4096 | Hourly data, weekly patterns | More context = better |
| 4096–16384 | High-frequency, long patterns | TimesFM 2.5 maximum |

**Rule of thumb**: Provide at least 3–5 full cycles of the dominant pattern
(e.g., for weekly seasonality with daily data, provide at least 21–35 days).

## Covariates (XReg)

TimesFM 2.5 supports exogenous variables through the `forecast_with_covariates()` API.

### Types of Covariates

| Type | Description | Example |
| ---- | ----------- | ------- |
| **Dynamic numerical** | Time-varying numeric features | Temperature, price, promotion spend |
| **Dynamic categorical** | Time-varying categorical features | Day of week, holiday flag |
| **Static categorical** | Fixed per-series features | Store ID, region, product category |

### Preparing Covariates

Each covariate must have length `context + horizon` for each series:

```python
import numpy as np

context_len = 100   # length of historical data
horizon = 24        # forecast horizon
total_len = context_len + horizon

# Dynamic numerical: temperature forecast for each series
temp = [
    np.random.randn(total_len).astype(np.float32),  # Series 1
    np.random.randn(total_len).astype(np.float32),  # Series 2
]

# Dynamic categorical: day of week (0-6) for each series
dow = [
    np.tile(np.arange(7), total_len // 7 + 1)[:total_len],  # Series 1
    np.tile(np.arange(7), total_len // 7 + 1)[:total_len],  # Series 2
]

# Static categorical: one label per series
regions = ["east", "west"]

# Forecast with covariates
point, quantiles = model.forecast_with_covariates(
    inputs=[values1, values2],
    dynamic_numerical_covariates={"temperature": temp},
    dynamic_categorical_covariates={"day_of_week": dow},
    static_categorical_covariates={"region": regions},
    xreg_mode="xreg + timesfm",
)
```

### XReg Modes

| Mode | Description |
| ---- | ----------- |
| `"xreg + timesfm"` | Covariates processed first, then combined with TimesFM forecast |
| `"timesfm + xreg"` | TimesFM forecast first, then adjusted by covariates |

## Common Data Issues

### Issue: Series too short

TimesFM needs at least 1 data point, but more context = better forecasts.

```python
MIN_LENGTH = 32  # Practical minimum for meaningful forecasts

inputs = [
    arr for arr in raw_inputs
    if len(arr[~np.isnan(arr)]) >= MIN_LENGTH
]
```

### Issue: Series with constant values

Constant series may produce NaN or zero-width prediction intervals:

```python
for i, arr in enumerate(inputs):
    if np.std(arr[~np.isnan(arr)]) < 1e-10:
        print(f"⚠️ Series {i} is constant — forecast will be flat")
```

### Issue: Extreme outliers

Large outliers can destabilize forecasts even with normalization:

```python
def clip_outliers(arr: np.ndarray, n_sigma: float = 5.0) -> np.ndarray:
    """Clip values beyond n_sigma standard deviations."""
    mu = np.nanmean(arr)
    sigma = np.nanstd(arr)
    if sigma > 0:
        arr = np.clip(arr, mu - n_sigma * sigma, mu + n_sigma * sigma)
    return arr
```

### Issue: Mixed frequencies in batch

TimesFM handles each series independently, so you can mix frequencies:

```python
inputs = [
    daily_sales,      # 365 points
    weekly_revenue,   # 52 points
    monthly_users,    # 24 points
]
# All forecasted in one batch — TimesFM handles different lengths
point, q = model.forecast(horizon=12, inputs=inputs)
```

However, the `horizon` is shared. If you need different horizons per series,
forecast in separate calls.
