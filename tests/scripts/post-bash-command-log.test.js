const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'hooks', 'post-bash-command-log.js');
const { sanitizeCommand } = require(scriptPath);

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
    return true;
  } catch (error) {
    console.log(`FAIL: ${name}`);
    console.log(`  ${error.message}`);
    return false;
  }
}

function runHook(mode, payload, homeDir) {
  return spawnSync('node', [scriptPath, mode], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: {
      ...process.env,
      HOME: homeDir,
      USERPROFILE: homeDir,
    },
  });
}

let passed = 0;
let failed = 0;

if (
  test('sanitizeCommand redacts common secret formats', () => {
    const input = 'gh pr create --token abc123 Authorization: Bearer hello password=swordfish ghp_abc github_pat_xyz';
    const sanitized = sanitizeCommand(input);
    assert.ok(!sanitized.includes('abc123'));
    assert.ok(!sanitized.includes('swordfish'));
    assert.ok(!sanitized.includes('ghp_abc'));
    assert.ok(!sanitized.includes('github_pat_xyz'));
    assert.ok(sanitized.includes('--token=<REDACTED>'));
    assert.ok(sanitized.includes('Authorization:<REDACTED>'));
    assert.ok(sanitized.includes('password=<REDACTED>'));
  })
)
  passed++;
else failed++;

if (
  test('audit mode logs sanitized bash commands and preserves stdout', () => {
    const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-bash-log-'));
    const payload = {
      tool_input: {
        command: 'git push --token abc123',
      },
    };

    try {
      const result = runHook('audit', payload, homeDir);
      assert.strictEqual(result.status, 0, result.stdout + result.stderr);
      assert.strictEqual(result.stdout, JSON.stringify(payload));

      const logFile = path.join(homeDir, '.claude', 'bash-commands.log');
      const logContent = fs.readFileSync(logFile, 'utf8');
      assert.ok(logContent.includes('--token=<REDACTED>'));
      assert.ok(!logContent.includes('abc123'));
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })
)
  passed++;
else failed++;

if (
  test('cost mode writes command metrics log', () => {
    const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-cost-log-'));
    const payload = {
      tool_input: {
        command: 'npm publish',
      },
    };

    try {
      const result = runHook('cost', payload, homeDir);
      assert.strictEqual(result.status, 0, result.stdout + result.stderr);

      const logFile = path.join(homeDir, '.claude', 'cost-tracker.log');
      const logContent = fs.readFileSync(logFile, 'utf8');
      assert.match(logContent, /tool=Bash command=npm publish/);
    } finally {
      fs.rmSync(homeDir, { recursive: true, force: true });
    }
  })
)
  passed++;
else failed++;

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
