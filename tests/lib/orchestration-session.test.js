'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  buildSessionSnapshot,
  loadWorkerSnapshots,
  parseWorkerHandoff,
  parseWorkerStatus,
  parseWorkerTask,
  resolveSnapshotTarget
} = require('../../scripts/lib/orchestration-session');

console.log('=== Testing orchestration-session.js ===\n');

let passed = 0;
let failed = 0;

function test(desc, fn) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${desc}: ${error.message}`);
    failed++;
  }
}

test('parseWorkerStatus extracts structured status fields', () => {
  const status = parseWorkerStatus([
    '# Status',
    '',
    '- State: completed',
    '- Updated: 2026-03-12T14:09:15Z',
    '- Branch: feature-branch',
    '- Worktree: `/tmp/worktree`',
    '',
    '- Handoff file: `/tmp/handoff.md`'
  ].join('\n'));

  assert.deepStrictEqual(status, {
    state: 'completed',
    updated: '2026-03-12T14:09:15Z',
    branch: 'feature-branch',
    worktree: '/tmp/worktree',
    taskFile: null,
    handoffFile: '/tmp/handoff.md'
  });
});

test('parseWorkerTask extracts objective and seeded overlays', () => {
  const task = parseWorkerTask([
    '# Worker Task',
    '',
    '## Seeded Local Overlays',
    '- `scripts/orchestrate-worktrees.js`',
    '- `commands/orchestrate.md`',
    '',
    '## Objective',
    'Verify seeded files and summarize status.'
  ].join('\n'));

  assert.deepStrictEqual(task.seedPaths, [
    'scripts/orchestrate-worktrees.js',
    'commands/orchestrate.md'
  ]);
  assert.strictEqual(task.objective, 'Verify seeded files and summarize status.');
});

test('parseWorkerHandoff extracts summary, validation, and risks', () => {
  const handoff = parseWorkerHandoff([
    '# Handoff',
    '',
    '## Summary',
    '- Worker completed successfully',
    '',
    '## Validation',
    '- Ran tests',
    '',
    '## Remaining Risks',
    '- No runtime screenshot'
  ].join('\n'));

  assert.deepStrictEqual(handoff.summary, ['Worker completed successfully']);
  assert.deepStrictEqual(handoff.validation, ['Ran tests']);
  assert.deepStrictEqual(handoff.remainingRisks, ['No runtime screenshot']);
});

test('parseWorkerHandoff also supports bold section headers', () => {
  const handoff = parseWorkerHandoff([
    '# Handoff',
    '',
    '**Summary**',
    '- Worker completed successfully',
    '',
    '**Validation**',
    '- Ran tests',
    '',
    '**Remaining Risks**',
    '- No runtime screenshot'
  ].join('\n'));

  assert.deepStrictEqual(handoff.summary, ['Worker completed successfully']);
  assert.deepStrictEqual(handoff.validation, ['Ran tests']);
  assert.deepStrictEqual(handoff.remainingRisks, ['No runtime screenshot']);
});

test('parseWorkerHandoff accepts legacy verification and follow-up headings', () => {
  const handoff = parseWorkerHandoff([
    '# Handoff',
    '',
    '## Summary',
    '- Worker completed successfully',
    '',
    '## Tests / Verification',
    '- Ran tests',
    '',
    '## Follow-ups',
    '- Re-run screenshots after deploy'
  ].join('\n'));

  assert.deepStrictEqual(handoff.summary, ['Worker completed successfully']);
  assert.deepStrictEqual(handoff.validation, ['Ran tests']);
  assert.deepStrictEqual(handoff.remainingRisks, ['Re-run screenshots after deploy']);
});

test('loadWorkerSnapshots reads coordination worker directories', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-orch-session-'));
  const coordinationDir = path.join(tempRoot, 'coordination');
  const workerDir = path.join(coordinationDir, 'seed-check');
  const proofDir = path.join(coordinationDir, 'proof');
  fs.mkdirSync(workerDir, { recursive: true });
  fs.mkdirSync(proofDir, { recursive: true });

  try {
    fs.writeFileSync(path.join(workerDir, 'status.md'), [
      '# Status',
      '',
      '- State: running',
      '- Branch: seed-branch',
      '- Worktree: `/tmp/seed-worktree`'
    ].join('\n'));
    fs.writeFileSync(path.join(workerDir, 'task.md'), [
      '# Worker Task',
      '',
      '## Objective',
      'Inspect seed paths.'
    ].join('\n'));
    fs.writeFileSync(path.join(workerDir, 'handoff.md'), [
      '# Handoff',
      '',
      '## Summary',
      '- Pending'
    ].join('\n'));

    const workers = loadWorkerSnapshots(coordinationDir);
    assert.strictEqual(workers.length, 1);
    assert.strictEqual(workers[0].workerSlug, 'seed-check');
    assert.strictEqual(workers[0].status.branch, 'seed-branch');
    assert.strictEqual(workers[0].task.objective, 'Inspect seed paths.');
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('buildSessionSnapshot merges tmux panes with worker metadata', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-orch-snapshot-'));
  const coordinationDir = path.join(tempRoot, 'coordination');
  const workerDir = path.join(coordinationDir, 'seed-check');
  fs.mkdirSync(workerDir, { recursive: true });

  try {
    fs.writeFileSync(path.join(workerDir, 'status.md'), '- State: completed\n- Branch: seed-branch\n');
    fs.writeFileSync(path.join(workerDir, 'task.md'), '## Objective\nInspect seed paths.\n');
    fs.writeFileSync(path.join(workerDir, 'handoff.md'), '## Summary\n- ok\n');

    const snapshot = buildSessionSnapshot({
      sessionName: 'workflow-visual-proof',
      coordinationDir,
      panes: [
        {
          paneId: '%95',
          windowIndex: 1,
          paneIndex: 2,
          title: 'seed-check',
          currentCommand: 'codex',
          currentPath: '/tmp/worktree',
          active: false,
          dead: false,
          pid: 1234
        }
      ]
    });

    assert.strictEqual(snapshot.sessionActive, true);
    assert.strictEqual(snapshot.workerCount, 1);
    assert.strictEqual(snapshot.workerStates.completed, 1);
    assert.strictEqual(snapshot.workers[0].pane.paneId, '%95');
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('resolveSnapshotTarget handles plan files and direct session names', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-orch-target-'));
  const repoRoot = path.join(tempRoot, 'repo');
  fs.mkdirSync(repoRoot, { recursive: true });
  const planPath = path.join(repoRoot, 'plan.json');
  fs.writeFileSync(planPath, JSON.stringify({
    sessionName: 'workflow-visual-proof',
    repoRoot,
    coordinationRoot: path.join(repoRoot, '.claude', 'orchestration')
  }));

  try {
    const fromPlan = resolveSnapshotTarget(planPath, repoRoot);
    assert.strictEqual(fromPlan.targetType, 'plan');
    assert.strictEqual(fromPlan.sessionName, 'workflow-visual-proof');

    const fromSession = resolveSnapshotTarget('workflow-visual-proof', repoRoot);
    assert.strictEqual(fromSession.targetType, 'session');
    assert.ok(fromSession.coordinationDir.endsWith(path.join('.orchestration', 'workflow-visual-proof')));
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('resolveSnapshotTarget normalizes plan session names and defaults to the repo name', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-orch-target-'));
  const repoRoot = path.join(tempRoot, 'My Repo');
  fs.mkdirSync(repoRoot, { recursive: true });

  const namedPlanPath = path.join(repoRoot, 'named-plan.json');
  const defaultPlanPath = path.join(repoRoot, 'default-plan.json');

  fs.writeFileSync(namedPlanPath, JSON.stringify({
    sessionName: 'Workflow Visual Proof',
    repoRoot
  }));
  fs.writeFileSync(defaultPlanPath, JSON.stringify({ repoRoot }));

  try {
    const namedPlan = resolveSnapshotTarget(namedPlanPath, repoRoot);
    assert.strictEqual(namedPlan.sessionName, 'workflow-visual-proof');
    assert.ok(namedPlan.coordinationDir.endsWith(path.join('.orchestration', 'workflow-visual-proof')));

    const defaultPlan = resolveSnapshotTarget(defaultPlanPath, repoRoot);
    assert.strictEqual(defaultPlan.sessionName, 'my-repo');
    assert.ok(defaultPlan.coordinationDir.endsWith(path.join('.orchestration', 'my-repo')));
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('resolveSnapshotTarget rejects malformed plan files and invalid config fields', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-orch-target-'));
  const repoRoot = path.join(tempRoot, 'repo');
  fs.mkdirSync(repoRoot, { recursive: true });

  const invalidJsonPath = path.join(repoRoot, 'invalid-json.json');
  const blankFieldsPath = path.join(repoRoot, 'blank-fields.json');
  const invalidSessionNamePath = path.join(repoRoot, 'invalid-session.json');
  const invalidRepoRootPath = path.join(repoRoot, 'invalid-repo-root.json');
  const invalidCoordinationRootPath = path.join(repoRoot, 'invalid-coordination-root.json');

  fs.writeFileSync(invalidJsonPath, '{not valid json');
  fs.writeFileSync(blankFieldsPath, JSON.stringify({
    sessionName: '   ',
    repoRoot: '   ',
    coordinationRoot: '   '
  }));
  fs.writeFileSync(invalidSessionNamePath, JSON.stringify({
    sessionName: 42,
    repoRoot
  }));
  fs.writeFileSync(invalidRepoRootPath, JSON.stringify({
    sessionName: 'workflow',
    repoRoot: ['not-a-string']
  }));
  fs.writeFileSync(invalidCoordinationRootPath, JSON.stringify({
    sessionName: 'workflow',
    repoRoot,
    coordinationRoot: false
  }));

  try {
    const blankFields = resolveSnapshotTarget(blankFieldsPath, repoRoot);
    assert.strictEqual(blankFields.sessionName, 'repo');
    assert.strictEqual(blankFields.repoRoot, repoRoot);
    assert.ok(blankFields.coordinationDir.endsWith(path.join('.orchestration', 'repo')));

    assert.throws(
      () => resolveSnapshotTarget(invalidJsonPath, repoRoot),
      /Invalid orchestration plan JSON/
    );
    assert.throws(
      () => resolveSnapshotTarget(invalidSessionNamePath, repoRoot),
      /sessionName must be a string when provided/
    );
    assert.throws(
      () => resolveSnapshotTarget(invalidRepoRootPath, repoRoot),
      /repoRoot must be a string when provided/
    );
    assert.throws(
      () => resolveSnapshotTarget(invalidCoordinationRootPath, repoRoot),
      /coordinationRoot must be a string when provided/
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
