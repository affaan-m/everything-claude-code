#!/usr/bin/env python3
"""
Run TimesFM forecast on global temperature anomaly data.
Generates forecast output CSV and JSON for the example.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd

# Preflight check
print("=" * 60)
print("  TIMeSFM FORECAST - Global Temperature Anomaly Example")
print("=" * 60)

# Load data
data_path = Path(__file__).parent / "temperature_anomaly.csv"
df = pd.read_csv(data_path, parse_dates=["date"])
df = df.sort_values("date").reset_index(drop=True)

print(f"\n📊 Input Data: {len(df)} months of temperature anomalies")
print(
    f"   Date range: {df['date'].min().strftime('%Y-%m')} to {df['date'].max().strftime('%Y-%m')}"
)
print(f"   Mean anomaly: {df['anomaly_c'].mean():.2f}°C")
print(
    f"   Trend: {df['anomaly_c'].iloc[-12:].mean() - df['anomaly_c'].iloc[:12].mean():.2f}°C change (first to last year)"
)

# Prepare input for TimesFM
# TimesFM expects a list of 1D numpy arrays
input_series = df["anomaly_c"].values.astype(np.float32)

# Load TimesFM 1.0 (PyTorch)
# NOTE: TimesFM 2.5 PyTorch checkpoint has a file format issue at time of writing.
# The model.safetensors file is not loadable via torch.load().
# Using TimesFM 1.0 PyTorch which works correctly.
print("\n🤖 Loading TimesFM 1.0 (200M) PyTorch...")
import timesfm

hparams = timesfm.TimesFmHparams(horizon_len=12)
checkpoint = timesfm.TimesFmCheckpoint(
    huggingface_repo_id="google/timesfm-1.0-200m-pytorch"
)
model = timesfm.TimesFm(hparams=hparams, checkpoint=checkpoint)

# Forecast
print("\n📈 Running forecast (12 months ahead)...")
forecast_input = [input_series]
frequency_input = [0]  # Monthly data

point_forecast, experimental_quantile_forecast = model.forecast(
    forecast_input,
    freq=frequency_input,
)

print(f"   Point forecast shape: {point_forecast.shape}")
print(f"   Quantile forecast shape: {experimental_quantile_forecast.shape}")

# Extract results
point = point_forecast[0]  # Shape: (horizon,)
quantiles = experimental_quantile_forecast[0]  # Shape: (horizon, num_quantiles)

# TimesFM quantiles: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.99]
# Index mapping: 0=10%, 1=20%, ..., 4=50% (median), ..., 9=99%
quantile_labels = ["10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "99%"]

# Create forecast dates (2025 monthly)
last_date = df["date"].max()
forecast_dates = pd.date_range(
    start=last_date + pd.DateOffset(months=1), periods=12, freq="MS"
)

# Build output DataFrame
output_df = pd.DataFrame(
    {
        "date": forecast_dates.strftime("%Y-%m-%d"),
        "point_forecast": point,
        "q10": quantiles[:, 0],
        "q20": quantiles[:, 1],
        "q30": quantiles[:, 2],
        "q40": quantiles[:, 3],
        "q50": quantiles[:, 4],  # Median
        "q60": quantiles[:, 5],
        "q70": quantiles[:, 6],
        "q80": quantiles[:, 7],
        "q90": quantiles[:, 8],
        "q99": quantiles[:, 9],
    }
)

# Save outputs
output_dir = Path(__file__).parent / "output"
output_dir.mkdir(exist_ok=True)
output_df.to_csv(output_dir / "forecast_output.csv", index=False)

# JSON output for the report
output_json = {
    "model": "TimesFM 1.0 (200M) PyTorch",
    "input": {
        "source": "NOAA GISTEMP Global Temperature Anomaly",
        "n_observations": len(df),
        "date_range": f"{df['date'].min().strftime('%Y-%m')} to {df['date'].max().strftime('%Y-%m')}",
        "mean_anomaly_c": round(df["anomaly_c"].mean(), 3),
    },
    "forecast": {
        "horizon": 12,
        "dates": forecast_dates.strftime("%Y-%m").tolist(),
        "point": point.tolist(),
        "quantiles": {
            label: quantiles[:, i].tolist() for i, label in enumerate(quantile_labels)
        },
    },
    "summary": {
        "forecast_mean_c": round(float(point.mean()), 3),
        "forecast_max_c": round(float(point.max()), 3),
        "forecast_min_c": round(float(point.min()), 3),
        "vs_last_year_mean": round(
            float(point.mean() - df["anomaly_c"].iloc[-12:].mean()), 3
        ),
    },
}

with open(output_dir / "forecast_output.json", "w") as f:
    json.dump(output_json, f, indent=2)

# Print summary
print("\n" + "=" * 60)
print("  FORECAST RESULTS")
print("=" * 60)
print(
    f"\n📅 Forecast period: {forecast_dates[0].strftime('%Y-%m')} to {forecast_dates[-1].strftime('%Y-%m')}"
)
print(f"\n🌡️  Temperature Anomaly Forecast (°C above 1951-1980 baseline):")
print(f"\n   {'Month':<10} {'Point':>8} {'80% CI':>15} {'90% CI':>15}")
print(f"   {'-' * 10} {'-' * 8} {'-' * 15} {'-' * 15}")
for i, (date, pt, q10, q90, q05, q95) in enumerate(
    zip(
        forecast_dates.strftime("%Y-%m"),
        point,
        quantiles[:, 1],  # 20%
        quantiles[:, 7],  # 80%
        quantiles[:, 0],  # 10%
        quantiles[:, 8],  # 90%
    )
):
    print(
        f"   {date:<10} {pt:>8.3f} [{q10:>6.3f}, {q90:>6.3f}] [{q05:>6.3f}, {q95:>6.3f}]"
    )

print(f"\n📊 Summary Statistics:")
print(f"   Mean forecast:  {point.mean():.3f}°C")
print(
    f"   Max forecast:   {point.max():.3f}°C (Month: {forecast_dates[point.argmax()].strftime('%Y-%m')})"
)
print(
    f"   Min forecast:   {point.min():.3f}°C (Month: {forecast_dates[point.argmin()].strftime('%Y-%m')})"
)
print(f"   vs 2024 mean:   {point.mean() - df['anomaly_c'].iloc[-12:].mean():+.3f}°C")

print(f"\n✅ Output saved to:")
print(f"   {output_dir / 'forecast_output.csv'}")
print(f"   {output_dir / 'forecast_output.json'}")
