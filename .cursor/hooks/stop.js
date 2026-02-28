#!/usr/bin/env node
const { readStdin, runExistingHook, transformToClaude } = require('./adapter');
readStdin().then(raw => {
  const claudeInput = JSON.parse(raw || '{}');
  runExistingHook('check-console-log.js', transformToClaude(claudeInput));
  process.stdout.write(raw);
}).catch(() => process.exit(0));
