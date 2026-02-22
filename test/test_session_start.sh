#!/bin/bash
set -euo pipefail

# test_session_start.sh — Validates that the security configuration correctly
# resolves $HOME to an absolute path and protects all designated roots.

EXPECTED_HOME_PATH="$HOME"

# Update these paths to match your actual configuration locations.
# If the paths don't exist yet, this test will correctly FAIL,
# signaling that the security config generation needs to be implemented.
SESSION_SCRIPT="${SESSION_SCRIPT:-./session-start.sh}"
CONFIG_FILE="${CONFIG_FILE:-./mcp-config.json}"

echo "Testing security configuration generation..."
echo "Expected HOME: $EXPECTED_HOME_PATH"
echo "Session script: $SESSION_SCRIPT"
echo "Config file: $CONFIG_FILE"

# Step 1: Execute the configuration generation script
if [ ! -f "$SESSION_SCRIPT" ]; then
    echo "FAIL: Session script not found at $SESSION_SCRIPT"
    echo "Set SESSION_SCRIPT env var to the correct path."
    exit 1
fi

"$SESSION_SCRIPT" || { echo "FAIL: session-start.sh exited with error (code: $?)"; exit 1; }

# Step 2: Verify the generated config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "FAIL: Configuration file not found at $CONFIG_FILE after running session-start.sh"
    exit 1
fi

# Step 3: Verify all four protected roots use resolved absolute paths
PROTECTED_ROOTS=("AI" "Documents" "Downloads" "Desktop")
for root in "${PROTECTED_ROOTS[@]}"; do
    SEARCH_PATTERN="$EXPECTED_HOME_PATH/$root"
    if ! grep -q "$SEARCH_PATTERN" "$CONFIG_FILE"; then
        echo "FAIL: Resolved absolute path not found for protected root: $root"
        echo "Expected substring in config: $SEARCH_PATTERN"
        exit 1
    fi
done

# Step 4: Verify literal '$HOME' is NOT present (the bug we're fixing)
# shellcheck disable=SC2016  # Intentional: matching literal $HOME, not expanding
if grep -q '\$HOME' "$CONFIG_FILE"; then
    echo "FAIL: Literal '\$HOME' string found in config file. Variable was not resolved."
    exit 1
fi

echo "PASS: session-start.sh correctly resolved \$HOME and configured all protected roots."
echo "Verified roots: ${PROTECTED_ROOTS[*]}"
exit 0
