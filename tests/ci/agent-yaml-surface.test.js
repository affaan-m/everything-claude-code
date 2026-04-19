#!/usr/bin/env node
/**
 * Validate agent.yaml exports the legacy command shim surface.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..');
const AGENT_YAML_PATH = path.join(REPO_ROOT, 'agent.yaml');
const COMMANDS_DIR = path.join(REPO_ROOT, 'commands');

function extractTopLevelList(yamlSource, key) {
  const lines = yamlSource.replace(/^\uFEFF/, '').split(/\r?\n/);
  const results = [];
  let collecting = false;

  for (const line of lines) {
    if (!collecting) {
      if (line.trim() === `${key}:`) {
        collecting = true;
      }
      continue;
    }

    if (/^[A-Za-z0-9_-]+:\s*/.test(line)) {
      break;
    }

    const match = line.match(/^\s*-\s+(.+?)\s*$/);
    if (match) {
      results.push(match[1]);
    }
  }

  return results;
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function run() {
  console.log('\n=== Testing agent.yaml export surface ===\n');

  let passed = 0;
  let failed = 0;

  const yamlSource = fs.readFileSync(AGENT_YAML_PATH, 'utf8');
  const declaredCommands = extractTopLevelList(yamlSource, 'commands').sort();
  const actualCommands = fs.readdirSync(COMMANDS_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => path.basename(file, '.md'))
    .sort();

  if (test('agent.yaml declares commands export surface', () => {
    assert.ok(declaredCommands.length > 0, 'Expected non-empty commands list in agent.yaml');
  })) passed++; else failed++;

  if (test('agent.yaml commands stay in sync with commands/ directory', () => {
    assert.deepStrictEqual(declaredCommands, actualCommands);
  })) passed++; else failed++;

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);

  process.exit(failed > 0 ? 1 : 0);
}

run();
