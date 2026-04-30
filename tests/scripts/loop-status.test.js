/**
 * Tests for scripts/loop-status.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'loop-status.js');
const { analyzeTranscript, buildStatus } = require('../../scripts/loop-status');
const NOW = '2026-04-30T10:00:00.000Z';

function run(args = [], options = {}) {
  const envOverrides = {
    ...(options.env || {}),
  };

  if (typeof envOverrides.HOME === 'string' && !('USERPROFILE' in envOverrides)) {
    envOverrides.USERPROFILE = envOverrides.HOME;
  }

  if (typeof envOverrides.USERPROFILE === 'string' && !('HOME' in envOverrides)) {
    envOverrides.HOME = envOverrides.USERPROFILE;
  }

  try {
    const stdout = execFileSync('node', [SCRIPT, ...args], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000,
      cwd: options.cwd || process.cwd(),
      env: {
        ...process.env,
        ...envOverrides,
      },
    });
    return { code: 0, stdout, stderr: '' };
  } catch (error) {
    return {
      code: error.status || 1,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
    };
  }
}

function createTempHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-loop-status-home-'));
}

function writeTranscript(homeDir, projectSlug, fileName, entries) {
  const transcriptDir = path.join(homeDir, '.claude', 'projects', projectSlug);
  fs.mkdirSync(transcriptDir, { recursive: true });
  const transcriptPath = path.join(transcriptDir, fileName);
  fs.writeFileSync(
    transcriptPath,
    entries.map(entry => JSON.stringify(entry)).join('\n') + '\n',
    'utf8'
  );
  return transcriptPath;
}

function toolUse(timestamp, sessionId, id, name, input = {}) {
  return {
    timestamp,
    sessionId,
    type: 'assistant',
    message: {
      role: 'assistant',
      content: [
        {
          type: 'tool_use',
          id,
          name,
          input,
        },
      ],
    },
  };
}

function toolResult(timestamp, sessionId, toolUseId, content = 'ok') {
  return {
    timestamp,
    sessionId,
    type: 'user',
    message: {
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: toolUseId,
          content,
        },
      ],
    },
  };
}

function assistantMessage(timestamp, sessionId, text) {
  return {
    timestamp,
    sessionId,
    type: 'assistant',
    message: {
      role: 'assistant',
      content: [
        {
          type: 'text',
          text,
        },
      ],
    },
  };
}

function parsePayload(stdout) {
  return JSON.parse(stdout.trim());
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.error(`    ${error.message}`);
    return false;
  }
}

function runTests() {
  console.log('\n=== Testing loop-status.js ===\n');

  let passed = 0;
  let failed = 0;

  if (test('reports overdue ScheduleWakeup calls from Claude transcripts', () => {
    const homeDir = createTempHome();

    try {
      const transcriptPath = writeTranscript(homeDir, '-Users-affoon-project-a', 'session-a.jsonl', [
        toolUse('2026-04-30T09:00:00.000Z', 'session-a', 'toolu_wake', 'ScheduleWakeup', {
          delaySeconds: 300,
          reason: 'Iter 15: continue autonomous loop',
        }),
      ]);

      const result = run(['--home', homeDir, '--now', NOW, '--json']);

      assert.strictEqual(result.code, 0, result.stderr);
      const payload = parsePayload(result.stdout);
      assert.strictEqual(payload.schemaVersion, 'ecc.loop-status.v1');
      assert.strictEqual(payload.sessions.length, 1);
      assert.strictEqual(payload.sessions[0].sessionId, 'session-a');
      assert.strictEqual(payload.sessions[0].transcriptPath, transcriptPath);
      assert.strictEqual(payload.sessions[0].state, 'attention');
      assert.ok(payload.sessions[0].signals.some(signal => signal.type === 'schedule_wakeup_overdue'));
      assert.strictEqual(payload.sessions[0].latestWake.dueAt, '2026-04-30T09:05:00.000Z');
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('analyzeTranscript applies default thresholds when called directly', () => {
    const homeDir = createTempHome();

    try {
      const transcriptPath = writeTranscript(homeDir, '-Users-affoon-project-direct', 'session-direct.jsonl', [
        toolUse('2026-04-30T09:00:00.000Z', 'session-direct', 'toolu_direct_wake', 'ScheduleWakeup', {
          delaySeconds: 300,
          reason: 'Direct API default threshold check',
        }),
      ]);

      const session = analyzeTranscript(transcriptPath, { now: NOW });

      assert.strictEqual(session.state, 'attention');
      assert.ok(session.signals.some(signal => signal.type === 'schedule_wakeup_overdue'));
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('reports stale Bash tool_use entries without matching tool_result', () => {
    const homeDir = createTempHome();

    try {
      writeTranscript(homeDir, '-Users-affoon-project-b', 'session-b.jsonl', [
        toolUse('2026-04-30T09:10:00.000Z', 'session-b', 'toolu_bash', 'Bash', {
          command: 'pytest tests/integration/test_pipeline.py',
        }),
      ]);

      const result = run(['--home', homeDir, '--now', NOW, '--json']);

      assert.strictEqual(result.code, 0, result.stderr);
      const payload = parsePayload(result.stdout);
      assert.strictEqual(payload.sessions[0].state, 'attention');
      assert.ok(payload.sessions[0].signals.some(signal => (
        signal.type === 'pending_bash_tool_result'
        && signal.toolUseId === 'toolu_bash'
        && signal.ageSeconds === 3000
      )));
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('does not flag Bash tool_use entries that have a matching tool_result', () => {
    const homeDir = createTempHome();

    try {
      writeTranscript(homeDir, '-Users-affoon-project-c', 'session-c.jsonl', [
        toolUse('2026-04-30T09:40:00.000Z', 'session-c', 'toolu_bash_ok', 'Bash', {
          command: 'npm test',
        }),
        toolResult('2026-04-30T09:41:00.000Z', 'session-c', 'toolu_bash_ok', 'passed'),
      ]);

      const result = run(['--home', homeDir, '--now', NOW, '--json']);

      assert.strictEqual(result.code, 0, result.stderr);
      const payload = parsePayload(result.stdout);
      assert.strictEqual(payload.sessions[0].state, 'ok');
      assert.deepStrictEqual(payload.sessions[0].signals, []);
      assert.deepStrictEqual(payload.sessions[0].pendingTools, []);
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('does not flag ScheduleWakeup when later assistant progress exists', () => {
    const homeDir = createTempHome();

    try {
      writeTranscript(homeDir, '-Users-affoon-project-d', 'session-d.jsonl', [
        toolUse('2026-04-30T09:00:00.000Z', 'session-d', 'toolu_wake_ok', 'ScheduleWakeup', {
          delaySeconds: 300,
          reason: 'Loop checkpoint',
        }),
        assistantMessage('2026-04-30T09:06:00.000Z', 'session-d', 'Wake fired; continuing.'),
      ]);

      const result = run(['--home', homeDir, '--now', NOW, '--json']);

      assert.strictEqual(result.code, 0, result.stderr);
      const payload = parsePayload(result.stdout);
      assert.strictEqual(payload.sessions[0].state, 'ok');
      assert.ok(!payload.sessions[0].signals.some(signal => signal.type === 'schedule_wakeup_overdue'));
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('supports inspecting one transcript path directly', () => {
    const homeDir = createTempHome();

    try {
      const transcriptPath = writeTranscript(homeDir, '-Users-affoon-project-e', 'session-e.jsonl', [
        toolUse('2026-04-30T09:00:00.000Z', 'session-e', 'toolu_direct', 'Bash', {
          command: 'sleep 999',
        }),
      ]);

      const result = run(['--transcript', transcriptPath, '--now', NOW, '--json']);

      assert.strictEqual(result.code, 0, result.stderr);
      const payload = parsePayload(result.stdout);
      assert.strictEqual(payload.sessions.length, 1);
      assert.strictEqual(payload.sessions[0].transcriptPath, transcriptPath);
      assert.ok(payload.sessions[0].signals.some(signal => signal.type === 'pending_bash_tool_result'));
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('prints text output with state and recommended action', () => {
    const homeDir = createTempHome();

    try {
      writeTranscript(homeDir, '-Users-affoon-project-f', 'session-f.jsonl', [
        toolUse('2026-04-30T09:00:00.000Z', 'session-f', 'toolu_text', 'ScheduleWakeup', {
          delaySeconds: 600,
          reason: 'Loop checkpoint',
        }),
      ]);

      const result = run(['--home', homeDir, '--now', NOW]);

      assert.strictEqual(result.code, 0, result.stderr);
      assert.match(result.stdout, /session-f/);
      assert.match(result.stdout, /attention/);
      assert.match(result.stdout, /schedule_wakeup_overdue/);
      assert.match(result.stdout, /Open the transcript or interrupt the parked session/);
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('continues when an explicit transcript path cannot be read', () => {
    const missingTranscript = path.join(os.tmpdir(), `missing-loop-status-${Date.now()}.jsonl`);

    const result = run(['--transcript', missingTranscript, '--now', NOW, '--json']);

    assert.strictEqual(result.code, 0, result.stderr);
    const payload = parsePayload(result.stdout);
    assert.deepStrictEqual(payload.sessions, []);
    assert.strictEqual(payload.errors.length, 1);
    assert.strictEqual(payload.errors[0].transcriptPath, missingTranscript);
  })) passed++; else failed++;

  if (test('continues when one transcript directory cannot be read', () => {
    const homeDir = createTempHome();
    const blockedDir = path.join(homeDir, '.claude', 'projects', '-blocked-project');
    const originalReaddirSync = fs.readdirSync;

    try {
      writeTranscript(homeDir, '-Users-affoon-project-readable', 'session-readable.jsonl', [
        toolResult('2026-04-30T09:41:00.000Z', 'session-readable', 'toolu_done', 'done'),
      ]);
      fs.mkdirSync(blockedDir, { recursive: true });
      fs.readdirSync = (dir, options) => {
        if (path.resolve(dir) === path.resolve(blockedDir)) {
          const error = new Error('permission denied');
          error.code = 'EACCES';
          throw error;
        }
        return originalReaddirSync(dir, options);
      };

      const payload = buildStatus({ home: homeDir, now: NOW });

      assert.strictEqual(payload.sessions.length, 1);
      assert.strictEqual(payload.sessions[0].sessionId, 'session-readable');
      assert.strictEqual(payload.errors.length, 1);
      assert.strictEqual(payload.errors[0].code, 'EACCES');
      assert.strictEqual(payload.errors[0].transcriptPath, blockedDir);
    } finally {
      fs.readdirSync = originalReaddirSync;
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('reports malformed JSONL lines as an attention signal', () => {
    const homeDir = createTempHome();

    try {
      const transcriptDir = path.join(homeDir, '.claude', 'projects', '-Users-affoon-project-malformed');
      fs.mkdirSync(transcriptDir, { recursive: true });
      fs.writeFileSync(
        path.join(transcriptDir, 'session-malformed.jsonl'),
        [
          JSON.stringify({
            timestamp: '2026-04-30T09:55:00.000Z',
            sessionId: 'session-malformed',
            message: { role: 'assistant', content: [{ type: 'text', text: 'partial log' }] },
          }),
          '{"timestamp":',
        ].join('\n') + '\n',
        'utf8'
      );

      const result = run(['--home', homeDir, '--now', NOW, '--json']);

      assert.strictEqual(result.code, 0, result.stderr);
      const payload = parsePayload(result.stdout);
      assert.strictEqual(payload.sessions[0].state, 'attention');
      assert.ok(payload.sessions[0].signals.some(signal => (
        signal.type === 'transcript_parse_errors'
        && signal.count === 1
      )));
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('rejects non-integer limit values', () => {
    const result = run(['--limit', '1.5']);

    assert.strictEqual(result.code, 1);
    assert.match(result.stderr, /--limit must be a positive integer/);
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
