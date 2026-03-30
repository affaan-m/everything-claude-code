#!/bin/bash
# Lobster Soul Gacha — thin shell wrapper
# Actual logic in gacha.py (Python secrets module ensures true randomness)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "${SCRIPT_DIR}/gacha.py" "$@"
