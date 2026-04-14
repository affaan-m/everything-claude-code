/**
 * Tests for scripts/hooks/gateguard-fact-force.js via run-with-flags.js
 */

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { sanitizeSessionId } = require('../../scripts/lib/utils');

const runner = path.join(__dirname, '..', '..', 'scripts', 'hooks', 'run-with-flags.js');
const externalStateDir = process.env.GATEGUARD_STATE_DIR;
const tmpRoot = process.env.TMPDIR || process.env.TEMP || process.env.TMP || '/tmp';
const stateDir = externalStateDir || fs.mkdtempSync(path.join(tmpRoot, 'gateguard-test-'));
const FALLBACK_PROJECT_DIR = '/tmp/ecc-gateguard-fallback-project';
const SHARED_PROJECT_DIR = '/tmp/ecc-gateguard-shared-project';
// Use a fixed session ID so test process and spawned hook process share the same state file
const TEST_SESSION_ID = 'gateguard-test-session';

function runHook(input, env = {}) {
  const rawInput = typeof input === 'string' ? input : JSON.stringify(input);
  const result = spawnSync('node', [
    runner,
    'pre:edit-write:gateguard-fact-force',
    'scripts/hooks/gateguard-fact-force.js',
    'standard,strict'
  ], {
    input: rawInput,
    encoding: 'utf8',
    env: {
      ...process.env,
      ECC_HOOK_PROFILE: 'standard',
      GATEGUARD_STATE_DIR: stateDir,
      CLAUDE_SESSION_ID: TEST_SESSION_ID,
      ...env
    },
    timeout: 15000,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  return {
    code: Number.isInteger(result.status) ? result.status : 1,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

function runBashHook(input, env = {}) {
  const rawInput = typeof input === 'string' ? input : JSON.stringify(input);
  const result = spawnSync('node', [
    runner,
    'pre:bash:gateguard-fact-force',
    'scripts/hooks/gateguard-fact-force.js',
    'standard,strict'
  ], {
    input: rawInput,
    encoding: 'utf8',
    env: {
      ...process.env,
      ECC_HOOK_PROFILE: 'standard',
      GATEGUARD_STATE_DIR: stateDir,
      CLAUDE_SESSION_ID: TEST_SESSION_ID,
      ...env
    },
    timeout: 15000,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  return {
    code: Number.isInteger(result.status) ? result.status : 1,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

function runBashHookWithoutSession(input, env = {}) {
  const rawInput = typeof input === 'string' ? input : JSON.stringify(input);
  const hookEnv = buildFallbackHookEnv(env);

  const result = spawnSync('node', [
    runner,
    'pre:bash:gateguard-fact-force',
    'scripts/hooks/gateguard-fact-force.js',
    'standard,strict'
  ], {
    input: rawInput,
    encoding: 'utf8',
    env: hookEnv,
    timeout: 15000,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  return {
    code: Number.isInteger(result.status) ? result.status : 1,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

function hashSessionKey(prefix, value) {
  return prefix + crypto.createHash('sha1').update(value).digest('hex').slice(0, 16);
}

function sessionIdForStateFile(sessionId) {
  const raw = String(sessionId || '');
  const sanitized = sanitizeSessionId(raw) || '';
  if (sanitized.length > 0 && sanitized.length <= 64) {
    return sanitized;
  }
  return hashSessionKey('sid-', raw || 'empty-session');
}

function buildFallbackHookEnv(env = {}) {
  const merged = {
    ...process.env,
    ECC_HOOK_PROFILE: 'standard',
    GATEGUARD_STATE_DIR: stateDir,
    CLAUDE_PROJECT_DIR: FALLBACK_PROJECT_DIR,
    ...env
  };

  const {
    CLAUDE_SESSION_ID: _claudeSessionId,
    ECC_SESSION_ID: _eccSessionId,
    CLAUDE_TRANSCRIPT_PATH: _claudeTranscriptPath,
    ...hookEnv
  } = merged;

  return hookEnv;
}

function sessionStateFile(sessionId) {
  return path.join(stateDir, `state-${sessionIdForStateFile(sessionId)}.json`);
}

const stateFile = sessionStateFile(TEST_SESSION_ID);

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function clearState(sessionId = TEST_SESSION_ID) {
  try {
    const target = sessionStateFile(sessionId);
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
    }
  } catch (err) {
    console.error(`  [clearState] failed to remove ${sessionStateFile(sessionId)}: ${err.message}`);
  }
}

function writeExpiredState() {
  try {
    fs.mkdirSync(stateDir, { recursive: true });
    const expired = {
      checked: ['some_file.js', '__bash_session__'],
      last_active: Date.now() - (31 * 60 * 1000) // 31 minutes ago
    };
    fs.writeFileSync(stateFile, JSON.stringify(expired), 'utf8');
  } catch (_) { /* ignore */ }
}

function writeState(state) {
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify(state), 'utf8');
}

function fallbackSessionId(env = {}) {
  if (env.CLAUDE_SESSION_ID) return env.CLAUDE_SESSION_ID;
  if (env.ECC_SESSION_ID) return env.ECC_SESSION_ID;
  if (env.CLAUDE_TRANSCRIPT_PATH) {
    return hashSessionKey('transcript-', env.CLAUDE_TRANSCRIPT_PATH);
  }

  const scope = env.CLAUDE_PROJECT_DIR || process.cwd();
  const parentFingerprint = [
    String(process.pid),
    env.CLAUDE_CODE_ENTRYPOINT || '',
    env.TMUX_PANE || env.TMUX || '',
    env.TERM_SESSION_ID || ''
  ].join('|');

  return hashSessionKey('fallback-', `${scope}::${parentFingerprint}`);
}

function runHookWithSessionId(input, sessionId, env = {}) {
  const rawInput = typeof input === 'string' ? input : JSON.stringify(input);
  const result = spawnSync('node', [
    runner,
    'pre:bash:gateguard-fact-force',
    'scripts/hooks/gateguard-fact-force.js',
    'standard,strict'
  ], {
    input: rawInput,
    encoding: 'utf8',
    env: {
      ...process.env,
      ECC_HOOK_PROFILE: 'standard',
      GATEGUARD_STATE_DIR: stateDir,
      CLAUDE_SESSION_ID: sessionId,
      ...env
    },
    timeout: 15000,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  return {
    code: Number.isInteger(result.status) ? result.status : 1,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

function parseOutput(stdout) {
  try {
    return JSON.parse(stdout);
  } catch (_) {
    return null;
  }
}

function runTests() {
  console.log('\n=== Testing gateguard-fact-force ===\n');

  let passed = 0;
  let failed = 0;

  // --- Test 1: denies first Edit per file ---
  clearState();
  if (test('denies first Edit per file with fact-forcing message', () => {
    const input = {
      tool_name: 'Edit',
      tool_input: { file_path: '/src/app.js', old_string: 'foo', new_string: 'bar' }
    };
    const result = runHook(input);
    assert.strictEqual(result.code, 0, 'exit code should be 0');
    const output = parseOutput(result.stdout);
    assert.ok(output, 'should produce JSON output');
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'deny');
    assert.ok(output.hookSpecificOutput.permissionDecisionReason.includes('Fact-Forcing Gate'));
    assert.ok(output.hookSpecificOutput.permissionDecisionReason.includes('import/require'));
    assert.ok(output.hookSpecificOutput.permissionDecisionReason.includes('/src/app.js'));
  })) passed++; else failed++;

  // --- Test 2: allows second Edit on same file ---
  if (test('allows second Edit on same file (gate already passed)', () => {
    const input = {
      tool_name: 'Edit',
      tool_input: { file_path: '/src/app.js', old_string: 'foo', new_string: 'bar' }
    };
    const result = runHook(input);
    assert.strictEqual(result.code, 0, 'exit code should be 0');
    const output = parseOutput(result.stdout);
    assert.ok(output, 'should produce valid JSON output');
    // When allowed, the hook passes through the raw input (no hookSpecificOutput)
    // OR if hookSpecificOutput exists, it must not be deny
    if (output.hookSpecificOutput) {
      assert.notStrictEqual(output.hookSpecificOutput.permissionDecision, 'deny',
        'should not deny second edit on same file');
    } else {
      // Pass-through: output matches original input (allow)
      assert.strictEqual(output.tool_name, 'Edit', 'pass-through should preserve input');
    }
  })) passed++; else failed++;

  // --- Test 3: denies first Write per file ---
  clearState();
  if (test('denies first Write per file with fact-forcing message', () => {
    const input = {
      tool_name: 'Write',
      tool_input: { file_path: '/src/new-file.js', content: 'console.log("hello")' }
    };
    const result = runHook(input);
    assert.strictEqual(result.code, 0, 'exit code should be 0');
    const output = parseOutput(result.stdout);
    assert.ok(output, 'should produce JSON output');
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'deny');
    assert.ok(output.hookSpecificOutput.permissionDecisionReason.includes('creating'));
    assert.ok(output.hookSpecificOutput.permissionDecisionReason.includes('call this new file'));
  })) passed++; else failed++;

  // --- Test 4: denies destructive Bash, allows retry ---
  clearState();
  if (test('denies destructive Bash commands, allows retry after facts presented', () => {
    const input = {
      tool_name: 'Bash',
      tool_input: { command: 'rm -rf /important/data' }
    };

    // First call: should deny
    const result1 = runBashHook(input);
    assert.strictEqual(result1.code, 0, 'first call exit code should be 0');
    const output1 = parseOutput(result1.stdout);
    assert.ok(output1, 'first call should produce JSON output');
    assert.strictEqual(output1.hookSpecificOutput.permissionDecision, 'deny');
    assert.ok(output1.hookSpecificOutput.permissionDecisionReason.includes('Destructive'));
    assert.ok(output1.hookSpecificOutput.permissionDecisionReason.includes('rollback'));

    // Second call (retry after facts presented): should allow
    const result2 = runBashHook(input);
    assert.strictEqual(result2.code, 0, 'second call exit code should be 0');
    const output2 = parseOutput(result2.stdout);
    assert.ok(output2, 'second call should produce valid JSON output');
    if (output2.hookSpecificOutput) {
      assert.notStrictEqual(output2.hookSpecificOutput.permissionDecision, 'deny',
        'should not deny destructive bash retry after facts presented');
    } else {
      assert.strictEqual(output2.tool_name, 'Bash', 'pass-through should preserve input');
    }
  })) passed++; else failed++;

  // --- Test 5: denies first routine Bash, allows second ---
  clearState();
  if (test('denies first routine Bash, allows second', () => {
    const input = {
      tool_name: 'Bash',
      tool_input: { command: 'ls -la' }
    };

    // First call: should deny
    const result1 = runBashHook(input);
    assert.strictEqual(result1.code, 0, 'first call exit code should be 0');
    const output1 = parseOutput(result1.stdout);
    assert.ok(output1, 'first call should produce JSON output');
    assert.strictEqual(output1.hookSpecificOutput.permissionDecision, 'deny');

    // Second call: should allow
    const result2 = runBashHook(input);
    assert.strictEqual(result2.code, 0, 'second call exit code should be 0');
    const output2 = parseOutput(result2.stdout);
    assert.ok(output2, 'second call should produce valid JSON output');
    if (output2.hookSpecificOutput) {
      assert.notStrictEqual(output2.hookSpecificOutput.permissionDecision, 'deny',
        'should not deny second routine bash');
    } else {
      assert.strictEqual(output2.tool_name, 'Bash', 'pass-through should preserve input');
    }
  })) passed++; else failed++;

  // --- Test 6: session state resets after timeout ---
  if (test('session state resets after 30-minute timeout', () => {
    writeExpiredState();
    const input = {
      tool_name: 'Edit',
      tool_input: { file_path: 'some_file.js', old_string: 'a', new_string: 'b' }
    };
    const result = runHook(input);
    assert.strictEqual(result.code, 0, 'exit code should be 0');
    const output = parseOutput(result.stdout);
    assert.ok(output, 'should produce JSON output after expired state');
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'deny',
      'should deny again after session timeout (state was reset)');
  })) passed++; else failed++;

  // --- Test 7: allows unknown tool names ---
  clearState();
  if (test('allows unknown tool names through', () => {
    const input = {
      tool_name: 'Read',
      tool_input: { file_path: '/src/app.js' }
    };
    const result = runHook(input);
    assert.strictEqual(result.code, 0, 'exit code should be 0');
    const output = parseOutput(result.stdout);
    assert.ok(output, 'should produce valid JSON output');
    if (output.hookSpecificOutput) {
      assert.notStrictEqual(output.hookSpecificOutput.permissionDecision, 'deny',
        'should not deny unknown tool');
    } else {
      assert.strictEqual(output.tool_name, 'Read', 'pass-through should preserve input');
    }
  })) passed++; else failed++;

  // --- Test 8: sanitizes file paths with newlines ---
  clearState();
  if (test('sanitizes file paths containing newlines', () => {
    const input = {
      tool_name: 'Edit',
      tool_input: { file_path: '/src/app.js\ninjected content', old_string: 'a', new_string: 'b' }
    };
    const result = runHook(input);
    assert.strictEqual(result.code, 0, 'exit code should be 0');
    const output = parseOutput(result.stdout);
    assert.ok(output, 'should produce JSON output');
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'deny');
    const reason = output.hookSpecificOutput.permissionDecisionReason;
    // The file path portion of the reason must not contain any raw newlines
    // (sanitizePath replaces \n and \r with spaces)
    const pathLine = reason.split('\n').find(l => l.includes('/src/app.js'));
    assert.ok(pathLine, 'reason should mention the file path');
    assert.ok(!pathLine.includes('\n'), 'file path line must not contain raw newlines');
    assert.ok(!reason.includes('/src/app.js\n'), 'newline after file path should be sanitized');
    assert.ok(!reason.includes('\ninjected'), 'injected content must not appear on its own line');
  })) passed++; else failed++;

  // --- Test 9: respects ECC_DISABLED_HOOKS ---
  clearState();
  if (test('respects ECC_DISABLED_HOOKS (skips when disabled)', () => {
    const input = {
      tool_name: 'Edit',
      tool_input: { file_path: '/src/disabled.js', old_string: 'a', new_string: 'b' }
    };
    const result = runHook(input, {
      ECC_DISABLED_HOOKS: 'pre:edit-write:gateguard-fact-force'
    });

    assert.strictEqual(result.code, 0, 'exit code should be 0');
    const output = parseOutput(result.stdout);
    assert.ok(output, 'should produce valid JSON output');
    if (output.hookSpecificOutput) {
      assert.notStrictEqual(output.hookSpecificOutput.permissionDecision, 'deny',
        'should not deny when hook is disabled');
    } else {
      // When disabled, hook passes through raw input
      assert.strictEqual(output.tool_name, 'Edit', 'pass-through should preserve input');
    }
  })) passed++; else failed++;

  // --- Test 10: MultiEdit gates first unchecked file ---
  clearState();
  if (test('denies first MultiEdit with unchecked file', () => {
    const input = {
      tool_name: 'MultiEdit',
      tool_input: {
        edits: [
          { file_path: '/src/multi-a.js', old_string: 'a', new_string: 'b' },
          { file_path: '/src/multi-b.js', old_string: 'c', new_string: 'd' }
        ]
      }
    };
    const result = runHook(input);
    assert.strictEqual(result.code, 0, 'exit code should be 0');
    const output = parseOutput(result.stdout);
    assert.ok(output, 'should produce JSON output');
    assert.strictEqual(output.hookSpecificOutput.permissionDecision, 'deny');
    assert.ok(output.hookSpecificOutput.permissionDecisionReason.includes('Fact-Forcing Gate'));
    assert.ok(output.hookSpecificOutput.permissionDecisionReason.includes('/src/multi-a.js'));
  })) passed++; else failed++;

  // --- Test 11: MultiEdit allows after all files gated ---
  if (test('allows MultiEdit after all files gated', () => {
    // multi-a.js was gated in test 10; gate multi-b.js
    const input2 = {
      tool_name: 'MultiEdit',
      tool_input: { edits: [{ file_path: '/src/multi-b.js', old_string: 'c', new_string: 'd' }] }
    };
    runHook(input2); // gates multi-b.js

    // Now both files are gated — retry should allow
    const input3 = {
      tool_name: 'MultiEdit',
      tool_input: {
        edits: [
          { file_path: '/src/multi-a.js', old_string: 'a', new_string: 'b' },
          { file_path: '/src/multi-b.js', old_string: 'c', new_string: 'd' }
        ]
      }
    };
    const result3 = runHook(input3);
    const output3 = parseOutput(result3.stdout);
    assert.ok(output3, 'should produce valid JSON');
    if (output3.hookSpecificOutput) {
      assert.notStrictEqual(output3.hookSpecificOutput.permissionDecision, 'deny',
        'should allow MultiEdit after all files gated');
    }
  })) passed++; else failed++;

  // --- Test 12: reads refresh active session state ---
  clearState();
  if (test('touches last_active on read so active sessions do not age out', () => {
    const staleButActive = Date.now() - (29 * 60 * 1000);
    writeState({
      checked: ['/src/keep-alive.js'],
      last_active: staleButActive
    });

    const before = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    assert.strictEqual(before.last_active, staleButActive, 'seed state should use the expected timestamp');

    const result = runHook({
      tool_name: 'Edit',
      tool_input: { file_path: '/src/keep-alive.js', old_string: 'a', new_string: 'b' }
    });
    const output = parseOutput(result.stdout);
    assert.ok(output, 'should produce valid JSON output');
    if (output.hookSpecificOutput) {
      assert.notStrictEqual(output.hookSpecificOutput.permissionDecision, 'deny',
        'already-checked file should still be allowed');
    }

    const after = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    assert.ok(after.last_active > staleButActive, 'successful reads should refresh last_active');
  })) passed++; else failed++;

  // --- Test 13: pruning preserves routine bash gate marker ---
  clearState();
  if (test('preserves __bash_session__ when pruning oversized state', () => {
    const checked = ['__bash_session__'];
    for (let i = 0; i < 80; i++) checked.push(`__destructive__${i}`);
    for (let i = 0; i < 700; i++) checked.push(`/src/file-${i}.js`);
    writeState({ checked, last_active: Date.now() });

    runHook({
      tool_name: 'Edit',
      tool_input: { file_path: '/src/newly-gated.js', old_string: 'a', new_string: 'b' }
    });

    const result = runBashHook({
      tool_name: 'Bash',
      tool_input: { command: 'pwd' }
    });
    const output = parseOutput(result.stdout);
    assert.ok(output, 'should produce valid JSON output');
    if (output.hookSpecificOutput) {
      assert.notStrictEqual(output.hookSpecificOutput.permissionDecision, 'deny',
        'routine bash marker should survive pruning');
    }

    const persisted = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    assert.ok(persisted.checked.includes('__bash_session__'), 'pruned state should retain __bash_session__');
    assert.ok(persisted.checked.length <= 500, 'pruned state should still honor the checked-entry cap');
  })) passed++; else failed++;

  // --- Test 14: stable fallback works without session env vars ---
  const fallbackEnv = {
    CLAUDE_PROJECT_DIR: FALLBACK_PROJECT_DIR
  };
  clearState(fallbackSessionId(buildFallbackHookEnv(fallbackEnv)));
  if (test('denies first routine Bash and allows second without session env vars', () => {
    const input = {
      tool_name: 'Bash',
      tool_input: { command: 'echo "hello"' }
    };

    const result1 = runBashHookWithoutSession(input, fallbackEnv);
    assert.strictEqual(result1.code, 0, 'first fallback call exit code should be 0');
    const output1 = parseOutput(result1.stdout);
    assert.ok(output1, 'first fallback call should produce JSON output');
    assert.strictEqual(output1.hookSpecificOutput.permissionDecision, 'deny');

    const result2 = runBashHookWithoutSession(input, fallbackEnv);
    assert.strictEqual(result2.code, 0, 'second fallback call exit code should be 0');
    const output2 = parseOutput(result2.stdout);
    assert.ok(output2, 'second fallback call should produce valid JSON output');
    if (output2.hookSpecificOutput) {
      assert.notStrictEqual(output2.hookSpecificOutput.permissionDecision, 'deny',
        'should not deny second routine bash when using stable fallback');
    } else {
      assert.strictEqual(output2.tool_name, 'Bash', 'pass-through should preserve input');
    }
  })) passed++; else failed++;

  // --- Test 15: fallback isolates different CLI fingerprints in one project ---
  const cliAEnv = {
    CLAUDE_PROJECT_DIR: SHARED_PROJECT_DIR,
    TMUX_PANE: '%101'
  };
  const cliBEnv = {
    CLAUDE_PROJECT_DIR: SHARED_PROJECT_DIR,
    TMUX_PANE: '%202'
  };
  clearState(fallbackSessionId(buildFallbackHookEnv(cliAEnv)));
  clearState(fallbackSessionId(buildFallbackHookEnv(cliBEnv)));
  if (test('does not share fallback state across CLI fingerprints in the same project', () => {
    const input = {
      tool_name: 'Bash',
      tool_input: { command: 'echo "hello"' }
    };

    const cliAFirst = runBashHookWithoutSession(input, cliAEnv);
    const cliAFirstOutput = parseOutput(cliAFirst.stdout);
    assert.ok(cliAFirstOutput, 'CLI A first call should produce JSON output');
    assert.strictEqual(cliAFirstOutput.hookSpecificOutput.permissionDecision, 'deny');

    const cliASecond = runBashHookWithoutSession(input, cliAEnv);
    const cliASecondOutput = parseOutput(cliASecond.stdout);
    assert.ok(cliASecondOutput, 'CLI A second call should produce valid JSON output');
    if (cliASecondOutput.hookSpecificOutput) {
      assert.notStrictEqual(cliASecondOutput.hookSpecificOutput.permissionDecision, 'deny',
        'CLI A second call should pass once its fallback state is set');
    }

    const cliBFirst = runBashHookWithoutSession(input, cliBEnv);
    const cliBFirstOutput = parseOutput(cliBFirst.stdout);
    assert.ok(cliBFirstOutput, 'CLI B first call should produce JSON output');
    assert.strictEqual(cliBFirstOutput.hookSpecificOutput.permissionDecision, 'deny',
      'CLI B should not inherit CLI A fallback state');
  })) passed++; else failed++;

  // --- Test 16: long session IDs are reduced to a filesystem-safe state key ---
  const longSessionId = 'session-' + 'x'.repeat(400);
  clearState(sessionIdForStateFile(longSessionId));
  if (test('allows retries when CLAUDE_SESSION_ID is extremely long', () => {
    const input = {
      tool_name: 'Bash',
      tool_input: { command: 'echo "hello"' }
    };

    const result1 = runHookWithSessionId(input, longSessionId);
    assert.strictEqual(result1.code, 0, 'first long-session call exit code should be 0');
    const output1 = parseOutput(result1.stdout);
    assert.ok(output1, 'first long-session call should produce JSON output');
    assert.strictEqual(output1.hookSpecificOutput.permissionDecision, 'deny');

    const result2 = runHookWithSessionId(input, longSessionId);
    assert.strictEqual(result2.code, 0, 'second long-session call exit code should be 0');
    const output2 = parseOutput(result2.stdout);
    assert.ok(output2, 'second long-session call should produce valid JSON output');
    if (output2.hookSpecificOutput) {
      assert.notStrictEqual(output2.hookSpecificOutput.permissionDecision, 'deny',
        'long session IDs should still map to a stable state file');
    }

    const persisted = sessionStateFile(sessionIdForStateFile(longSessionId));
    assert.ok(fs.existsSync(persisted), 'sanitized long-session state file should be created');
    assert.ok(path.basename(persisted).length < 255, 'state filename should stay below common filesystem limits');
  })) passed++; else failed++;

  // Cleanup only the temp directory created by this test file.
  if (!externalStateDir) {
    try {
      if (fs.existsSync(stateDir)) {
        fs.rmSync(stateDir, { recursive: true, force: true });
      }
    } catch (err) {
      console.error(`  [cleanup] failed to remove ${stateDir}: ${err.message}`);
    }
  }

  console.log(`\n  ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
