#!/bin/bash
# run_example.sh - Run the TimesFM temperature anomaly forecasting example
#
# This script:
# 1. Runs the preflight system check
# 2. Runs the TimesFM forecast
# 3. Generates the visualization
#
# Usage:
#   ./run_example.sh
#
# Prerequisites:
#   - Python 3.10+
#   - timesfm[torch] installed: uv pip install "timesfm[torch]"
#   - matplotlib, pandas, numpy

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo "============================================================"
echo "  TimesFM Example: Global Temperature Anomaly Forecast"
echo "============================================================"

# Step 1: Preflight check
echo ""
echo "🔍 Step 1: Running preflight system check..."
python3 "$SKILL_ROOT/scripts/check_system.py" || {
    echo "❌ Preflight check failed. Please fix the issues above before continuing."
    exit 1
}

# Step 2: Run forecast
echo ""
echo "📊 Step 2: Running TimesFM forecast..."
cd "$SCRIPT_DIR"
python3 run_forecast.py

# Step 3: Generate visualization
echo ""
echo "📈 Step 3: Generating visualization..."
python3 visualize_forecast.py

echo ""
echo "============================================================"
echo "  ✅ Example complete!"
echo "============================================================"
echo ""
echo "Output files:"
echo "  - $SCRIPT_DIR/output/forecast_output.csv"
echo "  - $SCRIPT_DIR/output/forecast_output.json"
echo "  - $SCRIPT_DIR/output/forecast_visualization.png"
