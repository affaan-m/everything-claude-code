# Exercise 3: Build a Complete Hook Pipeline

## Goal

Combine multiple hooks into a real-world workflow that:
1. Blocks dangerous file modifications (PreToolUse)
2. Auto-formats code after edits (PostToolUse)
3. Checks for secrets before commits (PreToolUse on Bash)
4. Loads project context on session start (SessionStart)

## The Complete Settings File

Save as `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"project\": \"RMF Compliance Tool\", \"framework\": \"NIST 800-53 Rev 5\", \"baseline\": \"Moderate\", \"reminder\": \"All code changes must be traceable to a control requirement\"}'"
          }
        ]
      }
    ],

    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat); FILE=$(echo \"$INPUT\" | jq -r '.tool_input.file_path // empty'); case \"$FILE\" in *.env*|*.pem|*.key|*secret*) echo \"BLOCKED: Cannot modify sensitive file: $FILE\" >&2; exit 2;; *) exit 0;; esac"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat); CMD=$(echo \"$INPUT\" | jq -r '.tool_input.command // empty'); if echo \"$CMD\" | grep -qE 'git\\s+push|git\\s+commit'; then echo 'REMINDER: Ensure no secrets in staged files and all tests pass.' >&2; fi; exit 0"
          }
        ]
      }
    ],

    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat); FILE=$(echo \"$INPUT\" | jq -r '.tool_input.file_path // empty'); if [[ \"$FILE\" == *.py ]]; then python3 -m py_compile \"$FILE\" 2>&1 || true; fi; exit 0"
          }
        ]
      }
    ],

    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Session check: Have you verified your changes against the applicable NIST controls?'"
          }
        ]
      }
    ]
  }
}
```

## Test Scenarios

### Test 1: Session Start
Start a new Claude Code session. You should see the project context loaded.

### Test 2: Protected Files
Ask Claude to edit a `.env` file. It should be blocked.

### Test 3: Python Syntax Check
Ask Claude to write a Python file. After the edit, it should be syntax-checked.

### Test 4: Git Reminder
Ask Claude to commit. It should show a reminder about secrets and tests.

### Test 5: Stop Reminder
Let Claude finish a response. The compliance reminder should appear.

## Verification

- [ ] Session starts with project context
- [ ] Sensitive files are blocked
- [ ] Python files are syntax-checked after edits
- [ ] Git operations trigger reminders
- [ ] Session end includes compliance reminder
