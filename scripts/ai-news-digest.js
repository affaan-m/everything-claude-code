#!/usr/bin/env node
/**
 * AI News Digest - Daily AI news aggregator
 *
 * Fetches and formats news from:
 * - Anthropic / Claude (blog, releases)
 * - Google / Gemini / DeepMind (blog, releases)
 * - xAI / Grok (releases)
 * - OpenAI (blog, releases)
 * - GitHub trending AI projects
 *
 * Usage:
 *   node scripts/ai-news-digest.js                    # Console output (Markdown)
 *   node scripts/ai-news-digest.js --format=json      # JSON output
 *   node scripts/ai-news-digest.js --output=file       # Save to ~/.claude/news/
 *   node scripts/ai-news-digest.js --days=3            # Last 3 days of news
 *   node scripts/ai-news-digest.js --sources=anthropic,google  # Specific sources
 *   node scripts/ai-news-digest.js --lang=zh-TW        # Chinese Traditional output
 *
 * Environment variables:
 *   GITHUB_TOKEN        - GitHub API token (optional, increases rate limits)
 *   AI_NEWS_OUTPUT_DIR  - Custom output directory (default: ~/.claude/news)
 *   AI_NEWS_LANG        - Output language: en, zh-TW, zh-CN, ja (default: en)
 */

const path = require('path');
const fs = require('fs');
const os = require('os');
const { fetchAllNews, NEWS_SOURCES } = require('./lib/news-fetcher');

// ─── CLI argument parsing ──────────────────────────────────────

function parseArgs(argv) {
  const args = {
    format: 'markdown',   // markdown | json
    output: 'console',    // console | file
    days: 1,
    sources: Object.keys(NEWS_SOURCES),
    lang: process.env.AI_NEWS_LANG || 'en',
    help: false,
  };

  for (const arg of argv.slice(2)) {
    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg.startsWith('--format=')) {
      args.format = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      args.output = arg.split('=')[1];
    } else if (arg.startsWith('--days=')) {
      args.days = parseInt(arg.split('=')[1], 10) || 1;
    } else if (arg.startsWith('--sources=')) {
      args.sources = arg.split('=')[1].split(',').map((s) => s.trim());
    } else if (arg.startsWith('--lang=')) {
      args.lang = arg.split('=')[1];
    }
  }

  return args;
}

// ─── i18n labels ───────────────────────────────────────────────

const LABELS = {
  en: {
    title: 'AI News Digest',
    generatedAt: 'Generated at',
    period: 'Period: Last',
    day: 'day',
    days: 'days',
    blogPosts: 'Blog Posts & Announcements',
    releases: 'GitHub Releases',
    trending: 'Trending Projects',
    noNews: 'No new items found for this period.',
    readMore: 'Read more',
    summary: 'Summary',
    quickLinks: 'Quick Links',
    poweredBy: 'Powered by everything-claude-code AI News Digest',
  },
  'zh-TW': {
    title: 'AI 新聞日報',
    generatedAt: '生成時間',
    period: '期間：最近',
    day: '天',
    days: '天',
    blogPosts: '部落格文章與公告',
    releases: 'GitHub 版本更新',
    trending: '熱門專案',
    noNews: '此期間未找到新項目。',
    readMore: '閱讀更多',
    summary: '摘要',
    quickLinks: '快速連結',
    poweredBy: '由 everything-claude-code AI 新聞日報提供',
  },
  'zh-CN': {
    title: 'AI 新闻日报',
    generatedAt: '生成时间',
    period: '期间：最近',
    day: '天',
    days: '天',
    blogPosts: '博客文章与公告',
    releases: 'GitHub 版本更新',
    trending: '热门项目',
    noNews: '此期间未找到新项目。',
    readMore: '阅读更多',
    summary: '摘要',
    quickLinks: '快速链接',
    poweredBy: '由 everything-claude-code AI 新闻日报提供',
  },
  ja: {
    title: 'AIニュースダイジェスト',
    generatedAt: '生成日時',
    period: '期間：直近',
    day: '日間',
    days: '日間',
    blogPosts: 'ブログ記事＆アナウンス',
    releases: 'GitHub リリース',
    trending: 'トレンドプロジェクト',
    noNews: 'この期間の新しい項目は見つかりませんでした。',
    readMore: '続きを読む',
    summary: '要約',
    quickLinks: 'クイックリンク',
    poweredBy: 'everything-claude-code AI News Digest 提供',
  },
};

function getLabels(lang) {
  return LABELS[lang] || LABELS.en;
}

// ─── Markdown formatter ────────────────────────────────────────

function formatMarkdown(results, args) {
  const L = getLabels(args.lang);
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].slice(0, 5);

  const lines = [];
  lines.push(`# ${L.title} - ${dateStr}`);
  lines.push('');
  lines.push(`> ${L.generatedAt}: ${dateStr} ${timeStr}`);
  lines.push(`> ${L.period} ${args.days} ${args.days === 1 ? L.day : L.days}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  let totalItems = 0;

  for (const [sourceKey, source] of Object.entries(results)) {
    const hasItems = hasAnyItems(source);
    if (!hasItems) continue;

    lines.push(`## ${source.name}`);
    lines.push('');

    // Blog posts / RSS feeds
    if (source.feeds && source.feeds.length > 0) {
      for (const feed of source.feeds) {
        if (feed.items.length === 0) continue;

        lines.push(`### ${feed.label} (${L.blogPosts})`);
        lines.push('');

        for (const item of feed.items) {
          totalItems++;
          lines.push(`- **${item.title}**`);
          if (item.link) lines.push(`  ${L.readMore}: ${item.link}`);
          if (item.date) lines.push(`  ${formatDate(item.date, args.lang)}`);
          if (item.description) lines.push(`  > ${item.description.slice(0, 200)}...`);
          lines.push('');
        }
      }
    }

    // GitHub releases
    if (source.releases && source.releases.length > 0) {
      for (const release of source.releases) {
        if (release.items.length === 0) continue;

        lines.push(`### ${release.label} (${L.releases})`);
        lines.push('');

        for (const item of release.items) {
          totalItems++;
          lines.push(`- **${item.title}**`);
          if (item.link) lines.push(`  ${L.readMore}: ${item.link}`);
          if (item.date) lines.push(`  ${formatDate(item.date, args.lang)}`);
          lines.push('');
        }
      }
    }

    // Trending repos
    if (source.trending && source.trending.length > 0) {
      for (const trending of source.trending) {
        if (trending.items.length === 0) continue;

        lines.push(`### ${trending.label} (${L.trending})`);
        lines.push('');

        for (const item of trending.items) {
          totalItems++;
          lines.push(`- **${item.title}**`);
          if (item.description) lines.push(`  ${item.description}`);
          if (item.link) lines.push(`  ${item.link}`);
          lines.push('');
        }
      }
    }

    lines.push('---');
    lines.push('');
  }

  if (totalItems === 0) {
    lines.push(L.noNews);
    lines.push('');
  }

  // Footer
  lines.push(`_${L.poweredBy}_`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Check if a source has any items
 */
function hasAnyItems(source) {
  const feedItems = (source.feeds || []).some((f) => f.items.length > 0);
  const releaseItems = (source.releases || []).some((r) => r.items.length > 0);
  const trendingItems = (source.trending || []).some((t) => t.items.length > 0);
  return feedItems || releaseItems || trendingItems;
}

/**
 * Format a date string for display
 */
function formatDate(dateStr, lang) {
  try {
    const date = new Date(dateStr);
    const locale = lang === 'zh-TW' ? 'zh-TW' : lang === 'zh-CN' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ─── Output handlers ───────────────────────────────────────────

function getOutputDir() {
  return process.env.AI_NEWS_OUTPUT_DIR || path.join(os.homedir(), '.claude', 'news');
}

function ensureOutputDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

function saveToFile(content, format) {
  const outDir = ensureOutputDir(getOutputDir());
  const dateStr = new Date().toISOString().split('T')[0];
  const ext = format === 'json' ? 'json' : 'md';
  const filePath = path.join(outDir, `ai-news-${dateStr}.${ext}`);

  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

// ─── Main ──────────────────────────────────────────────────────

function printUsage() {
  console.log(`
AI News Digest - Daily AI news aggregator

Usage:
  node scripts/ai-news-digest.js [options]

Options:
  --format=markdown|json   Output format (default: markdown)
  --output=console|file    Output destination (default: console)
  --days=N                 Fetch news from last N days (default: 1)
  --sources=a,b,c          Comma-separated sources (default: all)
  --lang=en|zh-TW|zh-CN|ja Output language (default: en)
  --help, -h               Show this help

Available sources:
  ${Object.keys(NEWS_SOURCES).join(', ')}

Environment variables:
  GITHUB_TOKEN        GitHub API token (increases rate limits)
  AI_NEWS_OUTPUT_DIR  Custom output directory (default: ~/.claude/news)
  AI_NEWS_LANG        Default output language

Examples:
  # Show today's news in Chinese Traditional
  node scripts/ai-news-digest.js --lang=zh-TW

  # Save last 3 days to file
  node scripts/ai-news-digest.js --days=3 --output=file

  # Only Anthropic and Google, JSON format
  node scripts/ai-news-digest.js --sources=anthropic,google --format=json
`);
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    printUsage();
    process.exit(0);
  }

  console.error(`[AI News Digest] Fetching news from ${args.sources.length} sources (last ${args.days} day${args.days > 1 ? 's' : ''})...`);

  try {
    const results = await fetchAllNews({
      maxAgeDays: args.days,
      sources: args.sources,
    });

    let output;
    if (args.format === 'json') {
      output = JSON.stringify(results, null, 2);
    } else {
      output = formatMarkdown(results, args);
    }

    if (args.output === 'file') {
      const filePath = saveToFile(output, args.format);
      console.error(`[AI News Digest] Saved to: ${filePath}`);
    }

    // Always output to stdout
    console.log(output);

  } catch (err) {
    console.error(`[AI News Digest] Error: ${err.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  formatMarkdown,
  formatDate,
  hasAnyItems,
  getLabels,
  getOutputDir,
  LABELS,
};
