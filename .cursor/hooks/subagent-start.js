#!/usr/bin/env node
const { readStdin } = require('./adapter');
readStdin().then(raw => {
  try {
    const input = JSON.parse(raw);
    const agent = input.agent_name || input.agent || 'unknown';
    console.error(`[ECC] Agent spawned: ${agent}`);
  } catch {}
  process.stdout.write(raw);
}).catch(() => process.exit(0));
