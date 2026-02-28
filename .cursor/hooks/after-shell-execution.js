#!/usr/bin/env node
const { readStdin } = require('./adapter');
readStdin().then(raw => {
  try {
    const input = JSON.parse(raw);
    const cmd = input.command || '';
    const output = input.output || input.result || '';

    // PR creation logging
    if (/gh pr create/.test(cmd)) {
      const m = output.match(/https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/);
      if (m) {
        console.error('[ECC] PR created: ' + m[0]);
        const repo = m[0].replace(/https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/\d+/, '$1');
        const pr = m[0].replace(/.+\/pull\/(\d+)/, '$1');
        console.error('[ECC] To review: gh pr review ' + pr + ' --repo ' + repo);
      }
    }

    // Build completion notice
    if (/(npm run build|pnpm build|yarn build)/.test(cmd)) {
      console.error('[ECC] Build completed');
    }
  } catch {}
  process.stdout.write(raw);
}).catch(() => process.exit(0));
