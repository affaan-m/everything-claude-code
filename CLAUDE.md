# everything-claude-code

**This is the staging environment for Claude Code configuration.**

## Purpose

This repo is a **testbed** for experimenting with Claude Code configs before deploying to production `~/.claude/`. Changes made here don't affect live sessions until explicitly deployed.

## Structure

```
staging/           ← Mirror of ~/.claude/ (edit here, test, then deploy)
reference/         ← External examples for study (hackathon winner, etc.)
scripts/           ← Deployment automation
docs/              ← Architecture documentation
```

## Workflow

1. **Edit** configs in `staging/`
2. **Compare** with `./scripts/diff.sh`
3. **Backup** with `./scripts/backup.sh`
4. **Deploy** with `./scripts/deploy.sh`
5. **Test** in a new Claude Code session

## Key Rules

- **NEVER deploy without backup first**
- **Test changes in staging before deploying**
- Keep global rules universal (no project-specific paths)
- Project-specific rules go in each project's CLAUDE.md, not here

## Scripts

| Script | Purpose |
|--------|---------|
| `backup.sh` | Backup ~/.claude/ before changes |
| `deploy.sh` | Copy staging/ to ~/.claude/ |
| `diff.sh` | Compare staging vs production |
| `consolidate-learnings.sh` | Weekly review of learned patterns |

## What Lives in staging/

| Directory | Purpose |
|-----------|---------|
| `CLAUDE.md` | Global instructions (slim, universal) |
| `settings.json` | Hooks, permissions, plugins |
| `rules/` | Modular always-loaded rules |
| `agents/` | Specialized subagents to spawn |
| `commands/` | Slash commands (/autonomous, etc.) |
| `skills/` | On-demand domain knowledge |
| `hooks/` | Automation scripts |
| `contexts/` | Mode toggles (dev, research, review) |
| `learned/` | Self-improvement archive |
| `bin/` | CLI utilities (trash, etc.) |

## Rollback

If a deployment breaks something:
```bash
cp -r ~/.claude-backups/claude_<timestamp>/* ~/.claude/
```

---

## Resource Evaluation Role

This repo also serves as a **research and evaluation hub** for new Claude Code techniques.

When the user brings a new article, repo, tool, or technique:

1. **Fetch/read** the resource
2. **Apply** the evaluation framework in [EVALUATE.md](EVALUATE.md)
3. **Make a clear recommendation**: IGNORE, PARK, MICRO-TEST, or ADOPT
4. **If ADOPT**: Propose exact changes to `staging/`
5. **Track** the evaluation in [RESEARCH.md](RESEARCH.md)

### Skepticism First

Be skeptical of:
- Buzzword-heavy claims ("10x productivity", "revolutionary")
- Cherry-picked demos without reproducible examples
- Solutions looking for problems (what does it actually replace?)
- High context cost for marginal benefit
- Serverless-only tools (user has own VPS + Postgres)

### Compatibility Checks

Before recommending adoption, verify:
- Works with user's stack (no serverless dependencies)
- Context window impact is justified by value
- Doesn't conflict with existing hooks/rules
- Has actual engineering detail, not just vibes
