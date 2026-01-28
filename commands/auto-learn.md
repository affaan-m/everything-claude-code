# /auto-learn - Automatic Pattern Extraction

Process transcripts in the learning queue and extract reusable instincts/patterns.
Transcripts are grouped by git repository for targeted skill generation.

## Usage

```
/auto-learn                    # Process all pending transcripts
/auto-learn --repo <name>      # Process only transcripts from specific repo
/auto-learn --preview          # Show what would be extracted without saving
/auto-learn --file <f>         # Process a specific transcript file
/auto-learn --list-repos       # List repos with pending transcripts
```

## Process

### 1. Scan Learning Queue

```bash
QUEUE_DIR="${CLAUDE_SESSIONS_DIR:-$HOME/.claude/sessions}/learning-queue"
ls -la "$QUEUE_DIR"/*.jsonl 2>/dev/null
ls -la "$QUEUE_DIR"/*.meta.json 2>/dev/null
```

If no files found, report "No transcripts pending" and exit.

### 1.5 Load Config and Check Whitelist

Read config from `${CLAUDE_PLUGIN_ROOT}/config/auto-learn.json`:

```bash
CONFIG_FILE="${CLAUDE_PLUGIN_ROOT}/config/auto-learn.json"
cat "$CONFIG_FILE"
```

If `whitelist.enabled` is true, only process repos in the whitelist.

**Current whitelist:**
| Alias | Org | Repo |
|-------|-----|------|
| gen2 | qashierpos | qashier-cloud-function-gen2 |
| hq | qashierpos | qashier-hq-firebase |
| ip | qashierpos | internal-account-manager |
| gateway | qashierpos | qashier-gateway |
| type | qashierpos | qashier-types |
| gen1 | qashierpos | qashier-cloud-function |
| qpay | qashierpos | qashier-pay |
| pos | qashierpos | qashier-pos-coordinate |
| everything | chunrui-qashier | everything-claude-code |

### 1.6 Group by Repository

Read `.meta.json` files to group transcripts by repo:

```
Pending transcripts by repository:
─────────────────────────────────
[qashierpos/qashier-cloud-function-gen2] 3 transcripts (45 messages)
[qashierpos/qashier-gateway]             1 transcript  (12 messages)
[chunrui-qashier/everything-claude-code] 2 transcripts (28 messages)
[no-repo]                                1 transcript  (8 messages)
```

Meta file format:
```json
{
  "timestamp": "2026-01-28 03:20:15",
  "sessionId": "abc123",
  "messageCount": 15,
  "cwd": "/home/chunrui/qashier-cloud-function-gen2",
  "git": {
    "remote": "https://github.com/qashierpos/qashier-cloud-function-gen2.git",
    "branch": "main",
    "repoName": "qashier-cloud-function-gen2",
    "org": "qashierpos"
  }
}
```

### 1.7 Ensure Repo Skill Exists

For each whitelisted repo with pending transcripts, check if skill exists:

```bash
SKILL_DIR="${CLAUDE_PLUGIN_ROOT}/skills/repo-<alias>"
```

**If skill doesn't exist, create it:**

1. Look up alias from whitelist config
2. Find repo's local path from `cwd` in meta.json
3. Read README.md from the repo (first 200 lines)
4. Generate SKILL.md based on README content

**Skill template:**
```markdown
---
name: <alias>
description: <brief description from README>
repo: <org>/<repo>
auto_generated: true
created: <date>
---

# <Repo Display Name>

<Brief 2-3 sentence description based on README>

## Repository Info

- **Org:** <org>
- **Repo:** <repo>  
- **Local Path:** <cwd>

## Learned Patterns

_No patterns learned yet. Run `/auto-learn` after working in this repo._

## Notes

_Add manual notes about this codebase here._
```

**Example:**
```
skills/
├── repo-gen2/
│   └── SKILL.md                    # gen2 整体
├── repo-gen2-core-transaction/
│   └── SKILL.md                    # gen2 的 core-transaction 服务
├── repo-gen2-core-table-management/
│   └── SKILL.md                    # gen2 的 core-table-management 服务
├── repo-gateway/
│   └── SKILL.md
└── repo-everything/
    └── SKILL.md
```

### 1.8 Detect Service from File Paths

For repos with `services` configured (like gen2), detect which service the transcript belongs to:

1. Read file paths from transcript (tool_input.file_path in Edit/Write/Read calls)
2. Match against service paths in config:
   ```json
   "services": [
     { "alias": "gen2-core-transaction", "path": "functions/src/services/core/transaction" },
     { "alias": "gen2-core-table-management", "path": "functions/src/services/core/table-management" }
   ]
   ```
3. If >50% of file operations are in a service path → tag transcript with that service
4. Architecture-related insights go to service skill, general patterns go to repo skill

### 2. For Each Transcript File

Read the transcript and analyze for extractable patterns:

**Pattern Types to Detect:**

| Type | Signal | Example |
|------|--------|---------|
| `user_correction` | User says "no", "wrong", "actually", "instead" after Claude action | "No, use pnpm not npm" → instinct: prefer-pnpm |
| `error_resolution` | Error occurred → multiple attempts → success | TypeError fix → instinct: null-check-pattern |
| `repeated_workflow` | Same sequence of tools used 3+ times | Read→Edit→Test loop → instinct: tdd-micro-cycle |
| `explicit_preference` | User states preference directly | "Always use Zod for validation" → instinct: use-zod |
| `tool_preference` | User redirects tool choice | "Use Edit not Write for small changes" → instinct: prefer-edit |

### 3. Extract Instincts

For each detected pattern, create an instinct file:

```markdown
---
id: <kebab-case-id>
trigger: "<when this applies>"
confidence: <0.3-0.7 for new instincts>
domain: "<code-style|testing|git|debugging|workflow|tooling>"
source: "auto-learn"
extracted: "<YYYY-MM-DD>"
transcript: "<source-filename>"
---

# <Descriptive Title>

## Observed Pattern
<What was observed in the session>

## Action
<What Claude should do when this pattern applies>

## Evidence
- <Specific observation 1>
- <Specific observation 2>
```

### 4. Save or Update Instincts

**Save location (organized by repo):**
```
~/.claude/homunculus/instincts/
├── personal/                           # Cross-repo instincts
│   └── <id>.md
└── repos/                              # Repo-specific instincts
    ├── qashierpos/
    │   ├── qashier-cloud-function-gen2/
    │   │   ├── _SKILL.md               # Auto-generated skill for this repo
    │   │   └── <instinct-id>.md
    │   └── qashier-gateway/
    │       └── ...
    └── chunrui-qashier/
        └── everything-claude-code/
            └── ...
```

**Routing logic:**
- If pattern is specific to a repo's codebase → save to `repos/<org>/<repo>/`
- If pattern is general (coding style, workflow) → save to `personal/`

**If instinct already exists:**
- Increase confidence by 0.1 (max 0.9)
- Append new evidence
- Update `last_seen` date

**If new instinct:**
- Start with confidence 0.5
- Ask user to confirm before saving (unless --auto flag)

### 5. Generate/Update Repo Skill

For each repo with instincts, generate or update `_SKILL.md`:

```markdown
---
name: qashier-cloud-function-gen2
description: Learned patterns for qashier-cloud-function-gen2 backend
repo: qashierpos/qashier-cloud-function-gen2
auto_generated: true
last_updated: 2026-01-28
---

# qashier-cloud-function-gen2 Patterns

## High Confidence (0.7+)
- [instinct-1](./instinct-1.md): Description...
- [instinct-2](./instinct-2.md): Description...

## Medium Confidence (0.5-0.7)
- ...

## Low Confidence (<0.5)
- ...
```

### 6. Archive Processed Transcript

```bash
ARCHIVE_DIR="${CLAUDE_SESSIONS_DIR:-$HOME/.claude/sessions}/learning-archive"
mkdir -p "$ARCHIVE_DIR"
mv "$QUEUE_DIR/<file>.jsonl" "$ARCHIVE_DIR/"
mv "$QUEUE_DIR/<file>.meta.json" "$ARCHIVE_DIR/"
```

### 6. Report Summary

```
AUTO-LEARN SUMMARY
==================
Transcripts processed: 3
Patterns detected: 7
  - user_correction: 2
  - error_resolution: 3
  - repeated_workflow: 1
  - explicit_preference: 1

Instincts created: 4
  ✓ prefer-pnpm (0.5) - NEW
  ✓ null-check-pattern (0.5) - NEW
  ✓ use-zod-validation (0.6) - UPDATED (+0.1)
  ✓ tdd-micro-cycle (0.5) - NEW

Instincts skipped: 3 (low confidence / duplicate)

Files archived: 3
```

## Flags

| Flag | Description |
|------|-------------|
| `--preview` | Analyze but don't save (dry run) |
| `--auto` | Skip confirmation for new instincts |
| `--file <f>` | Process specific file only |
| `--repo <name>` | Process only transcripts from this repo (e.g., `qashier-gateway`) |
| `--list-repos` | List repos with pending transcripts and exit |
| `--min-confidence <n>` | Min confidence to save (default: 0.3) |
| `--verbose` | Show detailed analysis |
| `--skip-repo <name>` | Skip transcripts from this repo |

## Directory Setup

Ensure directories exist before first run:

```bash
mkdir -p ~/.claude/homunculus/instincts/{personal,inherited}
mkdir -p ~/.claude/sessions/{learning-queue,learning-archive}
```

## Integration

This command is designed to be called:
1. **Manually** - Run `/auto-learn` when you want to extract learnings
2. **Scheduled** - Via cron or similar to process overnight
3. **On demand** - After particularly productive sessions

## Notes

- Transcripts are JSONL format (one JSON object per line)
- Each line has `type`, `role`, `content`, `tool_name`, etc.
- Focus on extracting **reusable** patterns, not one-time fixes
- When in doubt, prefer lower confidence over skipping entirely
