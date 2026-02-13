/**
 * Tests for scripts/hooks/evaluate-session.js
 *
 * Tests the session evaluation threshold logic, config loading,
 * and stdin parsing. Uses temporary JSONL transcript files.
 *
 * Run with: node tests/hooks/evaluate-session.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawnSync, execFileSync } = require('child_process');

const evaluateScript = path.join(__dirname, '..', '..', 'scripts', 'hooks', 'evaluate-session.js');

// Test helpers
function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
    return true;
  } catch (err) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

function createTestDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'eval-session-test-'));
}

function cleanupTestDir(testDir) {
  fs.rmSync(testDir, { recursive: true, force: true });
}

/**
 * Create a JSONL transcript file with N user messages.
 * Each line is a JSON object with `"type":"user"`.
 */
function createTranscript(dir, messageCount) {
  const filePath = path.join(dir, 'transcript.jsonl');
  const lines = [];
  for (let i = 0; i < messageCount; i++) {
    lines.push(JSON.stringify({ type: 'user', content: `Message ${i + 1}` }));
    // Intersperse assistant messages to be realistic
    lines.push(JSON.stringify({ type: 'assistant', content: `Response ${i + 1}` }));
  }
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
  return filePath;
}

/**
 * Run evaluate-session.js with stdin providing the transcript_path.
 * Uses spawnSync to capture both stdout and stderr regardless of exit code.
 * Returns { code, stdout, stderr }.
 */
function runEvaluate(stdinJson) {
  const result = spawnSync('node', [evaluateScript], {
    encoding: 'utf8',
    input: JSON.stringify(stdinJson),
    timeout: 10000,
  });
  return {
    code: result.status || 0,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

function runTests() {
  console.log('\n=== Testing evaluate-session.js ===\n');

  let passed = 0;
  let failed = 0;

  // Threshold boundary tests (default minSessionLength = 10)
  console.log('Threshold boundary (default min=10):');

  if (test('skips session with 9 user messages (below threshold)', () => {
    const testDir = createTestDir();
    const transcript = createTranscript(testDir, 9);
    const result = runEvaluate({ transcript_path: transcript });
    assert.strictEqual(result.code, 0, 'Should exit 0');
    // "too short" message should appear in stderr (log goes to stderr)
    assert.ok(
      result.stderr.includes('too short') || result.stderr.includes('9 messages'),
      'Should indicate session too short'
    );
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('evaluates session with exactly 10 user messages (at threshold)', () => {
    const testDir = createTestDir();
    const transcript = createTranscript(testDir, 10);
    const result = runEvaluate({ transcript_path: transcript });
    assert.strictEqual(result.code, 0, 'Should exit 0');
    // Should NOT say "too short" — should say "evaluate for extractable patterns"
    assert.ok(!result.stderr.includes('too short'), 'Should NOT say too short at threshold');
    assert.ok(
      result.stderr.includes('10 messages') || result.stderr.includes('evaluate'),
      'Should indicate evaluation'
    );
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('evaluates session with 11 user messages (above threshold)', () => {
    const testDir = createTestDir();
    const transcript = createTranscript(testDir, 11);
    const result = runEvaluate({ transcript_path: transcript });
    assert.strictEqual(result.code, 0);
    assert.ok(!result.stderr.includes('too short'), 'Should NOT say too short');
    assert.ok(result.stderr.includes('evaluate'), 'Should trigger evaluation');
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  // Edge cases
  console.log('\nEdge cases:');

  if (test('exits 0 with missing transcript_path', () => {
    const result = runEvaluate({});
    assert.strictEqual(result.code, 0, 'Should exit 0 gracefully');
  })) passed++; else failed++;

  if (test('exits 0 with non-existent transcript file', () => {
    const result = runEvaluate({ transcript_path: '/nonexistent/path/transcript.jsonl' });
    assert.strictEqual(result.code, 0, 'Should exit 0 gracefully');
  })) passed++; else failed++;

  if (test('exits 0 with invalid stdin JSON', () => {
    // Pass raw string instead of JSON
    const result = spawnSync('node', [evaluateScript], {
      encoding: 'utf8',
      input: 'not valid json at all',
      timeout: 10000,
    });
    assert.strictEqual(result.status, 0, 'Should exit 0 even on bad stdin');
  })) passed++; else failed++;

  if (test('skips empty transcript file (0 user messages)', () => {
    const testDir = createTestDir();
    const filePath = path.join(testDir, 'empty.jsonl');
    fs.writeFileSync(filePath, '');
    const result = runEvaluate({ transcript_path: filePath });
    assert.strictEqual(result.code, 0);
    // 0 < 10, so should be "too short"
    assert.ok(
      result.stderr.includes('too short') || result.stderr.includes('0 messages'),
      'Empty transcript should be too short'
    );
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (test('counts only user messages (ignores assistant messages)', () => {
    const testDir = createTestDir();
    const filePath = path.join(testDir, 'mixed.jsonl');
    // 5 user messages + 50 assistant messages — should still be "too short"
    const lines = [];
    for (let i = 0; i < 5; i++) {
      lines.push(JSON.stringify({ type: 'user', content: `msg ${i}` }));
    }
    for (let i = 0; i < 50; i++) {
      lines.push(JSON.stringify({ type: 'assistant', content: `resp ${i}` }));
    }
    fs.writeFileSync(filePath, lines.join('\n') + '\n');

    const result = runEvaluate({ transcript_path: filePath });
    assert.strictEqual(result.code, 0);
    assert.ok(
      result.stderr.includes('too short') || result.stderr.includes('5 messages'),
      'Should count only user messages'
    );
    cleanupTestDir(testDir);
  })) passed++; else failed++;

  // Summary
  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
