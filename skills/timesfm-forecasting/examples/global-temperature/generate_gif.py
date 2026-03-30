#!/usr/bin/env python3
"""
Generate animated GIF showing forecast evolution.

Creates a GIF animation showing how the TimesFM forecast changes
as more historical data points are added. Shows the full actual data as a background layer.
"""
from __future__ import annotations

import json
from pathlib import Path

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import numpy as np
import pandas as pd
from PIL import Image

# Configuration
EXAMPLE_DIR = Path(__file__).parent
DATA_FILE = EXAMPLE_DIR / "output" / "animation_data.json"
OUTPUT_FILE = EXAMPLE_DIR / "output" / "forecast_animation.gif"
DURATION_MS = 500  # Time per frame in milliseconds


def create_frame(
    ax,
    step_data: dict,
    actual_data: dict,
    final_forecast: dict,
    total_steps: int,
    x_min,
    x_max,
    y_min,
    y_max,
) -> None:
    """Create a single frame of the animation with fixed axes."""
    ax.clear()

    # Parse dates
    historical_dates = pd.to_datetime(step_data["historical_dates"])
    forecast_dates = pd.to_datetime(step_data["forecast_dates"])
    
    # Get final forecast dates for full extent
    final_forecast_dates = pd.to_datetime(final_forecast["forecast_dates"])
    
    # All actual dates for full background
    all_actual_dates = pd.to_datetime(actual_data["dates"])
    all_actual_values = np.array(actual_data["values"])

    # ========== BACKGROUND LAYER: Full actual data (faded) ==========
    ax.plot(
        all_actual_dates,
        all_actual_values,
        color="#9ca3af",
        linewidth=1,
        marker="o",
        markersize=2,
        alpha=0.3,
        label="All observed data",
        zorder=1,
    )
    
    # ========== BACKGROUND LAYER: Final forecast (faded) ==========
    ax.plot(
        final_forecast_dates,
        final_forecast["point_forecast"],
        color="#fca5a5",
        linewidth=1,
        linestyle="--",
        marker="s",
        markersize=2,
        alpha=0.3,
        label="Final forecast",
        zorder=2,
    )

    # ========== FOREGROUND LAYER: Historical data used (bright) ==========
    ax.plot(
        historical_dates,
        step_data["historical_values"],
        color="#3b82f6",
        linewidth=2.5,
        marker="o",
        markersize=5,
        label="Data used",
        zorder=10,
    )

    # ========== FOREGROUND LAYER: Current forecast (bright) ==========
    # 90% CI (outer)
    ax.fill_between(
        forecast_dates,
        step_data["q10"],
        step_data["q90"],
        alpha=0.15,
        color="#ef4444",
        zorder=5,
    )
    
    # 80% CI (inner)
    ax.fill_between(
        forecast_dates,
        step_data["q20"],
        step_data["q80"],
        alpha=0.25,
        color="#ef4444",
        zorder=6,
    )
    
    # Forecast line
    ax.plot(
        forecast_dates,
        step_data["point_forecast"],
        color="#ef4444",
        linewidth=2.5,
        marker="s",
        markersize=5,
        label="Forecast",
        zorder=7,
    )

    # ========== Vertical line at forecast boundary ==========
    ax.axvline(
        x=historical_dates[-1],
        color="#6b7280",
        linestyle="--",
        linewidth=1.5,
        alpha=0.7,
        zorder=8,
    )

    # ========== Formatting ==========
    ax.set_xlabel("Date", fontsize=11)
    ax.set_ylabel("Temperature Anomaly (°C)", fontsize=11)
    ax.set_title(
        f"TimesFM Forecast Evolution\n"
        f"Step {step_data['step']}/{total_steps}: {step_data['n_points']} points → "
        f"forecast from {step_data['last_historical_date']}",
        fontsize=13,
        fontweight="bold",
    )
    
    ax.grid(True, alpha=0.3, zorder=0)
    ax.legend(loc="upper left", fontsize=8)
    
    # FIXED AXES - same for all frames
    ax.set_xlim(x_min, x_max)
    ax.set_ylim(y_min, y_max)
    
    # Format x-axis
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%Y-%m"))
    ax.xaxis.set_major_locator(mdates.MonthLocator(interval=4))
    plt.setp(ax.xaxis.get_majorticklabels(), rotation=45, ha="right")


def main() -> None:
    print("=" * 60)
    print("  GENERATING ANIMATED GIF")
    print("=" * 60)
    
    # Load data
    with open(DATA_FILE) as f:
        data = json.load(f)
    
    total_steps = len(data["animation_steps"])
    print(f"\n📊 Total frames: {total_steps}")
    
    # Get the final forecast step for reference
    final_forecast = data["animation_steps"][-1]
    
    # Calculate fixed axis extents from ALL data
    all_actual_dates = pd.to_datetime(data["actual_data"]["dates"])
    all_actual_values = np.array(data["actual_data"]["values"])
    
    final_forecast_dates = pd.to_datetime(final_forecast["forecast_dates"])
    final_forecast_values = np.array(final_forecast["point_forecast"])
    
    # X-axis: from first actual date to last forecast date
    x_min = all_actual_dates[0]
    x_max = final_forecast_dates[-1]
    
    # Y-axis: min/max across all actual + all forecasts with CIs
    all_forecast_q10 = np.array(final_forecast["q10"])
    all_forecast_q90 = np.array(final_forecast["q90"])
    
    all_values = np.concatenate([
        all_actual_values,
        final_forecast_values,
        all_forecast_q10,
        all_forecast_q90,
    ])
    y_min = all_values.min() - 0.05
    y_max = all_values.max() + 0.05
    
    print(f"   X-axis: {x_min.strftime('%Y-%m')} to {x_max.strftime('%Y-%m')}")
    print(f"   Y-axis: {y_min:.2f}°C to {y_max:.2f}°C")
    
    # Create figure
    fig, ax = plt.subplots(figsize=(12, 6))
    
    # Generate frames
    frames = []
    
    for i, step in enumerate(data["animation_steps"]):
        print(f"   Frame {i + 1}/{total_steps}...")
        
        create_frame(
            ax,
            step,
            data["actual_data"],
            final_forecast,
            total_steps,
            x_min,
            x_max,
            y_min,
            y_max,
        )
        
        # Save frame to buffer
        fig.canvas.draw()
        
        # Convert to PIL Image
        buf = fig.canvas.buffer_rgba()
        width, height = fig.canvas.get_width_height()
        img = Image.frombytes("RGBA", (width, height), buf)
        frames.append(img.convert("RGB"))
    
    plt.close()
    
    # Save as GIF
    print(f"\n💾 Saving GIF: {OUTPUT_FILE}")
    frames[0].save(
        OUTPUT_FILE,
        save_all=True,
        append_images=frames[1:],
        duration=DURATION_MS,
        loop=0,  # Loop forever
    )
    
    # Get file size
    size_kb = OUTPUT_FILE.stat().st_size / 1024
    print(f"   File size: {size_kb:.1f} KB")
    print(f"\n✅ Done!")


if __name__ == "__main__":
    main()
