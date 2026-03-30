#!/usr/bin/env python3
"""
TimesFM Covariates (XReg) Example

Demonstrates the TimesFM covariate API using synthetic retail sales data.
TimesFM 1.0 does NOT support forecast_with_covariates(); that requires
TimesFM 2.5 + `pip install timesfm[xreg]`.

This script:
  1. Generates synthetic 3-store weekly retail data (24-week context, 12-week horizon)
  2. Produces a 2x2 visualization showing WHAT each covariate contributes
     and WHY knowing them improves forecasts -- all panels share the same
     week x-axis (0 = first context week, 35 = last horizon week)
  3. Exports a compact CSV (108 rows) and metadata JSON

NOTE ON REAL DATA:
  If you want to use a real retail dataset (e.g., Kaggle Rossmann Store Sales),
  download it to a TEMP location -- do NOT commit large CSVs to this repo.

      import tempfile, urllib.request
      tmp = tempfile.mkdtemp(prefix="timesfm_retail_")
      # urllib.request.urlretrieve("https://...store_sales.csv", f"{tmp}/store_sales.csv")
      # df = pd.read_csv(f"{tmp}/store_sales.csv")

  This skills directory intentionally keeps only tiny reference datasets.
"""

from __future__ import annotations

import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

EXAMPLE_DIR = Path(__file__).parent
OUTPUT_DIR = EXAMPLE_DIR / "output"

N_STORES = 3
CONTEXT_LEN = 24
HORIZON_LEN = 12
TOTAL_LEN = CONTEXT_LEN + HORIZON_LEN  # 36


def generate_sales_data() -> dict:
    """Generate synthetic retail sales data with covariate components stored separately.

    Returns a dict with:
      stores:     {store_id: {sales, config}}
      covariates: {price, promotion, holiday, day_of_week, store_type, region}
      components: {store_id: {base, price_effect, promo_effect, holiday_effect}}

    Components let us show 'what would sales look like without covariates?' --
    the gap between 'base' and 'sales' IS the covariate signal.

    BUG FIX v3: Previous versions had variable-shadowing where inner dict
    comprehension `{store_id: ... for store_id in stores}` overwrote the outer
    loop variable causing all stores to get identical covariate arrays.
    Fixed by accumulating per-store arrays separately before building covariate dict.
    """
    rng = np.random.default_rng(42)

    stores = {
        "store_A": {"type": "premium", "region": "urban", "base_sales": 1000},
        "store_B": {"type": "standard", "region": "suburban", "base_sales": 750},
        "store_C": {"type": "discount", "region": "rural", "base_sales": 500},
    }
    base_prices = {"store_A": 12.0, "store_B": 10.0, "store_C": 7.5}

    data: dict = {"stores": {}, "covariates": {}, "components": {}}

    prices_by_store: dict[str, np.ndarray] = {}
    promos_by_store: dict[str, np.ndarray] = {}
    holidays_by_store: dict[str, np.ndarray] = {}
    dow_by_store: dict[str, np.ndarray] = {}

    for store_id, config in stores.items():
        bp = base_prices[store_id]
        weeks = np.arange(TOTAL_LEN)

        trend = config["base_sales"] * (1 + 0.005 * weeks)
        seasonality = 80 * np.sin(2 * np.pi * weeks / 52)
        noise = rng.normal(0, 40, TOTAL_LEN)
        base = (trend + seasonality + noise).astype(np.float32)

        price = (bp + rng.uniform(-0.5, 0.5, TOTAL_LEN)).astype(np.float32)
        price_effect = (-20 * (price - bp)).astype(np.float32)

        holidays = np.zeros(TOTAL_LEN, dtype=np.float32)
        for hw in [0, 11, 23, 35]:
            if hw < TOTAL_LEN:
                holidays[hw] = 1.0
        holiday_effect = (200 * holidays).astype(np.float32)

        promotion = rng.choice([0.0, 1.0], TOTAL_LEN, p=[0.8, 0.2]).astype(np.float32)
        promo_effect = (150 * promotion).astype(np.float32)

        day_of_week = np.tile(np.arange(7), TOTAL_LEN // 7 + 1)[:TOTAL_LEN].astype(
            np.int32
        )

        sales = np.maximum(base + price_effect + holiday_effect + promo_effect, 50.0)

        data["stores"][store_id] = {"sales": sales, "config": config}
        data["components"][store_id] = {
            "base": base,
            "price_effect": price_effect,
            "promo_effect": promo_effect,
            "holiday_effect": holiday_effect,
        }

        prices_by_store[store_id] = price
        promos_by_store[store_id] = promotion
        holidays_by_store[store_id] = holidays
        dow_by_store[store_id] = day_of_week

    data["covariates"] = {
        "price": prices_by_store,
        "promotion": promos_by_store,
        "holiday": holidays_by_store,
        "day_of_week": dow_by_store,
        "store_type": {sid: stores[sid]["type"] for sid in stores},
        "region": {sid: stores[sid]["region"] for sid in stores},
    }
    return data


def create_visualization(data: dict) -> None:
    """
    2x2 figure -- ALL panels share x-axis = weeks 0-35.

    (0,0) Sales by store -- context solid, horizon dashed
    (0,1) Store A: actual vs baseline (no covariates), with event overlays showing uplift
    (1,0) Price covariate for all stores -- full 36 weeks including horizon
    (1,1) Covariate effect decomposition for Store A (stacked fill_between)

    Each panel has a conclusion annotation box explaining what the data shows.
    """
    OUTPUT_DIR.mkdir(exist_ok=True)

    store_colors = {"store_A": "#1a56db", "store_B": "#057a55", "store_C": "#c03221"}
    weeks = np.arange(TOTAL_LEN)

    fig, axes = plt.subplots(
        2,
        2,
        figsize=(16, 11),
        sharex=True,
        gridspec_kw={"hspace": 0.42, "wspace": 0.32},
    )
    fig.suptitle(
        "TimesFM Covariates (XReg) -- Retail Sales with Exogenous Variables\n"
        "Shared x-axis: Week 0-23 = context (observed) | Week 24-35 = forecast horizon",
        fontsize=13,
        fontweight="bold",
        y=1.01,
    )

    def add_divider(ax, label_top=True):
        ax.axvline(CONTEXT_LEN - 0.5, color="#9ca3af", lw=1.3, ls="--", alpha=0.8)
        ax.axvspan(
            CONTEXT_LEN - 0.5, TOTAL_LEN - 0.5, alpha=0.06, color="grey", zorder=0
        )
        if label_top:
            ax.text(
                CONTEXT_LEN + 0.3,
                1.01,
                "<- horizon ->",
                transform=ax.get_xaxis_transform(),
                fontsize=7.5,
                color="#6b7280",
                style="italic",
            )

    # -- (0,0): Sales by Store ---------------------------------------------------
    ax = axes[0, 0]
    base_price_labels = {"store_A": "$12", "store_B": "$10", "store_C": "$7.50"}
    for sid, store_data in data["stores"].items():
        sales = store_data["sales"]
        c = store_colors[sid]
        lbl = f"{sid} ({store_data['config']['type']}, {base_price_labels[sid]} base)"
        ax.plot(
            weeks[:CONTEXT_LEN],
            sales[:CONTEXT_LEN],
            color=c,
            lw=2,
            marker="o",
            ms=3,
            label=lbl,
        )
        ax.plot(
            weeks[CONTEXT_LEN:],
            sales[CONTEXT_LEN:],
            color=c,
            lw=1.5,
            ls="--",
            marker="o",
            ms=3,
            alpha=0.6,
        )
    add_divider(ax)
    ax.set_ylabel("Weekly Sales (units)", fontsize=10)
    ax.set_title("Sales by Store", fontsize=11, fontweight="bold")
    ax.legend(fontsize=7.5, loc="upper left")
    ax.grid(True, alpha=0.22)
    ratio = (
        data["stores"]["store_A"]["sales"][:CONTEXT_LEN].mean()
        / data["stores"]["store_C"]["sales"][:CONTEXT_LEN].mean()
    )
    ax.annotate(
        f"Store A earns {ratio:.1f}x Store C\n(premium vs discount pricing)\n"
        f"-> store_type is a useful static covariate",
        xy=(0.97, 0.05),
        xycoords="axes fraction",
        ha="right",
        fontsize=8,
        bbox=dict(boxstyle="round", fc="#fffbe6", ec="#d4a017", alpha=0.95),
    )

    # -- (0,1): Store A actual vs baseline ---------------------------------------
    ax = axes[0, 1]
    comp_A = data["components"]["store_A"]
    sales_A = data["stores"]["store_A"]["sales"]
    base_A = comp_A["base"]
    promo_A = data["covariates"]["promotion"]["store_A"]
    holiday_A = data["covariates"]["holiday"]["store_A"]

    ax.plot(
        weeks[:CONTEXT_LEN],
        base_A[:CONTEXT_LEN],
        color="#9ca3af",
        lw=1.8,
        ls="--",
        label="Baseline (no covariates)",
    )
    ax.fill_between(
        weeks[:CONTEXT_LEN],
        base_A[:CONTEXT_LEN],
        sales_A[:CONTEXT_LEN],
        where=(sales_A[:CONTEXT_LEN] > base_A[:CONTEXT_LEN]),
        alpha=0.35,
        color="#22c55e",
        label="Covariate uplift",
    )
    ax.fill_between(
        weeks[:CONTEXT_LEN],
        sales_A[:CONTEXT_LEN],
        base_A[:CONTEXT_LEN],
        where=(sales_A[:CONTEXT_LEN] < base_A[:CONTEXT_LEN]),
        alpha=0.30,
        color="#ef4444",
        label="Price suppression",
    )
    ax.plot(
        weeks[:CONTEXT_LEN],
        sales_A[:CONTEXT_LEN],
        color=store_colors["store_A"],
        lw=2,
        label="Actual sales (Store A)",
    )

    for w in range(CONTEXT_LEN):
        if holiday_A[w] > 0:
            ax.axvspan(w - 0.45, w + 0.45, alpha=0.22, color="darkorange", zorder=0)
    promo_weeks = [w for w in range(CONTEXT_LEN) if promo_A[w] > 0]
    if promo_weeks:
        ax.scatter(
            promo_weeks,
            sales_A[promo_weeks],
            marker="^",
            color="#16a34a",
            s=70,
            zorder=6,
            label="Promotion week",
        )

    add_divider(ax)
    ax.set_ylabel("Weekly Sales (units)", fontsize=10)
    ax.set_title(
        "Store A -- Actual vs Baseline (No Covariates)", fontsize=11, fontweight="bold"
    )
    ax.legend(fontsize=7.5, loc="upper left", ncol=2)
    ax.grid(True, alpha=0.22)

    hm = holiday_A[:CONTEXT_LEN] > 0
    pm = promo_A[:CONTEXT_LEN] > 0
    h_lift = (
        (sales_A[:CONTEXT_LEN][hm] - base_A[:CONTEXT_LEN][hm]).mean() if hm.any() else 0
    )
    p_lift = (
        (sales_A[:CONTEXT_LEN][pm] - base_A[:CONTEXT_LEN][pm]).mean() if pm.any() else 0
    )
    ax.annotate(
        f"Holiday weeks: +{h_lift:.0f} units avg\n"
        f"Promotion weeks: +{p_lift:.0f} units avg\n"
        f"Future event schedules must be known for XReg",
        xy=(0.97, 0.05),
        xycoords="axes fraction",
        ha="right",
        fontsize=8,
        bbox=dict(boxstyle="round", fc="#fffbe6", ec="#d4a017", alpha=0.95),
    )

    # -- (1,0): Price covariate -- full 36 weeks ---------------------------------
    ax = axes[1, 0]
    for sid in data["stores"]:
        ax.plot(
            weeks,
            data["covariates"]["price"][sid],
            color=store_colors[sid],
            lw=2,
            label=sid,
            alpha=0.85,
        )
    add_divider(ax, label_top=False)
    ax.set_xlabel("Week", fontsize=10)
    ax.set_ylabel("Price ($)", fontsize=10)
    ax.set_title(
        "Price Covariate -- Context + Forecast Horizon", fontsize=11, fontweight="bold"
    )
    ax.legend(fontsize=8, loc="upper right")
    ax.grid(True, alpha=0.22)
    ax.annotate(
        "Prices are planned -- known for forecast horizon\n"
        "Price elasticity: -$1 increase -> -20 units sold\n"
        "Store A ($12) consistently more expensive than C ($7.50)",
        xy=(0.97, 0.05),
        xycoords="axes fraction",
        ha="right",
        fontsize=8,
        bbox=dict(boxstyle="round", fc="#fffbe6", ec="#d4a017", alpha=0.95),
    )

    # -- (1,1): Covariate effect decomposition -----------------------------------
    ax = axes[1, 1]
    pe = comp_A["price_effect"]
    pre = comp_A["promo_effect"]
    he = comp_A["holiday_effect"]

    ax.fill_between(
        weeks,
        0,
        pe,
        alpha=0.65,
        color="steelblue",
        step="mid",
        label=f"Price effect (max +/-{np.abs(pe).max():.0f} units)",
    )
    ax.fill_between(
        weeks,
        pe,
        pe + pre,
        alpha=0.70,
        color="#22c55e",
        step="mid",
        label="Promotion effect (+150 units)",
    )
    ax.fill_between(
        weeks,
        pe + pre,
        pe + pre + he,
        alpha=0.70,
        color="darkorange",
        step="mid",
        label="Holiday effect (+200 units)",
    )
    total = pe + pre + he
    ax.plot(weeks, total, "k-", lw=1.5, alpha=0.75, label="Total covariate effect")
    ax.axhline(0, color="black", lw=0.9, alpha=0.6)
    add_divider(ax, label_top=False)
    ax.set_xlabel("Week", fontsize=10)
    ax.set_ylabel("Effect on sales (units)", fontsize=10)
    ax.set_title(
        "Store A -- Covariate Effect Decomposition", fontsize=11, fontweight="bold"
    )
    ax.legend(fontsize=7.5, loc="upper right")
    ax.grid(True, alpha=0.22, axis="y")
    ax.annotate(
        f"Holidays (+200) and promotions (+150) dominate\n"
        f"Price effect (+/-{np.abs(pe).max():.0f} units) is minor by comparison\n"
        f"-> Time-varying covariates explain most sales spikes",
        xy=(0.97, 0.55),
        xycoords="axes fraction",
        ha="right",
        fontsize=8,
        bbox=dict(boxstyle="round", fc="#fffbe6", ec="#d4a017", alpha=0.95),
    )

    tick_pos = list(range(0, TOTAL_LEN, 4))
    for row in [0, 1]:
        for col in [0, 1]:
            axes[row, col].set_xticks(tick_pos)

    plt.tight_layout()
    output_path = OUTPUT_DIR / "covariates_data.png"
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()
    print(f"\n Saved visualization: {output_path}")


def demonstrate_api() -> None:
    print("\n" + "=" * 70)
    print("  TIMESFM COVARIATES API (TimesFM 2.5)")
    print("=" * 70)
    print("""
# Installation
pip install timesfm[xreg]

import timesfm
hparams   = timesfm.TimesFmHparams(backend="cpu", per_core_batch_size=32, horizon_len=12)
ckpt      = timesfm.TimesFmCheckpoint(huggingface_repo_id="google/timesfm-2.5-200m-pytorch")
model     = timesfm.TimesFm(hparams=hparams, checkpoint=ckpt)

point_fc, quant_fc = model.forecast_with_covariates(
    inputs=[sales_a, sales_b, sales_c],
    dynamic_numerical_covariates={"price": [price_a, price_b, price_c]},
    dynamic_categorical_covariates={"holiday": [hol_a, hol_b, hol_c]},
    static_categorical_covariates={"store_type": ["premium","standard","discount"]},
    xreg_mode="xreg + timesfm",
    normalize_xreg_target_per_input=True,
)
# point_fc:  (num_series, horizon_len)
# quant_fc:  (num_series, horizon_len, 10)
""")


def explain_xreg_modes() -> None:
    print("\n" + "=" * 70)
    print("  XREG MODES")
    print("=" * 70)
    print("""
"xreg + timesfm" (DEFAULT)
  1. TimesFM makes baseline forecast
  2. Fit regression on residuals (actual - baseline) ~ covariates
  3. Final = TimesFM baseline + XReg adjustment
  Best when: covariates explain residual variation (e.g. promotions)

"timesfm + xreg"
  1. Fit regression: target ~ covariates
  2. TimesFM forecasts the residuals
  3. Final = XReg prediction + TimesFM residual forecast
  Best when: covariates explain the main signal (e.g. temperature)
""")


def main() -> None:
    print("=" * 70)
    print("  TIMESFM COVARIATES (XREG) EXAMPLE")
    print("=" * 70)

    print("\n Generating synthetic retail sales data...")
    data = generate_sales_data()

    print(f"   Stores:         {list(data['stores'].keys())}")
    print(f"   Context length: {CONTEXT_LEN} weeks")
    print(f"   Horizon length: {HORIZON_LEN} weeks")
    print(f"   Covariates:     {list(data['covariates'].keys())}")

    demonstrate_api()
    explain_xreg_modes()

    print("\n Creating 2x2 visualization (shared x-axis)...")
    create_visualization(data)

    print("\n Saving output data...")
    OUTPUT_DIR.mkdir(exist_ok=True)

    records = []
    for store_id, store_data in data["stores"].items():
        for i in range(TOTAL_LEN):
            records.append(
                {
                    "store_id": store_id,
                    "week": i,
                    "split": "context" if i < CONTEXT_LEN else "horizon",
                    "sales": round(float(store_data["sales"][i]), 2),
                    "base_sales": round(
                        float(data["components"][store_id]["base"][i]), 2
                    ),
                    "price": round(float(data["covariates"]["price"][store_id][i]), 4),
                    "price_effect": round(
                        float(data["components"][store_id]["price_effect"][i]), 2
                    ),
                    "promotion": int(data["covariates"]["promotion"][store_id][i]),
                    "holiday": int(data["covariates"]["holiday"][store_id][i]),
                    "day_of_week": int(data["covariates"]["day_of_week"][store_id][i]),
                    "store_type": data["covariates"]["store_type"][store_id],
                    "region": data["covariates"]["region"][store_id],
                }
            )

    df = pd.DataFrame(records)
    csv_path = OUTPUT_DIR / "sales_with_covariates.csv"
    df.to_csv(csv_path, index=False)
    print(f"   Saved: {csv_path}  ({len(df)} rows x {len(df.columns)} cols)")

    metadata = {
        "description": "Synthetic retail sales data with covariates for TimesFM XReg demo",
        "note_on_real_data": (
            "For real datasets (e.g., Kaggle Rossmann Store Sales), download to "
            "tempfile.mkdtemp() -- do NOT commit to this repo."
        ),
        "stores": {
            sid: {
                **sdata["config"],
                "mean_sales_context": round(
                    float(sdata["sales"][:CONTEXT_LEN].mean()), 1
                ),
            }
            for sid, sdata in data["stores"].items()
        },
        "dimensions": {
            "context_length": CONTEXT_LEN,
            "horizon_length": HORIZON_LEN,
            "total_length": TOTAL_LEN,
            "num_stores": N_STORES,
            "csv_rows": len(df),
        },
        "covariates": {
            "dynamic_numerical": ["price"],
            "dynamic_categorical": ["promotion", "holiday", "day_of_week"],
            "static_categorical": ["store_type", "region"],
        },
        "effect_magnitudes": {
            "holiday": "+200 units per holiday week",
            "promotion": "+150 units per promotion week",
            "price": "-20 units per $1 above base price",
        },
        "xreg_modes": {
            "xreg + timesfm": "Regression on TimesFM residuals (default)",
            "timesfm + xreg": "TimesFM on regression residuals",
        },
        "bug_fixes_history": [
            "v1: Variable-shadowing -- all stores had identical covariates",
            "v2: Fixed shadowing; CONTEXT_LEN 48->24",
            "v3: Added component decomposition (base, price/promo/holiday effects); 2x2 sharex viz",
        ],
    }

    meta_path = OUTPUT_DIR / "covariates_metadata.json"
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"   Saved: {meta_path}")

    print("\n" + "=" * 70)
    print("  COVARIATES EXAMPLE COMPLETE")
    print("=" * 70)
    print("""
Key points:
  1. Requires timesfm[xreg] + TimesFM 2.5+ for actual inference
  2. Dynamic covariates need values for BOTH context AND horizon (future must be known!)
  3. Static covariates: one value per series (store_type, region)
  4. All 4 visualization panels share the same week x-axis (0-35)
  5. Effect decomposition shows holidays/promotions dominate over price variation

Output files:
  output/covariates_data.png         -- 2x2 visualization with conclusions
  output/sales_with_covariates.csv   -- 108-row compact dataset
  output/covariates_metadata.json    -- metadata + effect magnitudes
""")


if __name__ == "__main__":
    main()
