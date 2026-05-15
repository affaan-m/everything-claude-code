#!/usr/bin/env node
/**
 * Strategic Compact Suggester
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs on PreToolUse or periodically to suggest manual compaction at logical intervals
 *
 * Why manual over auto-compact:
 * - Auto-compact happens at arbitrary points, often mid-task
 * - Strategic compacting preserves context through logical phases
 * - Compact after exploration, before execution
 * - Compact after completing a milestone, before starting next
 */

const fs = require('fs');
const path = require('path');
const {
  getTempDir,
  writeFile,
  readStdinJson,
  log,
  output
} = require('../lib/utils');

async function resolveSessionId() {
  // Claude Code passes hook input via stdin JSON; session_id is the
  // canonical field. Fall back to the legacy env var, then 'default'.
  try {
    const input = await readStdinJson({ timeoutMs: 1000 });
    if (input && typeof input.session_id === 'string' && input.session_id) {
      return input.session_id;
    }
  } catch {
    /* fall through to env */
  }
  return process.env.CLAUDE_SESSION_ID || 'default';
}

async function main() {
  // Track tool call count (increment in a temp file)
  // Use a session-specific counter file based on session ID from stdin JSON,
  // legacy env var, or 'default' as fallback.
  const rawSessionId = await resolveSessionId();
  const sessionId = rawSessionId.replace(/[^a-zA-Z0-9_-]/g, '') || 'default';
  const counterFile = path.join(getTempDir(), `claude-tool-count-${sessionId}`);
  const rawThreshold = parseInt(process.env.COMPACT_THRESHOLD || '50', 10);
  const threshold = Number.isFinite(rawThreshold) && rawThreshold > 0 && rawThreshold <= 10000
    ? rawThreshold
    : 50;

  let count = 1;

  // Read existing count or start at 1
  // Use fd-based read+write to reduce (but not eliminate) race window
  // between concurrent hook invocations
  try {
    const fd = fs.openSync(counterFile, 'a+');
    try {
      const buf = Buffer.alloc(64);
      const bytesRead = fs.readSync(fd, buf, 0, 64, 0);
      if (bytesRead > 0) {
        const parsed = parseInt(buf.toString('utf8', 0, bytesRead).trim(), 10);
        // Clamp to reasonable range — corrupted files could contain huge values
        // that pass Number.isFinite() (e.g., parseInt('9'.repeat(30)) => 1e+29)
        count = (Number.isFinite(parsed) && parsed > 0 && parsed <= 1000000)
          ? parsed + 1
          : 1;
      }
      // Truncate and write new value
      fs.ftruncateSync(fd, 0);
      fs.writeSync(fd, String(count), 0);
    } finally {
      fs.closeSync(fd);
    }
  } catch {
    // Fallback: just use writeFile if fd operations fail
    writeFile(counterFile, String(count));
  }

  // Suggest compact after threshold tool calls.
  //
  // log() writes to stderr (debug log). Per the Claude Code hooks guide,
  // non-blocking PreToolUse stderr (exit 0) is only written to the debug log;
  // it does not reach the model. To inject a user-facing suggestion without
  // blocking the tool call, emit structured JSON to stdout with
  // hookSpecificOutput.additionalContext — the documented mechanism for
  // PreToolUse hooks to add context to the next model turn.
  if (count === threshold) {
    const msg = `[StrategicCompact] ${threshold} tool calls reached - consider /compact if transitioning phases`;
    log(msg);
    output({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: msg } });
  }

  // Suggest at regular intervals after threshold (every 25 calls from threshold)
  if (count > threshold && (count - threshold) % 25 === 0) {
    const msg = `[StrategicCompact] ${count} tool calls - good checkpoint for /compact if context is stale`;
    log(msg);
    output({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: msg } });
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[StrategicCompact] Error:', err.message);
  process.exit(0);
});
