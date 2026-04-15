'use strict';

/**
 * Plugin skills validation
 * - Each skill directory under plugins/<name>/skills/ contains a SKILL.md
 * - SKILL.md is non-empty
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const MARKETPLACE_PATH = path.join(REPO_ROOT, '.claude-plugin', 'marketplace.json');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${err.message}`);
    failed++;
  }
}

const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_PATH, 'utf8'));
let totalSkills = 0;

for (const plugin of marketplace.plugins) {
  const sourceDir = path.resolve(REPO_ROOT, plugin.source);
  const skillsDir = path.join(sourceDir, 'skills');

  if (!fs.existsSync(skillsDir)) continue;

  const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);

  for (const skillName of skillDirs) {
    const skillMd = path.join(skillsDir, skillName, 'SKILL.md');

    test(`${plugin.name}/skills/${skillName}: SKILL.md exists`, () => {
      assert.ok(fs.existsSync(skillMd), `Missing SKILL.md`);
    });

    if (!fs.existsSync(skillMd)) continue;

    test(`${plugin.name}/skills/${skillName}: SKILL.md is non-empty`, () => {
      const content = fs.readFileSync(skillMd, 'utf8');
      assert.ok(content.trim().length > 0, 'SKILL.md is empty');
    });

    totalSkills++;
  }
}

console.log(`\nValidated ${totalSkills} skills across ${marketplace.plugins.length} plugins`);
console.log(`Passed: ${passed}, Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
