/**
 * Tests for observer memory explosion fix (#521)
 *
 * Validates three fixes:
 * 1. SIGUSR1 throttling in observe.sh (signal counter)
 * 2. Tail-based sampling in observer-loop.sh (not loading entire file)
 * 3. Re-entrancy guard + cooldown in observer-loop.sh on_usr1()
 *
 * Run with: node tests/hooks/observer-memory.test.js
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawnSync } = require('child_process');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
    passed++;
  } catch (err) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${err.message}`);
    failed++;
  }
}

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-observer-test-'));
}

function cleanupDir(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }
}

const repoRoot = path.resolve(__dirname, '..', '..');
const observeShPath = path.join(repoRoot, 'skills', 'continuous-learning-v2', 'hooks', 'observe.sh');
const observerLoopPath = path.join(repoRoot, 'skills', 'continuous-learning-v2', 'agents', 'observer-loop.sh');

console.log('\n=== Observer Memory Fix Tests (#521) ===\n');

// ──────────────────────────────────────────────────────
// Test group 1: observe.sh SIGUSR1 throttling
// ──────────────────────────────────────────────────────

console.log('--- observe.sh signal throttling ---');

test('observe.sh contains SIGNAL_EVERY_N throttle variable', () => {
  const content = fs.readFileSync(observeShPath, 'utf8');
  assert.ok(content.includes('SIGNAL_EVERY_N'), 'observe.sh should define SIGNAL_EVERY_N for throttling');
});

test('observe.sh uses a counter file instead of signaling every call', () => {
  const content = fs.readFileSync(observeShPath, 'utf8');
  assert.ok(content.includes('.observer-signal-counter'), 'observe.sh should use a signal counter file');
});

test('observe.sh only signals when counter reaches threshold', () => {
  const content = fs.readFileSync(observeShPath, 'utf8');
  assert.ok(content.includes('should_signal=0'), 'observe.sh should default should_signal to 0');
  assert.ok(content.includes('should_signal=1'), 'observe.sh should set should_signal=1 when threshold reached');
  assert.ok(content.includes('if [ "$should_signal" -eq 1 ]'), 'observe.sh should gate kill -USR1 behind should_signal check');
});

test('observe.sh default throttle is 20 observations per signal', () => {
  const content = fs.readFileSync(observeShPath, 'utf8');
  assert.ok(content.includes('ECC_OBSERVER_SIGNAL_EVERY_N:-20'), 'Default signal frequency should be every 20 observations');
});

// ──────────────────────────────────────────────────────
// Test group 2: observer-loop.sh re-entrancy guard
// ──────────────────────────────────────────────────────

console.log('\n--- observer-loop.sh re-entrancy guard ---');

test('observer-loop.sh defines ANALYZING guard variable', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('ANALYZING=0'), 'observer-loop.sh should initialize ANALYZING=0');
});

test('on_usr1 checks ANALYZING before starting analysis', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('if [ "$ANALYZING" -eq 1 ]'), 'on_usr1 should check ANALYZING flag');
  assert.ok(content.includes('Analysis already in progress, skipping signal'), 'on_usr1 should log when skipping due to re-entrancy');
});

test('on_usr1 sets ANALYZING=1 before and ANALYZING=0 after analysis', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  // Check that ANALYZING=1 is set before analyze_observations
  const analyzeCall = content.indexOf('ANALYZING=1');
  const analyzeObsCall = content.indexOf('analyze_observations', analyzeCall);
  const analyzeReset = content.indexOf('ANALYZING=0', analyzeObsCall);
  assert.ok(analyzeCall > 0, 'ANALYZING=1 should be set');
  assert.ok(analyzeObsCall > analyzeCall, 'analyze_observations should be called after ANALYZING=1');
  assert.ok(analyzeReset > analyzeObsCall, 'ANALYZING=0 should follow analyze_observations');
});

// ──────────────────────────────────────────────────────
// Test group 3: observer-loop.sh cooldown throttle
// ──────────────────────────────────────────────────────

console.log('\n--- observer-loop.sh cooldown throttle ---');

test('observer-loop.sh defines ANALYSIS_COOLDOWN', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('ANALYSIS_COOLDOWN'), 'observer-loop.sh should define ANALYSIS_COOLDOWN');
});

test('on_usr1 enforces cooldown between analyses', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('LAST_ANALYSIS_EPOCH'), 'Should track last analysis time');
  assert.ok(content.includes('Analysis cooldown active'), 'Should log when cooldown prevents analysis');
});

test('default cooldown is 60 seconds', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('ECC_OBSERVER_ANALYSIS_COOLDOWN:-60'), 'Default cooldown should be 60 seconds');
});

// ──────────────────────────────────────────────────────
// Test group 4: Tail-based sampling (no full file load)
// ──────────────────────────────────────────────────────

console.log('\n--- observer-loop.sh tail-based sampling ---');

test('analyze_observations uses tail to sample recent observations', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('tail -n "$MAX_ANALYSIS_LINES"'), 'Should use tail to limit observations sent to LLM');
});

test('default max analysis lines is 500', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('ECC_OBSERVER_MAX_ANALYSIS_LINES:-500'), 'Default should sample last 500 lines');
});

test('analysis temp file is created and cleaned up', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('ecc-observer-analysis'), 'Should create a temp analysis file');
  assert.ok(content.includes('rm -f "$prompt_file" "$analysis_file"'), 'Should clean up both prompt and analysis temp files');
});

test('prompt references analysis_file not full OBSERVATIONS_FILE', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  // The prompt heredoc should reference analysis_file for the Read instruction.
  // Find the section between the heredoc open and close markers.
  const heredocStart = content.indexOf('cat > "$prompt_file" <<PROMPT');
  const heredocEnd = content.indexOf('\nPROMPT', heredocStart + 1);
  assert.ok(heredocStart > 0, 'Should find prompt heredoc start');
  assert.ok(heredocEnd > heredocStart, 'Should find prompt heredoc end');
  const promptSection = content.substring(heredocStart, heredocEnd);
  assert.ok(promptSection.includes('${analysis_file}'), 'Prompt should point Claude at the sampled analysis file, not the full observations file');
});

// ──────────────────────────────────────────────────────
// Test group 5: Signal counter file simulation
// ──────────────────────────────────────────────────────

console.log('\n--- Signal counter file behavior ---');

test('counter file increments and resets correctly', () => {
  const testDir = createTempDir();
  const counterFile = path.join(testDir, '.observer-signal-counter');

  // Simulate 20 calls - first 19 should not signal, 20th should
  const signalEveryN = 20;
  let signalCount = 0;

  for (let i = 0; i < 40; i++) {
    let shouldSignal = false;
    if (fs.existsSync(counterFile)) {
      let counter = parseInt(fs.readFileSync(counterFile, 'utf8').trim(), 10) || 0;
      counter++;
      if (counter >= signalEveryN) {
        shouldSignal = true;
        counter = 0;
      }
      fs.writeFileSync(counterFile, String(counter));
    } else {
      fs.writeFileSync(counterFile, '1');
    }
    if (shouldSignal) signalCount++;
  }

  // 40 calls with threshold 20 should signal exactly 2 times
  // (at call 20 and call 40)
  assert.strictEqual(signalCount, 2, `Expected 2 signals over 40 calls, got ${signalCount}`);

  cleanupDir(testDir);
});

test('counter file handles missing/corrupt file gracefully', () => {
  const testDir = createTempDir();
  const counterFile = path.join(testDir, '.observer-signal-counter');

  // Write corrupt content
  fs.writeFileSync(counterFile, 'not-a-number');
  const counter = parseInt(fs.readFileSync(counterFile, 'utf8').trim(), 10) || 0;
  assert.strictEqual(counter, 0, 'Corrupt counter should default to 0');

  cleanupDir(testDir);
});

// ──────────────────────────────────────────────────────
// Test group 6: End-to-end observe.sh signal throttle (shell)
// ──────────────────────────────────────────────────────

console.log('\n--- observe.sh end-to-end throttle (shell execution) ---');

test('observe.sh creates counter file and increments on each call', () => {
  if (process.platform === 'win32') {
    return;
  }

  // This test runs observe.sh with minimal input to verify counter behavior.
  // We need python3, bash, and a valid project dir to test the full flow.
  // We use ECC_SKIP_OBSERVE=0 and minimal JSON so observe.sh processes but
  // exits before signaling (no observer PID running).

  const testDir = createTempDir();
  const projectDir = path.join(testDir, 'project');
  fs.mkdirSync(projectDir, { recursive: true });

  // Create a minimal detect-project.sh that sets required vars
  const skillRoot = path.join(testDir, 'skill');
  const scriptsDir = path.join(skillRoot, 'scripts');
  const hooksDir = path.join(skillRoot, 'hooks');
  fs.mkdirSync(scriptsDir, { recursive: true });
  fs.mkdirSync(hooksDir, { recursive: true });

  // Minimal detect-project.sh stub
  fs.writeFileSync(
    path.join(scriptsDir, 'detect-project.sh'),
    [
      '#!/bin/bash',
      `PROJECT_ID="test-project"`,
      `PROJECT_NAME="test-project"`,
      `PROJECT_ROOT="${projectDir}"`,
      `PROJECT_DIR="${projectDir}"`,
      `CLV2_PYTHON_CMD="${process.platform === 'win32' ? 'python' : 'python3'}"`,
      ''
    ].join('\n')
  );

  // Copy observe.sh but patch SKILL_ROOT to our test dir
  let observeContent = fs.readFileSync(observeShPath, 'utf8');
  observeContent = observeContent.replace('SKILL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"', `SKILL_ROOT="${skillRoot}"`);
  const testObserve = path.join(hooksDir, 'observe.sh');
  fs.writeFileSync(testObserve, observeContent, { mode: 0o755 });

  const hookInput = JSON.stringify({
    tool_name: 'Read',
    tool_input: { file_path: '/tmp/test.txt' },
    session_id: 'test-session',
    cwd: projectDir
  });

  // Run observe.sh twice
  for (let i = 0; i < 2; i++) {
    spawnSync('bash', [testObserve, 'post'], {
      input: hookInput,
      env: {
        ...process.env,
        HOME: testDir,
        CLAUDE_CODE_ENTRYPOINT: 'cli',
        ECC_HOOK_PROFILE: 'standard',
        ECC_SKIP_OBSERVE: '0',
        CLAUDE_PROJECT_DIR: projectDir
      },
      timeout: 5000
    });
  }

  const counterFile = path.join(projectDir, '.observer-signal-counter');
  if (fs.existsSync(counterFile)) {
    const val = fs.readFileSync(counterFile, 'utf8').trim();
    const counterVal = parseInt(val, 10);
    assert.ok(counterVal >= 1 && counterVal <= 2, `Counter should be 1 or 2 after 2 calls, got ${counterVal}`);
  } else {
    // If python3 is not available the hook exits early - that is acceptable
    const hasPython = spawnSync('python3', ['--version']).status === 0;
    if (hasPython) {
      assert.fail('Counter file should exist after running observe.sh');
    }
  }

  cleanupDir(testDir);
});

// ──────────────────────────────────────────────────────
// Test group 7: Observer Haiku invocation flags
// ──────────────────────────────────────────────────────

console.log('\n--- Observer Haiku invocation flags ---');

test('claude invocation includes --allowedTools flag', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('--allowedTools'), 'observer-loop.sh should include --allowedTools flag in claude invocation');
});

test('allowedTools includes Read permission', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  const match = content.match(/--allowedTools\s+"([^"]+)"/);
  assert.ok(match, 'Should find --allowedTools with quoted value');
  assert.ok(match[1].includes('Read'), `allowedTools should include Read, got: ${match[1]}`);
});

test('allowedTools includes Write permission', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  const match = content.match(/--allowedTools\s+"([^"]+)"/);
  assert.ok(match, 'Should find --allowedTools with quoted value');
  assert.ok(match[1].includes('Write'), `allowedTools should include Write, got: ${match[1]}`);
});

test('claude invocation still includes ECC_SKIP_OBSERVE and ECC_HOOK_PROFILE guards', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  // Find the claude execution line(s)
  const lines = content.split('\n');
  const claudeLine = lines.find(l => l.includes('claude --model haiku'));
  assert.ok(claudeLine, 'Should find claude --model haiku invocation line');
  // The env vars are on the same line as the claude command
  const claudeLineIndex = lines.indexOf(claudeLine);
  const fullCommand = lines.slice(Math.max(0, claudeLineIndex - 1), claudeLineIndex + 3).join(' ');
  assert.ok(fullCommand.includes('ECC_SKIP_OBSERVE=1'), 'claude invocation should include ECC_SKIP_OBSERVE=1 guard');
  assert.ok(fullCommand.includes('ECC_HOOK_PROFILE=minimal'), 'claude invocation should include ECC_HOOK_PROFILE=minimal guard');
});

// ──────────────────────────────────────────────────────
// Summary
// ──────────────────────────────────────────────────────

console.log('\n=== Test Results ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}\n`);

process.exit(failed > 0 ? 1 : 0);
