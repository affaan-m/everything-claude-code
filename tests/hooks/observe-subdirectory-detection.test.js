/**
 * Tests for observe.sh subdirectory project detection.
 *
 * Runs the real hook and verifies that project metadata is attached to the git
 * root when cwd is a subdirectory inside a repository.
 */

if (process.platform === 'win32') {
  console.log('Skipping bash-dependent observe tests on Windows');
  process.exit(0);
}

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

let passed = 0;
let failed = 0;

const repoRoot = path.resolve(__dirname, '..', '..');
const observeShPath = path.join(
  repoRoot,
  'skills',
  'continuous-learning-v2',
  'hooks',
  'observe.sh'
);

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`FAIL: ${name}`);
    console.error(`  ${error.message}`);
    failed += 1;
  }
}

function createTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-observe-subdir-test-'));
}

function cleanupDir(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (error) {
    console.error(`[cleanupDir] failed to remove ${dir}: ${error.message}`);
  }
}

function normalizeComparablePath(filePath) {
  if (!filePath) {
    return filePath;
  }

  const normalized = fs.realpathSync(filePath);
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}

function gitInit(dir) {
  const initResult = spawnSync('git', ['init'], { cwd: dir, encoding: 'utf8' });
  assert.strictEqual(initResult.status, 0, initResult.stderr);

  const remoteResult = spawnSync(
    'git',
    ['remote', 'add', 'origin', 'https://github.com/example/ecc-test.git'],
    { cwd: dir, encoding: 'utf8' }
  );
  assert.strictEqual(remoteResult.status, 0, remoteResult.stderr);

  const commitResult = spawnSync('git', ['commit', '--allow-empty', '-m', 'init'], {
    cwd: dir,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Test',
      GIT_AUTHOR_EMAIL: 'test@test.com',
      GIT_COMMITTER_NAME: 'Test',
      GIT_COMMITTER_EMAIL: 'test@test.com',
    },
  });
  assert.strictEqual(commitResult.status, 0, commitResult.stderr);
}

function runObserve({ homeDir, cwd }) {
  const payload = JSON.stringify({
    tool_name: 'Read',
    tool_input: { file_path: 'README.md' },
    tool_response: 'ok',
    session_id: 'session-subdir-test',
    cwd,
  });

  return spawnSync('bash', [observeShPath, 'post'], {
    cwd: repoRoot,
    encoding: 'utf8',
    input: payload,
    env: {
      ...process.env,
      HOME: homeDir,
      USERPROFILE: homeDir,
      CLAUDE_PROJECT_DIR: '',
      CLAUDE_CODE_ENTRYPOINT: 'cli',
      ECC_HOOK_PROFILE: 'standard',
      ECC_SKIP_OBSERVE: '0',
    },
  });
}

function readSingleProjectMetadata(homeDir) {
  const projectsDir = path.join(homeDir, '.claude', 'homunculus', 'projects');
  const projectIds = fs.readdirSync(projectsDir);
  assert.strictEqual(projectIds.length, 1, 'Expected exactly one project directory');
  const projectDir = path.join(projectsDir, projectIds[0]);
  const projectMetadataPath = path.join(projectDir, 'project.json');
  assert.ok(fs.existsSync(projectMetadataPath), 'project.json should exist');

  return {
    projectDir,
    metadata: JSON.parse(fs.readFileSync(projectMetadataPath, 'utf8')),
  };
}

console.log('\n=== Observe.sh Subdirectory Project Detection Tests ===\n');

test('observe.sh resolves cwd to git root before setting CLAUDE_PROJECT_DIR', () => {
  const content = fs.readFileSync(observeShPath, 'utf8');
  assert.ok(
    content.includes('git -C "$STDIN_CWD" rev-parse --show-toplevel'),
    'observe.sh should resolve STDIN_CWD to git repo root'
  );
  assert.ok(
    content.includes('${_GIT_ROOT:-$STDIN_CWD}'),
    'observe.sh should fall back to raw cwd when git root is unavailable'
  );
});

test('git rev-parse resolves a subdirectory to the repo root', () => {
  const testDir = createTempDir();

  try {
    const repoDir = path.join(testDir, 'repo');
    const subDir = path.join(repoDir, 'docs', 'api');
    fs.mkdirSync(subDir, { recursive: true });
    gitInit(repoDir);

    const result = spawnSync('git', ['-C', subDir, 'rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
    });

    assert.strictEqual(result.status, 0, result.stderr);
    assert.strictEqual(
      normalizeComparablePath(result.stdout.trim()),
      normalizeComparablePath(repoDir),
      'git root should equal the repository root'
    );
  } finally {
    cleanupDir(testDir);
  }
});

test('git rev-parse fails cleanly outside a repo when discovery is bounded', () => {
  const testDir = createTempDir();

  try {
    const result = spawnSync(
      'bash',
      ['-lc', 'git -C "$TARGET_DIR" rev-parse --show-toplevel 2>/dev/null || echo ""'],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          TARGET_DIR: testDir,
          GIT_CEILING_DIRECTORIES: testDir,
        },
      }
    );

    assert.strictEqual(result.status, 0, result.stderr);
    assert.strictEqual(result.stdout.trim(), '', 'expected empty output outside a git repo');
  } finally {
    cleanupDir(testDir);
  }
});

test('observe.sh writes project metadata for the git root when cwd is a subdirectory', () => {
  const testRoot = createTempDir();

  try {
    const homeDir = path.join(testRoot, 'home');
    const repoDir = path.join(testRoot, 'repo');
    const subDir = path.join(repoDir, 'src', 'components');
    fs.mkdirSync(homeDir, { recursive: true });
    fs.mkdirSync(subDir, { recursive: true });
    gitInit(repoDir);

    const result = runObserve({ homeDir, cwd: subDir });
    assert.strictEqual(result.status, 0, result.stderr);

    const { metadata, projectDir } = readSingleProjectMetadata(homeDir);
    assert.strictEqual(
      normalizeComparablePath(metadata.root),
      normalizeComparablePath(repoDir),
      'project metadata root should be the repository root'
    );

    const observationsPath = path.join(projectDir, 'observations.jsonl');
    assert.ok(fs.existsSync(observationsPath), 'observe.sh should append an observation');
  } finally {
    cleanupDir(testRoot);
  }
});

test('observe.sh keeps the raw cwd when the directory is not inside a git repo', () => {
  const testRoot = createTempDir();

  try {
    const homeDir = path.join(testRoot, 'home');
    const nonGitDir = path.join(testRoot, 'plain', 'subdir');
    fs.mkdirSync(homeDir, { recursive: true });
    fs.mkdirSync(nonGitDir, { recursive: true });

    const result = runObserve({ homeDir, cwd: nonGitDir });
    assert.strictEqual(result.status, 0, result.stderr);

    const { metadata } = readSingleProjectMetadata(homeDir);
    assert.strictEqual(
      normalizeComparablePath(metadata.root),
      normalizeComparablePath(nonGitDir),
      'project metadata root should stay on the non-git cwd'
    );
  } finally {
    cleanupDir(testRoot);
  }
});

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);

process.exit(failed > 0 ? 1 : 0);
