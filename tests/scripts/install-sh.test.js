/**
 * Tests for install.sh wrapper delegation
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const SCRIPT = path.join(__dirname, '..', '..', 'install.sh');

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanup(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function run(args = [], options = {}) {
  const env = {
    ...process.env,
    HOME: options.homeDir || process.env.HOME,
  };

  try {
    const stdout = execFileSync('bash', [SCRIPT, ...args], {
      cwd: options.cwd,
      env,
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

function runTests() {
  console.log('\n=== Testing install.sh ===\n');

  let passed = 0;
  let failed = 0;

  if (process.platform === 'win32') {
    console.log('  - skipped on Windows; install.ps1 covers the native wrapper path');
    console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
    process.exit(0);
  }

  if (test('delegates to the Node installer and preserves dry-run output', () => {
    const homeDir = createTempDir('install-sh-home-');
    const projectDir = createTempDir('install-sh-project-');

    try {
      const result = run(['--target', 'cursor', '--dry-run', 'typescript'], {
        cwd: projectDir,
        homeDir,
      });

      assert.strictEqual(result.code, 0, result.stderr);
      assert.ok(result.stdout.includes('Dry-run install plan'));
      assert.ok(!fs.existsSync(path.join(projectDir, '.cursor', 'hooks.json')));
    } finally {
      cleanup(homeDir);
      cleanup(projectDir);
    }
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
