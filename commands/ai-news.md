---
description: Fetch and display daily AI news digest from Anthropic, Google, xAI, OpenAI, and GitHub trending projects.
---

# AI News Digest

Fetch and display a comprehensive daily AI news digest covering major AI companies and open-source projects.

## What This Command Does

1. **Fetch News** - Aggregates from multiple sources in parallel
2. **Categorize** - Groups by company/organization
3. **Format** - Outputs a readable Markdown digest
4. **Save** - Optionally saves to `~/.claude/news/` for history

## Sources Covered

| Source | What's Tracked |
|--------|---------------|
| **Anthropic / Claude** | Blog posts, Claude Code releases, SDK updates |
| **Google / Gemini / DeepMind** | AI blog, DeepMind research, Gemini API updates |
| **xAI / Grok** | Grok model releases, announcements |
| **OpenAI** | Blog posts, SDK releases, Codex CLI updates |
| **GitHub Trending** | New AI/ML/LLM repos gaining traction |

## When to Use

Use `/ai-news` when:
- Starting your day and want to catch up on AI developments
- Checking if any AI tools you use have new releases
- Tracking open-source AI project trends
- Staying informed about competitor and ecosystem changes

## How It Works

Run the AI news digest script to fetch latest news:

```bash
# Today's news (default: last 24 hours)
node scripts/ai-news-digest.js --lang=zh-TW

# Last 3 days
node scripts/ai-news-digest.js --days=3 --lang=zh-TW

# Save to file
node scripts/ai-news-digest.js --output=file --lang=zh-TW

# Specific sources only
node scripts/ai-news-digest.js --sources=anthropic,google --lang=zh-TW

# English output
node scripts/ai-news-digest.js --lang=en
```

## Daily Automation Setup

To receive news automatically every morning at 6:30 AM:

```bash
# Show setup options
node scripts/setup-ai-news-cron.js --show

# Install cron job (Linux/macOS)
node scripts/setup-ai-news-cron.js --install --time=06:30 --lang=zh-TW

# Remove cron job
node scripts/setup-ai-news-cron.js --uninstall
```

Supports: crontab (Linux/macOS), launchd (macOS), Windows Task Scheduler, GitHub Actions.

## Output Languages

- `en` - English
- `zh-TW` - 繁體中文 (Traditional Chinese)
- `zh-CN` - 简体中文 (Simplified Chinese)
- `ja` - 日本語 (Japanese)

## Tips

- Set `GITHUB_TOKEN` environment variable to increase GitHub API rate limits
- Use `AI_NEWS_LANG=zh-TW` in your shell profile for default language
- Saved digests are stored in `~/.claude/news/ai-news-YYYY-MM-DD.md`
- Combine with `/plan` to plan your day based on new developments

## Related

- **Script**: `scripts/ai-news-digest.js`
- **Library**: `scripts/lib/news-fetcher.js`
- **Setup**: `scripts/setup-ai-news-cron.js`
- **Skill**: `skills/ai-news-digest/SKILL.md`
