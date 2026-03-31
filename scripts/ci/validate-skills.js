#!/usr/bin/env node
/**
 * Validate curated skill directories (skills/ in repo).
 * Scope: curated only. Learned/imported/evolved roots are out of scope.
 * If skills/ does not exist, exit 0 (no curated skills to validate).
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '../../skills');

function validateSkills() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.log('No curated skills directory (skills/), skipping');
    process.exit(0);
  }

  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
  let hasErrors = false;
  let validCount = 0;

  for (const dir of dirs) {
    const skillMd = path.join(SKILLS_DIR, dir, 'SKILL.md');
    if (!fs.existsSync(skillMd)) {
      console.error(`ERROR: ${dir}/ - Missing SKILL.md`);
      hasErrors = true;
      continue;
    }

    let content;
    try {
      content = fs.readFileSync(skillMd, 'utf-8');
    } catch (err) {
      console.error(`ERROR: ${dir}/SKILL.md - ${err.message}`);
      hasErrors = true;
      continue;
    }
    if (content.trim().length === 0) {
      console.error(`ERROR: ${dir}/SKILL.md - Empty file`);
      hasErrors = true;
      continue;
    }

    validCount++;
  }

  if (hasErrors) {
    process.exit(1);
  }

  console.log(`Validated ${validCount} skill directories`);
}

validateSkills();
