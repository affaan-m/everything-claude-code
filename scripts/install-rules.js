#!/usr/bin/env node
/**
 * install-rules.js
 *
 * Copies rule files from each plugin's rules/ directory into ~/.claude/rules/.
 * Only plugins listed in .claude-plugin/marketplace.json are processed.
 *
 * Usage:
 *   node scripts/install-rules.js [--dry-run] [--plugin <name>] [--help]
 *
 * Options:
 *   --dry-run        Show what would be copied without writing files
 *   --plugin <name>  Install rules for a specific plugin only
 *   --help           Show this help text
 *
 * Destination layout:
 *   ~/.claude/rules/<subdir>/<filename>.md
 *
 * where <subdir>/<filename> mirrors the path under plugins/<name>/rules/.
 * README.md files are skipped.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const MARKETPLACE_PATH = path.join(REPO_ROOT, '.claude-plugin', 'marketplace.json');
const DEST_ROOT = path.join(os.homedir(), '.claude', 'rules');

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(fs.readFileSync(__filename, 'utf8').match(/\/\*\*([\s\S]*?)\*\//)[0].replace(/^\s*\* ?/gm, ''));
  process.exit(0);
}

const dryRun = args.includes('--dry-run');
const pluginFilter = (() => {
  const idx = args.indexOf('--plugin');
  return idx !== -1 ? args[idx + 1] : null;
})();

// ── Helpers ───────────────────────────────────────────────────────────────────

function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, acc);
    } else if (entry.isFile()) {
      acc.push(fullPath);
    }
  }
  return acc;
}

function copyFile(src, dest, isDryRun) {
  if (!isDryRun) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const marketplace = JSON.parse(fs.readFileSync(MARKETPLACE_PATH, 'utf8'));

let plugins = marketplace.plugins;
if (pluginFilter) {
  plugins = plugins.filter(p => p.name === pluginFilter);
  if (plugins.length === 0) {
    console.error(`Error: plugin "${pluginFilter}" not found in marketplace.json`);
    process.exit(1);
  }
}

console.log(`${dryRun ? '[dry-run] ' : ''}Installing rules to ${DEST_ROOT}\n`);

let totalCopied = 0;
let totalSkipped = 0;

for (const plugin of plugins) {
  const rulesDir = path.join(REPO_ROOT, plugin.source, 'rules');
  if (!fs.existsSync(rulesDir)) continue;

  const files = walkFiles(rulesDir).filter(f => {
    const base = path.basename(f);
    return base.endsWith('.md') && base !== 'README.md';
  });

  if (files.length === 0) continue;

  console.log(`  ${plugin.name} (${files.length} rules)`);

  for (const src of files) {
    const rel = path.relative(rulesDir, src);   // e.g. common/coding-style.md
    const dest = path.join(DEST_ROOT, rel);

    const alreadyExists = fs.existsSync(dest);
    const action = alreadyExists ? 'overwrite' : 'copy';

    console.log(`    ${action === 'overwrite' ? '↺' : '+'} ${rel}`);
    copyFile(src, dest, dryRun);

    if (alreadyExists) {
      totalSkipped++;
    } else {
      totalCopied++;
    }
  }
}

console.log();
if (dryRun) {
  console.log(`[dry-run] Would install ${totalCopied + totalSkipped} rule file(s) — no files written.`);
} else {
  console.log(`Done. ${totalCopied} new file(s) copied, ${totalSkipped} file(s) overwritten.`);
}
