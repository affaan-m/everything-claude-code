#!/usr/bin/env node
/**
 * Desktop Notification Hook (Stop)
 *
 * Sends a native desktop notification with the task summary when Claude
 * finishes responding.  Supports:
 *   - macOS: osascript (native)
 *   - WSL: PowerShell 7 or Windows PowerShell + BurntToast module
 *
 * On WSL, if BurntToast is not installed, logs a tip for installation.
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
 * Memoized WSL detection at module load (avoids repeated /proc/version reads).
 */
let isWSL = false;
if (process.platform === 'linux') {
  try {
    isWSL = require('fs').readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft');
  } catch {
    isWSL = false;
  }
}

/**
 * Find available PowerShell executable on WSL.
 * Returns first accessible path, or null if none found.
 */
function findPowerShell() {
  if (!isWSL) return null;

  const candidates = [
    'pwsh.exe',        // WSL interop resolves from Windows PATH
    'powershell.exe',  // WSL interop for Windows PowerShell
    '/mnt/c/Program Files/PowerShell/7/pwsh.exe',      // PowerShell 7 (default install)
    '/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe', // Windows PowerShell
  ];

  for (const path of candidates) {
    try {
      const result = spawnSync(path, ['-Command', 'exit 0'],
        { stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000 });
      if (result.status === 0) {
        return path;
      }
    } catch {
      // continue
    }
  }
  return null;
}

/**
 * Send a Windows Toast notification via PowerShell BurntToast.
 * Returns { success: boolean, reason: string|null }.
 * reason is null on success, or contains error detail on failure.
 */
function notifyWindows(pwshPath, title, body) {
  const safeBody = body.replace(/'/g, "''");
  const safeTitle = title.replace(/'/g, "''");
  const command = `Import-Module BurntToast; New-BurntToastNotification -Text '${safeTitle}', '${safeBody}'`;
  const result = spawnSync(pwshPath, ['-Command', command],
    { stdio: ['ignore', 'pipe', 'pipe'], timeout: 5000 });
  if (result.status === 0) {
    return { success: true, reason: null };
  }
  const errorMsg = result.error ? result.error.message : result.stderr?.toString();
  return { success: false, reason: errorMsg || `exit ${result.status}` };
}

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

/**
 * Fast-path entry point for run-with-flags.js (avoids extra process spawn).
 */
function run(raw) {
  try {
    const input = raw.trim() ? JSON.parse(raw) : {};
    const summary = extractSummary(input.last_assistant_message);

    if (isMacOS) {
      notifyMacOS(TITLE, summary);
    } else if (isWSL) {
      const ps = findPowerShell();
      if (ps) {
        const { success, reason } = notifyWindows(ps, TITLE, summary);
        if (success) {
          // notification sent successfully
        } else if (reason && reason.toLowerCase().includes('burnttoast')) {
          // BurntToast module not found
          log('[DesktopNotify] Tip: Install BurntToast module to enable notifications');
        } else if (reason) {
          // Other PowerShell/notification error - log for debugging
          log(`[DesktopNotify] Notification failed: ${reason}`);
        }
      } else {
        // No PowerShell found
        log('[DesktopNotify] Tip: Install BurntToast module in PowerShell for notifications');
      }
    }
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
