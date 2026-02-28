#!/usr/bin/env node
const { readStdin } = require('./adapter');
readStdin().then(raw => {
  try {
    const input = JSON.parse(raw);
    const cmd = input.command || '';

    // 1. Block dev server outside tmux
    if (process.platform !== 'win32' && /(npm run dev\b|pnpm( run)? dev\b|yarn dev\b|bun run dev\b)/.test(cmd)) {
      console.error('[ECC] BLOCKED: Dev server must run in tmux for log access');
      console.error('[ECC] Use: tmux new-session -d -s dev "npm run dev"');
      process.exit(2);
    }

    // 2. Tmux reminder for long-running commands
    if (process.platform !== 'win32' && !process.env.TMUX &&
        /(npm (install|test)|pnpm (install|test)|yarn (install|test)?|bun (install|test)|cargo build|make\b|docker\b|pytest|vitest|playwright)/.test(cmd)) {
      console.error('[ECC] Consider running in tmux for session persistence');
    }

    // 3. Git push review reminder
    if (/git push/.test(cmd)) {
      console.error('[ECC] Review changes before push: git diff origin/main...HEAD');
    }
  } catch {}
  process.stdout.write(raw);
}).catch(() => process.exit(0));
