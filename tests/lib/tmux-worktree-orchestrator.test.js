'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  slugify,
  renderTemplate,
  buildOrchestrationPlan,
  materializePlan,
  normalizeSeedPaths,
  overlaySeedPaths
} = require('../../scripts/lib/tmux-worktree-orchestrator');

console.log('=== Testing tmux-worktree-orchestrator.js ===\n');

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

console.log('Helpers:');
test('slugify normalizes mixed punctuation and casing', () => {
  assert.strictEqual(slugify('Feature Audit: Docs + Tmux'), 'feature-audit-docs-tmux');
});

test('renderTemplate replaces supported placeholders', () => {
  const rendered = renderTemplate('run {worker_name} in {worktree_path}', {
    worker_name: 'Docs Fixer',
    worktree_path: '/tmp/repo-worker'
  });
  assert.strictEqual(rendered, 'run Docs Fixer in /tmp/repo-worker');
});

test('renderTemplate rejects unknown placeholders', () => {
  assert.throws(
    () => renderTemplate('missing {unknown}', { worker_name: 'docs' }),
    /Unknown template variable/
  );
});

console.log('\nPlan generation:');
test('buildOrchestrationPlan creates worktrees, branches, and tmux commands', () => {
  const repoRoot = path.join('/tmp', 'ecc');
  const plan = buildOrchestrationPlan({
    repoRoot,
    sessionName: 'Skill Audit',
    baseRef: 'main',
    launcherCommand: 'codex exec --cwd {worktree_path_sh} --task-file {task_file_sh}',
    workers: [
      { name: 'Docs A', task: 'Fix skills 1-4' },
      { name: 'Docs B', task: 'Fix skills 5-8' }
    ]
  });

  assert.strictEqual(plan.sessionName, 'skill-audit');
  assert.strictEqual(plan.workerPlans.length, 2);
  assert.strictEqual(plan.workerPlans[0].branchName, 'orchestrator-skill-audit-docs-a');
  assert.strictEqual(plan.workerPlans[1].branchName, 'orchestrator-skill-audit-docs-b');
  assert.deepStrictEqual(
    plan.workerPlans[0].gitArgs.slice(0, 4),
    ['worktree', 'add', '-b', 'orchestrator-skill-audit-docs-a'],
    'Should create branch-backed worktrees'
  );
  assert.ok(
    plan.workerPlans[0].worktreePath.endsWith(path.join('ecc-skill-audit-docs-a')),
    'Should create sibling worktree path'
  );
  assert.ok(
    plan.workerPlans[0].taskFilePath.endsWith(path.join('.orchestration', 'skill-audit', 'docs-a', 'task.md')),
    'Should create per-worker task file'
  );
  assert.ok(
    plan.workerPlans[0].handoffFilePath.endsWith(path.join('.orchestration', 'skill-audit', 'docs-a', 'handoff.md')),
    'Should create per-worker handoff file'
  );
  assert.ok(
    plan.workerPlans[0].launchCommand.includes(plan.workerPlans[0].taskFilePath),
    'Launch command should interpolate task file'
  );
  assert.ok(
    plan.workerPlans[0].launchCommand.includes(plan.workerPlans[0].worktreePath),
    'Launch command should interpolate worktree path'
  );
  assert.ok(
    plan.tmuxCommands.some(command => command.args.includes('split-window')),
    'Should include tmux split commands'
  );
  assert.ok(
    plan.tmuxCommands.some(command => command.args.includes('select-layout')),
    'Should include tiled layout command'
  );
});

test('buildOrchestrationPlan requires at least one worker', () => {
  assert.throws(
    () => buildOrchestrationPlan({
      repoRoot: '/tmp/ecc',
      sessionName: 'empty',
      launcherCommand: 'codex exec --task-file {task_file}',
      workers: []
    }),
    /at least one worker/
  );
});

test('buildOrchestrationPlan normalizes global and worker seed paths', () => {
  const plan = buildOrchestrationPlan({
    repoRoot: '/tmp/ecc',
    sessionName: 'seeded',
    launcherCommand: 'echo run',
    seedPaths: ['scripts/orchestrate-worktrees.js', './.claude/plan/workflow-e2e-test.json'],
    workers: [
      {
        name: 'Docs',
        task: 'Update docs',
        seedPaths: ['commands/multi-workflow.md']
      }
    ]
  });

  assert.deepStrictEqual(plan.workerPlans[0].seedPaths, [
    'scripts/orchestrate-worktrees.js',
    '.claude/plan/workflow-e2e-test.json',
    'commands/multi-workflow.md'
  ]);
});

test('buildOrchestrationPlan rejects worker names that collapse to the same slug', () => {
  assert.throws(
    () => buildOrchestrationPlan({
      repoRoot: '/tmp/ecc',
      sessionName: 'duplicates',
      launcherCommand: 'echo run',
      workers: [
        { name: 'Docs A', task: 'Fix skill docs' },
        { name: 'Docs/A', task: 'Fix tests' }
      ]
    }),
    /unique slugs/
  );
});

test('buildOrchestrationPlan exposes shell-safe launcher aliases alongside raw defaults', () => {
  const repoRoot = path.join('/tmp', 'My Repo');
  const plan = buildOrchestrationPlan({
    repoRoot,
    sessionName: 'Spacing Audit',
    launcherCommand: 'bash {repo_root_sh}/scripts/orchestrate-codex-worker.sh {task_file_sh} {handoff_file_sh} {status_file_sh} {worker_name_sh} {worker_name}',
    workers: [{ name: 'Docs Fixer', task: 'Update docs' }]
  });
  const quote = value => `'${String(value).replace(/'/g, `'\\''`)}'`;
  const resolvedRepoRoot = plan.workerPlans[0].repoRoot;

  assert.ok(
    plan.workerPlans[0].launchCommand.includes(`bash ${quote(resolvedRepoRoot)}/scripts/orchestrate-codex-worker.sh`),
    'repo_root_sh should provide a shell-safe path'
  );
  assert.ok(
    plan.workerPlans[0].launchCommand.includes(quote(plan.workerPlans[0].taskFilePath)),
    'task_file_sh should provide a shell-safe path'
  );
  assert.ok(
    plan.workerPlans[0].launchCommand.includes(`${quote(plan.workerPlans[0].workerName)} ${plan.workerPlans[0].workerName}`),
    'raw defaults should remain available alongside shell-safe aliases'
  );
});

test('normalizeSeedPaths rejects paths outside the repo root', () => {
  assert.throws(
    () => normalizeSeedPaths(['../outside.txt'], '/tmp/ecc'),
    /inside repoRoot/
  );
});

test('normalizeSeedPaths rejects repo root and git metadata paths', () => {
  assert.throws(
    () => normalizeSeedPaths(['.'], '/tmp/ecc'),
    /must not target the repo root/
  );
  assert.throws(
    () => normalizeSeedPaths(['.git/config'], '/tmp/ecc'),
    /must not target git metadata/
  );
});

test('materializePlan keeps worker instructions inside the worktree boundary', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-orchestrator-test-'));

  try {
    const plan = buildOrchestrationPlan({
      repoRoot: tempRoot,
      coordinationRoot: path.join(tempRoot, '.claude', 'orchestration'),
      sessionName: 'Workflow E2E',
      launcherCommand: 'bash {repo_root_sh}/scripts/orchestrate-codex-worker.sh {task_file_sh} {handoff_file_sh} {status_file_sh}',
      workers: [{ name: 'Docs', task: 'Update the workflow docs.' }]
    });

    materializePlan(plan);

    const taskFile = fs.readFileSync(plan.workerPlans[0].taskFilePath, 'utf8');
    const handoffFile = fs.readFileSync(plan.workerPlans[0].handoffFilePath, 'utf8');

    assert.ok(
      taskFile.includes('Report results in your final response.'),
      'Task file should tell the worker to report in stdout'
    );
    assert.ok(
      taskFile.includes('## Summary') &&
      taskFile.includes('## Validation') &&
      taskFile.includes('## Remaining Risks'),
      'Task file should require parser-compatible headings'
    );
    assert.ok(
      taskFile.includes('Do not spawn subagents or external agents for this task.'),
      'Task file should keep nested workers single-session'
    );
    assert.ok(
      !taskFile.includes('Write results and handoff notes to'),
      'Task file should not require writing handoff files outside the worktree'
    );
    assert.ok(
      !taskFile.includes('Update `'),
      'Task file should not instruct the nested worker to update orchestration status files'
    );
    assert.ok(
      handoffFile.includes('## Summary') &&
      handoffFile.includes('## Validation') &&
      handoffFile.includes('## Remaining Risks'),
      'Handoff placeholder should seed parser-compatible headings'
    );
    assert.ok(
      !handoffFile.includes('## Files Changed') &&
      !handoffFile.includes('## Tests / Verification') &&
      !handoffFile.includes('## Follow-ups'),
      'Handoff placeholder should not use legacy headings'
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('overlaySeedPaths copies local overlays into the worker worktree', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-orchestrator-overlay-'));
  const repoRoot = path.join(tempRoot, 'repo');
  const worktreePath = path.join(tempRoot, 'worktree');

  try {
    fs.mkdirSync(path.join(repoRoot, 'scripts'), { recursive: true });
    fs.mkdirSync(path.join(repoRoot, '.claude', 'plan'), { recursive: true });
    fs.mkdirSync(path.join(worktreePath, 'scripts'), { recursive: true });

    fs.writeFileSync(
      path.join(repoRoot, 'scripts', 'orchestrate-worktrees.js'),
      'local-version\n',
      'utf8'
    );
    fs.writeFileSync(
      path.join(repoRoot, '.claude', 'plan', 'workflow-e2e-test.json'),
      '{"seeded":true}\n',
      'utf8'
    );
    fs.writeFileSync(
      path.join(worktreePath, 'scripts', 'orchestrate-worktrees.js'),
      'head-version\n',
      'utf8'
    );

    overlaySeedPaths({
      repoRoot,
      seedPaths: [
        'scripts/orchestrate-worktrees.js',
        '.claude/plan/workflow-e2e-test.json'
      ],
      worktreePath
    });

    assert.strictEqual(
      fs.readFileSync(path.join(worktreePath, 'scripts', 'orchestrate-worktrees.js'), 'utf8'),
      'local-version\n'
    );
    assert.strictEqual(
      fs.readFileSync(path.join(worktreePath, '.claude', 'plan', 'workflow-e2e-test.json'), 'utf8'),
      '{"seeded":true}\n'
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
