/**
 * Tests for scripts/gemini-adapt-agents.js
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'gemini-adapt-agents.js');
const { adaptContent } = require(SCRIPT);

function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
    return true;
  } catch (error) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function run(args = []) {
  try {
    const stdout = execFileSync('node', [SCRIPT, ...args], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000,
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

function runTests() {
  console.log('\n=== Testing gemini-adapt-agents.js ===\n');

  let passed = 0;
  let failed = 0;

  // adaptContent unit tests

  if (test('maps Read → read_file', () => {
    const input = '---\ntools: [Read]\n---\n';
    assert.ok(adaptContent(input).includes('"read_file"'));
  })) passed++; else failed++;

  if (test('maps Write → write_file', () => {
    const input = '---\ntools: [Write]\n---\n';
    assert.ok(adaptContent(input).includes('"write_file"'));
  })) passed++; else failed++;

  if (test('maps Edit → replace', () => {
    const input = '---\ntools: [Edit]\n---\n';
    assert.ok(adaptContent(input).includes('"replace"'));
  })) passed++; else failed++;

  if (test('maps Bash → run_shell_command', () => {
    const input = '---\ntools: [Bash]\n---\n';
    assert.ok(adaptContent(input).includes('"run_shell_command"'));
  })) passed++; else failed++;

  if (test('maps Grep → grep_search', () => {
    const input = '---\ntools: [Grep]\n---\n';
    assert.ok(adaptContent(input).includes('"grep_search"'));
  })) passed++; else failed++;

  if (test('maps WebSearch → google_web_search', () => {
    const input = '---\ntools: [WebSearch]\n---\n';
    assert.ok(adaptContent(input).includes('"google_web_search"'));
  })) passed++; else failed++;

  if (test('converts mcp__server__tool → mcp_server_tool', () => {
    const input = '---\ntools: [mcp__context7__query-docs]\n---\n';
    assert.ok(adaptContent(input).includes('"mcp_context7_query-docs"'));
  })) passed++; else failed++;

  if (test('converts double-underscore separators in MCP tool names', () => {
    const input = '---\ntools: [mcp__my__server__tool]\n---\n';
    assert.ok(adaptContent(input).includes('"mcp_my_server_tool"'));
  })) passed++; else failed++;

  if (test('removes color: key from frontmatter', () => {
    const input = '---\nname: test\ncolor: purple\n---\n# body\n';
    const result = adaptContent(input);
    assert.ok(!result.includes('color:'), 'color key should be removed');
    assert.ok(result.includes('name: test'), 'other keys preserved');
    assert.ok(result.includes('# body'), 'body preserved');
  })) passed++; else failed++;

  if (test('does not remove color: outside frontmatter', () => {
    const input = '---\nname: test\n---\n# body\ncolor: red is nice\n';
    const result = adaptContent(input);
    assert.ok(result.includes('color: red is nice'), 'body color line preserved');
  })) passed++; else failed++;

  if (test('keeps color: at EOF when frontmatter is unclosed', () => {
    const input = '---\nname: test\ncolor: blue';
    // No trailing newline — frontmatter regex won't match without closing ---,
    // but key removal inside matched block should handle EOF
    const result = adaptContent(input);
    // If frontmatter is unclosed, no change expected — input returned as-is
    assert.strictEqual(result, input);
  })) passed++; else failed++;

  if (test('is idempotent — already-adapted content unchanged', () => {
    const input = '---\nname: my-agent\ntools: ["read_file", "grep_search"]\n---\n# body\n';
    assert.strictEqual(adaptContent(input), input);
  })) passed++; else failed++;

  if (test('preserves quoted tool names', () => {
    const input = '---\ntools: ["Read", "Grep"]\n---\n';
    const result = adaptContent(input);
    assert.ok(result.includes('"read_file"'));
    assert.ok(result.includes('"grep_search"'));
  })) passed++; else failed++;

  if (test('handles mixed quoted and unquoted tools', () => {
    const input = '---\ntools: ["Read", Grep, Glob]\n---\n';
    const result = adaptContent(input);
    assert.ok(result.includes('"read_file"'));
    assert.ok(result.includes('"grep_search"'));
    assert.ok(result.includes('"glob"'));
  })) passed++; else failed++;

  if (test('does not alter model key', () => {
    const input = '---\nmodel: claude-opus-4-5\n---\n';
    assert.ok(adaptContent(input).includes('model: claude-opus-4-5'));
  })) passed++; else failed++;

  // CLI integration tests

  if (test('CLI errors on missing directory', () => {
    const missingDir = path.join(os.tmpdir(), 'gaa-nonexistent-' + Date.now());
    const result = run([missingDir]);
    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes('Directory not found'));
  })) passed++; else failed++;

  if (test('CLI writes adapted files and reports count', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gaa-test-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'agent.md'),
        '---\nname: test\ncolor: red\ntools: [Read]\n---\nbody\n');
      const result = run([tmpDir]);
      assert.strictEqual(result.code, 0);
      assert.ok(result.stdout.includes('fixed 1/1'));
      const content = fs.readFileSync(path.join(tmpDir, 'agent.md'), 'utf8');
      assert.ok(!content.includes('color:'));
      assert.ok(content.includes('"read_file"'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  if (test('CLI reports 0 changed for already-adapted files', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gaa-noop-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'agent.md'),
        '---\nname: test\ntools: ["read_file"]\n---\nbody\n');
      const result = run([tmpDir]);
      assert.strictEqual(result.code, 0);
      assert.ok(result.stdout.includes('fixed 0/1'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
