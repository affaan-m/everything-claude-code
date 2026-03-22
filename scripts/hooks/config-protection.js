#!/usr/bin/env node
/**
 * Config Protection Hook
 *
 * Blocks modifications to linter/formatter config files.
 * Agents frequently modify these to make checks pass instead of fixing
 * the actual code. This hook steers the agent back to fixing the source.
 *
 * Exit codes:
 *   0 = allow (not a config file)
 *   2 = block (config file modification attempted)
 */

'use strict';

const path = require('path');

const MAX_STDIN = 1024 * 1024;
let raw = '';

const PROTECTED_FILES = new Set([
  // ESLint (legacy + v9 flat config, JS/TS/MJS/CJS)
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.json',
  '.eslintrc.yml',
  '.eslintrc.yaml',
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  'eslint.config.ts',
  'eslint.config.mts',
  'eslint.config.cts',
  // Prettier (all config variants including ESM)
  '.prettierrc',
  '.prettierrc.js',
  '.prettierrc.cjs',
  '.prettierrc.json',
  '.prettierrc.yml',
  '.prettierrc.yaml',
  'prettier.config.js',
  'prettier.config.cjs',
  'prettier.config.mjs',
  // Biome
  'biome.json',
  'biome.jsonc',
  // Ruff (Python)
  '.ruff.toml',
  'ruff.toml',
  // Note: pyproject.toml is intentionally NOT included here because it
  // contains project metadata alongside linter config. Blocking all edits
  // to pyproject.toml would prevent legitimate dependency changes.
  // Shell / Style / Markdown
  '.shellcheckrc',
  '.stylelintrc',
  '.stylelintrc.json',
  '.stylelintrc.yml',
  '.markdownlint.json',
  '.markdownlint.yaml',
  '.markdownlintrc',
]);

/**
 * Exportable run() for in-process execution via run-with-flags.js.
 * Avoids the ~50-100ms spawnSync overhead when available.
 */
function run(input) {
  const filePath = input?.tool_input?.file_path || input?.tool_input?.file || '';
  if (!filePath) return { exitCode: 0 };

  const basename = path.basename(filePath);
  if (PROTECTED_FILES.has(basename)) {
    return {
      exitCode: 2,
      stderr:
        `BLOCKED: Modifying ${basename} is not allowed. ` +
        `Fix the source code to satisfy linter/formatter rules instead of ` +
        `weakening the config. If this is a legitimate config change, ` +
        `disable the config-protection hook temporarily.`,
    };
  }

  return { exitCode: 0 };
}

module.exports = { run };

// Stdin fallback for spawnSync execution
let truncated = false;
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  if (raw.length < MAX_STDIN) {
    const remaining = MAX_STDIN - raw.length;
    raw += chunk.substring(0, remaining);
    if (chunk.length > remaining) truncated = true;
  } else {
    truncated = true;
  }
});

process.stdin.on('end', () => {
  // If stdin was truncated, the JSON is likely malformed. Fail open but
  // log a warning so the issue is visible. The run() path (used by
  // run-with-flags.js in-process) is not affected by this.
  if (truncated) {
    process.stderr.write('[config-protection] Warning: stdin exceeded 1MB, skipping check\n');
    process.stdout.write(raw);
    return;
  }

  try {
    const input = raw.trim() ? JSON.parse(raw) : {};
    const result = run(input);

    if (result.exitCode === 2) {
      process.stderr.write(result.stderr + '\n');
      process.exit(2);
    }
  } catch {
    // Keep hook non-blocking on parse errors.
  }

  process.stdout.write(raw);
});
