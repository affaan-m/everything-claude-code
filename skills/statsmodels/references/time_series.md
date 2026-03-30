# Time Series Analysis Reference

This document provides comprehensive guidance on time series models in statsmodels, including ARIMA, state space models, VAR, exponential smoothing, and forecasting methods.

## Overview

Statsmodels offers extensive time series capabilities:
- **Univariate models**: AR, ARIMA, SARIMAX, Exponential Smoothing
- **Multivariate models**: VAR, VARMAX, Dynamic Factor Models
- **State space framework**: Custom models, Kalman filtering
- **Diagnostic tools**: ACF, PACF, stationarity tests, residual analysis
- **Forecasting**: Point forecasts and prediction intervals

## Univariate Time Series Models

### AutoReg (AR Model)

Autoregressive model: current value depends on past values.

**When to use:**
- Univariate time series
- Past values predict future
- Stationary series

**Model**: yₜ = c + φ₁yₜ₋₁ + φ₂yₜ₋₂ + ... + φₚyₜ₋ₚ + εₜ

```python
from statsmodels.tsa.ar_model import AutoReg
import pandas as pd

# Fit AR(p) model
model = AutoReg(y, lags=5)  # AR(5)
results = model.fit()

print(results.summary())
```

**With exogenous regressors:**
```python
# AR with exogenous variables (ARX)
model = AutoReg(y, lags=5, exog=X_exog)
results = model.fit()
```

**Seasonal AR:**
```python
# Seasonal lags (e.g., monthly data with yearly seasonality)
model = AutoReg(y, lags=12, seasonal=True)
results = model.fit()
```

### ARIMA (Autoregressive Integrated Moving Average)

Combines AR, differencing (I), and MA components.

**When to use:**
- Non-stationary time series (needs differencing)
- Past values and errors predict future
- Flexible model for many time series

**Model**: ARIMA(p,d,q)
- p: AR order (lags)
- d: differencing order (to achieve stationarity)
- q: MA order (lagged forecast errors)

```python
from statsmodels.tsa.arima.model import ARIMA

# Fit ARIMA(p,d,q)
model = ARIMA(y, order=(1, 1, 1))  # ARIMA(1,1,1)
results = model.fit()

print(results.summary())
```

**Choosing p, d, q:**

1. **Determine d (differencing order)**:
```python
from statsmodels.tsa.stattools import adfuller

# ADF test for stationarity
def check_stationarity(series):
    result = adfuller(series)
    print(f"ADF Statistic: {result[0]:.4f}")
    print(f"p-value: {result[1]:.4f}")
    if result[1] <= 0.05:
        print("Series is stationary")
        return True
    else:
        print("Series is non-stationary, needs differencing")
        return False

# Test original series
if not check_stationarity(y):
    # Difference once
    y_diff = y.diff().dropna()
    if not check_stationarity(y_diff):
        # Difference again
        y_diff2 = y_diff.diff().dropna()
        check_stationarity(y_diff2)
```

2. **Determine p and q (ACF/PACF)**:
```python
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
import matplotlib.pyplot as plt

# After differencing to stationarity
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))

# ACF: helps determine q (MA order)
plot_acf(y_stationary, lags=40, ax=ax1)
ax1.set_title('Autocorrelation Function (ACF)')

# PACF: helps determine p (AR order)
plot_pacf(y_stationary, lags=40, ax=ax2)
ax2.set_title('Partial Autocorrelation Function (PACF)')

plt.tight_layout()
plt.show()

# Rules of thumb:
# - PACF cuts off at lag p → AR(p)
# - ACF cuts off at lag q → MA(q)
# - Both decay → ARMA(p,q)
```

3. **Model selection (AIC/BIC)**:
```python
# Grid search for best (p,q) given d
import numpy as np

best_aic = np.inf
best_order = None

for p in range(5):
    for q in range(5):
        try:
            model = ARIMA(y, order=(p, d, q))
            results = model.fit()
            if results.aic < best_aic:
                best_aic = results.aic
                best_order = (p, d, q)
        except:
            continue

print(f"Best order: {best_order} with AIC: {best_aic:.2f}")
```

### SARIMAX (Seasonal ARIMA with Exogenous Variables)

Extends ARIMA with seasonality and exogenous regressors.

**When to use:**
- Seasonal patterns (monthly, quarterly data)
- External variables influence series
- Most flexible univariate model

**Model**: SARIMAX(p,d,q)(P,D,Q,s)
- (p,d,q): Non-seasonal ARIMA
- (P,D,Q,s): Seasonal ARIMA with period s

```python
from statsmodels.tsa.statespace.sarimax import SARIMAX

# Seasonal ARIMA for monthly data (s=12)
model = SARIMAX(y,
                order=(1, 1, 1),           # (p,d,q)
                seasonal_order=(1, 1, 1, 12))  # (P,D,Q,s)
results = model.fit()

print(results.summary())
```

**With exogenous variables:**
```python
# SARIMAX with external predictors
model = SARIMAX(y,
                exog=X_exog,
                order=(1, 1, 1),
                seasonal_order=(1, 1, 1, 12))
results = model.fit()
```

**Example: Monthly sales with trend and seasonality**
```python
# Typical for monthly data: (p,d,q)(P,D,Q,12)
# Start with (1,1,1)(1,1,1,12) or (0,1,1)(0,1,1,12)

model = SARIMAX(monthly_sales,
                order=(0, 1, 1),
                seasonal_order=(0, 1, 1, 12),
                enforce_stationarity=False,
                enforce_invertibility=False)
results = model.fit()
```

### Exponential Smoothing

Weighted averages of past observations with exponentially decreasing weights.

**When to use:**
- Simple, interpretable forecasts
- Trend and/or seasonality present
- No need for explicit model specification

**Types:**
- Simple Exponential Smoothing: no trend, no seasonality
- Holt's method: with trend
- Holt-Winters: with trend and seasonality

```python
from statsmodels.tsa.holtwinters import ExponentialSmoothing

# Simple exponential smoothing
model = ExponentialSmoothing(y, trend=None, seasonal=None)
results = model.fit()

# Holt's method (with trend)
model = ExponentialSmoothing(y, trend='add', seasonal=None)
results = model.fit()

# Holt-Winters (trend + seasonality)
model = ExponentialSmoothing(y,
                            trend='add',           # 'add' or 'mul'
                            seasonal='add',        # 'add' or 'mul'
                            seasonal_periods=12)   # e.g., 12 for monthly
results = model.fit()

print(results.summary())
```

**Additive vs Multiplicative:**
```python
# Additive: constant seasonal variation
# yₜ = Level + Trend + Seasonal + Error

# Multiplicative: proportional seasonal variation
# yₜ = Level × Trend × Seasonal × Error

# Choose based on data:
# - Additive: seasonal variation constant over time
# - Multiplicative: seasonal variation increases with level
```

**Innovations state space (ETS):**
```python
from statsmodels.tsa.exponential_smoothing.ets import ETSModel

# More robust, state space formulation
model = ETSModel(y,
                error='add',           # 'add' or 'mul'
                trend='add',           # 'add', 'mul', or None
                seasonal='add',        # 'add', 'mul', or None
                seasonal_periods=12)
results = model.fit()
```

## Multivariate Time Series

### VAR (Vector Autoregression)

System of equations where each variable depends on past values of all variables.

**When to use:**
- Multiple interrelated time series
- Bidirectional relationships
- Granger causality testing

**Model**: Each variable is AR on all variables:
- y₁ₜ = c₁ + φ₁₁y₁ₜ₋₁ + φ₁₂y₂ₜ₋₁ + ... + ε₁ₜ
- y₂ₜ = c₂ + φ₂₁y₁ₜ₋₁ + φ₂₂y₂ₜ₋₁ + ... + ε₂ₜ

```python
from statsmodels.tsa.api import VAR
import pandas as pd

# Data should be DataFrame with multiple columns
# Each column is a time series
df_multivariate = pd.DataFrame({'series1': y1, 'series2': y2, 'series3': y3})

# Fit VAR
model = VAR(df_multivariate)

# Select lag order using AIC/BIC
lag_order_results = model.select_order(maxlags=15)
print(lag_order_results.summary())

# Fit with optimal lags
results = model.fit(maxlags=5, ic='aic')
print(results.summary())
```

**Granger causality testing:**
```python
# Test if series1 Granger-causes series2
from statsmodels.tsa.stattools import grangercausalitytests

# Requires 2D array [series2, series1]
test_data = df_multivariate[['series2', 'series1']]

# Test up to max_lag
max_lag = 5
results = grangercausalitytests(test_data, max_lag, verbose=True)

# P-values for each lag
for lag in range(1, max_lag + 1):
    p_value = results[lag][0]['ssr_ftest'][1]
    print(f"Lag {lag}: p-value = {p_value:.4f}")
```

**Impulse Response Functions (IRF):**
```python
# Trace effect of shock through system
irf = results.irf(10)  # 10 periods ahead

# Plot IRFs
irf.plot(orth=True)  # Orthogonalized (Cholesky decomposition)
plt.show()

# Cumulative effects
irf.plot_cum_effects(orth=True)
plt.show()
```

**Forecast Error Variance Decomposition:**
```python
# Contribution of each variable to forecast error variance
fevd = results.fevd(10)  # 10 periods ahead
fevd.plot()
plt.show()
```

### VARMAX (VAR with Moving Average and Exogenous Variables)

Extends VAR with MA component and external regressors.

**When to use:**
- VAR inadequate (MA component needed)
- External variables affect system
- More flexible multivariate model

```python
from statsmodels.tsa.statespace.varmax import VARMAX

# VARMAX(p, q) with exogenous variables
model = VARMAX(df_multivariate,
               order=(1, 1),        # (p, q)
               exog=X_exog)
results = model.fit()

print(results.summary())
```

## State Space Models

Flexible framework for custom time series models.

**When to use:**
- Custom model specification
- Unobserved components
- Kalman filtering/smoothing
- Missing data

```python
from statsmodels.tsa.statespace.mlemodel import MLEModel

# Extend MLEModel for custom state space models
# Example: Local level model (random walk + noise)
```

**Dynamic Factor Models:**
```python
from statsmodels.tsa.statespace.dynamic_factor import DynamicFactor

# Extract common factors from multiple time series
model = DynamicFactor(df_multivariate,
                      k_factors=2,          # Number of factors
                      factor_order=2)       # AR order of factors
results = model.fit()

# Estimated factors
factors = results.factors.filtered
```

## Forecasting

### Point Forecasts

```python
# ARIMA forecasting
model = ARIMA(y, order=(1, 1, 1))
results = model.fit()

# Forecast h steps ahead
h = 10
forecast = results.forecast(steps=h)

# With exogenous variables (SARIMAX)
model = SARIMAX(y, exog=X, order=(1, 1, 1))
results = model.fit()

# Need future exogenous values
forecast = results.forecast(steps=h, exog=X_future)
```

### Prediction Intervals

```python
# Get forecast with confidence intervals
forecast_obj = results.get_forecast(steps=h)
forecast_df = forecast_obj.summary_frame()

print(forecast_df)
# Contains: mean, mean_se, mean_ci_lower, mean_ci_upper

# Extract components
forecast_mean = forecast_df['mean']
forecast_ci_lower = forecast_df['mean_ci_lower']
forecast_ci_upper = forecast_df['mean_ci_upper']

# Plot
import matplotlib.pyplot as plt

plt.figure(figsize=(12, 6))
plt.plot(y.index, y, label='Historical')
plt.plot(forecast_df.index, forecast_mean, label='Forecast', color='red')
plt.fill_between(forecast_df.index,
                 forecast_ci_lower,
                 forecast_ci_upper,
                 alpha=0.3, color='red', label='95% CI')
plt.legend()
plt.title('Forecast with Prediction Intervals')
plt.show()
```

### Dynamic vs Static Forecasts

```python
# Static (one-step-ahead, using actual values)
static_forecast = results.get_prediction(start=split_point, end=len(y)-1)

# Dynamic (multi-step, using predicted values)
dynamic_forecast = results.get_prediction(start=split_point,
                                          end=len(y)-1,
                                          dynamic=True)

# Plot comparison
fig, ax = plt.subplots(figsize=(12, 6))
y.plot(ax=ax, label='Actual')
static_forecast.predicted_mean.plot(ax=ax, label='Static forecast')
dynamic_forecast.predicted_mean.plot(ax=ax, label='Dynamic forecast')
ax.legend()
plt.show()
```

## Diagnostic Tests

### Stationarity Tests

```python
from statsmodels.tsa.stattools import adfuller, kpss

# Augmented Dickey-Fuller (ADF) test
# H0: unit root (non-stationary)
adf_result = adfuller(y, autolag='AIC')
print(f"ADF Statistic: {adf_result[0]:.4f}")
print(f"p-value: {adf_result[1]:.4f}")
if adf_result[1] <= 0.05:
    print("Reject H0: Series is stationary")
else:
    print("Fail to reject H0: Series is non-stationary")

# KPSS test
# H0: stationary (opposite of ADF)
kpss_result = kpss(y, regression='c', nlags='auto')
print(f"KPSS Statistic: {kpss_result[0]:.4f}")
print(f"p-value: {kpss_result[1]:.4f}")
if kpss_result[1] <= 0.05:
    print("Reject H0: Series is non-stationary")
else:
    print("Fail to reject H0: Series is stationary")
```

### Residual Diagnostics

```python
# Ljung-Box test for autocorrelation in residuals
from statsmodels.stats.diagnostic import acorr_ljungbox

lb_test = acorr_ljungbox(results.resid, lags=10, return_df=True)
print(lb_test)
# P-values > 0.05 indicate no significant autocorrelation (good)

# Plot residual diagnostics
results.plot_diagnostics(figsize=(12, 8))
plt.show()

# Components:
# 1. Standardized residuals over time
# 2. Histogram + KDE of residuals
# 3. Q-Q plot for normality
# 4. Correlogram (ACF of residuals)
```

### Heteroskedasticity Tests

```python
from statsmodels.stats.diagnostic import het_arch

# ARCH test for heteroskedasticity
arch_test = het_arch(results.resid, nlags=10)
print(f"ARCH test statistic: {arch_test[0]:.4f}")
print(f"p-value: {arch_test[1]:.4f}")

# If significant, consider GARCH model
```

## Seasonal Decomposition

```python
from statsmodels.tsa.seasonal import seasonal_decompose

# Decompose into trend, seasonal, residual
decomposition = seasonal_decompose(y,
                                   model='additive',  # or 'multiplicative'
                                   period=12)         # seasonal period

# Plot components
fig = decomposition.plot()
fig.set_size_inches(12, 8)
plt.show()

# Access components
trend = decomposition.trend
seasonal = decomposition.seasonal
residual = decomposition.resid

# STL decomposition (more robust)
from statsmodels.tsa.seasonal import STL

stl = STL(y, seasonal=13)  # seasonal must be odd
stl_result = stl.fit()

fig = stl_result.plot()
plt.show()
```

## Model Evaluation

### In-Sample Metrics

```python
# From results object
print(f"AIC: {results.aic:.2f}")
print(f"BIC: {results.bic:.2f}")
print(f"Log-likelihood: {results.llf:.2f}")

# MSE on training data
from sklearn.metrics import mean_squared_error

mse = mean_squared_error(y, results.fittedvalues)
rmse = np.sqrt(mse)
print(f"RMSE: {rmse:.4f}")

# MAE
from sklearn.metrics import mean_absolute_error
mae = mean_absolute_error(y, results.fittedvalues)
print(f"MAE: {mae:.4f}")
```

### Out-of-Sample Evaluation

```python
# Train-test split for time series (no shuffle!)
train_size = int(0.8 * len(y))
y_train = y[:train_size]
y_test = y[train_size:]

# Fit on training data
model = ARIMA(y_train, order=(1, 1, 1))
results = model.fit()

# Forecast test period
forecast = results.forecast(steps=len(y_test))

# Metrics
from sklearn.metrics import mean_squared_error, mean_absolute_error

rmse = np.sqrt(mean_squared_error(y_test, forecast))
mae = mean_absolute_error(y_test, forecast)
mape = np.mean(np.abs((y_test - forecast) / y_test)) * 100

print(f"Test RMSE: {rmse:.4f}")
print(f"Test MAE: {mae:.4f}")
print(f"Test MAPE: {mape:.2f}%")
```

### Rolling Forecast

```python
# More realistic evaluation: rolling one-step-ahead forecasts
forecasts = []

for t in range(len(y_test)):
    # Refit or update with new observation
    y_current = y[:train_size + t]
    model = ARIMA(y_current, order=(1, 1, 1))
    fit = model.fit()

    # One-step forecast
    fc = fit.forecast(steps=1)[0]
    forecasts.append(fc)

forecasts = np.array(forecasts)

rmse = np.sqrt(mean_squared_error(y_test, forecasts))
print(f"Rolling forecast RMSE: {rmse:.4f}")
```

### Cross-Validation

```python
# Time series cross-validation (expanding window)
from sklearn.model_selection import TimeSeriesSplit

tscv = TimeSeriesSplit(n_splits=5)
rmse_scores = []

for train_idx, test_idx in tscv.split(y):
    y_train_cv = y.iloc[train_idx]
    y_test_cv = y.iloc[test_idx]

    model = ARIMA(y_train_cv, order=(1, 1, 1))
    results = model.fit()

    forecast = results.forecast(steps=len(test_idx))
    rmse = np.sqrt(mean_squared_error(y_test_cv, forecast))
    rmse_scores.append(rmse)

print(f"CV RMSE: {np.mean(rmse_scores):.4f} ± {np.std(rmse_scores):.4f}")
```

## Advanced Topics

### ARDL (Autoregressive Distributed Lag)

Bridges univariate and multivariate time series.

```python
from statsmodels.tsa.ardl import ARDL

# ARDL(p, q) model
# y depends on its own lags and lags of X
model = ARDL(y, lags=2, exog=X, exog_lags=2)
results = model.fit()
```

### Error Correction Models

For cointegrated series.

```python
from statsmodels.tsa.vector_ar.vecm import coint_johansen

# Test for cointegration
johansen_test = coint_johansen(df_multivariate, det_order=0, k_ar_diff=1)

# Fit VECM if cointegrated
from statsmodels.tsa.vector_ar.vecm import VECM

model = VECM(df_multivariate, k_ar_diff=1, coint_rank=1)
results = model.fit()
```

### Regime Switching Models

For structural breaks and regime changes.

```python
from statsmodels.tsa.regime_switching.markov_regression import MarkovRegression

# Markov switching model
model = MarkovRegression(y, k_regimes=2, order=1)
results = model.fit()

# Smoothed probabilities of regimes
regime_probs = results.smoothed_marginal_probabilities
```

## Best Practices

1. **Check stationarity**: Difference if needed, verify with ADF/KPSS tests
2. **Plot data**: Always visualize before modeling
3. **Identify seasonality**: Use appropriate seasonal models (SARIMAX, Holt-Winters)
4. **Model selection**: Use AIC/BIC and out-of-sample validation
5. **Residual diagnostics**: Check for autocorrelation, normality, heteroskedasticity
6. **Forecast evaluation**: Use rolling forecasts and proper time series CV
7. **Avoid overfitting**: Prefer simpler models, use information criteria
8. **Document assumptions**: Note any data transformations (log, differencing)
9. **Prediction intervals**: Always provide uncertainty estimates
10. **Refit regularly**: Update models as new data arrives

## Common Pitfalls

1. **Not checking stationarity**: Fit ARIMA on non-stationary data
2. **Data leakage**: Using future data in transformations
3. **Wrong seasonal period**: S=4 for quarterly, S=12 for monthly
4. **Overfitting**: Too many parameters relative to data
5. **Ignoring residual autocorrelation**: Model inadequate
6. **Using inappropriate metrics**: MAPE fails with zeros or negatives
7. **Not handling missing data**: Affects model estimation
8. **Extrapolating exogenous variables**: Need future X values for SARIMAX
9. **Confusing static vs dynamic forecasts**: Dynamic more realistic for multi-step
10. **Not validating forecasts**: Always check out-of-sample performance
