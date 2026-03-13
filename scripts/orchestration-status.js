#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const { collectSessionSnapshot } = require('./lib/orchestration-session');

function usage() {
  console.log([
    'Usage:',
    '  node scripts/orchestration-status.js <session-name|plan.json> [--write <output.json>]',
    '',
    'Examples:',
    '  node scripts/orchestration-status.js workflow-visual-proof',
    '  node scripts/orchestration-status.js .claude/plan/workflow-visual-proof.json',
    '  node scripts/orchestration-status.js .claude/plan/workflow-visual-proof.json --write /tmp/snapshot.json'
  ].join('\n'));
}

function parseArgs(argv) {
  const args = argv.slice(2);
  let target = null;
  let writePath = null;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--write') {
      const candidate = args[index + 1];
      if (!candidate || candidate.startsWith('--')) {
        throw new Error('--write requires an output path');
      }
      writePath = candidate;
      index += 1;
      continue;
    }

    if (arg.startsWith('--')) {
      throw new Error(`Unknown flag: ${arg}`);
    }

    if (target) {
      throw new Error('Expected a single session name or plan path');
    }

    target = arg;
  }

  return { target, writePath };
}

function main() {
  const { target, writePath } = parseArgs(process.argv);

  if (!target) {
    usage();
    process.exit(1);
  }

  const snapshot = collectSessionSnapshot(target, process.cwd());
  const json = JSON.stringify(snapshot, null, 2);

  if (writePath) {
    const absoluteWritePath = path.resolve(writePath);
    fs.mkdirSync(path.dirname(absoluteWritePath), { recursive: true });
    fs.writeFileSync(absoluteWritePath, json + '\n', 'utf8');
  }

  console.log(json);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`[orchestration-status] ${error.message}`);
    process.exit(1);
  }
}

module.exports = { main, parseArgs };
