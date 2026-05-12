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
  'quickstart.md',
  'publication-readiness.md',
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

test('business launch copy stays aligned with the rc.1 public surface', () => {
  const source = read('docs/business/social-launch-copy.md');
  assert.ok(source.includes('ECC v2.0.0-rc.1'), 'business launch copy should use the rc.1 release');
  assert.ok(
    source.includes('https://github.com/affaan-m/everything-claude-code'),
    'business launch copy should include the public repo URL'
  );
  assert.ok(
    source.includes(
      'https://github.com/affaan-m/everything-claude-code/blob/main/docs/releases/2.0.0-rc.1/release-notes.md'
    ),
    'business launch copy should link to the rc.1 release notes'
  );
  assert.ok(!source.includes('<repo-link>'), 'business launch copy should not contain repo placeholders');
  assert.ok(!source.includes('v1.8.0'), 'business launch copy should not stay pinned to v1.8.0');
});

test('Hermes setup uses release-candidate wording for the rc.1 surface', () => {
  const source = read('docs/HERMES-SETUP.md');
  assert.ok(source.includes('Public Release Candidate Scope'));
  assert.ok(source.includes('ECC v2.0.0-rc.1 documents the Hermes surface'));
  assert.ok(!source.includes('Public Preview Scope'));
});

test('Hermes setup cross-links adjacent migration and architecture docs', () => {
  const source = read('docs/HERMES-SETUP.md');
  assert.ok(source.includes('HERMES-OPENCLAW-MIGRATION.md'));
  assert.ok(source.includes('architecture/cross-harness.md'));
  assert.ok(source.includes('Plan and scaffold migration artifacts'));
  assert.ok(!source.includes('0.5. Generate and review artifacts with `ecc migrate plan` /'));
});

test('release docs preserve the ECC/Hermes boundary', () => {
  const releaseNotes = read('docs/releases/2.0.0-rc.1/release-notes.md');
  assert.ok(releaseNotes.includes('ECC is the reusable substrate'));
  assert.ok(releaseNotes.includes('Hermes as the operator shell'));
});

test('release notes route new contributors through the rc.1 quickstart', () => {
  const releaseNotes = read('docs/releases/2.0.0-rc.1/release-notes.md');
  assert.ok(releaseNotes.includes('[rc.1 quickstart](quickstart.md)'));
});

test('rc.1 quickstart gives a clone-to-cross-harness path', () => {
  const quickstart = read('docs/releases/2.0.0-rc.1/quickstart.md');
  for (const heading of ['Clone', 'Install', 'Verify', 'First Skill', 'Switch Harness']) {
    assert.ok(quickstart.includes(`## ${heading}`), `Missing ${heading} section`);
  }
  assert.ok(quickstart.includes('node tests/run-all.js'));
  assert.ok(quickstart.includes('skills/hermes-imports/SKILL.md'));
});

test('cross-harness doc includes a worked skill portability example', () => {
  const source = read('docs/architecture/cross-harness.md');
  assert.ok(source.includes('## Worked Example'));
  assert.ok(source.includes('same skill source'));
  for (const harness of ['Claude Code', 'Codex', 'OpenCode']) {
    assert.ok(source.includes(harness), `Expected worked example to mention ${harness}`);
  }
});

test('release docs use release-candidate wording consistently', () => {
  const releaseNotes = read('docs/releases/2.0.0-rc.1/release-notes.md');
  assert.ok(releaseNotes.includes('## Release Candidate Boundaries'));
  assert.ok(!releaseNotes.includes('## Preview Boundaries'));
});

test('launch checklist records the ecc2 alpha version policy', () => {
  const cargoToml = read('ecc2/Cargo.toml');
  const launchChecklist = read('docs/releases/2.0.0-rc.1/launch-checklist.md');
  assert.ok(cargoToml.includes('version = "0.1.0"'));
  assert.ok(launchChecklist.includes('`ecc2/Cargo.toml` stays at `0.1.0`'));
  assert.ok(!launchChecklist.includes('confirm whether `ecc2/Cargo.toml` moves'));
});

test('publication readiness checklist gates public release actions on evidence', () => {
  const source = read('docs/releases/2.0.0-rc.1/publication-readiness.md');

  for (const section of [
    '## Release Identity Matrix',
    '## Publication Gates',
    '## Required Command Evidence',
    '## Do Not Publish If',
    '## Announcement Order',
  ]) {
    assert.ok(source.includes(section), `publication readiness missing ${section}`);
  }

  for (const field of [
    'Fresh check',
    'Evidence artifact',
    'Owner',
    'Status',
    'Blocker field',
    'Recorded output',
  ]) {
    assert.ok(source.includes(field), `publication readiness missing ${field}`);
  }

  for (const surface of [
    'GitHub release',
    'npm package',
    'Claude plugin',
    'Codex plugin',
    'OpenCode package',
    'ECC Tools billing reference',
    'Announcement copy',
  ]) {
    assert.ok(source.includes(surface), `publication readiness missing ${surface}`);
  }
});

test('release checklist and roadmap link to publication readiness evidence gate', () => {
  const launchChecklist = read('docs/releases/2.0.0-rc.1/launch-checklist.md');
  const roadmap = read('docs/ECC-2.0-GA-ROADMAP.md');

  assert.ok(launchChecklist.includes('publication-readiness.md'));
  assert.ok(launchChecklist.includes('fresh evidence'));
  assert.ok(roadmap.includes('docs/releases/2.0.0-rc.1/publication-readiness.md'));
  assert.ok(roadmap.includes('npm dist-tag'));
});

test('localized changelogs include rc.1 and 1.10.0 release entries', () => {
  for (const relativePath of ['docs/tr/CHANGELOG.md', 'docs/zh-CN/CHANGELOG.md']) {
    const source = read(relativePath);
    assert.ok(source.includes('## 2.0.0-rc.1 - 2026-04-28'), `${relativePath} missing rc.1 entry`);
    assert.ok(source.includes('## 1.10.0 - 2026-04-05'), `${relativePath} missing 1.10.0 entry`);
  }
});

if (failed > 0) {
  console.log(`\nFailed: ${failed}`);
  process.exit(1);
}

console.log(`\nPassed: ${passed}`);
