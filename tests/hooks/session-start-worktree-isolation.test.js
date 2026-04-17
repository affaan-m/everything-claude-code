/**
 * Regression test for worktree / cwd isolation in session-start.js
 *
 * Bug: When multiple git worktrees (or any cwds) share the same user, the
 * SessionStart hook picked the globally-newest `*-session.tmp` file from
 * `~/.claude/sessions/` and injected it as "Previous session summary" into
 * the context of every new session, regardless of which cwd/project/worktree
 * the new session was actually for.
 *
 * Symptom: Cannith-dispatched Claude Agent SDK sessions in worktree A would
 * receive worktree B's most recent session summary as context and then do
 * tool calls as if the task was B's task.
 *
 * Fix: session-start.js must only inject a previous session summary whose
 * filename's shortId matches the current invocation's shortId (as computed
 * by getSessionIdShort() — last 8 chars of $CLAUDE_SESSION_ID, else the
 * project/worktree basename). Cross-worktree content must not leak.
 *
 * Run with: node tests/hooks/session-start-worktree-isolation.test.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const scriptsDir = path.join(__dirname, '..', '..', 'scripts', 'hooks');
const sessionStartScript = path.join(scriptsDir, 'session-start.js');

/**
 * Run session-start.js in a child process with a custom cwd/env and capture
 * stdout/stderr. Mirrors the helper in hooks.test.js but exposes `cwd` so
 * the hook's project-name detection reflects a specific worktree basename.
 */
function runSessionStart({ cwd, env }) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [sessionStartScript], {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => (stdout += d));
    proc.stderr.on('data', d => (stderr += d));
    proc.stdin.end();
    proc.on('close', code => resolve({ code, stdout, stderr }));
    proc.on('error', reject);
  });
}

/**
 * Touch a file so its mtime is at least `ageSeconds` seconds old.
 * Used to make worktree A's session file OLDER than worktree B's,
 * so the buggy global-newest logic would prefer B.
 */
function setMtime(filePath, ageSeconds) {
  const time = Date.now() / 1000 - ageSeconds;
  fs.utimesSync(filePath, time, time);
}

async function main() {
  const failures = [];

  // Isolated $HOME so the test never touches the real ~/.claude
  const isoHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-worktree-isolation-'));
  const sessionsDir = path.join(isoHome, '.claude', 'sessions');
  fs.mkdirSync(sessionsDir, { recursive: true });
  fs.mkdirSync(path.join(isoHome, '.claude', 'skills', 'learned'), { recursive: true });

  // Two fake worktrees as cwds. Each has its own basename which
  // getSessionIdShort() will fall back to when CLAUDE_SESSION_ID is unset.
  // Basenames must be lowercase alphanumeric+hyphen with length >= 8 to
  // match SESSION_FILENAME_REGEX in session-manager.js. Nesting them under
  // isoHome keeps the test hermetic and avoids mkdtempSync's mixed-case suffix.
  const basenameA = 'worktree-a-test';
  const basenameB = 'worktree-b-test';
  const worktreeA = path.join(isoHome, basenameA);
  const worktreeB = path.join(isoHome, basenameB);
  fs.mkdirSync(worktreeA, { recursive: true });
  fs.mkdirSync(worktreeB, { recursive: true });

  // Create two session files — one per worktree — with the real on-disk
  // format `<date>-<shortId>-session.tmp`. The filename shortId is the
  // worktree basename because CLAUDE_SESSION_ID is not set. The date must
  // be today so the hook's 7-day maxAge filter keeps both files.
  const today = new Date().toISOString().slice(0, 10);
  const fileA = path.join(sessionsDir, `${today}-${basenameA}-session.tmp`);
  const fileB = path.join(sessionsDir, `${today}-${basenameB}-session.tmp`);
  fs.writeFileSync(
    fileA,
    '# Session: worktree A\n\n## Session Summary\n### Tasks\n- Working on TASK-A in worktree A\n'
  );
  fs.writeFileSync(
    fileB,
    '# Session: worktree B\n\n## Session Summary\n### Tasks\n- Working on TASK-B in worktree B\n'
  );

  // Make A OLDER than B. The pre-fix hook picks the newest *globally*, so
  // it would pick B's summary regardless of which cwd we run in — that's
  // the crosstalk.
  setMtime(fileA, 120); // A is 2 minutes old
  setMtime(fileB, 10);  // B is 10 seconds old (newest)

  // --- Test 1: running in worktree A must inject A's summary, NOT B's ---
  const resultA = await runSessionStart({
    cwd: worktreeA,
    env: { HOME: isoHome, USERPROFILE: isoHome, CLAUDE_SESSION_ID: '' }
  });

  try {
    assert.strictEqual(resultA.code, 0, `exit code: ${resultA.code}, stderr=${resultA.stderr}`);
    assert.ok(
      resultA.stdout.includes('TASK-A'),
      'session-start running in worktree A must inject worktree A\'s summary'
    );
    assert.ok(
      !resultA.stdout.includes('TASK-B'),
      'session-start running in worktree A must NOT leak worktree B\'s summary (CROSSTALK BUG)'
    );
    console.log('  PASS: worktree A does not receive worktree B\'s summary');
  } catch (err) {
    failures.push(`test 1 (worktree A isolation): ${err.message}`);
    console.log(`  FAIL: ${err.message}`);
  }

  // --- Test 2: running in worktree B must still inject B's summary ---
  const resultB = await runSessionStart({
    cwd: worktreeB,
    env: { HOME: isoHome, USERPROFILE: isoHome, CLAUDE_SESSION_ID: '' }
  });

  try {
    assert.strictEqual(resultB.code, 0);
    assert.ok(
      resultB.stdout.includes('TASK-B'),
      'session-start running in worktree B must inject worktree B\'s summary'
    );
    assert.ok(
      !resultB.stdout.includes('TASK-A'),
      'session-start running in worktree B must NOT leak worktree A\'s summary'
    );
    console.log('  PASS: worktree B receives its own summary');
  } catch (err) {
    failures.push(`test 2 (worktree B isolation): ${err.message}`);
    console.log(`  FAIL: ${err.message}`);
  }

  // Cleanup (worktrees are inside isoHome, so one rmSync covers all)
  fs.rmSync(isoHome, { recursive: true, force: true });

  if (failures.length > 0) {
    console.error(`\n${failures.length} failure(s):`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log('\nAll tests passed.');
  process.exit(0);
}

main().catch(err => {
  console.error('Test runner error:', err);
  process.exit(2);
});
