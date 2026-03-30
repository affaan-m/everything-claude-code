#!/usr/bin/env python3
"""
Visualize TimesFM forecast results for global temperature anomaly.

Generates a publication-quality figure showing:
- Historical data (2022-2024)
- Point forecast (2025)
- 80% and 90% confidence intervals (fan chart)

Usage:
    python visualize_forecast.py
"""

from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# Configuration
EXAMPLE_DIR = Path(__file__).parent
INPUT_FILE = EXAMPLE_DIR / "temperature_anomaly.csv"
FORECAST_FILE = EXAMPLE_DIR / "output" / "forecast_output.json"
OUTPUT_FILE = EXAMPLE_DIR / "output" / "forecast_visualization.png"


def main() -> None:
    # Load historical data
    df = pd.read_csv(INPUT_FILE, parse_dates=["date"])

    # Load forecast results
    with open(FORECAST_FILE) as f:
        forecast = json.load(f)

    # Extract forecast data
    dates = pd.to_datetime(forecast["forecast"]["dates"])
    point = np.array(forecast["forecast"]["point"])
    q10 = np.array(forecast["forecast"]["quantiles"]["10%"])
    q20 = np.array(forecast["forecast"]["quantiles"]["20%"])
    q80 = np.array(forecast["forecast"]["quantiles"]["80%"])
    q90 = np.array(forecast["forecast"]["quantiles"]["90%"])

    # Create figure
    fig, ax = plt.subplots(figsize=(12, 6))

    # Plot historical data
    ax.plot(
        df["date"],
        df["anomaly_c"],
        color="#2563eb",
        linewidth=1.5,
        marker="o",
        markersize=3,
        label="Historical (NOAA GISTEMP)",
    )

    # Plot 90% CI (outer band)
    ax.fill_between(dates, q10, q90, alpha=0.2, color="#dc2626", label="90% CI")

    # Plot 80% CI (inner band)
    ax.fill_between(dates, q20, q80, alpha=0.3, color="#dc2626", label="80% CI")

    # Plot point forecast
    ax.plot(
        dates,
        point,
        color="#dc2626",
        linewidth=2,
        marker="s",
        markersize=4,
        label="TimesFM Forecast",
    )

    # Add vertical line at forecast boundary
    ax.axvline(
        x=df["date"].max(), color="#6b7280", linestyle="--", linewidth=1, alpha=0.7
    )

    # Formatting
    ax.set_xlabel("Date", fontsize=12)
    ax.set_ylabel("Temperature Anomaly (°C)", fontsize=12)
    ax.set_title(
        "TimesFM Zero-Shot Forecast Example\n36-month Temperature Anomaly → 12-month Forecast",
        fontsize=14,
        fontweight="bold",
    )

    # Add annotations
    ax.annotate(
        f"Mean forecast: {forecast['summary']['forecast_mean_c']:.2f}°C\n"
        f"vs 2024: {forecast['summary']['vs_last_year_mean']:+.2f}°C",
        xy=(dates[6], point[6]),
        xytext=(dates[6], point[6] + 0.15),
        fontsize=10,
        arrowprops=dict(arrowstyle="->", color="#6b7280", lw=1),
        bbox=dict(boxstyle="round,pad=0.3", facecolor="white", edgecolor="#6b7280"),
    )

    # Grid and legend
    ax.grid(True, alpha=0.3)
    ax.legend(loc="upper left", fontsize=10)

    # Set y-axis limits
    ax.set_ylim(0.7, 1.5)

    # Rotate x-axis labels
    plt.xticks(rotation=45, ha="right")

    # Tight layout
    plt.tight_layout()

    # Save
    fig.savefig(OUTPUT_FILE, dpi=150, bbox_inches="tight")
    print(f"✅ Saved visualization to: {OUTPUT_FILE}")

    plt.close()


if __name__ == "__main__":
    main()
