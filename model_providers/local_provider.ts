'use strict';

class LocalProvider {
  constructor(options) {
    const normalizedOptions = options || {};
    this.baseUrl = normalizedOptions.baseUrl || process.env.LOCAL_MODEL_BASE_URL || 'http://127.0.0.1:11434';
    this.model = normalizedOptions.model || process.env.LOCAL_MODEL_NAME || 'llama3.2';
    this.kind = normalizedOptions.kind || process.env.LOCAL_MODEL_KIND || guessKind(this.baseUrl);
    this.timeoutMs = normalizeTimeoutMs(normalizedOptions.timeoutMs, 30000);
  }

  async complete(request) {
    if (this.kind === 'ollama') {
      return this.completeWithOllama(request);
    }

    return this.completeWithOpenAICompatibleApi(request);
  }

  async completeWithOllama(request) {
    const response = await fetchWithTimeout(`${this.baseUrl.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        prompt: buildPrompt(request),
        stream: false
      })
    }, this.timeoutMs, 'Local provider request');

    if (!response.ok) {
      throw new Error(await formatHttpError('Local provider request failed', response));
    }

    const payload = await parseJsonResponse('Local provider response', response);

    return {
      text: String(payload.response || '').trim(),
      model: payload.model || this.model,
      raw: payload
    };
  }

  async completeWithOpenAICompatibleApi(request) {
    const response = await fetchWithTimeout(buildOpenAICompatibleUrl(this.baseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: buildMessages(request),
        temperature: typeof request.temperature === 'number' ? request.temperature : undefined,
        stream: false
      })
    }, this.timeoutMs, 'Local provider request');

    if (!response.ok) {
      throw new Error(await formatHttpError('Local provider request failed', response));
    }

    const payload = await parseJsonResponse('Local provider response', response);

    return {
      text: extractChatCompletionText(payload),
      model: payload.model || this.model,
      raw: payload
    };
  }
}

async function fetchWithTimeout(url, options, timeoutMs, label) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } catch (err) {
    if (err && err.name === 'AbortError') {
      throw new Error(`${label} timed out after ${timeoutMs}ms.`);
    }

    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function formatHttpError(prefix, response) {
  const bodyText = await response.text().catch(() => '');
  const normalizedBody = String(bodyText || '').trim();
  return normalizedBody
    ? `${prefix} (${response.status}): ${normalizedBody}`
    : `${prefix} (${response.status})`;
}

async function parseJsonResponse(prefix, response) {
  const bodyText = await response.text().catch(() => '');
  const normalizedBody = String(bodyText || '').trim();

  if (!normalizedBody) {
    throw new Error(`${prefix} was empty.`);
  }

  try {
    return JSON.parse(normalizedBody);
  } catch (_err) {
    throw new Error(`${prefix} was not valid JSON.`);
  }
}

function buildPrompt(request) {
  return [
    request && request.instructions ? `SYSTEM:\n${request.instructions}\n` : '',
    request && request.prompt ? `USER:\n${request.prompt}` : ''
  ].filter(Boolean).join('\n');
}

function buildMessages(request) {
  const messages = [];
  if (request && request.instructions) {
    messages.push({
      role: 'system',
      content: String(request.instructions)
    });
  }

  messages.push({
    role: 'user',
    content: String((request && request.prompt) || '')
  });

  return messages;
}

function buildOpenAICompatibleUrl(baseUrl) {
  const normalizedBaseUrl = String(baseUrl || '').replace(/\/$/, '');
  return normalizedBaseUrl.endsWith('/v1')
    ? `${normalizedBaseUrl}/chat/completions`
    : `${normalizedBaseUrl}/v1/chat/completions`;
}

function extractChatCompletionText(payload) {
  const choices = Array.isArray(payload && payload.choices) ? payload.choices : [];
  const message = choices[0] && choices[0].message ? choices[0].message : {};
  const content = message.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (part && typeof part.text === 'string') {
          return part.text;
        }

        return '';
      })
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  return '';
}

function guessKind(baseUrl) {
  return String(baseUrl || '').includes('11434') ? 'ollama' : 'openai-compatible';
}

function normalizeTimeoutMs(value, fallback) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

module.exports = {
  LocalProvider
};
