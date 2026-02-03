# Exercise 1: File Protection Hook

## Goal

Create a hook that prevents Claude from modifying critical system files.

## Scenario

In your RMF project, certain files should never be modified without explicit
approval:
- `docs/ssp/approved-ssp.md` — the approved System Security Plan
- Any `.env` file — environment secrets
- `configs/production/` — production configurations
- `*.key` and `*.pem` — cryptographic keys

## Step 1: Create the Hook Script

Save as `.claude/hooks/protect-critical-files.sh`:

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Exit early if no file path
if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Protected patterns
PROTECTED=(
    "docs/ssp/approved-"
    ".env"
    "configs/production/"
    ".key"
    ".pem"
    ".crt"
)

for pattern in "${PROTECTED[@]}"; do
    if [[ "$FILE_PATH" == *"$pattern"* ]]; then
        echo "BLOCKED: '$FILE_PATH' is a protected file." >&2
        echo "This file requires manual modification with ISSO approval." >&2
        echo "Protected pattern matched: $pattern" >&2
        exit 2
    fi
done

exit 0
```

## Step 2: Make it Executable

```bash
chmod +x .claude/hooks/protect-critical-files.sh
```

## Step 3: Add to Settings

In `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "./.claude/hooks/protect-critical-files.sh"
          }
        ]
      }
    ]
  }
}
```

## Step 4: Test It

Create some test files:
```bash
mkdir -p docs/ssp configs/production
echo "This is the approved SSP" > docs/ssp/approved-ssp.md
echo "DB_PASSWORD=secret" > .env
echo "prod config" > configs/production/app.conf
```

Then in Claude Code:
```
"Add a new section to docs/ssp/approved-ssp.md"
```

Claude should be BLOCKED from making the edit.

```
"Update the database password in .env"
```

Also blocked.

```
"Create a new file called src/utils.py"
```

This should be ALLOWED (not a protected path).

## Verification

- [ ] Protected files are blocked with a clear message
- [ ] Non-protected files can be edited normally
- [ ] The error message explains why it was blocked
- [ ] Claude acknowledges the block and suggests alternatives
