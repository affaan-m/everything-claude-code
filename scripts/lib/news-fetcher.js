/**
 * AI News Fetcher - Fetches news from multiple AI company sources
 * Uses only Node.js built-in modules (https, http)
 *
 * Sources:
 * - GitHub: Trending AI repos & releases from key projects
 * - Anthropic/Claude: Blog & changelog
 * - Google/Gemini: AI blog & DeepMind updates
 * - xAI/Grok: Official announcements
 * - OpenAI: Blog & releases
 */

const https = require('https');
const http = require('http');

// Default request timeout (15 seconds)
const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Make an HTTP/HTTPS GET request and return the response body
 * @param {string} url - URL to fetch
 * @param {object} options - Additional options
 * @param {number} options.timeoutMs - Request timeout in milliseconds
 * @param {object} options.headers - Additional headers
 * @returns {Promise<{statusCode: number, body: string, headers: object}>}
 */
function fetchUrl(url, options = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, headers = {} } = options;

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'AI-News-Digest/1.0 (Claude Code Plugin)',
        Accept: 'application/json, application/atom+xml, application/rss+xml, text/xml, */*',
        ...headers,
      },
    };

    const req = client.request(reqOptions, (res) => {
      // Follow redirects (301, 302, 307, 308)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${parsedUrl.protocol}//${parsedUrl.host}${res.headers.location}`;
        fetchUrl(redirectUrl, options).then(resolve).catch(reject);
        res.resume(); // Consume response to free up memory
        return;
      }

      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body, headers: res.headers });
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Request to ${url} failed: ${err.message}`));
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Request to ${url} timed out after ${timeoutMs}ms`));
    });

    req.end();
  });
}

/**
 * Parse simple XML/RSS/Atom items from feed body.
 * This is a lightweight parser — no external dependencies.
 * @param {string} xml - Raw XML string
 * @returns {Array<{title: string, link: string, date: string, description: string}>}
 */
function parseRssFeed(xml) {
  const items = [];

  // Try Atom format first (<entry>), then RSS (<item>)
  const entryRegex = /<(?:entry|item)[\s>]([\s\S]*?)<\/(?:entry|item)>/gi;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];

    const title = extractTag(block, 'title');
    const link = extractLink(block);
    const date = extractTag(block, 'published') ||
                 extractTag(block, 'updated') ||
                 extractTag(block, 'pubDate') ||
                 extractTag(block, 'dc:date');
    const description = extractTag(block, 'summary') ||
                        extractTag(block, 'description') ||
                        extractTag(block, 'content');

    if (title) {
      items.push({
        title: stripHtml(title).trim(),
        link: link || '',
        date: date || '',
        description: stripHtml(description || '').trim().slice(0, 300),
      });
    }
  }

  return items;
}

/**
 * Extract text content from an XML tag
 */
function extractTag(xml, tagName) {
  // Match tag with CDATA or regular content
  const cdataRegex = new RegExp(`<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tagName}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1];

  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'i');
  const m = xml.match(regex);
  return m ? m[1] : null;
}

/**
 * Extract link from XML block (handles both RSS and Atom formats)
 */
function extractLink(xml) {
  // Atom: <link href="..." />
  const atomLink = xml.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  if (atomLink) return atomLink[1];

  // RSS: <link>...</link>
  const rssLink = extractTag(xml, 'link');
  if (rssLink && rssLink.startsWith('http')) return rssLink;

  // <guid> as fallback
  const guid = extractTag(xml, 'guid');
  if (guid && guid.startsWith('http')) return guid;

  return null;
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Parse GitHub API JSON response for releases
 * @param {string} json - Raw JSON string
 * @returns {Array<{title: string, link: string, date: string, description: string}>}
 */
function parseGitHubReleases(json) {
  try {
    const releases = JSON.parse(json);
    if (!Array.isArray(releases)) return [];

    return releases.slice(0, 5).map((release) => ({
      title: release.name || release.tag_name || 'Unnamed release',
      link: release.html_url || '',
      date: release.published_at || release.created_at || '',
      description: (release.body || '').slice(0, 300),
    }));
  } catch {
    return [];
  }
}

/**
 * Parse GitHub trending repos from the search API
 * @param {string} json - Raw JSON string from GitHub search API
 * @returns {Array<{title: string, link: string, date: string, description: string, stars: number}>}
 */
function parseGitHubTrending(json) {
  try {
    const data = JSON.parse(json);
    if (!data.items || !Array.isArray(data.items)) return [];

    return data.items.slice(0, 10).map((repo) => ({
      title: `${repo.full_name} (+${repo.stargazers_count} stars)`,
      link: repo.html_url || '',
      date: repo.updated_at || repo.created_at || '',
      description: (repo.description || 'No description').slice(0, 300),
      stars: repo.stargazers_count || 0,
    }));
  } catch {
    return [];
  }
}

// ─── Source definitions ────────────────────────────────────────

const NEWS_SOURCES = {
  anthropic: {
    name: 'Anthropic / Claude',
    feeds: [
      {
        url: 'https://www.anthropic.com/rss.xml',
        type: 'rss',
        label: 'Anthropic Blog',
      },
    ],
    github: [
      { owner: 'anthropics', repo: 'claude-code', label: 'Claude Code Releases' },
      { owner: 'anthropics', repo: 'anthropic-sdk-python', label: 'Anthropic Python SDK' },
      { owner: 'anthropics', repo: 'courses', label: 'Anthropic Courses' },
    ],
  },

  google: {
    name: 'Google / Gemini / DeepMind',
    feeds: [
      {
        url: 'https://blog.google/technology/ai/rss/',
        type: 'rss',
        label: 'Google AI Blog',
      },
      {
        url: 'https://deepmind.google/blog/rss.xml',
        type: 'rss',
        label: 'DeepMind Blog',
      },
    ],
    github: [
      { owner: 'google-gemini', repo: 'gemini-api-cookbook', label: 'Gemini API Cookbook' },
      { owner: 'google-gemini', repo: 'generative-ai-js', label: 'Google Generative AI JS' },
    ],
  },

  xai: {
    name: 'xAI / Grok',
    feeds: [],
    github: [
      { owner: 'xai-org', repo: 'grok-1', label: 'Grok-1 Model' },
    ],
  },

  openai: {
    name: 'OpenAI',
    feeds: [
      {
        url: 'https://openai.com/blog/rss.xml',
        type: 'rss',
        label: 'OpenAI Blog',
      },
    ],
    github: [
      { owner: 'openai', repo: 'openai-python', label: 'OpenAI Python SDK' },
      { owner: 'openai', repo: 'codex', label: 'OpenAI Codex CLI' },
    ],
  },

  github_trending: {
    name: 'GitHub Trending AI Projects',
    feeds: [],
    github: [],
    trending: true,
  },
};

// ─── Fetcher functions ─────────────────────────────────────────

/**
 * Fetch and parse an RSS/Atom feed
 * @param {object} feed - Feed definition {url, type, label}
 * @returns {Promise<{label: string, items: Array}>}
 */
async function fetchRssFeed(feed) {
  try {
    const { body } = await fetchUrl(feed.url);
    const items = parseRssFeed(body);
    return { label: feed.label, items };
  } catch (err) {
    return { label: feed.label, items: [], error: err.message };
  }
}

/**
 * Fetch GitHub releases for a repo
 * @param {object} repo - {owner, repo, label}
 * @returns {Promise<{label: string, items: Array}>}
 */
async function fetchGitHubReleases(repo) {
  const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/releases?per_page=5`;
  const headers = { Accept: 'application/vnd.github.v3+json' };

  // Use GitHub token if available
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const { body } = await fetchUrl(url, { headers });
    const items = parseGitHubReleases(body);
    return { label: repo.label, items };
  } catch (err) {
    return { label: repo.label, items: [], error: err.message };
  }
}

/**
 * Fetch trending AI repositories from GitHub
 * @param {number} daysBack - How many days to look back
 * @returns {Promise<{label: string, items: Array}>}
 */
async function fetchGitHubTrending(daysBack = 1) {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  const dateStr = date.toISOString().split('T')[0];

  const query = encodeURIComponent(`topic:ai OR topic:llm OR topic:machine-learning created:>${dateStr} stars:>10`);
  const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=10`;
  const headers = { Accept: 'application/vnd.github.v3+json' };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const { body } = await fetchUrl(url, { headers });
    const items = parseGitHubTrending(body);
    return { label: 'Trending AI Repos (Last 24h)', items };
  } catch (err) {
    return { label: 'Trending AI Repos', items: [], error: err.message };
  }
}

/**
 * Fetch all news from all sources
 * @param {object} options - Fetch options
 * @param {number} options.maxAgeDays - Only include items from last N days (default: 1)
 * @param {string[]} options.sources - Which sources to fetch (default: all)
 * @returns {Promise<object>} Categorized news items
 */
async function fetchAllNews(options = {}) {
  const { maxAgeDays = 1, sources = Object.keys(NEWS_SOURCES) } = options;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

  const results = {};
  const fetchPromises = [];

  for (const sourceKey of sources) {
    const source = NEWS_SOURCES[sourceKey];
    if (!source) continue;

    results[sourceKey] = {
      name: source.name,
      feeds: [],
      releases: [],
      trending: [],
    };

    // Fetch RSS feeds
    if (source.feeds) {
      for (const feed of source.feeds) {
        fetchPromises.push(
          fetchRssFeed(feed).then((result) => {
            results[sourceKey].feeds.push(result);
          })
        );
      }
    }

    // Fetch GitHub releases
    if (source.github) {
      for (const repo of source.github) {
        fetchPromises.push(
          fetchGitHubReleases(repo).then((result) => {
            results[sourceKey].releases.push(result);
          })
        );
      }
    }

    // Fetch trending repos
    if (source.trending) {
      fetchPromises.push(
        fetchGitHubTrending(maxAgeDays).then((result) => {
          results[sourceKey].trending.push(result);
        })
      );
    }
  }

  // Fetch all in parallel
  await Promise.allSettled(fetchPromises);

  // Filter by date
  for (const sourceKey of Object.keys(results)) {
    const source = results[sourceKey];

    for (const feedResult of source.feeds) {
      feedResult.items = filterByDate(feedResult.items, cutoffDate);
    }
    for (const releaseResult of source.releases) {
      releaseResult.items = filterByDate(releaseResult.items, cutoffDate);
    }
    // Trending items are already date-filtered by the API query
  }

  return results;
}

/**
 * Filter items by date, keeping only those after cutoffDate
 */
function filterByDate(items, cutoffDate) {
  return items.filter((item) => {
    if (!item.date) return true; // Keep items without dates
    try {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate;
    } catch {
      return true;
    }
  });
}

module.exports = {
  // Core HTTP
  fetchUrl,

  // Parsers
  parseRssFeed,
  parseGitHubReleases,
  parseGitHubTrending,
  stripHtml,
  extractTag,
  extractLink,
  filterByDate,

  // Source fetchers
  fetchRssFeed,
  fetchGitHubReleases,
  fetchGitHubTrending,
  fetchAllNews,

  // Source definitions (for customization)
  NEWS_SOURCES,
};
