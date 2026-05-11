#!/usr/bin/env node
/**
 * Prevent shipping user-specific absolute paths in public docs/skills/commands.
 *
 * Catches generic `/Users/<name>` (macOS) and `C:\Users\<name>` (Windows) paths,
 * allowing a small set of obvious placeholder usernames that appear in templates
 * and examples. Forensic incident reports under `docs/fixes/` are exempt since
 * they intentionally document a specific reporter's machine state.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const TARGETS = [
  'README.md',
  'skills',
  'commands',
  'agents',
  'docs',
  '.opencode/commands',
];

// Repo-relative directory prefixes whose files legitimately reference specific
// contributor machine paths (forensic fix reports, incident addenda, etc.).
const EXEMPT_PREFIXES = [
  'docs/fixes/',
];

// Placeholder usernames in templates/examples. Matched case-insensitively.
const PLACEHOLDER_USERNAMES = new Set([
  'example',
  'me',
  'user',
  'username',
  'you',
  'yourname',
  'yourusername',
  'your-username',
]);

const POSIX_USER_RE = /\/Users\/([a-zA-Z][a-zA-Z0-9._-]*)/g;
const WIN_USER_RE = /C:\\Users\\([a-zA-Z][a-zA-Z0-9._-]*)/gi;

function isExempt(absolutePath) {
  const rel = path.relative(ROOT, absolutePath).split(path.sep).join('/');
  return EXEMPT_PREFIXES.some((prefix) => rel.startsWith(prefix));
}

function findLeaks(content) {
  const leaks = [];
  for (const re of [POSIX_USER_RE, WIN_USER_RE]) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(content)) !== null) {
      if (!PLACEHOLDER_USERNAMES.has(match[1].toLowerCase())) {
        leaks.push(match[0]);
      }
    }
  }
  return leaks;
}

function collectFiles(targetPath, out) {
  if (!fs.existsSync(targetPath)) return;
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    out.push(targetPath);
    return;
  }

  for (const entry of fs.readdirSync(targetPath)) {
    if (entry === 'node_modules' || entry === '.git') continue;
    collectFiles(path.join(targetPath, entry), out);
  }
}

const files = [];
for (const target of TARGETS) {
  collectFiles(path.join(ROOT, target), files);
}

let failures = 0;
for (const file of files) {
  if (!/\.(md|json|js|ts|sh|toml|yml|yaml)$/i.test(file)) continue;
  if (isExempt(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const leaks = findLeaks(content);
  for (const leak of leaks) {
    console.error(`ERROR: personal path "${leak}" detected in ${path.relative(ROOT, file)}`);
    failures += 1;
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('Validated: no personal absolute paths in shipped docs/skills/commands');
