'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const commandsDir = path.join(repoRoot, 'commands');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS ${name}`);
    passed++;
  } catch (error) {
    console.log(`  FAIL ${name}`);
    console.log(`    Error: ${error.message}`);
    failed++;
  }
}

function getCommandFiles() {
  return fs.readdirSync(commandsDir)
    .filter(fileName => fileName.endsWith('.md'))
    .sort();
}

function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) {
    return null;
  }

  const endIndex = content.indexOf('\n---', 4);
  if (endIndex === -1) {
    return null;
  }

  return content.slice(4, endIndex);
}

console.log('\n=== Testing command frontmatter metadata ===\n');

for (const fileName of getCommandFiles()) {
  test(`${fileName} declares command metadata frontmatter`, () => {
    const content = fs.readFileSync(path.join(commandsDir, fileName), 'utf8');
    const frontmatter = parseFrontmatter(content);

    assert.ok(frontmatter, 'Expected command file to start with YAML frontmatter');
    assert.ok(
      /^description:\s*\S/m.test(frontmatter),
      'Expected command frontmatter to include a non-empty description'
    );
  });
}

if (failed > 0) {
  console.log(`\nFailed: ${failed}`);
  process.exit(1);
}

console.log(`\nPassed: ${passed}`);
