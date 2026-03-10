'use strict';

const { spawnSync } = require('child_process');

class ClaudeProvider {
  constructor(options) {
    const normalizedOptions = options || {};
    this.binary = normalizedOptions.binary || process.env.CLAUDE_BINARY || 'claude';
    this.model = normalizedOptions.model || 'sonnet';
  }

  async complete(request) {
    const prompt = buildPrompt(request);
    const args = [];

    if (this.model) {
      args.push('--model', this.model);
    }

    args.push('-p', prompt);

    const result = spawnSync(this.binary, args, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 300000
    });

    if (result.error) {
      throw new Error(`Claude provider failed: ${result.error.message}`);
    }

    if (result.status !== 0) {
      throw new Error(`Claude provider exited with code ${result.status}: ${(result.stderr || '').trim()}`);
    }

    return {
      text: String(result.stdout || '').trim(),
      model: this.model,
      raw: result.stdout
    };
  }
}

function buildPrompt(request) {
  return [
    request && request.instructions ? `SYSTEM:\n${request.instructions}\n` : '',
    request && request.prompt ? `USER:\n${request.prompt}` : ''
  ].filter(Boolean).join('\n');
}

module.exports = {
  ClaudeProvider
};
