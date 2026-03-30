#!/usr/bin/env python3
"""
TimesFM Anomaly Detection Example — Two-Phase Method

Phase 1 (context): Linear detrend + Z-score on 36 months of real NOAA
  temperature anomaly data (2022-01 through 2024-12).
  Sep 2023 (1.47 C) is a known critical outlier.

Phase 2 (forecast): TimesFM quantile prediction intervals on a 12-month
  synthetic future with 3 injected anomalies.

Outputs:
  output/anomaly_detection.png  -- 2-panel visualization
  output/anomaly_detection.json -- structured detection records
"""

from __future__ import annotations

import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.patches as mpatches
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

HORIZON = 12
DATA_FILE = (
    Path(__file__).parent.parent / "global-temperature" / "temperature_anomaly.csv"
)
OUTPUT_DIR = Path(__file__).parent / "output"

CRITICAL_Z = 3.0
WARNING_Z = 2.0

# quant_fc index mapping: 0=mean, 1=q10, 2=q20, ..., 9=q90
IDX_Q10, IDX_Q20, IDX_Q80, IDX_Q90 = 1, 2, 8, 9

CLR = {"CRITICAL": "#e02020", "WARNING": "#f08030", "NORMAL": "#4a90d9"}


# ---------------------------------------------------------------------------
# Phase 1: context anomaly detection
# ---------------------------------------------------------------------------


def detect_context_anomalies(
    values: np.ndarray,
    dates: list,
) -> tuple[list[dict], np.ndarray, np.ndarray, float]:
    """Linear detrend + Z-score anomaly detection on context period.

    Returns
    -------
    records    : list of dicts, one per month
    trend_line : fitted linear trend values (same length as values)
    residuals  : actual - trend_line
    res_std    : std of residuals (used as sigma for threshold bands)
    """
    n = len(values)
    idx = np.arange(n, dtype=float)

    coeffs = np.polyfit(idx, values, 1)
    trend_line = np.polyval(coeffs, idx)
    residuals = values - trend_line
    res_std = residuals.std()

    records = []
    for i, (d, v, r) in enumerate(zip(dates, values, residuals)):
        z = r / res_std if res_std > 0 else 0.0
        if abs(z) >= CRITICAL_Z:
            severity = "CRITICAL"
        elif abs(z) >= WARNING_Z:
            severity = "WARNING"
        else:
            severity = "NORMAL"
        records.append(
            {
                "date": str(d)[:7],
                "value": round(float(v), 4),
                "trend": round(float(trend_line[i]), 4),
                "residual": round(float(r), 4),
                "z_score": round(float(z), 3),
                "severity": severity,
            }
        )
    return records, trend_line, residuals, res_std


# ---------------------------------------------------------------------------
# Phase 2: synthetic future + forecast anomaly detection
# ---------------------------------------------------------------------------


def build_synthetic_future(
    context: np.ndarray,
    n: int,
    seed: int = 42,
) -> tuple[np.ndarray, list[int]]:
    """Build a plausible future with 3 injected anomalies.

    Injected months: 3, 8, 11 (0-indexed within the 12-month horizon).
    Returns (future_values, injected_indices).
    """
    rng = np.random.default_rng(seed)
    trend = np.linspace(context[-6:].mean(), context[-6:].mean() + 0.05, n)
    noise = rng.normal(0, 0.1, n)
    future = trend + noise

    injected = [3, 8, 11]
    future[3] += 0.7  # CRITICAL spike
    future[8] -= 0.65  # CRITICAL dip
    future[11] += 0.45  # WARNING spike

    return future.astype(np.float32), injected


def detect_forecast_anomalies(
    future_values: np.ndarray,
    point: np.ndarray,
    quant_fc: np.ndarray,
    future_dates: list,
    injected_at: list[int],
) -> list[dict]:
    """Classify each forecast month by which PI band it falls outside.

    CRITICAL = outside 80% PI (q10-q90)
    WARNING  = outside 60% PI (q20-q80) but inside 80% PI
    NORMAL   = inside 60% PI
    """
    q10 = quant_fc[IDX_Q10]
    q20 = quant_fc[IDX_Q20]
    q80 = quant_fc[IDX_Q80]
    q90 = quant_fc[IDX_Q90]

    records = []
    for i, (d, fv, pt) in enumerate(zip(future_dates, future_values, point)):
        outside_80 = fv < q10[i] or fv > q90[i]
        outside_60 = fv < q20[i] or fv > q80[i]

        if outside_80:
            severity = "CRITICAL"
        elif outside_60:
            severity = "WARNING"
        else:
            severity = "NORMAL"

        records.append(
            {
                "date": str(d)[:7],
                "actual": round(float(fv), 4),
                "forecast": round(float(pt), 4),
                "q10": round(float(q10[i]), 4),
                "q20": round(float(q20[i]), 4),
                "q80": round(float(q80[i]), 4),
                "q90": round(float(q90[i]), 4),
                "severity": severity,
                "was_injected": i in injected_at,
            }
        )
    return records


# ---------------------------------------------------------------------------
# Visualization
# ---------------------------------------------------------------------------


def plot_results(
    context_dates: list,
    context_values: np.ndarray,
    ctx_records: list[dict],
    trend_line: np.ndarray,
    residuals: np.ndarray,
    res_std: float,
    future_dates: list,
    future_values: np.ndarray,
    point_fc: np.ndarray,
    quant_fc: np.ndarray,
    fc_records: list[dict],
) -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(15, 10), gridspec_kw={"hspace": 0.42})
    fig.suptitle(
        "TimesFM Anomaly Detection — Two-Phase Method", fontsize=14, fontweight="bold"
    )

    # -----------------------------------------------------------------------
    # Panel 1 — full timeline
    # -----------------------------------------------------------------------
    ctx_x = [pd.Timestamp(d) for d in context_dates]
    fut_x = [pd.Timestamp(d) for d in future_dates]
    divider = ctx_x[-1]

    # context: blue line + trend + 2sigma band
    ax1.plot(
        ctx_x,
        context_values,
        color=CLR["NORMAL"],
        lw=2,
        marker="o",
        ms=4,
        label="Observed (context)",
    )
    ax1.plot(ctx_x, trend_line, color="#aaaaaa", lw=1.5, ls="--", label="Linear trend")
    ax1.fill_between(
        ctx_x,
        trend_line - 2 * res_std,
        trend_line + 2 * res_std,
        alpha=0.15,
        color=CLR["NORMAL"],
        label="+/-2sigma band",
    )

    # context anomaly markers
    seen_ctx: set[str] = set()
    for rec in ctx_records:
        if rec["severity"] == "NORMAL":
            continue
        d = pd.Timestamp(rec["date"])
        v = rec["value"]
        sev = rec["severity"]
        lbl = f"Context {sev}" if sev not in seen_ctx else None
        seen_ctx.add(sev)
        ax1.scatter(d, v, marker="D", s=90, color=CLR[sev], zorder=6, label=lbl)
        ax1.annotate(
            f"z={rec['z_score']:+.1f}",
            (d, v),
            textcoords="offset points",
            xytext=(0, 9),
            fontsize=7.5,
            ha="center",
            color=CLR[sev],
        )

    # forecast section
    q10 = quant_fc[IDX_Q10]
    q20 = quant_fc[IDX_Q20]
    q80 = quant_fc[IDX_Q80]
    q90 = quant_fc[IDX_Q90]

    ax1.plot(fut_x, future_values, "k--", lw=1.5, label="Synthetic future (truth)")
    ax1.plot(
        fut_x,
        point_fc,
        color=CLR["CRITICAL"],
        lw=2,
        marker="s",
        ms=4,
        label="TimesFM point forecast",
    )
    ax1.fill_between(fut_x, q10, q90, alpha=0.15, color=CLR["CRITICAL"], label="80% PI")
    ax1.fill_between(fut_x, q20, q80, alpha=0.25, color=CLR["CRITICAL"], label="60% PI")

    seen_fc: set[str] = set()
    for i, rec in enumerate(fc_records):
        if rec["severity"] == "NORMAL":
            continue
        d = pd.Timestamp(rec["date"])
        v = rec["actual"]
        sev = rec["severity"]
        mk = "X" if sev == "CRITICAL" else "^"
        lbl = f"Forecast {sev}" if sev not in seen_fc else None
        seen_fc.add(sev)
        ax1.scatter(d, v, marker=mk, s=100, color=CLR[sev], zorder=6, label=lbl)

    ax1.axvline(divider, color="#555555", lw=1.5, ls=":")
    ax1.text(
        divider,
        ax1.get_ylim()[1] if ax1.get_ylim()[1] != 0 else 1.5,
        "  <- Context | Forecast ->",
        fontsize=8.5,
        color="#555555",
        style="italic",
        va="top",
    )

    ax1.annotate(
        "Context: D = Z-score anomaly | Forecast: X = CRITICAL, ^ = WARNING",
        xy=(0.01, 0.04),
        xycoords="axes fraction",
        fontsize=8,
        bbox=dict(boxstyle="round", fc="white", ec="#cccccc", alpha=0.9),
    )

    ax1.set_ylabel("Temperature Anomaly (C)", fontsize=10)
    ax1.legend(ncol=2, fontsize=7.5, loc="upper left")
    ax1.grid(True, alpha=0.22)

    # -----------------------------------------------------------------------
    # Panel 2 — deviation bars across all 48 months
    # -----------------------------------------------------------------------
    all_labels: list[str] = []
    bar_colors: list[str] = []
    bar_heights: list[float] = []

    for rec in ctx_records:
        all_labels.append(rec["date"])
        bar_heights.append(rec["residual"])
        bar_colors.append(CLR[rec["severity"]])

    fc_deviations: list[float] = []
    for rec in fc_records:
        all_labels.append(rec["date"])
        dev = rec["actual"] - rec["forecast"]
        fc_deviations.append(dev)
        bar_heights.append(dev)
        bar_colors.append(CLR[rec["severity"]])

    xs = np.arange(len(all_labels))
    ax2.bar(xs[:36], bar_heights[:36], color=bar_colors[:36], alpha=0.8)
    ax2.bar(xs[36:], bar_heights[36:], color=bar_colors[36:], alpha=0.8)

    # threshold lines for context section only
    ax2.hlines(
        [2 * res_std, -2 * res_std], -0.5, 35.5, colors=CLR["NORMAL"], lw=1.2, ls="--"
    )
    ax2.hlines(
        [3 * res_std, -3 * res_std], -0.5, 35.5, colors=CLR["NORMAL"], lw=1.0, ls=":"
    )

    # PI bands for forecast section
    fc_xs = xs[36:]
    ax2.fill_between(
        fc_xs,
        q10 - point_fc,
        q90 - point_fc,
        alpha=0.12,
        color=CLR["CRITICAL"],
        step="mid",
    )
    ax2.fill_between(
        fc_xs,
        q20 - point_fc,
        q80 - point_fc,
        alpha=0.20,
        color=CLR["CRITICAL"],
        step="mid",
    )

    ax2.axvline(35.5, color="#555555", lw=1.5, ls="--")
    ax2.axhline(0, color="black", lw=0.8, alpha=0.6)

    ax2.text(
        10,
        ax2.get_ylim()[0] * 0.85 if ax2.get_ylim()[0] < 0 else -0.05,
        "<- Context: delta from linear trend",
        fontsize=8,
        style="italic",
        color="#555555",
        ha="center",
    )
    ax2.text(
        41,
        ax2.get_ylim()[0] * 0.85 if ax2.get_ylim()[0] < 0 else -0.05,
        "Forecast: delta from TimesFM ->",
        fontsize=8,
        style="italic",
        color="#555555",
        ha="center",
    )

    tick_every = 3
    ax2.set_xticks(xs[::tick_every])
    ax2.set_xticklabels(all_labels[::tick_every], rotation=45, ha="right", fontsize=7)
    ax2.set_ylabel("Delta from expected (C)", fontsize=10)
    ax2.grid(True, alpha=0.22, axis="y")

    legend_patches = [
        mpatches.Patch(color=CLR["CRITICAL"], label="CRITICAL"),
        mpatches.Patch(color=CLR["WARNING"], label="WARNING"),
        mpatches.Patch(color=CLR["NORMAL"], label="Normal"),
    ]
    ax2.legend(handles=legend_patches, fontsize=8, loc="upper right")

    output_path = OUTPUT_DIR / "anomaly_detection.png"
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"\n  Saved: {output_path}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    print("=" * 68)
    print("  TIMESFM ANOMALY DETECTION — TWO-PHASE METHOD")
    print("=" * 68)

    # --- Load context data ---------------------------------------------------
    df = pd.read_csv(DATA_FILE)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)

    context_values = df["anomaly_c"].values.astype(np.float32)
    context_dates = [pd.Timestamp(d) for d in df["date"].tolist()]
    start_str = context_dates[0].strftime('%Y-%m') if not pd.isnull(context_dates[0]) else '?'
    end_str   = context_dates[-1].strftime('%Y-%m') if not pd.isnull(context_dates[-1]) else '?'
    print(f"\n  Context: {len(context_values)} months  ({start_str} - {end_str})")

    # --- Phase 1: context anomaly detection ----------------------------------
    ctx_records, trend_line, residuals, res_std = detect_context_anomalies(
        context_values, context_dates
    )
    ctx_critical = [r for r in ctx_records if r["severity"] == "CRITICAL"]
    ctx_warning = [r for r in ctx_records if r["severity"] == "WARNING"]
    print(f"\n  [Phase 1] Context anomalies (Z-score, sigma={res_std:.3f} C):")
    print(f"    CRITICAL (|Z|>={CRITICAL_Z}): {len(ctx_critical)}")
    for r in ctx_critical:
        print(f"      {r['date']}  {r['value']:+.3f} C  z={r['z_score']:+.2f}")
    print(f"    WARNING  (|Z|>={WARNING_Z}): {len(ctx_warning)}")
    for r in ctx_warning:
        print(f"      {r['date']}  {r['value']:+.3f} C  z={r['z_score']:+.2f}")

    # --- Load TimesFM --------------------------------------------------------
    print("\n  Loading TimesFM 1.0 ...")
    import timesfm

    hparams = timesfm.TimesFmHparams(horizon_len=HORIZON)
    checkpoint = timesfm.TimesFmCheckpoint(
        huggingface_repo_id="google/timesfm-1.0-200m-pytorch"
    )
    model = timesfm.TimesFm(hparams=hparams, checkpoint=checkpoint)

    point_out, quant_out = model.forecast([context_values], freq=[0])
    point_fc = point_out[0]  # shape (HORIZON,)
    quant_fc = quant_out[0].T  # shape (10, HORIZON)

    # --- Build synthetic future + Phase 2 detection --------------------------
    future_values, injected = build_synthetic_future(context_values, HORIZON)
    last_date = context_dates[-1]
    future_dates = [last_date + pd.DateOffset(months=i + 1) for i in range(HORIZON)]

    fc_records = detect_forecast_anomalies(
        future_values, point_fc, quant_fc, future_dates, injected
    )
    fc_critical = [r for r in fc_records if r["severity"] == "CRITICAL"]
    fc_warning = [r for r in fc_records if r["severity"] == "WARNING"]

    print(f"\n  [Phase 2] Forecast anomalies (quantile PI, horizon={HORIZON} months):")
    print(f"    CRITICAL (outside 80% PI): {len(fc_critical)}")
    for r in fc_critical:
        print(
            f"      {r['date']}  actual={r['actual']:+.3f}  "
            f"fc={r['forecast']:+.3f}  injected={r['was_injected']}"
        )
    print(f"    WARNING  (outside 60% PI): {len(fc_warning)}")
    for r in fc_warning:
        print(
            f"      {r['date']}  actual={r['actual']:+.3f}  "
            f"fc={r['forecast']:+.3f}  injected={r['was_injected']}"
        )

    # --- Plot ----------------------------------------------------------------
    print("\n  Generating 2-panel visualization...")
    plot_results(
        context_dates,
        context_values,
        ctx_records,
        trend_line,
        residuals,
        res_std,
        future_dates,
        future_values,
        point_fc,
        quant_fc,
        fc_records,
    )

    # --- Save JSON -----------------------------------------------------------
    OUTPUT_DIR.mkdir(exist_ok=True)
    out = {
        "method": "two_phase",
        "context_method": "linear_detrend_zscore",
        "forecast_method": "quantile_prediction_intervals",
        "thresholds": {
            "critical_z": CRITICAL_Z,
            "warning_z": WARNING_Z,
            "pi_critical_pct": 80,
            "pi_warning_pct": 60,
        },
        "context_summary": {
            "total": len(ctx_records),
            "critical": len(ctx_critical),
            "warning": len(ctx_warning),
            "normal": len([r for r in ctx_records if r["severity"] == "NORMAL"]),
            "res_std": round(float(res_std), 5),
        },
        "forecast_summary": {
            "total": len(fc_records),
            "critical": len(fc_critical),
            "warning": len(fc_warning),
            "normal": len([r for r in fc_records if r["severity"] == "NORMAL"]),
        },
        "context_detections": ctx_records,
        "forecast_detections": fc_records,
    }
    json_path = OUTPUT_DIR / "anomaly_detection.json"
    with open(json_path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"  Saved: {json_path}")

    print("\n" + "=" * 68)
    print("  SUMMARY")
    print("=" * 68)
    print(
        f"  Context  ({len(ctx_records)} months): "
        f"{len(ctx_critical)} CRITICAL, {len(ctx_warning)} WARNING"
    )
    print(
        f"  Forecast ({len(fc_records)} months): "
        f"{len(fc_critical)} CRITICAL, {len(fc_warning)} WARNING"
    )
    print("=" * 68)


if __name__ == "__main__":
    main()
