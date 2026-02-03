# Exercise 2: Auto-Check Hook

## Goal

Create a PostToolUse hook that automatically validates YAML/JSON config files
after Claude edits them.

## Why This Matters

In system engineering, a malformed config file can bring down a service.
This hook catches syntax errors immediately after every edit.

## Step 1: Create the Validation Script

Save as `.claude/hooks/validate-config.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Exit if no file path
if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
    exit 0
fi

# Validate based on file extension
case "$FILE_PATH" in
    *.json)
        if ! python3 -c "import json; json.load(open('$FILE_PATH'))" 2>/dev/null; then
            echo "WARNING: $FILE_PATH has invalid JSON syntax!" >&2
            python3 -c "import json; json.load(open('$FILE_PATH'))" 2>&1 | head -5 >&2
            exit 0  # Warn but don't block (PostToolUse)
        fi
        echo "Validated: $FILE_PATH is valid JSON"
        ;;
    *.yaml|*.yml)
        if ! python3 -c "import yaml; yaml.safe_load(open('$FILE_PATH'))" 2>/dev/null; then
            echo "WARNING: $FILE_PATH has invalid YAML syntax!" >&2
            python3 -c "import yaml; yaml.safe_load(open('$FILE_PATH'))" 2>&1 | head -5 >&2
            exit 0
        fi
        echo "Validated: $FILE_PATH is valid YAML"
        ;;
    *)
        # Not a config file, skip
        exit 0
        ;;
esac

exit 0
```

## Step 2: Add to Settings

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "./.claude/hooks/validate-config.sh"
          }
        ]
      }
    ]
  }
}
```

## Step 3: Test It

Create a test JSON file:

```json
{
  "controls": [
    {"id": "AC-2", "status": "implemented"},
    {"id": "AU-3", "status": "partial"}
  ]
}
```

Ask Claude: "Add a new control SC-8 to the controls list in test.json"

After the edit, the hook should validate the JSON and report success.

Then ask Claude: "Replace the closing brace in test.json with nothing"

The hook should warn about invalid JSON.

## Verification

- [ ] Valid JSON/YAML edits show a success message
- [ ] Invalid syntax triggers a warning with error details
- [ ] Non-config files are ignored (no unnecessary validation)
- [ ] Claude receives the feedback and can act on it
