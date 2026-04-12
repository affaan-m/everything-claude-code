#!/usr/bin/env node
'use strict';

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
  try {
    const input = JSON.parse(raw);
    const cmd = String(input.tool_input?.command || '');
    if (/(npm run build|pnpm build|yarn build)/.test(cmd)) {
      console.error('[Hook] Build completed - async analysis running in background');
    }
  } catch {
    // ignore parse errors and pass through
  }

  process.stdout.write(raw);
});
