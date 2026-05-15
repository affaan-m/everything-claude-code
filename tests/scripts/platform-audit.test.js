/**
 * Tests for scripts/platform-audit.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'platform-audit.js');

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanup(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function writeFile(rootDir, relativePath, content) {
  const targetPath = path.join(rootDir, relativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content);
}

function seedRepo(rootDir, overrides = {}) {
  const files = {
    'package.json': JSON.stringify({
      name: 'everything-claude-code',
      scripts: {
        'platform:audit': 'node scripts/platform-audit.js',
        'observability:ready': 'node scripts/observability-readiness.js',
        'security:ioc-scan': 'node scripts/ci/scan-supply-chain-iocs.js',
        'harness:audit': 'node scripts/harness-audit.js'
      }
    }, null, 2),
    'docs/ECC-2.0-GA-ROADMAP.md': [
      'ECC Platform Roadmap',
      'https://linear.app/itomarkets/project/ecc-platform-roadmap-52b328ee03e1',
      'ITO-44',
      'ITO-59'
    ].join('\n'),
    'docs/architecture/progress-sync-contract.md': [
      'GitHub PRs/issues/discussions',
      'Linear project',
      'local handoff',
      'repo roadmap',
      'scripts/work-items.js'
    ].join('\n'),
    'docs/security/supply-chain-incident-response.md': [
      'TanStack',
      'Mini Shai-Hulud',
      'node-ipc',
      'scan-supply-chain-iocs.js'
    ].join('\n'),
    'docs/releases/2.0.0-rc.1/publication-evidence-2026-05-15.md': [
      'TanStack',
      'Mini Shai-Hulud',
      'Node IPC follow-up',
      'node-ipc',
      'IOC scan'
    ].join('\n')
  };

  for (const [relativePath, content] of Object.entries({ ...files, ...overrides })) {
    if (content === null) {
      continue;
    }
    writeFile(rootDir, relativePath, content);
  }
}

function writeGhShim(rootDir, responses) {
  const shimPath = path.join(rootDir, 'gh-shim.js');
  fs.writeFileSync(shimPath, `
const responses = ${JSON.stringify(responses)};
const args = process.argv.slice(2);
const key = args.join(' ');
if (process.env.GITHUB_TOKEN) {
  console.error('GITHUB_TOKEN should be unset by default');
  process.exit(42);
}
if (!Object.prototype.hasOwnProperty.call(responses, key)) {
  console.error('Unexpected gh args: ' + key);
  process.exit(3);
}
process.stdout.write(JSON.stringify(responses[key]));
`);
  return shimPath;
}

function run(args = [], options = {}) {
  const env = {
    ...process.env,
    ...(options.env || {})
  };

  return execFileSync('node', [SCRIPT, ...args], {
    cwd: options.cwd || path.join(__dirname, '..', '..'),
    env,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 10000
  });
}

function runProcess(args = [], options = {}) {
  const env = {
    ...process.env,
    ...(options.env || {})
  };

  return spawnSync('node', [SCRIPT, ...args], {
    cwd: options.cwd || path.join(__dirname, '..', '..'),
    env,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 10000
  });
}

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS ${name}`);
    return true;
  } catch (error) {
    console.log(`  FAIL ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function runTests() {
  console.log('\n=== Testing platform-audit.js ===\n');

  let passed = 0;
  let failed = 0;

  if (test('parseArgs accepts supported flags and rejects invalid values', () => {
    const { parseArgs } = require(SCRIPT);
    const rootDir = createTempDir('platform-audit-args-');

    try {
      const parsed = parseArgs([
        'node',
        'script',
        '--format=json',
        `--root=${rootDir}`,
        '--repo',
        'affaan-m/everything-claude-code',
        '--max-open-prs',
        '5',
        '--max-open-issues',
        '6',
        '--allow-untracked',
        'docs/drafts/'
      ]);

      assert.strictEqual(parsed.format, 'json');
      assert.strictEqual(parsed.root, path.resolve(rootDir));
      assert.deepStrictEqual(parsed.repos, ['affaan-m/everything-claude-code']);
      assert.strictEqual(parsed.thresholds.maxOpenPrs, 5);
      assert.strictEqual(parsed.thresholds.maxOpenIssues, 6);
      assert.deepStrictEqual(parsed.allowUntracked, ['docs/drafts/']);

      assert.throws(() => parseArgs(['node', 'script', '--format', 'xml']), /Invalid format/);
      assert.throws(() => parseArgs(['node', 'script', '--repo']), /--repo requires a value/);
      assert.throws(() => parseArgs(['node', 'script', '--max-open-prs', 'x']), /Invalid --max-open-prs/);
      assert.throws(() => parseArgs(['node', 'script', '--unknown']), /Unknown argument/);
    } finally {
      cleanup(rootDir);
    }
  })) passed++; else failed++;

  if (test('skip-github report checks local release and security evidence', () => {
    const projectRoot = createTempDir('platform-audit-local-');

    try {
      seedRepo(projectRoot);
      const parsed = JSON.parse(run(['--format=json', `--root=${projectRoot}`, '--skip-github'], { cwd: projectRoot }));

      assert.strictEqual(parsed.schema_version, 'ecc.platform-audit.v1');
      assert.strictEqual(parsed.ready, true);
      assert.strictEqual(parsed.github.skipped, true);
      assert.ok(parsed.checks.some(check => check.id === 'roadmap-linear-mirror' && check.status === 'pass'));
      assert.ok(parsed.checks.some(check => check.id === 'supply-chain-runbook' && check.status === 'pass'));
      assert.deepStrictEqual(parsed.top_actions, []);
    } finally {
      cleanup(projectRoot);
    }
  })) passed++; else failed++;

  if (test('github queue and discussion budgets pass with maintainer touch', () => {
    const projectRoot = createTempDir('platform-audit-github-pass-');

    try {
      seedRepo(projectRoot);
      const shimPath = writeGhShim(projectRoot, {
        'pr list --repo affaan-m/everything-claude-code --state open --json number,title,isDraft,mergeStateStatus,updatedAt,url,author': [],
        'issue list --repo affaan-m/everything-claude-code --state open --json number,title,updatedAt,url,author,labels': [],
        'api graphql -f owner=affaan-m -f name=everything-claude-code -F first=100 -f query=query($owner: String!, $name: String!, $first: Int!) { repository(owner: $owner, name: $name) { hasDiscussionsEnabled discussions(first: $first, orderBy: {field: UPDATED_AT, direction: DESC}) { totalCount nodes { number title url updatedAt authorAssociation comments(first: 20) { nodes { authorAssociation } } } } } }': {
          data: {
            repository: {
              hasDiscussionsEnabled: true,
              discussions: {
                totalCount: 1,
                nodes: [
                  {
                    number: 73,
                    title: 'Compacting during workflow',
                    url: 'https://github.com/example/discussions/73',
                    updatedAt: '2026-05-15T00:00:00Z',
                    authorAssociation: 'NONE',
                    comments: { nodes: [{ authorAssociation: 'OWNER' }] }
                  }
                ]
              }
            }
          }
        }
      });

      const parsed = JSON.parse(run([
        '--format=json',
        `--root=${projectRoot}`,
        '--repo',
        'affaan-m/everything-claude-code'
      ], {
        cwd: projectRoot,
        env: {
          ECC_GH_SHIM: shimPath,
          GITHUB_TOKEN: 'must-be-removed'
        }
      }));

      assert.strictEqual(parsed.ready, true);
      assert.strictEqual(parsed.github.totals.openPrs, 0);
      assert.strictEqual(parsed.github.totals.openIssues, 0);
      assert.strictEqual(parsed.github.totals.discussionsNeedingMaintainerTouch, 0);
      assert.ok(parsed.checks.some(check => check.id === 'github-discussion-touch' && check.status === 'pass'));
    } finally {
      cleanup(projectRoot);
    }
  })) passed++; else failed++;

  if (test('threshold failures and untouched discussions become top actions', () => {
    const projectRoot = createTempDir('platform-audit-github-fail-');

    try {
      seedRepo(projectRoot);
      const prs = Array.from({ length: 3 }, (_, index) => ({
        number: index + 1,
        title: `PR ${index + 1}`,
        isDraft: false,
        mergeStateStatus: 'CLEAN',
        updatedAt: '2026-05-15T00:00:00Z',
        url: `https://github.com/example/pull/${index + 1}`,
        author: { login: 'contributor' }
      }));
      const shimPath = writeGhShim(projectRoot, {
        'pr list --repo affaan-m/everything-claude-code --state open --json number,title,isDraft,mergeStateStatus,updatedAt,url,author': prs,
        'issue list --repo affaan-m/everything-claude-code --state open --json number,title,updatedAt,url,author,labels': [],
        'api graphql -f owner=affaan-m -f name=everything-claude-code -F first=100 -f query=query($owner: String!, $name: String!, $first: Int!) { repository(owner: $owner, name: $name) { hasDiscussionsEnabled discussions(first: $first, orderBy: {field: UPDATED_AT, direction: DESC}) { totalCount nodes { number title url updatedAt authorAssociation comments(first: 20) { nodes { authorAssociation } } } } } }': {
          data: {
            repository: {
              hasDiscussionsEnabled: true,
              discussions: {
                totalCount: 1,
                nodes: [
                  {
                    number: 1239,
                    title: 'Losing context',
                    url: 'https://github.com/example/discussions/1239',
                    updatedAt: '2026-05-15T00:00:00Z',
                    authorAssociation: 'NONE',
                    comments: { nodes: [] }
                  }
                ]
              }
            }
          }
        }
      });

      const parsed = JSON.parse(run([
        '--format=json',
        `--root=${projectRoot}`,
        '--repo',
        'affaan-m/everything-claude-code',
        '--max-open-prs',
        '2'
      ], {
        cwd: projectRoot,
        env: { ECC_GH_SHIM: shimPath }
      }));

      assert.strictEqual(parsed.ready, false);
      assert.ok(parsed.top_actions.some(action => action.id === 'github-open-pr-budget'));
      assert.ok(parsed.top_actions.some(action => action.id === 'github-discussion-touch'));
      assert.strictEqual(parsed.github.totals.discussionsNeedingMaintainerTouch, 1);
    } finally {
      cleanup(projectRoot);
    }
  })) passed++; else failed++;

  if (test('cli help and invalid args exit cleanly', () => {
    const help = runProcess(['--help']);
    assert.strictEqual(help.status, 0);
    assert.ok(help.stdout.includes('Usage: node scripts/platform-audit.js'));

    const invalid = runProcess(['--format', 'xml']);
    assert.strictEqual(invalid.status, 1);
    assert.ok(invalid.stderr.includes('Invalid format'));
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}
