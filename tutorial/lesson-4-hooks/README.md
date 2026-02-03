# Lesson 4: Hooks — Automated Guardrails

## What Are Hooks?

Hooks are **shell commands that run automatically** at specific points during Claude
Code's operation. Unlike skills (which Claude *chooses* to use), hooks **always run**
when their trigger event fires.

Think of hooks as **tripwires** — invisible lines that trigger an action whenever
something crosses them.

## Real-World Analogy

As a system engineer, you understand automated checks:

- A CI/CD pipeline runs tests before every deployment (you don't manually decide)
- A firewall blocks traffic on port 22 from unknown IPs (always, no exceptions)
- A SIEM alerts when 5 failed logins occur within 1 minute (automatic)

Hooks work the same way — they're deterministic rules, not AI suggestions.

## Why Hooks Matter

| Without Hooks | With Hooks |
|---------------|------------|
| Claude *might* run your linter | Claude's edits are *always* linted |
| You must remember to check for secrets | Secrets are *always* blocked before commit |
| Code formatting depends on memory | Files are *always* auto-formatted after edit |
| You hope Claude won't touch .env | .env modifications are *always* blocked |

## Hook Events — When Do They Fire?

| Event | When It Fires | Common Use |
|-------|--------------|------------|
| `SessionStart` | Session begins | Load context, set env vars |
| `PreToolUse` | Before a tool runs | Block dangerous actions |
| `PostToolUse` | After a tool succeeds | Format code, run checks |
| `PostToolUseFailure` | After a tool fails | Error handling |
| `Stop` | Claude finishes a response | Verify completeness |
| `PreCompact` | Before context compaction | Save important state |
| `Notification` | Attention needed | Desktop alerts |
| `SubagentStart` | Subagent launches | Subagent setup |
| `SubagentStop` | Subagent finishes | Subagent cleanup |

## How Hooks Work

### Configuration Location

Hooks go in your settings file:
- Project: `.claude/settings.json`
- User: `~/.claude/settings.json`

### Hook Structure

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolName",
        "hooks": [
          {
            "type": "command",
            "command": "your-shell-command-here"
          }
        ]
      }
    ]
  }
}
```

### Key Parts

- **Event**: When to run (PreToolUse, PostToolUse, etc.)
- **Matcher**: Which tool triggers it (Edit, Write, Bash, etc.)
- **Command**: The shell command to execute
- **Exit code**: Determines what happens next
  - `0` = Allow (proceed normally)
  - `2` = Block (stop the action, send stderr as error message)

### What Hooks Receive

Your hook script receives JSON on **stdin** with context about what's happening:

```json
{
  "session_id": "abc123",
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/path/to/file.py",
    "old_string": "...",
    "new_string": "..."
  }
}
```

You can parse this with `jq` to make decisions.

---

## Practical Examples

### Example 1: Block Editing Sensitive Files

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat); FILE=$(echo \"$INPUT\" | jq -r '.tool_input.file_path // empty'); case \"$FILE\" in *.env|*credentials*|*secret*|*.pem|*.key) echo \"BLOCKED: Cannot modify sensitive file: $FILE\" >&2; exit 2;; *) exit 0;; esac"
          }
        ]
      }
    ]
  }
}
```

This blocks Claude from editing any file matching `.env`, `credentials`,
`secret`, `.pem`, or `.key`.

### Example 2: Auto-Format Python After Edits

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat); FILE=$(echo \"$INPUT\" | jq -r '.tool_input.file_path // empty'); if [[ \"$FILE\" == *.py ]]; then black \"$FILE\" 2>/dev/null; fi; exit 0"
          }
        ]
      }
    ]
  }
}
```

Every time Claude edits a `.py` file, Black formatter runs on it automatically.

### Example 3: Warn Before Git Push

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat); CMD=$(echo \"$INPUT\" | jq -r '.tool_input.command // empty'); if echo \"$CMD\" | grep -q 'git push'; then echo 'REMINDER: Verify all tests pass before pushing. Run the test suite first.' >&2; fi; exit 0"
          }
        ]
      }
    ]
  }
}
```

This doesn't block the push — it just reminds Claude (exit 0 = allow).
Change to `exit 2` to actually block it.

### Example 4: Session Start Context Loading

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"context\": \"RMF project, NIST 800-53 Rev 5, FedRAMP Moderate baseline\"}'"
          }
        ]
      }
    ]
  }
}
```

Injects context every time a session starts.

### Example 5: Verify Tasks on Stop

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Remember: Before finishing, verify that all modified files pass linting and tests.'"
          }
        ]
      }
    ]
  }
}
```

---

## Writing Hook Scripts

For complex hooks, use a separate script instead of inline commands.

### Step 1: Create the Script

Save as `.claude/hooks/block-secrets.sh`:

```bash
#!/bin/bash
# Block any file edit that introduces potential secrets

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
NEW_CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')

# Check for potential secrets in the new content
SECRET_PATTERNS=(
    'password\s*='
    'api_key\s*='
    'secret_key\s*='
    'AWS_ACCESS_KEY'
    'PRIVATE_KEY'
    'BEGIN RSA'
    'BEGIN OPENSSH'
)

for pattern in "${SECRET_PATTERNS[@]}"; do
    if echo "$NEW_CONTENT" | grep -iqE "$pattern"; then
        echo "BLOCKED: Potential secret detected in edit to $FILE_PATH" >&2
        echo "Pattern matched: $pattern" >&2
        echo "Use environment variables or a secrets manager instead." >&2
        exit 2
    fi
done

exit 0
```

### Step 2: Make it Executable

```bash
chmod +x .claude/hooks/block-secrets.sh
```

### Step 3: Reference in Settings

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "./.claude/hooks/block-secrets.sh"
          }
        ]
      }
    ]
  }
}
```

---

## Exercises

### Exercise 1: Create a File Protection Hook

See `exercises/exercise-1-file-protection.md` — block edits to critical files.

### Exercise 2: Create an Auto-Check Hook

See `exercises/exercise-2-auto-check.md` — automatically validate config
files after edits.

### Exercise 3: Build a Complete Hook Pipeline

See `exercises/exercise-3-hook-pipeline.md` — combine multiple hooks for
a real workflow.

---

## Tips

- **Start with exit 0**: While testing, let hooks pass through. Switch to
  exit 2 once you're confident they work.
- **Use stderr for messages**: Hook messages to Claude go through stderr.
  Stdout is for structured output.
- **Keep hooks fast**: They run synchronously and block Claude. A slow hook
  makes Claude feel sluggish.
- **Test outside Claude first**: Run your hook script manually with sample
  JSON input to verify it works.

## What's Next?

In **Lesson 5**, you'll learn about **Agents** — specialized AI assistants
that Claude delegates tasks to. Think of them as expert team members Claude
can call on for specific jobs.
