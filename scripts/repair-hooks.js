#!/usr/bin/env node
/**
 * Repair hook paths in an existing ECC installation.
 *
 * Replaces literal `${CLAUDE_PLUGIN_ROOT}` placeholders in ~/.claude/settings.json
 * with the actual resolved ECC root path. This fixes hook failures when
 * CLAUDE_PLUGIN_ROOT is unset at runtime.
 *
 * Usage:
 *   node ~/.claude/scripts/repair-hooks.js [--dry-run] [--settings <path>]
 *
 * Options:
 *   --dry-run          Show what would change without writing
 *   --settings <path>  Path to settings.json (default: ~/.claude/settings.json)
 *
 * Fixes: https://github.com/affaan-m/everything-claude-code/issues/547
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { resolveEccRoot } = require('./lib/resolve-ecc-root');

const PLACEHOLDER = '${CLAUDE_PLUGIN_ROOT}';

function parseArgs(argv) {
  const args = { dryRun: false, settingsPath: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--dry-run') {
      args.dryRun = true;
    } else if (argv[i] === '--settings' && argv[i + 1]) {
      args.settingsPath = argv[++i];
    }
  }
  return args;
}

function resolveValue(value, root, escapedRoot) {
  if (typeof value !== 'string' || !value.includes(PLACEHOLDER)) {
    return { value, changed: false };
  }
  const replacement = process.platform === 'win32' ? escapedRoot : root;
  const resolved = value.split(PLACEHOLDER).join(replacement);
  return { value: resolved, changed: true };
}

function repairHooks(hooks, root) {
  if (!hooks || typeof hooks !== 'object' || Array.isArray(hooks)) {
    return { hooks, count: 0 };
  }

  const escapedRoot = root.replace(/\\/g, '\\\\');
  let count = 0;
  const result = {};

  for (const [eventName, entries] of Object.entries(hooks)) {
    if (!Array.isArray(entries)) {
      result[eventName] = entries;
      continue;
    }
    result[eventName] = entries.map(entry => {
      if (!entry || typeof entry !== 'object' || !Array.isArray(entry.hooks)) {
        return entry;
      }
      const repairedHooks = entry.hooks.map(hook => {
        if (!hook || typeof hook !== 'object' || typeof hook.command !== 'string') {
          return hook;
        }
        const { value: command, changed } = resolveValue(hook.command, root, escapedRoot);
        if (changed) count++;
        return changed ? { ...hook, command } : hook;
      });
      return { ...entry, hooks: repairedHooks };
    });
  }

  return { hooks: result, count };
}

function main() {
  const args = parseArgs(process.argv);

  const settingsPath = args.settingsPath
    || path.join(os.homedir(), '.claude', 'settings.json');

  if (!fs.existsSync(settingsPath)) {
    console.error(`[repair-hooks] settings.json not found: ${settingsPath}`);
    process.exit(1);
  }

  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (err) {
    console.error(`[repair-hooks] Failed to parse settings.json: ${err.message}`);
    process.exit(1);
  }

  if (!settings.hooks || typeof settings.hooks !== 'object') {
    console.log('[repair-hooks] No hooks found in settings.json — nothing to repair.');
    process.exit(0);
  }

  const root = resolveEccRoot();
  console.log(`[repair-hooks] Resolved ECC root: ${root}`);

  const { hooks: repairedHooks, count } = repairHooks(settings.hooks, root);

  if (count === 0) {
    console.log('[repair-hooks] No ${CLAUDE_PLUGIN_ROOT} placeholders found — already up to date.');
    process.exit(0);
  }

  console.log(`[repair-hooks] Found ${count} command(s) with \${CLAUDE_PLUGIN_ROOT} placeholder.`);

  if (args.dryRun) {
    console.log('[repair-hooks] Dry run — no changes written.');
    console.log('[repair-hooks] Run without --dry-run to apply.');
    process.exit(0);
  }

  const repairedSettings = { ...settings, hooks: repairedHooks };
  fs.writeFileSync(settingsPath, JSON.stringify(repairedSettings, null, 2) + '\n', 'utf8');
  console.log(`[repair-hooks] Repaired ${count} hook command(s) in ${settingsPath}`);
  console.log('[repair-hooks] Done. Restart Claude Code for changes to take effect.');
}

main();
