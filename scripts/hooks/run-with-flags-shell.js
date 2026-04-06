#!/usr/bin/env node
/**
 * Cross-platform equivalent of run-with-flags-shell.sh.
 * Runs bash-based hook scripts via "bash" when available (Unix/macOS/WSL),
 * and silently passes through on native Windows where bash is unavailable.
 *
 * Usage:
 *   node run-with-flags-shell.js <hookId> <scriptRelativePath> [profilesCsv]
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');
const { isHookEnabled } = require('../lib/hook-flags');

const MAX_STDIN = 1024 * 1024;

function readStdin() {
  return new Promise(resolve => {
    let raw = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      if (raw.length < MAX_STDIN) {
        raw += chunk.substring(0, MAX_STDIN - raw.length);
      }
    });
    process.stdin.on('end', () => resolve(raw));
    process.stdin.on('error', () => resolve(raw));
  });
}

function getPluginRoot() {
  if (process.env.CLAUDE_PLUGIN_ROOT && process.env.CLAUDE_PLUGIN_ROOT.trim()) {
    return process.env.CLAUDE_PLUGIN_ROOT;
  }
  return path.resolve(__dirname, '..', '..');
}

function hasBash() {
  if (process.platform === 'win32') {
    // Check for bash via WSL or Git Bash
    try {
      execSync('bash --version', { stdio: 'pipe', timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

async function main() {
  const [, , hookId, relScriptPath, profilesCsv] = process.argv;
  const raw = await readStdin();

  if (!hookId || !relScriptPath) {
    process.stdout.write(raw);
    process.exit(0);
  }

  if (!isHookEnabled(hookId, { profiles: profilesCsv })) {
    process.stdout.write(raw);
    process.exit(0);
  }

  const pluginRoot = getPluginRoot();
  const scriptPath = path.resolve(pluginRoot, relScriptPath);

  if (!fs.existsSync(scriptPath)) {
    process.stderr.write(`[Hook] Script not found for ${hookId}: ${scriptPath}\n`);
    process.stdout.write(raw);
    process.exit(0);
  }

  if (!hasBash()) {
    // Silently skip on Windows without bash
    process.stdout.write(raw);
    process.exit(0);
  }

  // Extract phase prefix (e.g., "pre:observe" -> "pre")
  const hookPhase = hookId.split(':')[0] || '';

  const result = spawnSync('bash', [scriptPath, hookPhase], {
    input: raw,
    encoding: 'utf8',
    env: process.env,
    cwd: process.cwd(),
    timeout: 10000
  });

  const stdout = typeof result.stdout === 'string' ? result.stdout : '';
  if (stdout) {
    process.stdout.write(stdout);
  } else {
    process.stdout.write(raw);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.error || result.status === null || result.signal) {
    const reason = result.error
      ? result.error.message
      : result.signal
        ? `signal ${result.signal}`
        : 'missing exit status';
    process.stderr.write(`[Hook] shell hook failed for ${hookId}: ${reason}\n`);
    process.exit(1);
  }

  process.exit(Number.isInteger(result.status) ? result.status : 0);
}

main().catch(err => {
  process.stderr.write(`[Hook] run-with-flags-shell error: ${err.message}\n`);
  process.exit(0);
});
