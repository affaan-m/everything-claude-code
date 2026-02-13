#!/usr/bin/env node
/**
 * PostToolUse Hook: Auto-format JS/TS files with Prettier after edits
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs after Edit tool use. If the edited file is a JS/TS file,
 * formats it with Prettier. Fails silently if Prettier isn't installed.
 */

const { execFileSync } = require('child_process');

const MAX_STDIN = 1024 * 1024; // 1MB limit
let data = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (data.length < MAX_STDIN) {
    data += chunk;
  }
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path;

    if (filePath && /\.(ts|tsx|js|jsx)$/.test(filePath)) {
      try {
        execFileSync('npx', ['prettier', '--write', filePath], {
          stdio: ['pipe', 'pipe', 'pipe'],
          timeout: 15000,
          shell: process.platform === 'win32'
        });
      } catch {
        // Prettier not installed, file missing, or failed — non-blocking
      }
    }
  } catch {
    // Invalid input — pass through
  }

  console.log(data);
});
