/**
 * Tests for agent description compression and lazy loading.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  parseFrontmatter,
  extractSummary,
  loadAgent,
  loadAgents,
  compressToCatalog,
  compressToSummary,
  buildAgentCatalog,
  lazyLoadAgent,
} = require('../../scripts/lib/agent-compress');

function createTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanupTempDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

function writeAgent(dir, name, content) {
  fs.writeFileSync(path.join(dir, `${name}.md`), content, 'utf8');
}

const SAMPLE_AGENT = `---
name: test-agent
description: A test agent for unit testing purposes.
tools: ["Read", "Grep", "Glob"]
model: sonnet
---

You are a test agent that validates compression logic.

## Your Role

- Run unit tests
- Validate compression output
- Ensure correctness

## Process

### 1. Setup
- Prepare test fixtures
- Load agent files

### 2. Validate
Check the output format and content.
`;

const MINIMAL_AGENT = `---
name: minimal
description: Minimal agent.
tools: ["Read"]
model: haiku
---

Short body.
`;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  \u2713 ${name}`);
    return true;
  } catch (error) {
    console.log(`  \u2717 ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n=== Testing agent-compress ===\n');

  let passed = 0;
  let failed = 0;

  if (await test('parseFrontmatter extracts YAML frontmatter and body', async () => {
    const { frontmatter, body } = parseFrontmatter(SAMPLE_AGENT);
    assert.strictEqual(frontmatter.name, 'test-agent');
    assert.strictEqual(frontmatter.description, 'A test agent for unit testing purposes.');
    assert.deepStrictEqual(frontmatter.tools, ['Read', 'Grep', 'Glob']);
    assert.strictEqual(frontmatter.model, 'sonnet');
    assert.ok(body.includes('You are a test agent'));
  })) passed += 1; else failed += 1;

  if (await test('parseFrontmatter handles content without frontmatter', async () => {
    const { frontmatter, body } = parseFrontmatter('Just a plain document.');
    assert.deepStrictEqual(frontmatter, {});
    assert.strictEqual(body, 'Just a plain document.');
  })) passed += 1; else failed += 1;

  if (await test('extractSummary returns the first paragraph of the body', async () => {
    const { body } = parseFrontmatter(SAMPLE_AGENT);
    const summary = extractSummary(body);
    assert.ok(summary.includes('test agent'));
    assert.ok(summary.includes('compression logic'));
  })) passed += 1; else failed += 1;

  if (await test('extractSummary returns empty string for empty body', async () => {
    assert.strictEqual(extractSummary(''), '');
    assert.strictEqual(extractSummary('# Just a heading'), '');
  })) passed += 1; else failed += 1;

  if (await test('loadAgent reads and parses a single agent file', async () => {
    const tmpDir = createTempDir('ecc-agent-compress-');
    try {
      writeAgent(tmpDir, 'test-agent', SAMPLE_AGENT);
      const agent = loadAgent(path.join(tmpDir, 'test-agent.md'));
      assert.strictEqual(agent.name, 'test-agent');
      assert.strictEqual(agent.fileName, 'test-agent');
      assert.deepStrictEqual(agent.tools, ['Read', 'Grep', 'Glob']);
      assert.strictEqual(agent.model, 'sonnet');
      assert.ok(agent.byteSize > 0);
      assert.ok(agent.body.includes('You are a test agent'));
    } finally {
      cleanupTempDir(tmpDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('loadAgents reads all .md files from a directory', async () => {
    const tmpDir = createTempDir('ecc-agent-compress-');
    try {
      writeAgent(tmpDir, 'agent-a', SAMPLE_AGENT);
      writeAgent(tmpDir, 'agent-b', MINIMAL_AGENT);
      const agents = loadAgents(tmpDir);
      assert.strictEqual(agents.length, 2);
      assert.strictEqual(agents[0].fileName, 'agent-a');
      assert.strictEqual(agents[1].fileName, 'agent-b');
    } finally {
      cleanupTempDir(tmpDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('loadAgents returns empty array for non-existent directory', async () => {
    const agents = loadAgents('/tmp/nonexistent-ecc-dir-12345');
    assert.deepStrictEqual(agents, []);
  })) passed += 1; else failed += 1;

  if (await test('compressToCatalog strips body and keeps only metadata', async () => {
    const tmpDir = createTempDir('ecc-agent-compress-');
    try {
      writeAgent(tmpDir, 'test-agent', SAMPLE_AGENT);
      const agent = loadAgent(path.join(tmpDir, 'test-agent.md'));
      const catalog = compressToCatalog(agent);

      assert.strictEqual(catalog.name, 'test-agent');
      assert.strictEqual(catalog.description, 'A test agent for unit testing purposes.');
      assert.deepStrictEqual(catalog.tools, ['Read', 'Grep', 'Glob']);
      assert.strictEqual(catalog.model, 'sonnet');
      assert.strictEqual(catalog.body, undefined);
    } finally {
      cleanupTempDir(tmpDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('compressToSummary includes first paragraph summary', async () => {
    const tmpDir = createTempDir('ecc-agent-compress-');
    try {
      writeAgent(tmpDir, 'test-agent', SAMPLE_AGENT);
      const agent = loadAgent(path.join(tmpDir, 'test-agent.md'));
      const summary = compressToSummary(agent);

      assert.strictEqual(summary.name, 'test-agent');
      assert.ok(summary.summary.length > 0);
      assert.strictEqual(summary.body, undefined);
    } finally {
      cleanupTempDir(tmpDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('buildAgentCatalog in catalog mode produces minimal output with stats', async () => {
    const tmpDir = createTempDir('ecc-agent-compress-');
    try {
      writeAgent(tmpDir, 'agent-a', SAMPLE_AGENT);
      writeAgent(tmpDir, 'agent-b', MINIMAL_AGENT);

      const result = buildAgentCatalog(tmpDir, { mode: 'catalog' });
      assert.strictEqual(result.agents.length, 2);
      assert.strictEqual(result.stats.totalAgents, 2);
      assert.strictEqual(result.stats.mode, 'catalog');
      assert.ok(result.stats.originalBytes > 0);
      assert.ok(result.stats.compressedBytes > 0);
      assert.ok(result.stats.compressedBytes < result.stats.originalBytes);
      assert.ok(result.stats.compressedTokenEstimate > 0);

      // Catalog entries should not have body
      for (const agent of result.agents) {
        assert.strictEqual(agent.body, undefined);
        assert.ok(agent.name);
        assert.ok(agent.description);
      }
    } finally {
      cleanupTempDir(tmpDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('buildAgentCatalog in summary mode includes summaries', async () => {
    const tmpDir = createTempDir('ecc-agent-compress-');
    try {
      writeAgent(tmpDir, 'agent-a', SAMPLE_AGENT);

      const result = buildAgentCatalog(tmpDir, { mode: 'summary' });
      assert.strictEqual(result.agents.length, 1);
      assert.ok(result.agents[0].summary);
      assert.strictEqual(result.agents[0].body, undefined);
    } finally {
      cleanupTempDir(tmpDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('buildAgentCatalog in full mode preserves body', async () => {
    const tmpDir = createTempDir('ecc-agent-compress-');
    try {
      writeAgent(tmpDir, 'agent-a', SAMPLE_AGENT);

      const result = buildAgentCatalog(tmpDir, { mode: 'full' });
      assert.strictEqual(result.agents.length, 1);
      assert.ok(result.agents[0].body.includes('You are a test agent'));
    } finally {
      cleanupTempDir(tmpDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('buildAgentCatalog supports filter function', async () => {
    const tmpDir = createTempDir('ecc-agent-compress-');
    try {
      writeAgent(tmpDir, 'agent-a', SAMPLE_AGENT);
      writeAgent(tmpDir, 'agent-b', MINIMAL_AGENT);

      const result = buildAgentCatalog(tmpDir, {
        mode: 'catalog',
        filter: agent => agent.model === 'haiku',
      });
      assert.strictEqual(result.agents.length, 1);
      assert.strictEqual(result.agents[0].name, 'minimal');
    } finally {
      cleanupTempDir(tmpDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('lazyLoadAgent loads a single agent by name', async () => {
    const tmpDir = createTempDir('ecc-agent-compress-');
    try {
      writeAgent(tmpDir, 'test-agent', SAMPLE_AGENT);
      writeAgent(tmpDir, 'other', MINIMAL_AGENT);

      const agent = lazyLoadAgent(tmpDir, 'test-agent');
      assert.ok(agent);
      assert.strictEqual(agent.name, 'test-agent');
      assert.ok(agent.body.includes('You are a test agent'));
    } finally {
      cleanupTempDir(tmpDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('lazyLoadAgent returns null for non-existent agent', async () => {
    const tmpDir = createTempDir('ecc-agent-compress-');
    try {
      const agent = lazyLoadAgent(tmpDir, 'nonexistent');
      assert.strictEqual(agent, null);
    } finally {
      cleanupTempDir(tmpDir);
    }
  })) passed += 1; else failed += 1;

  if (await test('buildAgentCatalog works with real agents directory', async () => {
    const agentsDir = path.join(__dirname, '..', '..', 'agents');
    if (!fs.existsSync(agentsDir)) {
      // Skip if agents dir doesn't exist (shouldn't happen in this repo)
      return;
    }

    const result = buildAgentCatalog(agentsDir, { mode: 'catalog' });
    assert.ok(result.agents.length > 0, 'Should find at least one agent');
    assert.ok(result.stats.originalBytes > 0);
    assert.ok(result.stats.compressedBytes < result.stats.originalBytes,
      'Catalog mode should be smaller than full agent files');
  })) passed += 1; else failed += 1;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
