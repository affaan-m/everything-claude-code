/**
 * hook スクリプトのテスト
 *
 * 実行方法: node tests/hooks/hooks.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync, spawn } = require('child_process');

// テストヘルパー
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

// 非同期テストヘルパー
async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    return false;
  }
}

// スクリプトを実行して出力をキャプチャする
function runScript(scriptPath, input = '', env = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [scriptPath], {
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => stdout += data);
    proc.stderr.on('data', data => stderr += data);

    if (input) {
      proc.stdin.write(input);
    }
    proc.stdin.end();

    proc.on('close', code => {
      resolve({ code, stdout, stderr });
    });

    proc.on('error', reject);
  });
}

// 一時テストディレクトリを作成する
function createTestDir() {
  const testDir = path.join(os.tmpdir(), `hooks-test-${Date.now()}`);
  fs.mkdirSync(testDir, { recursive: true });
  return testDir;
}

// テストディレクトリをクリーンアップする
function cleanupTestDir(testDir) {
  fs.rmSync(testDir, { recursive: true, force: true });
}

// テストスイート
async function runTests() {
  console.log('\n=== Testing Hook Scripts ===\n');

  let passed = 0;
  let failed = 0;

  const scriptsDir = path.join(__dirname, '..', '..', 'scripts', 'hooks');

  // session-start.js のテスト
  console.log('session-start.js:');

  if (await asyncTest('runs without error', async () => {
    const result = await runScript(path.join(scriptsDir, 'session-start.js'));
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('outputs session info to stderr', async () => {
    const result = await runScript(path.join(scriptsDir, 'session-start.js'));
    assert.ok(
      result.stderr.includes('[SessionStart]') ||
      result.stderr.includes('Package manager'),
      'Should output session info'
    );
  })) passed++; else failed++;

  // session-end.js のテスト
  console.log('\nsession-end.js:');

  if (await asyncTest('runs without error', async () => {
    const result = await runScript(path.join(scriptsDir, 'session-end.js'));
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('creates or updates session file', async () => {
    // スクリプトを実行
    await runScript(path.join(scriptsDir, 'session-end.js'));

    // セッションファイルが作成されたか確認（デフォルトセッションID）
    // スクリプトの getDateString() 関数に合わせてローカル時間を使用
    const sessionsDir = path.join(os.homedir(), '.claude', 'sessions');
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const sessionFile = path.join(sessionsDir, `${today}-default-session.tmp`);

    assert.ok(fs.existsSync(sessionFile), 'Session file should exist');
  })) passed++; else failed++;

  if (await asyncTest('includes session ID in filename', async () => {
    const testSessionId = 'test-session-abc12345';
    const expectedShortId = 'abc12345'; // 最後の8文字

    // カスタムセッションIDで実行
    await runScript(path.join(scriptsDir, 'session-end.js'), '', {
      CLAUDE_SESSION_ID: testSessionId
    });

    // セッションIDを含むセッションファイルが作成されたか確認
    // スクリプトの getDateString() 関数に合わせてローカル時間を使用
    const sessionsDir = path.join(os.homedir(), '.claude', 'sessions');
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const sessionFile = path.join(sessionsDir, `${today}-${expectedShortId}-session.tmp`);

    assert.ok(fs.existsSync(sessionFile), `Session file should exist: ${sessionFile}`);
  })) passed++; else failed++;

  // pre-compact.js のテスト
  console.log('\npre-compact.js:');

  if (await asyncTest('runs without error', async () => {
    const result = await runScript(path.join(scriptsDir, 'pre-compact.js'));
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('outputs PreCompact message', async () => {
    const result = await runScript(path.join(scriptsDir, 'pre-compact.js'));
    assert.ok(result.stderr.includes('[PreCompact]'), 'Should output PreCompact message');
  })) passed++; else failed++;

  if (await asyncTest('creates compaction log', async () => {
    await runScript(path.join(scriptsDir, 'pre-compact.js'));
    const logFile = path.join(os.homedir(), '.claude', 'sessions', 'compaction-log.txt');
    assert.ok(fs.existsSync(logFile), 'Compaction log should exist');
  })) passed++; else failed++;

  // suggest-compact.js のテスト
  console.log('\nsuggest-compact.js:');

  if (await asyncTest('runs without error', async () => {
    const result = await runScript(path.join(scriptsDir, 'suggest-compact.js'), '', {
      CLAUDE_SESSION_ID: 'test-session-' + Date.now()
    });
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('increments counter on each call', async () => {
    const sessionId = 'test-counter-' + Date.now();

    // 複数回実行
    for (let i = 0; i < 3; i++) {
      await runScript(path.join(scriptsDir, 'suggest-compact.js'), '', {
        CLAUDE_SESSION_ID: sessionId
      });
    }

    // カウンターファイルを確認
    const counterFile = path.join(os.tmpdir(), `claude-tool-count-${sessionId}`);
    const count = parseInt(fs.readFileSync(counterFile, 'utf8').trim(), 10);
    assert.strictEqual(count, 3, `Counter should be 3, got ${count}`);

    // クリーンアップ
    fs.unlinkSync(counterFile);
  })) passed++; else failed++;

  if (await asyncTest('suggests compact at threshold', async () => {
    const sessionId = 'test-threshold-' + Date.now();
    const counterFile = path.join(os.tmpdir(), `claude-tool-count-${sessionId}`);

    // カウンターを閾値 - 1 に設定
    fs.writeFileSync(counterFile, '49');

    const result = await runScript(path.join(scriptsDir, 'suggest-compact.js'), '', {
      CLAUDE_SESSION_ID: sessionId,
      COMPACT_THRESHOLD: '50'
    });

    assert.ok(
      result.stderr.includes('50 tool calls reached'),
      'Should suggest compact at threshold'
    );

    // クリーンアップ
    fs.unlinkSync(counterFile);
  })) passed++; else failed++;

  // evaluate-session.js のテスト
  console.log('\nevaluate-session.js:');

  if (await asyncTest('runs without error when no transcript', async () => {
    const result = await runScript(path.join(scriptsDir, 'evaluate-session.js'));
    assert.strictEqual(result.code, 0, `Exit code should be 0, got ${result.code}`);
  })) passed++; else failed++;

  if (await asyncTest('skips short sessions', async () => {
    const testDir = createTestDir();
    const transcriptPath = path.join(testDir, 'transcript.jsonl');

    // 短いトランスクリプトを作成（10件未満のユーザーメッセージ）
    const transcript = Array(5).fill('{"type":"user","content":"test"}\n').join('');
    fs.writeFileSync(transcriptPath, transcript);

    const result = await runScript(path.join(scriptsDir, 'evaluate-session.js'), '', {
      CLAUDE_TRANSCRIPT_PATH: transcriptPath
    });

    assert.ok(
      result.stderr.includes('Session too short'),
      'Should indicate session is too short'
    );

    cleanupTestDir(testDir);
  })) passed++; else failed++;

  if (await asyncTest('processes sessions with enough messages', async () => {
    const testDir = createTestDir();
    const transcriptPath = path.join(testDir, 'transcript.jsonl');

    // より長いトランスクリプトを作成（10件以上のユーザーメッセージ）
    const transcript = Array(15).fill('{"type":"user","content":"test"}\n').join('');
    fs.writeFileSync(transcriptPath, transcript);

    const result = await runScript(path.join(scriptsDir, 'evaluate-session.js'), '', {
      CLAUDE_TRANSCRIPT_PATH: transcriptPath
    });

    assert.ok(
      result.stderr.includes('15 messages'),
      'Should report message count'
    );

    cleanupTestDir(testDir);
  })) passed++; else failed++;

  // hooks.json の検証
  console.log('\nhooks.json Validation:');

  if (test('hooks.json is valid JSON', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const content = fs.readFileSync(hooksPath, 'utf8');
    JSON.parse(content); // 無効な場合はエラーをスローする
  })) passed++; else failed++;

  if (test('hooks.json has required event types', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

    assert.ok(hooks.hooks.PreToolUse, 'Should have PreToolUse hooks');
    assert.ok(hooks.hooks.PostToolUse, 'Should have PostToolUse hooks');
    assert.ok(hooks.hooks.SessionStart, 'Should have SessionStart hooks');
    assert.ok(hooks.hooks.Stop, 'Should have Stop hooks');
    assert.ok(hooks.hooks.PreCompact, 'Should have PreCompact hooks');
  })) passed++; else failed++;

  if (test('all hook commands use node', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

    const checkHooks = (hookArray) => {
      for (const entry of hookArray) {
        for (const hook of entry.hooks) {
          if (hook.type === 'command') {
            assert.ok(
              hook.command.startsWith('node'),
              `Hook command should start with 'node': ${hook.command.substring(0, 50)}...`
            );
          }
        }
      }
    };

    for (const [eventType, hookArray] of Object.entries(hooks.hooks)) {
      checkHooks(hookArray);
    }
  })) passed++; else failed++;

  if (test('script references use CLAUDE_PLUGIN_ROOT variable', () => {
    const hooksPath = path.join(__dirname, '..', '..', 'hooks', 'hooks.json');
    const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));

    const checkHooks = (hookArray) => {
      for (const entry of hookArray) {
        for (const hook of entry.hooks) {
          if (hook.type === 'command' && hook.command.includes('scripts/hooks/')) {
            // command 内のリテラル文字列 "${CLAUDE_PLUGIN_ROOT}" を確認
            const hasPluginRoot = hook.command.includes('${CLAUDE_PLUGIN_ROOT}');
            assert.ok(
              hasPluginRoot,
              `Script paths should use CLAUDE_PLUGIN_ROOT: ${hook.command.substring(0, 80)}...`
            );
          }
        }
      }
    };

    for (const [eventType, hookArray] of Object.entries(hooks.hooks)) {
      checkHooks(hookArray);
    }
  })) passed++; else failed++;

  // サマリー
  console.log('\n=== Test Results ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total:  ${passed + failed}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
