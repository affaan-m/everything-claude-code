#!/usr/bin/env node
/**
 * PostToolUse Hook: Auto-format JS/TS files after edits
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs after Edit tool use. If the edited file is a JS/TS file,
 * detects Biome or Prettier and formats accordingly.
 * Fails silently if no formatter is installed.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MAX_STDIN = 1024 * 1024; // 1MB limit
const JS_TS_EXT = /\.(ts|tsx|js|jsx)$/;
const BIOME_CONFIGS = ['biome.json', 'biome.jsonc'];

const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';

let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  if (data.length < MAX_STDIN) {
    const remaining = MAX_STDIN - data.length;
    data += chunk.substring(0, remaining);
  }
});

process.stdin.on('end', () => {
  try {
    const { tool_input } = JSON.parse(data);
    const filePath = tool_input?.file_path;

    if (filePath && JS_TS_EXT.test(filePath)) {
      const cwd = process.cwd();
      const hasBiome = BIOME_CONFIGS.some((f) =>
        fs.existsSync(path.join(cwd, f)),
      );

      try {
        const args = hasBiome
          ? ['@biomejs/biome', 'check', '--write', filePath]
          : ['prettier', '--write', filePath];

        execFileSync(npxBin, args, {
          cwd,
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 15000,
        });
      } catch {
        // Formatter not installed, file missing, or failed — non-blocking
      }
    }
  } catch {
    // Invalid input — pass through
  }

  process.stdout.write(data);
  process.exit(0);
});
