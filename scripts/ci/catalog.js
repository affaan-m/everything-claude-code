#!/usr/bin/env node
/**
 * Catalog agents, commands, and skills from the repo.
 * Outputs JSON with counts and lists for CI/docs sync.
 *
 * Usage: node scripts/ci/catalog.js [--json|--md]
 * Default: --json to stdout
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const AGENTS_DIR = path.join(ROOT, 'agents');
const COMMANDS_DIR = path.join(ROOT, 'commands');
const SKILLS_DIR = path.join(ROOT, 'skills');

function listAgents() {
  if (!fs.existsSync(AGENTS_DIR)) return [];
  try {
    return fs.readdirSync(AGENTS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => f.slice(0, -3))
      .sort();
  } catch (error) {
    throw new Error(`Failed to read agents directory (${AGENTS_DIR}): ${error.message}`);
  }
}

function listCommands() {
  if (!fs.existsSync(COMMANDS_DIR)) return [];
  try {
    return fs.readdirSync(COMMANDS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => f.slice(0, -3))
      .sort();
  } catch (error) {
    throw new Error(`Failed to read commands directory (${COMMANDS_DIR}): ${error.message}`);
  }
}

function listSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  try {
    const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
    return entries
      .filter(e => e.isDirectory() && fs.existsSync(path.join(SKILLS_DIR, e.name, 'SKILL.md')))
      .map(e => e.name)
      .sort();
  } catch (error) {
    throw new Error(`Failed to read skills directory (${SKILLS_DIR}): ${error.message}`);
  }
}

function run() {
  const agents = listAgents();
  const commands = listCommands();
  const skills = listSkills();

  const catalog = {
    agents: { count: agents.length, list: agents },
    commands: { count: commands.length, list: commands },
    skills: { count: skills.length, list: skills }
  };

  const format = process.argv[2] === '--md' ? 'md' : 'json';
  if (format === 'md') {
    console.log('# ECC Catalog (generated)\n');
    console.log(`- **Agents:** ${catalog.agents.count}`);
    console.log(`- **Commands:** ${catalog.commands.count}`);
    console.log(`- **Skills:** ${catalog.skills.count}\n`);
    console.log('## Agents\n');
    catalog.agents.list.forEach(a => { console.log(`- ${a}`); });
    console.log('\n## Commands\n');
    catalog.commands.list.forEach(c => { console.log(`- ${c}`); });
    console.log('\n## Skills\n');
    catalog.skills.list.forEach(s => { console.log(`- ${s}`); });
  } else {
    console.log(JSON.stringify(catalog, null, 2));
  }
}

run();
