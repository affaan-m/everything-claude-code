#!/usr/bin/env node
/**
 * Cost Tracker Hook (v2)
 *
 * Reads transcript_path from Stop hook stdin, sums usage across all
 * assistant turns in the session JSONL, and appends one row to
 * ~/.claude/metrics/costs.jsonl.
 *
 * Stop hook stdin payload: { session_id, transcript_path, cwd, hook_event_name, ... }
 * The Stop payload does NOT include `usage` or `model` directly. The previous
 * version of this hook expected those fields and silently produced zero-filled
 * rows (verified: 2,340 rows captured with 0.0% non-zero token rate over 52
 * days). The fix is to read the transcript file Claude Code already passes us.
 *
 * JSONL assistant entry shape (per Claude Code):
 *   { type: "assistant", message: { model, usage: { input_tokens, output_tokens,
 *     cache_creation_input_tokens, cache_read_input_tokens } } }
 *
 * Cumulative behavior: Stop fires per assistant response, not per session.
 * Each row therefore represents the cumulative session total up to that point.
 * To get per-session cost, take the last row per session_id. To get per-day
 * spend, aggregate.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { ensureDir, appendFile, getClaudeDir } = require('../lib/utils');
const { sanitizeSessionId } = require('../lib/session-bridge');

// Approximate per-1M-token billing rates (USD).
// Cache creation: 1.25x input rate. Cache read: 0.1x input rate.
const RATE_TABLE = {
  haiku:  { in: 0.80,  out: 4.0,  cacheWrite: 1.00,  cacheRead: 0.08 },
  sonnet: { in: 3.00,  out: 15.0, cacheWrite: 3.75,  cacheRead: 0.30 },
  opus:   { in: 15.00, out: 75.0, cacheWrite: 18.75, cacheRead: 1.50 }
};

function getRates(model) {
  const m = String(model || '').toLowerCase();
  if (m.includes('haiku')) return RATE_TABLE.haiku;
  if (m.includes('opus'))  return RATE_TABLE.opus;
  return RATE_TABLE.sonnet;
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Scan the session JSONL and sum token usage across all assistant turns.
 * Returns { inputTokens, outputTokens, cacheWriteTokens, cacheReadTokens, model }
 * or null on read failure.
 */
function sumUsageFromTranscript(transcriptPath) {
  let content;
  try {
    content = fs.readFileSync(transcriptPath, 'utf8');
  } catch {
    return null;
  }

  let inputTokens = 0;
  let outputTokens = 0;
  let cacheWriteTokens = 0;
  let cacheReadTokens = 0;
  let model = 'unknown';

  for (const line of content.split('\n')) {
    if (!line.trim()) continue;
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }

    if (entry.type !== 'assistant') continue;
    const msg = entry.message;
    if (!msg || !msg.usage) continue;

    const u = msg.usage;
    inputTokens      += toNumber(u.input_tokens);
    outputTokens     += toNumber(u.output_tokens);
    cacheWriteTokens += toNumber(u.cache_creation_input_tokens);
    cacheReadTokens  += toNumber(u.cache_read_input_tokens);

    if (msg.model && msg.model !== 'unknown') model = msg.model;
  }

  return { inputTokens, outputTokens, cacheWriteTokens, cacheReadTokens, model };
}

const MAX_STDIN = 64 * 1024;
let raw = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  if (raw.length < MAX_STDIN) raw += chunk.substring(0, MAX_STDIN - raw.length);
});

process.stdin.on('end', () => {
  try {
    const input = raw.trim() ? JSON.parse(raw) : {};

    const transcriptPath = (typeof input.transcript_path === 'string' && input.transcript_path)
      ? input.transcript_path
      : process.env.CLAUDE_TRANSCRIPT_PATH || null;

    const sessionId =
      sanitizeSessionId(input.session_id) ||
      sanitizeSessionId(process.env.ECC_SESSION_ID) ||
      sanitizeSessionId(process.env.CLAUDE_SESSION_ID) ||
      'default';

    let usageTotals = null;
    if (transcriptPath && fs.existsSync(transcriptPath)) {
      usageTotals = sumUsageFromTranscript(transcriptPath);
    }

    const {
      inputTokens = 0,
      outputTokens = 0,
      cacheWriteTokens = 0,
      cacheReadTokens = 0,
      model = 'unknown'
    } = usageTotals || {};

    const rates = getRates(model);
    const estimatedCostUsd = Math.round((
      (inputTokens      / 1e6) * rates.in +
      (outputTokens     / 1e6) * rates.out +
      (cacheWriteTokens / 1e6) * rates.cacheWrite +
      (cacheReadTokens  / 1e6) * rates.cacheRead
    ) * 1e6) / 1e6;

    const metricsDir = path.join(getClaudeDir(), 'metrics');
    ensureDir(metricsDir);

    const row = {
      timestamp:          new Date().toISOString(),
      session_id:         sessionId,
      transcript_path:    transcriptPath || '',
      model,
      input_tokens:       inputTokens,
      output_tokens:      outputTokens,
      cache_write_tokens: cacheWriteTokens,
      cache_read_tokens:  cacheReadTokens,
      estimated_cost_usd: estimatedCostUsd
    };

    appendFile(path.join(metricsDir, 'costs.jsonl'), `${JSON.stringify(row)}\n`);
  } catch {
    // Non-blocking — never fail the Stop hook.
  }

  // Pass stdin through (required by ECC hook convention).
  process.stdout.write(raw);
});
