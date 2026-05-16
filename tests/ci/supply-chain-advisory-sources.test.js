#!/usr/bin/env node
/**
 * Validate the supply-chain advisory source refresh report.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT_PATH = path.join(
  __dirname,
  '..',
  '..',
  'scripts',
  'ci',
  'supply-chain-advisory-sources.js',
);

const {
  DEFAULT_ADVISORY_SOURCES,
  buildAdvisorySourceReport,
} = require(SCRIPT_PATH);

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

async function run() {
  console.log('\n=== Testing supply-chain advisory source refresh ===\n');

  let passed = 0;
  let failed = 0;

  if (await test('default sources cover the active npm and PyPI campaign', async () => {
    const ids = DEFAULT_ADVISORY_SOURCES.map(source => source.id);
    for (const requiredId of [
      'tanstack-postmortem',
      'github-ghsa-g7cv-rxg3-hmpx',
      'stepsecurity-mini-shai-hulud',
      'openai-tanstack-response',
      'socket-node-ipc',
      'cisa-npm-compromise',
    ]) {
      assert.ok(ids.includes(requiredId), `Missing advisory source ${requiredId}`);
    }

    const ecosystemCoverage = new Set(DEFAULT_ADVISORY_SOURCES.flatMap(source => source.ecosystems));
    assert.ok(ecosystemCoverage.has('npm'));
    assert.ok(ecosystemCoverage.has('PyPI'));
    assert.ok(ecosystemCoverage.has('AI developer tooling'));
  })) passed++; else failed++;

  if (await test('offline report emits passing coverage checks and Linear-ready ITO-57 payload', async () => {
    const report = await buildAdvisorySourceReport({
      generatedAt: '2026-05-16T00:00:00.000Z',
      refresh: false,
    });

    assert.strictEqual(report.schema_version, 'ecc.supply-chain-advisory-sources.v1');
    assert.strictEqual(report.ready, true);
    assert.strictEqual(report.refresh.enabled, false);
    assert.ok(report.sources.length >= 8);
    assert.ok(report.checks.every(check => check.status === 'pass'));
    assert.strictEqual(report.linear.status.issueId, 'ITO-57');
    assert.match(report.linear.status.summary, /advisory sources current/i);
    assert.match(report.linear.status.remaining, /Linear status/i);
  })) passed++; else failed++;

  if (await test('refresh mode records per-source live check results', async () => {
    const calls = [];
    const report = await buildAdvisorySourceReport({
      generatedAt: '2026-05-16T00:00:00.000Z',
      refresh: true,
      fetchSource: async source => {
        calls.push(source.id);
        return {
          ok: true,
          statusCode: 200,
          finalUrl: source.url,
          checkedAt: '2026-05-16T00:00:00.000Z',
        };
      },
    });

    assert.deepStrictEqual(
      calls.sort(),
      DEFAULT_ADVISORY_SOURCES.filter(source => source.refresh !== false).map(source => source.id).sort(),
    );
    assert.strictEqual(report.refresh.enabled, true);
    assert.strictEqual(report.refresh.ok, true);
    assert.ok(report.sources.every(source => source.refreshStatus.status === 'ok'));
  })) passed++; else failed++;

  if (await test('refresh errors are captured as evidence without breaking offline source coverage', async () => {
    const report = await buildAdvisorySourceReport({
      generatedAt: '2026-05-16T00:00:00.000Z',
      refresh: true,
      fetchSource: async source => ({
        ok: source.id !== 'socket-node-ipc',
        statusCode: source.id === 'socket-node-ipc' ? 403 : 200,
        error: source.id === 'socket-node-ipc' ? 'forbidden' : null,
        finalUrl: source.url,
        checkedAt: '2026-05-16T00:00:00.000Z',
      }),
    });

    const socketSource = report.sources.find(source => source.id === 'socket-node-ipc');
    assert.strictEqual(report.ready, true);
    assert.strictEqual(report.refresh.ok, false);
    assert.strictEqual(socketSource.refreshStatus.status, 'warning');
    assert.match(socketSource.refreshStatus.error, /forbidden/);
    assert.ok(report.checks.some(check => check.id === 'advisory-refresh' && check.status === 'warn'));
  })) passed++; else failed++;

  if (await test('CLI JSON can be written as a scheduled workflow artifact', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecc-advisory-sources-'));
    const outputPath = path.join(tempDir, 'advisory-sources.json');
    try {
      const result = spawnSync('node', [
        SCRIPT_PATH,
        '--json',
        '--generated-at',
        '2026-05-16T00:00:00.000Z',
        '--write',
        outputPath,
      ], {
        encoding: 'utf8',
        shell: process.platform === 'win32',
      });

      assert.strictEqual(result.status, 0, result.stderr);
      const parsed = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      assert.strictEqual(parsed.schema_version, 'ecc.supply-chain-advisory-sources.v1');
      assert.strictEqual(parsed.ready, true);
      assert.ok(parsed.linear.status.evidence.length >= 3);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

run();
