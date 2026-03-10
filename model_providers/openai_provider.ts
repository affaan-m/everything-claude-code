'use strict';

class OpenAIProvider {
  constructor(options) {
    const normalizedOptions = options || {};
    this.baseUrl = normalizedOptions.baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    this.apiKey = normalizedOptions.apiKey || process.env.OPENAI_API_KEY || '';
    this.model = normalizedOptions.model || 'gpt-5.4';
  }

  async complete(request) {
    if (!this.apiKey) {
      throw new Error('OpenAI provider requires OPENAI_API_KEY.');
    }

    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/responses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
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
      throw new Error(`OpenAI provider request failed: ${JSON.stringify(payload)}`);
    }

    return {
      text: extractResponseText(payload),
      model: payload.model || this.model,
      raw: payload
    };
  }
}

function extractResponseText(payload) {
  const outputItems = Array.isArray(payload && payload.output) ? payload.output : [];
  const textChunks = [];

  for (const item of outputItems) {
    const contentItems = Array.isArray(item && item.content) ? item.content : [];
    for (const content of contentItems) {
      if (content && content.type === 'output_text' && typeof content.text === 'string') {
        textChunks.push(content.text);
      }
    }
  }

  if (textChunks.length > 0) {
    return textChunks.join('\n').trim();
  }

  return '';
}

module.exports = {
  OpenAIProvider
};
