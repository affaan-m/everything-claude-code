#!/usr/bin/env node
'use strict';

/**
 * Session end marker hook - outputs stdin to stdout unchanged.
 * Exports run() for in-process execution (avoids spawnSync issues on Windows).
 */

function run(rawInput) {
  return rawInput || '';
}

// Legacy CLI execution (when run directly)
if (require.main === module) {
  const MAX_STDIN = 1024 * 1024;
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    if (raw.length < MAX_STDIN) {
      const remaining = MAX_STDIN - raw.length;
      raw += chunk.substring(0, remaining);
    }
  });
  process.stdin.on('end', () => {
    process.stdout.write(raw);
  });
}

module.exports = { run };
