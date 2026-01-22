#!/bin/bash
# Stop Hook (Session End) - Persist learnings when session ends
#
# Runs when Claude session ends. Creates/updates session log file
# with timestamp for continuity tracking.
#
# Hook config (in ~/.claude/settings.json):
# {
#   "hooks": {
#     "Stop": [{
#       "matcher": "*",
#       "hooks": [{
#         "type": "command",
#         "command": "~/.claude/hooks/memory-persistence/session-end.sh"
#       }]
#     }]
#   }
# }

SESSIONS_DIR="${HOME}/.claude/sessions"
TODAY=$(date '+%Y-%m-%d')
SESSION_FILE="${SESSIONS_DIR}/${TODAY}-session.tmp"

mkdir -p "$SESSIONS_DIR"

# If session file exists for today, update the end time
if [ -f "$SESSION_FILE" ]; then
  # Update Last Updated timestamp
  sed -i '' "s/\*\*Last Updated:\*\*.*/\*\*Last Updated:\*\* $(date '+%H:%M')/" "$SESSION_FILE" 2>/dev/null || \
  sed -i "s/\*\*Last Updated:\*\*.*/\*\*Last Updated:\*\* $(date '+%H:%M')/" "$SESSION_FILE" 2>/dev/null
  echo "[SessionEnd] Updated session file: $SESSION_FILE" >&2
else
  # Create new session file with template
  cat > "$SESSION_FILE" << EOF
# Session: $(date '+%Y-%m-%d')
**Date:** $TODAY
**Started:** $(date '+%H:%M')
**Last Updated:** $(date '+%H:%M')

---

## Current State

[Session context goes here]

### Completed
- [ ]

### In Progress
- [ ]

### Notes for Next Session
-

### Context to Load
\`\`\`
[relevant files]
\`\`\`
EOF
  echo "[SessionEnd] Created session file: $SESSION_FILE" >&2
fi
