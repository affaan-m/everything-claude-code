#!/usr/bin/env node
/**
 * PreToolUse Hook: GateGuard Fact-Forcing Gate
 *
 * Forces Claude to investigate before editing files or running commands.
 * Instead of asking "are you sure?" (which LLMs always answer "yes"),
 * this hook demands concrete facts: importers, public API, data schemas.
 *
 * The act of investigation creates awareness that self-evaluation never did.
 *
 * Gates:
 *   - Edit/Write: list importers, affected API, verify data schemas, quote instruction
 *   - Bash (destructive): list targets, rollback plan, quote instruction
 *   - Bash (routine): quote current instruction (once per session)
 *
 * Exit codes:
 *   0 - Allow (gate already passed for this target)
 *   2 - Block (force investigation first)
 *
 * Cross-platform (Windows, macOS, Linux).
 *
 * Full package with config support: pip install gateguard-ai
 * Repo: https://github.com/zunoworks/gateguard
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MAX_STDIN = 1024 * 1024;

// Session state file for tracking which files have been gated
const STATE_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '/tmp', '.gateguard');
const STATE_FILE = path.join(STATE_DIR, '.session_state.json');

const DESTRUCTIVE_BASH = /\b(rm\s+-rf|git\s+reset\s+--hard|git\s+checkout\s+--|git\s+clean\s+-f|drop\s+table|delete\s+from|truncate|git\s+push\s+--force|dd\s+if=)\b/i;

// --- State management ---

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (_) { /* ignore */ }
  return { checked: [], read_files: [] };
}

function saveState(state) {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (_) { /* ignore */ }
}

function markChecked(key) {
  const state = loadState();
  if (!state.checked.includes(key)) {
    state.checked.push(key);
    saveState(state);
  }
}

function isChecked(key) {
  const state = loadState();
  return state.checked.includes(key);
}

// --- Sanitize file path against injection ---

function sanitizePath(filePath) {
  return filePath.replace(/[\n\r]/g, ' ').trim().slice(0, 500);
}

// --- Gate messages ---

function editGateMsg(filePath) {
  const safe = sanitizePath(filePath);
  return [
    '[Fact-Forcing Gate]',
    '',
    `Before editing ${safe}, present these facts:`,
    '',
    '1. List ALL files that import/require this file (use Grep)',
    '2. List the public functions/classes affected by this change',
    '3. If this file reads/writes data files, cat one real record and show actual field names, structure, and date format',
    '4. Quote the user\'s current instruction verbatim',
    '',
    'Present the facts, then retry the same operation.'
  ].join('\n');
}

function writeGateMsg(filePath) {
  const safe = sanitizePath(filePath);
  return [
    '[Fact-Forcing Gate]',
    '',
    `Before creating ${safe}, present these facts:`,
    '',
    '1. Name the file(s) and line(s) that will call this new file',
    '2. Confirm no existing file serves the same purpose (use Glob)',
    '3. If this file reads/writes data files, cat one real record and show actual field names, structure, and date format',
    '4. Quote the user\'s current instruction verbatim',
    '',
    'Present the facts, then retry the same operation.'
  ].join('\n');
}

function destructiveBashMsg() {
  return [
    '[Fact-Forcing Gate]',
    '',
    'Destructive command detected. Before running, present:',
    '',
    '1. List all files/data this command will modify or delete',
    '2. Write a one-line rollback procedure',
    '3. Quote the user\'s current instruction verbatim',
    '',
    'Present the facts, then retry the same operation.'
  ].join('\n');
}

function routineBashMsg() {
  return [
    '[Fact-Forcing Gate]',
    '',
    'Quote the user\'s current instruction verbatim.',
    'Then retry the same operation.'
  ].join('\n');
}

// --- Output helpers ---

function deny(reason) {
  const output = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason
    }
  };
  process.stdout.write(JSON.stringify(output));
  process.exit(0);
}

function allow() {
  // Output nothing = allow
  process.exit(0);
}

// --- Main ---

function main() {
  let raw = '';
  try {
    raw = fs.readFileSync(0, 'utf8').slice(0, MAX_STDIN);
  } catch (_) {
    allow();
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (_) {
    allow();
    return;
  }

  const toolName = data.tool_name || '';
  const toolInput = data.tool_input || {};

  if (toolName === 'Edit' || toolName === 'Write') {
    const filePath = toolInput.file_path || '';
    if (!filePath) {
      allow();
      return;
    }

    // Gate: first action per file
    if (!isChecked(filePath)) {
      markChecked(filePath);
      const msg = toolName === 'Edit' ? editGateMsg(filePath) : writeGateMsg(filePath);
      deny(msg);
      return;
    }

    allow();
    return;
  }

  if (toolName === 'Bash') {
    const command = toolInput.command || '';

    // Destructive commands: always gate
    if (DESTRUCTIVE_BASH.test(command)) {
      deny(destructiveBashMsg());
      return;
    }

    // Routine bash: once per session
    if (!isChecked('__bash_session__')) {
      markChecked('__bash_session__');
      deny(routineBashMsg());
      return;
    }

    allow();
    return;
  }

  allow();
}

main();
