'use strict';

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata',
  '169.254.169.254',
  '100.100.100.200'
]);

class ApiTools {
  constructor(options) {
    const normalizedOptions = options || {};
    this.config = normalizedOptions.config || {};
  }

  async request(options) {
    if (!isApiAllowed(this.config)) {
      return {
        ok: false,
        type: 'http_request',
        error: 'API tools are disabled by tool permissions.'
      };
    }

    if (isDryRun(this.config)) {
      return {
        ok: true,
        type: 'http_request',
        dryRun: true,
        request: options || {}
      };
    }

    const validationError = validateRequestUrl(options && options.url);
    if (validationError) {
      return {
        ok: false,
        type: 'http_request',
        error: validationError
      };
    }

    try {
      const response = await fetch(String(options.url || ''), {
        method: options.method || 'GET',
        headers: options.headers || {},
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      const text = await response.text();
      return {
        ok: response.ok,
        type: 'http_request',
        status: response.status,
        body: text
      };
    } catch (err) {
      return {
        ok: false,
        type: 'http_request',
        error: err.message
      };
    }
  }

  async webSearch(query) {
    if (!isApiAllowed(this.config)) {
      return {
        ok: false,
        type: 'web_search',
        error: 'API tools are disabled by tool permissions.'
      };
    }

    if (isDryRun(this.config)) {
      return {
        ok: true,
        type: 'web_search',
        dryRun: true,
        query
      };
    }

    const serperKey = process.env.SERPER_API_KEY || '';
    if (!serperKey) {
      return {
        ok: false,
        type: 'web_search',
        error: 'No web search provider configured. Set SERPER_API_KEY to enable live web search.'
      };
    }

    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: String(query || '')
        })
      });

      const payload = await response.json();
      return {
        ok: response.ok,
        type: 'web_search',
        query,
        payload
      };
    } catch (err) {
      return {
        ok: false,
        type: 'web_search',
        error: err.message
      };
    }
  }
}

function isApiAllowed(config) {
  return Boolean(config.tool_permissions && config.tool_permissions.allow_api);
}

function isDryRun(config) {
  return Boolean(config.execution_sandbox && config.execution_sandbox.dry_run);
}

function validateRequestUrl(url) {
  let parsedUrl = null;
  try {
    parsedUrl = new URL(String(url || ''));
  } catch (_err) {
    return 'A valid http_request URL is required.';
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return 'Only http and https URLs are allowed for http_request.';
  }

  const hostname = parsedUrl.hostname.trim().toLowerCase();
  if (!hostname) {
    return 'A valid http_request URL is required.';
  }

  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local')) {
    return 'URL was blocked by the API request policy.';
  }

  if (isPrivateIpv4(hostname) || isBlockedIpv6(hostname)) {
    return 'URL was blocked by the API request policy.';
  }

  return '';
}

function isPrivateIpv4(hostname) {
  const parts = hostname.split('.');
  if (parts.length !== 4 || parts.some((part) => !/^\d+$/.test(part))) {
    return false;
  }

  const octets = parts.map((part) => Number(part));
  if (octets.some((value) => value < 0 || value > 255)) {
    return false;
  }

  if (octets[0] === 10 || octets[0] === 127) {
    return true;
  }

  if (octets[0] === 169 && octets[1] === 254) {
    return true;
  }

  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) {
    return true;
  }

  if (octets[0] === 192 && octets[1] === 168) {
    return true;
  }

  return false;
}

function isBlockedIpv6(hostname) {
  const normalized = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  return normalized === '::1'
    || normalized.startsWith('fe80:')
    || normalized.startsWith('fc')
    || normalized.startsWith('fd');
}

module.exports = {
  ApiTools
};
