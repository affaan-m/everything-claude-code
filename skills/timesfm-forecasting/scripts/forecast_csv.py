#!/usr/bin/env python3
"""End-to-end CSV forecasting with TimesFM.

Loads a CSV, runs the system preflight check, loads TimesFM, forecasts
the requested columns, and writes results to a new CSV or JSON.

Usage:
    python forecast_csv.py input.csv --horizon 24
    python forecast_csv.py input.csv --horizon 12 --date-col date --value-cols sales,revenue
    python forecast_csv.py input.csv --horizon 52 --output forecasts.csv
    python forecast_csv.py input.csv --horizon 30 --output forecasts.json --format json

The script automatically:
  1. Runs the system preflight check (exits if it fails).
  2. Loads TimesFM 2.5 from Hugging Face.
  3. Reads the CSV and identifies time series columns.
  4. Forecasts each series with prediction intervals.
  5. Writes results to the specified output file.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd


def run_preflight() -> dict:
    """Run the system preflight check and return the report."""
    # Import the check_system module from the same directory
    script_dir = Path(__file__).parent
    sys.path.insert(0, str(script_dir))
    from check_system import run_checks

    report = run_checks("v2.5")
    if not report.passed:
        print("\n🛑 System check FAILED. Cannot proceed with forecasting.")
        print(f"   {report.verdict_detail}")
        print("\nRun 'python scripts/check_system.py' for details.")
        sys.exit(1)

    return report.to_dict()


def load_model(batch_size: int = 32):
    """Load and compile the TimesFM model."""
    import torch
    import timesfm

    torch.set_float32_matmul_precision("high")

    print("Loading TimesFM 2.5 from Hugging Face...")
    model = timesfm.TimesFM_2p5_200M_torch.from_pretrained(
        "google/timesfm-2.5-200m-pytorch"
    )

    print(f"Compiling with per_core_batch_size={batch_size}...")
    model.compile(
        timesfm.ForecastConfig(
            max_context=1024,
            max_horizon=256,
            normalize_inputs=True,
            use_continuous_quantile_head=True,
            force_flip_invariance=True,
            infer_is_positive=True,
            fix_quantile_crossing=True,
            per_core_batch_size=batch_size,
        )
    )

    return model


def load_csv(
    path: str,
    date_col: str | None = None,
    value_cols: list[str] | None = None,
) -> tuple[pd.DataFrame, list[str], str | None]:
    """Load CSV and identify time series columns.

    Returns:
        (dataframe, value_column_names, date_column_name_or_none)
    """
    df = pd.read_csv(path)

    # Identify date column
    if date_col and date_col in df.columns:
        df[date_col] = pd.to_datetime(df[date_col])
    elif date_col:
        print(f"⚠️ Date column '{date_col}' not found. Available: {list(df.columns)}")
        date_col = None

    # Identify value columns
    if value_cols:
        missing = [c for c in value_cols if c not in df.columns]
        if missing:
            print(f"⚠️ Columns not found: {missing}. Available: {list(df.columns)}")
            value_cols = [c for c in value_cols if c in df.columns]
    else:
        # Auto-detect numeric columns (exclude date)
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if date_col and date_col in numeric_cols:
            numeric_cols.remove(date_col)
        value_cols = numeric_cols

    if not value_cols:
        print("🛑 No numeric columns found to forecast.")
        sys.exit(1)

    print(f"Found {len(value_cols)} series to forecast: {value_cols}")
    return df, value_cols, date_col


def forecast_series(
    model, df: pd.DataFrame, value_cols: list[str], horizon: int
) -> dict[str, dict]:
    """Forecast all series and return results dict."""
    inputs = []
    for col in value_cols:
        values = df[col].dropna().values.astype(np.float32)
        inputs.append(values)

    print(f"Forecasting {len(inputs)} series with horizon={horizon}...")
    point, quantiles = model.forecast(horizon=horizon, inputs=inputs)

    results = {}
    for i, col in enumerate(value_cols):
        results[col] = {
            "forecast": point[i].tolist(),
            "lower_90": quantiles[i, :, 1].tolist(),  # 10th percentile
            "lower_80": quantiles[i, :, 2].tolist(),  # 20th percentile
            "median": quantiles[i, :, 5].tolist(),  # 50th percentile
            "upper_80": quantiles[i, :, 8].tolist(),  # 80th percentile
            "upper_90": quantiles[i, :, 9].tolist(),  # 90th percentile
        }

    return results


def write_csv_output(
    results: dict[str, dict],
    output_path: str,
    df: pd.DataFrame,
    date_col: str | None,
    horizon: int,
) -> None:
    """Write forecast results to CSV."""
    rows = []
    for col, data in results.items():
        # Try to generate future dates
        future_dates = list(range(1, horizon + 1))
        if date_col and date_col in df.columns:
            try:
                last_date = df[date_col].dropna().iloc[-1]
                freq = pd.infer_freq(df[date_col].dropna())
                if freq:
                    future_dates = pd.date_range(
                        last_date, periods=horizon + 1, freq=freq
                    )[1:].tolist()
            except Exception:
                pass

        for h in range(horizon):
            row = {
                "series": col,
                "step": h + 1,
                "forecast": data["forecast"][h],
                "lower_90": data["lower_90"][h],
                "lower_80": data["lower_80"][h],
                "median": data["median"][h],
                "upper_80": data["upper_80"][h],
                "upper_90": data["upper_90"][h],
            }
            if isinstance(future_dates[0], (pd.Timestamp,)):
                row["date"] = future_dates[h]
            rows.append(row)

    out_df = pd.DataFrame(rows)
    out_df.to_csv(output_path, index=False)
    print(f"✅ Wrote {len(rows)} forecast rows to {output_path}")


def write_json_output(results: dict[str, dict], output_path: str) -> None:
    """Write forecast results to JSON."""
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"✅ Wrote forecasts for {len(results)} series to {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Forecast time series from CSV using TimesFM."
    )
    parser.add_argument("input", help="Path to input CSV file")
    parser.add_argument(
        "--horizon", type=int, required=True, help="Number of steps to forecast"
    )
    parser.add_argument("--date-col", help="Name of the date/time column")
    parser.add_argument(
        "--value-cols",
        help="Comma-separated list of value columns to forecast (default: all numeric)",
    )
    parser.add_argument(
        "--output",
        default="forecasts.csv",
        help="Output file path (default: forecasts.csv)",
    )
    parser.add_argument(
        "--format",
        choices=["csv", "json"],
        default=None,
        help="Output format (inferred from --output extension if not set)",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=None,
        help="Override per_core_batch_size (auto-detected from system check if omitted)",
    )
    parser.add_argument(
        "--skip-check",
        action="store_true",
        help="Skip system preflight check (not recommended)",
    )
    args = parser.parse_args()

    # Parse value columns
    value_cols = None
    if args.value_cols:
        value_cols = [c.strip() for c in args.value_cols.split(",")]

    # Determine output format
    out_format = args.format
    if not out_format:
        out_format = "json" if args.output.endswith(".json") else "csv"

    # 1. Preflight check
    if not args.skip_check:
        print("Running system preflight check...")
        report = run_preflight()
        batch_size = args.batch_size or report.get("recommended_batch_size", 32)
    else:
        print("⚠️ Skipping system check (--skip-check). Proceed with caution.")
        batch_size = args.batch_size or 32

    # 2. Load model
    model = load_model(batch_size=batch_size)

    # 3. Load CSV
    df, cols, date_col = load_csv(args.input, args.date_col, value_cols)

    # 4. Forecast
    results = forecast_series(model, df, cols, args.horizon)

    # 5. Write output
    if out_format == "json":
        write_json_output(results, args.output)
    else:
        write_csv_output(results, args.output, df, date_col, args.horizon)

    print("\nDone! 🎉")


if __name__ == "__main__":
    main()
