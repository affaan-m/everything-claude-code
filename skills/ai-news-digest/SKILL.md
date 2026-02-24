---
name: ai-news-digest
description: Daily AI news aggregation from Anthropic, Google, xAI, OpenAI, and GitHub — automated digest with multi-language support and cross-platform scheduling.
---

# AI News Digest

Automated daily aggregation of AI industry news, product updates, and trending open-source projects.

## When to Activate

- User wants to stay updated with AI industry developments
- Setting up daily news monitoring workflows
- Tracking releases from specific AI companies
- Monitoring trending AI open-source projects on GitHub
- Building information-gathering automation pipelines

## Core Concepts

### Multi-Source Aggregation

The digest pulls from five major categories:

1. **Anthropic / Claude** — Blog RSS, Claude Code releases, SDK updates
2. **Google / Gemini / DeepMind** — AI blog, DeepMind research, Gemini API
3. **xAI / Grok** — Model releases, official announcements
4. **OpenAI** — Blog posts, Python SDK, Codex CLI releases
5. **GitHub Trending** — New AI/ML/LLM repos with growing stars

### Architecture

```
scripts/
├── lib/
│   └── news-fetcher.js    # Core HTTP + RSS/JSON parsers
├── ai-news-digest.js       # Main CLI script (formatter + output)
└── setup-ai-news-cron.js   # Cross-platform scheduler setup

commands/
└── ai-news.md              # Claude Code /ai-news command

skills/
└── ai-news-digest/
    └── SKILL.md             # This file
```

### Data Flow

```
RSS Feeds ──┐
             ├──→ news-fetcher.js ──→ ai-news-digest.js ──→ Markdown/JSON
GitHub API ──┘         │                    │
                  (parallel fetch)    (format + i18n)
                                          │
                                    ┌─────┴─────┐
                                    │            │
                                 Console      File
                              (stdout)   (~/.claude/news/)
```

## Usage Examples

### Quick Check (Console)

```bash
# Default: last 24h, all sources
node scripts/ai-news-digest.js

# Traditional Chinese
node scripts/ai-news-digest.js --lang=zh-TW

# Last 7 days, specific sources
node scripts/ai-news-digest.js --days=7 --sources=anthropic,openai
```

### Save to File

```bash
# Save as Markdown
node scripts/ai-news-digest.js --output=file --lang=zh-TW

# Save as JSON (for further processing)
node scripts/ai-news-digest.js --output=file --format=json
```

### Daily Automation

```bash
# Install cron job: daily at 6:30 AM
node scripts/setup-ai-news-cron.js --install --time=06:30 --lang=zh-TW

# View current config
node scripts/setup-ai-news-cron.js --show

# Remove automation
node scripts/setup-ai-news-cron.js --uninstall
```

### GitHub Actions

```yaml
# .github/workflows/ai-news-digest.yml
name: AI News Digest
on:
  schedule:
    - cron: '30 6 * * *'  # 6:30 AM UTC daily
  workflow_dispatch:

jobs:
  digest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: node scripts/ai-news-digest.js --output=file --lang=zh-TW
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/upload-artifact@v4
        with:
          name: ai-news-${{ github.run_id }}
          path: ~/.claude/news/
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GITHUB_TOKEN` | _(none)_ | GitHub API token — increases rate limits from 10/min to 30/min |
| `AI_NEWS_OUTPUT_DIR` | `~/.claude/news` | Directory for saved digests |
| `AI_NEWS_LANG` | `en` | Default output language |

### Supported Languages

| Code | Language |
|------|----------|
| `en` | English |
| `zh-TW` | 繁體中文 (Traditional Chinese) |
| `zh-CN` | 简体中文 (Simplified Chinese) |
| `ja` | 日本語 (Japanese) |

## Extending Sources

To add a new source, edit `scripts/lib/news-fetcher.js`:

```javascript
// In NEWS_SOURCES object:
mySource: {
  name: 'My Source Name',
  feeds: [
    { url: 'https://example.com/rss.xml', type: 'rss', label: 'My Feed' },
  ],
  github: [
    { owner: 'org', repo: 'repo-name', label: 'Repo Label' },
  ],
},
```

## Best Practices

- **Set GITHUB_TOKEN** to avoid API rate limiting (unauthenticated: 10 requests/minute)
- **Use `--days=1`** for daily digests, `--days=7` for weekly summaries
- **Save to file** (`--output=file`) to build a historical archive
- **Combine with other tools**: pipe JSON output to Slack webhooks, email, or notification systems
- **Use cron** for reliable daily delivery; GitHub Actions for team-wide access
