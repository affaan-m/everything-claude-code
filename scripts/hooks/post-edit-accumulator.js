#!/usr/bin/env node
/**
 * PostToolUse Hook: Accumulate edited JS/TS file paths for batch processing
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Replaces the per-edit format and typecheck hooks. Records each edited
 * JS/TS file path to a session-scoped temp file. The stop-format-typecheck
 * hook reads this list at the end of the response and runs format +
 * typecheck once across all edited files — eliminating per-edit latency.
 *
 * This hook is intentionally cheap: it only appends a path to a JSON file
 * and exits immediately (no formatters, no tsc invocations).
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const MAX_STDIN = 1024 * 1024;

function getAccumFile() {
  const sessionId = process.env.CLAUDE_SESSION_ID || 'default';
  return path.join(os.tmpdir(), `ecc-edited-${sessionId}.json`);
}

/**
 * Append file_path to the session accumulator (deduped).
 * Exported so run-with-flags.js can call directly without spawning a child.
 *
 * @param {string} rawInput - Raw JSON string from stdin
 * @returns {string} The original input (pass-through)
 */
function run(rawInput) {
  try {
    const input = JSON.parse(rawInput);
    const filePath = input.tool_input?.file_path;

    if (filePath && /\.(ts|tsx|js|jsx)$/.test(filePath)) {
      const accumFile = getAccumFile();
      let files = [];
      try {
        files = JSON.parse(fs.readFileSync(accumFile, 'utf8'));
      } catch {
        // First edit of this response — start fresh
      }
      if (!files.includes(filePath)) {
        files.push(filePath);
        fs.writeFileSync(accumFile, JSON.stringify(files), 'utf8');
      }
    }
  } catch {
    // Invalid input — pass through
  }

  return rawInput;
}

// ── stdin entry point ────────────────────────────────────────────
if (require.main === module) {
  let data = '';
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', chunk => {
    if (data.length < MAX_STDIN) {
      const remaining = MAX_STDIN - data.length;
      data += chunk.substring(0, remaining);
    }
  });

  process.stdin.on('end', () => {
    data = run(data);
    process.stdout.write(data);
    process.exit(0);
  });
}

module.exports = { run };
