'use strict';

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

module.exports = {
  ApiTools
};
