#!/usr/bin/env node
/**
 * ECC Metrics Bridge — PostToolUse hook
 *
 * Maintains a running session aggregate in /tmp/ecc-metrics-{session}.json.
 * This bridge file is read by ecc-statusline.js and ecc-context-monitor.js,
 * avoiding the need to scan large JSONL logs on every invocation.
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { sanitizeSessionId, readBridge, writeBridgeAtomic } = require('../lib/session-bridge');
const { getClaudeDir } = require('../lib/utils');

const MAX_STDIN = 1024 * 1024;
const MAX_FILES_TRACKED = 200;
const RECENT_TOOLS_SIZE = 5;
const HASH_INPUT_LIMIT = 2048;

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function stableStringify(value, depth = 0) {
  if (depth > 4) return '[depth-limit]';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(item => stableStringify(item, depth + 1)).join(',')}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map(key => `${JSON.stringify(key)}:${stableStringify(value[key], depth + 1)}`)
    .join(',')}}`;
}

/**
 * Hash tool call for loop detection.
 * Uses tool name + a key parameter when available, otherwise a stable input digest.
 */
function hashToolCall(toolName, toolInput) {
  const name = String(toolName || '');
  let key = '';
  if (name === 'Bash') {
    key = String(toolInput?.command || '').slice(0, 160);
  } else if (toolInput?.file_path) {
    key = String(toolInput.file_path);
  } else {
    key = stableStringify(toolInput || {}).slice(0, HASH_INPUT_LIMIT);
  }
  return crypto.createHash('sha256').update(`${name}:${key}`).digest('hex').slice(0, 8);
}

/**
 * Extract modified file paths from tool input.
 */
function extractFilePaths(toolName, toolInput) {
  const paths = [];
  if (!toolInput || typeof toolInput !== 'object') return paths;

  const fp = toolInput.file_path;
  if (fp && typeof fp === 'string') paths.push(fp);

  const edits = toolInput.edits;
  if (Array.isArray(edits)) {
    for (const edit of edits) {
      if (edit?.file_path && typeof edit.file_path === 'string') {
        paths.push(edit.file_path);
      }
    }
  }

  return paths;
}

/**
 * Read cumulative cost for a session from the tail of costs.jsonl.
 * Reads last 8KB to avoid scanning entire file.
 */
function readSessionCost(sessionId) {
  try {
    const costsPath = path.join(getClaudeDir(), 'metrics', 'costs.jsonl');
    const stat = fs.statSync(costsPath);
    const readSize = Math.min(stat.size, 8192);
    const fd = fs.openSync(costsPath, 'r');
    try {
      const buf = Buffer.alloc(readSize);
      fs.readSync(fd, buf, 0, readSize, Math.max(0, stat.size - readSize));
      const lines = buf.toString('utf8').split('\n').filter(Boolean);

      let totalCost = 0;
      let totalIn = 0;
      let totalOut = 0;
      for (const line of lines) {
        try {
          const row = JSON.parse(line);
          if (row.session_id === sessionId) {
            totalCost += toNumber(row.estimated_cost_usd);
            totalIn += toNumber(row.input_tokens);
            totalOut += toNumber(row.output_tokens);
          }
        } catch {
          /* skip malformed lines */
        }
      }
      return { totalCost, totalIn, totalOut };
    } finally {
      fs.closeSync(fd);
    }
  } catch {
    return { totalCost: 0, totalIn: 0, totalOut: 0 };
  }
}

/**
 * @param {string} rawInput - Raw JSON string from stdin
 * @returns {string} Pass-through
 */
function run(rawInput) {
  try {
    const input = rawInput.trim() ? JSON.parse(rawInput) : {};
    const toolName = String(input.tool_name || '');
    const toolInput = input.tool_input || {};

    const sessionId = sanitizeSessionId(input.session_id) || sanitizeSessionId(process.env.ECC_SESSION_ID) || sanitizeSessionId(process.env.CLAUDE_SESSION_ID);

    if (!sessionId) return rawInput;

    const now = new Date().toISOString();
    const bridge = readBridge(sessionId) || {
      session_id: sessionId,
      total_cost_usd: 0,
      total_input_tokens: 0,
      total_output_tokens: 0,
      tool_count: 0,
      files_modified_count: 0,
      files_modified: [],
      recent_tools: [],
      first_timestamp: now,
      last_timestamp: now,
      context_remaining_pct: null
    };

    // Increment tool count
    bridge.tool_count = (bridge.tool_count || 0) + 1;
    bridge.last_timestamp = now;
    if (!bridge.first_timestamp) bridge.first_timestamp = now;

    // Track modified files (Write/Edit/MultiEdit only)
    const isWriteOp = /^(Write|Edit|MultiEdit)$/i.test(toolName);
    if (isWriteOp) {
      const newPaths = extractFilePaths(toolName, toolInput);
      const existing = new Set(bridge.files_modified || []);
      for (const p of newPaths) {
        if (existing.size < MAX_FILES_TRACKED && !existing.has(p)) {
          existing.add(p);
        }
      }
      bridge.files_modified = [...existing];
      bridge.files_modified_count = existing.size;
    }

    // Ring buffer for loop detection
    const recent = bridge.recent_tools || [];
    recent.push({ tool: toolName, hash: hashToolCall(toolName, toolInput) });
    if (recent.length > RECENT_TOOLS_SIZE) recent.shift();
    bridge.recent_tools = recent;

    // Update cost from costs.jsonl tail
    const costs = readSessionCost(sessionId);
    bridge.total_cost_usd = Math.round(costs.totalCost * 1e6) / 1e6;
    bridge.total_input_tokens = costs.totalIn;
    bridge.total_output_tokens = costs.totalOut;

    writeBridgeAtomic(sessionId, bridge);
  } catch {
    // Never block tool execution
  }

  return rawInput;
}

if (require.main === module) {
  let data = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    if (data.length < MAX_STDIN) data += chunk.substring(0, MAX_STDIN - data.length);
  });
  process.stdin.on('end', () => {
    process.stdout.write(run(data));
    process.exit(0);
  });
}

module.exports = { run, hashToolCall, extractFilePaths, readSessionCost, stableStringify };
