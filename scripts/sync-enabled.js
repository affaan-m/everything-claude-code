#!/usr/bin/env node
/**
 * sync-enabled.js — Rebuild the enabled/ folder as symlinks based on enabled.json.
 *
 * Usage:
 *   node scripts/sync-enabled.js [--dry-run]
 *
 * After running, point Claude at the enabled/ folder:
 *   claude --plugin-dir /path/to/my-everything-claude-code/enabled
 *
 * The enabled/ folder is gitignored. Re-run this script whenever you edit enabled.json.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const dryRun = process.argv.includes('--dry-run');
const REPO_ROOT = path.resolve(__dirname, '..');
const ENABLED_DIR = path.join(REPO_ROOT, 'enabled');

// ---------------------------------------------------------------------------
// Load enabled.json
// ---------------------------------------------------------------------------
const enabledPath = path.join(REPO_ROOT, 'enabled.json');
if (!fs.existsSync(enabledPath)) {
  console.error(`Error: enabled.json not found at ${enabledPath}`);
  process.exit(1);
}
const enabled = JSON.parse(fs.readFileSync(enabledPath, 'utf8'));

console.log(`Syncing enabled/ from enabled.json${dryRun ? ' (dry-run)' : ''}\n`);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureDir(dir) {
  if (!dryRun) fs.mkdirSync(dir, { recursive: true });
}

function removeDir(dir) {
  if (!fs.existsSync(dir)) return;
  if (dryRun) {
    console.log(`  [dry-run] rm -rf ${dir}`);
    return;
  }
  fs.rmSync(dir, { recursive: true, force: true });
}

function symlink(target, linkPath) {
  // target is relative to the directory containing the link
  const linkDir = path.dirname(linkPath);
  const relTarget = path.relative(linkDir, target);

  if (dryRun) {
    console.log(`  [dry-run] ln -s ${relTarget} -> ${linkPath}`);
    return;
  }

  // Remove stale link/file if present
  try {
    fs.lstatSync(linkPath); // throws if nothing exists
    fs.rmSync(linkPath, { force: true });
  } catch {
    // nothing there, nothing to remove
  }

  fs.symlinkSync(relTarget, linkPath);
}

function validateName(name, pattern, label) {
  if (!pattern.test(name)) {
    console.warn(`  Warning: invalid ${label} '${name}', skipping.`);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Wipe and rebuild enabled/ subdirs
// ---------------------------------------------------------------------------

for (const subdir of ['skills', 'agents', 'commands']) {
  removeDir(path.join(ENABLED_DIR, subdir));
}
ensureDir(ENABLED_DIR);

// ---------------------------------------------------------------------------
// Skills — each is a subdirectory
// ---------------------------------------------------------------------------
const skillNames = enabled.skills || [];
if (skillNames.length) {
  console.log(`Skills (${skillNames.length}):`);
  ensureDir(path.join(ENABLED_DIR, 'skills'));
  for (const name of skillNames) {
    if (!validateName(name, /^[a-zA-Z0-9_-]+$/, 'skill')) continue;
    const src = path.join(REPO_ROOT, 'skills', name);
    if (!fs.existsSync(src)) {
      console.warn(`  Warning: skills/${name} not found, skipping.`);
      continue;
    }
    console.log(`  + ${name}`);
    symlink(src, path.join(ENABLED_DIR, 'skills', name));
  }
}

// ---------------------------------------------------------------------------
// Agents — individual .md files
// ---------------------------------------------------------------------------
const agentFiles = enabled.agents || [];
if (agentFiles.length) {
  console.log(`\nAgents (${agentFiles.length}):`);
  ensureDir(path.join(ENABLED_DIR, 'agents'));
  for (const file of agentFiles) {
    if (!validateName(file, /^[a-zA-Z0-9_-]+\.md$/, 'agent')) continue;
    const src = path.join(REPO_ROOT, 'agents', file);
    if (!fs.existsSync(src)) {
      console.warn(`  Warning: agents/${file} not found, skipping.`);
      continue;
    }
    console.log(`  + ${file}`);
    symlink(src, path.join(ENABLED_DIR, 'agents', file));
  }
}

// ---------------------------------------------------------------------------
// Commands — individual .md files
// ---------------------------------------------------------------------------
const commandFiles = enabled.commands || [];
if (commandFiles.length) {
  console.log(`\nCommands (${commandFiles.length}):`);
  ensureDir(path.join(ENABLED_DIR, 'commands'));
  for (const file of commandFiles) {
    if (!validateName(file, /^[a-zA-Z0-9_-]+\.md$/, 'command')) continue;
    const src = path.join(REPO_ROOT, 'commands', file);
    if (!fs.existsSync(src)) {
      console.warn(`  Warning: commands/${file} not found, skipping.`);
      continue;
    }
    console.log(`  + ${file}`);
    symlink(src, path.join(ENABLED_DIR, 'commands', file));
  }
}

console.log('\nDone. Use:');
console.log(`  claude --plugin-dir ${ENABLED_DIR}`);
