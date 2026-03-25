#!/usr/bin/env node
/**
 * Desktop Notification Hook (Stop)
 *
 * Sends a native desktop notification with the task summary when Claude
 * finishes responding.  Currently supports macOS (osascript); other
 * platforms exit silently.  Windows (PowerShell) and Linux (notify-send)
 * support is planned.
 *
 * Hook ID : stop:desktop-notify
 * Profiles: standard, strict
 */

'use strict';

const { spawnSync } = require('child_process');
const { isMacOS, log } = require('../lib/utils');

const TITLE = 'Claude Code';
const MAX_BODY_LENGTH = 100;

/**
 * Extract a short summary from the last assistant message.
 * Takes the first non-empty line and truncates to MAX_BODY_LENGTH chars.
 */
function extractSummary(message) {
  if (!message || typeof message !== 'string') return 'Done';

  const firstLine = message
    .split('\n')
    .map(l => l.trim())
    .find(l => l.length > 0);

  if (!firstLine) return 'Done';

  return firstLine.length > MAX_BODY_LENGTH
    ? `${firstLine.slice(0, MAX_BODY_LENGTH)}...`
    : firstLine;
}

/**
 * Send a macOS notification via osascript.
 * AppleScript strings do not support backslash escapes, so we replace
 * double quotes with curly quotes and strip backslashes before embedding.
 */
function notifyMacOS(title, body) {
  const safeBody = body.replace(/\\/g, '').replace(/"/g, '\u201C');
  const safeTitle = title.replace(/\\/g, '').replace(/"/g, '\u201C');
  const script = `display notification "${safeBody}" with title "${safeTitle}"`;
  const result = spawnSync('osascript', ['-e', script], { stdio: 'ignore', timeout: 5000 });
  if (result.error || result.status !== 0) {
    log(`[DesktopNotify] osascript failed: ${result.error ? result.error.message : `exit ${result.status}`}`);
  }
}

// TODO: future platform support
// function notifyWindows(title, body) { ... }
// function notifyLinux(title, body) { ... }

/**
 * Fast-path entry point for run-with-flags.js (avoids extra process spawn).
 */
function run(raw) {
  try {
    if (!isMacOS) return raw;

    const input = raw.trim() ? JSON.parse(raw) : {};
    const summary = extractSummary(input.last_assistant_message);
    notifyMacOS(TITLE, summary);
  } catch (err) {
    log(`[DesktopNotify] Error: ${err.message}`);
  }

  return raw;
}

module.exports = { run };

// Legacy stdin path (when invoked directly rather than via run-with-flags)
if (require.main === module) {
  const MAX_STDIN = 1024 * 1024;
  let data = '';

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    if (data.length < MAX_STDIN) {
      data += chunk.substring(0, MAX_STDIN - data.length);
    }
  });
  process.stdin.on('end', () => {
    const output = run(data);
    if (output) process.stdout.write(output);
  });
}
