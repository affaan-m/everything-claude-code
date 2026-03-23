const assert = require('assert');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../..');
const opencodeDir = path.join(repoRoot, '.opencode');
const distModule = path.join(opencodeDir, 'dist', 'plugins', 'session-completion.js');

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

async function loadModule() {
  if (!fs.existsSync(distModule)) {
    const r = spawnSync('npm', ['run', 'build'], { cwd: opencodeDir, encoding: 'utf8' });
    if (r.status !== 0) {
      throw new Error(`build failed: ${r.stderr || r.stdout}`);
    }
  }
  return import(pathToFileURL(distModule).href);
}

async function runTests() {
  console.log('\n=== Testing session-completion (OpenCode plugin) ===\n');

  const { validateSessionWebhookUrl, postSessionWebhookWithTimeout } = await loadModule();

  let passed = 0;
  let failed = 0;

  if (test('validateSessionWebhookUrl accepts https URL', () => {
    assert.strictEqual(
      validateSessionWebhookUrl('https://example.com/webhook'),
      'https://example.com/webhook'
    );
  })) passed++; else failed++;

  if (test('validateSessionWebhookUrl accepts http URL', () => {
    assert.strictEqual(
      validateSessionWebhookUrl('http://127.0.0.1:3000/hook'),
      'http://127.0.0.1:3000/hook'
    );
  })) passed++; else failed++;

  if (test('validateSessionWebhookUrl rejects empty', () => {
    assert.strictEqual(validateSessionWebhookUrl(''), null);
    assert.strictEqual(validateSessionWebhookUrl('   '), null);
    assert.strictEqual(validateSessionWebhookUrl(undefined), null);
  })) passed++; else failed++;

  if (test('validateSessionWebhookUrl rejects non-http(s)', () => {
    assert.strictEqual(validateSessionWebhookUrl('javascript:alert(1)'), null);
    assert.strictEqual(validateSessionWebhookUrl('file:///etc/passwd'), null);
    assert.strictEqual(validateSessionWebhookUrl('ftp://example.com/x'), null);
  })) passed++; else failed++;

  if (test('validateSessionWebhookUrl rejects URL with userinfo', () => {
    assert.strictEqual(validateSessionWebhookUrl('https://user:pass@example.com/hook'), null);
  })) passed++; else failed++;

  if (test('validateSessionWebhookUrl rejects overly long string', () => {
    assert.strictEqual(validateSessionWebhookUrl('https://x.com/' + 'a'.repeat(5000)), null);
  })) passed++; else failed++;

  await new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let data = '';
      req.on('data', (c) => { data += c; });
      req.on('end', () => {
        assert.ok(data.includes('"filesChanged"') || data.length > 0);
        res.writeHead(201);
        res.end('ok');
      });
    });
    server.listen(0, '127.0.0.1', async () => {
      const { port } = server.address();
      const url = `http://127.0.0.1:${port}/notify`;
      try {
        const result = await postSessionWebhookWithTimeout(
          url,
          { filesChanged: 1, warnings: [] },
          5000
        );
        if (test('postSessionWebhookWithTimeout succeeds against local server', () => {
          assert.strictEqual(result.ok, true);
          assert.strictEqual(result.status, 201);
        })) passed++; else failed++;
      } catch (e) {
        console.log(`  ✗ postSessionWebhookWithTimeout local server`);
        console.log(`    Error: ${e.message}`);
        failed++;
      }
      server.close(() => resolve());
    });
  });

  await new Promise((resolve) => {
    const server = http.createServer(() => {});
    server.listen(0, '127.0.0.1', async () => {
      const { port } = server.address();
      const url = `http://127.0.0.1:${port}/`;
      try {
        const result = await postSessionWebhookWithTimeout(url, {}, 50);
        if (test('postSessionWebhookWithTimeout times out on slow response', () => {
          assert.strictEqual(result.ok, false);
          assert.ok(result.error.includes('timeout'));
        })) passed++; else failed++;
      } catch (e) {
        console.log(`  ✗ postSessionWebhookWithTimeout timeout`);
        console.log(`    Error: ${e.message}`);
        failed++;
      }
      server.close(() => resolve());
    });
  });

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
