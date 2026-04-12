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

    if (
      process.platform !== 'win32' &&
      !process.env.TMUX &&
      /(npm (install|test)|pnpm (install|test)|yarn (install|test)?|bun (install|test)|cargo build|make\b|docker\b|pytest|vitest|playwright)/.test(cmd)
    ) {
      console.error('[Hook] Consider running in tmux for session persistence');
      console.error('[Hook] tmux new -s dev  |  tmux attach -t dev');
    }
  } catch {
    // ignore parse errors and pass through
  }

  process.stdout.write(raw);
});
