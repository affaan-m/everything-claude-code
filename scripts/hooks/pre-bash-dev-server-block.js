#!/usr/bin/env node
'use strict';

const MAX_STDIN = 1024 * 1024;
const { splitShellSegments } = require('../lib/shell-split');

const DEV_COMMAND_WORDS = new Set([
  'npm',
  'pnpm',
  'yarn',
  'bun',
  'npx',
  'bash',
  'sh',
  'zsh',
  'fish',
  'tmux'
]);
const SKIPPABLE_PREFIX_WORDS = new Set(['env', 'command', 'builtin', 'exec', 'noglob', 'sudo']);
const PREFIX_OPTION_VALUE_WORDS = {
  env: new Set(['-u', '-C', '-S', '--unset', '--chdir', '--split-string']),
  sudo: new Set([
    '-u',
    '-g',
    '-h',
    '-p',
    '-r',
    '-t',
    '-C',
    '--user',
    '--group',
    '--host',
    '--prompt',
    '--role',
    '--type',
    '--close-from'
  ])
};

function readToken(input, startIndex) {
  let index = startIndex;
  while (index < input.length && /\s/.test(input[index])) index += 1;
  if (index >= input.length) return null;

  let token = '';
  let quote = null;

  while (index < input.length) {
    const ch = input[index];

    if (quote) {
      if (ch === quote) {
        quote = null;
        index += 1;
        continue;
      }

      if (ch === '\\' && quote === '"' && index + 1 < input.length) {
        token += input[index + 1];
        index += 2;
        continue;
      }

      token += ch;
      index += 1;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      index += 1;
      continue;
    }

    if (/\s/.test(ch)) break;

    if (ch === '\\' && index + 1 < input.length) {
      token += input[index + 1];
      index += 2;
      continue;
    }

    token += ch;
    index += 1;
  }

  return { token, end: index };
}

function shouldSkipOptionValue(wrapper, optionToken) {
  if (!wrapper || !optionToken || optionToken.includes('=')) return false;
  const optionSet = PREFIX_OPTION_VALUE_WORDS[wrapper];
  return Boolean(optionSet && optionSet.has(optionToken));
}

function isOptionToken(token) {
  return token.startsWith('-') && token.length > 1;
}

function getLeadingCommandWord(segment) {
  let index = 0;
  let activeWrapper = null;
  let skipNextValue = false;

  while (index < segment.length) {
    const parsed = readToken(segment, index);
    if (!parsed) return null;
    index = parsed.end;

    const token = parsed.token;
    if (!token) continue;

    if (skipNextValue) {
      skipNextValue = false;
      continue;
    }

    if (token === '--') {
      activeWrapper = null;
      continue;
    }

    if (/^[A-Za-z_][A-Za-z0-9_]*=.*/.test(token)) continue;

    if (SKIPPABLE_PREFIX_WORDS.has(token)) {
      activeWrapper = token;
      continue;
    }

    if (activeWrapper && isOptionToken(token)) {
      if (shouldSkipOptionValue(activeWrapper, token)) {
        skipNextValue = true;
      }
      continue;
    }

    return token;
  }

  return null;
}

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

    if (process.platform !== 'win32') {
      const segments = splitShellSegments(cmd);
      const tmuxLauncher = /^\s*tmux\s+(new|new-session|new-window|split-window)\b/;
      const devPattern = /\b(npm\s+run\s+dev|pnpm(?:\s+run)?\s+dev|yarn\s+dev|bun\s+run\s+dev)\b/;

      const hasBlockedDev = segments.some(segment => {
        const commandWord = getLeadingCommandWord(segment);
        if (!commandWord || !DEV_COMMAND_WORDS.has(commandWord)) {
          return false;
        }
        return devPattern.test(segment) && !tmuxLauncher.test(segment);
      });

      if (hasBlockedDev) {
        console.error('[Hook] BLOCKED: Dev server must run in tmux for log access');
        console.error('[Hook] Use: tmux new-session -d -s dev "npm run dev"');
        console.error('[Hook] Then: tmux attach -t dev');
        process.exit(2);
      }
    }
  } catch {
    // ignore parse errors and pass through
  }

  process.stdout.write(raw);
});
