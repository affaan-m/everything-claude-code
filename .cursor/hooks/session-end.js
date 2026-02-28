#!/usr/bin/env node
const { readStdin, runExistingHook, transformToClaude } = require('./adapter');
readStdin().then(raw => {
  const input = JSON.parse(raw);
  const claudeInput = transformToClaude(input);
  runExistingHook('session-end.js', claudeInput);
  runExistingHook('evaluate-session.js', claudeInput);
  process.stdout.write(raw);
}).catch(() => process.exit(0));
