'use strict';

/**
 * Shared session bridge utilities for ECC hooks.
 *
 * The bridge file is a small JSON aggregate in /tmp that allows
 * statusline, metrics-bridge, and context-monitor to share state
 * without scanning large JSONL logs on every invocation.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const MAX_SESSION_ID_LENGTH = 64;

/**
 * Sanitize a session ID for safe use in file paths.
 * Rejects path traversal, strips unsafe chars, limits length.
 * @param {string} raw
 * @returns {string|null} Safe session ID or null if invalid
 */
function sanitizeSessionId(raw) {
  if (!raw || typeof raw !== 'string') return null;
  if (/[/\\]|\.\./.test(raw)) return null;
  const safe = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, MAX_SESSION_ID_LENGTH);
  return safe || null;
}

/**
 * Get the bridge file path for a session.
 * @param {string} sessionId - Already-sanitized session ID
 * @returns {string}
 */
function getBridgePath(sessionId) {
  return path.join(os.tmpdir(), `ecc-metrics-${sessionId}.json`);
}

/**
 * Read bridge data. Returns null on any error.
 * @param {string} sessionId - Already-sanitized session ID
 * @returns {object|null}
 */
function readBridge(sessionId) {
  try {
    const raw = fs.readFileSync(getBridgePath(sessionId), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Write bridge data atomically (write .tmp then rename).
 * @param {string} sessionId - Already-sanitized session ID
 * @param {object} data
 */
function writeBridgeAtomic(sessionId, data) {
  const target = getBridgePath(sessionId);
  const tmp = `${target}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data), 'utf8');
  fs.renameSync(tmp, target);
}

/**
 * Resolve session ID from environment variables.
 * @returns {string|null} Sanitized session ID or null
 */
function resolveSessionId() {
  const raw = process.env.ECC_SESSION_ID || process.env.CLAUDE_SESSION_ID || '';
  return sanitizeSessionId(raw);
}

module.exports = {
  sanitizeSessionId,
  getBridgePath,
  readBridge,
  writeBridgeAtomic,
  resolveSessionId,
  MAX_SESSION_ID_LENGTH
};
