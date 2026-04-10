/**
 * Tests for inspection logic — pattern detection from failures.
 */

const assert = require('assert');

const {
  normalizeFailureReason,
  groupFailures,
  detectPatterns,
  generateReport,
  suggestAction,
  DEFAULT_FAILURE_THRESHOLD,
} = require('../../scripts/lib/inspection');

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

function makeSkillRun(overrides = {}) {
  return {
    id: overrides.id || `run-${Math.random().toString(36).slice(2, 8)}`,
    skillId: overrides.skillId || 'test-skill',
    skillVersion: overrides.skillVersion || '1.0.0',
    sessionId: overrides.sessionId || 'session-1',
    taskDescription: overrides.taskDescription || 'test task',
    outcome: overrides.outcome || 'failure',
    failureReason: overrides.failureReason || 'generic error',
    tokensUsed: overrides.tokensUsed || 500,
    durationMs: overrides.durationMs || 1000,
    userFeedback: overrides.userFeedback || null,
    createdAt: overrides.createdAt || '2026-03-15T08:00:00.000Z',
  };
}

async function runTests() {
  console.log('\n=== Testing inspection ===\n');

  let passed = 0;
  let failed = 0;

  if (await test('normalizeFailureReason strips timestamps and UUIDs', async () => {
    const normalized = normalizeFailureReason(
      'Error at 2026-03-15T08:00:00.000Z for id 550e8400-e29b-41d4-a716-446655440000'
    );
    assert.ok(!normalized.includes('2026'));
    assert.ok(!normalized.includes('550e8400'));
    assert.ok(normalized.includes('<timestamp>'));
    assert.ok(normalized.includes('<uuid>'));
  })) passed += 1; else failed += 1;

  if (await test('normalizeFailureReason strips file paths', async () => {
    const normalized = normalizeFailureReason('File not found: /usr/local/bin/node');
    assert.ok(!normalized.includes('/usr/local'));
    assert.ok(normalized.includes('<path>'));
  })) passed += 1; else failed += 1;

  if (await test('normalizeFailureReason handles null and empty values', async () => {
    assert.strictEqual(normalizeFailureReason(null), 'unknown');
    assert.strictEqual(normalizeFailureReason(''), 'unknown');
    assert.strictEqual(normalizeFailureReason(undefined), 'unknown');
  })) passed += 1; else failed += 1;

  if (await test('groupFailures groups by skillId and normalized reason', async () => {
    const runs = [
      makeSkillRun({ id: 'r1', skillId: 'skill-a', failureReason: 'timeout' }),
      makeSkillRun({ id: 'r2', skillId: 'skill-a', failureReason: 'timeout' }),
      makeSkillRun({ id: 'r3', skillId: 'skill-b', failureReason: 'parse error' }),
      makeSkillRun({ id: 'r4', skillId: 'skill-a', outcome: 'success' }), // should be excluded
    ];

    const groups = groupFailures(runs);
    assert.strictEqual(groups.size, 2);

    const skillAGroup = groups.get('skill-a::timeout');
    assert.ok(skillAGroup);
    assert.strictEqual(skillAGroup.runs.length, 2);

    const skillBGroup = groups.get('skill-b::parse error');
    assert.ok(skillBGroup);
    assert.strictEqual(skillBGroup.runs.length, 1);
  })) passed += 1; else failed += 1;

  if (await test('groupFailures handles mixed outcome casing', async () => {
    const runs = [
      makeSkillRun({ id: 'r1', outcome: 'FAILURE', failureReason: 'timeout' }),
      makeSkillRun({ id: 'r2', outcome: 'Failed', failureReason: 'timeout' }),
      makeSkillRun({ id: 'r3', outcome: 'error', failureReason: 'timeout' }),
    ];

    const groups = groupFailures(runs);
    assert.strictEqual(groups.size, 1);
    const group = groups.values().next().value;
    assert.strictEqual(group.runs.length, 3);
  })) passed += 1; else failed += 1;

  if (await test('detectPatterns returns empty array when below threshold', async () => {
    const runs = [
      makeSkillRun({ id: 'r1', failureReason: 'timeout' }),
      makeSkillRun({ id: 'r2', failureReason: 'timeout' }),
    ];

    const patterns = detectPatterns(runs, { threshold: 3 });
    assert.strictEqual(patterns.length, 0);
  })) passed += 1; else failed += 1;

  if (await test('detectPatterns detects patterns at or above threshold', async () => {
    const runs = [
      makeSkillRun({ id: 'r1', failureReason: 'timeout', createdAt: '2026-03-15T08:00:00Z' }),
      makeSkillRun({ id: 'r2', failureReason: 'timeout', createdAt: '2026-03-15T08:01:00Z' }),
      makeSkillRun({ id: 'r3', failureReason: 'timeout', createdAt: '2026-03-15T08:02:00Z' }),
    ];

    const patterns = detectPatterns(runs, { threshold: 3 });
    assert.strictEqual(patterns.length, 1);
    assert.strictEqual(patterns[0].count, 3);
    assert.strictEqual(patterns[0].skillId, 'test-skill');
    assert.strictEqual(patterns[0].normalizedReason, 'timeout');
    assert.strictEqual(patterns[0].firstSeen, '2026-03-15T08:00:00Z');
    assert.strictEqual(patterns[0].lastSeen, '2026-03-15T08:02:00Z');
    assert.strictEqual(patterns[0].runIds.length, 3);
  })) passed += 1; else failed += 1;

  if (await test('detectPatterns uses default threshold', async () => {
    const runs = Array.from({ length: DEFAULT_FAILURE_THRESHOLD }, (_, i) =>
      makeSkillRun({ id: `r${i}`, failureReason: 'permission denied' })
    );

    const patterns = detectPatterns(runs);
    assert.strictEqual(patterns.length, 1);
  })) passed += 1; else failed += 1;

  if (await test('detectPatterns sorts by count descending', async () => {
    const runs = [
      // 4 timeouts
      ...Array.from({ length: 4 }, (_, i) =>
        makeSkillRun({ id: `t${i}`, skillId: 'skill-a', failureReason: 'timeout' })
      ),
      // 3 parse errors
      ...Array.from({ length: 3 }, (_, i) =>
        makeSkillRun({ id: `p${i}`, skillId: 'skill-b', failureReason: 'parse error' })
      ),
    ];

    const patterns = detectPatterns(runs, { threshold: 3 });
    assert.strictEqual(patterns.length, 2);
    assert.strictEqual(patterns[0].count, 4);
    assert.strictEqual(patterns[0].skillId, 'skill-a');
    assert.strictEqual(patterns[1].count, 3);
    assert.strictEqual(patterns[1].skillId, 'skill-b');
  })) passed += 1; else failed += 1;

  if (await test('detectPatterns groups similar failure reasons with different timestamps', async () => {
    const runs = [
      makeSkillRun({ id: 'r1', failureReason: 'Error at 2026-03-15T08:00:00Z in /tmp/foo' }),
      makeSkillRun({ id: 'r2', failureReason: 'Error at 2026-03-15T09:00:00Z in /tmp/bar' }),
      makeSkillRun({ id: 'r3', failureReason: 'Error at 2026-03-15T10:00:00Z in /tmp/baz' }),
    ];

    const patterns = detectPatterns(runs, { threshold: 3 });
    assert.strictEqual(patterns.length, 1);
    assert.ok(patterns[0].normalizedReason.includes('<timestamp>'));
    assert.ok(patterns[0].normalizedReason.includes('<path>'));
  })) passed += 1; else failed += 1;

  if (await test('detectPatterns tracks unique session IDs and versions', async () => {
    const runs = [
      makeSkillRun({ id: 'r1', sessionId: 'sess-1', skillVersion: '1.0.0', failureReason: 'err' }),
      makeSkillRun({ id: 'r2', sessionId: 'sess-2', skillVersion: '1.0.0', failureReason: 'err' }),
      makeSkillRun({ id: 'r3', sessionId: 'sess-1', skillVersion: '1.1.0', failureReason: 'err' }),
    ];

    const patterns = detectPatterns(runs, { threshold: 3 });
    assert.strictEqual(patterns.length, 1);
    assert.deepStrictEqual(patterns[0].sessionIds.sort(), ['sess-1', 'sess-2']);
    assert.deepStrictEqual(patterns[0].versions.sort(), ['1.0.0', '1.1.0']);
  })) passed += 1; else failed += 1;

  if (await test('generateReport returns clean status with no patterns', async () => {
    const report = generateReport([]);
    assert.strictEqual(report.status, 'clean');
    assert.strictEqual(report.patternCount, 0);
    assert.ok(report.summary.includes('No recurring'));
    assert.ok(report.generatedAt);
  })) passed += 1; else failed += 1;

  if (await test('generateReport produces structured report from patterns', async () => {
    const runs = [
      ...Array.from({ length: 3 }, (_, i) =>
        makeSkillRun({ id: `r${i}`, skillId: 'my-skill', failureReason: 'timeout' })
      ),
    ];
    const patterns = detectPatterns(runs, { threshold: 3 });
    const report = generateReport(patterns, { generatedAt: '2026-03-15T09:00:00Z' });

    assert.strictEqual(report.status, 'attention_needed');
    assert.strictEqual(report.patternCount, 1);
    assert.strictEqual(report.totalFailures, 3);
    assert.deepStrictEqual(report.affectedSkills, ['my-skill']);
    assert.strictEqual(report.patterns[0].skillId, 'my-skill');
    assert.ok(report.patterns[0].suggestedAction);
    assert.strictEqual(report.generatedAt, '2026-03-15T09:00:00Z');
  })) passed += 1; else failed += 1;

  if (await test('suggestAction returns timeout-specific advice', async () => {
    const action = suggestAction({ normalizedReason: 'timeout after 30s', versions: ['1.0.0'] });
    assert.ok(action.toLowerCase().includes('timeout'));
  })) passed += 1; else failed += 1;

  if (await test('suggestAction returns permission-specific advice', async () => {
    const action = suggestAction({ normalizedReason: 'permission denied', versions: ['1.0.0'] });
    assert.ok(action.toLowerCase().includes('permission'));
  })) passed += 1; else failed += 1;

  if (await test('suggestAction returns version-span advice when multiple versions affected', async () => {
    const action = suggestAction({ normalizedReason: 'something broke', versions: ['1.0.0', '1.1.0'] });
    assert.ok(action.toLowerCase().includes('version'));
  })) passed += 1; else failed += 1;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
