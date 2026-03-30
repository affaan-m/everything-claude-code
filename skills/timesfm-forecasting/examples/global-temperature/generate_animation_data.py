#!/usr/bin/env python3
"""
Generate animation data for interactive forecast visualization.

This script runs TimesFM forecasts incrementally, starting with minimal data
and adding one point at a time. Each forecast extends to the final date (2025-12).

Output: animation_data.json with all forecast steps
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
import timesfm

# Configuration
MIN_CONTEXT = 12  # Minimum points to start forecasting
MAX_HORIZON = (
    36  # Max forecast length (when we have 12 points, forecast 36 months to 2025-12)
)
TOTAL_MONTHS = 48  # Total months from 2022-01 to 2025-12 (graph extent)
INPUT_FILE = Path(__file__).parent / "temperature_anomaly.csv"
OUTPUT_FILE = Path(__file__).parent / "output" / "animation_data.json"


def main() -> None:
    print("=" * 60)
    print("  TIMESFM ANIMATION DATA GENERATOR")
    print("  Dynamic horizon - forecasts always reach 2025-12")
    print("=" * 60)

    # Load data
    df = pd.read_csv(INPUT_FILE, parse_dates=["date"])
    df = df.sort_values("date").reset_index(drop=True)

    all_dates = df["date"].tolist()
    all_values = df["anomaly_c"].values.astype(np.float32)

    print(f"\n📊 Total data: {len(all_values)} months")
    print(
        f"   Date range: {all_dates[0].strftime('%Y-%m')} to {all_dates[-1].strftime('%Y-%m')}"
    )
    print(f"   Animation steps: {len(all_values) - MIN_CONTEXT + 1}")

    # Load TimesFM with max horizon (will truncate output for shorter forecasts)
    print(f"\n🤖 Loading TimesFM 1.0 (200M) PyTorch (horizon={MAX_HORIZON})...")
    hparams = timesfm.TimesFmHparams(horizon_len=MAX_HORIZON)
    checkpoint = timesfm.TimesFmCheckpoint(
        huggingface_repo_id="google/timesfm-1.0-200m-pytorch"
    )
    model = timesfm.TimesFm(hparams=hparams, checkpoint=checkpoint)

    # Generate forecasts for each step
    animation_steps = []

    for n_points in range(MIN_CONTEXT, len(all_values) + 1):
        step_num = n_points - MIN_CONTEXT + 1
        total_steps = len(all_values) - MIN_CONTEXT + 1

        # Calculate dynamic horizon: forecast enough to reach 2025-12
        horizon = TOTAL_MONTHS - n_points

        print(
            f"\n📈 Step {step_num}/{total_steps}: Using {n_points} points, forecasting {horizon} months..."
        )

        # Get historical data up to this point
        historical_values = all_values[:n_points]
        historical_dates = all_dates[:n_points]

        # Run forecast (model outputs MAX_HORIZON, we truncate to actual horizon)
        point, quantiles = model.forecast(
            [historical_values],
            freq=[0],
        )

        # Truncate to actual horizon
        point = point[0][:horizon]
        quantiles = quantiles[0, :horizon, :]

        # Determine forecast dates
        last_date = historical_dates[-1]
        forecast_dates = pd.date_range(
            start=last_date + pd.DateOffset(months=1),
            periods=horizon,
            freq="MS",
        )

        # Store step data
        step_data = {
            "step": step_num,
            "n_points": n_points,
            "horizon": horizon,
            "last_historical_date": historical_dates[-1].strftime("%Y-%m"),
            "historical_dates": [d.strftime("%Y-%m") for d in historical_dates],
            "historical_values": historical_values.tolist(),
            "forecast_dates": [d.strftime("%Y-%m") for d in forecast_dates],
            "point_forecast": point.tolist(),
            "q10": quantiles[:, 0].tolist(),
            "q20": quantiles[:, 1].tolist(),
            "q80": quantiles[:, 7].tolist(),
            "q90": quantiles[:, 8].tolist(),
        }

        animation_steps.append(step_data)

        # Show summary
        print(f"   Last date: {historical_dates[-1].strftime('%Y-%m')}")
        print(f"   Forecast to: {forecast_dates[-1].strftime('%Y-%m')}")
        print(f"   Forecast mean: {point.mean():.3f}°C")

    # Create output
    output = {
        "metadata": {
            "model": "TimesFM 1.0 (200M) PyTorch",
            "total_steps": len(animation_steps),
            "min_context": MIN_CONTEXT,
            "max_horizon": MAX_HORIZON,
            "total_months": TOTAL_MONTHS,
            "data_source": "NOAA GISTEMP Global Temperature Anomaly",
            "full_date_range": f"{all_dates[0].strftime('%Y-%m')} to {all_dates[-1].strftime('%Y-%m')}",
        },
        "actual_data": {
            "dates": [d.strftime("%Y-%m") for d in all_dates],
            "values": all_values.tolist(),
        },
        "animation_steps": animation_steps,
    }

    # Save
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n" + "=" * 60)
    print("  ✅ ANIMATION DATA COMPLETE")
    print("=" * 60)
    print(f"\n📁 Output: {OUTPUT_FILE}")
    print(f"   Total steps: {len(animation_steps)}")
    print(f"   Each forecast extends to 2025-12")


if __name__ == "__main__":
    main()
