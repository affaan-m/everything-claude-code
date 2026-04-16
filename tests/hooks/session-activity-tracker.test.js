/**
 * Tests for session-activity-tracker.js hook.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const script = path.join(
  __dirname,
  '..',
  '..',
  'scripts',
  'hooks',
  'session-activity-tracker.js'
);

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

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'session-activity-tracker-test-'));
}

function withTempHome(homeDir) {
  return {
    HOME: homeDir,
    USERPROFILE: homeDir,
  };
}

function runScript(input, envOverrides = {}, options = {}) {
  const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
  const result = spawnSync('node', [script], {
    encoding: 'utf8',
    input: inputStr,
    timeout: 10000,
    env: { ...process.env, ...envOverrides },
    cwd: options.cwd,
  });
  return { code: result.status || 0, stdout: result.stdout || '', stderr: result.stderr || '' };
}

function runTests() {
  console.log('\n=== Testing session-activity-tracker.js ===\n');

  let passed = 0;
  let failed = 0;

  (test('passes through input on stdout', () => {
    const input = {
      tool_name: 'Read',
      tool_input: { file_path: 'README.md' },
      tool_output: { output: 'ok' },
    };
    const inputStr = JSON.stringify(input);
    const result = runScript(input, {
      CLAUDE_HOOK_EVENT_NAME: 'PostToolUse',
      ECC_SESSION_ID: 'sess-123',
    });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(result.stdout, inputStr);
  }) ? passed++ : failed++);

  (test('creates tool activity metrics rows with file paths', () => {
    const tmpHome = makeTempDir();
    const input = {
      tool_name: 'Write',
      tool_input: {
        file_path: 'src/app.rs',
      },
      tool_output: { output: 'wrote src/app.rs' },
    };
    const result = runScript(input, {
      ...withTempHome(tmpHome),
      CLAUDE_HOOK_EVENT_NAME: 'PostToolUse',
      ECC_SESSION_ID: 'ecc-session-1234',
    });
    assert.strictEqual(result.code, 0);

    const metricsFile = path.join(tmpHome, '.claude', 'metrics', 'tool-usage.jsonl');
    assert.ok(fs.existsSync(metricsFile), `Expected metrics file at ${metricsFile}`);

    const row = JSON.parse(fs.readFileSync(metricsFile, 'utf8').trim());
    assert.strictEqual(row.session_id, 'ecc-session-1234');
    assert.strictEqual(row.tool_name, 'Write');
    assert.strictEqual(row.input_params_json, '{"file_path":"src/app.rs"}');
    assert.deepStrictEqual(row.file_paths, ['src/app.rs']);
    assert.deepStrictEqual(row.file_events, [{ path: 'src/app.rs', action: 'create' }]);
    assert.ok(row.id, 'Expected stable event id');
    assert.ok(row.timestamp, 'Expected timestamp');

    fs.rmSync(tmpHome, { recursive: true, force: true });
  }) ? passed++ : failed++);

  (test('captures typed move file events from source/destination inputs', () => {
    const tmpHome = makeTempDir();
    const input = {
      tool_name: 'Move',
      tool_input: {
        source_path: 'src/old.rs',
        destination_path: 'src/new.rs',
      },
      tool_output: { output: 'moved file' },
    };
    const result = runScript(input, {
      ...withTempHome(tmpHome),
      CLAUDE_HOOK_EVENT_NAME: 'PostToolUse',
      ECC_SESSION_ID: 'ecc-session-5678',
    });
    assert.strictEqual(result.code, 0);

    const metricsFile = path.join(tmpHome, '.claude', 'metrics', 'tool-usage.jsonl');
    const row = JSON.parse(fs.readFileSync(metricsFile, 'utf8').trim());
    assert.deepStrictEqual(row.file_paths, ['src/old.rs', 'src/new.rs']);
    assert.deepStrictEqual(row.file_events, [
      { path: 'src/old.rs', action: 'move' },
      { path: 'src/new.rs', action: 'move' },
    ]);

    fs.rmSync(tmpHome, { recursive: true, force: true });
  }) ? passed++ : failed++);

  (test('captures replacement diff previews for edit tool input', () => {
    const tmpHome = makeTempDir();
    const input = {
      tool_name: 'Edit',
      tool_input: {
        file_path: 'src/config.ts',
        old_string: 'API_URL=http://localhost:3000',
        new_string: 'API_URL=https://api.example.com',
      },
      tool_output: { output: 'updated config' },
    };
    const result = runScript(input, {
      ...withTempHome(tmpHome),
      CLAUDE_HOOK_EVENT_NAME: 'PostToolUse',
      ECC_SESSION_ID: 'ecc-session-edit',
    });
    assert.strictEqual(result.code, 0);

    const metricsFile = path.join(tmpHome, '.claude', 'metrics', 'tool-usage.jsonl');
    const row = JSON.parse(fs.readFileSync(metricsFile, 'utf8').trim());
    assert.deepStrictEqual(row.file_events, [
      {
        path: 'src/config.ts',
        action: 'modify',
        diff_preview: 'API_URL=http://localhost:3000 -> API_URL=https://api.example.com',
        patch_preview: '@@\n- API_URL=http://localhost:3000\n+ API_URL=https://api.example.com',
      },
    ]);

    fs.rmSync(tmpHome, { recursive: true, force: true });
  }) ? passed++ : failed++);

  (test('captures MultiEdit nested edits with typed diff previews', () => {
    const tmpHome = makeTempDir();
    const input = {
      tool_name: 'MultiEdit',
      tool_input: {
        edits: [
          {
            file_path: 'src/a.ts',
            old_string: 'const a = 1;',
            new_string: 'const a = 2;',
          },
          {
            file_path: 'src/b.ts',
            old_string: 'old name',
            new_string: 'new name',
          },
        ],
      },
      tool_output: { output: 'updated two files' },
    };
    const result = runScript(input, {
      ...withTempHome(tmpHome),
      CLAUDE_HOOK_EVENT_NAME: 'PostToolUse',
      ECC_SESSION_ID: 'ecc-session-multiedit',
    });
    assert.strictEqual(result.code, 0);

    const metricsFile = path.join(tmpHome, '.claude', 'metrics', 'tool-usage.jsonl');
    const row = JSON.parse(fs.readFileSync(metricsFile, 'utf8').trim());
    assert.deepStrictEqual(row.file_paths, ['src/a.ts', 'src/b.ts']);
    assert.deepStrictEqual(row.file_events, [
      {
        path: 'src/a.ts',
        action: 'modify',
        diff_preview: 'const a = 1; -> const a = 2;',
        patch_preview: '@@\n- const a = 1;\n+ const a = 2;',
      },
      {
        path: 'src/b.ts',
        action: 'modify',
        diff_preview: 'old name -> new name',
        patch_preview: '@@\n- old name\n+ new name',
      },
    ]);

    fs.rmSync(tmpHome, { recursive: true, force: true });
  }) ? passed++ : failed++);

  (test('reclassifies tracked Write activity as modify using git diff context', () => {
    const tmpHome = makeTempDir();
    const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'session-activity-tracker-repo-'));

    spawnSync('git', ['init'], { cwd: repoDir, encoding: 'utf8' });
    spawnSync('git', ['config', 'user.email', 'ecc@example.com'], { cwd: repoDir, encoding: 'utf8' });
    spawnSync('git', ['config', 'user.name', 'ECC Tests'], { cwd: repoDir, encoding: 'utf8' });

    const srcDir = path.join(repoDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    const trackedFile = path.join(srcDir, 'app.ts');
    fs.writeFileSync(trackedFile, 'const count = 1;\n', 'utf8');
    spawnSync('git', ['add', 'src/app.ts'], { cwd: repoDir, encoding: 'utf8' });
    spawnSync('git', ['commit', '-m', 'init'], { cwd: repoDir, encoding: 'utf8' });

    fs.writeFileSync(trackedFile, 'const count = 2;\n', 'utf8');

    const input = {
      tool_name: 'Write',
      tool_input: {
        file_path: 'src/app.ts',
        content: 'const count = 2;\n',
      },
      tool_output: { output: 'updated src/app.ts' },
    };
    const result = runScript(input, {
      ...withTempHome(tmpHome),
      CLAUDE_HOOK_EVENT_NAME: 'PostToolUse',
      ECC_SESSION_ID: 'ecc-session-write-modify',
    }, {
      cwd: repoDir,
    });
    assert.strictEqual(result.code, 0);

    const metricsFile = path.join(tmpHome, '.claude', 'metrics', 'tool-usage.jsonl');
    const row = JSON.parse(fs.readFileSync(metricsFile, 'utf8').trim());
    assert.deepStrictEqual(row.file_events, [
      {
        path: 'src/app.ts',
        action: 'modify',
        diff_preview: 'const count = 1; -> const count = 2;',
        patch_preview: '@@ -1 +1 @@\n-const count = 1;\n+const count = 2;',
      },
    ]);

    fs.rmSync(tmpHome, { recursive: true, force: true });
    fs.rmSync(repoDir, { recursive: true, force: true });
  }) ? passed++ : failed++);

  (test('captures tracked Delete activity using git diff context', () => {
    const tmpHome = makeTempDir();
    const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'session-activity-tracker-delete-repo-'));

    spawnSync('git', ['init'], { cwd: repoDir, encoding: 'utf8' });
    spawnSync('git', ['config', 'user.email', 'ecc@example.com'], { cwd: repoDir, encoding: 'utf8' });
    spawnSync('git', ['config', 'user.name', 'ECC Tests'], { cwd: repoDir, encoding: 'utf8' });

    const srcDir = path.join(repoDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    const trackedFile = path.join(srcDir, 'obsolete.ts');
    fs.writeFileSync(trackedFile, 'export const obsolete = true;\n', 'utf8');
    spawnSync('git', ['add', 'src/obsolete.ts'], { cwd: repoDir, encoding: 'utf8' });
    spawnSync('git', ['commit', '-m', 'init'], { cwd: repoDir, encoding: 'utf8' });

    fs.rmSync(trackedFile, { force: true });

    const input = {
      tool_name: 'Delete',
      tool_input: {
        file_path: 'src/obsolete.ts',
      },
      tool_output: { output: 'deleted src/obsolete.ts' },
    };
    const result = runScript(input, {
      ...withTempHome(tmpHome),
      CLAUDE_HOOK_EVENT_NAME: 'PostToolUse',
      ECC_SESSION_ID: 'ecc-session-delete',
    }, {
      cwd: repoDir,
    });
    assert.strictEqual(result.code, 0);

    const metricsFile = path.join(tmpHome, '.claude', 'metrics', 'tool-usage.jsonl');
    const row = JSON.parse(fs.readFileSync(metricsFile, 'utf8').trim());
    assert.deepStrictEqual(row.file_events, [
      {
        path: 'src/obsolete.ts',
        action: 'delete',
        diff_preview: 'export const obsolete = true; ->',
        patch_preview: '@@ -1 +0,0 @@\n-export const obsolete = true;',
      },
    ]);

    fs.rmSync(tmpHome, { recursive: true, force: true });
    fs.rmSync(repoDir, { recursive: true, force: true });
  }) ? passed++ : failed++);

  (test('resolves repo-relative paths even when the hook runs from a nested cwd', () => {
    const tmpHome = makeTempDir();
    const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'session-activity-tracker-nested-repo-'));

    spawnSync('git', ['init'], { cwd: repoDir, encoding: 'utf8' });
    spawnSync('git', ['config', 'user.email', 'ecc@example.com'], { cwd: repoDir, encoding: 'utf8' });
    spawnSync('git', ['config', 'user.name', 'ECC Tests'], { cwd: repoDir, encoding: 'utf8' });

    const srcDir = path.join(repoDir, 'src');
    const nestedCwd = path.join(repoDir, 'subdir');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.mkdirSync(nestedCwd, { recursive: true });

    const trackedFile = path.join(srcDir, 'app.ts');
    fs.writeFileSync(trackedFile, 'const count = 1;\n', 'utf8');
    spawnSync('git', ['add', 'src/app.ts'], { cwd: repoDir, encoding: 'utf8' });
    spawnSync('git', ['commit', '-m', 'init'], { cwd: repoDir, encoding: 'utf8' });

    fs.writeFileSync(trackedFile, 'const count = 2;\n', 'utf8');

    const input = {
      tool_name: 'Write',
      tool_input: {
        file_path: 'src/app.ts',
        content: 'const count = 2;\n',
      },
      tool_output: { output: 'updated src/app.ts' },
    };
    const result = runScript(input, {
      ...withTempHome(tmpHome),
      CLAUDE_HOOK_EVENT_NAME: 'PostToolUse',
      ECC_SESSION_ID: 'ecc-session-nested-cwd',
    }, {
      cwd: nestedCwd,
    });
    assert.strictEqual(result.code, 0);

    const metricsFile = path.join(tmpHome, '.claude', 'metrics', 'tool-usage.jsonl');
    const row = JSON.parse(fs.readFileSync(metricsFile, 'utf8').trim());
    assert.deepStrictEqual(row.file_events, [
      {
        path: 'src/app.ts',
        action: 'modify',
        diff_preview: 'const count = 1; -> const count = 2;',
        patch_preview: '@@ -1 +1 @@\n-const count = 1;\n+const count = 2;',
      },
    ]);

    fs.rmSync(tmpHome, { recursive: true, force: true });
    fs.rmSync(repoDir, { recursive: true, force: true });
  }) ? passed++ : failed++);

  (test('prefers ECC_SESSION_ID over CLAUDE_SESSION_ID and redacts bash summaries', () => {
    const tmpHome = makeTempDir();
    const input = {
      tool_name: 'Bash',
      tool_input: {
        command: 'curl --token abc123 -H "Authorization: Bearer topsecret" https://example.com',
      },
      tool_output: { output: 'done' },
    };
    const result = runScript(input, {
      ...withTempHome(tmpHome),
      CLAUDE_HOOK_EVENT_NAME: 'PostToolUse',
      ECC_SESSION_ID: 'ecc-session-1',
      CLAUDE_SESSION_ID: 'claude-session-2',
    });
    assert.strictEqual(result.code, 0);

    const metricsFile = path.join(tmpHome, '.claude', 'metrics', 'tool-usage.jsonl');
    const row = JSON.parse(fs.readFileSync(metricsFile, 'utf8').trim());
    assert.strictEqual(row.session_id, 'ecc-session-1');
    assert.ok(row.input_summary.includes('<REDACTED>'));
    assert.ok(!row.input_summary.includes('abc123'));
    assert.ok(!row.input_summary.includes('topsecret'));
    assert.ok(row.input_params_json.includes('<REDACTED>'));
    assert.ok(!row.input_params_json.includes('abc123'));
    assert.ok(!row.input_params_json.includes('topsecret'));

    fs.rmSync(tmpHome, { recursive: true, force: true });
  }) ? passed++ : failed++);

  (test('handles invalid JSON gracefully', () => {
    const tmpHome = makeTempDir();
    const invalidInput = 'not valid json {{{';
    const result = runScript(invalidInput, {
      ...withTempHome(tmpHome),
      CLAUDE_HOOK_EVENT_NAME: 'PostToolUse',
      ECC_SESSION_ID: 'sess-123',
    });
    assert.strictEqual(result.code, 0);
    assert.strictEqual(result.stdout, invalidInput);

    fs.rmSync(tmpHome, { recursive: true, force: true });
  }) ? passed++ : failed++);

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
