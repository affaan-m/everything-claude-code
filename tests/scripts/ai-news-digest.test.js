/**
 * Tests for AI News Digest scripts
 *
 * Run with: node tests/scripts/ai-news-digest.test.js
 */

const assert = require('assert');
const path = require('path');

// ─── Test helpers ──────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    failed++;
    return false;
  }
}

// ─── Load modules ──────────────────────────────────────────────

const newsFetcher = require('../../scripts/lib/news-fetcher');
const newsDigest = require('../../scripts/ai-news-digest');
const setupCron = require('../../scripts/setup-ai-news-cron');

// ═══════════════════════════════════════════════════════════════
// news-fetcher.js tests
// ═══════════════════════════════════════════════════════════════

console.log('\n─── news-fetcher.js ───');

// --- stripHtml ---

test('stripHtml removes HTML tags', () => {
  assert.strictEqual(newsFetcher.stripHtml('<p>Hello <b>World</b></p>'), 'Hello World');
});

test('stripHtml decodes HTML entities', () => {
  assert.strictEqual(newsFetcher.stripHtml('&amp; &lt; &gt; &quot; &#39;'), '& < > " \'');
});

test('stripHtml handles empty input', () => {
  assert.strictEqual(newsFetcher.stripHtml(''), '');
  assert.strictEqual(newsFetcher.stripHtml(null), '');
  assert.strictEqual(newsFetcher.stripHtml(undefined), '');
});

test('stripHtml collapses whitespace', () => {
  assert.strictEqual(newsFetcher.stripHtml('hello   world\n\nfoo'), 'hello world foo');
});

// --- extractTag ---

test('extractTag extracts simple tag content', () => {
  assert.strictEqual(newsFetcher.extractTag('<title>Hello</title>', 'title'), 'Hello');
});

test('extractTag extracts CDATA content', () => {
  const xml = '<description><![CDATA[Some <b>HTML</b> content]]></description>';
  assert.strictEqual(newsFetcher.extractTag(xml, 'description'), 'Some <b>HTML</b> content');
});

test('extractTag returns null for missing tag', () => {
  assert.strictEqual(newsFetcher.extractTag('<title>Hello</title>', 'description'), null);
});

test('extractTag handles tag with attributes', () => {
  assert.strictEqual(newsFetcher.extractTag('<title type="text">Hello</title>', 'title'), 'Hello');
});

// --- extractLink ---

test('extractLink extracts Atom link with href', () => {
  const xml = '<link href="https://example.com/post" rel="alternate" />';
  assert.strictEqual(newsFetcher.extractLink(xml), 'https://example.com/post');
});

test('extractLink extracts RSS link tag', () => {
  const xml = '<link>https://example.com/post</link>';
  assert.strictEqual(newsFetcher.extractLink(xml), 'https://example.com/post');
});

test('extractLink falls back to guid', () => {
  const xml = '<guid>https://example.com/post/123</guid>';
  assert.strictEqual(newsFetcher.extractLink(xml), 'https://example.com/post/123');
});

// --- parseRssFeed ---

test('parseRssFeed parses RSS items', () => {
  const xml = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>First Post</title>
      <link>https://example.com/1</link>
      <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
      <description>This is the first post</description>
    </item>
    <item>
      <title>Second Post</title>
      <link>https://example.com/2</link>
      <pubDate>Tue, 02 Jan 2024 00:00:00 GMT</pubDate>
      <description>This is the second post</description>
    </item>
  </channel>
</rss>`;

  const items = newsFetcher.parseRssFeed(xml);
  assert.strictEqual(items.length, 2);
  assert.strictEqual(items[0].title, 'First Post');
  assert.strictEqual(items[0].link, 'https://example.com/1');
  assert.ok(items[0].date.includes('2024'));
  assert.strictEqual(items[1].title, 'Second Post');
});

test('parseRssFeed parses Atom entries', () => {
  const xml = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Atom Post</title>
    <link href="https://example.com/atom/1" rel="alternate"/>
    <published>2024-01-15T10:00:00Z</published>
    <summary>An atom post summary</summary>
  </entry>
</feed>`;

  const items = newsFetcher.parseRssFeed(xml);
  assert.strictEqual(items.length, 1);
  assert.strictEqual(items[0].title, 'Atom Post');
  assert.strictEqual(items[0].link, 'https://example.com/atom/1');
});

test('parseRssFeed handles empty feed', () => {
  const xml = '<rss><channel><title>Empty</title></channel></rss>';
  const items = newsFetcher.parseRssFeed(xml);
  assert.strictEqual(items.length, 0);
});

test('parseRssFeed handles CDATA in description', () => {
  const xml = `<rss><channel>
    <item>
      <title>CDATA Test</title>
      <link>https://example.com/cdata</link>
      <description><![CDATA[<p>Rich <b>HTML</b> content</p>]]></description>
    </item>
  </channel></rss>`;

  const items = newsFetcher.parseRssFeed(xml);
  assert.strictEqual(items.length, 1);
  assert.strictEqual(items[0].description, 'Rich HTML content');
});

// --- parseGitHubReleases ---

test('parseGitHubReleases parses release array', () => {
  const json = JSON.stringify([
    {
      name: 'v1.0.0',
      tag_name: 'v1.0.0',
      html_url: 'https://github.com/org/repo/releases/tag/v1.0.0',
      published_at: '2024-01-15T10:00:00Z',
      body: 'Release notes here',
    },
    {
      name: 'v0.9.0',
      tag_name: 'v0.9.0',
      html_url: 'https://github.com/org/repo/releases/tag/v0.9.0',
      published_at: '2024-01-10T10:00:00Z',
      body: 'Older release',
    },
  ]);

  const items = newsFetcher.parseGitHubReleases(json);
  assert.strictEqual(items.length, 2);
  assert.strictEqual(items[0].title, 'v1.0.0');
  assert.strictEqual(items[0].link, 'https://github.com/org/repo/releases/tag/v1.0.0');
});

test('parseGitHubReleases handles empty array', () => {
  assert.strictEqual(newsFetcher.parseGitHubReleases('[]').length, 0);
});

test('parseGitHubReleases handles invalid JSON', () => {
  assert.strictEqual(newsFetcher.parseGitHubReleases('not json').length, 0);
});

test('parseGitHubReleases uses tag_name as fallback title', () => {
  const json = JSON.stringify([{ tag_name: 'v2.0.0', html_url: 'https://example.com' }]);
  const items = newsFetcher.parseGitHubReleases(json);
  assert.strictEqual(items[0].title, 'v2.0.0');
});

test('parseGitHubReleases limits to 5 results', () => {
  const releases = Array.from({ length: 10 }, (_, i) => ({
    name: `v${i}`,
    tag_name: `v${i}`,
    html_url: `https://example.com/${i}`,
  }));
  const items = newsFetcher.parseGitHubReleases(JSON.stringify(releases));
  assert.strictEqual(items.length, 5);
});

// --- parseGitHubTrending ---

test('parseGitHubTrending parses search results', () => {
  const json = JSON.stringify({
    items: [
      {
        full_name: 'org/cool-ai-project',
        html_url: 'https://github.com/org/cool-ai-project',
        description: 'A cool AI project',
        stargazers_count: 1500,
        updated_at: '2024-01-15T10:00:00Z',
      },
    ],
  });

  const items = newsFetcher.parseGitHubTrending(json);
  assert.strictEqual(items.length, 1);
  assert.ok(items[0].title.includes('org/cool-ai-project'));
  assert.ok(items[0].title.includes('1500'));
  assert.strictEqual(items[0].stars, 1500);
});

test('parseGitHubTrending handles missing items', () => {
  assert.strictEqual(newsFetcher.parseGitHubTrending('{}').length, 0);
  assert.strictEqual(newsFetcher.parseGitHubTrending('invalid').length, 0);
});

test('parseGitHubTrending limits to 10 results', () => {
  const data = {
    items: Array.from({ length: 20 }, (_, i) => ({
      full_name: `org/repo-${i}`,
      html_url: `https://github.com/org/repo-${i}`,
      description: `Repo ${i}`,
      stargazers_count: 100 - i,
    })),
  };
  const items = newsFetcher.parseGitHubTrending(JSON.stringify(data));
  assert.strictEqual(items.length, 10);
});

// --- filterByDate ---

test('filterByDate keeps recent items', () => {
  const cutoff = new Date('2024-01-10');
  const items = [
    { title: 'New', date: '2024-01-15T00:00:00Z' },
    { title: 'Old', date: '2024-01-05T00:00:00Z' },
    { title: 'No date' },
  ];

  const filtered = newsFetcher.filterByDate(items, cutoff);
  assert.strictEqual(filtered.length, 2); // 'New' and 'No date'
  assert.strictEqual(filtered[0].title, 'New');
  assert.strictEqual(filtered[1].title, 'No date');
});

test('filterByDate handles empty array', () => {
  assert.strictEqual(newsFetcher.filterByDate([], new Date()).length, 0);
});

// --- NEWS_SOURCES ---

test('NEWS_SOURCES has expected source keys', () => {
  const keys = Object.keys(newsFetcher.NEWS_SOURCES);
  assert.ok(keys.includes('anthropic'), 'Missing anthropic source');
  assert.ok(keys.includes('google'), 'Missing google source');
  assert.ok(keys.includes('xai'), 'Missing xai source');
  assert.ok(keys.includes('openai'), 'Missing openai source');
  assert.ok(keys.includes('github_trending'), 'Missing github_trending source');
});

test('NEWS_SOURCES anthropic has correct structure', () => {
  const source = newsFetcher.NEWS_SOURCES.anthropic;
  assert.ok(source.name);
  assert.ok(Array.isArray(source.feeds));
  assert.ok(Array.isArray(source.github));
  assert.ok(source.feeds.length > 0);
  assert.ok(source.github.length > 0);
});

test('NEWS_SOURCES each feed has url, type, and label', () => {
  for (const [key, source] of Object.entries(newsFetcher.NEWS_SOURCES)) {
    if (source.feeds) {
      for (const feed of source.feeds) {
        assert.ok(feed.url, `${key}: feed missing url`);
        assert.ok(feed.type, `${key}: feed missing type`);
        assert.ok(feed.label, `${key}: feed missing label`);
      }
    }
  }
});

test('NEWS_SOURCES each github repo has owner, repo, and label', () => {
  for (const [key, source] of Object.entries(newsFetcher.NEWS_SOURCES)) {
    if (source.github) {
      for (const repo of source.github) {
        assert.ok(repo.owner, `${key}: repo missing owner`);
        assert.ok(repo.repo, `${key}: repo missing repo`);
        assert.ok(repo.label, `${key}: repo missing label`);
      }
    }
  }
});

// ═══════════════════════════════════════════════════════════════
// ai-news-digest.js tests
// ═══════════════════════════════════════════════════════════════

console.log('\n─── ai-news-digest.js ───');

// --- parseArgs ---

test('parseArgs returns defaults', () => {
  const args = newsDigest.parseArgs(['node', 'script.js']);
  assert.strictEqual(args.format, 'markdown');
  assert.strictEqual(args.output, 'console');
  assert.strictEqual(args.days, 1);
  assert.strictEqual(args.help, false);
});

test('parseArgs parses --format', () => {
  const args = newsDigest.parseArgs(['node', 'script.js', '--format=json']);
  assert.strictEqual(args.format, 'json');
});

test('parseArgs parses --days', () => {
  const args = newsDigest.parseArgs(['node', 'script.js', '--days=7']);
  assert.strictEqual(args.days, 7);
});

test('parseArgs parses --sources', () => {
  const args = newsDigest.parseArgs(['node', 'script.js', '--sources=anthropic,google']);
  assert.deepStrictEqual(args.sources, ['anthropic', 'google']);
});

test('parseArgs parses --lang', () => {
  const args = newsDigest.parseArgs(['node', 'script.js', '--lang=zh-TW']);
  assert.strictEqual(args.lang, 'zh-TW');
});

test('parseArgs parses --help', () => {
  const args = newsDigest.parseArgs(['node', 'script.js', '--help']);
  assert.strictEqual(args.help, true);
});

test('parseArgs parses -h', () => {
  const args = newsDigest.parseArgs(['node', 'script.js', '-h']);
  assert.strictEqual(args.help, true);
});

test('parseArgs handles multiple flags', () => {
  const args = newsDigest.parseArgs(['node', 'script.js', '--days=3', '--lang=ja', '--format=json', '--output=file']);
  assert.strictEqual(args.days, 3);
  assert.strictEqual(args.lang, 'ja');
  assert.strictEqual(args.format, 'json');
  assert.strictEqual(args.output, 'file');
});

// --- getLabels ---

test('getLabels returns English labels by default', () => {
  const labels = newsDigest.getLabels('en');
  assert.strictEqual(labels.title, 'AI News Digest');
  assert.ok(labels.blogPosts);
  assert.ok(labels.releases);
});

test('getLabels returns zh-TW labels', () => {
  const labels = newsDigest.getLabels('zh-TW');
  assert.strictEqual(labels.title, 'AI 新聞日報');
});

test('getLabels returns zh-CN labels', () => {
  const labels = newsDigest.getLabels('zh-CN');
  assert.strictEqual(labels.title, 'AI 新闻日报');
});

test('getLabels returns ja labels', () => {
  const labels = newsDigest.getLabels('ja');
  assert.ok(labels.title.includes('AI'));
});

test('getLabels falls back to English for unknown lang', () => {
  const labels = newsDigest.getLabels('xx-YY');
  assert.strictEqual(labels.title, 'AI News Digest');
});

// --- LABELS ---

test('LABELS has all required keys for each language', () => {
  const requiredKeys = ['title', 'generatedAt', 'period', 'day', 'days', 'blogPosts', 'releases', 'trending', 'noNews', 'readMore', 'summary', 'quickLinks', 'poweredBy'];
  for (const [lang, labels] of Object.entries(newsDigest.LABELS)) {
    for (const key of requiredKeys) {
      assert.ok(labels[key] !== undefined, `${lang} missing label: ${key}`);
    }
  }
});

// --- hasAnyItems ---

test('hasAnyItems returns true when feeds have items', () => {
  assert.strictEqual(newsDigest.hasAnyItems({ feeds: [{ items: [{ title: 'a' }] }], releases: [], trending: [] }), true);
});

test('hasAnyItems returns false when all empty', () => {
  assert.strictEqual(newsDigest.hasAnyItems({ feeds: [], releases: [], trending: [] }), false);
});

test('hasAnyItems returns true when releases have items', () => {
  assert.strictEqual(newsDigest.hasAnyItems({ feeds: [], releases: [{ items: [{ title: 'a' }] }], trending: [] }), true);
});

// --- formatMarkdown ---

test('formatMarkdown generates valid markdown with title', () => {
  const results = {
    anthropic: {
      name: 'Anthropic / Claude',
      feeds: [{ label: 'Blog', items: [{ title: 'New Feature', link: 'https://example.com', date: '2024-01-15', description: 'Description here' }] }],
      releases: [],
      trending: [],
    },
  };
  const args = { days: 1, lang: 'en' };
  const md = newsDigest.formatMarkdown(results, args);

  assert.ok(md.includes('# AI News Digest'));
  assert.ok(md.includes('Anthropic / Claude'));
  assert.ok(md.includes('New Feature'));
  assert.ok(md.includes('https://example.com'));
});

test('formatMarkdown uses correct language labels', () => {
  const results = {
    google: {
      name: 'Google',
      feeds: [{ label: 'Blog', items: [{ title: 'Gemini Update', link: 'https://example.com', date: '2024-01-15' }] }],
      releases: [],
      trending: [],
    },
  };
  const args = { days: 1, lang: 'zh-TW' };
  const md = newsDigest.formatMarkdown(results, args);

  assert.ok(md.includes('AI 新聞日報'));
  assert.ok(md.includes('部落格文章與公告'));
});

test('formatMarkdown shows noNews when no items', () => {
  const results = {
    anthropic: { name: 'Anthropic', feeds: [], releases: [], trending: [] },
  };
  const args = { days: 1, lang: 'en' };
  const md = newsDigest.formatMarkdown(results, args);

  assert.ok(md.includes('No new items found'));
});

// --- formatDate ---

test('formatDate formats ISO date string', () => {
  const result = newsDigest.formatDate('2024-01-15T10:00:00Z', 'en');
  assert.ok(result.includes('2024'));
  assert.ok(result.includes('Jan') || result.includes('15'));
});

test('formatDate handles zh-TW locale', () => {
  const result = newsDigest.formatDate('2024-01-15T10:00:00Z', 'zh-TW');
  assert.ok(result.includes('2024'));
});

test('formatDate handles invalid date gracefully', () => {
  const result = newsDigest.formatDate('not-a-date', 'en');
  // Should return the original string or a reasonable fallback
  assert.ok(typeof result === 'string');
});

// ═══════════════════════════════════════════════════════════════
// setup-ai-news-cron.js tests
// ═══════════════════════════════════════════════════════════════

console.log('\n─── setup-ai-news-cron.js ───');

// --- parseArgs ---

test('setup parseArgs returns defaults', () => {
  const args = setupCron.parseArgs(['node', 'script.js']);
  assert.strictEqual(args.action, 'show');
  assert.strictEqual(args.time, '06:30');
  assert.strictEqual(args.outputFile, true);
});

test('setup parseArgs parses --install', () => {
  const args = setupCron.parseArgs(['node', 'script.js', '--install']);
  assert.strictEqual(args.action, 'install');
});

test('setup parseArgs parses --uninstall', () => {
  const args = setupCron.parseArgs(['node', 'script.js', '--uninstall']);
  assert.strictEqual(args.action, 'uninstall');
});

test('setup parseArgs parses --time', () => {
  const args = setupCron.parseArgs(['node', 'script.js', '--time=07:00']);
  assert.strictEqual(args.time, '07:00');
});

test('setup parseArgs parses --lang', () => {
  const args = setupCron.parseArgs(['node', 'script.js', '--lang=en']);
  assert.strictEqual(args.lang, 'en');
});

// --- getCronLine ---

test('getCronLine generates valid cron expression', () => {
  const line = setupCron.getCronLine('06:30', 'zh-TW', true);
  assert.ok(line.startsWith('30 06 * * *') || line.startsWith('30 6 * * *'));
  assert.ok(line.includes('ai-news-digest.js'));
  assert.ok(line.includes('--lang=zh-TW'));
  assert.ok(line.includes('--output=file'));
});

test('getCronLine handles different times', () => {
  const line = setupCron.getCronLine('14:45', 'en', false);
  assert.ok(line.startsWith('45 14 * * *'));
  assert.ok(!line.includes('--output=file'));
});

// --- generateLaunchdPlist ---

test('generateLaunchdPlist generates valid XML', () => {
  const plist = setupCron.generateLaunchdPlist('06:30', 'zh-TW', true);
  assert.ok(plist.includes('<?xml'));
  assert.ok(plist.includes('com.claude-code.ai-news-digest'));
  assert.ok(plist.includes('<integer>6</integer>')); // Hour
  assert.ok(plist.includes('<integer>30</integer>')); // Minute
  assert.ok(plist.includes('--lang=zh-TW'));
});

// --- generateWindowsTask ---

test('generateWindowsTask generates valid batch file', () => {
  const batch = setupCron.generateWindowsTask('06:30', 'en', true);
  assert.ok(batch.includes('schtasks'));
  assert.ok(batch.includes('AI News Digest'));
  assert.ok(batch.includes('06:30'));
  assert.ok(batch.includes('--lang=en'));
});

// --- generateGitHubActionsWorkflow ---

test('generateGitHubActionsWorkflow generates valid YAML', () => {
  const workflow = setupCron.generateGitHubActionsWorkflow('06:30', 'zh-TW');
  assert.ok(workflow.includes('name: AI News Digest'));
  assert.ok(workflow.includes("cron: '30 06 * * *'") || workflow.includes("cron: '30 6 * * *'"));
  assert.ok(workflow.includes('AI_NEWS_LANG: zh-TW'));
  assert.ok(workflow.includes('actions/checkout'));
});

// --- getScriptPath ---

test('getScriptPath returns absolute path', () => {
  const scriptPath = setupCron.getScriptPath();
  assert.ok(path.isAbsolute(scriptPath));
  assert.ok(scriptPath.endsWith('ai-news-digest.js'));
});

// --- getOutputDir ---

test('getOutputDir returns path under home', () => {
  // Clear env var for test
  const original = process.env.AI_NEWS_OUTPUT_DIR;
  delete process.env.AI_NEWS_OUTPUT_DIR;
  const dir = setupCron.getOutputDir();
  assert.ok(dir.includes('.claude'));
  assert.ok(dir.includes('news'));
  // Restore
  if (original) process.env.AI_NEWS_OUTPUT_DIR = original;
});

// --- CRON_MARKER ---

test('CRON_MARKER is a comment string', () => {
  assert.ok(setupCron.CRON_MARKER.startsWith('#'));
  assert.ok(setupCron.CRON_MARKER.includes('AI-NEWS'));
});

// ═══════════════════════════════════════════════════════════════
// Results
// ═══════════════════════════════════════════════════════════════

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

process.exit(failed > 0 ? 1 : 0);
