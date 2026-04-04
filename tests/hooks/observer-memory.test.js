/**
 * Tests for observer memory explosion fix (#521)
 *
 * Validates three fixes:
 * 1. Sentinel file throttling in observe.sh (signal counter + trigger file)
 * 2. Tail-based sampling in observer-loop.sh (not loading entire file)
 * 3. Re-entrancy guard + cooldown in observer-loop.sh process_trigger_or_periodic()
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
// Test group 1: observe.sh sentinel file throttling
// ──────────────────────────────────────────────────────

console.log('--- observe.sh sentinel file throttling ---');

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
  assert.ok(content.includes('if [ "$should_signal" -eq 1 ]'), 'observe.sh should gate trigger file creation behind should_signal check');
});

test('observe.sh default throttle is 20 observations per signal', () => {
  const content = fs.readFileSync(observeShPath, 'utf8');
  assert.ok(content.includes('ECC_OBSERVER_SIGNAL_EVERY_N:-20'), 'Default signal frequency should be every 20 observations');
});

test('observe.sh touches observer activity marker on each observation', () => {
  const content = fs.readFileSync(observeShPath, 'utf8');
  assert.ok(content.includes('ACTIVITY_FILE="${PROJECT_DIR}/.observer-last-activity"'), 'observe.sh should define a project-scoped activity marker');
  assert.ok(content.includes('touch "$ACTIVITY_FILE"'), 'observe.sh should update activity marker during observation capture');
});

test('observe.sh uses trigger file instead of SIGUSR1', () => {
  const content = fs.readFileSync(observeShPath, 'utf8');
  assert.ok(content.includes('TRIGGER_FILE="${PROJECT_DIR}/.observer-trigger"'), 'observe.sh should define a trigger file path');
  assert.ok(content.includes('touch "$TRIGGER_FILE"'), 'observe.sh should create the trigger file to signal the observer');
});

// ──────────────────────────────────────────────────────
// Test group 2: observer-loop.sh re-entrancy guard
// ──────────────────────────────────────────────────────

console.log('\n--- observer-loop.sh re-entrancy guard ---');

test('observer-loop.sh defines ANALYZING guard variable', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('ANALYZING=0'), 'observer-loop.sh should initialize ANALYZING=0');
});

test('process_trigger_or_periodic checks ANALYZING before starting analysis', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('if [ "$ANALYZING" -eq 1 ]'), 'process_trigger_or_periodic should check ANALYZING flag');
  // The re-entrancy guard uses a silent return (no log message needed;
  // the sentinel file approach polls every cycle, so logging would be noisy).
});

test('process_trigger_or_periodic sets ANALYZING=1 before and ANALYZING=0 after analysis', () => {
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

test('process_trigger_or_periodic enforces cooldown between analyses', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('LAST_ANALYSIS_EPOCH'), 'Should track last analysis time');
  assert.ok(content.includes('ANALYSIS_COOLDOWN'), 'Should define cooldown duration');
  assert.ok(content.includes('elapsed=$(( now_epoch - LAST_ANALYSIS_EPOCH ))'), 'Should compute elapsed time since last analysis');
  assert.ok(content.includes('if [ "$elapsed" -lt "$ANALYSIS_COOLDOWN" ]'), 'Should skip analysis if cooldown has not elapsed');
});

test('default cooldown is 60 seconds', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('ECC_OBSERVER_ANALYSIS_COOLDOWN:-60'), 'Default cooldown should be 60 seconds');
});

test('observer-loop.sh defines idle timeout fallback', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('IDLE_TIMEOUT_SECONDS'), 'observer-loop.sh should define an idle timeout');
  assert.ok(content.includes('ECC_OBSERVER_IDLE_TIMEOUT_SECONDS:-1800'), 'Default idle timeout should be 30 minutes');
});

test('observer-loop.sh checks session lease directory before self-termination', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('SESSION_LEASE_DIR="${PROJECT_DIR}/.observer-sessions"'), 'observer-loop.sh should track active observer session leases');
  assert.ok(content.includes('has_active_session_leases'), 'observer-loop.sh should define active session lease checks');
  assert.ok(content.includes('exit_if_idle_without_sessions'), 'observer-loop.sh should define idle self-termination helper');
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

test('observer-loop uses project-local temp directory for analysis artifacts', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('observer_tmp_dir="${PROJECT_DIR}/.observer-tmp"'), 'Should keep observer temp files inside the project');
  assert.ok(content.includes('mktemp "${observer_tmp_dir}/ecc-observer-analysis.'), 'Analysis temp file should use the project temp dir');
  assert.ok(content.includes('mktemp "${observer_tmp_dir}/ecc-observer-prompt.'), 'Prompt temp file should use the project temp dir');
});

test('observer-loop prompt requires direct instinct writes without asking permission', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  const heredocStart = content.indexOf('cat > "$prompt_file" <<PROMPT');
  const heredocEnd = content.indexOf('\nPROMPT', heredocStart + 1);
  assert.ok(heredocStart > 0, 'Should find prompt heredoc start');
  assert.ok(heredocEnd > heredocStart, 'Should find prompt heredoc end');
  const promptSection = content.substring(heredocStart, heredocEnd);
  assert.ok(promptSection.includes('MUST write an instinct file directly'), 'Prompt should require direct file creation');
  assert.ok(promptSection.includes('Do NOT ask for permission'), 'Prompt should forbid permission-seeking');
  assert.ok(promptSection.includes('write or update the instinct file in this run'), 'Prompt should require same-run writes');
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
  assert.ok(promptSection.includes('${analysis_relpath}'), 'Prompt should point Claude at the sampled analysis file (via relative path), not the full observations file');
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
// Test group 8: Windows compatibility checks
// ──────────────────────────────────────────────────────

console.log('\n--- Windows compatibility ---');

test('observer-loop.sh uses TRIGGER_FILE instead of SIGUSR1', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('TRIGGER_FILE'), 'observer-loop.sh should define TRIGGER_FILE');
  assert.ok(!content.includes('SIGUSR1'), 'observer-loop.sh should not reference SIGUSR1 (not available on Windows)');
  assert.ok(!content.includes('trap.*USR1'), 'observer-loop.sh should not trap USR1 signal');
  assert.ok(!content.includes('kill.*USR1'), 'observer-loop.sh should not send USR1 signal');
});

test('observer-loop.sh polls for TRIGGER_FILE in main loop', () => {
  const content = fs.readFileSync(observerLoopPath, 'utf8');
  assert.ok(content.includes('if [ -f "$TRIGGER_FILE" ]'), 'observer-loop.sh should check for trigger file in main loop');
  assert.ok(content.includes('rm -f "$TRIGGER_FILE"'), 'observer-loop.sh should remove trigger file after processing');
});

test('observe.sh does not use kill -USR1', () => {
  const content = fs.readFileSync(observeShPath, 'utf8');
  assert.ok(!content.includes('kill -USR1'), 'observe.sh should not send USR1 signal (not available on Windows)');
});

test('observe.sh _bg_launch falls back to disown when nohup is unavailable', () => {
  const content = fs.readFileSync(observeShPath, 'utf8');
  assert.ok(content.includes('command -v nohup'), 'observe.sh should check for nohup availability');
  assert.ok(content.includes('& disown'), 'observe.sh should fall back to disown when nohup is unavailable');
});

test('start-observer.sh detects Windows and avoids nohup', () => {
  const startObserverPath = path.join(repoRoot, 'skills', 'continuous-learning-v2', 'agents', 'start-observer.sh');
  const content = fs.readFileSync(startObserverPath, 'utf8');
  assert.ok(content.includes('IS_WINDOWS=false'), 'start-observer.sh should initialize IS_WINDOWS');
  assert.ok(content.includes('*mingw*|*msys*|*cygwin*'), 'start-observer.sh should detect Windows via uname');
  assert.ok(content.includes('& disown'), 'start-observer.sh should use disown on Windows instead of nohup');
});

test('observe.sh flock fallback reaches mkdir on Windows', () => {
  const content = fs.readFileSync(observeShPath, 'utf8');
  assert.ok(content.includes('command -v flock'), 'observe.sh should check for flock availability');
  assert.ok(content.includes('mkdir "${LAZY_START_LOCK}.d"'), 'observe.sh should fall back to mkdir-based locking');
});

test('observe.sh resolve_python_cmd tries python first on Windows', () => {
  const content = fs.readFileSync(observeShPath, 'utf8');
  const windowsBranch = content.indexOf('*mingw*|*msys*|*cygwin*');
  assert.ok(windowsBranch > 0, 'resolve_python_cmd should have a Windows detection branch');
  // Skip past the case pattern line (which ends with *) ) to find the actual branch content
  const newlineAfterPattern = content.indexOf(String.fromCharCode(10), windowsBranch);
  const branchContentStart = newlineAfterPattern + 1;
  const branchEnd = content.indexOf(';;', branchContentStart);
  const branchSection = content.substring(branchContentStart, branchEnd);
  const pythonPos = branchSection.indexOf('command -v python');
  const python3Pos = branchSection.indexOf('command -v python3');
  assert.ok(pythonPos > 0, 'Windows branch should try python');
  assert.ok(python3Pos > pythonPos, 'Windows branch should try python before python3');
});

// ──────────────────────────────────────────────────────
// Summary
// ──────────────────────────────────────────────────────

console.log('\n=== Test Results ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}\n`);

process.exit(failed > 0 ? 1 : 0);
