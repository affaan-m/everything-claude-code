/**
 * Tests for observe.sh subdirectory project detection fix
 *
 * Validates that when cwd is a subdirectory of a git repo, observe.sh
 * resolves CLAUDE_PROJECT_DIR to the git repo root — not the subdirectory.
 * This prevents bogus project entries in projects.json.
 *
 * Run with: node tests/hooks/observe-subdirectory-detection.test.js
 */

// Skip on Windows — these tests invoke bash scripts directly
if (process.platform === 'win32') {
  console.log('Skipping bash-dependent observe tests on Windows\n');
  process.exit(0);
}

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');

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
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-observe-subdir-test-'));
}

function cleanupDir(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }
}

function toBashPath(filePath) {
  if (process.platform !== 'win32') {
    return filePath;
  }
  return String(filePath)
    .replace(/^([A-Za-z]):/, (_, driveLetter) => `/${driveLetter.toLowerCase()}`)
    .replace(/\\/g, '/');
}

function runBash(command) {
  return execFileSync('bash', ['-lc', command]).toString().trim();
}

function gitInit(dir) {
  execFileSync('git', ['init'], { cwd: dir, stdio: 'pipe' });
  execFileSync('git', ['commit', '--allow-empty', '-m', 'init'], {
    cwd: dir,
    stdio: 'pipe',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Test',
      GIT_AUTHOR_EMAIL: 'test@test.com',
      GIT_COMMITTER_NAME: 'Test',
      GIT_COMMITTER_EMAIL: 'test@test.com',
    },
  });
}

const repoRoot = path.resolve(__dirname, '..', '..');
const observeShPath = path.join(
  repoRoot,
  'skills',
  'continuous-learning-v2',
  'hooks',
  'observe.sh'
);

console.log('\n=== Observe.sh Subdirectory Project Detection Tests ===\n');

// ──────────────────────────────────────────────────────
// Group 1: Content check — observe.sh resolves git root
// ──────────────────────────────────────────────────────

console.log('--- Content checks on observe.sh ---');

test('observe.sh resolves cwd to git root before setting CLAUDE_PROJECT_DIR', () => {
  const content = fs.readFileSync(observeShPath, 'utf8');
  assert.ok(
    content.includes('git -C "$STDIN_CWD" rev-parse --show-toplevel'),
    'observe.sh should resolve STDIN_CWD to git repo root with git -C'
  );
});

test('observe.sh falls back to raw cwd when not in a git repo', () => {
  const content = fs.readFileSync(observeShPath, 'utf8');
  assert.ok(
    content.includes('${_GIT_ROOT:-$STDIN_CWD}'),
    'observe.sh should fall back to STDIN_CWD when git root is unavailable'
  );
});

// ──────────────────────────────────────────────────────
// Group 2: Behavior test — git root resolution from subdirectory
// ──────────────────────────────────────────────────────

console.log('\n--- Behavior: git root resolution from subdirectory ---');

test('git rev-parse --show-toplevel resolves subdirectory to repo root', () => {
  const testDir = createTempDir();

  try {
    const repoDir = path.join(testDir, 'my-repo');
    fs.mkdirSync(repoDir, { recursive: true });
    gitInit(repoDir);

    const subDir = path.join(repoDir, 'docs', 'api');
    fs.mkdirSync(subDir, { recursive: true });

    const result = execFileSync('git', ['-C', subDir, 'rev-parse', '--show-toplevel'])
      .toString()
      .trim();

    const normalizedResult = fs.realpathSync(result);
    const normalizedRepo = fs.realpathSync(repoDir);
    assert.strictEqual(
      normalizedResult,
      normalizedRepo,
      `Expected git root "${normalizedRepo}", got "${normalizedResult}"`
    );
  } finally {
    cleanupDir(testDir);
  }
});

test('git rev-parse fails gracefully outside a git repo', () => {
  const testDir = createTempDir();

  try {
    const result = runBash(
      `git -C "${toBashPath(testDir)}" rev-parse --show-toplevel 2>/dev/null || echo ""`
    );
    assert.strictEqual(result, '', 'Should return empty string outside a git repo');
  } finally {
    cleanupDir(testDir);
  }
});

// ──────────────────────────────────────────────────────
// Group 3: E2E — observe.sh cwd extraction with subdirectory
// ──────────────────────────────────────────────────────

console.log('\n--- E2E: observe.sh cwd resolution ---');

test('observe.sh sets CLAUDE_PROJECT_DIR to git root, not subdirectory', () => {
  const testDir = createTempDir();

  try {
    const repoDir = path.join(testDir, 'my-repo');
    fs.mkdirSync(repoDir, { recursive: true });
    gitInit(repoDir);

    const subDir = path.join(repoDir, 'src', 'components');
    fs.mkdirSync(subDir, { recursive: true });

    // Simulate the cwd extraction + git root resolution logic from observe.sh
    const script = [
      `STDIN_CWD="${toBashPath(subDir)}"`,
      'if [ -n "$STDIN_CWD" ] && [ -d "$STDIN_CWD" ]; then',
      '  _GIT_ROOT=$(git -C "$STDIN_CWD" rev-parse --show-toplevel 2>/dev/null || true)',
      '  CLAUDE_PROJECT_DIR="${_GIT_ROOT:-$STDIN_CWD}"',
      'fi',
      'echo "$CLAUDE_PROJECT_DIR"',
    ].join('\n');

    const result = runBash(script);

    const normalizedResult = fs.realpathSync(result);
    const normalizedRepo = fs.realpathSync(repoDir);
    assert.strictEqual(
      normalizedResult,
      normalizedRepo,
      `CLAUDE_PROJECT_DIR should be repo root "${normalizedRepo}", got "${normalizedResult}"`
    );
  } finally {
    cleanupDir(testDir);
  }
});

test('observe.sh keeps raw cwd when not in a git repo', () => {
  const testDir = createTempDir();

  try {
    const nonGitDir = path.join(testDir, 'plain-dir', 'sub');
    fs.mkdirSync(nonGitDir, { recursive: true });

    const script = [
      `STDIN_CWD="${toBashPath(nonGitDir)}"`,
      'if [ -n "$STDIN_CWD" ] && [ -d "$STDIN_CWD" ]; then',
      '  _GIT_ROOT=$(git -C "$STDIN_CWD" rev-parse --show-toplevel 2>/dev/null || true)',
      '  CLAUDE_PROJECT_DIR="${_GIT_ROOT:-$STDIN_CWD}"',
      'fi',
      'echo "$CLAUDE_PROJECT_DIR"',
    ].join('\n');

    const result = runBash(script);

    const normalizedResult = fs.realpathSync(result);
    const normalizedDir = fs.realpathSync(nonGitDir);
    assert.strictEqual(
      normalizedResult,
      normalizedDir,
      `CLAUDE_PROJECT_DIR should be raw cwd "${normalizedDir}", got "${normalizedResult}"`
    );
  } finally {
    cleanupDir(testDir);
  }
});

// ──────────────────────────────────────────────────────
// Summary
// ──────────────────────────────────────────────────────

console.log('\n=== Test Results ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}\n`);

process.exit(failed > 0 ? 1 : 0);
