'use strict';

const { spawn } = require('child_process');

class ClaudeProvider {
  constructor(options) {
    const normalizedOptions = options || {};
    this.binary = normalizedOptions.binary || process.env.CLAUDE_BINARY || 'claude';
    this.model = normalizedOptions.model || 'sonnet';
    this.timeoutMs = normalizeTimeoutMs(normalizedOptions.timeoutMs, 300000);
  }

  async complete(request) {
    const prompt = buildPrompt(request);
    const args = [];

    if (this.model) {
      args.push('--model', this.model);
    }

    args.push('-p', prompt);

    const result = await runClaudeCommand(this.binary, args, this.timeoutMs);

    if (result.error) {
      throw new Error(`Claude provider failed: ${result.error}`);
    }

    if (result.exitCode !== 0) {
      throw new Error(`Claude provider exited with code ${result.exitCode}: ${(result.stderr || '').trim()}`);
    }

    return {
      text: String(result.stdout || '').trim(),
      model: this.model,
      raw: result.stdout
    };
  }
}

async function runClaudeCommand(binary, args, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(binary, args, {
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    let settled = false;
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });
    child.on('error', (error) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 1,
        error: error.message
      });
    });
    child.on('close', (code, signal) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      if (timedOut) {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: 124,
          error: `Command timed out after ${timeoutMs}ms.`
        });
        return;
      }

      if (signal) {
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: 1,
          error: `Process exited due to signal ${signal}.`
        });
        return;
      }

      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: typeof code === 'number' ? code : 1,
        error: ''
      });
    });
  });
}

function buildPrompt(request) {
  return [
    request && request.instructions ? `SYSTEM:\n${request.instructions}\n` : '',
    request && request.prompt ? `USER:\n${request.prompt}` : ''
  ].filter(Boolean).join('\n');
}

function normalizeTimeoutMs(value, fallback) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

module.exports = {
  ClaudeProvider
};
