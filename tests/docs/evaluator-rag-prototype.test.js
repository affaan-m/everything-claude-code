'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const fixtureRoot = path.join(repoRoot, 'examples', 'evaluator-rag-prototype');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    failed++;
  }
}

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(fixtureRoot, fileName), 'utf8'));
}

console.log('\n=== Testing evaluator RAG prototype ===\n');

test('architecture doc records the artifact contract and reference pressure', () => {
  const source = read('docs/architecture/evaluator-rag-prototype.md');

  for (const required of [
    'Scenario spec',
    'Trace',
    'Report',
    'Candidate playbook',
    'Verifier result',
    'Meta-Harness',
    'Autocontext',
    'Claude HUD',
    'Hermes Agent',
    'dmux, Orca, Superset, and Ghast',
    'ECC Tools'
  ]) {
    assert.ok(source.includes(required), `Missing doc requirement: ${required}`);
  }
});

test('fixtures use one scenario id and declare read-only behavior', () => {
  const scenario = readJson('scenario.json');
  const trace = readJson('trace.json');
  const report = readJson('report.json');
  const verifier = readJson('verifier-result.json');

  assert.strictEqual(scenario.schema_version, 'ecc.evaluator-rag.scenario.v1');
  assert.strictEqual(trace.schema_version, 'ecc.evaluator-rag.trace.v1');
  assert.strictEqual(report.schema_version, 'ecc.evaluator-rag.report.v1');
  assert.strictEqual(verifier.schema_version, 'ecc.evaluator-rag.verifier.v1');

  for (const artifact of [trace, report, verifier]) {
    assert.strictEqual(artifact.scenario_id, scenario.scenario_id);
    assert.strictEqual(artifact.read_only, true);
  }
});

test('trace covers the full self-improving harness loop', () => {
  const trace = readJson('trace.json');
  const phases = trace.events.map(event => event.phase);

  for (const phase of ['observation', 'retrieval', 'proposal', 'verification', 'promotion']) {
    assert.ok(phases.includes(phase), `Missing trace phase ${phase}`);
  }

  assert.ok(trace.events.some(event => event.promoted_candidate_id === 'maintainer-salvage-branch'));
});

test('scenario blocks unsafe write actions and release actions', () => {
  const scenario = readJson('scenario.json');
  const forbidden = scenario.forbidden_actions.join('\n');

  for (const blocked of [
    'closing, reopening, or commenting on PRs',
    'merging PRs',
    'creating release tags',
    'publishing packages or plugins',
    'copying private paths, secrets, or raw personal context',
    'blindly cherry-picking bulk localization'
  ]) {
    assert.ok(forbidden.includes(blocked), `Missing forbidden action: ${blocked}`);
  }
});

test('verifier accepts maintainer salvage and rejects blind translation imports', () => {
  const verifier = readJson('verifier-result.json');
  const accepted = verifier.candidates.find(candidate => candidate.candidate_id === 'maintainer-salvage-branch');
  const rejected = verifier.candidates.find(candidate => candidate.candidate_id === 'blind-cherry-pick-translations');

  assert.ok(accepted, 'Missing accepted maintainer salvage candidate');
  assert.ok(rejected, 'Missing rejected blind cherry-pick candidate');
  assert.strictEqual(accepted.decision, 'accepted');
  assert.strictEqual(rejected.decision, 'rejected');
  assert.strictEqual(verifier.promoted_candidate_id, accepted.candidate_id);
  assert.ok(accepted.score > rejected.score);
  assert.ok(rejected.reasons.join('\n').includes('translator/manual review'));
});

test('candidate playbook preserves stale-salvage operating rules', () => {
  const playbook = read('examples/evaluator-rag-prototype/candidate-playbook.md');

  for (const required of [
    'docs/stale-pr-salvage-ledger.md',
    'source PR',
    'maintainer-owned branch',
    'Preserve attribution',
    'translator/manual review',
    'private operator context',
    'git diff --check'
  ]) {
    assert.ok(playbook.includes(required), `Missing playbook rule: ${required}`);
  }
});

test('roadmap points to the evaluator RAG prototype and keeps broader corpus work open', () => {
  const roadmap = read('docs/ECC-2.0-GA-ROADMAP.md');

  assert.ok(roadmap.includes('docs/architecture/evaluator-rag-prototype.md'));
  assert.ok(roadmap.includes('examples/evaluator-rag-prototype/'));
  assert.ok(roadmap.includes('Needs broader evaluator corpus'));
});

if (failed > 0) {
  console.log(`\nFailed: ${failed}`);
  process.exit(1);
}

console.log(`\nPassed: ${passed}`);
