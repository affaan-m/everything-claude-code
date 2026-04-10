/**
 * Tests for the SQLite-backed ECC state store and CLI commands.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const {
  createStateStore,
  resolveStateStorePath,
} = require('../../scripts/lib/state-store');

const ECC_SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'ecc.js');
const STATUS_SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'status.js');
const SESSIONS_SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'sessions-cli.js');

async function test(name, fn) {
  try {
    await fn();
    console.log(`  \u2713 ${name}`);
    return true;
  } catch (error) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanupTempDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function runNode(scriptPath, args = [], options = {}) {
  return spawnSync('node', [scriptPath, ...args], {
    encoding: 'utf8',
    cwd: options.cwd || process.cwd(),
    env: {
      ...process.env,
      ...(options.env || {}),
    },
  });
}

function parseJson(stdout) {
  return JSON.parse(stdout.trim());
}

async function seedStore(dbPath) {
  const store = await createStateStore({ dbPath });

  store.upsertSession({
    id: 'session-active',
    adapterId: 'dmux-tmux',
    harness: 'claude',
    state: 'active',
    repoRoot: '/tmp/ecc-repo',
    startedAt: '2026-03-15T08:00:00.000Z',
    endedAt: null,
    snapshot: {
      schemaVersion: 'ecc.session.v1',
      adapterId: 'dmux-tmux',
      session: {
        id: 'session-active',
        kind: 'orchestrated',
        state: 'active',
        repoRoot: '/tmp/ecc-repo',
      },
      workers: [
        {
          id: 'worker-1',
          label: 'Worker 1',
          state: 'active',
          branch: 'feat/state-store',
          worktree: '/tmp/ecc-repo/.worktrees/worker-1',
        },
        {
          id: 'worker-2',
          label: 'Worker 2',
          state: 'idle',
          branch: 'feat/state-store',
          worktree: '/tmp/ecc-repo/.worktrees/worker-2',
        },
      ],
      aggregates: {
        workerCount: 2,
        states: {
          active: 1,
          idle: 1,
        },
      },
    },
  });

  store.upsertSession({
    id: 'session-recorded',
    adapterId: 'claude-history',
    harness: 'claude',
    state: 'recorded',
    repoRoot: '/tmp/ecc-repo',
    startedAt: '2026-03-14T18:00:00.000Z',
    endedAt: '2026-03-14T19:00:00.000Z',
    snapshot: {
      schemaVersion: 'ecc.session.v1',
      adapterId: 'claude-history',
      session: {
        id: 'session-recorded',
        kind: 'history',
        state: 'recorded',
        repoRoot: '/tmp/ecc-repo',
      },
      workers: [
        {
          id: 'worker-hist',
          label: 'History Worker',
          state: 'recorded',
          branch: 'main',
          worktree: '/tmp/ecc-repo',
        },
      ],
      aggregates: {
        workerCount: 1,
        states: {
          recorded: 1,
        },
      },
    },
  });

  store.insertSkillRun({
    id: 'skill-run-1',
    skillId: 'tdd-workflow',
    skillVersion: '1.0.0',
    sessionId: 'session-active',
    taskDescription: 'Write store tests',
    outcome: 'success',
    failureReason: null,
    tokensUsed: 1200,
    durationMs: 3500,
    userFeedback: 'useful',
    createdAt: '2026-03-15T08:05:00.000Z',
  });

  store.insertSkillRun({
    id: 'skill-run-2',
    skillId: 'security-review',
    skillVersion: '1.0.0',
    sessionId: 'session-active',
    taskDescription: 'Review state-store design',
    outcome: 'failed',
    failureReason: 'timeout',
    tokensUsed: 800,
    durationMs: 1800,
    userFeedback: null,
    createdAt: '2026-03-15T08:06:00.000Z',
  });

  store.insertSkillRun({
    id: 'skill-run-3',
    skillId: 'code-reviewer',
    skillVersion: '1.0.0',
    sessionId: 'session-recorded',
    taskDescription: 'Inspect CLI formatting',
    outcome: 'success',
    failureReason: null,
    tokensUsed: 500,
    durationMs: 900,
    userFeedback: 'clear',
    createdAt: '2026-03-15T08:07:00.000Z',
  });

  store.insertSkillRun({
    id: 'skill-run-4',
    skillId: 'planner',
    skillVersion: '1.0.0',
    sessionId: 'session-recorded',
    taskDescription: 'Outline ECC 2.0 work',
    outcome: 'unknown',
    failureReason: null,
    tokensUsed: 300,
    durationMs: 500,
    userFeedback: null,
    createdAt: '2026-03-15T08:08:00.000Z',
  });

  store.upsertSkillVersion({
    skillId: 'tdd-workflow',
    version: '1.0.0',
    contentHash: 'abc123',
    amendmentReason: 'initial',
    promotedAt: '2026-03-10T00:00:00.000Z',
    rolledBackAt: null,
  });

  store.insertDecision({
    id: 'decision-1',
    sessionId: 'session-active',
    title: 'Use SQLite for durable state',
    rationale: 'Need queryable local state for ECC control plane',
    alternatives: ['json-files', 'memory-only'],
    supersedes: null,
    status: 'active',
    createdAt: '2026-03-15T08:09:00.000Z',
  });

  store.upsertInstallState({
    targetId: 'claude-home',
    targetRoot: '/tmp/home/.claude',
    profile: 'developer',
    modules: ['rules-core', 'orchestration'],
    operations: [
      {
        kind: 'copy-file',
        destinationPath: '/tmp/home/.claude/agents/planner.md',
      },
    ],
    installedAt: '2026-03-15T07:00:00.000Z',
    sourceVersion: '1.8.0',
  });

  store.insertGovernanceEvent({
    id: 'gov-1',
    sessionId: 'session-active',
    eventType: 'policy-review-required',
    payload: {
      severity: 'warning',
      owner: 'security-reviewer',
    },
    resolvedAt: null,
    resolution: null,
    createdAt: '2026-03-15T08:10:00.000Z',
  });

  store.insertGovernanceEvent({
    id: 'gov-2',
    sessionId: 'session-recorded',
    eventType: 'decision-accepted',
    payload: {
      severity: 'info',
    },
    resolvedAt: '2026-03-15T08:11:00.000Z',
    resolution: 'accepted',
    createdAt: '2026-03-15T08:09:30.000Z',
  });

  store.close();
}

async function runTests() {
  console.log('\n=== Testing state-store ===\n');

  let passed = 0;
  let failed = 0;

  if (await test('creates the default state.db path and applies migrations idempotently', async () => {
    const homeDir = createTempDir('ecc-state-home-');

    try {
      const expectedPath = path.join(homeDir, '.claude', 'ecc', 'state.db');
      assert.strictEqual(resolveStateStorePath({ homeDir }), expectedPath);

      const firstStore = await createStateStore({ homeDir });
      const firstMigrations = firstStore.getAppliedMigrations();
      firstStore.close();

      assert.strictEqual(firstMigrations.length, 1);
      assert.strictEqual(firstMigrations[0].version, 1);
      assert.ok(fs.existsSync(expectedPath));

      const secondStore = await createStateStore({ homeDir });
      const secondMigrations = secondStore.getAppliedMigrations();
      secondStore.close();

      assert.strictEqual(secondMigrations.length, 1);
      assert.strictEqual(secondMigrations[0].version, 1);
    } finally {
      cleanupTempDir(homeDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('preserves SQLite special database names like :memory:', async () => {
    const tempDir = createTempDir('ecc-state-memory-');
    const previousCwd = process.cwd();

    try {
      process.chdir(tempDir);
      assert.strictEqual(resolveStateStorePath({ dbPath: ':memory:' }), ':memory:');

      const store = await createStateStore({ dbPath: ':memory:' });
      assert.strictEqual(store.dbPath, ':memory:');
      assert.strictEqual(store.getAppliedMigrations().length, 1);
      store.close();

      assert.ok(!fs.existsSync(path.join(tempDir, ':memory:')));
    } finally {
      process.chdir(previousCwd);
      cleanupTempDir(tempDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('stores sessions and returns detailed session views with workers, skill runs, and decisions', async () => {
    const testDir = createTempDir('ecc-state-db-');
    const dbPath = path.join(testDir, 'state.db');

    try {
      await seedStore(dbPath);

      const store = await createStateStore({ dbPath });
      const listResult = store.listRecentSessions({ limit: 10 });
      const detail = store.getSessionDetail('session-active');
      store.close();

      assert.strictEqual(listResult.totalCount, 2);
      assert.strictEqual(listResult.sessions[0].id, 'session-active');
      assert.strictEqual(detail.session.id, 'session-active');
      assert.strictEqual(detail.workers.length, 2);
      assert.strictEqual(detail.skillRuns.length, 2);
      assert.strictEqual(detail.decisions.length, 1);
      assert.deepStrictEqual(detail.decisions[0].alternatives, ['json-files', 'memory-only']);
    } finally {
      cleanupTempDir(testDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('builds a status snapshot with active sessions, skill rates, install health, and pending governance', async () => {
    const testDir = createTempDir('ecc-state-db-');
    const dbPath = path.join(testDir, 'state.db');

    try {
      await seedStore(dbPath);

      const store = await createStateStore({ dbPath });
      const status = store.getStatus();
      store.close();

      assert.strictEqual(status.activeSessions.activeCount, 1);
      assert.strictEqual(status.activeSessions.sessions[0].id, 'session-active');
      assert.strictEqual(status.skillRuns.summary.totalCount, 4);
      assert.strictEqual(status.skillRuns.summary.successCount, 2);
      assert.strictEqual(status.skillRuns.summary.failureCount, 1);
      assert.strictEqual(status.skillRuns.summary.unknownCount, 1);
      assert.strictEqual(status.installHealth.status, 'healthy');
      assert.strictEqual(status.installHealth.totalCount, 1);
      assert.strictEqual(status.governance.pendingCount, 1);
      assert.strictEqual(status.governance.events[0].id, 'gov-1');
    } finally {
      cleanupTempDir(testDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('validates entity payloads before writing to the database', async () => {
    const testDir = createTempDir('ecc-state-db-');
    const dbPath = path.join(testDir, 'state.db');

    try {
      const store = await createStateStore({ dbPath });
      assert.throws(() => {
        store.upsertSession({
          id: '',
          adapterId: 'dmux-tmux',
          harness: 'claude',
          state: 'active',
          repoRoot: '/tmp/repo',
          startedAt: '2026-03-15T08:00:00.000Z',
          endedAt: null,
          snapshot: {},
        });
      }, /Invalid session/);

      assert.throws(() => {
        store.insertDecision({
          id: 'decision-invalid',
          sessionId: 'missing-session',
          title: 'Reject non-array alternatives',
          rationale: 'alternatives must be an array',
          alternatives: { unexpected: true },
          supersedes: null,
          status: 'active',
          createdAt: '2026-03-15T08:15:00.000Z',
        });
      }, /Invalid decision/);

      assert.throws(() => {
        store.upsertInstallState({
          targetId: 'claude-home',
          targetRoot: '/tmp/home/.claude',
          profile: 'developer',
          modules: 'rules-core',
          operations: [],
          installedAt: '2026-03-15T07:00:00.000Z',
          sourceVersion: '1.8.0',
        });
      }, /Invalid installState/);

      store.close();
    } finally {
      cleanupTempDir(testDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('status CLI supports human-readable and --json output', async () => {
    const testDir = createTempDir('ecc-state-cli-');
    const dbPath = path.join(testDir, 'state.db');

    try {
      await seedStore(dbPath);

      const jsonResult = runNode(STATUS_SCRIPT, ['--db', dbPath, '--json']);
      assert.strictEqual(jsonResult.status, 0, jsonResult.stderr);
      const jsonPayload = parseJson(jsonResult.stdout);
      assert.strictEqual(jsonPayload.activeSessions.activeCount, 1);
      assert.strictEqual(jsonPayload.governance.pendingCount, 1);

      const humanResult = runNode(STATUS_SCRIPT, ['--db', dbPath]);
      assert.strictEqual(humanResult.status, 0, humanResult.stderr);
      assert.match(humanResult.stdout, /Active sessions: 1/);
      assert.match(humanResult.stdout, /Skill runs \(last 20\):/);
      assert.match(humanResult.stdout, /Install health: healthy/);
      assert.match(humanResult.stdout, /Pending governance events: 1/);
    } finally {
      cleanupTempDir(testDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('sessions CLI supports list and detail views in human-readable and --json output', async () => {
    const testDir = createTempDir('ecc-state-cli-');
    const dbPath = path.join(testDir, 'state.db');

    try {
      await seedStore(dbPath);

      const listJsonResult = runNode(SESSIONS_SCRIPT, ['--db', dbPath, '--json']);
      assert.strictEqual(listJsonResult.status, 0, listJsonResult.stderr);
      const listPayload = parseJson(listJsonResult.stdout);
      assert.strictEqual(listPayload.totalCount, 2);
      assert.strictEqual(listPayload.sessions[0].id, 'session-active');

      const detailJsonResult = runNode(SESSIONS_SCRIPT, ['session-active', '--db', dbPath, '--json']);
      assert.strictEqual(detailJsonResult.status, 0, detailJsonResult.stderr);
      const detailPayload = parseJson(detailJsonResult.stdout);
      assert.strictEqual(detailPayload.session.id, 'session-active');
      assert.strictEqual(detailPayload.workers.length, 2);
      assert.strictEqual(detailPayload.skillRuns.length, 2);
      assert.strictEqual(detailPayload.decisions.length, 1);

      const detailHumanResult = runNode(SESSIONS_SCRIPT, ['session-active', '--db', dbPath]);
      assert.strictEqual(detailHumanResult.status, 0, detailHumanResult.stderr);
      assert.match(detailHumanResult.stdout, /Session: session-active/);
      assert.match(detailHumanResult.stdout, /Workers: 2/);
      assert.match(detailHumanResult.stdout, /Skill runs: 2/);
      assert.match(detailHumanResult.stdout, /Decisions: 1/);
    } finally {
      cleanupTempDir(testDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('ecc CLI delegates the new status and sessions subcommands', async () => {
    const testDir = createTempDir('ecc-state-cli-');
    const dbPath = path.join(testDir, 'state.db');

    try {
      await seedStore(dbPath);

      const statusResult = runNode(ECC_SCRIPT, ['status', '--db', dbPath, '--json']);
      assert.strictEqual(statusResult.status, 0, statusResult.stderr);
      const statusPayload = parseJson(statusResult.stdout);
      assert.strictEqual(statusPayload.activeSessions.activeCount, 1);

      const sessionsResult = runNode(ECC_SCRIPT, ['sessions', 'session-active', '--db', dbPath, '--json']);
      assert.strictEqual(sessionsResult.status, 0, sessionsResult.stderr);
      const sessionsPayload = parseJson(sessionsResult.stdout);
      assert.strictEqual(sessionsPayload.session.id, 'session-active');
      assert.strictEqual(sessionsPayload.skillRuns.length, 2);
    } finally {
      cleanupTempDir(testDir);
    }
  })) passed += 1; else failed += 1;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
