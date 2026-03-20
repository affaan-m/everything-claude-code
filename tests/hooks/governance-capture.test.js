/**
 * Tests for scripts/hooks/governance-capture.js
 *
 * Run with: node tests/hooks/governance-capture.test.js
 */

const assert = require('assert');

const {
  detectSecrets,
  detectApprovalRequired,
  detectSensitivePath,
  analyzeForGovernanceEvents,
  generateEventId,
  run,
} = require('../../scripts/hooks/governance-capture');

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

function runTests() {
  console.log('\n=== Testing governance-capture ===\n');

  let passed = 0;
  let failed = 0;

  // --- detectSecrets ---

  if (test('detectSecrets finds AWS access keys', () => {
    const findings = detectSecrets('My key is AKIAIOSFODNN7EXAMPLE');
    assert.strictEqual(findings.length, 1);
    assert.strictEqual(findings[0].name, 'aws_key');
  })) passed++; else failed++;

  if (test('detectSecrets finds generic secrets', () => {
    const findings = detectSecrets('api_key = "sk-proj-abcdefgh12345678"');
    assert.strictEqual(findings.length, 1);
    assert.strictEqual(findings[0].name, 'generic_secret');
  })) passed++; else failed++;

  if (test('detectSecrets finds private keys', () => {
    const findings = detectSecrets('-----BEGIN RSA PRIVATE KEY-----\nfoo');
    assert.strictEqual(findings.length, 1);
    assert.strictEqual(findings[0].name, 'private_key');
  })) passed++; else failed++;

  if (test('detectSecrets finds GitHub tokens', () => {
    const findings = detectSecrets('token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij');
    assert.strictEqual(findings.length, 1);
    assert.strictEqual(findings[0].name, 'github_token');
  })) passed++; else failed++;

  if (test('detectSecrets returns empty array for clean text', () => {
    const findings = detectSecrets('Just a normal string with no secrets');
    assert.strictEqual(findings.length, 0);
  })) passed++; else failed++;

  if (test('detectSecrets handles null and undefined', () => {
    assert.deepStrictEqual(detectSecrets(null), []);
    assert.deepStrictEqual(detectSecrets(undefined), []);
    assert.deepStrictEqual(detectSecrets(''), []);
  })) passed++; else failed++;

  // --- detectApprovalRequired ---

  if (test('detectApprovalRequired flags force push', () => {
    const findings = detectApprovalRequired('git push origin main --force');
    assert.ok(findings.length > 0);
  })) passed++; else failed++;

  if (test('detectApprovalRequired flags hard reset', () => {
    const findings = detectApprovalRequired('git reset --hard HEAD~3');
    assert.ok(findings.length > 0);
  })) passed++; else failed++;

  if (test('detectApprovalRequired flags rm -rf', () => {
    const findings = detectApprovalRequired('rm -rf /tmp/data');
    assert.ok(findings.length > 0);
  })) passed++; else failed++;

  if (test('detectApprovalRequired flags DROP TABLE', () => {
    const findings = detectApprovalRequired('DROP TABLE users');
    assert.ok(findings.length > 0);
  })) passed++; else failed++;

  if (test('detectApprovalRequired allows safe commands', () => {
    const findings = detectApprovalRequired('git push origin main');
    assert.strictEqual(findings.length, 0);
  })) passed++; else failed++;

  if (test('detectApprovalRequired handles null', () => {
    assert.deepStrictEqual(detectApprovalRequired(null), []);
    assert.deepStrictEqual(detectApprovalRequired(''), []);
  })) passed++; else failed++;

  // --- detectSensitivePath ---

  if (test('detectSensitivePath identifies .env files', () => {
    assert.strictEqual(detectSensitivePath('.env'), true);
    assert.strictEqual(detectSensitivePath('.env.local'), true);
    assert.strictEqual(detectSensitivePath('/app/.env.production'), true);
  })) passed++; else failed++;

  if (test('detectSensitivePath identifies credential files', () => {
    assert.strictEqual(detectSensitivePath('credentials.json'), true);
    assert.strictEqual(detectSensitivePath('/home/user/.ssh/id_rsa'), true);
    assert.strictEqual(detectSensitivePath('server.key'), true);
    assert.strictEqual(detectSensitivePath('cert.pem'), true);
  })) passed++; else failed++;

  if (test('detectSensitivePath returns false for normal files', () => {
    assert.strictEqual(detectSensitivePath('src/index.js'), false);
    assert.strictEqual(detectSensitivePath('package.json'), false);
    assert.strictEqual(detectSensitivePath('README.md'), false);
  })) passed++; else failed++;

  if (test('detectSensitivePath handles null', () => {
    assert.strictEqual(detectSensitivePath(null), false);
    assert.strictEqual(detectSensitivePath(''), false);
  })) passed++; else failed++;

  // --- analyzeForGovernanceEvents ---

  if (test('analyzeForGovernanceEvents detects secrets in tool input', () => {
    const events = analyzeForGovernanceEvents({
      tool_name: 'Write',
      tool_input: { content: 'AKIAIOSFODNN7EXAMPLE', file_path: 'config.js' },
    });
    const secretEvent = events.find(e => e.eventType === 'secret_detected');
    assert.ok(secretEvent, 'Should detect secret');
    assert.strictEqual(secretEvent.payload.severity, 'critical');
  })) passed++; else failed++;

  if (test('analyzeForGovernanceEvents detects approval-required commands', () => {
    const events = analyzeForGovernanceEvents({
      tool_name: 'Bash',
      tool_input: { command: 'git push origin main --force' },
    });
    const approvalEvent = events.find(e => e.eventType === 'approval_requested');
    assert.ok(approvalEvent, 'Should flag force push');
    assert.strictEqual(approvalEvent.payload.severity, 'high');
  })) passed++; else failed++;

  if (test('analyzeForGovernanceEvents detects sensitive file access', () => {
    const events = analyzeForGovernanceEvents({
      tool_name: 'Write',
      tool_input: { file_path: '.env.production', content: 'FOO=bar' },
    });
    const policyEvent = events.find(e => e.eventType === 'policy_violation');
    assert.ok(policyEvent, 'Should flag .env write');
    assert.strictEqual(policyEvent.payload.reason, 'sensitive_file_access');
  })) passed++; else failed++;

  if (test('analyzeForGovernanceEvents detects elevated privilege commands', () => {
    const events = analyzeForGovernanceEvents(
      { tool_name: 'Bash', tool_input: { command: 'sudo chmod 777 /etc/hosts' } },
      { hookPhase: 'post' }
    );
    const securityEvent = events.find(e => e.eventType === 'security_finding');
    assert.ok(securityEvent, 'Should flag elevated privilege');
    assert.strictEqual(securityEvent.payload.reason, 'elevated_privilege_command');
  })) passed++; else failed++;

  if (test('analyzeForGovernanceEvents returns empty for clean inputs', () => {
    const events = analyzeForGovernanceEvents({
      tool_name: 'Read',
      tool_input: { file_path: 'src/index.js' },
    });
    assert.strictEqual(events.length, 0);
  })) passed++; else failed++;

  if (test('analyzeForGovernanceEvents populates session ID from context', () => {
    const events = analyzeForGovernanceEvents(
      { tool_name: 'Write', tool_input: { file_path: '.env', content: 'x' } },
      { sessionId: 'sess-123' }
    );
    assert.ok(events.length > 0);
    assert.strictEqual(events[0].sessionId, 'sess-123');
  })) passed++; else failed++;

  if (test('analyzeForGovernanceEvents generates unique event IDs', () => {
    // Write to .env with a secret triggers both secret_detected + policy_violation
    const events = analyzeForGovernanceEvents({
      tool_name: 'Write',
      tool_input: { file_path: '.env', content: 'AWS_KEY=AKIAIOSFODNN7EXAMPLE' },
    });
    assert.ok(events.length >= 2, `Expected >= 2 events, got ${events.length}`);
    const ids = events.map(e => e.id);
    const uniqueIds = new Set(ids);
    assert.strictEqual(ids.length, uniqueIds.size, 'All event IDs should be unique');
  })) passed++; else failed++;

  // --- generateEventId ---

  if (test('generateEventId produces gov- prefixed unique IDs', () => {
    const id1 = generateEventId();
    const id2 = generateEventId();
    assert.ok(id1.startsWith('gov-'));
    assert.notStrictEqual(id1, id2);
  })) passed++; else failed++;

  // --- run() ---

  if (test('run() passes through input when feature flag is off', () => {
    const original = process.env.ECC_GOVERNANCE_CAPTURE;
    delete process.env.ECC_GOVERNANCE_CAPTURE;
    const input = JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'rm -rf /' } });
    const result = run(input);
    assert.strictEqual(result, input);
    if (original !== undefined) process.env.ECC_GOVERNANCE_CAPTURE = original;
  })) passed++; else failed++;

  if (test('run() passes through input when feature flag is on', () => {
    const original = process.env.ECC_GOVERNANCE_CAPTURE;
    process.env.ECC_GOVERNANCE_CAPTURE = '1';
    const input = JSON.stringify({ tool_name: 'Read', tool_input: { file_path: 'foo.js' } });
    const result = run(input);
    assert.strictEqual(result, input, 'Should always pass through original input');
    if (original !== undefined) {
      process.env.ECC_GOVERNANCE_CAPTURE = original;
    } else {
      delete process.env.ECC_GOVERNANCE_CAPTURE;
    }
  })) passed++; else failed++;

  if (test('run() handles invalid JSON gracefully', () => {
    const original = process.env.ECC_GOVERNANCE_CAPTURE;
    process.env.ECC_GOVERNANCE_CAPTURE = '1';
    const input = 'not valid json{{{';
    const result = run(input);
    assert.strictEqual(result, input, 'Should pass through invalid JSON without crashing');
    if (original !== undefined) {
      process.env.ECC_GOVERNANCE_CAPTURE = original;
    } else {
      delete process.env.ECC_GOVERNANCE_CAPTURE;
    }
  })) passed++; else failed++;

  if (test('run() detects multiple event types in one input', () => {
    const original = process.env.ECC_GOVERNANCE_CAPTURE;
    process.env.ECC_GOVERNANCE_CAPTURE = '1';
    // Write to .env with an AWS key triggers secret_detected + policy_violation
    const input = JSON.stringify({
      tool_name: 'Write',
      tool_input: { file_path: '.env.production', content: 'KEY=AKIAIOSFODNN7EXAMPLE' },
    });
    // Capture stderr output
    const stderrChunks = [];
    const originalWrite = process.stderr.write;
    process.stderr.write = (chunk) => { stderrChunks.push(chunk); return true; };
    const result = run(input);
    process.stderr.write = originalWrite;
    assert.strictEqual(result, input);
    // Should have written governance events to stderr
    const governanceLines = stderrChunks.filter(c => c.includes('[governance]'));
    assert.ok(governanceLines.length >= 2, `Expected >= 2 governance lines, got ${governanceLines.length}`);
    if (original !== undefined) {
      process.env.ECC_GOVERNANCE_CAPTURE = original;
    } else {
      delete process.env.ECC_GOVERNANCE_CAPTURE;
    }
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
