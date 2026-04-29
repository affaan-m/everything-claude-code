'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const releaseDir = path.join(repoRoot, 'docs', 'releases', '2.0.0-rc.1');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    failed++;
  }
}

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function walkMarkdown(rootPath) {
  const files = [];
  for (const entry of fs.readdirSync(rootPath, { withFileTypes: true })) {
    const nextPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdown(nextPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(nextPath);
    }
  }
  return files;
}

console.log('\n=== Testing ECC 2.0 release surface ===\n');

const expectedReleaseFiles = [
  'release-notes.md',
  'x-thread.md',
  'linkedin-post.md',
  'article-outline.md',
  'launch-checklist.md',
  'telegram-handoff.md',
  'demo-prompts.md',
];

test('release candidate directory includes the public launch pack', () => {
  for (const fileName of expectedReleaseFiles) {
    assert.ok(fs.existsSync(path.join(releaseDir, fileName)), `Missing ${fileName}`);
  }
});

test('README links to Hermes setup and rc.1 release notes', () => {
  const readme = read('README.md');
  assert.ok(readme.includes('docs/HERMES-SETUP.md'), 'README must link to Hermes setup');
  assert.ok(readme.includes('docs/releases/2.0.0-rc.1/release-notes.md'), 'README must link to rc.1 release notes');
});

test('cross-harness architecture doc exists and names core harnesses', () => {
  const source = read('docs/architecture/cross-harness.md');
  for (const harness of ['Claude Code', 'Codex', 'OpenCode', 'Cursor', 'Gemini', 'Hermes']) {
    assert.ok(source.includes(harness), `Expected cross-harness doc to mention ${harness}`);
  }
});

test('Hermes import skill exists and declares sanitization rules', () => {
  const source = read('skills/hermes-imports/SKILL.md');
  assert.ok(source.includes('name: hermes-imports'));
  assert.ok(source.includes('Sanitization Checklist'));
  assert.ok(source.includes('Do not ship raw workspace exports'));
});

test('release docs do not contain private local workspace paths', () => {
  const offenders = [];
  for (const filePath of walkMarkdown(releaseDir)) {
    const source = fs.readFileSync(filePath, 'utf8');
    if (source.includes('/Users/') || source.includes('/.hermes/')) {
      offenders.push(path.relative(repoRoot, filePath));
    }
  }
  assert.deepStrictEqual(offenders, []);
});

test('release docs do not contain unresolved public-link placeholders', () => {
  const offenders = [];
  for (const filePath of walkMarkdown(releaseDir)) {
    const source = fs.readFileSync(filePath, 'utf8');
    if (source.includes('<repo-link>')) {
      offenders.push(path.relative(repoRoot, filePath));
    }
  }
  assert.deepStrictEqual(offenders, []);
});

test('Hermes setup uses release-candidate wording for the rc.1 surface', () => {
  const source = read('docs/HERMES-SETUP.md');
  assert.ok(source.includes('Public Release Candidate Scope'));
  assert.ok(source.includes('ECC v2.0.0-rc.1 documents the Hermes surface'));
  assert.ok(!source.includes('Public Preview Scope'));
});

test('release docs preserve the ECC/Hermes boundary', () => {
  const releaseNotes = read('docs/releases/2.0.0-rc.1/release-notes.md');
  assert.ok(releaseNotes.includes('ECC is the reusable substrate'));
  assert.ok(releaseNotes.includes('Hermes as the operator shell'));
});

if (failed > 0) {
  console.log(`\nFailed: ${failed}`);
  process.exit(1);
}

console.log(`\nPassed: ${passed}`);
