---
name: instinct
description: Manage learned instincts -- view status, export, or import
---

# Instinct Management

Manage the continuous learning instinct system.

## Usage

```
/instinct                    # Show status (default)
/instinct status             # Show all instincts with confidence scores
/instinct export             # Export instincts to shareable YAML
/instinct import <file>      # Import instincts from file or URL
```

## Status (default)

Read instincts from `~/.claude/homunculus/instincts/personal/` and `inherited/`.
Display grouped by domain with confidence scores.

**Flags:**
- `--domain <name>` -- filter by domain
- `--low-confidence` -- only instincts with confidence < 0.5
- `--high-confidence` -- only instincts with confidence >= 0.7

**Output format:**
```
Instinct Status (X personal, Y inherited)

## [Domain] (N instincts)
- **instinct-name** -- [action summary]
  Confidence: 80% | Phase: [phase] | Source: [source]
```

## Export

Export instincts to shareable format. Strips sensitive info (session IDs, file paths, old timestamps).

**Flags:**
- `--domain <name>` -- export only specified domain
- `--min-confidence <n>` -- minimum threshold (default: 0.3)
- `--format <yaml|json|md>` -- output format (default: yaml)
- `--output <file>` -- output path (default: instincts-export-YYYYMMDD.yaml)

**Exports include:** triggers, actions, confidence, domains, observation counts
**Exports exclude:** code snippets, file paths, session transcripts

## Import

Import instincts from teammates, Skill Creator, or backups.

**Implementation:**
```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py import <file-or-url> [--dry-run] [--force] [--min-confidence 0.7]
```

**Merge strategy:**
- Duplicates: higher confidence wins, merge observation counts
- Conflicts: skip by default, flag for manual resolution
- New instincts saved to `~/.claude/homunculus/instincts/inherited/`

**Flags:**
- `--dry-run` -- preview without importing
- `--force` -- import even if conflicts exist
- `--min-confidence <n>` -- only import above threshold
