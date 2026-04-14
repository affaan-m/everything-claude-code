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
 * Compatible with run-with-flags.js via module.exports.run().
 * Cross-platform (Windows, macOS, Linux).
 *
 * Full package with config support: pip install gateguard-ai
 * Repo: https://github.com/zunoworks/gateguard
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { sanitizeSessionId } = require('../lib/utils');

// Session state — scoped per session to avoid cross-session races.
// Prefer Claude-provided session IDs. When they are unavailable (for example in
// API/proxy setups), derive a stable fallback from the transcript path or from
// the project scope plus a parent-process fingerprint. This avoids both
// per-invocation PID churn and cross-CLI state leakage in the same project.
const STATE_DIR = process.env.GATEGUARD_STATE_DIR || path.join(process.env.HOME || process.env.USERPROFILE || '/tmp', '.gateguard');

function hashSessionKey(prefix, value) {
  return prefix + crypto.createHash('sha1').update(value).digest('hex').slice(0, 16);
}

function sessionIdForStateFile(sessionId) {
  const raw = String(sessionId || '');
  const sanitized = sanitizeSessionId(raw) || '';
  if (sanitized.length > 0 && sanitized.length <= 64) {
    return sanitized;
  }
  return hashSessionKey('sid-', raw || 'empty-session');
}

function firstMeaningfulSessionId(...candidates) {
  for (const candidate of candidates) {
    if (sanitizeSessionId(candidate)) return candidate;
  }
  return null;
}

function resolveSessionId(data = {}) {
  const explicitSessionId = firstMeaningfulSessionId(
    data.session_id,
    data.sessionId,
    process.env.CLAUDE_SESSION_ID,
    process.env.ECC_SESSION_ID
  );
  if (explicitSessionId) return explicitSessionId;

  const transcriptPath = data.transcript_path || data.transcriptPath || process.env.CLAUDE_TRANSCRIPT_PATH;
  if (transcriptPath) {
    return hashSessionKey('transcript-', transcriptPath);
  }

  // this may not happen in real usage. If it does, we at least get a stable fallback per project directory fingerprint, instead of per-invocation random IDs.
  const scope = data.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();
  return hashSessionKey('fallback-', scope);
}

function resolveStateFile(data = {}) {
  const sessionId = resolveSessionId(data);
  return path.join(STATE_DIR, `state-${sessionIdForStateFile(sessionId)}.json`);
}

// State expires after 30 minutes of inactivity
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Maximum checked entries to prevent unbounded growth
const MAX_CHECKED_ENTRIES = 500;
const MAX_SESSION_KEYS = 50;
const ROUTINE_BASH_SESSION_KEY = '__bash_session__';

const DESTRUCTIVE_BASH = /\b(rm\s+-rf|git\s+reset\s+--hard|git\s+checkout\s+--|git\s+clean\s+-f|drop\s+table|delete\s+from|truncate|git\s+push\s+--force|dd\s+if=)\b/i;

// --- State management (per-session, atomic writes, bounded) ---

function loadState(stateFile) {
  try {
    if (fs.existsSync(stateFile)) {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      const lastActive = state.last_active || 0;
      if (Date.now() - lastActive > SESSION_TIMEOUT_MS) {
        try { fs.unlinkSync(stateFile); } catch (_) { /* ignore */ }
        return { checked: [], last_active: Date.now() };
      }
      return state;
    }
  } catch (_) { /* ignore */ }
  return { checked: [], last_active: Date.now() };
}

function pruneCheckedEntries(checked) {
  if (checked.length <= MAX_CHECKED_ENTRIES) {
    return checked;
  }

  const preserved = checked.includes(ROUTINE_BASH_SESSION_KEY) ? [ROUTINE_BASH_SESSION_KEY] : [];
  const sessionKeys = checked.filter(k => k.startsWith('__') && k !== ROUTINE_BASH_SESSION_KEY);
  const fileKeys = checked.filter(k => !k.startsWith('__'));
  const remainingSessionSlots = Math.max(MAX_SESSION_KEYS - preserved.length, 0);
  const cappedSession = sessionKeys.slice(-remainingSessionSlots);
  const remainingFileSlots = Math.max(MAX_CHECKED_ENTRIES - preserved.length - cappedSession.length, 0);
  const cappedFiles = fileKeys.slice(-remainingFileSlots);
  return [...preserved, ...cappedSession, ...cappedFiles];
}

function saveState(stateFile, state) {
  try {
    state.last_active = Date.now();
    state.checked = pruneCheckedEntries(state.checked);
    fs.mkdirSync(STATE_DIR, { recursive: true });
    // Atomic write: temp file + rename prevents partial reads
    const tmpFile = stateFile + '.tmp.' + process.pid;
    fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf8');
    fs.renameSync(tmpFile, stateFile);
  } catch (_) { /* ignore */ }
}

function markChecked(stateFile, key) {
  const state = loadState(stateFile);
  if (!state.checked.includes(key)) {
    state.checked.push(key);
    saveState(stateFile, state);
  }
}

function isChecked(stateFile, key) {
  const state = loadState(stateFile);
  const found = state.checked.includes(key);
  saveState(stateFile, state);
  return found;
}

// Prune stale session files older than 1 hour
(function pruneStaleFiles() {
  try {
    const files = fs.readdirSync(STATE_DIR);
    const now = Date.now();
    for (const f of files) {
      if (!f.startsWith('state-') || !f.endsWith('.json')) continue;
      const fp = path.join(STATE_DIR, f);
      const stat = fs.statSync(fp);
      if (now - stat.mtimeMs > SESSION_TIMEOUT_MS * 2) {
        fs.unlinkSync(fp);
      }
    }
  } catch (_) { /* ignore */ }
})();

// --- Sanitize file path against injection ---

function sanitizePath(filePath) {
  // Strip control chars (including null), bidi overrides, and newlines
  return filePath.replace(/[\x00-\x1f\x7f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, ' ').trim().slice(0, 500);
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
    '3. If this file reads/writes data files, show field names, structure, and date format (use redacted or synthetic values, not raw production data)',
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
    '3. If this file reads/writes data files, show field names, structure, and date format (use redacted or synthetic values, not raw production data)',
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

// --- Deny helper ---

function denyResult(reason) {
  return {
    stdout: JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason
      }
    }),
    exitCode: 0
  };
}

// --- Core logic (exported for run-with-flags.js) ---

function run(rawInput) {
  let data;
  try {
    data = typeof rawInput === 'string' ? JSON.parse(rawInput) : rawInput;
  } catch (_) {
    return rawInput; // allow on parse error
  }
  const stateFile = resolveStateFile(data);

  const rawToolName = data.tool_name || '';
  const toolInput = data.tool_input || {};
  // Normalize: case-insensitive matching via lookup map
  const TOOL_MAP = { 'edit': 'Edit', 'write': 'Write', 'multiedit': 'MultiEdit', 'bash': 'Bash' };
  const toolName = TOOL_MAP[rawToolName.toLowerCase()] || rawToolName;

  if (toolName === 'Edit' || toolName === 'Write') {
    const filePath = toolInput.file_path || '';
    if (!filePath) {
      return rawInput; // allow
    }

    if (!isChecked(stateFile, filePath)) {
      markChecked(stateFile, filePath);
      return denyResult(toolName === 'Edit' ? editGateMsg(filePath) : writeGateMsg(filePath));
    }

    return rawInput; // allow
  }

  if (toolName === 'MultiEdit') {
    const edits = toolInput.edits || [];
    for (const edit of edits) {
      const filePath = edit.file_path || '';
      if (filePath && !isChecked(stateFile, filePath)) {
        markChecked(stateFile, filePath);
        return denyResult(editGateMsg(filePath));
      }
    }
    return rawInput; // allow
  }

  if (toolName === 'Bash') {
    const command = toolInput.command || '';

    if (DESTRUCTIVE_BASH.test(command)) {
      // Gate destructive commands on first attempt; allow retry after facts presented
      const key = '__destructive__' + crypto.createHash('sha256').update(command).digest('hex').slice(0, 16);
      if (!isChecked(stateFile, key)) {
        markChecked(stateFile, key);
        return denyResult(destructiveBashMsg());
      }
      return rawInput; // allow retry after facts presented
    }

    if (!isChecked(stateFile, ROUTINE_BASH_SESSION_KEY)) {
      markChecked(stateFile, ROUTINE_BASH_SESSION_KEY);
      return denyResult(routineBashMsg());
    }

    return rawInput; // allow
  }

  return rawInput; // allow
}

module.exports = { run };
