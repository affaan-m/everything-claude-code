'use strict';

class LocalProvider {
  constructor(options) {
    const normalizedOptions = options || {};
    this.baseUrl = normalizedOptions.baseUrl || process.env.LOCAL_MODEL_BASE_URL || 'http://127.0.0.1:11434';
    this.model = normalizedOptions.model || process.env.LOCAL_MODEL_NAME || 'llama3.2';
    this.kind = normalizedOptions.kind || process.env.LOCAL_MODEL_KIND || guessKind(this.baseUrl);
  }

  async complete(request) {
    if (this.kind === 'ollama') {
      return this.completeWithOllama(request);
    }

    return this.completeWithOpenAICompatibleApi(request);
  }

  async completeWithOllama(request) {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        prompt: buildPrompt(request),
        stream: false
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(`Local provider request failed: ${JSON.stringify(payload)}`);
    }

    return {
      text: String(payload.response || '').trim(),
      model: payload.model || this.model,
      raw: payload
    };
  }

  async completeWithOpenAICompatibleApi(request) {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        instructions: request.instructions || undefined,
        input: request.prompt || '',
        temperature: typeof request.temperature === 'number' ? request.temperature : undefined,
        store: false,
        text: {
          format: {
            type: 'text'
          }
        }
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(`Local provider request failed: ${JSON.stringify(payload)}`);
    }

    const output = Array.isArray(payload.output) ? payload.output : [];
    const text = output
      .flatMap((item) => Array.isArray(item.content) ? item.content : [])
      .filter((content) => content && content.type === 'output_text')
      .map((content) => content.text)
      .join('\n')
      .trim();

    return {
      text,
      model: payload.model || this.model,
      raw: payload
    };
  }
}

function buildPrompt(request) {
  return [
    request && request.instructions ? `SYSTEM:\n${request.instructions}\n` : '',
    request && request.prompt ? `USER:\n${request.prompt}` : ''
  ].filter(Boolean).join('\n');
}

function guessKind(baseUrl) {
  return String(baseUrl || '').includes('11434') ? 'ollama' : 'openai-compatible';
}

module.exports = {
  LocalProvider
};
